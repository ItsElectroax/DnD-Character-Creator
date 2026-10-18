import test from "node:test";
import assert from "node:assert/strict";
import {
  derive,
  initialCharacter,
  validateStage,
} from "../src/engine/character";
import { StageOrigin } from "../src/ui/stages/Origin";
import { StageAbilities } from "../src/ui/stages/Abilities";
import {
  StageClassChoices,
  levelResourceSummary,
} from "../src/ui/stages/ClassChoices";
import { classes, classProgression } from "../src/catalog/classes";
import { races } from "../src/catalog/races";
import { type Character, type EquipmentEntry } from "../src/engine/types";
import { normalizeDraft } from "../src/storage/drafts";
import { StartingEquipmentPicker } from "../src/ui/components/CreationControls";
import {
  getStartingEquipmentChoices,
  getBackgroundEquipment,
} from "../src/catalog/equipment";

type ElementNode = { type?: unknown; props?: Record<string, unknown> };
function descendants(node: unknown): ElementNode[] {
  if (Array.isArray(node)) return node.flatMap(descendants);
  if (!node || typeof node !== "object") return [];
  const element = node as ElementNode;
  return [element, ...descendants(element.props?.children)];
}

test("dragonborn ancestry cards set the same choice used by validation and breath calculations", () => {
  const c = initialCharacter();
  c.race = "Dragonborn";
  c.classes = ["Fighter"];
  const expected: Record<string, [string, string]> = {
    Black: ["acid", "5-by-30-foot line; Dexterity save"],
    Blue: ["lightning", "5-by-30-foot line; Dexterity save"],
    Brass: ["fire", "5-by-30-foot line; Dexterity save"],
    Bronze: ["lightning", "5-by-30-foot line; Dexterity save"],
    Copper: ["acid", "5-by-30-foot line; Dexterity save"],
    Gold: ["fire", "15-foot cone; Dexterity save"],
    Green: ["poison", "15-foot cone; Constitution save"],
    Red: ["fire", "15-foot cone; Dexterity save"],
    Silver: ["cold", "15-foot cone; Constitution save"],
    White: ["cold", "15-foot cone; Constitution save"],
  };
  const options = races.find((race) => race.name === "Dragonborn")!.subraces;
  const nodes = descendants(
    StageOrigin({
      c,
      d: derive(c),
      update: (patch) => Object.assign(c, patch),
    }),
  );
  assert.ok(
    !nodes.some((node) => node.props?.label === "Draconic ancestry"),
    "No duplicate ancestry dropdown",
  );
  for (const option of options) {
    const card = nodes.find((node) => node.props?.title === option.name)!;
    assert.ok(card);
    (card.props!.onClick as () => void)();
    assert.equal(c.subrace, option.name);
    assert.equal(c.ancestry, option.name.replace(/ ancestry$/, ""));
    assert.deepEqual(validateStage(c, 0), []);
    const breath = derive(c).attacks.find(
      (attack) => attack.id === "auto-dragonborn-breath",
    )!;
    const [type, range] = expected[c.ancestry];
    assert.equal(breath.damage, `2d6 ${type}`);
    assert.equal(breath.range, range);
    assert.ok(option.detail.includes(type));
    assert.ok(option.detail.includes(range.split(";")[0]));
  }
});

test("saved dragonborn cards resolve missing or stale duplicate ancestry without changing draft data", () => {
  const c = initialCharacter();
  c.race = "Dragonborn";
  c.subrace = "Silver ancestry";
  c.classes = ["Fighter"];
  for (const ancestry of ["", "Red"]) {
    c.ancestry = ancestry;
    const before = JSON.stringify(c);
    assert.deepEqual(validateStage(c, 0), []);
    const sheet = derive(c);
    const breath = sheet.attacks.find(
      (attack) => attack.id === "auto-dragonborn-breath",
    )!;
    assert.match(breath.damage, /cold/);
    assert.match(breath.range, /Constitution/);
    assert.equal(
      sheet.featureEntries.find(
        (feature) => feature.name === "Draconic Ancestry",
      )!.uses,
      "Choice recorded: Silver",
    );
    assert.equal(JSON.stringify(c), before);
  }
  c.subrace = "";
  c.ancestry = "";
  assert.ok(validateStage(c, 0).includes("Choose your dragonborn ancestry."));
});
function state() {
  const c = initialCharacter();
  c.race = "Dwarf";
  c.subrace = "Hill Dwarf";
  c.classes = ["Monk"];
  c.background = "Urchin";
  const groups = getStartingEquipmentChoices("Monk");
  c.equipment = groups.map(
    (group) => `start:${group.id}:${group.options[0].id}`,
  );
  const weaponGroup = groups.find((group) => group.title === "Weapon")!;
  const item: EquipmentEntry = {
    id: `start-${weaponGroup.id}-Shortsword`,
    name: "Shortsword",
    catalogId: "shortsword",
    quantity: 1,
    source: "Starting class: Monk",
    className: "Monk",
    classLevel: 1,
    characterLevel: 1,
    notes: "Family weapon",
    mode: "off-hand",
    equipped: true,
  };
  c.equipmentItems = [item];
  return { c, item, groups };
}
function changePack(c: Character) {
  const groups = getStartingEquipmentChoices("Monk");
  const pack = groups.find((group) => group.title === "Pack")!;
  let next = c;
  const tree = StartingEquipmentPicker({
    c,
    initial: "Monk",
    update: (patch) => {
      next = { ...next, ...patch };
    },
  });
  const radios = descendants(tree).filter(
    (element) => element.type === "input" && element.props?.name === pack.id,
  );
  assert.equal(radios.length, 2);
  (radios[1].props!.onChange as () => void)();
  return next;
}

