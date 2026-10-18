import test from "node:test";
import assert from "node:assert/strict";
import {
  derive,
  finalAbilities,
  initialCharacter,
  skillReplacementPlans,
  spellSelectionIssues,
  validateBuild,
  validateStage,
  racialBonuses,
  isCharacterUnfinished,
  spellChoiceSources,
} from "../src/engine/character";
import { type Character } from "../src/engine/types";
import {
  classes,
  classProgression,
  subclassFeatureLevels,
} from "../src/catalog/classes";
import { races } from "../src/catalog/races";

function single(name: string, level = 1): Character {
  return {
    ...initialCharacter(),
    race: "Human",
    subrace: "Standard Human",
    classes: [name],
    level,
    background: "Sage",
    scoresAreFinal: true,
    baseAbilities: {
      Strength: 16,
      Dexterity: 18,
      Constitution: 14,
      Intelligence: 14,
      Wisdom: 14,
      Charisma: 14,
    },
  };
}
function weapon(
  c: Character,
  name: string,
  mode?: "one-handed" | "two-handed" | "thrown" | "off-hand",
) {
  c.equipmentItems.push({
    id: name,
    name,
    quantity: 1,
    source: "Test inventory",
    characterLevel: 1,
    className: "",
    classLevel: null,
    notes: "",
    mode,
  });
}
function attack(c: Character, name: string) {
  const row = derive(c).attacks.find((item) => item.name === name);
  assert.ok(row, `Missing ${name}`);
  return row;
}

test("every acquired class and race feature carries a catalog-owned player-sheet destination", () => {
  for (const cl of classes)
    for (let level = 1; level <= 20; level++) {
      const c = single(cl.name, level);
      c.subclass[cl.name] = cl.subclasses[0];
      for (const feature of derive(c).featureEntries) {
        assert.ok(feature.sheet, `${cl.name} ${level}: ${feature.name}`);
        assert.ok(
          [
            "features",
            "calculated",
            "proficiencies",
            "spellcasting",
            "choices",
          ].includes(feature.sheet!.section),
        );
        assert.ok((feature.classLevel || 0) <= level);
      }
    }
});

test("mixed feats retain play effects without repeating applied bonuses, and tool expertise stays identifiable", () => {
  const c = single("Wizard", 8);
  c.race = "Human";
  c.subrace = "Variant Human (PHB optional)";
  c.featEnabled = true;
  c.raceFeat = "Actor";
  c.asiChoices = {
    "Wizard:4": { mode: "feat", feat: "Alert", abilities: [] },
    "Wizard:8": { mode: "feat", feat: "Observant", abilities: ["Wisdom"] },
  };
  const features = derive(c).featureEntries;
  const actor = features.find((f) => f.name === "Actor")!;
  assert.equal(actor.sheet?.section, "features");
  assert.doesNotMatch(actor.sheet?.description || "", /Increase Charisma/);
  assert.match(actor.sheet?.description || "", /imitate/);
  const alert = features.find((f) => f.name === "Alert")!;
  assert.doesNotMatch(alert.sheet?.description || "", /initiative/);
  assert.match(alert.sheet?.description || "", /surprised/);
  const observant = features.find((f) => f.name === "Observant")!;
  assert.match(observant.sheet?.description || "", /lips/);
  assert.match(observant.sheet?.description || "", /passive Investigation/);
  c.raceFeat = "Tough";
  assert.equal(
    derive(c).featureEntries.find((f) => f.name === "Tough")?.sheet?.section,
    "calculated",
  );
  const rogue = single("Rogue");
  rogue.classSkillChoices.Rogue = [
    "Acrobatics",
    "Stealth",
    "Insight",
    "Investigation",
  ];
  rogue.expertiseChoices = { "Rogue:1": ["Thieves' tools", "Stealth"] };
  assert.equal(
    derive(rogue).proficiencies.find((p) => p.name === "Thieves' tools")?.rank,
    "expertise",
  );
  const monk = single("Monk", 8);
  assert.equal(
    derive(monk).featureEntries.find((f) => f.name === "Unarmored Movement")
      ?.sheet?.section,
    "calculated",
  );
  monk.level = 9;
  assert.match(
    derive(monk).featureEntries.find((f) => f.name === "Unarmored Movement")
      ?.sheet?.description || "",
    /vertical surfaces/,
  );
});

