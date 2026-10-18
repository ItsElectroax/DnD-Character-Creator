import { initialCharacter } from "../engine/character";
import { type Character } from "../engine/types";

export const DRAFT_KEY = "dnd-2014-character-draft-v1";
export const RECOVERY_KEY = "dnd-2014-character-recovery-v2";
/** Exact pre-migration or unreadable storage, kept independently of editable recovery copies. */
export const RAW_RECOVERY_KEY = "dnd-2014-character-raw-recovery-v2";
export const CHARACTER_LIBRARY_KEY = "dnd-2014-character-library-v1";
export const LIBRARY_RAW_RECOVERY_KEY =
  "dnd-2014-character-library-raw-recovery-v1";
let sessionRawRecovery: string | null = null;
let sessionRawLibraryRecovery: string | null = null;
const record = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
const strings = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
const text = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : fallback;
const number = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;
const stringMap = (value: unknown) =>
  Object.fromEntries(
    Object.entries(record(value)).filter(
      ([key, item]) =>
        !["__proto__", "constructor", "prototype"].includes(key) &&
        typeof item === "string",
    ),
  ) as Record<string, string>;
const numberMap = (value: unknown) =>
  Object.fromEntries(
    Object.entries(record(value)).filter(
      ([key, item]) =>
        !["__proto__", "constructor", "prototype"].includes(key) &&
        typeof item === "number" &&
        Number.isFinite(item),
    ),
  ) as Record<string, number>;
const listMap = (value: unknown) =>
  Object.fromEntries(
    Object.entries(record(value))
      .filter(
        ([key]) => !["__proto__", "constructor", "prototype"].includes(key),
      )
      .map(([key, items]) => [key, strings(items)]),
  );