test("draft migration preserves starting-wealth method and recorded gold", () => {
  const c = initialCharacter();
  c.equipmentMethod = "wealth";
  c.startingGold = "150";
  const restored = normalizeDraft(JSON.parse(JSON.stringify(c)));
  assert.equal(restored.equipmentMethod, "wealth");
  assert.equal(restored.startingGold, "150");
});

test("changing another starting group preserves unchanged weapon mode, equipped state and notes", () => {
  const { c, item } = state();
  const next = changePack(c);
  const weapon = next.equipmentItems.find((row) => row.id === item.id)!;
  assert(weapon);
  assert.equal(weapon.mode, item.mode);
  assert.equal(weapon.equipped, item.equipped);
  assert.equal(weapon.notes, item.notes);
});

test("editing generated inventory source cannot duplicate its stable item on regeneration", () => {
  const { c, item } = state();
  item.source = "Gift from mentor";
  const next = changePack(c);
  assert.equal(
    next.equipmentItems.filter((row) => row.id === item.id).length,
    1,
  );
});

test("changing class equipment preserves applied background inventory and currency", () => {
  const { c } = state();
  const background = getBackgroundEquipment(c.background, c.backgroundVariant);
  c.equipment.push(
    `background:${c.background}:${c.backgroundVariant}`,
    `background-gp:${background.currency.gp}`,
  );
  c.currency.GP = String(background.currency.gp);
  const next = changePack(c);
  assert(
    next.equipment.includes(
      `background:${c.background}:${c.backgroundVariant}`,
    ),
  );
  for (const granted of background.items)
    assert(
      next.equipmentItems.some(
        (row) => row.name === granted.name && row.quantity === granted.quantity,
      ),
    );
  assert.equal(next.currency.GP, String(background.currency.gp));
});

test("Croatian display translations preserve authored text and canonical option values", async () => {
  await import("../src/i18n/register");
  const { prepare } = await import("../src/i18n/jsx-runtime");
  const { getLocale, setLocale, t } = await import("../src/i18n/engine");
  const previous = getLocale();
  setLocale("hr");
  try {
    assert.notEqual(t("Rage"), "Rage");
    const player = prepare("p", { "data-player-text": true, children: "Rage" });
    assert.equal(player!.children, "Rage");
    const generated = prepare("p", { children: "Rage" });
    assert.equal(generated!.children, t("Rage"));
    const option = prepare("option", { children: "Wisdom" });
    assert.equal(option!.value, "Wisdom");
    assert.equal(option!.children, t("Wisdom"));
    const input = prepare("input", {
      value: "Rage",
      placeholder: "Choose a feat",
    });
    assert.equal(input!.value, "Rage");
    assert.equal(input!.placeholder, t("Choose a feat"));
    for (const ancestry of races.find((race) => race.name === "Dragonborn")!
      .subraces)
      assert.notEqual(t(ancestry.detail), ancestry.detail, ancestry.name);
  } finally {
    setLocale(previous);
  }
});

function textContent(node: unknown): string {
  if (Array.isArray(node)) return node.map(textContent).join(" ");
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (!node || typeof node !== "object") return "";
  return textContent((node as ElementNode).props?.children);
}

test("both ancestry ability pickers exclude Charisma only for Half-Elves and preserve empty slots", () => {
  const c = initialCharacter();
  c.race = "Half-Elf";
  c.subrace = "Half-Elf";
  c.classes = ["Fighter"];
  c.flexBonuses = ["Strength", "Dexterity"];
  for (const render of [
    () =>
      StageOrigin({
        c,
        d: derive(c),
        update: (patch) => Object.assign(c, patch),
      }),
    () => StageAbilities({ c, update: (patch) => Object.assign(c, patch) }),
  ]) {
    const fields = descendants(render()).filter(
      (node) =>
        String(node.props?.label || "").startsWith("Flexible +1") ||
        /^\+1 ability/.test(String(node.props?.label || "")),
    );
    assert.equal(fields.length, 2);
    for (const field of fields)
      assert.ok(
        !descendants(field).some(
          (node) =>
            node.type === "option" && node.props?.children === "Charisma",
        ),
      );
  }
  const origin = StageOrigin({
    c,
    d: derive(c),
    update: (patch) => Object.assign(c, patch),
  });
  const first = descendants(
    descendants(origin).find(
      (node) => node.props?.label === "Flexible +1 choice one",
    ),
  ).find((node) => node.type === "select")!;
  (first.props!.onChange as (event: unknown) => void)({
    target: { value: "" },
  });
  assert.deepEqual(c.flexBonuses, ["", "Dexterity"]);
  c.race = "Human";
  c.subrace = "Variant Human (PHB optional)";
  c.flexBonuses = [];
  const variants = descendants(StageAbilities({ c, update: () => {} })).filter(
    (node) => /^\+1 ability/.test(String(node.props?.label || "")),
  );
  for (const field of variants)
    assert.ok(
      descendants(field).some(
        (node) => node.type === "option" && node.props?.children === "Charisma",
      ),
    );
});