test("non-Monk unarmed and thrown melee weapons use Strength; finesse chooses the better score", () => {
  const c = single("Fighter");
  weapon(c, "Javelin", "thrown");
  weapon(c, "Dagger", "thrown");
  weapon(c, "Shortbow");
  assert.equal(attack(c, "Unarmed Strike").calculatedBonus, "+5");
  assert.equal(attack(c, "Unarmed Strike").damage, "1 +3 bludgeoning");
  assert.equal(attack(c, "Javelin").ability, "Strength");
  assert.equal(attack(c, "Javelin").calculatedBonus, "+5");
  assert.equal(attack(c, "Dagger").ability, "Dexterity");
  assert.equal(attack(c, "Shortbow").calculatedBonus, "+6");
});

test("Martial Arts never lowers a weapon die and deactivates in armor or with a shield", () => {
  const c = single("Monk");
  weapon(c, "Quarterstaff");
  assert.equal(attack(c, "Quarterstaff").damage, "1d6 +4 bludgeoning");
  c.level = 11;
  weapon(c, "Club");
  assert.equal(attack(c, "Club").damage, "1d8 +4 bludgeoning");
  c.equippedArmor = "leather";
  assert.equal(attack(c, "Club").damage, "1d4 +3 bludgeoning");
  assert.equal(attack(c, "Unarmed Strike").damage, "1 +3 bludgeoning");
  assert.equal(derive(c).speed, 30);
  c.equippedArmor = "";
  c.equippedShield = true;
  assert.equal(attack(c, "Quarterstaff").ability, "Strength");
});

test("only the first acquired Unarmored Defense is granted; Barbarian permits shields", () => {
  const c = {
    ...single("Barbarian", 2),
    classMode: "multi" as const,
    classes: ["Barbarian", "Monk"],
    levelPath: { 1: "Barbarian", 2: "Monk" },
    baseAbilities: {
      Strength: 16,
      Dexterity: 14,
      Constitution: 16,
      Intelligence: 10,
      Wisdom: 18,
      Charisma: 10,
    },
  };
  assert.equal(derive(c).ac, 15);
  assert.equal(derive(c).unarmoredDefense, "Barbarian");
  assert.equal(
    derive(c).featureEntries.filter((item) => item.name === "Unarmored Defense")
      .length,
    1,
  );
  c.equippedShield = true;
  assert.equal(derive(c).ac, 17);
  c.levelPath = { 1: "Monk", 2: "Barbarian" };
  assert.equal(derive(c).ac, 14);
  c.equippedShield = false;
  assert.equal(derive(c).ac, 16);
});

test("armor ignores negative Dexterity for heavy armor and handles Defense, shield, and speed", () => {
  const c = single("Fighter");
  c.baseAbilities.Dexterity = 8;
  c.baseAbilities.Strength = 10;
  c.equippedArmor = "plate";
  c.equippedShield = true;
  c.subclassChoices["Fighter:1:fighting-style-1"] = ["Defense"];
  assert.equal(derive(c).ac, 21);
  assert.equal(derive(c).speed, 20);
  c.race = "Dwarf";
  c.subrace = "Hill Dwarf";
  assert.equal(derive(c).speed, 25);
});

test("Draconic Resilience adds one HP per Sorcerer level and an unarmored AC alternative", () => {
  const c = single("Sorcerer", 3);
  c.baseAbilities.Dexterity = 14;
  c.subclass.Sorcerer = "Draconic Bloodline";
  assert.equal(derive(c).hp, 23);
  assert.equal(derive(c).ac, 15);
  c.equippedArmor = "leather";
  assert.equal(derive(c).ac, 13);
  assert.equal(derive(c).hp, 23);
});

test("Knowledge skills have expertise; Bard and Champion grant the correct untrained check bonus", () => {
  const cleric = single("Cleric", 5);
  cleric.subclass.Cleric = "Knowledge Domain";
  cleric.subclassChoices["Cleric:1:knowledge-skills"] = ["Arcana", "History"];
  assert.equal(derive(cleric).skillBonuses.Arcana, 8);
  const bard = single("Bard", 5);
  assert.equal(derive(bard).initiative, 5);
  assert.equal(derive(bard).skillBonuses.Athletics, 4);
  const champion = single("Fighter", 7);
  champion.subclass.Fighter = "Champion";
  assert.equal(derive(champion).initiative, 6);
  assert.equal(derive(champion).skillBonuses.Athletics, 5);
  assert.equal(derive(champion).skillBonuses.Nature, 2);
});