/** Only known fields cross the import boundary. IDs and unresolved choices survive migration. */
export function normalizeDraft(value: unknown): Character {
  const raw = record(value);
  if (raw.version !== 1 && raw.version !== 2)
    throw new Error(
      "Unsupported character file version. Choose a character exported by this app.",
    );
  const base = initialCharacter();
  const result = { ...base, version: 2 } as Character;
  for (const key of [
    "race",
    "subrace",
    "ancestry",
    "raceFeat",
    "background",
    "backgroundVariant",
    "rollNotes",
    "raceFeatAbility",
    "notes",
    "importedInitialClass",
    "xp",
    "hpCurrent",
    "hpTemp",
    "acOverride",
    "spellNotes",
    "equippedArmor",
    "startingGold",
  ] as const)
    result[key] = text(raw[key], base[key]);
  for (const key of [
    "dmPermission",
    "featEnabled",
    "scoresAreFinal",
    "inspiration",
    "equippedShield",
  ] as const)
    result[key] = typeof raw[key] === "boolean" ? raw[key] : base[key];
  for (const key of [
    "classes",
    "skills",
    "languages",
    "tools",
    "equipment",
    "spells",
    "flexBonuses",
    "raceSkills",
    "importWarnings",
  ] as const)
    result[key] = strings(raw[key]);
  result.stage = Math.max(0, Math.min(8, Math.trunc(number(raw.stage, 0))));
  result.level = Math.max(1, Math.min(20, Math.trunc(number(raw.level, 1))));
  result.confirmed = Array.isArray(raw.confirmed)
    ? [
        ...new Set(
          raw.confirmed.filter(
            (n): n is number =>
              Number.isInteger(n) && Number(n) >= 0 && Number(n) < 9,
          ),
        ),
      ]
    : [];
  result.visitedThrough = Math.max(
    result.stage,
    ...result.confirmed,
    Math.max(0, Math.min(8, Math.trunc(number(raw.visitedThrough, 0)))),
  );
  result.classMode = raw.classMode === "multi" ? "multi" : "single";
  result.abilityMethod = ["standard", "point-buy", "manual", "rolled"].includes(
    String(raw.abilityMethod),
  )
    ? (raw.abilityMethod as Character["abilityMethod"])
    : base.abilityMethod;
  result.hpMethod = raw.hpMethod === "rolled" ? "rolled" : "average";
  result.equipmentMethod =
    raw.equipmentMethod === "wealth" ? "wealth" : "package";
  const identity = record(raw.identity);
  result.identity = Object.fromEntries(
    Object.keys(base.identity).map((key) => [key, text(identity[key])]),
  ) as Character["identity"];
  result.baseAbilities = {
    ...base.baseAbilities,
    ...numberMap(raw.baseAbilities),
  };
  result.levelPath = stringMap(raw.levelPath);
  result.importedClassLevels = numberMap(raw.importedClassLevels);
  result.hpRolls = numberMap(raw.hpRolls);
  result.currency = { ...base.currency, ...stringMap(raw.currency) };
  result.subclass = stringMap(raw.subclass);
  result.skillReplacementChoices = stringMap(raw.skillReplacementChoices);
  result.importedRawFields = stringMap(raw.importedRawFields);
  result.sheetOverrides = stringMap(raw.sheetOverrides);
  for (const key of [
    "subclassChoices",
    "featOptions",
    "toolChoices",
    "classSkillChoices",
    "expertiseChoices",
  ] as const)
    result[key] = listMap(raw[key]);
  result.asiChoices = Object.fromEntries(
    Object.entries(record(raw.asiChoices)).flatMap(([key, value]) => {
      const choice = record(value);
      return ["plus2", "split", "feat"].includes(String(choice.mode))
        ? [
            [
              key,
              {
                mode: choice.mode,
                abilities: strings(choice.abilities),
                feat: text(choice.feat),
              },
            ],
          ]
        : [];
    }),
  ) as Character["asiChoices"];
  const entries = (key: string) =>
    Array.isArray(raw[key]) ? (raw[key] as unknown[]).map(record) : [];
  const id = (row: Record<string, unknown>) =>
    text(row.id) || crypto.randomUUID();
  const nullable = (value: unknown) =>
    typeof value === "number" && Number.isFinite(value) ? value : null;
  result.equipmentItems = entries("equipmentItems").map((row) => ({
    id: id(row),
    name: text(row.name),
    quantity: Math.max(0, number(row.quantity, 1)),
    source: text(row.source),
    characterLevel: nullable(row.characterLevel),
    className: text(row.className),
    classLevel: nullable(row.classLevel),
    notes: text(row.notes),
    catalogId: text(row.catalogId) || undefined,
    equipped: row.equipped === true,
    mode: ["one-handed", "two-handed", "thrown", "off-hand"].includes(
      String(row.mode),
    )
      ? (row.mode as "one-handed")
      : undefined,
  }));
  result.attacks = entries("attacks").map((row) => ({
    id: id(row),
    name: text(row.name),
    attackBonus: text(row.attackBonus),
    damage: text(row.damage),
    range: text(row.range),
    properties: text(row.properties),
    ability: text(row.ability),
    proficient: row.proficient === true,
    source: text(row.source),
    mode: ["one-handed", "two-handed", "thrown", "off-hand"].includes(
      String(row.mode),
    )
      ? (row.mode as "one-handed")
      : undefined,
  }));
  const sourceTypes = [
    "Race",
    "Class",
    "Subclass",
    "Background",
    "Feat",
    "Other",
  ];
  result.featureEntries = entries("featureEntries").map((row) => ({
    id: id(row),
    name: text(row.name),
    sourceType: (sourceTypes.includes(String(row.sourceType))
      ? row.sourceType
      : "Other") as Character["featureEntries"][number]["sourceType"],
    sourceName: text(row.sourceName),
    className: text(row.className),
    classLevel: nullable(row.classLevel),
    characterLevel: nullable(row.characterLevel),
    description: text(row.description),
    uses: text(row.uses),
    sourceReference: text(row.sourceReference) || undefined,
  }));
  const kinds = [
    "Armor",
    "Weapon",
    "Tool",
    "Vehicle",
    "Language",
    "Skill",
    "Save",
    "Other",
  ];
  result.otherProficiencies = entries("otherProficiencies").map((row) => ({
    id: id(row),
    name: text(row.name),
    kind: (kinds.includes(String(row.kind))
      ? row.kind
      : "Other") as Character["otherProficiencies"][number]["kind"],
    source: text(row.source),
    className: text(row.className),
    classLevel: nullable(row.classLevel),
    characterLevel: nullable(row.characterLevel),
  }));
  result.spellSelections = entries("spellSelections")
    .filter(
      (row) =>
        typeof row.spellId === "string" &&
        typeof row.source === "string" &&
        [
          "known",
          "prepared",
          "spellbook",
          "innate",
          "ritual",
          "arcanum",
        ].includes(String(row.status)),
    )
    .map((row) => ({
      spellId: text(row.spellId),
      source: text(row.source),
      status: row.status as Character["spellSelections"][number]["status"],
      acquiredLevel:
        typeof row.acquiredLevel === "number" ? row.acquiredLevel : undefined,
    }));
  return result;
}