test("selected lineage summary shows all fixed and selected bonuses", () => {
  const c = initialCharacter();
  c.classes = ["Fighter"];
  for (const [race, lineage, expected] of [
    ["Dwarf", "Mountain Dwarf", ["+2 Constitution", "+2 Strength"]],
    ["Elf", "High Elf", ["+2 Dexterity", "+1 Intelligence"]],
    ["Gnome", "Forest Gnome", ["+2 Intelligence", "+1 Dexterity"]],
    ["Human", "Variant Human (PHB optional)", ["+1 Wisdom", "+1 Charisma"]],
  ] as const) {
    c.race = race;
    c.subrace = lineage;
    c.flexBonuses = ["Wisdom", "Charisma"];
    const facts = descendants(
      StageOrigin({ c, d: derive(c), update: () => {} }),
    ).find((node) => node.props?.className === "race-facts");
    const rendered = textContent(facts);
    for (const increase of expected)
      assert.ok(rendered.includes(increase), `${lineage}: ${increase}`);
  }
});

test("Ranger humanoid controls are conditional, accept specific custom races and do not duplicate sections", () => {
  const c = initialCharacter();
  c.classes = ["Ranger"];
  c.level = 6;
  c.subclass.Ranger = "Hunter";
  const render = () =>
    StageClassChoices({
      c,
      d: derive(c),
      update: (patch) => Object.assign(c, patch),
    });
  assert.ok(
    !descendants(render()).some(
      (node) => node.props?.label === "Humanoid race 1",
    ),
  );
  c.subclassChoices["Ranger:1:favored-enemy-1"] = [
    "Humanoids (choose two races)",
  ];
  const nodes = descendants(render());
  const fields = nodes.filter((node) =>
    /^Humanoid race /.test(String(node.props?.label || "")),
  );
  assert.equal(fields.length, 2);
  const input = descendants(fields[0]).find((node) => node.type === "input")!;
  (input.props!.onChange as (event: unknown) => void)({
    target: { value: "Bugbears" },
  });
  c.subclassChoices["Ranger:1:favored-humanoids-1"][1] = "Orcs";
  assert.ok(
    !validateStage(c, 5).some((message) =>
      /Favored Humanoid Races at Ranger 1/.test(message),
    ),
  );
  assert.ok(
    derive(c).featureEntries.some((feature) => feature.name === "Bugbears"),
  );
  c.subclassChoices["Ranger:1:favored-enemy-1"] = ["Beasts"];
  assert.ok(
    !descendants(render()).some(
      (node) => node.props?.label === "Humanoid race 1",
    ),
  );
  assert.ok(
    !derive(c).featureEntries.some((feature) => feature.name === "Bugbears"),
  );
});

test("class timelines render every resource row and agree with resolved Moon druid limits", () => {
  for (const klass of classes) {
    const c = initialCharacter();
    c.classes = [klass.name];
    c.level = 20;
    c.subclass[klass.name] = klass.subclasses[0];
    const d = derive(c);
    for (const row of classProgression[klass.name].levels)
      assert.doesNotMatch(
        levelResourceSummary(
          klass.name,
          row.level,
          row,
          d,
          c.subclass[klass.name],
        ),
        /undefined|NaN/,
        `${klass.name} ${row.level}`,
      );
  }
  const c = initialCharacter();
  c.classes = ["Druid"];
  c.subclass.Druid = "Circle of the Moon";
  for (const level of [2, 3, 4, 5, 6, 7, 8, 9, 12, 15, 18, 20]) {
    c.level = level;
    const d = derive(c);
    const cr = String(level < 6 ? 1 : Math.floor(level / 3));
    assert.ok(
      levelResourceSummary(
        "Druid",
        level,
        classProgression.Druid.levels[level - 1],
        d,
        c.subclass.Druid,
      ).includes(`max beast CR ${cr}`),
    );
    assert.ok(
      d.featureEntries
        .find((feature) => feature.name === "Wild Shape")!
        .description.includes(`maximum beast CR ${cr}`),
    );
  }
  c.classes = ["Cleric"];
  c.level = 1;
  assert.doesNotMatch(
    levelResourceSummary(
      "Cleric",
      1,
      classProgression.Cleric.levels[0],
      derive(c),
    ),
    /Channel Divinity|Destroy Undead/,
  );
  c.classes = ["Paladin"];
  assert.doesNotMatch(
    levelResourceSummary(
      "Paladin",
      1,
      classProgression.Paladin.levels[0],
      derive(c),
    ),
    /prepare up to/,
  );
});
