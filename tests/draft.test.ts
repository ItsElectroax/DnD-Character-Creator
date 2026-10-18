import test from "node:test";
import assert from "node:assert/strict";
import { initialCharacter } from "../src/engine/character";
import {
  normalizeDraft,
  loadDraft,
  getRawDraftRecovery,
  DRAFT_KEY,
  RECOVERY_KEY,
  RAW_RECOVERY_KEY,
  CHARACTER_LIBRARY_KEY,
  LIBRARY_RAW_RECOVERY_KEY,
  loadCharacterLibrary,
  saveCharacterLibrary,
  resumeCharacterLibrary,
  createLibraryCharacter,
  updateLibraryCharacter,
  openLibraryCharacter,
  deleteLibraryCharacter,
  getRawLibraryRecovery,
  hasCharacterContent,
  type CharacterLibrary,
} from "../src/storage/drafts";

test("v1 migration preserves decisions, text and attack modes", () => {
  const original = {
    ...initialCharacter(),
    version: 1,
    identity: { name: "Štef Đuro" },
    attacks: [
      {
        id: "a",
        name: "Spear",
        attackBonus: "",
        damage: "",
        range: "",
        properties: "",
        ability: "",
        proficient: true,
        source: "inventory",
        mode: "thrown",
      },
    ],
    featOptions: { "Fighter:4": ["Wizard"] },
  };
  const migrated = normalizeDraft(original);
  assert.equal(migrated.version, 2);
  assert.equal(migrated.identity.name, "Štef Đuro");
  assert.equal(migrated.identity.allies, "");
  assert.equal(migrated.attacks[0].mode, "thrown");
  assert.deepEqual(migrated.featOptions, original.featOptions);
});
test("invalid imports are rejected and nested records are normalized", () => {
  assert.throws(() => normalizeDraft({ version: 99 }));
  const migrated = normalizeDraft({
    version: 2,
    stage: 200,
    level: -10,
    subclassChoices: { one: "invalid", two: ["Bear", 1] },
    identity: null,
  });
  assert.equal(migrated.stage, 8);
  assert.equal(migrated.level, 1);
  assert.deepEqual(migrated.subclassChoices.two, ["Bear"]);
  assert.equal(migrated.identity.name, "");
});
test("current decision fields survive normalization while invalid replacement map values are removed", () => {
  const c = initialCharacter();
  c.equipmentMethod = "wealth";
  c.startingGold = "150";
  c.skillReplacementChoices = { "Background:Stealth": "Arcana" };
  const normalized = normalizeDraft(JSON.parse(JSON.stringify(c)));
  assert.equal(normalized.equipmentMethod, "wealth");
  assert.equal(normalized.startingGold, "150");
  assert.deepEqual(
    normalized.skillReplacementChoices,
    c.skillReplacementChoices,
  );
  const malformed = normalizeDraft({
    ...c,
    skillReplacementChoices: JSON.parse(
      '{"valid":"Perception","invalid":9,"__proto__":"Athletics","constructor":"History"}',
    ),
  });
  assert.deepEqual(malformed.skillReplacementChoices, { valid: "Perception" });
});
function storage(
  initial: Record<string, string>,
  options: {
    readFailure?: boolean;
    backupFailure?: boolean;
    ignoreBackup?: boolean;
    libraryFailure?: boolean;
    ignoreLibrary?: boolean;
    libraryBackupFailure?: boolean;
  } = {},
) {
  const values = new Map(Object.entries(initial));
  return {
    values,
    getItem(key: string) {
      if (options.readFailure) throw new Error("SecurityError");
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      if (
        (key === RAW_RECOVERY_KEY && options.backupFailure) ||
        (key === CHARACTER_LIBRARY_KEY && options.libraryFailure) ||
        (key === LIBRARY_RAW_RECOVERY_KEY && options.libraryBackupFailure)
      )
        throw new Error("QuotaExceededError");
      if (
        (key === RAW_RECOVERY_KEY && options.ignoreBackup) ||
        (key === CHARACTER_LIBRARY_KEY && options.ignoreLibrary)
      )
        return;
      values.set(key, value);
    },
    removeItem(key: string) {
      values.delete(key);
    },
  };
}
function withStorage(fake: ReturnType<typeof storage>, run: () => void) {
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    value: fake,
    configurable: true,
  });
  try {
    run();
  } finally {
    if (original) Object.defineProperty(globalThis, "localStorage", original);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
}