export type DraftLoadResult = {
  character: Character;
  warning: string;
  autosaveBlocked: boolean;
  rawRecoveryAvailable: boolean;
};

/** Returns the original bytes as a string, deliberately without parsing or repairing them. */
export function getRawDraftRecovery(): string | null {
  if (sessionRawRecovery !== null) return sessionRawRecovery;
  try {
    return localStorage.getItem(RAW_RECOVERY_KEY);
  } catch {
    return null;
  }
}

function preserveRawDraft(raw: string): boolean {
  sessionRawRecovery = raw;
  try {
    localStorage.setItem(RAW_RECOVERY_KEY, raw);
    // A failed or ignored write must not authorize overwriting the original draft.
    return localStorage.getItem(RAW_RECOVERY_KEY) === raw;
  } catch {
    return false;
  }
}

export function loadDraft(): DraftLoadResult {
  let raw: string | null;
  try {
    raw = localStorage.getItem(DRAFT_KEY);
  } catch {
    return {
      character: initialCharacter(),
      warning:
        "Browser storage could not be read. Automatic saving is paused to protect any existing draft. Export the current character as a file to keep your work.",
      autosaveBlocked: true,
      rawRecoveryAvailable: getRawDraftRecovery() !== null,
    };
  }
  if (raw === null)
    return {
      character: initialCharacter(),
      warning: "",
      autosaveBlocked: false,
      rawRecoveryAvailable: getRawDraftRecovery() !== null,
    };
  let parsed: unknown;
  let character: Character;
  try {
    parsed = JSON.parse(raw);
    character = normalizeDraft(parsed);
  } catch {
    const preserved = preserveRawDraft(raw);
    return {
      character: initialCharacter(),
      warning: preserved
        ? "The saved draft could not be read. Its exact original data was preserved. Use Download original recovery data to download it."
        : "The saved draft could not be read and its original data could not be backed up in browser storage. Automatic saving is paused. Use Download original recovery data now; the original is available only in this session.",
      autosaveBlocked: !preserved,
      rawRecoveryAvailable: true,
    };
  }
  if (record(parsed).version !== character.version) {
    const preserved = preserveRawDraft(raw);
    return {
      character,
      warning: preserved
        ? "The saved draft was upgraded. Its original data is available through Download original recovery data."
        : "The saved draft was upgraded in memory, but its original data could not be backed up in browser storage. Automatic saving is paused. Use Download original recovery data before replacing it.",
      autosaveBlocked: !preserved,
      rawRecoveryAvailable: true,
    };
  }
  return {
    character,
    warning: "",
    autosaveBlocked: false,
    rawRecoveryAvailable: getRawDraftRecovery() !== null,
  };
}
export function backupDraft(character: Character) {
  localStorage.setItem(RECOVERY_KEY, JSON.stringify(character));
}
export function recoverDraft(): Character {
  const raw = localStorage.getItem(RECOVERY_KEY);
  if (!raw) throw new Error("There is no recovery copy in this browser yet.");
  return normalizeDraft(JSON.parse(raw));
}

export type SavedCharacterEntry = {
  id: string;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt: string;
  character: Character;
};

export type CharacterLibrary = {
  version: 1;
  activeId: string | null;
  entries: SavedCharacterEntry[];
};

export type CharacterLibraryLoadResult = {
  library: CharacterLibrary;
  warning: string;
  autosaveBlocked: boolean;
  rawRecoveryAvailable: boolean;
};

export type CharacterLibrarySaveResult = {
  saved: boolean;
  warning: string;
};

export type CharacterLibraryResumeResult = CharacterLibrarySaveResult & {
  library: CharacterLibrary;
};

const emptyCharacterLibrary = (): CharacterLibrary => ({
  version: 1,
  activeId: null,
  entries: [],
});

// Object key order is not a character change; legacy drafts can serialize maps
// in a different order. Keep arrays ordered because their order can be meaningful.
function characterSignature(value: unknown): string {
  if (Array.isArray(value))
    return `[${value.map(characterSignature).join(",")}]`;
  if (value !== null && typeof value === "object")
    return `{${Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(
        ([key, item]) => `${JSON.stringify(key)}:${characterSignature(item)}`,
      )
      .join(",")}}`;
  return JSON.stringify(value) ?? "null";
}