test("ability allocation is reachable and an earlier ASI can qualify a later multiclass entry", () => {
  const c = {
    ...single("Fighter", 5),
    scoresAreFinal: false,
    race: "Elf",
    subrace: "High Elf",
    classMode: "multi" as const,
    classes: ["Fighter", "Cleric"],
    levelPath: {
      1: "Fighter",
      2: "Fighter",
      3: "Fighter",
      4: "Fighter",
      5: "Cleric",
    },
    dmPermission: true,
    abilityMethod: "manual" as const,
    baseAbilities: {
      Strength: 13,
      Dexterity: 12,
      Constitution: 12,
      Intelligence: 10,
      Wisdom: 11,
      Charisma: 8,
    },
  };
  assert.ok(!validateStage(c, 0).some((message) => /Wisdom 13/.test(message)));
  assert.ok(validateStage(c, 3).some((message) => /Wisdom 13/.test(message)));
  c.asiChoices["Fighter:4"] = {
    mode: "plus2",
    abilities: ["Wisdom"],
    feat: "",
  };
  assert.equal(finalAbilities(c, 4).Wisdom, 13);
  assert.ok(!validateStage(c, 3).some((message) => /Wisdom 13/.test(message)));
  c.levelPath = {
    1: "Fighter",
    2: "Cleric",
    3: "Fighter",
    4: "Fighter",
    5: "Fighter",
  };
  assert.ok(
    validateStage(c, 3).some((message) => /Wisdom 13/.test(message)),
    "later ASI cannot qualify entry at level 2",
  );
});

test("single third-caster slots, combined slots, and Pact Magic remain distinct", () => {
  const ek = single("Fighter", 4);
  ek.subclass.Fighter = "Eldritch Knight";
  assert.deepEqual(derive(ek).spellSlots, [3]);
  const mixed = {
    ...single("Wizard", 6),
    classMode: "multi" as const,
    classes: ["Wizard", "Cleric", "Warlock"],
    levelPath: {
      1: "Wizard",
      2: "Wizard",
      3: "Wizard",
      4: "Cleric",
      5: "Warlock",
      6: "Warlock",
    },
  };
  const d = derive(mixed);
  assert.deepEqual(d.spellSlots, [4, 3]);
  assert.equal(d.pactSlots, 2);
  assert.equal(d.pactSlotLevel, 1);
  const cleric = d.spellcasting.find((row) => row.source === "Cleric");
  assert.equal(cleric?.maxSpellLevel, 1);
  mixed.spellSelections = [
    { spellId: "fireball", source: "Cleric", status: "prepared" },
  ];
  assert.ok(
    validateStage(mixed, 6).some((message) =>
      /multiclass slots do not expand/.test(message),
    ),
  );
});

test("racial and always-prepared spells unlock automatically without using preparation counts", () => {
  const c = single("Cleric", 5);
  c.race = "Tiefling";
  c.subrace = "Tiefling";
  c.subclass.Cleric = "Life Domain";
  const spells = derive(c).resolvedSpells;
  assert.ok(
    spells.some((row) => row.name === "Darkness" && row.status === "innate"),
  );
  assert.ok(
    spells.some(
      (row) =>
        row.name === "Revivify" &&
        row.automatic &&
        /Always prepared/.test(row.uses),
    ),
  );
  c.level = 1;
  assert.ok(!derive(c).resolvedSpells.some((row) => row.name === "Darkness"));
});

test("global audit includes missing proficiency/subclass choices and marks explicit overrides", () => {
  const c = single("Fighter", 3);
  c.stage = 8;
  const issues = validateBuild(c);
  assert.ok(issues.some((issue) => issue.stage === 4));
  assert.ok(
    issues.some((issue) => issue.stage === 5 && /subclass/.test(issue.message)),
  );
  assert.ok(
    validateStage(c, 8).some((message) => /skill proficiency/.test(message)),
  );
  c.sheetOverrides = { "skill:Perception": "9", hp: "88" };
  const d = derive(c);
  assert.equal(d.hp, 88);
  assert.equal(d.skillBonuses.Perception, 9);
  assert.match(d.calculations.hp.formula, /override/);
});

test("invalid class-only and future feat choices cannot grant bonuses", () => {
  const c = single("Fighter", 1);
  c.featEnabled = true;
  c.raceFeat = "Tough";
  c.asiChoices["Fighter:4"] = { mode: "feat", abilities: [], feat: "Alert" };
  assert.equal(derive(c).hp, 12);
  assert.equal(derive(c).initiative, 4);
});

test("imported final scores and proficiency checkbox overrides remain explicit", () => {
  const c = single("Fighter");
  c.abilityMethod = "manual";
  c.baseAbilities.Strength = 20;
  assert.ok(!validateStage(c, 3).some((message) => /3 to 18/.test(message)));
  c.sheetOverrides = {
    "proficiency:Save:Strength": "0",
    "proficiency:Skill:Athletics": "1",
  };
  const d = derive(c);
  assert.equal(d.saves.Strength, 5);
  assert.equal(d.skillBonuses.Athletics, 7);
  assert.ok(
    !d.proficiencies.some(
      (row) => row.kind === "Save" && row.name === "Strength",
    ),
  );
});