test("unreadable saved data is quarantined byte for byte without changing ordinary recovery", () => {
  const raw = ' {"version":2,"identity":{"name":"Štef"}\n malformed';
  const previous = '{"version":2,"identity":{"name":"Previous"}}';
  const fake = storage({ [DRAFT_KEY]: raw, [RECOVERY_KEY]: previous });
  withStorage(fake, () => {
    const boot = loadDraft();
    assert.equal(boot.autosaveBlocked, false);
    assert.equal(boot.rawRecoveryAvailable, true);
    assert.match(boot.warning, /exact original data was preserved/);
    assert.equal(fake.values.get(DRAFT_KEY), raw);
    assert.equal(fake.values.get(RAW_RECOVERY_KEY), raw);
    assert.equal(fake.values.get(RECOVERY_KEY), previous);
    assert.equal(getRawDraftRecovery(), raw);
  });
});
test("incompatible versions are preserved rather than overwritten", () => {
  const raw = JSON.stringify({
    version: 99,
    identity: { name: "Do not lose me" },
    extension: { unrecognized: true },
  });
  const fake = storage({ [DRAFT_KEY]: raw });
  withStorage(fake, () => {
    const boot = loadDraft();
    assert.equal(boot.character.identity.name, "");
    assert.equal(boot.autosaveBlocked, false);
    assert.equal(fake.values.get(RAW_RECOVERY_KEY), raw);
    assert.equal(getRawDraftRecovery(), raw);
  });
});
test("v1 source is backed up before migrated state is allowed to autosave", () => {
  const raw = JSON.stringify({
    ...initialCharacter(),
    version: 1,
    identity: { name: "Štefica" },
  });
  const fake = storage({ [DRAFT_KEY]: raw });
  withStorage(fake, () => {
    const boot = loadDraft();
    assert.equal(boot.character.version, 2);
    assert.equal(boot.character.identity.name, "Štefica");
    assert.equal(boot.autosaveBlocked, false);
    assert.match(boot.warning, /was upgraded/);
    assert.equal(fake.values.get(DRAFT_KEY), raw);
    assert.equal(fake.values.get(RAW_RECOVERY_KEY), raw);
  });
});
test("failed quarantine pauses autosave and retains exact original in this session", () => {
  const raw = "{ broken but recoverable";
  const fake = storage({ [DRAFT_KEY]: raw }, { backupFailure: true });
  withStorage(fake, () => {
    const boot = loadDraft();
    assert.equal(boot.autosaveBlocked, true);
    assert.equal(boot.rawRecoveryAvailable, true);
    assert.match(boot.warning, /could not be backed up/);
    assert.match(boot.warning, /only in this session/);
    assert.equal(fake.values.get(DRAFT_KEY), raw);
    assert.equal(fake.values.has(RAW_RECOVERY_KEY), false);
    assert.equal(getRawDraftRecovery(), raw);
  });
});
test("ignored quarantine write cannot authorize overwriting the draft", () => {
  const raw = "not JSON";
  const fake = storage({ [DRAFT_KEY]: raw }, { ignoreBackup: true });
  withStorage(fake, () => {
    const boot = loadDraft();
    assert.equal(boot.autosaveBlocked, true);
    assert.equal(fake.values.get(DRAFT_KEY), raw);
    assert.equal(getRawDraftRecovery(), raw);
  });
});
test("storage read failure pauses autosave without claiming a saved backup", () => {
  const fake = storage({}, { readFailure: true });
  withStorage(fake, () => {
    const boot = loadDraft();
    assert.equal(boot.autosaveBlocked, true);
    assert.match(boot.warning, /could not be read/);
    assert.doesNotMatch(boot.warning, /was preserved/);
    assert.equal(fake.values.size, 0);
  });
});
test("even an empty corrupt storage string is distinguishable from a missing draft", () => {
  const fake = storage({ [DRAFT_KEY]: "" });
  withStorage(fake, () => {
    const boot = loadDraft();
    assert.equal(boot.rawRecoveryAvailable, true);
    assert.equal(getRawDraftRecovery(), "");
    assert.equal(fake.values.get(RAW_RECOVERY_KEY), "");
    assert.match(boot.warning, /could not be read/);
  });
});