/** Navigation alone should not turn an untouched legacy draft into a character. */
export function hasCharacterContent(character: Character): boolean {
  const content = (value: Character) => ({
    ...value,
    stage: 0,
    visitedThrough: 0,
    confirmed: [],
  });
  return (
    characterSignature(content(character)) !==
    characterSignature(content(initialCharacter()))
  );
}

function readCharacterLibrary(value: unknown): CharacterLibrary {
  const raw = record(value);
  if (
    raw.version !== 1 ||
    !Array.isArray(raw.entries) ||
    !(raw.activeId === null || typeof raw.activeId === "string")
  )
    throw new Error("The saved character library has an unsupported format.");
  const ids = new Set<string>();
  const entries = raw.entries.map((value) => {
    const entry = record(value);
    if (
      typeof entry.id !== "string" ||
      !entry.id.trim() ||
      ids.has(entry.id) ||
      ![entry.createdAt, entry.updatedAt, entry.lastOpenedAt].every(
        (time) => typeof time === "string" && Number.isFinite(Date.parse(time)),
      )
    )
      throw new Error("A saved character entry could not be read.");
    ids.add(entry.id);
    return {
      id: entry.id,
      createdAt: entry.createdAt as string,
      updatedAt: entry.updatedAt as string,
      lastOpenedAt: entry.lastOpenedAt as string,
      character: normalizeDraft(entry.character),
    };
  });
  if (raw.activeId !== null && !ids.has(raw.activeId as string))
    throw new Error("The active saved character could not be found.");
  return { version: 1, activeId: raw.activeId as string | null, entries };
}

export function getRawLibraryRecovery(): string | null {
  if (sessionRawLibraryRecovery !== null) return sessionRawLibraryRecovery;
  try {
    return localStorage.getItem(LIBRARY_RAW_RECOVERY_KEY);
  } catch {
    return null;
  }
}

function preserveRawLibrary(raw: string): boolean {
  sessionRawLibraryRecovery = raw;
  try {
    localStorage.setItem(LIBRARY_RAW_RECOVERY_KEY, raw);
    return localStorage.getItem(LIBRARY_RAW_RECOVERY_KEY) === raw;
  } catch {
    return false;
  }
}

/** One atomic write; never evict another character to make storage fit. */
export function saveCharacterLibrary(
  library: CharacterLibrary,
): CharacterLibrarySaveResult {
  try {
    const serialized = JSON.stringify(library);
    localStorage.setItem(CHARACTER_LIBRARY_KEY, serialized);
    if (localStorage.getItem(CHARACTER_LIBRARY_KEY) !== serialized)
      throw new Error("Browser storage did not retain the saved library.");
    return { saved: true, warning: "" };
  } catch {
    return {
      saved: false,
      warning:
        "The character library could not be saved in this browser. Your current work remains in memory. Export it as JSON before closing the page; previously saved characters have not been removed.",
    };
  }
}

/**
 * Resume only after checking storage again. A transient read failure must not
 * turn a temporary empty in-memory library into a replacement for unseen saves.
 * The caller downloads existing recovery data before invoking this helper.
 */