test("renaming an automatic weapon attack keeps its mechanical identity and future score updates", () => {
  const c = single("Fighter");
  weapon(c, "Rapier");
  const original = attack(c, "Rapier");
  c.attacks = [
    {
      ...original,
      name: "Family blade",
      attackBonus: "",
      damage: "",
      ability: "",
      range: "",
      properties: "",
      proficient: false,
    },
  ];
  let d = derive(c);
  assert.equal(d.attacks.filter((row) => row.id === original.id).length, 1);
  assert.ok(!d.attacks.some((row) => row.name === "Rapier"));
  assert.equal(
    d.attacks.find((row) => row.name === "Family blade")?.damage,
    "1d8 +4 piercing",
  );
  c.baseAbilities.Dexterity = 20;
  d = derive(c);
  assert.equal(
    d.attacks.find((row) => row.name === "Family blade")?.calculatedBonus,
    "+7",
  );
});

test("duplicate skill sources grant a real any-skill replacement without changing Knowledge expertise", () => {
  const c = single("Cleric");
  c.background = "Sage";
  c.subclass.Cleric = "Knowledge Domain";
  c.subclassChoices["Cleric:1:knowledge-skills"] = ["Arcana", "History"];
  const plans = skillReplacementPlans(c);
  assert.equal(plans.length, 2);
  c.skillReplacementChoices[plans[0].key] = "Athletics";
  c.skillReplacementChoices[plans[1].key] = "Stealth";
  const d = derive(c);
  assert.equal(d.skillBonuses.Arcana, 6);
  assert.equal(d.skillBonuses.History, 6);
  assert.equal(d.skillBonuses.Athletics, 5);
  assert.equal(d.skillBonuses.Stealth, 6);
  assert.ok(
    !validateStage(c, 5).some((message) =>
      /duplicates an earlier/.test(message),
    ),
  );
  c.skillReplacementChoices[plans[1].key] = "Athletics";
  assert.ok(
    validateStage(c, 5).some((message) =>
      /duplicates an earlier/.test(message),
    ),
  );
});

test("wealth mode replaces package attacks and requires a valid recorded class roll", () => {
  const c = single("Fighter");
  c.equipmentMethod = "wealth";
  c.startingGold = "150";
  weapon(c, "Longsword");
  c.equipmentItems[0].source = "Starting class: Fighter";
  assert.ok(!derive(c).attacks.some((row) => row.name === "Longsword"));
  assert.ok(
    validateStage(c, 6).some((message) =>
      /replaces class and background/.test(message),
    ),
  );
  c.equipmentItems[0].source = "Purchased equipment";
  assert.ok(derive(c).attacks.some((row) => row.name === "Longsword"));
  c.startingGold = "151";
  assert.ok(
    validateStage(c, 6).some((message) => /actual valid/.test(message)),
  );
});

test("feat prerequisites include all-armor training and reject duplicate feats by canonical name", () => {
  const c = single("Fighter", 6);
  c.featEnabled = true;
  c.asiChoices["Fighter:4"] = {
    mode: "feat",
    abilities: [],
    feat: "Heavily Armored",
  };
  c.asiChoices["Fighter:6"] = {
    mode: "feat",
    abilities: [],
    feat: "heavily armored",
  };
  assert.ok(
    !validateStage(c, 5).some((message) =>
      /requires proficiency with medium armor/.test(message),
    ),
  );
  assert.ok(
    validateStage(c, 5).some((message) =>
      /cannot be selected more than once/.test(message),
    ),
  );
});

test("spell status cannot bypass preparation or known-spell limits", () => {
  const c = single("Wizard", 5);
  c.spellSelections = [
    { spellId: "fireball", source: "Wizard", status: "innate" },
  ];
  assert.ok(
    validateStage(c, 6).some((message) =>
      /must use spellbook or prepared status/.test(message),
    ),
  );
  const bard = single("Bard", 10);
  bard.spellSelections = [
    { spellId: "fireball", source: "Bard", status: "known" },
  ];
  assert.ok(
    validateStage(bard, 6).some((message) =>
      /not on the Bard list/.test(message),
    ),
  );
  assert.ok(
    validateStage(bard, 6).some((message) =>
      /Magical Secrets: Bard 10/.test(message),
    ),
  );
});

test("Spell Sniper accepts its valid typed source and rejects an unearned retained source", () => {
  const c = single("Wizard", 4);
  c.featEnabled = true;
  c.asiChoices["Wizard:4"] = {
    mode: "feat",
    abilities: [],
    feat: "Spell Sniper",
  };
  c.featOptions["Wizard:4"] = ["Wizard"];
  c.spellSelections = [
    { spellId: "fire-bolt", source: "Spell Sniper: Wizard", status: "known" },
  ];
  assert.ok(
    !spellSelectionIssues(c).some((message) =>
      /Spell Sniper|currently available spellcasting source/.test(message),
    ),
  );
  c.asiChoices = {};
  assert.ok(
    spellSelectionIssues(c).some((message) =>
      /does not match an active feat/.test(message),
    ),
  );
});