test("visited-stage access survives reload after earlier confirmations are invalidated", () => {
  const c = initialCharacter();
  c.stage = 3;
  c.visitedThrough = 8;
  c.confirmed = [0, 1, 2];
  const saved = normalizeDraft(JSON.parse(JSON.stringify(c)));
  assert.equal(saved.visitedThrough, 8);
  assert.deepEqual(saved.confirmed, [0, 1, 2]);
  assert.equal(normalizeDraft({ ...c, visitedThrough: 99 }).visitedThrough, 8);
});

const library = (): CharacterLibrary => ({
  version: 1,
  activeId: null,
  entries: [],
});
const namedCharacter = (name: string) => {
  const c = initialCharacter();
  c.identity.name = name;
  return c;
};

test("library migration keeps meaningful draft and distinct recovery without changing legacy bytes", () => {
  const c = namedCharacter("Štef");
  c.stage = 5;
  c.visitedThrough = 5;
  const prior = namedCharacter("Previous character");
  const raw = "  " + JSON.stringify({ ...c, version: 1 }) + "\n";
  const recovery = JSON.stringify(prior, null, 2);
  const fake = storage({ [DRAFT_KEY]: raw, [RECOVERY_KEY]: recovery });
  withStorage(fake, () => {
    const boot = loadCharacterLibrary();
    assert.equal(boot.autosaveBlocked, false);
    assert.equal(boot.library.entries.length, 2);
    assert.equal(boot.library.entries[0].character.version, 2);
    assert.equal(boot.library.activeId, boot.library.entries[0].id);
    assert.equal(boot.library.entries[0].character.stage, 5);
    assert.equal(
      boot.library.entries[1].character.identity.name,
      "Previous character",
    );
    assert.equal(fake.values.get(DRAFT_KEY), raw);
    assert.equal(fake.values.get(RECOVERY_KEY), recovery);
    assert.deepEqual(loadCharacterLibrary().library, boot.library);
  });
});

test("migration deduplicates equal normalized characters and skips untouched navigation-only drafts", () => {
  const c = namedCharacter("Same");
  const raw = JSON.stringify(c);
  withStorage(
    storage({
      [DRAFT_KEY]: raw,
      [RECOVERY_KEY]: JSON.stringify({ ...c, identity: { ...c.identity } }),
    }),
    () => {
      assert.equal(loadCharacterLibrary().library.entries.length, 1);
    },
  );
  const empty = initialCharacter();
  empty.stage = 3;
  empty.visitedThrough = 4;
  empty.confirmed = [0, 1];
  assert.equal(hasCharacterContent(empty), false);
  const fake = storage({ [DRAFT_KEY]: JSON.stringify(empty) });
  withStorage(fake, () => {
    assert.deepEqual(loadCharacterLibrary().library, library());
    assert.ok(fake.values.has(CHARACTER_LIBRARY_KEY));
  });
});

test("invalid legacy data remains untouched while a distinct valid recovery migrates", () => {
  const raw = "{ not readable";
  const c = namedCharacter("Recover me");
  const fake = storage({ [DRAFT_KEY]: raw, [RECOVERY_KEY]: JSON.stringify(c) });
  withStorage(fake, () => {
    const boot = loadCharacterLibrary();
    assert.equal(boot.library.entries.length, 1);
    assert.equal(boot.library.entries[0].character.identity.name, "Recover me");
    assert.match(boot.warning, /previous draft could not be read/);
    assert.equal(fake.values.get(DRAFT_KEY), raw);
    assert.equal(getRawDraftRecovery(), raw);
    assert.equal(boot.rawRecoveryAvailable, true);
  });
});