export function resumeCharacterLibrary(
  inMemory: CharacterLibrary,
): CharacterLibraryResumeResult {
  let raw: string | null;
  try {
    raw = localStorage.getItem(CHARACTER_LIBRARY_KEY);
  } catch {
    return {
      library: inMemory,
      saved: false,
      warning:
        "The saved character library still could not be read. Automatic saving remains paused to protect any existing characters. Your current work remains in memory; export it as JSON before closing the page.",
    };
  }

  let merged = inMemory;
  if (raw !== null) {
    let stored: CharacterLibrary;
    try {
      stored = readCharacterLibrary(JSON.parse(raw));
    } catch {
      if (getRawLibraryRecovery() !== raw) {
        const preserved = preserveRawLibrary(raw);
        return {
          library: inMemory,
          saved: false,
          warning: preserved
            ? "Different unreadable library data was found and its exact original data was preserved. Automatic saving remains paused. Download the original recovery data, then try resuming saving again."
            : "Different unreadable library data was found but could not be backed up in browser storage. Automatic saving remains paused. Download the original recovery data now; it is available only in this session, then try resuming saving again.",
        };
      }
      // The exact current bytes were already made available for download. The
      // caller explicitly requested replacing this unreadable library.
      return { library: inMemory, ...saveCharacterLibrary(inMemory) };
    }
    const currentIds = new Set(inMemory.entries.map((entry) => entry.id));
    merged = {
      ...inMemory,
      entries: [
        ...stored.entries.filter((entry) => !currentIds.has(entry.id)),
        ...inMemory.entries,
      ],
    };
  } else {
    // Access may have failed before first-time legacy migration. Reading these
    // sources here prevents a resumed new character from hiding an older draft.
    let sources: { key: string; raw: string | null }[];
    try {
      sources = [DRAFT_KEY, RECOVERY_KEY].map((key) => ({
        key,
        raw: localStorage.getItem(key),
      }));
    } catch {
      return {
        library: inMemory,
        saved: false,
        warning:
          "Previous characters still could not be read. Automatic saving remains paused to protect their original data. Your current work remains in memory; export it as JSON before closing the page.",
      };
    }
    const signatures = new Set(
      inMemory.entries.map((entry) => characterSignature(entry.character)),
    );
    const unreadable: { key: string; raw: string }[] = [];
    const now = new Date().toISOString();
    for (const source of sources) {
      if (source.raw === null) continue;
      try {
        const character = normalizeDraft(JSON.parse(source.raw));
        const signature = characterSignature(character);
        if (!hasCharacterContent(character) || signatures.has(signature))
          continue;
        signatures.add(signature);
        merged = {
          ...createLibraryCharacter(merged, character, now),
          activeId: inMemory.activeId,
        };
      } catch {
        unreadable.push({ key: source.key, raw: source.raw });
      }
    }
    if (unreadable.length) {
      const recovery =
        unreadable.length === 1
          ? unreadable[0].raw
          : JSON.stringify({
              version: 1,
              kind: "legacy-character-storage-recovery",
              sources: unreadable,
            });
      if (getRawDraftRecovery() !== recovery) {
        const preserved = preserveRawDraft(recovery);
        return {
          library: merged,
          saved: false,
          warning: preserved
            ? "Unreadable previous character data was found. Automatic saving remains paused. Download the original recovery data, then try resuming saving again. Valid characters remain in memory."
            : "Unreadable previous character data was found and could not be backed up in browser storage. Automatic saving remains paused. Download the original recovery data now; it is available only in this session, then try resuming saving again. Valid characters remain in memory.",
        };
      }
    }
  }
  return { library: merged, ...saveCharacterLibrary(merged) };
}

/**
 * A present, valid empty library is authoritative. Legacy keys are intentionally
 * retained byte for byte, but are only read when no library key exists.
 */