test("Additional Magical Secrets retains its Bard 6 limit and Wizard capstones require their class levels", () => {
  const bard = single("Bard", 18);
  bard.subclass.Bard = "College of Lore";
  bard.spellSelections = [
    {
      spellId: "cone-of-cold",
      source: "Additional Magical Secrets",
      status: "known",
    },
    {
      spellId: "greater-invisibility",
      source: "Additional Magical Secrets",
      status: "known",
    },
  ];
  assert.ok(
    spellSelectionIssues(bard).some((message) =>
      /Additional Magical Secrets grants.*level 3 or lower/.test(message),
    ),
  );
  bard.spellSelections = [
    {
      spellId: "fireball",
      source: "Additional Magical Secrets",
      status: "known",
    },
    {
      spellId: "counterspell",
      source: "Additional Magical Secrets",
      status: "known",
    },
  ];
  assert.ok(
    !spellSelectionIssues(bard).some((message) =>
      /Additional Magical Secrets grants/.test(message),
    ),
  );
  const fighter = single("Fighter");
  fighter.spellSelections = [
    { spellId: "shield", source: "Spell Mastery", status: "known" },
    { spellId: "fireball", source: "Signature Spells", status: "prepared" },
  ];
  const issues = spellSelectionIssues(fighter);
  assert.ok(
    issues.some((message) =>
      /Spell Mastery requires Wizard level 18/.test(message),
    ),
  );
  assert.ok(
    issues.some((message) =>
      /Signature Spells requires Wizard level 20/.test(message),
    ),
  );
});

test("Book of Ancient Secrets requires Tome and its active invocation and scales only with Warlock levels", () => {
  const c = {
    ...single("Warlock", 20),
    classMode: "multi" as const,
    classes: ["Warlock", "Wizard"],
    levelPath: Object.fromEntries(
      Array.from({ length: 20 }, (_, i) => [
        i + 1,
        i < 3 ? "Warlock" : "Wizard",
      ]),
    ),
  };
  c.subclassChoices["Warlock:3:pact-boon"] = ["Pact of the Tome"];
  c.subclassChoices["Warlock:2:invocations-2"] = [
    "Book of Ancient Secrets",
    "Agonizing Blast",
  ];
  c.spellSelections = [
    { spellId: "alarm", source: "Book of Ancient Secrets", status: "ritual" },
    {
      spellId: "detect-magic",
      source: "Book of Ancient Secrets",
      status: "ritual",
    },
  ];
  assert.ok(
    !spellSelectionIssues(c).some((message) =>
      message.startsWith("Book of Ancient Secrets"),
    ),
  );
  c.spellSelections.push({
    spellId: "Drawmij's Instant Summons",
    source: "Book of Ancient Secrets",
    status: "ritual",
  });
  assert.ok(
    spellSelectionIssues(c).some((message) =>
      /at most level 2 from your Warlock level/.test(message),
    ),
  );
  c.spellSelections = c.spellSelections.slice(0, 2);
  c.spellSelections[0].status = "known";
  assert.ok(
    spellSelectionIssues(c).some((message) =>
      /two distinct starting/.test(message),
    ),
  );
  assert.ok(
    spellSelectionIssues(c).some((message) => /ritual-status/.test(message)),
  );
  c.subclassChoices["Warlock:2:invocations-2"] = [
    "Agonizing Blast",
    "Repelling Blast",
  ];
  assert.ok(
    spellSelectionIssues(c).some((message) =>
      /requires an active invocation/.test(message),
    ),
  );
});

test("Wizard spellbook entries do not create attacks until prepared and never duplicate prepared attacks", () => {
  const c = single("Wizard", 3);
  c.spellSelections = [
    { spellId: "scorching-ray", source: "Wizard", status: "spellbook" },
  ];
  assert.ok(
    !derive(c).attacks.some(
      (attack) => attack.id === "auto-spell-Wizard-scorching-ray",
    ),
  );
  c.spellSelections.push({
    spellId: "scorching-ray",
    source: "Wizard",
    status: "prepared",
  });
  assert.equal(
    derive(c).attacks.filter(
      (attack) => attack.id === "auto-spell-Wizard-scorching-ray",
    ).length,
    1,
  );
});