test("unreadable legacy recovery is downloadable and a failed backup blocks migration writes", () => {
  const raw = " { incomplete previous recovery";
  withStorage(storage({ [RECOVERY_KEY]: raw }), () => {
    const boot = loadCharacterLibrary();
    assert.equal(boot.rawRecoveryAvailable, true);
    assert.equal(getRawDraftRecovery(), raw);
    assert.equal(boot.autosaveBlocked, false);
  });
  const fake = storage(
    {
      [DRAFT_KEY]: JSON.stringify(namedCharacter("Still in memory")),
      [RECOVERY_KEY]: raw,
    },
    { backupFailure: true },
  );
  withStorage(fake, () => {
    const boot = loadCharacterLibrary();
    assert.equal(boot.library.entries.length, 1);
    assert.equal(boot.autosaveBlocked, true);
    assert.equal(fake.values.has(CHARACTER_LIBRARY_KEY), false);
    assert.equal(fake.values.get(RECOVERY_KEY), raw);
    assert.equal(getRawDraftRecovery(), raw);
    assert.match(boot.warning, /only in this session/);
  });
});

test("two unreadable legacy sources are downloadable together without changing either original string", () => {
  const draft = "broken draft\n";
  const recovery = "broken previous recovery\t";
  const fake = storage({ [DRAFT_KEY]: draft, [RECOVERY_KEY]: recovery });
  withStorage(fake, () => {
    const boot = loadCharacterLibrary();
    assert.equal(boot.autosaveBlocked, false);
    const original = JSON.parse(getRawDraftRecovery()!);
    assert.deepEqual(original.sources, [
      { key: DRAFT_KEY, raw: draft },
      { key: RECOVERY_KEY, raw: recovery },
    ]);
    assert.equal(fake.values.get(DRAFT_KEY), draft);
    assert.equal(fake.values.get(RECOVERY_KEY), recovery);
  });
});

test("valid empty library is authoritative even when legacy draft and recovery still exist", () => {
  const fake = storage({
    [CHARACTER_LIBRARY_KEY]: JSON.stringify(library()),
    [DRAFT_KEY]: JSON.stringify(namedCharacter("Deleted")),
    [RECOVERY_KEY]: JSON.stringify(namedCharacter("Also deleted")),
  });
  withStorage(fake, () => {
    const boot = loadCharacterLibrary();
    assert.equal(boot.library.entries.length, 0);
    assert.equal(boot.library.activeId, null);
    assert.equal(boot.autosaveBlocked, false);
  });
});

test("same-name characters get stable distinct IDs and failed/cancelled import creates no entry", () => {
  const first = createLibraryCharacter(
    library(),
    namedCharacter("Twin"),
    "2026-10-01T00:00:00.000Z",
  );
  const untouched = structuredClone(first);
  assert.throws(() => normalizeDraft({ version: 99 }));
  assert.deepEqual(first, untouched);
  const second = createLibraryCharacter(
    first,
    namedCharacter("Twin"),
    "2026-10-02T00:00:00.000Z",
  );
  assert.equal(second.entries.length, 2);
  assert.notEqual(second.entries[0].id, second.entries[1].id);
  assert.equal(second.entries[0].id, first.entries[0].id);
  assert.equal(second.activeId, second.entries[1].id);
  assert.equal(first.entries.length, 1);
});

test("switching characters saves current work first and preserves separate timestamps and stages", () => {
  const first = createLibraryCharacter(
    library(),
    namedCharacter("A"),
    "2026-10-01T00:00:00.000Z",
  );
  const second = createLibraryCharacter(
    first,
    namedCharacter("B"),
    "2026-10-02T00:00:00.000Z",
  );
  const edited = {
    ...second.entries[1].character,
    stage: 5,
    notes: "B changed",
  };
  const opened = openLibraryCharacter(
    second,
    first.entries[0].id,
    edited,
    "2026-10-03T00:00:00.000Z",
  );
  assert.equal(opened.activeId, first.entries[0].id);
  assert.equal(opened.entries[1].character.notes, "B changed");
  assert.equal(opened.entries[1].character.stage, 5);
  assert.equal(opened.entries[1].updatedAt, "2026-10-03T00:00:00.000Z");
  assert.equal(opened.entries[0].updatedAt, "2026-10-01T00:00:00.000Z");
  assert.equal(opened.entries[0].lastOpenedAt, "2026-10-03T00:00:00.000Z");
  assert.equal(second.entries[1].character.notes, "");
  assert.throws(
    () => openLibraryCharacter(opened, "unknown", edited),
    /no longer exists/,
  );
});