export function loadCharacterLibrary(): CharacterLibraryLoadResult {
  let raw: string | null;
  try {
    raw = localStorage.getItem(CHARACTER_LIBRARY_KEY);
  } catch {
    return {
      library: emptyCharacterLibrary(),
      warning:
        "The saved character library could not be read. Automatic saving is paused to protect existing characters. Export your current work as JSON before closing the page.",
      autosaveBlocked: true,
      rawRecoveryAvailable: getRawLibraryRecovery() !== null,
    };
  }
  if (raw !== null) {
    try {
      return {
        library: readCharacterLibrary(JSON.parse(raw)),
        warning: "",
        autosaveBlocked: false,
        rawRecoveryAvailable: getRawLibraryRecovery() !== null,
      };
    } catch {
      const preserved = preserveRawLibrary(raw);
      return {
        library: emptyCharacterLibrary(),
        warning: preserved
          ? "The saved character library could not be read. Its exact original data was preserved. Automatic saving is paused so it cannot be replaced accidentally. Download the original recovery data before replacing it."
          : "The saved character library could not be read or backed up in browser storage. Automatic saving is paused. Download the original recovery data now; it is available only in this session.",
        autosaveBlocked: true,
        rawRecoveryAvailable: true,
      };
    }
  }

  let library = emptyCharacterLibrary();
  const warnings: string[] = [];
  let legacyDraft: string | null;
  let legacyRecovery: string | null;
  try {
    legacyDraft = localStorage.getItem(DRAFT_KEY);
    legacyRecovery = localStorage.getItem(RECOVERY_KEY);
  } catch {
    return {
      library,
      warning:
        "Previous characters could not be read. Automatic saving is paused to protect their original data. Export your current work as JSON before closing the page.",
      autosaveBlocked: true,
      rawRecoveryAvailable: getRawDraftRecovery() !== null,
    };
  }
  const now = new Date().toISOString();
  const signatures = new Set<string>();
  const unreadableLegacy: { key: string; raw: string }[] = [];
  for (const [source, legacyRaw] of [
    ["draft", legacyDraft],
    ["recovery character", legacyRecovery],
  ] as const) {
    if (legacyRaw === null) continue;
    try {
      const character = normalizeDraft(JSON.parse(legacyRaw));
      if (!hasCharacterContent(character)) continue;
      const signature = characterSignature(character);
      if (signatures.has(signature)) continue;
      signatures.add(signature);
      const activeId = library.activeId;
      library = createLibraryCharacter(library, character, now);
      // The current draft remains the active character when a distinct recovery
      // character is also migrated. Both original source strings are untouched.
      if (activeId !== null) library = { ...library, activeId };
    } catch {
      unreadableLegacy.push({
        key: source === "draft" ? DRAFT_KEY : RECOVERY_KEY,
        raw: legacyRaw,
      });
      warnings.push(
        `The previous ${source} could not be read. Its original browser data has been kept unchanged.`,
      );
    }
  }
  if (unreadableLegacy.length) {
    // A single source downloads as its exact original bytes. If both sources
    // are unreadable, a recovery envelope retains each exact string separately.
    const recovery =
      unreadableLegacy.length === 1
        ? unreadableLegacy[0].raw
        : JSON.stringify({
            version: 1,
            kind: "legacy-character-storage-recovery",
            sources: unreadableLegacy,
          });
    if (!preserveRawDraft(recovery))
      return {
        library,
        warning: `${warnings.join(" ")} Automatic saving is paused because the original data could not be backed up. Download the original recovery data now; it is available only in this session.`,
        autosaveBlocked: true,
        rawRecoveryAvailable: true,
      };
    warnings.push(
      "The original data is available through Download original recovery data.",
    );
  }
  const saved = saveCharacterLibrary(library);
  if (!saved.saved) warnings.push(saved.warning);
  return {
    library,
    warning: warnings.join(" "),
    autosaveBlocked: !saved.saved,
    rawRecoveryAvailable:
      getRawDraftRecovery() !== null || getRawLibraryRecovery() !== null,
  };
}

/** Caller saves its current character before creating a new/imported entry. */
export function createLibraryCharacter(
  library: CharacterLibrary,
  character: Character,
  now = new Date().toISOString(),
): CharacterLibrary {
  let id = crypto.randomUUID();
  while (library.entries.some((entry) => entry.id === id))
    id = crypto.randomUUID();
  return {
    ...library,
    activeId: id,
    entries: [
      ...library.entries,
      {
        id,
        createdAt: now,
        updatedAt: now,
        lastOpenedAt: now,
        character: normalizeDraft(character),
      },
    ],
  };
}

export function updateLibraryCharacter(
  library: CharacterLibrary,
  id: string,
  character: Character,
  now = new Date().toISOString(),
): CharacterLibrary {
  const existing = library.entries.find((entry) => entry.id === id);
  if (!existing) throw new Error("This saved character no longer exists.");
  const normalized = normalizeDraft(character);
  if (characterSignature(existing.character) === characterSignature(normalized))
    return library;
  return {
    ...library,
    entries: library.entries.map((entry) =>
      entry.id === id
        ? { ...entry, character: normalized, updatedAt: now }
        : entry,
    ),
  };
}

/** Save the currently open character before selecting another stable entry ID. */
export function openLibraryCharacter(
  library: CharacterLibrary,
  id: string,
  currentCharacter?: Character,
  now = new Date().toISOString(),
): CharacterLibrary {
  if (!library.entries.some((entry) => entry.id === id))
    throw new Error("This saved character no longer exists.");
  const saved =
    currentCharacter && library.activeId !== null
      ? updateLibraryCharacter(library, library.activeId, currentCharacter, now)
      : library;
  return {
    ...saved,
    activeId: id,
    entries: saved.entries.map((entry) =>
      entry.id === id ? { ...entry, lastOpenedAt: now } : entry,
    ),
  };
}

export function deleteLibraryCharacter(
  library: CharacterLibrary,
  id: string,
): CharacterLibrary {
  return {
    ...library,
    activeId: library.activeId === id ? null : library.activeId,
    entries: library.entries.filter((entry) => entry.id !== id),
  };
}