test("every race and lineage applies its complete ability increases and resolves unique sourced traits", () => {
  const expected: Record<string, Record<string, number>> = {
    "Hill Dwarf": { Constitution: 2, Wisdom: 1 },
    "Mountain Dwarf": { Constitution: 2, Strength: 2 },
    "High Elf": { Dexterity: 2, Intelligence: 1 },
    "Wood Elf": { Dexterity: 2, Wisdom: 1 },
    "Dark Elf (Drow)": { Dexterity: 2, Charisma: 1 },
    Lightfoot: { Dexterity: 2, Charisma: 1 },
    Stout: { Dexterity: 2, Constitution: 1 },
    "Standard Human": {
      Strength: 1,
      Dexterity: 1,
      Constitution: 1,
      Intelligence: 1,
      Wisdom: 1,
      Charisma: 1,
    },
    "Variant Human (PHB optional)": { Strength: 1, Dexterity: 1 },
    "Forest Gnome": { Intelligence: 2, Dexterity: 1 },
    "Rock Gnome": { Intelligence: 2, Constitution: 1 },
    "Half-Elf": { Charisma: 2, Strength: 1, Dexterity: 1 },
    "Half-Orc": { Strength: 2, Constitution: 1 },
    Tiefling: { Charisma: 2, Intelligence: 1 },
  };
  for (const race of races)
    for (const lineage of race.subraces) {
      const c = single("Fighter");
      c.race = race.name;
      c.subrace = lineage.name;
      c.flexBonuses = ["Strength", "Dexterity"];
      c.scoresAreFinal = false;
      assert.deepEqual(
        racialBonuses(c),
        race.name === "Dragonborn"
          ? { Strength: 2, Charisma: 1 }
          : expected[lineage.name],
        lineage.name,
      );
      const features = derive(c).featureEntries.filter(
        (feature) => feature.sourceType === "Race",
      );
      assert.equal(
        new Set(features.map((feature) => feature.name)).size,
        features.length,
        lineage.name,
      );
      assert.equal(
        new Set(features.map((feature) => feature.id)).size,
        features.length,
        lineage.name,
      );
    }
});

test("all 12 classes and 40 subclasses derive only acquired features at every level and after level reduction", () => {
  for (const klass of classes)
    for (const subclass of klass.subclasses) {
      const c = single(klass.name, 20);
      c.subclass[klass.name] = subclass;
      const before = JSON.stringify(c);
      for (let level = 1; level <= 20; level++) {
        c.level = level;
        const d = derive(c);
        const entries = d.featureEntries.filter(
          (feature) =>
            feature.sourceType === "Class" || feature.sourceType === "Subclass",
        );
        assert.equal(
          new Set(entries.map((feature) => feature.id)).size,
          entries.length,
          `${subclass} ${level}`,
        );
        assert.ok(
          entries.every((feature) => (feature.classLevel || 0) <= level),
          `${subclass} ${level}`,
        );
        for (const [unlock, names] of Object.entries(
          subclassFeatureLevels[subclass],
        ))
          for (const name of names)
            assert.equal(
              entries.some(
                (feature) =>
                  feature.sourceType === "Subclass" &&
                  feature.name === name &&
                  feature.classLevel === Number(unlock),
              ),
              Number(unlock) <= level,
              `${subclass} ${level}: ${name}`,
            );
        for (const row of classProgression[klass.name].levels.filter(
          (row) => row.level <= level,
        ))
          for (const feature of row.features)
            if (
              !/^(Path Feature|Bard College Feature|Divine Domain Feature|Druid Circle Feature|Martial Archetype Feature|Monastic Tradition Feature|Sacred Oath Feature|Ranger Archetype Feature|Roguish Archetype Feature|Sorcerous Origin Feature|Otherworldly Patron Feature|Arcane Tradition Feature)$/.test(
                feature.name,
              )
            )
              assert.ok(
                entries.some(
                  (entry) =>
                    entry.sourceType === "Class" &&
                    entry.name === feature.name &&
                    entry.classLevel === row.level,
                ),
                `${subclass} ${level}: ${feature.name}`,
              );
      }
      c.level = 1;
      assert.ok(
        derive(c)
          .featureEntries.filter((feature) => feature.className === klass.name)
          .every((feature) => (feature.classLevel || 0) <= 1),
      );
      c.level = 20;
      assert.equal(JSON.stringify(c), before);
    }
});