test("unchanged character content does not rewrite edit timestamp on reload or opening", () => {
  const first = createLibraryCharacter(
    library(),
    namedCharacter("A"),
    "2026-10-01T00:00:00.000Z",
  );
  const next = updateLibraryCharacter(
    first,
    first.activeId!,
    structuredClone(first.entries[0].character),
    "2026-10-09T00:00:00.000Z",
  );
  assert.equal(next, first);
  const opened = openLibraryCharacter(
    first,
    first.activeId!,
    first.entries[0].character,
    "2026-10-09T00:00:00.000Z",
  );
  assert.equal(opened.entries[0].updatedAt, first.entries[0].updatedAt);
  assert.equal(opened.entries[0].lastOpenedAt, "2026-10-09T00:00:00.000Z");
});

test("deleting an active entry clears association and cannot silently recreate or reseed it", () => {
  const first = createLibraryCharacter(library(), namedCharacter("Delete me"));
  const removed = deleteLibraryCharacter(first, first.activeId!);
  assert.equal(removed.activeId, null);
  assert.deepEqual(removed.entries, []);
  assert.throws(
    () =>
      updateLibraryCharacter(
        removed,
        first.activeId!,
        first.entries[0].character,
      ),
    /no longer exists/,
  );
  const fake = storage({
    [DRAFT_KEY]: JSON.stringify(first.entries[0].character),
  });
  withStorage(fake, () => {
    assert.equal(saveCharacterLibrary(removed).saved, true);
    assert.deepEqual(loadCharacterLibrary().library, removed);
  });
  const two = createLibraryCharacter(first, namedCharacter("Keep me"));
  const inactiveDeleted = deleteLibraryCharacter(two, first.activeId!);
  assert.equal(inactiveDeleted.activeId, two.activeId);
  assert.equal(inactiveDeleted.entries.length, 1);
});

test("library quota failure preserves current in-memory edits and all previously stored characters", () => {
  const first = createLibraryCharacter(library(), namedCharacter("Original"));
  const original = JSON.stringify(first);
  const fake = storage(
    { [CHARACTER_LIBRARY_KEY]: original },
    { libraryFailure: true },
  );
  withStorage(fake, () => {
    const edited = { ...first.entries[0].character, notes: "unsaved work" };
    const inMemory = updateLibraryCharacter(first, first.activeId!, edited);
    const added = createLibraryCharacter(
      inMemory,
      namedCharacter("New character"),
    );
    const result = saveCharacterLibrary(added);
    assert.equal(result.saved, false);
    assert.match(result.warning, /remains in memory/);
    assert.equal(fake.values.get(CHARACTER_LIBRARY_KEY), original);
    assert.equal(added.entries.length, 2);
    assert.equal(added.entries[0].character.notes, "unsaved work");
    assert.equal(first.entries[0].character.notes, "");
  });
});

test("ignored library writes are detected and failed migration returns migrated characters in memory", () => {
  const fake = storage(
    { [DRAFT_KEY]: JSON.stringify(namedCharacter("Legacy")) },
    { ignoreLibrary: true },
  );
  withStorage(fake, () => {
    const boot = loadCharacterLibrary();
    assert.equal(boot.autosaveBlocked, true);
    assert.equal(boot.library.entries.length, 1);
    assert.equal(fake.values.has(CHARACTER_LIBRARY_KEY), false);
    assert.match(boot.warning, /could not be saved/);
  });
});

test("malformed or incompatible library data is quarantined exactly and automatic saving remains blocked", () => {
  for (const raw of [
    "",
    "{ broken library",
    JSON.stringify({ version: 2, entries: [] }),
    JSON.stringify({ version: 1, activeId: "missing", entries: [] }),
  ]) {
    const fake = storage({
      [CHARACTER_LIBRARY_KEY]: raw,
      [DRAFT_KEY]: JSON.stringify(namedCharacter("Do not resurrect")),
    });
    withStorage(fake, () => {
      const boot = loadCharacterLibrary();
      assert.equal(boot.autosaveBlocked, true);
      assert.equal(boot.library.entries.length, 0);
      assert.equal(fake.values.get(CHARACTER_LIBRARY_KEY), raw);
      assert.equal(fake.values.get(LIBRARY_RAW_RECOVERY_KEY), raw);
      assert.equal(getRawLibraryRecovery(), raw);
      assert.equal(boot.rawRecoveryAvailable, true);
    });
  }
});

test("partial malformed entries never silently discard the rest of a saved library", () => {
  const first = createLibraryCharacter(
    library(),
    namedCharacter("Retain exact original"),
  );
  const raw = JSON.stringify({
    ...first,
    entries: [...first.entries, { id: "bad", character: { version: 99 } }],
  });
  const fake = storage(
    { [CHARACTER_LIBRARY_KEY]: raw },
    { libraryBackupFailure: true },
  );
  withStorage(fake, () => {
    const boot = loadCharacterLibrary();
    assert.equal(boot.autosaveBlocked, true);
    assert.match(boot.warning, /only in this session/);
    assert.equal(fake.values.get(CHARACTER_LIBRARY_KEY), raw);
    assert.equal(getRawLibraryRecovery(), raw);
  });
});

test("library storage access failure neither creates a replacement nor discards legacy sources", () => {
  const fake = storage({ [DRAFT_KEY]: "legacy bytes" }, { readFailure: true });
  withStorage(fake, () => {
    const boot = loadCharacterLibrary();
    assert.equal(boot.autosaveBlocked, true);
    assert.match(boot.warning, /could not be read/);
    assert.equal(fake.values.has(CHARACTER_LIBRARY_KEY), false);
    assert.equal(fake.values.get(DRAFT_KEY), "legacy bytes");
  });
});

test("safe resume merges unseen stored characters after a transient read failure", () => {
  const stored = createLibraryCharacter(
    library(),
    namedCharacter("Stored before access failed"),
  );
  const options = { readFailure: true };
  const fake = storage(
    { [CHARACTER_LIBRARY_KEY]: JSON.stringify(stored) },
    options,
  );
  withStorage(fake, () => {
    const boot = loadCharacterLibrary();
    assert.equal(boot.autosaveBlocked, true);
    const inMemory = createLibraryCharacter(
      boot.library,
      namedCharacter("New work while paused"),
    );
    options.readFailure = false;
    const resumed = resumeCharacterLibrary(inMemory);
    assert.equal(resumed.saved, true);
    assert.equal(resumed.library.entries.length, 2);
    assert.equal(resumed.library.activeId, inMemory.activeId);
    assert.ok(
      resumed.library.entries.some((entry) => entry.id === stored.activeId),
    );
    assert.ok(
      resumed.library.entries.some((entry) => entry.id === inMemory.activeId),
    );
    assert.deepEqual(loadCharacterLibrary().library, resumed.library);
    assert.equal(inMemory.entries.length, 1);
  });
});

test("safe resume preserves current edits for shared IDs and retains every unseen stored entry", () => {
  const first = createLibraryCharacter(
    library(),
    namedCharacter("Open character"),
  );
  const stored = createLibraryCharacter(
    first,
    namedCharacter("Other tab character"),
  );
  const inMemory = updateLibraryCharacter(first, first.activeId!, {
    ...first.entries[0].character,
    notes: "Current unsaved edit",
  });
  const fake = storage({ [CHARACTER_LIBRARY_KEY]: JSON.stringify(stored) });
  withStorage(fake, () => {
    const resumed = resumeCharacterLibrary(inMemory);
    assert.equal(resumed.saved, true);
    assert.equal(resumed.library.entries.length, 2);
    assert.equal(resumed.library.activeId, inMemory.activeId);
    assert.equal(
      resumed.library.entries.find((entry) => entry.id === first.activeId)!
        .character.notes,
      "Current unsaved edit",
    );
  });
});

test("safe resume remains paused while library access is unreadable", () => {
  const stored = createLibraryCharacter(
    library(),
    namedCharacter("Unseen stored character"),
  );
  const original = JSON.stringify(stored);
  const fake = storage(
    { [CHARACTER_LIBRARY_KEY]: original },
    { readFailure: true },
  );
  const inMemory = createLibraryCharacter(
    library(),
    namedCharacter("Keep me in memory"),
  );
  withStorage(fake, () => {
    const resumed = resumeCharacterLibrary(inMemory);
    assert.equal(resumed.saved, false);
    assert.equal(resumed.library, inMemory);
    assert.match(resumed.warning, /still could not be read/);
    assert.equal(fake.values.get(CHARACTER_LIBRARY_KEY), original);
  });
});