test("racial cantrip decisions and innate spell availability match the current level", () => {
  const c = single("Fighter");
  c.race = "Elf";
  c.subrace = "High Elf";
  assert.match(
    derive(c).featureEntries.find(
      (feature) => feature.name === "High Elf Cantrip",
    )!.uses,
    /unresolved/,
  );
  c.spellSelections = [
    { spellId: "fire-bolt", source: "High Elf", status: "known" },
  ];
  assert.equal(
    derive(c).featureEntries.find(
      (feature) => feature.name === "High Elf Cantrip",
    )!.uses,
    "Choice recorded: Fire Bolt",
  );
  c.spellSelections = [
    { spellId: "cure-wounds", source: "High Elf", status: "known" },
  ];
  assert.match(
    derive(c).featureEntries.find(
      (feature) => feature.name === "High Elf Cantrip",
    )!.uses,
    /unresolved/,
  );
  c.spellSelections = [];
  for (const [race, lineage, feature, cantrip, third] of [
    [
      "Tiefling",
      "Tiefling",
      "Infernal Legacy",
      "Thaumaturgy",
      "Hellish Rebuke",
    ],
    ["Elf", "Dark Elf (Drow)", "Drow Magic", "Dancing Lights", "Faerie Fire"],
  ]) {
    c.race = race;
    c.subrace = lineage;
    for (const level of [1, 2, 3, 4, 5, 20]) {
      c.level = level;
      const d = derive(c);
      const now = d.featureEntries
        .find((entry) => entry.name === feature)!
        .description.split("Available now: ")[1];
      assert.ok(now.includes(cantrip));
      assert.equal(now.includes(third), level >= 3);
      assert.equal(now.includes("Darkness"), level >= 5);
      assert.equal(
        d.resolvedSpells.some((spell) => spell.name === third),
        level >= 3,
      );
      assert.equal(
        d.resolvedSpells.some((spell) => spell.name === "Darkness"),
        level >= 5,
      );
    }
  }
});

test("Ranger humanoid pairs are required only for their chosen enemy group and retain independent acquisition", () => {
  const c = single("Ranger", 6);
  c.subclass.Ranger = "Hunter";
  c.subclassChoices["Ranger:1:favored-enemy-1"] = [
    "Humanoids (choose two races)",
  ];
  assert.ok(
    validateStage(c, 5).some((message) =>
      /Favored Humanoid Races at Ranger 1 requires 2/.test(message),
    ),
  );
  c.subclassChoices["Ranger:1:favored-humanoids-1"] = ["Goblins", "Orcs"];
  assert.ok(
    !validateStage(c, 5).some((message) =>
      /Favored Humanoid Races at Ranger 1/.test(message),
    ),
  );
  for (const name of ["Goblins", "Orcs"])
    assert.ok(
      derive(c).featureEntries.some(
        (feature) => feature.name === name && feature.classLevel === 1,
      ),
    );
  c.subclassChoices["Ranger:6:favored-enemy-6"] = [
    "Humanoids (choose two races)",
  ];
  c.subclassChoices["Ranger:6:favored-humanoids-6"] = ["Goblins", "Gnolls"];
  assert.ok(
    validateStage(c, 5).some((message) =>
      /favored humanoid races must be distinct/.test(message),
    ),
  );
  c.subclassChoices["Ranger:6:favored-humanoids-6"] = ["Gnolls", "Kobolds"];
  assert.ok(
    !validateStage(c, 5).some((message) =>
      /favored enemy choices must be distinct|favored humanoid races must be distinct/.test(
        message,
      ),
    ),
  );
  c.level = 1;
  assert.ok(
    !derive(c).featureEntries.some((feature) => feature.name === "Gnolls"),
  );
  c.subclassChoices["Ranger:1:favored-enemy-1"] = ["Beasts"];
  c.subclassChoices["Ranger:1:favored-language-1"] = [
    "No language (chosen enemies speak none)",
  ];
  assert.ok(
    !derive(c).featureEntries.some((feature) => feature.name === "Goblins"),
  );
  assert.ok(
    !derive(c).proficiencies.some((entry) =>
      entry.name.startsWith("No language"),
    ),
  );
  assert.ok(
    !validateStage(c, 5).some((message) => /Favored Humanoid/.test(message)),
  );
});

test("inactive stored invocations do not grant benefits after reducing level", () => {
  const c = single("Warlock", 12);
  c.subclass.Warlock = "The Fiend";
  c.subclassChoices["Warlock:12:invocations-12"] = ["Beguiling Influence"];
  assert.ok(
    derive(c).proficiencies.some(
      (row) => row.source === "Warlock: Beguiling Influence",
    ),
  );
  const saved = JSON.stringify(c.subclassChoices);
  c.level = 2;
  assert.ok(
    !derive(c).proficiencies.some(
      (row) => row.source === "Warlock: Beguiling Influence",
    ),
  );
  assert.equal(JSON.stringify(c.subclassChoices), saved);
});

test("unfinished status ignores source review alone but includes required and imported decisions", () => {
  const c = single("Monk");
  c.race = "Dwarf";
  c.subrace = "Hill Dwarf";
  c.background = "Urchin";
  c.classSkillChoices.Monk = ["Acrobatics", "Athletics"];
  c.toolChoices = {
    "race:Dwarf:tool": ["Smith's tools"],
    "class:Monk:artisan-or-instrument": ["Flute"],
  };
  weapon(c, "Quarterstaff");
  assert.deepEqual(
    validateBuild(c).filter((issue) => issue.severity === "error"),
    [],
  );
  assert.ok(
    validateBuild(c).some((issue) => issue.id === "phb-authority-access"),
  );
  assert.equal(isCharacterUnfinished(c), false);
  c.importWarnings = ["Review imported equipment source"];
  assert.equal(isCharacterUnfinished(c), true);
  c.importWarnings = [];
  c.classSkillChoices.Monk = [];
  assert.equal(isCharacterUnfinished(c), true);
  const wizard = single("Wizard");
  wizard.classSkillChoices.Wizard = ["Insight", "Medicine"];
  wizard.languages = ["Dwarvish", "Elvish", "Goblin"];
  weapon(wizard, "Quarterstaff");
  wizard.spellSelections = [
    ...["fire-bolt", "friends", "mage-hand"].map((spellId) => ({
      spellId,
      source: "Wizard",
      status: "known" as const,
    })),
    ...[
      "magic-missile",
      "shield",
      "mage-armor",
      "find-familiar",
      "detect-magic",
      "sleep",
    ].map((spellId) => ({
      spellId,
      source: "Wizard",
      status: "spellbook" as const,
    })),
  ];
  assert.deepEqual(
    validateBuild(wizard).filter((issue) => issue.severity === "error"),
    [],
  );
  assert.ok(
    validateBuild(wizard).some((issue) => issue.id.startsWith("spell-source-")),
  );
  assert.equal(isCharacterUnfinished(wizard), false);
});

test("spell sources and calculated spell grants follow race changes, class changes and class-level reductions", () => {
  const c = single("Druid", 2);
  c.subclass.Druid = "Circle of the Land";
  c.spellSelections = [
    { spellId: "produce-flame", source: "Circle of the Land", status: "known" },
  ];
  assert.ok(spellChoiceSources(c).includes("Circle of the Land"));
  assert.ok(
    derive(c).resolvedSpells.some(
      (spell) => spell.source === "Circle of the Land",
    ),
  );
  const saved = JSON.stringify(c.spellSelections);
  c.level = 1;
  assert.ok(!spellChoiceSources(c).includes("Circle of the Land"));
  assert.ok(
    !derive(c).resolvedSpells.some(
      (spell) => spell.source === "Circle of the Land",
    ),
  );
  assert.equal(JSON.stringify(c.spellSelections), saved);
  assert.ok(
    spellSelectionIssues(c).some((message) =>
      /no currently available spellcasting source/.test(message),
    ),
  );
  c.race = "Elf";
  c.subrace = "High Elf";
  c.spellSelections = [
    { spellId: "fire-bolt", source: "High Elf", status: "known" },
  ];
  assert.ok(
    derive(c).attacks.some((row) => row.name === "Fire Bolt (High Elf)"),
  );
  c.race = "Human";
  c.subrace = "Standard Human";
  assert.ok(!spellChoiceSources(c).includes("High Elf"));
  assert.ok(
    !derive(c).attacks.some((row) => row.name === "Fire Bolt (High Elf)"),
  );
  c.classes = ["Wizard"];
  c.level = 5;
  c.spellSelections = [
    { spellId: "fireball", source: "Wizard", status: "prepared" },
  ];
  assert.ok(
    derive(c).resolvedSpells.some((spell) => spell.name === "Fireball"),
  );
  c.level = 2;
  assert.ok(
    !derive(c).resolvedSpells.some((spell) => spell.name === "Fireball"),
  );
  c.classes = ["Fighter"];
  c.level = 5;
  assert.ok(!spellChoiceSources(c).includes("Wizard"));
  assert.ok(
    !derive(c).resolvedSpells.some((spell) => spell.name === "Fireball"),
  );
  c.classes = ["Warlock"];
  c.level = 3;
  c.subclass.Warlock = "The Fiend";
  c.subclassChoices["Warlock:3:pact-boon"] = ["Pact of the Tome"];
  c.subclassChoices["Warlock:2:invocations-2"] = ["Book of Ancient Secrets"];
  assert.ok(spellChoiceSources(c).includes("Pact of the Tome"));
  assert.ok(spellChoiceSources(c).includes("Book of Ancient Secrets"));
  c.level = 2;
  assert.ok(!spellChoiceSources(c).includes("Pact of the Tome"));
  assert.ok(!spellChoiceSources(c).includes("Book of Ancient Secrets"));
});