test("safe resume permits replacing malformed library only after its exact current bytes were quarantined", () => {
  const raw = "{ exact current malformed library for explicit replacement";
  const fake = storage({ [CHARACTER_LIBRARY_KEY]: raw });
  withStorage(fake, () => {
    const boot = loadCharacterLibrary();
    assert.equal(boot.autosaveBlocked, true);
    assert.equal(getRawLibraryRecovery(), raw);
    const inMemory = createLibraryCharacter(
      boot.library,
      namedCharacter("Explicit replacement"),
    );
    const resumed = resumeCharacterLibrary(inMemory);
    assert.equal(resumed.saved, true);
    assert.equal(
      loadCharacterLibrary().library.entries[0].character.identity.name,
      "Explicit replacement",
    );
    assert.equal(fake.values.get(LIBRARY_RAW_RECOVERY_KEY), raw);
  });
});

test("safe resume blocks a stale quarantine and preserves changed malformed library bytes before retry", () => {
  const previous = "{ old malformed version from previous recovery";
  const latest = "{ changed malformed version never downloaded";
  const fake = storage({ [CHARACTER_LIBRARY_KEY]: previous });
  withStorage(fake, () => {
    loadCharacterLibrary();
    assert.equal(getRawLibraryRecovery(), previous);
    fake.values.set(CHARACTER_LIBRARY_KEY, latest);
    const inMemory = createLibraryCharacter(
      library(),
      namedCharacter("Current work"),
    );
    const blocked = resumeCharacterLibrary(inMemory);
    assert.equal(blocked.saved, false);
    assert.equal(fake.values.get(CHARACTER_LIBRARY_KEY), latest);
    assert.equal(getRawLibraryRecovery(), latest);
    assert.match(blocked.warning, /Download the original recovery data/);
    const afterDownload = resumeCharacterLibrary(blocked.library);
    assert.equal(afterDownload.saved, true);
  });
});

test("safe resume never evicts stored characters when merged library exceeds storage quota", () => {
  const stored = createLibraryCharacter(
    library(),
    namedCharacter("Saved earlier"),
  );
  const original = JSON.stringify(stored);
  const inMemory = createLibraryCharacter(
    library(),
    namedCharacter("Paused work"),
  );
  const fake = storage(
    { [CHARACTER_LIBRARY_KEY]: original },
    { libraryFailure: true },
  );
  withStorage(fake, () => {
    const result = resumeCharacterLibrary(inMemory);
    assert.equal(result.saved, false);
    assert.equal(result.library.entries.length, 2);
    assert.equal(fake.values.get(CHARACTER_LIBRARY_KEY), original);
    assert.match(result.warning, /remains in memory/);
  });
});

test("safe resume also preserves unseen legacy sources when access failed before initial migration", () => {
  const legacy = namedCharacter("Unseen legacy draft");
  const inMemory = createLibraryCharacter(
    library(),
    namedCharacter("Current new character"),
  );
  const fake = storage({ [DRAFT_KEY]: JSON.stringify(legacy) });
  withStorage(fake, () => {
    const result = resumeCharacterLibrary(inMemory);
    assert.equal(result.saved, true);
    assert.equal(result.library.entries.length, 2);
    assert.equal(result.library.activeId, inMemory.activeId);
    assert.ok(
      result.library.entries.some(
        (entry) => entry.character.identity.name === legacy.identity.name,
      ),
    );
    assert.equal(fake.values.get(DRAFT_KEY), JSON.stringify(legacy));
  });
});

test("safe resume requires a recovery download before acknowledging newly discovered malformed legacy data", () => {
  const raw = "{ new legacy corrupt bytes never acknowledged";
  const inMemory = createLibraryCharacter(
    library(),
    namedCharacter("Current new character"),
  );
  const fake = storage({ [RECOVERY_KEY]: raw });
  withStorage(fake, () => {
    const first = resumeCharacterLibrary(inMemory);
    assert.equal(first.saved, false);
    assert.equal(fake.values.has(CHARACTER_LIBRARY_KEY), false);
    assert.equal(getRawDraftRecovery(), raw);
    assert.equal(resumeCharacterLibrary(first.library).saved, true);
    assert.equal(fake.values.get(RECOVERY_KEY), raw);
  });
});
