import { getCatalogAudit } from "../catalog/audit";
import { backgrounds } from "../catalog/backgrounds";
import {
  choicePlanForFeature,
  classes,
  classProgression,
  classLevelResources,
  classFeatureSheetRule,
  classTraining,
  domainSpells,
  getChoiceOptionDetail,
  getSubclassChoicePlans,
  getSubclassFeatureDetail,
  landSpells,
  oathSpells,
  patronExpandedSpells,
  subclassCatalog,
  subclassFeatureLevels,
  type ClassLevel,
} from "../catalog/classes";
import {
  armor as catalogArmor,
  classStartingWealth,
  findArmor,
  findWeapon,
  getBackgroundEquipment,
  getStartingEquipmentChoices,
  weapons,
} from "../catalog/equipment";
import {
  featAbilityFor,
  featFeatureSheetRule,
  findFeat,
} from "../catalog/feats";
import {
  abilities,
  allToolOptions,
  artisanToolOptions,
  gamingSetOptions,
  languages as languageOptions,
  musicalInstrumentOptions,
  skills,
} from "../catalog/proficiencies";
import {
  dragonbornAncestries,
  dragonbornAncestryFor,
  raceFeatureSheetRule,
  raceProfiles,
  races,
  raceTraitsFor,
} from "../catalog/races";
import { findSpell } from "../catalog/spells";
import {
  type AttackEntry,
  type Calculation,
  type Character,
  type FeatureEntry,
  type ProficiencyEntry,
  type ResolvedSpell,
  type SpellSelection,
  type ValidationIssue,
} from "./types";
export const initialCharacter = (): Character => ({
  version: 2,
  stage: 0,
  confirmed: [],
  visitedThrough: 0,
  identity: {
    name: "",
    player: "",
    alignment: "",
    age: "",
    height: "",
    weight: "",
    eyes: "",
    skin: "",
    hair: "",
    appearance: "",
    traits: "",
    ideal: "",
    bond: "",
    flaw: "",
    backstory: "",
    goal: "",
    allies: "",
    faction: "",
    treasure: "",
  },
  race: "",
  subrace: "",
  ancestry: "",
  raceFeat: "",
  classMode: "single",
  classes: [],
  level: 1,
  levelPath: { 1: "" },
  dmPermission: false,
  background: "",
  backgroundVariant: "",
  abilityMethod: "standard",
  baseAbilities: {
    Strength: 15,
    Dexterity: 14,
    Constitution: 13,
    Intelligence: 12,
    Wisdom: 10,
    Charisma: 8,
  },
  rollNotes: "",
  skills: [],
  classSkillChoices: {},
  languages: [],
  tools: [],
  toolChoices: {},
  subclass: {},
  subclassChoices: {},
  featEnabled: false,
  raceFeatAbility: "",
  featOptions: {},
  equipment: [],
  equipmentItems: [],
  attacks: [],
  featureEntries: [],
  otherProficiencies: [],
  spells: [],
  notes: "",
  flexBonuses: [],
  raceSkills: [],
  expertiseChoices: {},
  skillReplacementChoices: {},
  asiChoices: {},
  importedClassLevels: {},
  importedInitialClass: "",
  scoresAreFinal: false,
  xp: "",
  hpCurrent: "",
  hpTemp: "",
  acOverride: "",
  currency: { CP: "", SP: "", EP: "", GP: "", PP: "" },
  inspiration: false,
  spellNotes: "",
  spellSelections: [],
  equippedArmor: "",
  equippedShield: false,
  hpRolls: {},
  hpMethod: "average",
  importedRawFields: {},
  importWarnings: [],
  sheetOverrides: {},
  equipmentMethod: "package",
  startingGold: "",
});

export const standardArray = [15, 14, 13, 12, 10, 8];

export const pointBuyCost: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

export const abilityModifier = (score: number) => Math.floor((score - 10) / 2);

export const formatMod = (value: number) =>
  value >= 0 ? `+${value}` : `${value}`;

export const proficiencyBonus = (level: number) =>
  2 + Math.floor((level - 1) / 4);

export const classLevelCounts = (character: Character) => {
  const counts: Record<string, number> = {};
  if (character.classMode === "single") {
    const chosen = character.classes[0];
    if (chosen) counts[chosen] = character.level;
  } else {
    if (
      character.importedInitialClass &&
      Object.values(character.levelPath).every((value) => !value)
    )
      return { ...character.importedClassLevels };
    for (let n = 1; n <= character.level; n++) {
      const chosen = character.levelPath[n];
      if (chosen) counts[chosen] = (counts[chosen] || 0) + 1;
    }
  }
  return counts;
};

export const initialClass = (character: Character) =>
  character.classMode === "single"
    ? character.classes[0]
    : character.levelPath[1] || character.importedInitialClass;

export const selectedRace = (character: Character) =>
  races.find((x) => x.name === character.race);

export const selectedClass = (name?: string) =>
  classes.find((x) => x.name === name);

/** Inactive saved branch choices remain in the draft without granting benefits. */
export function activeSubclassChoices(
  character: Character,
): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(classLevelCounts(character)).flatMap(([className, level]) =>
      getSubclassChoicePlans(
        className,
        character.subclass[className] || "",
        level,
        character.subclassChoices,
      ).map((plan) => {
        const key = `${className}:${plan.unlockLevel}:${plan.key}`;
        return [
          key,
          (character.subclassChoices?.[key] || [])
            .filter((option) =>
              plan.allowCustom
                ? Boolean(option.trim())
                : plan.options.includes(option),
            )
            .slice(0, plan.choose),
        ];
      }),
    ),
  );
}

export const selectedBackground = (character: Character) =>
  backgrounds.find((x) => x.name === character.background);

export const backgroundVariantOptions = (background: string): string[] =>
  ({
    "Criminal / Spy": ["Spy"],
    "Entertainer / Gladiator": ["Gladiator"],
    "Guild Artisan / Merchant": ["Guild Merchant"],
    "Noble / Knight": ["Knight", "Knight (Retainers)"],
    "Sailor / Pirate": ["Pirate"],
  })[background] || [];

export const additionalLanguageCount = (character: Character) =>
  (selectedBackground(character)?.languages || 0) +
  (character.race === "Human" ? 1 : 0) +
  (character.race === "Half-Elf" ? 1 : 0) +
  (character.subrace === "High Elf" ? 1 : 0) +
  (character.backgroundVariant === "Guild Merchant" &&
  Object.values(character.toolChoices || {}).some((values) =>
    values.includes("Additional language (Guild Merchant)"),
  )
    ? 1
    : 0);

export const activeEquipmentItems = (character: Character) =>
  character.equipmentItems.filter(
    (item) =>
      character.equipmentMethod !== "wealth" ||
      !/^(Starting class:|Background equipment:)/i.test(item.source),
  );

export type ToolChoicePlan = {
  key: string;
  label: string;
  source: string;
  options: string[];
  count: number;
  className: string;
  classLevel: number | null;
  characterLevel: number | null;
};

type FixedToolSource = {
  key: string;
  name: string;
  source: string;
  className: string;
  classLevel: number | null;
  characterLevel: number | null;
};

function fixedToolSources(character: Character): FixedToolSource[] {
  const rows: FixedToolSource[] = [];
  const first = initialClass(character);
  const levels = classLevelCounts(character);
  const add = (
    key: string,
    name: string,
    source: string,
    className = "",
    classLevel: number | null = null,
    characterLevel: number | null = 1,
  ) => rows.push({ key, name, source, className, classLevel, characterLevel });
  for (const [name, count] of Object.entries(levels)) {
    if (!count) continue;
    const training = classTraining[name];
    if (!training) continue;
    const initial = name === first;
    const source = `${name} ${initial ? "starting" : "multiclass"} training`;
    const acquisition = initial
      ? 1
      : (Object.keys(character.levelPath)
          .map(Number)
          .sort((a, b) => a - b)
          .find((level) => character.levelPath[level] === name) ?? null);
    const list = initial
      ? training.tools
      : training.multiclassProficiencies.filter((x) =>
          /thieves' tools/i.test(x),
        );
    list
      .filter(
        (item) =>
          !/^(choose|one skill|one musical|type of|artisan's tool or)/i.test(
            item,
          ),
      )
      .forEach((tool, index) =>
        add(`class:${name}:${index}`, tool, source, name, 1, acquisition),
      );
  }
  if (character.race === "Gnome" && character.subrace === "Rock Gnome")
    add("race:gnome:tinker", "Tinker's tools", "Race: Rock Gnome");
  for (const [index, tool] of (
    selectedBackground(character)?.tools || []
  ).entries())
    if (
      !/^(one artisan tool|one gaming set|one musical instrument)$/i.test(tool)
    )
      add(
        `background:${character.background}:${index}`,
        tool,
        `Background: ${character.background}`,
      );
  return rows;
}

export function toolChoicePlans(character: Character): ToolChoicePlan[] {
  const plans: ToolChoicePlan[] = [];
  const first = initialClass(character);
  const classLevels = classLevelCounts(character);
  const add = (
    key: string,
    label: string,
    source: string,
    options: string[],
    count: number,
    className = "",
    classLevel: number | null = null,
    characterLevel: number | null = 1,
  ) =>
    plans.push({
      key,
      label,
      source,
      options,
      count,
      className,
      classLevel,
      characterLevel,
    });
  for (const [name, level] of Object.entries(classLevels)) {
    if (!level) continue;
    const initial = name === first;
    const acquisition = initial
      ? 1
      : (Object.keys(character.levelPath)
          .map(Number)
          .sort((a, b) => a - b)
          .find((n) => character.levelPath[n] === name) ?? null);
    if (name === "Bard")
      add(
        `class:${name}:instruments`,
        `${name} ${initial ? "starting training: choose 3 musical instruments" : "multiclass training: choose 1 musical instrument"}`,
        `${name} ${initial ? "starting" : "multiclass"} training`,
        musicalInstrumentOptions,
        initial ? 3 : 1,
        name,
        1,
        acquisition,
      );
    if (name === "Monk" && initial)
      add(
        "class:Monk:artisan-or-instrument",
        "Monk starting training: choose 1 artisan tool or musical instrument",
        "Monk starting training",
        [...artisanToolOptions, ...musicalInstrumentOptions],
        1,
        name,
        1,
        1,
      );
  }
  const background = selectedBackground(character);
  for (const [index, tool] of (background?.tools || []).entries()) {
    if (/^one artisan tool$/i.test(tool))
      add(
        `background:${background!.name}:${index}`,
        `${background!.name}: choose 1 ${character.backgroundVariant === "Guild Merchant" ? "artisan tool, navigator's tools, or additional language" : "artisan tool"}`,
        `Background: ${background!.name}`,
        character.backgroundVariant === "Guild Merchant"
          ? [
              ...artisanToolOptions,
              "Navigator's tools",
              "Additional language (Guild Merchant)",
            ]
          : artisanToolOptions,
        1,
      );
    else if (/^one gaming set$/i.test(tool))
      add(
        `background:${background!.name}:${index}`,
        `${background!.name}: choose 1 gaming set`,
        `Background: ${background!.name}`,
        gamingSetOptions,
        1,
      );
    else if (/^one musical instrument$/i.test(tool))
      add(
        `background:${background!.name}:${index}`,
        `${background!.name}: choose 1 musical instrument`,
        `Background: ${background!.name}`,
        musicalInstrumentOptions,
        1,
      );
  }
  if (character.race === "Dwarf")
    add(
      "race:Dwarf:tool",
      "Dwarf: choose 1 tool proficiency",
      "Race: Dwarf",
      ["Smith's tools", "Brewer's supplies", "Mason's tools"],
      1,
    );
  const fixed = fixedToolSources(character);
  const seen = new Set<string>();
  const reserved = new Set(fixed.map((item) => item.name.toLowerCase()));
  for (const item of fixed) {
    const key = item.name.toLowerCase();
    if (seen.has(key))
      add(
        `replacement:${item.key}`,
        `${item.source}: ${item.name} duplicates another tool proficiency; choose a replacement`,
        `${item.source} · duplicate proficiency replacement`,
        allToolOptions,
        1,
        item.className,
        item.classLevel,
        item.characterLevel,
      );
    seen.add(key);
  }
  return plans.map((plan) => ({
    ...plan,
    options: plan.options.filter(
      (option) => !reserved.has(option.toLowerCase()),
    ),
  }));
}

export type SkillReplacementPlan = {
  key: string;
  label: string;
  options: string[];
  count: number;
  stage: 4 | 5;
  source: string;
  className: string;
  classLevel: number | null;
  characterLevel: number | null;
};

export function skillReplacementPlans(
  character: Character,
): SkillReplacementPlan[] {
  const grants: {
    key: string;
    name: string;
    source: string;
    className: string;
    classLevel: number | null;
    characterLevel: number | null;
    stage: 4 | 5;
  }[] = [];
  const levels = classLevelCounts(character);
  const first = initialClass(character);
  const add = (
    key: string,
    name: string,
    source: string,
    className = "",
    classLevel: number | null = null,
    characterLevel: number | null = 1,
    stage: 4 | 5 = 4,
  ) => {
    if (skills.includes(name))
      grants.push({
        key,
        name,
        source,
        className,
        classLevel,
        characterLevel,
        stage,
      });
  };
  for (const plan of classSkillPlans(character))
    for (const [index, name] of (
      selectedClassSkills(character)[plan.className] || []
    ).entries())
      add(
        `class:${plan.className}:${index}`,
        name,
        `${plan.className} skill training`,
        plan.className,
        1,
        plan.className === first
          ? 1
          : classCharacterLevel(character, plan.className, 1),
      );
  (selectedBackground(character)?.skills || []).forEach((name, index) =>
    add(
      `background:${character.background}:${index}`,
      name,
      `Background: ${character.background}`,
    ),
  );
  (raceProfiles[character.race]?.passiveSkillProficiencies || []).forEach(
    (name, index) =>
      add(
        `race:${character.race}:fixed:${index}`,
        name,
        `Race: ${character.race}`,
      ),
  );
  const raceCount =
    character.race === "Half-Elf"
      ? 2
      : character.race === "Human" && character.subrace.includes("Variant")
        ? 1
        : 0;
  (character.raceSkills || [])
    .slice(0, raceCount)
    .forEach((name, index) =>
      add(
        `race:${character.race}:choice:${index}`,
        name,
        `Race: ${character.race}`,
      ),
    );
  const subSkills = (
    className: string,
    subclass: string,
    level: number,
    key: string,
  ) => {
    if (
      character.subclass[className] === subclass &&
      (levels[className] || 0) >= level
    )
      (
        character.subclassChoices?.[`${className}:${level}:${key}`] || []
      ).forEach((name, index) =>
        add(
          `subclass:${className}:${key}:${index}`,
          name,
          subclass,
          className,
          level,
          classCharacterLevel(character, className, level),
          5,
        ),
      );
  };
  subSkills("Bard", "College of Lore", 3, "lore-skills");
  subSkills("Cleric", "Knowledge Domain", 1, "knowledge-skills");
  subSkills("Cleric", "Nature Domain", 1, "nature-skill");
  for (const feat of activeFeatSelections(character))
    if (feat.name === "Skilled")
      (character.featOptions?.[feat.key] || []).forEach((name, index) =>
        add(
          `feat:${feat.key}:${index}`,
          name,
          "Feat: Skilled",
          feat.className,
          feat.classLevel,
          feat.characterLevel,
          5,
        ),
      );
  for (const [key, options] of Object.entries(activeSubclassChoices(character)))
    if (
      key.startsWith("Warlock:") &&
      key.includes(":invocations-") &&
      options.includes("Beguiling Influence") &&
      levels.Warlock >= Number(key.split(":")[1])
    )
      ["Deception", "Persuasion"].forEach((name, index) =>
        add(
          `invocation:${key}:${index}`,
          name,
          "Warlock: Beguiling Influence",
          "Warlock",
          Number(key.split(":")[1]),
          classCharacterLevel(character, "Warlock", Number(key.split(":")[1])),
          5,
        ),
      );
  grants.sort(
    (a, b) => (a.characterLevel ?? Infinity) - (b.characterLevel ?? Infinity),
  );
  const reserved = new Set<string>();
  const plans: SkillReplacementPlan[] = [];
  for (const grant of grants) {
    if (!reserved.has(grant.name)) {
      reserved.add(grant.name);
      continue;
    }
    const options = skills.filter((name) => !reserved.has(name));
    const key = `replacement:${grant.key}`;
    plans.push({
      key,
      label: `${grant.source}: ${grant.name} duplicates an earlier proficiency; choose a different skill`,
      options,
      count: 1,
      stage: grant.stage,
      source: grant.source,
      className: grant.className,
      classLevel: grant.classLevel,
      characterLevel: grant.characterLevel,
    });
    const chosen = character.skillReplacementChoices?.[key];
    if (options.includes(chosen)) reserved.add(chosen);
  }
  return plans;
}

export function featureCharacterLevel(
  character: Character,
  item: FeatureEntry,
): number | null {
  if (
    (item.sourceType !== "Class" && item.sourceType !== "Subclass") ||
    !item.className ||
    item.classLevel === null
  )
    return item.characterLevel;
  if (character.classMode === "single")
    return item.classLevel <= character.level ? item.classLevel : null;
  if (!Object.values(character.levelPath).some(Boolean))
    return item.characterLevel;
  let count = 0;
  for (let level = 1; level <= character.level; level++)
    if (
      character.levelPath[level] === item.className &&
      ++count === item.classLevel
    )
      return level;
  return null;
}

export function racialBonuses(character: Character): Record<string, number> {
  const sub = character.subrace;
  const bonus: Record<string, number> = {};
  const add = (ability: string, n: number) => {
    bonus[ability] = (bonus[ability] || 0) + n;
  };
  if (character.race === "Dwarf") {
    add("Constitution", 2);
    if (sub === "Hill Dwarf") add("Wisdom", 1);
    if (sub === "Mountain Dwarf") add("Strength", 2);
  }
  if (character.race === "Elf") {
    add("Dexterity", 2);
    if (sub === "High Elf") add("Intelligence", 1);
    if (sub === "Wood Elf") add("Wisdom", 1);
    if (sub.includes("Drow")) add("Charisma", 1);
  }
  if (character.race === "Halfling") {
    add("Dexterity", 2);
    if (sub === "Lightfoot") add("Charisma", 1);
    if (sub === "Stout") add("Constitution", 1);
  }
  if (character.race === "Human") {
    if (sub.includes("Variant"))
      [...new Set(character.flexBonuses)]
        .filter((a) => abilities.includes(a))
        .slice(0, 2)
        .forEach((a) => add(a, 1));
    else abilities.forEach((x) => add(x, 1));
  }
  if (character.race === "Dragonborn") {
    add("Strength", 2);
    add("Charisma", 1);
  }
  if (character.race === "Gnome") {
    add("Intelligence", 2);
    if (sub === "Forest Gnome") add("Dexterity", 1);
    if (sub === "Rock Gnome") add("Constitution", 1);
  }
  if (character.race === "Half-Elf") {
    add("Charisma", 2);
    [...new Set(character.flexBonuses)]
      .filter((a) => abilities.includes(a) && a !== "Charisma")
      .slice(0, 2)
      .forEach((a) => add(a, 1));
  }
  if (character.race === "Half-Orc") {
    add("Strength", 2);
    add("Constitution", 1);
  }
  if (character.race === "Tiefling") {
    add("Charisma", 2);
    add("Intelligence", 1);
  }
  return bonus;
}

function classCharacterLevel(
  character: Character,
  className: string,
  classLevel: number,
): number | null {
  if (character.classMode === "single")
    return className === character.classes[0] && classLevel <= character.level
      ? classLevel
      : null;
  if (!Object.values(character.levelPath).some(Boolean)) return null;
  let count = 0;
  for (let level = 1; level <= character.level; level++)
    if (character.levelPath[level] === className && ++count === classLevel)
      return level;
  return null;
}

export function derivedFeatureEntries(character: Character): FeatureEntry[] {
  const entries: FeatureEntry[] = [];
  const backgroundFeatures: Record<string, [string, string]> = {
    Acolyte: [
      "Shelter of the Faithful",
      "You can usually find aid and basic lodging at a temple of your faith. The faithful may help with healing, ritual needs, or messages, though costly aid and dangerous requests remain subject to the DM.",
    ],
    Charlatan: [
      "False Identity",
      "You have a second identity with supporting papers and established contacts. Details such as the identity's history and aliases should be agreed with the DM; a suspicious official or conflicting record can expose it.",
    ],
    "Criminal / Spy": [
      "Criminal Contact",
      "You have a trusted contact in a criminal network who can pass messages and connect you to other underworld figures. The contact's reach and willingness depend on the circumstances and the DM.",
    ],
    "Entertainer / Gladiator": [
      "By Popular Demand",
      "You can usually find a place to perform and receive modest lodging or food in return. Local attitudes, danger, and the nature of the performance can affect whether a venue accepts you.",
    ],
    "Folk Hero": [
      "Rustic Hospitality",
      "Common folk are inclined to shelter and assist you, often hiding you from pursuers or helping you recover. They will not automatically risk their lives or property.",
    ],
    "Guild Artisan / Merchant": [
      "Guild Membership",
      "Your guild can provide introductions, advice, and limited political or legal support. Membership also brings dues, obligations, and expectations of solidarity.",
    ],
    Hermit: [
      "Discovery",
      "Your isolation led to a significant discovery. Its exact nature is a character and DM decision, so it remains unresolved until recorded.",
    ],
    "Noble / Knight": [
      "Position of Privilege",
      "People who respect your station may offer an audience or favorable treatment. Your title does not guarantee obedience, access, or welcome everywhere.",
    ],
    Outlander: [
      "Wanderer",
      "You can recall general geography and find food and fresh water for yourself and a small group when the land provides them. This does not reveal hidden places or guarantee supplies in barren terrain.",
    ],
    Sage: [
      "Researcher",
      "You know how to pursue information through libraries, scholars, and other sources. Finding an answer may take time, money, access, or a lead, at the DM's discretion.",
    ],
    "Sailor / Pirate": [
      "Ship's Passage",
      "You can usually secure passage for yourself and companions on a ship with which you have a favorable connection. Routes, timing, capacity, and price depend on the vessel and DM.",
    ],
    Soldier: [
      "Military Rank",
      "Soldiers who recognize your service may defer to your rank and offer routine assistance. Your authority is limited by the chain of command, local politics, and the situation.",
    ],
    Urchin: [
      "City Secrets",
      "You know informal routes through familiar settlements, allowing you and companions to move between places faster when the DM agrees the route is usable.",
    ],
  };
  const bg = selectedBackground(character);
  let bgFeature = bg && backgroundFeatures[bg.name];
  if (bg && character.backgroundVariant === "Pirate")
    bgFeature = [
      "Bad Reputation",
      "People familiar with your reputation may overlook minor offenses, such as refusing payment at a tavern or breaking a shop door, because they fear you. The feature does not make serious crimes consequence-free, compel everyone to cooperate, or replace the DM's judgment about who recognizes and fears you.",
    ];
  if (bg && character.backgroundVariant === "Knight (Retainers)")
    bgFeature = [
      "Retainers",
      "With the DM's permission, three loyal commoner retainers serve you. They can perform ordinary noncombatant duties and carry out routine tasks, but do not fight, follow you into obviously dangerous places, or accept frequent abuse. Record each retainer's identity and agreed duties in Allies; this feature replaces Position of Privilege.",
    ];
  if (bg && bgFeature)
    entries.push({
      id: `derived-background-${bg.name}`,
      name: bgFeature[0],
      sourceType: "Background",
      sourceName: bg.name,
      className: "",
      classLevel: null,
      characterLevel: 1,
      description: bgFeature[1],
      uses: "Background feature; availability depends on the setting and DM.",
      sourceReference:
        "Player’s Handbook (2014), Chapter 4 — Personality and Background",
    });
  const feats = activeFeatSelections(character).map((feat) => ({
    ...feat,
    sourceName: feat.className
      ? `${feat.className} Ability Score Improvement`
      : "Variant Human",
  }));
  feats.forEach(
    ({ name, className, classLevel, characterLevel, sourceName }, index) => {
      const key = normalizeFeatureName(name);
      const featDescriptions: Record<string, string> = {
        greatweaponmaster:
          "When you score a critical hit or reduce a creature to 0 hit points with a melee weapon, you may make a melee weapon attack as a bonus action. Before an attack with a heavy melee weapon you are proficient with, you may choose the optional -5 attack / +10 damage mode; it is shown as a separate attack row so the player can choose when it applies.",
        sharpshooter:
          "Before an attack with a ranged weapon you are proficient with, you may choose the optional -5 attack / +10 damage mode; it is shown as a separate attack row. The feat also affects long-range attacks and cover, which remain encounter-specific.",
        polearmmaster:
          "The feat grants a conditional bonus-action attack with the opposite end of certain polearms and a reaction opportunity attack when a creature enters your reach. Exact trigger and weapon requirements should be checked against the PHB.",
      };
      const feat = findFeat(name);
      const featAbility = feat?.abilityChoice?.length
        ? character.asiChoices?.[`${className}:${classLevel}`]
            ?.abilities?.[0] ||
          (sourceName === "Variant Human" ? character.raceFeatAbility : "")
        : "";
      const decision = feat?.abilityChoice?.length
        ? feat.abilityChoice.includes(featAbility)
          ? `Ability increase: +1 ${featAbility}`
          : "Ability increase choice unresolved"
        : feat?.abilityFixed
          ? `Ability increase: +1 ${feat.abilityFixed}`
          : "";
      const conditional =
        feat?.prerequisite && feat.prerequisite !== "None"
          ? `Prerequisite: ${feat.prerequisite}.`
          : "";
      const featChoiceKey =
        sourceName === "Variant Human"
          ? "Variant Human"
          : `${className}:${classLevel}`;
      const chosenOptions = character.featOptions?.[featChoiceKey] || [];
      const specialChoice = feat?.choiceOptions?.length
        ? `${feat.choiceLabel || "Choice"}: ${chosenOptions.join(", ") || "unresolved"}`
        : "";
      entries.push({
        id: `derived-feat-${index}-${key}`,
        name,
        sourceType: "Feat",
        sourceName,
        className,
        classLevel,
        characterLevel,
        description:
          feat?.description ||
          featDescriptions[key] ||
          `Feat not found in the 2014 PHB catalog. Its effects and prerequisite need source review.`,
        uses:
          [
            conditional,
            decision,
            specialChoice,
            ["greatweaponmaster", "sharpshooter"].includes(key)
              ? "Conditional -5/+10 attack rows are generated when applicable; choose whether to use them for each attack."
              : "",
          ]
            .filter(Boolean)
            .join(" ") ||
          "Effect not fully automated; resolve the listed choice and record its use when applicable.",
        sourceReference: "Player’s Handbook (2014), Chapter 6 — Feats",
        sheet: {
          ...featFeatureSheetRule(name),
          notes: ["Linguist", "Skilled", "Weapon Master"].includes(name)
            ? []
            : chosenOptions,
        },
      });
      if (feat?.name === "Martial Adept")
        for (const maneuver of chosenOptions) {
          const plan = {
            key: "maneuvers-3",
            className: "Fighter",
            subclass: "Battle Master",
            unlockLevel: 3,
            title: "Combat Superiority Maneuvers",
            choose: 2,
            options: chosenOptions,
            help: "",
          };
          const detail = getChoiceOptionDetail(plan, maneuver);
          entries.push({
            id: `derived-feat-maneuver-${index}-${normalizeFeatureName(maneuver)}`,
            name: maneuver,
            sourceType: "Feat",
            sourceName: "Martial Adept",
            className,
            classLevel,
            characterLevel,
            description: detail.description,
            uses: `Martial Adept grants one shared d6 superiority die, recovered after a short or long rest. Save DC = 8 + proficiency bonus + STR or DEX modifier (${8 + proficiencyBonus(character.level) + Math.max(abilityModifier(finalAbilities(character).Strength), abilityModifier(finalAbilities(character).Dexterity))} using the higher score).`,
            sourceReference:
              detail.sourceReference ||
              "PHB (2014), Chapter 6 — Martial Adept; Chapter 3 — Battle Master",
          });
        }
    },
  );
  const ancestry = dragonbornAncestryFor(character.subrace, character.ancestry);
  raceTraitsFor(character.race, character.subrace).forEach((item, index) => {
    if (item.name === "Feat" && !character.featEnabled) return;
    let uses = item.optional ? "Optional rule; resolve with DM" : "";
    if (item.choice) {
      if (item.name === "Draconic Ancestry")
        uses = ancestry ? `Choice recorded: ${ancestry}` : "Choice unresolved";
      else if (item.name === "Ability Score Increases")
        uses =
          character.flexBonuses.length === 2
            ? `Choices recorded: ${character.flexBonuses.join(" and ")}`
            : "Two ability choices unresolved";
      else if (item.name === "Focused Ability Increases")
        uses =
          character.flexBonuses.length === 2
            ? `Choices recorded: ${character.flexBonuses.join(" and ")}`
            : "Two ability choices unresolved";
      else if (item.name === "Skill Proficiency")
        uses = character.raceSkills.length
          ? `Choice recorded: ${character.raceSkills[0]}`
          : "Skill choice unresolved";
      else if (item.name === "Skill Versatility")
        uses =
          character.raceSkills.length === 2
            ? `Choices recorded: ${character.raceSkills.join(" and ")}`
            : "Two skill choices unresolved";
      else if (item.name === "Extra Language")
        uses =
          "Choose a language; source is not individually tagged in the current language picker";
      else if (item.name === "Tool Proficiency") {
        const dwarfTool = character.toolChoices?.["race:Dwarf:tool"]?.[0];
        uses = dwarfTool
          ? `Choice recorded: ${dwarfTool}`
          : "Choose smith's tools, brewer's supplies, or mason's tools";
      } else if (item.name === "Tinker")
        uses =
          "Requires tinker's tools; record the chosen device with equipment";
      else if (item.name === "High Elf Cantrip") {
        const choices = (character.spellSelections || []).filter((pick) =>
          /high elf/i.test(pick.source),
        );
        const spell =
          choices.length === 1 ? findSpell(choices[0].spellId) : undefined;
        uses =
          spell?.level === 0 && spell.classes.includes("Wizard")
            ? `Choice recorded: ${spell.name}`
            : "Cantrip choice unresolved";
      } else if (
        item.name.includes("disciplines") ||
        item.name.includes("options")
      )
        uses = "Choose from the listed path options";
      else uses = "Choice required; record the exact option before play";
    }
    const activeLevel = character.level;
    const raceDescription =
      item.name === "Dwarven Toughness"
        ? `${item.description} At character level ${activeLevel}, this adds ${activeLevel} maximum hit points.`
        : item.name === "Breath Weapon" && character.race === "Dragonborn"
          ? `${item.description} At character level ${activeLevel}, this deals ${activeLevel >= 16 ? "5d6" : activeLevel >= 11 ? "4d6" : activeLevel >= 6 ? "3d6" : "2d6"} ${ancestry ? `${dragonDamageType(ancestry)} ` : "ancestry-type "}damage; save DC ${8 + proficiencyBonus(activeLevel) + abilityModifier(finalAbilities(character).Constitution)}. ${ancestry ? dragonBreathShape(ancestry) : "Breath shape unresolved until ancestry is chosen."}`
          : item.name === "Infernal Legacy"
            ? `${item.description} Available now: Thaumaturgy at will${activeLevel >= 3 ? "; Hellish Rebuke once per long rest, cast as a 2nd-level spell" : ""}${activeLevel >= 5 ? "; Darkness once per long rest" : ""}.`
            : item.name === "Drow Magic"
              ? `${item.description} Available now: Dancing Lights at will${activeLevel >= 3 ? "; Faerie Fire once per long rest" : ""}${activeLevel >= 5 ? "; Darkness once per long rest" : ""}.`
              : item.description;
    entries.push({
      id: `derived-race-${index}-${item.name}`,
      name: item.name,
      sourceType: "Race",
      sourceName: character.subrace || character.race,
      className: "",
      classLevel: null,
      characterLevel: 1,
      description: raceDescription,
      uses,
      sourceReference: "Player’s Handbook (2014), Chapter 2 — Races",
    });
  });
  const levels = classLevelCounts(character);
  const genericSubclassRows = new Set([
    "Path Feature",
    "Bard College Feature",
    "Divine Domain Feature",
    "Druid Circle Feature",
    "Martial Archetype Feature",
    "Monastic Tradition Feature",
    "Sacred Oath Feature",
    "Ranger Archetype Feature",
    "Roguish Archetype Feature",
    "Sorcerous Origin Feature",
    "Otherworldly Patron Feature",
    "Arcane Tradition Feature",
  ]);
  for (const [className, count] of Object.entries(levels)) {
    const tree = classProgression[className];
    if (!tree) continue;
    const selectedSubclass = selectedClass(className)?.subclasses.includes(
      character.subclass[className],
    )
      ? character.subclass[className]
      : "";
    const subByLevel = subclassFeatureLevels[selectedSubclass] || {};
    const currentRow = classLevelResources(
      className,
      tree.levels[Math.min(count, 20) - 1],
      selectedSubclass,
    );
    for (let classLevel = 1; classLevel <= Math.min(20, count); classLevel++) {
      const row = tree.levels[classLevel - 1];
      const characterLevel = classCharacterLevel(
        character,
        className,
        classLevel,
      );
      for (const item of row.features) {
        if (selectedSubclass && genericSubclassRows.has(item.name)) continue;
        if (
          item.name === "Unarmored Defense" &&
          firstUnarmoredDefense(character) !== className
        )
          continue;
        let uses = "";
        if (item.name === "Ability Score Improvement") {
          const choice = character.asiChoices?.[`${className}:${classLevel}`];
          uses = !choice
            ? "Choice unresolved"
            : choice.mode === "feat"
              ? `Feat: ${choice.feat || "name unresolved"}`
              : choice.mode === "plus2"
                ? `+2 ${choice.abilities[0] || "ability unresolved"}`
                : `+1 ${choice.abilities.join(" and ") || "ability choices unresolved"}`;
        }
        const description = classFeatureDescription(
          character,
          className,
          classLevel,
          count,
          item.name,
          item.description,
          currentRow,
        );
        if (item.name === "Expertise") {
          const selected =
            character.expertiseChoices?.[`${className}:${classLevel}`] || [];
          uses = selected.length
            ? `Expertise recorded: ${selected.join(", ")}`
            : "Choose two proficiencies (skills or tools); selection unresolved";
        }
        const decision = choicePlanForFeature(
          className,
          selectedSubclass,
          classLevel,
          item.name,
        );
        if (decision && !uses) {
          const key = `${className}:${decision.unlockLevel}:${decision.key}`;
          const selected = character.subclassChoices?.[key] || [];
          uses = `${decision.title}: ${selected.length ? selected.join(", ") : "choice unresolved"} (${selected.length}/${decision.choose})`;
        }
        entries.push({
          id: `derived-class-${className}-${classLevel}-${item.name}`,
          name: item.name,
          sourceType: "Class",
          sourceName: className,
          className,
          classLevel,
          characterLevel,
          description,
          uses,
          sourceReference: `Player’s Handbook (2014), Chapter 3 — ${className}`,
          sheet: {
            ...classFeatureSheetRule(item.name, className, count),
            ...(classFeatureSheetRule(item.name, className, count)
              .useCurrentText && description.startsWith(`${item.description} `)
              ? {
                  description: description
                    .slice(item.description.length)
                    .trim(),
                }
              : {}),
          },
        });
      }
      for (const [unlock, names] of Object.entries(subByLevel))
        if (Number(unlock) === classLevel)
          for (const name of names) {
            const plan = choicePlanForFeature(
              className,
              selectedSubclass,
              classLevel,
              name,
            );
            const selectionKey = plan
              ? `${className}:${plan.unlockLevel}:${plan.key}`
              : "";
            const selected = selectionKey
              ? character.subclassChoices?.[selectionKey] || []
              : [];
            const uses = plan
              ? `${plan.title}: ${selected.length ? selected.join(", ") : "choice unresolved"} (${selected.length}/${plan.choose})`
              : /choose|option|discipline|spirit|land/i.test(name)
                ? "Selection required; see subclass choices"
                : "";
            entries.push({
              id: `derived-subclass-${className}-${classLevel}-${name}`,
              name,
              sourceType: "Subclass",
              sourceName: selectedSubclass,
              className,
              classLevel,
              characterLevel,
              description: subclassFeatureDescription(
                character,
                className,
                selectedSubclass,
                Number(unlock),
                name,
              ),
              uses,
              sourceReference: subclassCatalog[selectedSubclass]?.source,
            });
          }
    }
  }
  for (const [className, count] of Object.entries(levels)) {
    const selectedSubclass = selectedClass(className)?.subclasses.includes(
      character.subclass[className],
    )
      ? character.subclass[className]
      : "";
    for (const plan of getSubclassChoicePlans(
      className,
      selectedSubclass,
      count,
      character.subclassChoices,
    ))
      for (const option of character.subclassChoices?.[
        `${className}:${plan.unlockLevel}:${plan.key}`
      ] || []) {
        if (
          !(plan.allowCustom
            ? Boolean(option.trim())
            : plan.options.includes(option))
        )
          continue;
        const detail = getChoiceOptionDetail(plan, option);
        const fromClass =
          /^(fighting-style-|invocations-|metamagic-|favored-)/.test(
            plan.key,
          ) || plan.key === "pact-boon";
        entries.push({
          id: `derived-choice-${className}-${plan.unlockLevel}-${plan.key}-${normalizeFeatureName(option)}`,
          name: option,
          sourceType: fromClass ? "Class" : "Subclass",
          sourceName: fromClass ? className : selectedSubclass,
          className,
          classLevel: plan.unlockLevel,
          characterLevel: classCharacterLevel(
            character,
            className,
            plan.unlockLevel,
          ),
          description: detail.description,
          uses: detail.reason || `Selected for ${plan.title}`,
          sourceReference:
            detail.sourceReference ||
            `Player’s Handbook (2014), Chapter 3 — ${className}: ${fromClass ? plan.title : selectedSubclass}`,
        });
      }
  }
  return entries.map((entry) => ({
    ...entry,
    sheet:
      entry.sheet ||
      (entry.sourceType === "Race"
        ? raceFeatureSheetRule(entry.name)
        : entry.sourceType === "Feat"
          ? featFeatureSheetRule(entry.name)
          : entry.sourceType === "Class" || entry.sourceType === "Subclass"
            ? classFeatureSheetRule(
                entry.name,
                entry.className,
                levels[entry.className] || 0,
              )
            : { section: "features" as const }),
  }));
}

export function featureEntriesForSheet(character: Character): FeatureEntry[] {
  const generated = derivedFeatureEntries(character);
  const manual = character.featureEntries.map((item) => ({
    ...item,
    characterLevel: featureCharacterLevel(character, item),
  }));
  const used = new Set<string>();
  const merged = generated.map((item) => {
    const match = manual.find(
      (note) =>
        !used.has(note.id) &&
        note.sourceType === item.sourceType &&
        (note.className || note.sourceName) ===
          (item.className || item.sourceName) &&
        note.classLevel === item.classLevel &&
        normalizeFeatureName(note.name) === normalizeFeatureName(item.name),
    );
    if (!match) return item;
    used.add(match.id);
    const importedDescription = match.description.trim();
    const noteMarker = "Imported sheet note:";
    const extra = importedDescription.includes(noteMarker)
      ? importedDescription
          .slice(
            importedDescription.lastIndexOf(noteMarker) + noteMarker.length,
          )
          .trim()
      : importedDescription;
    const base = item.description.trim();
    const description =
      extra && normalizeFeatureName(extra) !== normalizeFeatureName(base)
        ? [base, `Imported sheet note: ${extra}`].filter(Boolean).join("\n\n")
        : item.description;
    return { ...item, description, uses: item.uses || match.uses };
  });
  return [...merged, ...manual.filter((item) => !used.has(item.id))];
}

function normalizeFeatureName(value: string) {
  return value
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function classFeatureDescription(
  character: Character,
  className: string,
  gainedAt: number,
  currentLevel: number,
  name: string,
  base: string,
  current: ClassLevel,
): string {
  const final = finalAbilities(character);
  const pb = proficiencyBonus(character.level);
  const dex = abilityModifier(final.Dexterity);
  const wis = abilityModifier(final.Wisdom);
  const con = abilityModifier(final.Constitution);
  const char = abilityModifier(final.Charisma);
  const spellAbility =
    classTraining[className]?.spellAbility ||
    (className === "Monk"
      ? "Wisdom"
      : className === "Wizard" ||
          character.subclass[className] === "Eldritch Knight" ||
          character.subclass[className] === "Arcane Trickster"
        ? "Intelligence"
        : "Charisma");
  const saveAbility =
    spellAbility === "Wisdom"
      ? wis
      : spellAbility === "Intelligence"
        ? abilityModifier(final.Intelligence)
        : char;
  const saveDC = 8 + pb + saveAbility;
  const spellSlots = current.spellSlots?.length
    ? current.spellSlots
        .map(
          (count, index) => `${index + 1}${ordinal(index + 1)}-level ${count}`,
        )
        .join(", ")
    : "no standard spell slots";
  const currentText = `Current at ${className} level ${currentLevel}`;
  if (name === "Ability Score Improvement") {
    const choice = character.asiChoices?.[`${className}:${gainedAt}`];
    const after =
      classCharacterLevel(character, className, gainedAt) ?? character.level;
    const scoresAt = finalAbilities(character, after);
    const effect = !choice
      ? "Choose +2 to one ability, +1 to each of two different abilities, or a PHB feat if enabled; choice unresolved."
      : choice.mode === "feat"
        ? `Feat selected: ${choice.feat || "name unresolved"}.`
        : choice.mode === "plus2" && choice.abilities[0]
          ? `+2 ${choice.abilities[0]} (score ${scoresAt[choice.abilities[0]]}).`
          : choice.mode === "split"
            ? `${choice.abilities.map((ability) => `+1 ${ability} (score ${scoresAt[ability] ?? "?"})`).join("; ")}.`
            : "Ability increase choice is incomplete.";
    return `${base} ${effect}`;
  }
  if (name === "Rage")
    return `${base} While raging, gain advantage on Strength checks and saves, add +${current.rageDamage} damage to Strength-based melee weapon attacks, and resist bludgeoning, piercing, and slashing damage. ${currentText}: ${current.rageUses === "Unlimited" ? "unlimited uses" : `${current.rageUses} uses per long rest`}. Heavy armor prevents Rage benefits.`;
  if (name === "Bardic Inspiration")
    return `${base} ${currentText}: ${current.bardicInspirationDie} die and ${Math.max(1, char)} use(s) per long rest${currentLevel >= 5 ? "; uses return on a short or long rest" : ""}.`;
  if (name === "Song of Rest")
    return `${base} Its extra healing die is ${currentLevel >= 17 ? "d12" : currentLevel >= 13 ? "d10" : currentLevel >= 9 ? "d8" : "d6"} at ${currentText}; applies after a short rest when allies spend Hit Dice.`;
  if (name === "Channel Divinity")
    return `${base} ${currentText}: ${current.channelDivinityUses} use(s) between rests; you regain uses after a short or long rest. The specific effect depends on your domain and the option chosen.`;
  if (name === "Destroy Undead")
    return `${base} At ${currentText}, Turn Undead destroys affected undead of CR ${current.destroyUndeadCR} or lower instead of merely turning them.`;
  if (name === "Wild Shape")
    return `${base} ${currentText}: ${currentLevel >= 20 ? "unlimited uses" : `${current.wildShapeUses} uses per short or long rest`}; maximum beast CR ${current.wildShapeCR}; ${(current.wildShapeLimits || "form restrictions not recorded").toLowerCase()}.`;
  if (name === "Fighting Style")
    return `${base} Selected style: ${(character.subclassChoices?.[`${className}:${gainedAt}:fighting-style-${gainedAt}`] || []).join(", ") || "unresolved"}. It cannot be selected twice if another feature grants a style.`;
  if (name === "Second Wind")
    return `${base} As a bonus action, regain 1d10 + fighter level (${currentLevel}) hit points; one use returns on a short or long rest.`;
  if (name === "Action Surge")
    return `${base} ${currentText}: ${current.actionSurgeUses} use(s) per short or long rest; take one additional action on your turn.`;
  if (name === "Indomitable")
    return `${base} ${currentText}: ${current.indomitableUses} use(s) per long rest to reroll a failed saving throw.`;
  if (name === "Extra Attack") {
    const attacks =
      className === "Bard" &&
      character.subclass.Bard === "College of Valor" &&
      currentLevel >= 6
        ? 2
        : current.extraAttacks;
    return `${base} ${currentText}: ${attacks} attacks when you take the Attack action.`;
  }
  if (name === "Brutal Critical")
    return `${base} On a melee weapon critical hit, roll ${currentLevel >= 17 ? 3 : currentLevel >= 13 ? 2 : 1} additional weapon damage die(s).`;
  if (name === "Sneak Attack")
    return `${base} ${currentText}: ${current.sneakAttackDice}d6 extra damage once per turn on a qualifying finesse or ranged weapon attack.`;
  if (name === "Unarmored Defense" && className === "Monk")
    return `While wearing no armor and wielding no shield, AC = 10 + DEX (${formatMod(dex)}) + WIS (${formatMod(wis)}) = ${10 + dex + wis}.`;
  if (name === "Unarmored Defense" && className === "Barbarian")
    return `While wearing no armor, AC = 10 + DEX (${formatMod(dex)}) + CON (${formatMod(con)}) = ${10 + dex + con}. A shield can add its bonus. If you already gained Unarmored Defense from another class, multiclassing does not grant this version.`;
  if (name === "Martial Arts")
    return `${base} ${currentText}: damage die ${current.martialArtsDie}. While unarmored, without a shield, and unarmed or wielding only monk weapons, choose STR or DEX for unarmed strikes and monk weapons. You may replace the normal damage die with the Martial Arts die when it is better. After taking the Attack action with an unarmed strike or monk weapon, you may make one unarmed strike as a bonus action.`;
  if (name === "Ki")
    return `${base} ${currentText}: ${current.kiPoints} ki points; regain all after a short or long rest. Spend 1 ki for Flurry of Blows (two unarmed strikes as a bonus action after the Attack action), Patient Defense (Dodge as a bonus action), or Step of the Wind (Dash or Disengage as a bonus action and double jump distance). Ki save DC ${8 + pb + wis} = 8 + proficiency bonus ${pb} + WIS modifier ${formatMod(wis)}.`;
  if (
    name === "Unarmored Movement" ||
    name === "Unarmored Movement Improvement"
  )
    return `${base} ${currentText}: walking speed +${current.unarmoredMovement} ft. while wearing no armor and wielding no shield.${currentLevel >= 9 ? " At monk level 9, you can also move along vertical surfaces and across liquids during your turn." : ""}`;
  if (name === "Deflect Missiles")
    return `${base} Reaction: reduce ranged weapon attack damage by 1d10 + monk level (${currentLevel}) + DEX modifier (${formatMod(dex)}), currently 1d10 + ${currentLevel + dex}. If reduced to 0, you can catch it if one hand is free; spend 1 ki to make a ranged attack with it.`;
  if (name === "Slow Fall")
    return `${base} Reaction: reduce falling damage by ${5 * currentLevel} while you are not incapacitated.`;
  if (name === "Stunning Strike")
    return `${base} After a melee weapon attack hits, spend 1 ki; target makes a CON save against DC ${saveDC} (8 + proficiency bonus ${pb} + WIS modifier ${formatMod(wis)}) or is stunned until the end of your next turn.`;
  if (name === "Evasion")
    return `${base} On a successful DEX save against an effect that normally deals half damage on a success, take none; on a failed save, take half.`;
  if (name === "Lay on Hands")
    return `${base} ${currentText}: healing pool ${current.layOnHandsPool} HP per long rest. Spend 5 HP to cure one disease or neutralize one poison instead of healing.`;
  if (name === "Divine Smite")
    return `${base} After a melee weapon hit, expend a spell slot to deal 2d8 radiant damage with a 1st-level slot, plus 1d8 per slot level above 1st, to a maximum of 5d8. Add 1d8 against undead or fiends, increasing the maximum to 6d8. A higher-level slot does not increase the damage beyond that cap.`;
  if (name === "Divine Sense")
    return `${base} ${currentText}: ${Math.max(1, 1 + char)} use(s) per long rest; detect qualifying celestials, fiends, undead, and consecrated or desecrated places within range.`;
  if (name === "Aura of Protection")
    return `${base} While conscious, you and nearby allies add your CHA modifier (minimum +1; current ${formatMod(Math.max(1, char))}) to saving throws; current aura range ${current.auraRange} ft.`;
  if (name === "Aura of Courage")
    return `${base} While conscious, you and nearby allies cannot be frightened; current aura range ${current.auraRange} ft.`;
  if (name === "Sneak Attack")
    return `${base} ${currentText}: ${current.sneakAttackDice}d6 extra damage once per turn on a qualifying finesse or ranged weapon attack.`;
  if (name === "Expertise")
    return `${base} Double your proficiency bonus for the selected proficient skills or tools. The choices and resulting bonuses are shown with proficiencies.`;
  if (name === "Spellcasting") {
    const casterAbility =
      classTraining[className]?.spellAbility || "class spellcasting ability";
    const abilityMod =
      casterAbility === "Wisdom"
        ? wis
        : casterAbility === "Intelligence"
          ? abilityModifier(final.Intelligence)
          : char;
    const spellCount =
      current.spellsKnown !== undefined
        ? `${current.spellsKnown} spells known`
        : className === "Wizard"
          ? `prepare up to ${Math.max(1, abilityMod + currentLevel)} spells; spellbook begins with 6 and normally gains 2 wizard spells per level`
          : `prepare up to ${Math.max(1, abilityMod + currentLevel)} spells`;
    const extra =
      className === "Paladin"
        ? `prepare up to ${Math.max(1, abilityMod + Math.floor(currentLevel / 2))} paladin spells`
        : spellCount;
    return `${base} ${currentText}: ${current.cantripsKnown ?? 0} cantrips; ${spellSlots}. Spellcasting ability: ${casterAbility}; save DC ${8 + pb + abilityMod}, spell attack ${formatMod(pb + abilityMod)}. ${extra}.`;
  }
  if (name === "Divine Intervention")
    return `${base} Request direct divine aid. At ${currentText}, the d100 succeeds on a roll equal to or below your cleric level (${currentLevel}); after a success, wait 7 days before trying again. After a failure, wait until a long rest.`;
  if (name === "Spell Mastery")
    return `${base} Selected spells: ${
      (character.spellSelections || [])
        .filter((pick) => pick.source === "Spell Mastery")
        .map((pick) => findSpell(pick.spellId)?.name || pick.spellId)
        .join(", ") || "unresolved"
    }.`;
  if (name === "Arcane Recovery")
    return `${base} Once per day after a short rest, recover spell slots totaling up to ${current.arcaneRecoveryLevels} levels; no slot can be 6th level or higher.`;
  if (name === "Eldritch Invocations")
    return `${base} ${currentText}: choose ${current.invocationsKnown} invocations. Prerequisites and choices must be checked individually.`;
  if (name === "Pact Magic")
    return `${base} ${currentText}: ${current.pactSlots} pact slot(s), each ${current.pactSlotLevel || 1}${ordinal(current.pactSlotLevel || 1)} level; all recharge on a short or long rest.`;
  if (name === "Mystic Arcanum") {
    const spellLevel =
      gainedAt >= 17 ? 9 : gainedAt >= 15 ? 8 : gainedAt >= 13 ? 7 : 6;
    return `${base} Granted at Warlock level ${gainedAt}: one ${spellLevel}${ordinal(spellLevel)}-level warlock spell, usable once per long rest without a pact slot.`;
  }
  if (name === "Font of Magic")
    return `${base} ${currentText}: ${current.sorceryPoints} sorcery points; regain them on a long rest.`;
  if (name === "Metamagic")
    return `${base} Choose metamagic options to alter spells by spending sorcery points; current pool ${current.sorceryPoints}. Record selected options separately.`;
  if (name === "Wild Shape Improvement")
    return `${base} ${currentText}: maximum beast CR ${current.wildShapeCR}; ${(current.wildShapeLimits || "form restrictions not recorded").toLowerCase()}.`;
  if (name === "Timeless Body" && className === "Druid")
    return `At druid level 18, for every 10 years that pass, your body ages only 1 year. This feature does not grant immunity to magical aging.`;
  if (name === "Timeless Body" && className === "Monk")
    return `At monk level 15, no longer suffer the frailty of old age or magical aging, and no longer need food or water. You can still die of old age.`;
  if (name === "Primal Champion")
    return `${base} Your Strength and Constitution scores each increase by 4, and their maximums become 24.`;
  if (
    className === "Ranger" &&
    name === "Favored Enemy and Natural Explorer Improvements"
  )
    return `${base} ${currentText}: favored enemies ${current.favoredEnemyCount}; favored terrains ${current.favoredTerrainCount}. Choose and record the added enemy, terrain, and associated language.`;
  if (
    className === "Ranger" &&
    (name === "Favored Enemy" || name.includes("Favored Enemy"))
  )
    return `${base} ${currentText}: choose ${current.favoredEnemyCount} favored enemy group(s); each selection also grants an associated language. Record choices separately.`;
  if (className === "Ranger" && name.includes("Natural Explorer"))
    return `${base} ${currentText}: choose ${current.favoredTerrainCount} favored terrain(s); record each terrain separately.`;
  if (className === "Wizard" && name === "Arcane Tradition")
    return `${base} Your school choice grants features at wizard levels 2, 6, 10, and 14. Current spellbook and prepared-spell count: 6 + 2 per wizard level from level-up choices, plus found/copy spells; prepare up to ${Math.max(1, abilityModifier(final.Intelligence) + currentLevel)} spells per day. Spell slots: ${spellSlots}.`;
  if (
    name === "Bard College" ||
    name === "Divine Domain" ||
    name === "Druid Circle" ||
    name === "Martial Archetype" ||
    name === "Monastic Tradition" ||
    name === "Sacred Oath" ||
    name === "Ranger Archetype" ||
    name === "Roguish Archetype" ||
    name === "Sorcerous Origin" ||
    name === "Otherworldly Patron" ||
    name === "Arcane Tradition"
  )
    return `${base} Selected path: ${character.subclass[className] || "unresolved"}. It unlocks additional features at the class levels shown in the subclass tree.`;
  return base;
}

function subclassFeatureDescription(
  character: Character,
  className: string,
  subclass: string,
  unlockLevel: number,
  name: string,
): string {
  const pb = proficiencyBonus(character.level);
  const final = finalAbilities(character);
  const wis = abilityModifier(final.Wisdom);
  const cha = abilityModifier(final.Charisma);
  const int = abilityModifier(final.Intelligence);
  const abilityMod =
    classTraining[className]?.spellAbility === "Wisdom" || className === "Monk"
      ? wis
      : classTraining[className]?.spellAbility === "Intelligence" ||
          ["Eldritch Knight", "Arcane Trickster"].includes(subclass)
        ? int
        : cha;
  const dc = 8 + pb + abilityMod;
  const unlock = `${className} level ${unlockLevel}${ordinal(unlockLevel)}`;
  const selectedPath = `${subclass} grants this feature at ${unlock}.`;
  if (name === "Bonus Proficiency" && subclass === "Life Domain")
    return `${selectedPath} Gain proficiency with heavy armor.`;
  if (name === "Bonus Proficiency" && subclass === "Nature Domain")
    return `${selectedPath} Gain proficiency with heavy armor. The skill and druid cantrip choices come from Acolyte of Nature.`;
  if (name === "Bonus Proficiencies" && subclass === "College of Lore")
    return `${selectedPath} Choose any three skills and gain proficiency in them.`;
  if (name === "Bonus Proficiencies" && subclass === "College of Valor")
    return `${selectedPath} Gain proficiency with medium armor, shields, and martial weapons.`;
  if (
    name === "Bonus Proficiencies" &&
    ["Tempest Domain", "War Domain"].includes(subclass)
  )
    return `${selectedPath} Gain proficiency with martial weapons and heavy armor.`;
  if (name === "Bonus Cantrip" && subclass === "Light Domain")
    return `${selectedPath} Learn the Light cantrip; it counts as a cleric cantrip for you.`;
  if (name === "Bonus Cantrip" && subclass === "Circle of the Land")
    return `${selectedPath} Choose one additional druid cantrip. It does not count against your cantrips known.`;
  if (subclass === "Way of the Open Hand" && name === "Open Hand Technique")
    return `${selectedPath} When a Flurry of Blows attack hits, choose one effect: force a DEX save (DC ${dc}) or knock the target prone; force a STR save (DC ${dc}) or push it up to 15 feet; or prevent its reactions until the end of your next turn.`;
  if (subclass === "Way of the Open Hand" && name === "Wholeness of Body")
    return `${selectedPath} Use an action to regain ${3 * (classLevelCounts(character).Monk || unlockLevel)} hit points; once per long rest.`;
  if (subclass === "Way of the Open Hand" && name === "Tranquility")
    return `${selectedPath} After a long rest, you gain the effect of Sanctuary until your next long rest; it ends early if you attack or cast a spell that affects an enemy.`;
  if (subclass === "Way of the Open Hand" && name === "Quivering Palm")
    return `${selectedPath} Spend 3 ki after a hit to set a lethal vibration in the target. While within the feature's limits, use an action to end it: the target makes a CON save (DC ${dc}); on a failure it drops to 0 hit points, and on a success it takes 10d10 necrotic damage.`;
  if (subclass === "Way of Shadow" && name === "Shadow Arts")
    return `${selectedPath} Spend 2 ki to cast Darkness, Darkvision, Pass without Trace, or Silence without material components; you also learn Minor Illusion.`;
  if (subclass === "Way of Shadow" && name === "Shadow Step")
    return `${selectedPath} While in dim light or darkness, teleport up to 60 feet to another dim or dark space you can see; your next melee attack before the end of the turn has advantage.`;
  if (subclass === "Way of Shadow" && name === "Cloak of Shadows")
    return `${selectedPath} Use an action in dim light or darkness to become invisible until you attack, cast a spell, or enter bright light.`;
  if (subclass === "Way of Shadow" && name === "Opportunist")
    return `${selectedPath} Use your reaction to make a melee attack when a creature within 5 feet is hit by an attack from someone other than you.`;
  if (name === "Extra Attack" && subclass === "College of Valor")
    return `${selectedPath} You can attack twice, instead of once, whenever you take the Attack action.`;
  if (
    name === "Spellcasting" &&
    (subclass === "Eldritch Knight" || subclass === "Arcane Trickster")
  )
    return `${selectedPath} Learn a limited set of wizard spells. Intelligence is your spellcasting ability; current spell save DC ${dc}, spell attack ${formatMod(pb + int)}. Spell choices and the subclass spell table still need review.`;
  if (subclass === "Draconic Bloodline" && name === "Draconic Resilience")
    return `${selectedPath} Your hit point maximum increases by 1 per sorcerer level; while unarmored, AC is 13 + DEX modifier (${formatMod(abilityModifier(final.Dexterity))}).`;
  if (subclass === "Draconic Bloodline" && name === "Elemental Affinity")
    return `${selectedPath} Add your CHA modifier (${formatMod(cha)}) to one damage roll of a spell matching your ancestry's damage type; spend 1 sorcery point for resistance to that type for 1 hour.`;
  if (subclass === "The Fiend" && name === "Dark One's Blessing")
    return `${selectedPath} When you reduce a hostile creature to 0 HP, gain temporary HP equal to your CHA modifier (${formatMod(cha)}) + warlock level (${classLevelCounts(character).Warlock || 1}), minimum 1.`;
  if (subclass === "School of Abjuration" && name === "Arcane Ward")
    return `${selectedPath} Create a ward with ${Math.max(1, 2 * (classLevelCounts(character).Wizard || unlockLevel) + int)} hit points (2 × wizard level + INT modifier). It absorbs damage before you do and regains HP when you cast an abjuration spell.`;
  if (subclass === "School of Divination" && name === "Portent")
    return `${selectedPath} Roll two d20s after a long rest and record the results; replace an attack roll, save, or ability check by you or a visible creature with one of those rolls.`;
  return `${selectedPath} ${getSubclassFeatureDetail(subclass, name)}`;
}

function dragonDamageType(ancestry: string) {
  return dragonbornAncestries[ancestry]?.damageType || "";
}

function dragonBreathShape(ancestry: string) {
  const option = dragonbornAncestries[ancestry];
  return option
    ? `${option.shape}; ${option.save} save`
    : "Breath shape unresolved";
}

function ordinal(level: number) {
  return level % 10 === 1 && level % 100 !== 11
    ? "st"
    : level % 10 === 2 && level % 100 !== 12
      ? "nd"
      : level % 10 === 3 && level % 100 !== 13
        ? "rd"
        : "th";
}

export function activeFeatSelections(character: Character) {
  if (!character.featEnabled) return [];
  const levels = classLevelCounts(character);
  const selections: {
    name: string;
    key: string;
    className: string;
    classLevel: number | null;
    characterLevel: number | null;
  }[] = [];
  if (
    character.race === "Human" &&
    character.subrace.includes("Variant") &&
    character.raceFeat
  )
    selections.push({
      name: findFeat(character.raceFeat)?.name || character.raceFeat,
      key: "Variant Human",
      className: "",
      classLevel: null,
      characterLevel: 1,
    });
  for (const [key, choice] of Object.entries(character.asiChoices || {})) {
    const split = key.lastIndexOf(":");
    const className = key.slice(0, split);
    const classLevel = Number(key.slice(split + 1));
    if (
      choice.mode !== "feat" ||
      !choice.feat ||
      !classProgression[className]?.levels[classLevel - 1]?.asi ||
      classLevel > (levels[className] || 0)
    )
      continue;
    selections.push({
      name: findFeat(choice.feat)?.name || choice.feat,
      key,
      className,
      classLevel,
      characterLevel: classCharacterLevel(character, className, classLevel),
    });
  }
  return selections;
}

/** Selectable spell sources use current class levels, lineage and active feats. */
export function spellChoiceSources(character: Character): string[] {
  const levels = classLevelCounts(character);
  const branches = activeSubclassChoices(character);
  const sources = Object.entries(levels)
    .filter(([name, level]) => {
      const casting = classTraining[name]?.casting;
      return (
        ((casting === "full" || casting === "pact") && level >= 1) ||
        (casting === "half" && level >= 2) ||
        (name === "Fighter" &&
          character.subclass.Fighter === "Eldritch Knight" &&
          level >= 3) ||
        (name === "Rogue" &&
          character.subclass.Rogue === "Arcane Trickster" &&
          level >= 3)
      );
    })
    .map(([name]) => name);
  if (character.race === "Elf" && character.subrace === "High Elf")
    sources.push("High Elf");
  if (character.subclass.Cleric === "Nature Domain" && levels.Cleric >= 1)
    sources.push("Nature Domain");
  if (character.subclass.Druid === "Circle of the Land" && levels.Druid >= 2)
    sources.push("Circle of the Land");
  if (branches["Warlock:3:pact-boon"]?.includes("Pact of the Tome")) {
    sources.push("Pact of the Tome");
    if (
      Object.entries(branches).some(
        ([key, values]) =>
          key.includes(":invocations-") &&
          values.includes("Book of Ancient Secrets"),
      )
    )
      sources.push("Book of Ancient Secrets");
  }
  for (const level of [10, 14, 18])
    if (levels.Bard >= level) sources.push(`Magical Secrets: Bard ${level}`);
  if (character.subclass.Bard === "College of Lore" && levels.Bard >= 6)
    sources.push("Additional Magical Secrets");
  if (levels.Wizard >= 18) sources.push("Spell Mastery");
  if (levels.Wizard >= 20) sources.push("Signature Spells");
  for (const feat of activeFeatSelections(character)) {
    const list = character.featOptions?.[feat.key]?.[0];
    if (
      ["Magic Initiate", "Ritual Caster", "Spell Sniper"].includes(feat.name) &&
      list
    )
      sources.push(`${feat.name}: ${list}`);
  }
  return [...new Set(sources)];
}

/** Retained choices stay editable, but unavailable sources/levels grant no spell. */
export function isSpellChoiceAvailable(
  character: Character,
  pick: SpellSelection,
): boolean {
  const spell = findSpell(pick.spellId);
  if (
    !spell ||
    !spellChoiceSources(character).includes(pick.source) ||
    (pick.acquiredLevel !== undefined &&
      (pick.acquiredLevel < 1 || pick.acquiredLevel > character.level))
  )
    return false;
  const levels = classLevelCounts(character);
  if (levels[pick.source]) {
    const name = pick.source;
    const level = levels[name];
    const list = ["Fighter", "Rogue"].includes(name) ? "Wizard" : name;
    const row = classProgression[name].levels[level - 1];
    const maximum =
      name === "Warlock"
        ? row.pactSlotLevel || 0
        : ["Fighter", "Rogue"].includes(name)
          ? Math.floor((level - 1) / 6) + 1
          : row.spellSlots?.length || 0;
    if (name === "Warlock" && pick.status === "arcanum")
      return (
        spell.classes.includes("Warlock") &&
        spell.level >= 6 &&
        spell.level <= 9 &&
        level >= 11 + (spell.level - 6) * 2
      );
    return (
      spell.level <= maximum &&
      (spell.classes.includes(list) ||
        (name === "Warlock" && isPatronSpell(character, spell.name)))
    );
  }
  if (pick.source === "High Elf")
    return spell.level === 0 && spell.classes.includes("Wizard");
  if (["Nature Domain", "Circle of the Land"].includes(pick.source))
    return spell.level === 0 && spell.classes.includes("Druid");
  if (pick.source === "Pact of the Tome") return spell.level === 0;
  if (pick.source === "Book of Ancient Secrets")
    return (
      Boolean(spell.ritual) &&
      spell.level >= 1 &&
      spell.level <= Math.ceil(levels.Warlock / 2)
    );
  if (pick.source === "Additional Magical Secrets") return spell.level <= 3;
  if (pick.source.startsWith("Magical Secrets: Bard "))
    return (
      spell.level <=
      ({ 10: 5, 14: 7, 18: 9 }[Number(pick.source.split("Bard ")[1])] || 0)
    );
  if (pick.source === "Spell Mastery")
    return spell.level === 1 || spell.level === 2;
  if (pick.source === "Signature Spells") return spell.level === 3;
  const [feat, list] = pick.source.split(": ");
  if (!spell.classes.includes(list)) return false;
  if (feat === "Magic Initiate") return spell.level <= 1;
  if (feat === "Spell Sniper")
    return spell.level === 0 && Boolean(spell.attack);
  return (
    feat === "Ritual Caster" &&
    Boolean(spell.ritual) &&
    spell.level >= 1 &&
    spell.level <= Math.ceil(character.level / 2)
  );
}

export function abilityContributions(
  character: Character,
  throughCharacterLevel = character.level,
) {
  const final = finalAbilities(character, throughCharacterLevel);
  const ancestry = character.scoresAreFinal ? {} : racialBonuses(character);
  return Object.fromEntries(
    abilities.map((name) => [
      name,
      {
        base: Number(character.baseAbilities[name]) || 8,
        ancestry: ancestry[name] || 0,
        advancement:
          final[name] -
          (Number(character.baseAbilities[name]) || 8) -
          (ancestry[name] || 0),
        importedFinal: character.scoresAreFinal,
        total: final[name],
      },
    ]),
  );
}

export function finalAbilities(
  character: Character,
  throughCharacterLevel = character.level,
) {
  const bonus = character.scoresAreFinal ? {} : racialBonuses(character);
  const increases: Record<string, number> = {};
  const levels = classLevelCounts(character);
  for (const [key, choice] of Object.entries(character.asiChoices || {})) {
    if (character.scoresAreFinal) continue;
    const split = key.lastIndexOf(":");
    const className = key.slice(0, split);
    const classLevel = Number(key.slice(split + 1));
    if (
      !className ||
      !classLevel ||
      classLevel > (levels[className] || 0) ||
      !classProgression[className]?.levels[classLevel - 1]?.asi
    )
      continue;
    const acquiredAt = classCharacterLevel(character, className, classLevel);
    if (acquiredAt !== null && acquiredAt > throughCharacterLevel) continue;
    if (choice.mode === "plus2" && choice.abilities[0])
      increases[choice.abilities[0]] =
        (increases[choice.abilities[0]] || 0) + 2;
    if (choice.mode === "split")
      for (const ability of choice.abilities.slice(0, 2))
        increases[ability] = (increases[ability] || 0) + 1;
    if (choice.mode === "feat" && character.featEnabled) {
      const featAbility = featAbilityFor(
        choice.feat,
        choice.abilities?.[0] || "",
      );
      if (featAbility)
        increases[featAbility] = (increases[featAbility] || 0) + 1;
    }
  }
  if (
    !character.scoresAreFinal &&
    character.featEnabled &&
    character.race === "Human" &&
    character.subrace.includes("Variant") &&
    character.raceFeat
  ) {
    const featAbility = featAbilityFor(
      character.raceFeat,
      character.raceFeatAbility,
    );
    if (featAbility) increases[featAbility] = (increases[featAbility] || 0) + 1;
  }
  if (
    !character.scoresAreFinal &&
    (levels.Barbarian || 0) >= 20 &&
    (classCharacterLevel(character, "Barbarian", 20) ?? Infinity) <=
      throughCharacterLevel
  ) {
    increases.Strength = (increases.Strength || 0) + 4;
    increases.Constitution = (increases.Constitution || 0) + 4;
  }
  return Object.fromEntries(
    abilities.map((name) => [
      name,
      (Number(character.baseAbilities[name]) || 8) +
        (bonus[name] || 0) +
        (increases[name] || 0),
    ]),
  ) as Record<string, number>;
}

function pointBuyTotal(values: Record<string, number>) {
  return abilities.reduce(
    (total, name) => total + (pointBuyCost[Number(values[name])] ?? 999),
    0,
  );
}

function classChoices(character: Character) {
  if (character.classMode === "single") return character.classes.length === 1;
  const path = Object.entries(character.levelPath).filter(
    ([level]) =>
      Number(level) <= character.level &&
      Boolean(character.levelPath[Number(level)]),
  );
  const count = new Set(path.map(([, value]) => value)).size;
  return character.level >= 2 && count >= 2 && path.length === character.level;
}

function featPrerequisiteIssues(
  character: Character,
  featName: string,
  className: string,
  classLevel: number | null,
  stateKey: string,
): string[] {
  const feat = findFeat(featName);
  if (!feat)
    return [
      `“${featName}” is not in the 2014 PHB feat catalog; choose a listed feat or keep the build marked unresolved.`,
    ];
  const requirement = feat.prerequisite;
  const before: Character = {
    ...character,
    asiChoices: { ...character.asiChoices },
    raceFeat: stateKey === "Variant Human" ? "" : character.raceFeat,
  };
  if (className && classLevel) delete before.asiChoices[stateKey];
  const acquisition =
    className && classLevel
      ? classCharacterLevel(character, className, classLevel)
      : 1;
  const scores = finalAbilities(before, acquisition ?? character.level);
  const proficiencies = proficiencyInventory(
    before,
    classLevelCounts(before),
    initialClass(before),
    false,
  ).filter(
    (row) =>
      acquisition === null ||
      row.characterLevel === null ||
      row.characterLevel <= acquisition,
  );
  const issues: string[] = [];
  const abilityMatch = requirement?.match(
    /(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)(?: or (Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma))? (\d+) or higher/i,
  );
  if (abilityMatch) {
    const required = Number(abilityMatch[3]);
    if (
      ![abilityMatch[1], abilityMatch[2]]
        .filter(Boolean)
        .some((ability) => scores[ability] >= required)
    )
      issues.push(`${feat.name} requires ${requirement}.`);
  } else if (
    requirement &&
    /proficiency with (light|medium|heavy) armor/i.test(requirement)
  ) {
    const category = requirement.match(
      /proficiency with (light|medium|heavy) armor/i,
    )?.[1];
    if (
      !proficiencies.some(
        (row) =>
          row.kind === "Armor" &&
          (row.name.toLowerCase().includes(`${category} armor`) ||
            /all armor/i.test(row.name)),
      )
    )
      issues.push(`${feat.name} requires ${requirement.toLowerCase()}.`);
  } else if (
    requirement &&
    /ability to cast at least one spell/i.test(requirement)
  ) {
    const levels = classLevelCounts({
      ...before,
      level: acquisition ?? character.level,
    });
    const canCast = Object.entries(levels).some(([klass, level]) =>
      klass === "Bard" ||
      klass === "Cleric" ||
      klass === "Druid" ||
      klass === "Sorcerer" ||
      klass === "Warlock" ||
      klass === "Wizard"
        ? level >= 1
        : klass === "Paladin" || klass === "Ranger"
          ? level >= 2
          : klass === "Fighter"
            ? level >= 3 && character.subclass.Fighter === "Eldritch Knight"
            : klass === "Rogue"
              ? level >= 3 && character.subclass.Rogue === "Arcane Trickster"
              : false,
    );
    const racialCaster =
      before.race === "Tiefling" ||
      (before.race === "Elf" &&
        ["High Elf", "Dark Elf (Drow)"].includes(before.subrace)) ||
      (before.race === "Gnome" && before.subrace === "Forest Gnome");
    const grantedCaster =
      (before.subclass.Monk === "Way of Shadow" && (levels.Monk || 0) >= 3) ||
      (before.subclass.Barbarian === "Path of the Totem Warrior" &&
        (levels.Barbarian || 0) >= 3) ||
      activeFeatSelections(before).some(
        (pick) =>
          ["Magic Initiate", "Ritual Caster"].includes(pick.name) &&
          (pick.characterLevel === null ||
            pick.characterLevel <= (acquisition ?? before.level)),
      );
    if (!canCast && !racialCaster && !grantedCaster)
      issues.push(
        `${feat.name} requires the ability to cast at least one spell.`,
      );
  }
  const chosen =
    className && classLevel
      ? character.asiChoices?.[`${className}:${classLevel}`]?.abilities?.[0] ||
        ""
      : stateKey === "Variant Human"
        ? character.raceFeatAbility
        : "";
  if (feat.abilityChoice?.length && !feat.abilityChoice.includes(chosen))
    issues.push(`${feat.name} requires a valid ability-increase choice.`);
  const options = character.featOptions?.[stateKey] || [];
  if (
    feat.choiceOptions?.length &&
    (options.length !== (feat.choiceCount || 1) ||
      new Set(options).size !== options.length ||
      options.some((option) => !feat.choiceOptions?.includes(option)))
  )
    issues.push(
      `${feat.name} requires ${feat.choiceCount || 1} valid ${feat.choiceLabel || "feat"} selection(s).`,
    );
  if (
    feat.name === "Linguist" &&
    options.some((language) =>
      proficiencies.some(
        (row) => row.kind === "Language" && row.name === language,
      ),
    )
  )
    issues.push(
      "Linguist grants three new languages; choose languages not already granted by another source.",
    );
  if (
    feat.name === "Skilled" &&
    options
      .filter((name) => !skills.includes(name))
      .some((name) =>
        proficiencies.some(
          (row) =>
            (row.kind === "Tool" || row.kind === "Vehicle") &&
            row.name.toLowerCase() === name.toLowerCase(),
        ),
      )
  )
    issues.push(
      "Skilled tool choices must add new training; replace a tool already granted by another source.",
    );
  return issues;
}

export function abilityAdvancementIssues(
  character: Character,
  scoresOnly = false,
): string[] {
  const errors: string[] = [];
  for (const [name, count] of Object.entries(classLevelCounts(character)))
    for (const row of classProgression[name]?.levels.slice(0, count) || [])
      if (row.asi) {
        const key = `${name}:${row.level}`;
        const choice = character.asiChoices?.[key];
        if (!choice) {
          errors.push(
            `${name} level ${row.level} grants an ability score improvement; record an ability increase or an optional feat.`,
          );
          continue;
        }
        if (choice.mode === "feat") {
          if (!character.featEnabled)
            errors.push(
              `${name} level ${row.level} cannot use a feat while the optional feat rule is disabled.`,
            );
          if (!choice.feat.trim())
            errors.push(
              `Record the feat chosen for ${name} level ${row.level}.`,
            );
          else if (!scoresOnly)
            errors.push(
              ...featPrerequisiteIssues(
                character,
                choice.feat,
                name,
                row.level,
                `${name}:${row.level}`,
              ),
            );
          else {
            const feat = findFeat(choice.feat);
            if (
              feat?.abilityChoice?.length &&
              !feat.abilityChoice.includes(choice.abilities?.[0] || "")
            )
              errors.push(
                `${feat.name} requires a valid ability-increase choice.`,
              );
          }
        } else if (choice.mode === "plus2") {
          if (
            choice.abilities.length !== 1 ||
            !abilities.includes(choice.abilities[0])
          )
            errors.push(
              `Choose one ability to increase by 2 at ${name} level ${row.level}.`,
            );
        } else if (choice.mode === "split") {
          if (
            choice.abilities.length !== 2 ||
            choice.abilities[0] === choice.abilities[1] ||
            choice.abilities.some((ability) => !abilities.includes(ability))
          )
            errors.push(
              `Choose two different abilities to increase by 1 at ${name} level ${row.level}.`,
            );
        }
        const at = classCharacterLevel(character, name, row.level);
        if (
          !character.scoresAreFinal &&
          at !== null &&
          abilities.some(
            (ability) => finalAbilities(character, at)[ability] > 20,
          )
        )
          errors.push(
            `${name} level ${row.level}: an improvement raises an ability above 20 at its acquisition level; later Primal Champion cannot legalize that earlier increase.`,
          );
      }
  if (character.race === "Human" && character.subrace.includes("Variant")) {
    if (!character.featEnabled)
      errors.push(
        "Variant Human is an optional rule and grants a feat; enable the PHB feat rule or choose Standard Human.",
      );
    else if (!character.raceFeat.trim())
      errors.push("Choose the Variant Human starting feat.");
    else if (!scoresOnly)
      errors.push(
        ...featPrerequisiteIssues(
          character,
          character.raceFeat,
          "",
          null,
          "Variant Human",
        ),
      );
    else {
      const feat = findFeat(character.raceFeat);
      if (
        feat?.abilityChoice?.length &&
        !feat.abilityChoice.includes(character.raceFeatAbility)
      )
        errors.push(`${feat.name} requires a valid ability-increase choice.`);
    }
  }
  const final = finalAbilities(character);
  const maximum = (classLevelCounts(character).Barbarian || 0) >= 20 ? 24 : 20;
  if (abilities.some((ability) => final[ability] > maximum))
    errors.push(
      `An ability score exceeds ${maximum} after ancestry and class increases; correct its improvement choices.`,
    );
  const feats = activeFeatSelections(character);
  for (const name of new Set(feats.map((pick) => pick.name))) {
    const picks = feats.filter((pick) => pick.name === name);
    if (picks.length > 1 && name !== "Elemental Adept")
      errors.push(`${name} cannot be selected more than once.`);
    if (
      name === "Elemental Adept" &&
      new Set(picks.flatMap((pick) => character.featOptions?.[pick.key] || []))
        .size < picks.length
    )
      errors.push(
        "Elemental Adept may be repeated only for different damage types.",
      );
  }
  return errors;
}

export function validateStage(
  character: Character,
  stage = character.stage,
): string[] {
  const errors: string[] = [];
  if (stage === 0) {
    if (!character.race || !character.subrace)
      errors.push("Choose a race and its lineage or variant.");
    if (character.race && !selectedRace(character))
      errors.push("The selected race is outside the 2014 PHB catalog.");
    if (
      selectedRace(character) &&
      character.subrace &&
      !selectedRace(character)?.subraces.some(
        (item) => item.name === character.subrace,
      )
    )
      errors.push(
        "Choose a subrace or variant belonging to the selected race.",
      );
    if (
      Object.keys(classLevelCounts(character)).some(
        (name) => !selectedClass(name),
      )
    )
      errors.push("Replace a class outside the 12-class 2014 PHB catalog.");
    if (
      character.race === "Dragonborn" &&
      !dragonbornAncestryFor(character.subrace, character.ancestry)
    )
      errors.push("Choose your dragonborn ancestry.");
    if (
      (character.race === "Half-Elf" ||
        (character.race === "Human" &&
          character.subrace.includes("Variant"))) &&
      (character.flexBonuses.length !== 2 ||
        character.flexBonuses[0] === character.flexBonuses[1])
    )
      errors.push(
        "Choose two different abilities for the flexible ancestry increases.",
      );
    if (
      character.flexBonuses.some((name) => !abilities.includes(name)) ||
      (character.race === "Half-Elf" &&
        character.flexBonuses.includes("Charisma"))
    )
      errors.push(
        "Flexible ancestry increases must use eligible abilities; Half-Elf chooses two abilities other than Charisma.",
      );
    if (!classChoices(character))
      errors.push(
        character.classMode === "single"
          ? "Choose one class."
          : "A current multiclass character needs level 2 or higher and a complete path through at least two classes.",
      );
    if (character.classMode === "multi" && !character.dmPermission)
      errors.push(
        "Confirm that your DM allows the optional multiclassing rule.",
      );
    if (!character.level || character.level < 1 || character.level > 20)
      errors.push("Choose a character level from 1 to 20.");
    if (character.classMode === "multi") {
      for (let n = 1; n <= character.level; n++)
        if (!character.levelPath[n])
          errors.push(`Choose the class gained at character level ${n}.`);
    }
    if (character.classMode === "multi") {
      const counts: Record<string, number> = {};
      for (let n = 1; n <= character.level; n++) {
        const c = character.levelPath[n];
        if (!c) continue;
        counts[c] = (counts[c] || 0) + 1;
      }
      for (const name of character.classes)
        if (!counts[name])
          errors.push(
            `Assign at least one level to ${name}, or remove it from the class plan.`,
          );
    }
  }
  if (stage === 2 && !character.background) errors.push("Choose a background.");
  if (stage === 2 && character.background && !selectedBackground(character))
    errors.push("The selected background is outside the 2014 PHB catalog.");
  if (
    stage === 2 &&
    character.backgroundVariant &&
    !backgroundVariantOptions(character.background).includes(
      character.backgroundVariant,
    )
  )
    errors.push(
      "Choose a variant belonging to the selected background, or use its standard form.",
    );
  if (stage === 3) {
    if (
      abilities.some(
        (name) =>
          !Number.isInteger(Number(character.baseAbilities[name])) ||
          Number(character.baseAbilities[name]) <
            (character.scoresAreFinal ? 1 : 3) ||
          Number(character.baseAbilities[name]) >
            (character.scoresAreFinal ? 30 : 18),
      )
    )
      errors.push(
        character.scoresAreFinal
          ? "Imported final scores must be whole numbers from 1 to 30; retain unusual scores for source review."
          : "Each base ability must be a whole number from 3 to 18 before increases.",
      );
    if (
      !character.scoresAreFinal &&
      character.abilityMethod === "standard" &&
      [...Object.values(character.baseAbilities)]
        .sort((a, b) => a - b)
        .join(",") !== [...standardArray].sort((a, b) => a - b).join(",")
    )
      errors.push("Assign each standard-array score exactly once.");
    if (
      !character.scoresAreFinal &&
      character.abilityMethod === "point-buy" &&
      pointBuyTotal(character.baseAbilities) !== 27
    )
      errors.push(
        `Point buy must spend exactly 27 points (currently ${pointBuyTotal(character.baseAbilities)}).`,
      );
    if (
      !character.scoresAreFinal &&
      character.abilityMethod === "manual" &&
      abilities.some(
        (x) =>
          Number(character.baseAbilities[x]) < 3 ||
          Number(character.baseAbilities[x]) > 18,
      )
    )
      errors.push(
        "Manual scores must be from 3 to 18 before racial increases.",
      );
    if (
      !character.scoresAreFinal &&
      character.abilityMethod === "rolled" &&
      !character.rollNotes.trim()
    )
      errors.push(
        "Enter the rolls you actually made; the app will not generate rolls for you.",
      );
    errors.unshift(...multiclassPrerequisiteIssues(character));
    errors.push(...abilityAdvancementIssues(character, true));
  }
  if (stage === 4) {
    const plans = classSkillPlans(character);
    const selections = selectedClassSkills(character);
    for (const plan of plans) {
      const chosen = selections[plan.className] || [];
      if (chosen.length !== plan.count)
        errors.push(
          `Choose ${plan.count} skill proficiency/proficiencies from ${plan.className} training (currently ${chosen.length}).`,
        );
      const invalid = chosen.filter((name) => !plan.options.includes(name));
      if (invalid.length)
        errors.push(
          `${plan.className} cannot grant these selected skills: ${invalid.join(", ")}.`,
        );
      if (new Set(chosen).size !== chosen.length)
        errors.push(`${plan.className} skill selections must be distinct.`);
    }
    const racialSkillCount =
      character.race === "Half-Elf"
        ? 2
        : character.race === "Human" && character.subrace.includes("Variant")
          ? 1
          : 0;
    if ((character.raceSkills || []).length !== racialSkillCount)
      errors.push(
        `Choose ${racialSkillCount} racial skill proficiency/proficiencies (currently ${(character.raceSkills || []).length}).`,
      );
    if (
      new Set(character.raceSkills || []).size !==
        (character.raceSkills || []).length ||
      (character.raceSkills || []).some((name) => !skills.includes(name))
    )
      errors.push("Racial skill choices must be distinct PHB skills.");
    for (const plan of skillReplacementPlans(character).filter(
      (plan) => plan.stage === 4,
    ))
      if (
        !plan.options.includes(
          character.skillReplacementChoices?.[plan.key] || "",
        )
      )
        errors.push(`${plan.label}.`);
    const requiredLanguages = additionalLanguageCount(character);
    if (character.languages.length !== requiredLanguages)
      errors.push(
        `Choose ${requiredLanguages} additional language(s) (currently ${character.languages.length}).`,
      );
    if (
      new Set(character.languages).size !== character.languages.length ||
      character.languages.some(
        (name) =>
          !languageOptions.includes(name) ||
          raceProfiles[character.race]?.languages.includes(name),
      )
    )
      errors.push(
        "Additional languages must be distinct PHB languages not already granted by ancestry.",
      );
    const toolPlans = toolChoicePlans(character);
    const usedTools = new Set<string>();
    for (const plan of toolPlans) {
      const selected = character.toolChoices?.[plan.key] || [];
      if (selected.length !== plan.count)
        errors.push(
          `${plan.label}: choose ${plan.count} option(s) (currently ${selected.length}).`,
        );
      if (selected.some((name) => !plan.options.includes(name)))
        errors.push(
          `${plan.label}: replace an unavailable or duplicate choice.`,
        );
      for (const name of selected) {
        if (usedTools.has(name.toLowerCase()))
          errors.push(
            `${name} is selected for more than one tool proficiency.`,
          );
        usedTools.add(name.toLowerCase());
      }
    }
  }
  if (stage === 5) {
    for (const plan of skillReplacementPlans(character))
      if (
        !plan.options.includes(
          character.skillReplacementChoices?.[plan.key] || "",
        )
      )
        errors.push(`${plan.label}.`);
    for (const [className, name] of Object.entries(character.subclass || {}))
      if (
        name &&
        classLevelCounts(character)[className] &&
        !selectedClass(className)?.subclasses.includes(name)
      )
        errors.push(
          `${name} is not an eligible 2014 PHB subclass for ${className}.`,
        );
    for (const name of character.classes)
      if (
        (selectedClass(name)?.subclassAt || 99) <=
          (classLevelCounts(character)[name] || 0) &&
        !character.subclass[name]
      )
        errors.push(`Choose your ${name} subclass.`);
    for (const [className, classLevel] of Object.entries(
      classLevelCounts(character),
    )) {
      const subclass = character.subclass[className] || "";
      const plans = getSubclassChoicePlans(
        className,
        subclass,
        classLevel,
        character.subclassChoices,
      );
      for (const plan of plans) {
        const selected =
          character.subclassChoices?.[
            `${className}:${plan.unlockLevel}:${plan.key}`
          ] || [];
        if (selected.length !== plan.choose)
          errors.push(
            `${className} level ${plan.unlockLevel}: ${plan.title} requires ${plan.choose} distinct choice(s); currently ${selected.length}.`,
          );
        if (
          new Set(selected.map((option) => option.trim().toLowerCase()))
            .size !== selected.length ||
          selected.some((option) =>
            plan.allowCustom
              ? !option.trim() || /^humanoids?$/i.test(option.trim())
              : !plan.options.includes(option),
          )
        )
          errors.push(
            `${className} level ${plan.unlockLevel}: replace duplicate or unavailable ${plan.title} choice(s).`,
          );
        for (const option of selected) {
          const detail = getChoiceOptionDetail(plan, option);
          if (detail.minimumLevel && classLevel < detail.minimumLevel)
            errors.push(
              `${option} requires ${className} level ${detail.minimumLevel}.`,
            );
          if (
            detail.pactBoon &&
            !(
              character.subclassChoices?.["Warlock:3:pact-boon"] || []
            ).includes(detail.pactBoon)
          )
            errors.push(`${option} requires the ${detail.pactBoon}.`);
        }
      }
      const repeatableChoiceGroups = [
        { prefix: "maneuvers-", label: "Battle Master maneuvers" },
        { prefix: "metamagic-", label: "Metamagic options" },
        { prefix: "elemental-disciplines-", label: "elemental disciplines" },
        { prefix: "favored-enemy-", label: "favored enemy choices" },
        { prefix: "favored-humanoids-", label: "favored humanoid races" },
        { prefix: "favored-terrain-", label: "favored terrain choices" },
        { prefix: "invocations-", label: "Eldritch Invocations" },
      ];
      for (const group of repeatableChoiceGroups) {
        const selected = plans
          .filter((plan) => plan.key.startsWith(group.prefix))
          .flatMap(
            (plan) =>
              character.subclassChoices?.[
                `${className}:${plan.unlockLevel}:${plan.key}`
              ] || [],
          )
          .filter(
            (option) =>
              group.prefix !== "favored-enemy-" ||
              option !== "Humanoids (choose two races)",
          );
        if (
          new Set(selected.map((option) => option.trim().toLowerCase()))
            .size !== selected.length
        )
          errors.push(
            `${className}: ${group.label} must be distinct across the class levels that grant them.`,
          );
      }
    }
    const allStyles = Object.entries(classLevelCounts(character)).flatMap(
      ([className, level]) =>
        getSubclassChoicePlans(
          className,
          character.subclass[className] || "",
          level,
        )
          .filter((plan) => plan.key.startsWith("fighting-style-"))
          .flatMap(
            (plan) =>
              character.subclassChoices?.[
                `${className}:${plan.unlockLevel}:${plan.key}`
              ] || [],
          ),
    );
    if (new Set(allStyles).size !== allStyles.length)
      errors.push(
        "A Fighting Style cannot be selected more than once, including across different classes.",
      );
    const usedExpertise = new Set<string>();
    for (const plan of expertisePlans(character)) {
      const selected = character.expertiseChoices?.[plan.key] || [];
      if (selected.length !== plan.count)
        errors.push(
          `${plan.className} level ${plan.classLevel} grants Expertise; choose ${plan.count} eligible skills or tools.`,
        );
      if (selected.some((name) => !plan.options.includes(name)))
        errors.push(
          `Replace an invalid ${plan.className} level ${plan.classLevel} Expertise choice; the target must already be a skill or tool proficiency.`,
        );
      for (const name of selected) {
        if (usedExpertise.has(name))
          errors.push(
            `${name} cannot be selected for Expertise more than once.`,
          );
        usedExpertise.add(name);
      }
    }
    errors.push(...abilityAdvancementIssues(character));
  }
  if (stage === 6) {
    if (character.equipmentMethod === "wealth") {
      const wealth = classStartingWealth[initialClass(character) || ""];
      const value = Number(character.startingGold);
      if (
        !wealth ||
        !character.startingGold.trim() ||
        !Number.isInteger(value) ||
        value < wealth.min ||
        value > wealth.max ||
        value % wealth.multiplier !== 0
      )
        errors.push(
          `Starting wealth requires an actual valid ${wealth?.dice || "class"} roll result${wealth ? ` × ${wealth.multiplier} gp (${wealth.min}–${wealth.max} gp)` : ""}; record the total without inventing a roll.`,
        );
    }
    if (
      character.equipmentMethod === "wealth" &&
      character.equipmentItems.some(
        (item) =>
          item.quantity > 0 &&
          /^(Starting class:|Background equipment:)/i.test(item.source),
      )
    )
      errors.push(
        "Starting wealth replaces class and background equipment. Remove or explicitly reclassify retained package items before using the wealth method.",
      );
    for (const [className, level] of Object.entries(
      classLevelCounts(character),
    ))
      for (const plan of getSubclassChoicePlans(
        className,
        character.subclass[className] || "",
        level,
      ))
        for (const option of character.subclassChoices?.[
          `${className}:${plan.unlockLevel}:${plan.key}`
        ] || []) {
          const detail = getChoiceOptionDetail(plan, option);
          if (
            detail.spellKnown &&
            !(character.spellSelections || []).some(
              (pick) =>
                findSpell(pick.spellId)?.name === detail.spellKnown &&
                pick.source === className,
            )
          )
            errors.push(
              `${option} requires knowing ${detail.spellKnown}; choose it with ${className} as its source.`,
            );
        }
    const equipmentGroups = [
      ...getStartingEquipmentChoices(initialClass(character) || ""),
      ...getBackgroundEquipment(
        character.background,
        character.backgroundVariant,
      ).choices,
    ];
    const hasTypedEquipment = character.equipment.some((value) =>
      value.startsWith("start:"),
    );
    if (
      character.equipmentMethod !== "wealth" &&
      (hasTypedEquipment ||
        (!character.equipment.length && !character.equipmentItems.length))
    )
      for (const group of equipmentGroups) {
        const chosen = group.options.filter((option) =>
          character.equipment.includes(`start:${group.id}:${option.id}`),
        );
        if (chosen.length !== group.choose)
          errors.push(
            `${group.className} starting equipment: choose ${group.choose} ${group.title.toLowerCase()} option.`,
          );
        for (const option of chosen)
          if (option.chooseFrom?.length) {
            const picks = character.equipment
              .filter((value) => value.startsWith(`pick:${group.id}:`))
              .map((value) => value.split(":").slice(3).join(":"));
            if (
              picks.length !== (option.chooseCount || 1) ||
              picks.some((name) => !option.chooseFrom?.includes(name))
            )
              errors.push(
                `${group.className} starting equipment: ${option.label} requires ${option.chooseCount || 1} valid item choice(s).`,
              );
          }
      }
    if (character.equippedArmor && !wornArmor(character))
      errors.push(
        "Choose a recognized PHB armor entry, or remove the equipped armor selection.",
      );
    const worn = wornArmor(character);
    const proficiencies = proficiencyInventory(
      character,
      classLevelCounts(character),
      initialClass(character),
    );
    if (
      worn &&
      !activeEquipmentItems(character).some(
        (item) =>
          item.quantity > 0 &&
          findArmor(item.catalogId || item.name)?.name === worn[0],
      )
    )
      errors.push(
        `${worn[0]} is equipped but is not recorded as an owned armor item.`,
      );
    if (
      character.equippedShield &&
      !activeEquipmentItems(character).some(
        (item) =>
          item.quantity > 0 &&
          findArmor(item.catalogId || item.name)?.kind === "shield",
      )
    )
      errors.push("A shield is equipped but is not recorded as an owned item.");
    if (
      worn &&
      !proficiencies.some(
        (item) =>
          item.kind === "Armor" &&
          (item.name.toLowerCase().includes("all armor") ||
            item.name
              .toLowerCase()
              .includes(`${worn[1].category.toLowerCase()} armor`)),
      )
    )
      errors.push(
        `${worn[0]} is equipped without its armor proficiency: Strength/Dexterity checks, saves and attacks have disadvantage, and you cannot cast spells.`,
      );
    if (
      character.equippedShield &&
      !proficiencies.some(
        (item) => item.kind === "Armor" && /shield/i.test(item.name),
      )
    )
      errors.push(
        "A shield is equipped without shield proficiency; resolve the armor proficiency penalties before play.",
      );
    if (character.hpMethod === "rolled")
      for (let level = 2; level <= character.level; level++) {
        const className =
          character.classMode === "single"
            ? initialClass(character)
            : character.levelPath[level];
        const die = selectedClass(className)?.hitDie || 0;
        const roll = character.hpRolls?.[level];
        if (!Number.isInteger(roll) || roll < 1 || roll > die)
          errors.push(
            `Record the actual d${die || "?"} hit-point roll for character level ${level}; preview currently uses a provisional average.`,
          );
      }
    for (const item of character.equipmentItems)
      if (!Number.isInteger(item.quantity) || item.quantity < 0)
        errors.push(
          `Equipment quantity for ${item.name || "unnamed item"} must be a nonnegative whole number.`,
        );
    errors.push(...spellSelectionIssues(character));
  }
  if (stage === 7 || stage === 8)
    for (let previous = 0; previous <= 6; previous++)
      errors.push(...validateStage(character, previous));
  return [...new Set(errors)];
}

export function validateBuild(character: Character): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const authority = getCatalogAudit().issues.find(
    (issue) => issue.id === "phb-authority-access",
  );
  if (authority)
    issues.push({
      id: authority.id,
      severity: "unresolved",
      stage: 7,
      control: "catalog-audit",
      message: authority.message,
      sourceReference:
        "Player’s Handbook (2014) compendium; official PHB errata",
    });
  const controlFor = (stage: number, message: string) =>
    /multiclass|class gained|class plan/i.test(message)
      ? stage === 3
        ? "ability-scores"
        : "class-path"
      : /ability score improvement|ability.increase|feat/i.test(message)
        ? "advancement-editor"
        : /spell|cantrip|arcanum/i.test(message)
          ? "spell-selections"
          : /armor|shield/i.test(message)
            ? "equipped-armor"
            : `stage-${stage}`;
  for (let stage = 0; stage <= 6; stage++)
    for (const [index, message] of validateStage(character, stage).entries())
      issues.push({
        id: `stage-${stage}-error-${index}`,
        severity: "error",
        stage,
        control: controlFor(stage, message),
        message,
      });
  for (const [index, message] of (character.importWarnings || []).entries())
    issues.push({
      id: `import-warning-${index}`,
      severity: "unresolved",
      stage: 7,
      control: "import-review",
      message,
    });
  if (
    character.classMode === "multi" &&
    character.importedInitialClass &&
    !Object.values(character.levelPath).some(Boolean)
  )
    issues.push({
      id: "import-chronology",
      severity: "unresolved",
      stage: 0,
      control: "class-path",
      message:
        "The imported PDF does not specify a class-by-class acquisition path. Confirm the path before validating entry scores, feature acquisition levels, or first Unarmored Defense.",
    });
  if (character.spells.length && !(character.spellSelections || []).length)
    issues.push({
      id: "legacy-spell-source",
      severity: "unresolved",
      stage: 6,
      control: "spell-selections",
      message:
        "Legacy spell names have no casting source or known/prepared status. Assign each spell to its granting class, race, or feat before the spell sheet can be complete.",
    });
  if (
    character.equipment.some(
      (value) => !/^(start|pick|background|background-gp):/.test(value),
    )
  )
    issues.push({
      id: "legacy-equipment",
      severity: "unresolved",
      stage: 6,
      control: "equipment-selections",
      message:
        "Legacy starting equipment packages are retained. Confirm their typed starting choices to verify actual items and quantities; descriptive text is not a complete equipment selection.",
    });
  if (character.equipmentMethod === "wealth")
    issues.push({
      id: "wealth-budget",
      severity: "warning",
      stage: 6,
      control: "equipment-selections",
      message:
        "Starting wealth replaces both class and background gear and coin. Record purchases and remaining currency explicitly; the app does not infer spending from imported or free-text item descriptions.",
    });
  for (const spell of spellSelectionsForSheet(character))
    if (spell.definition?.verification === "source-verification-needed")
      issues.push({
        id: `spell-source-${spell.source}-${spell.spellId}`,
        severity: "unresolved",
        stage: 6,
        control: "spell-selections",
        message: `${spell.name}: the available source does not yet verify all PHB spell details. Review the referenced PHB entry; this is a source-access gap.`,
        sourceReference: spell.definition.sourceReference,
      });
  for (const spell of spellSelectionsForSheet(character))
    if (spell.definition && !spell.definition.descriptionComplete)
      issues.push({
        id: `spell-description-${spell.source}-${spell.spellId}`,
        severity: "unresolved",
        stage: 6,
        control: "spell-selections",
        message: `${spell.name}: a complete original rules explanation is not implemented yet. This implementation gap must be resolved for catalog completeness.`,
        sourceReference: spell.definition.sourceReference,
      });
  for (const [key, value] of Object.entries(character.sheetOverrides || {}))
    issues.push({
      id: `override-${key}`,
      severity:
        Number.isFinite(Number(value)) && value.trim() ? "warning" : "error",
      stage: 7,
      control: "sheet-overrides",
      message:
        Number.isFinite(Number(value)) && value.trim()
          ? `${key} uses an explicit imported/player override (${value}); later build changes do not replace it until the override is cleared.`
          : `${key} contains an invalid numeric override.`,
    });
  const seen = new Set<string>();
  return issues.filter((issue) => {
    const key = `${issue.stage}:${issue.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Required player decisions, separately from catalog/source-access review. */
export function isCharacterUnfinished(character: Character): boolean {
  return validateBuild(character).some(
    (issue) =>
      issue.severity === "error" ||
      (issue.severity === "unresolved" &&
        issue.id !== "phb-authority-access" &&
        !issue.id.startsWith("spell-source-") &&
        !issue.id.startsWith("spell-description-")),
  );
}

export function spellSelectionIssues(character: Character): string[] {
  const issues: string[] = [];
  const derived = derive(character);
  const selections = character.spellSelections || [];
  const availableSources = spellChoiceSources(character);
  const seen = new Set<string>();
  for (const selection of selections) {
    const spell = findSpell(selection.spellId);
    const key = `${selection.source}:${selection.status}:${selection.spellId}`;
    if (seen.has(key))
      issues.push(
        `${spell?.name || selection.spellId} is selected more than once for ${selection.source} (${selection.status}).`,
      );
    seen.add(key);
    if (!spell) {
      issues.push(`Unrecognized PHB spell: ${selection.spellId}.`);
      continue;
    }
    const source = derived.spellcasting.find(
      (row) => row.source === selection.source,
    );
    if (!availableSources.includes(selection.source))
      issues.push(
        `${spell.name} has no currently available spellcasting source (${selection.source || "unset"}).`,
      );
    if (
      selection.acquiredLevel !== undefined &&
      (!Number.isInteger(selection.acquiredLevel) ||
        selection.acquiredLevel < 1 ||
        selection.acquiredLevel > character.level)
    )
      issues.push(
        `${spell.name} has an acquisition level outside this character's current path.`,
      );
    if (source) {
      const list = ["Fighter", "Rogue"].includes(source.source)
        ? "Wizard"
        : source.source;
      if (
        !spell.classes.includes(list) &&
        !(source.source === "Warlock" && isPatronSpell(character, spell.name))
      )
        issues.push(
          `${spell.name} is not on the ${list} list for ${selection.source}; select its actual granting feature as the source.`,
        );
      if (selection.status !== "arcanum" && spell.level > source.maxSpellLevel)
        issues.push(
          `${selection.source} level ${source.classLevel} cannot learn or prepare ${spell.name} (${spell.level}th level); multiclass slots do not expand class spell access.`,
        );
      if (
        selection.status === "arcanum" &&
        (source.source !== "Warlock" ||
          ![6, 7, 8, 9].includes(spell.level) ||
          source.classLevel < 11 + (spell.level - 6) * 2)
      )
        issues.push(
          `${spell.name} is not available as Mystic Arcanum at this Warlock level.`,
        );
      if (selection.status === "spellbook" && source.source !== "Wizard")
        issues.push(`${selection.source} does not use a wizard spellbook.`);
      if (selection.status === "ritual" && !spell.ritual)
        issues.push(`${spell.name} has no ritual tag in the PHB.`);
      const allowedStatus: SpellSelection["status"][] =
        spell.level === 0
          ? ["known"]
          : source.source === "Wizard"
            ? ["spellbook", "prepared"]
            : source.preparedLimit !== null
              ? ["prepared"]
              : source.source === "Warlock" && spell.level >= 6
                ? ["arcanum"]
                : ["known"];
      if (!allowedStatus.includes(selection.status))
        issues.push(
          `${spell.name} from ${selection.source} must use ${allowedStatus.join(" or ")} status; another status cannot bypass its class limits.`,
        );
    } else if (
      !/high elf|forest gnome|tiefling|drow|feat|magic initiate|ritual caster|spell sniper|pact|shadow|totem|land|domain|oath|magical secrets|spell mastery|signature spells/i.test(
        selection.source,
      )
    )
      issues.push(
        `${spell.name} has no currently available spellcasting source (${selection.source || "unset"}).`,
      );
    if (
      selection.source === "Additional Magical Secrets" &&
      (character.subclass.Bard !== "College of Lore" ||
        (derived.classLevels.Bard || 0) < 6)
    )
      issues.push(
        "Additional Magical Secrets is not granted by the current class and subclass plan.",
      );
    if (
      selection.source === "Spell Mastery" &&
      (derived.classLevels.Wizard || 0) < 18
    )
      issues.push(
        "Spell Mastery requires Wizard level 18; review the retained spell choices.",
      );
    if (
      selection.source === "Signature Spells" &&
      (derived.classLevels.Wizard || 0) < 20
    )
      issues.push(
        "Signature Spells requires Wizard level 20; review the retained spell choices.",
      );
    if (
      selection.source.startsWith("Spell Sniper:") &&
      !activeFeatSelections(character).some(
        (feat) =>
          feat.name === "Spell Sniper" &&
          selection.source ===
            `Spell Sniper: ${character.featOptions?.[feat.key]?.[0] || ""}`,
      )
    )
      issues.push(
        "Spell Sniper's retained spell source does not match an active feat and its chosen class list.",
      );
    if (
      /high elf/i.test(selection.source) &&
      (character.race !== "Elf" ||
        character.subrace !== "High Elf" ||
        spell.level !== 0 ||
        !spell.classes.includes("Wizard"))
    )
      issues.push(
        `${spell.name} is not eligible for the High Elf's one wizard cantrip.`,
      );
  }
  for (const source of derived.spellcasting) {
    const chosen = selections.filter((pick) => pick.source === source.source);
    const cantrips = chosen.filter(
      (pick) => findSpell(pick.spellId)?.level === 0,
    );
    if (cantrips.length !== source.cantripsKnown)
      issues.push(
        `${source.source} level ${source.classLevel}: choose ${source.cantripsKnown} class cantrip(s), currently ${cantrips.length}. Racial and bonus cantrips use their own sources.`,
      );
    const spells = chosen.filter(
      (pick) =>
        (findSpell(pick.spellId)?.level || 0) > 0 && pick.status !== "arcanum",
    );
    if (source.spellsKnown !== null) {
      const known = spells.filter((pick) => pick.status === "known");
      const secretsCount =
        source.source === "Bard"
          ? [10, 14, 18].filter((level) => source.classLevel >= level).length *
            2
          : 0;
      const normalKnown = source.spellsKnown - secretsCount;
      if (known.length !== normalKnown)
        issues.push(
          `${source.source} level ${source.classLevel}: choose ${normalKnown} normal known class spell(s), currently ${known.length}${secretsCount ? `; ${secretsCount} Magical Secrets choices use their own sources and count toward the table total` : ""}.`,
        );
    }
    if (source.preparedLimit !== null) {
      const prepared = spells.filter((pick) => pick.status === "prepared");
      if (prepared.length > source.preparedLimit)
        issues.push(
          `${source.source} can prepare at most ${source.preparedLimit} class spell(s), excluding always-prepared feature spells.`,
        );
    }
    if (source.source === "Wizard") {
      const normalBook = new Set(
        spells
          .filter((pick) => pick.status === "spellbook")
          .map((pick) => pick.spellId),
      );
      const book = new Set([
        ...normalBook,
        ...derived.resolvedSpells
          .filter(
            (pick) =>
              pick.status === "spellbook" && pick.source.startsWith("Wizard:"),
          )
          .map((pick) => pick.spellId),
      ]);
      if (normalBook.size < 6 + 2 * (source.classLevel - 1))
        issues.push(
          `Wizard level ${source.classLevel}: record at least ${6 + 2 * (source.classLevel - 1)} spellbook spells from normal class progression; copied spells may add more.`,
        );
      for (const prepared of spells.filter(
        (pick) => pick.status === "prepared",
      ))
        if (!book.has(prepared.spellId))
          issues.push(
            `${findSpell(prepared.spellId)?.name || prepared.spellId} is prepared as a Wizard spell but is not recorded in the spellbook.`,
          );
    }
    if (["Fighter", "Rogue"].includes(source.source)) {
      const schools =
        source.source === "Fighter"
          ? ["Abjuration", "Evocation"]
          : ["Enchantment", "Illusion"];
      const anySchool =
        1 + [8, 14, 20].filter((level) => source.classLevel >= level).length;
      const offSchool = spells.filter((pick) => {
        const spell = findSpell(pick.spellId);
        return (
          spell &&
          !schools
            .map((value) => value.toLowerCase())
            .includes(spell.school.toLowerCase())
        );
      });
      if (offSchool.length > anySchool)
        issues.push(
          `${source.source === "Fighter" ? "Eldritch Knight" : "Arcane Trickster"}: at most ${anySchool} current spells can use the unrestricted school choices; the others must be ${schools.join(" or ")}.`,
        );
      if (
        source.source === "Rogue" &&
        !cantrips.some((pick) => findSpell(pick.spellId)?.name === "Mage Hand")
      )
        issues.push(
          "Arcane Trickster must know Mage Hand as one of its three initial cantrips.",
        );
    }
    if (source.source === "Warlock")
      for (const [level, spellLevel] of [
        [11, 6],
        [13, 7],
        [15, 8],
        [17, 9],
      ])
        if (source.classLevel >= level) {
          const count = chosen.filter(
            (pick) =>
              pick.status === "arcanum" &&
              findSpell(pick.spellId)?.level === spellLevel,
          ).length;
          if (count !== 1)
            issues.push(
              `Warlock level ${level} grants one ${spellLevel}th-level Mystic Arcanum; choose exactly one.`,
            );
        }
  }
  if (
    character.race === "Elf" &&
    character.subrace === "High Elf" &&
    selections.filter((pick) => /high elf/i.test(pick.source)).length !== 1
  )
    issues.push(
      "High Elf grants one wizard cantrip; select exactly one with High Elf as its source.",
    );
  const bookRituals = selections.filter(
    (pick) => pick.source === "Book of Ancient Secrets",
  );
  const hasBookInvocation =
    (derived.classLevels.Warlock || 0) >= 3 &&
    (character.subclassChoices?.["Warlock:3:pact-boon"] || []).includes(
      "Pact of the Tome",
    ) &&
    Object.entries(activeSubclassChoices(character)).some(
      ([key, options]) =>
        key.startsWith("Warlock:") &&
        key.includes(":invocations-") &&
        Number(key.split(":")[1]) <= (derived.classLevels.Warlock || 0) &&
        options.includes("Book of Ancient Secrets"),
    );
  if (bookRituals.length && !hasBookInvocation)
    issues.push(
      "Book of Ancient Secrets requires an active invocation and Pact of the Tome; review retained ritual choices.",
    );
  if (hasBookInvocation) {
    const maximum = Math.ceil(derived.classLevels.Warlock / 2);
    const initial = new Set(
      bookRituals
        .filter(
          (pick) =>
            findSpell(pick.spellId)?.level === 1 &&
            findSpell(pick.spellId)?.ritual &&
            pick.status === "ritual",
        )
        .map((pick) => pick.spellId),
    );
    if (initial.size < 2)
      issues.push(
        "Book of Ancient Secrets requires at least two distinct starting 1st-level ritual spells.",
      );
    if (
      bookRituals.some((pick) => {
        const spell = findSpell(pick.spellId);
        return (
          !spell?.ritual ||
          spell.level < 1 ||
          spell.level > maximum ||
          pick.status !== "ritual"
        );
      })
    )
      issues.push(
        `Book of Ancient Secrets accepts ritual-status spells with the ritual tag, at most level ${maximum} from your Warlock level; other class levels do not raise this limit.`,
      );
  }
  const extraCantrip = (
    enabled: boolean,
    pattern: RegExp,
    count: number,
    list: string,
    source: string,
  ) => {
    const picks = selections.filter((pick) => pattern.test(pick.source));
    if (!enabled && picks.length)
      issues.push(
        `${source} is not granted by this build; review its retained spell choices.`,
      );
    if (
      enabled &&
      (picks.length !== count ||
        picks.some((pick) => {
          const spell = findSpell(pick.spellId);
          return (
            !spell ||
            spell.level !== 0 ||
            (list && !spell.classes.includes(list))
          );
        }))
    )
      issues.push(
        `${source} grants ${count} ${list || "any-class"} cantrip choice(s); record them with that feature as the source.`,
      );
  };
  extraCantrip(
    character.subclass.Cleric === "Nature Domain" &&
      (derived.classLevels.Cleric || 0) >= 1,
    /^Nature Domain$/i,
    1,
    "Druid",
    "Nature Domain",
  );
  extraCantrip(
    character.subclass.Druid === "Circle of the Land" &&
      (derived.classLevels.Druid || 0) >= 2,
    /^Circle of the Land$/i,
    1,
    "Druid",
    "Circle of the Land",
  );
  extraCantrip(
    (character.subclassChoices?.["Warlock:3:pact-boon"] || []).includes(
      "Pact of the Tome",
    ) && (derived.classLevels.Warlock || 0) >= 3,
    /^Pact of the Tome$/i,
    3,
    "",
    "Pact of the Tome",
  );
  if (
    character.subclass.Bard === "College of Lore" &&
    (derived.classLevels.Bard || 0) >= 6
  ) {
    const picks = selections.filter(
      (pick) => pick.source === "Additional Magical Secrets",
    );
    const max = classProgression.Bard.levels[5].spellSlots?.length || 3;
    if (
      picks.length !== 2 ||
      picks.some(
        (pick) =>
          (findSpell(pick.spellId)?.level ?? 99) > max ||
          pick.status !== "known",
      )
    )
      issues.push(
        "Additional Magical Secrets grants two known any-class spells of level 3 or lower at Bard level 6; use its own source so they do not consume normal known spells.",
      );
  }
  for (const level of [10, 14, 18]) {
    const picks = selections.filter(
      (pick) => pick.source === `Magical Secrets: Bard ${level}`,
    );
    if ((derived.classLevels.Bard || 0) < level) {
      if (picks.length)
        issues.push(
          `Magical Secrets: Bard ${level} is not available at your current Bard level.`,
        );
      continue;
    }
    const max = classProgression.Bard.levels[level - 1].spellSlots?.length || 0;
    if (
      picks.length !== 2 ||
      picks.some(
        (pick) =>
          (findSpell(pick.spellId)?.level ?? 99) > max ||
          pick.status !== "known",
      )
    )
      issues.push(
        `Magical Secrets: Bard ${level} requires exactly two known spells of level ${max} or lower; these count toward the Bard table's spells-known total.`,
      );
  }
  if ((derived.classLevels.Wizard || 0) >= 18) {
    const picks = selections.filter((pick) => pick.source === "Spell Mastery");
    const book = new Set(
      derived.resolvedSpells
        .filter(
          (pick) =>
            (pick.source === "Wizard" || pick.source.startsWith("Wizard:")) &&
            pick.status === "spellbook",
        )
        .map((pick) => pick.spellId),
    );
    if (
      picks.length !== 2 ||
      ![1, 2].every(
        (level) =>
          picks.filter((pick) => findSpell(pick.spellId)?.level === level)
            .length === 1,
      ) ||
      picks.some((pick) => !book.has(pick.spellId))
    )
      issues.push(
        "Spell Mastery requires one 1st-level and one 2nd-level spell from your Wizard spellbook.",
      );
    if (derived.classLevels.Wizard >= 20) {
      const signature = selections.filter(
        (pick) => pick.source === "Signature Spells",
      );
      if (
        signature.length !== 2 ||
        signature.some(
          (pick) =>
            findSpell(pick.spellId)?.level !== 3 || !book.has(pick.spellId),
        )
      )
        issues.push(
          "Signature Spells requires two 3rd-level spells from your Wizard spellbook.",
        );
    }
  }
  for (const feat of activeFeatSelections(character))
    if (["Magic Initiate", "Ritual Caster"].includes(feat.name)) {
      const list = character.featOptions?.[feat.key]?.[0] || "";
      const source = `${feat.name}: ${list}`;
      const picks = selections.filter((pick) => pick.source === source);
      if (feat.name === "Magic Initiate") {
        if (
          picks.filter((pick) => findSpell(pick.spellId)?.level === 0)
            .length !== 2 ||
          picks.filter((pick) => findSpell(pick.spellId)?.level === 1)
            .length !== 1 ||
          picks.length !== 3 ||
          picks.some((pick) => !findSpell(pick.spellId)?.classes.includes(list))
        )
          issues.push(
            `${source} requires two cantrips and one 1st-level spell from that class list, recorded under the feat's source.`,
          );
      } else if (
        picks.length < 2 ||
        picks.some((pick) => {
          const spell = findSpell(pick.spellId);
          return (
            !spell?.ritual ||
            !spell.classes.includes(list) ||
            spell.level > Math.ceil(character.level / 2)
          );
        })
      )
        issues.push(
          `${source} requires at least the two starting 1st-level rituals; later copied rituals must be on its class list and at most half character level, rounded up.`,
        );
    }
  for (const feat of activeFeatSelections(character).filter(
    (pick) => pick.name === "Spell Sniper",
  )) {
    const list = character.featOptions?.[feat.key]?.[0] || "";
    const picks = selections.filter(
      (pick) => pick.source === `Spell Sniper: ${list}`,
    );
    if (
      picks.length !== 1 ||
      picks.some((pick) => {
        const spell = findSpell(pick.spellId);
        return (
          spell?.level !== 0 || !spell.attack || !spell.classes.includes(list)
        );
      })
    )
      issues.push(
        `Spell Sniper: ${list} requires one cantrip from that class list that requires an attack roll.`,
      );
  }
  return [...new Set(issues)];
}

export type Derived = {
  classLevels: Record<string, number>;
  initialClass: string;
  proficiency: number;
  abilities: Record<string, number>;
  hp: number;
  hitDice: string;
  ac: number;
  initiative: number;
  speed: number;
  saves: Record<string, number>;
  skillBonuses: Record<string, number>;
  passivePerception: number;
  spellcasterLevel: number;
  spellSlots: number[];
  features: string[];
  featureEntries: FeatureEntry[];
  proficiencies: ProficiencyEntry[];
  attacks: (AttackEntry & { calculatedBonus: string })[];
  attacksPerAction: number;
  sneakAttackDice: number;
  martialArtsDie: string;
  kiPoints: number;
  pactSlots: number;
  pactSlotLevel: number;
  speedNotes: string;
  acFormula: string;
  calculations: Record<string, Calculation>;
  automaticAC: Calculation;
  abilityBreakdown: ReturnType<typeof abilityContributions>;
  spellcasting: SpellcastingProfile[];
  resolvedSpells: ResolvedSpell[];
  unarmoredDefense: string;
  armorNotes: string[];
};

export type SpellcastingProfile = {
  source: string;
  ability: string;
  classLevel: number;
  saveDC: number;
  attackBonus: number;
  cantripsKnown: number;
  spellsKnown: number | null;
  preparedLimit: number | null;
  maxSpellLevel: number;
  slots: number[];
  recovery: string;
};

export function isPatronSpell(character: Character, name: string) {
  return (
    (classLevelCounts(character).Warlock || 0) > 0 &&
    (patronExpandedSpells[character.subclass.Warlock] || []).includes(name)
  );
}

function proficiencyInventory(
  character: Character,
  classLevels: Record<string, number>,
  first: string,
  includeExpertise = true,
): ProficiencyEntry[] {
  const rows: ProficiencyEntry[] = [];
  const add = (
    name: string,
    kind: ProficiencyEntry["kind"],
    source: string,
    className = "",
    classLevel: number | null = null,
    characterLevel: number | null = null,
  ) => {
    if (!name.trim()) return;
    const existing = rows.find(
      (item) =>
        item.kind === kind && item.name.toLowerCase() === name.toLowerCase(),
    );
    if (existing) {
      if (!existing.source.includes(source)) existing.source += `; ${source}`;
      if (
        characterLevel !== null &&
        (existing.characterLevel === null ||
          characterLevel < existing.characterLevel)
      ) {
        existing.characterLevel = characterLevel;
        existing.className = className;
        existing.classLevel = classLevel;
      }
      return;
    }
    rows.push({
      id: `derived-prof-${kind}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name,
      kind,
      source,
      className,
      classLevel,
      characterLevel,
    });
  };
  const profKinds = (name: string): ProficiencyEntry["kind"] =>
    /armor/i.test(name)
      ? "Armor"
      : /weapon/i.test(name)
        ? "Weapon"
        : /vehicle/i.test(name)
          ? "Vehicle"
          : "Tool";
  const concrete = (name: string) =>
    !/^(choose|one skill|one musical|type of|artisan's tool or)/i.test(name);
  for (const className of Object.keys(classLevels)) {
    const training = classTraining[className];
    if (!training || !classLevels[className]) continue;
    const initial = className === first;
    const acquiredAt = initial
      ? 1
      : (Object.keys(character.levelPath)
          .map(Number)
          .sort((a, b) => a - b)
          .find((level) => character.levelPath[level] === className) ?? null);
    const proficiencyLevel = initial ? 1 : 1;
    const characterLevel = acquiredAt;
    const armor = initial
      ? training.armor
      : training.multiclassProficiencies.filter((x) => /armor|shield/i.test(x));
    const weapons = initial
      ? training.weapons
      : training.multiclassProficiencies.filter((x) => /weapon/i.test(x));
    const tools = initial
      ? training.tools
      : training.multiclassProficiencies.filter((x) =>
          /thieves' tools/i.test(x),
        );
    for (const name of armor)
      add(
        name,
        "Armor",
        `${className} ${initial ? "starting" : "multiclass"} training`,
        className,
        proficiencyLevel,
        characterLevel,
      );
    for (const name of weapons)
      add(
        name,
        "Weapon",
        `${className} ${initial ? "starting" : "multiclass"} training`,
        className,
        proficiencyLevel,
        characterLevel,
      );
    for (const name of tools.filter(concrete))
      add(
        name,
        profKinds(name),
        `${className} ${initial ? "starting" : "multiclass"} training`,
        className,
        proficiencyLevel,
        characterLevel,
      );
    if (initial)
      for (const name of training.saves)
        add(
          name,
          "Save",
          `${className} starting saving throw`,
          className,
          1,
          1,
        );
    if (className === "Druid")
      add(
        "Druidic",
        "Language",
        "Druid class feature",
        className,
        1,
        initial ? 1 : acquiredAt,
      );
    if (className === "Rogue")
      add(
        "Thieves' Cant",
        "Language",
        "Rogue class feature",
        className,
        1,
        initial ? 1 : acquiredAt,
      );
  }
  const addSubclassTraining = (
    className: string,
    classLevel: number,
    values: string[],
    kind: ProficiencyEntry["kind"],
  ) => {
    if ((classLevels[className] || 0) < classLevel) return;
    const acquiredAt = classCharacterLevel(character, className, classLevel);
    values.forEach((value) =>
      add(
        value,
        kind,
        `Subclass training: ${character.subclass[className]}`,
        className,
        classLevel,
        acquiredAt,
      ),
    );
  };
  if (character.subclass.Bard === "College of Valor") {
    addSubclassTraining("Bard", 3, ["Medium armor", "Shields"], "Armor");
    addSubclassTraining("Bard", 3, ["Martial weapons"], "Weapon");
  }
  if (character.subclass.Cleric === "Life Domain")
    addSubclassTraining("Cleric", 1, ["Heavy armor"], "Armor");
  if (character.subclass.Cleric === "Nature Domain")
    addSubclassTraining("Cleric", 1, ["Heavy armor"], "Armor");
  if (["Tempest Domain", "War Domain"].includes(character.subclass.Cleric)) {
    addSubclassTraining("Cleric", 1, ["Heavy armor"], "Armor");
    addSubclassTraining("Cleric", 1, ["Martial weapons"], "Weapon");
  }
  if (
    character.subclass.Fighter === "Battle Master" &&
    classLevels.Fighter >= 3
  )
    for (const name of character.subclassChoices?.["Fighter:3:student-tool"] ||
      [])
      add(
        name,
        "Tool",
        "Battle Master: Student of War",
        "Fighter",
        3,
        classCharacterLevel(character, "Fighter", 3),
      );
  const raceSource = `Race: ${character.subrace || character.race}`;
  if (raceProfiles[character.race]?.passiveSkillProficiencies)
    for (const name of raceProfiles[character.race].passiveSkillProficiencies)
      add(name, "Skill", raceSource, "", null, 1);
  const racialSkillCount =
    character.race === "Half-Elf"
      ? 2
      : character.race === "Human" && character.subrace.includes("Variant")
        ? 1
        : 0;
  for (const name of (character.raceSkills || [])
    .filter((name) => skills.includes(name))
    .slice(0, racialSkillCount))
    add(name, "Skill", raceSource, "", null, 1);
  if (character.race === "Dwarf")
    for (const name of ["Battleaxe", "Handaxe", "Light hammer", "Warhammer"])
      add(name, "Weapon", raceSource, "", null, 1);
  if (character.race === "Gnome" && character.subrace === "Rock Gnome")
    add("Tinker's tools", "Tool", raceSource, "", null, 1);
  if (
    character.race === "Elf" &&
    ["High Elf", "Wood Elf", "Dark Elf (Drow)"].includes(character.subrace)
  ) {
    for (const name of character.subrace === "Dark Elf (Drow)"
      ? ["Rapiers", "Shortswords", "Hand crossbows"]
      : ["Longswords", "Shortswords", "Shortbows", "Longbows"])
      add(name, "Weapon", raceSource, "", null, 1);
  }
  if (character.race === "Dwarf" && character.subrace === "Mountain Dwarf")
    for (const name of ["Light armor", "Medium armor"])
      add(name, "Armor", raceSource, "", null, 1);
  const skillSelections = selectedClassSkills(character);
  for (const [className, names] of Object.entries(skillSelections))
    for (const name of names) {
      if (!classLevels[className]) continue;
      const isInitial = className === first;
      const acquiredAt = isInitial
        ? 1
        : (Object.keys(character.levelPath)
            .map(Number)
            .sort((a, b) => a - b)
            .find((level) => character.levelPath[level] === className) ?? null);
      add(
        name,
        "Skill",
        `Class skill selection: ${className}`,
        className,
        1,
        acquiredAt,
      );
    }
  if (character.subclass.Bard === "College of Lore" && classLevels.Bard >= 3)
    for (const name of character.subclassChoices?.["Bard:3:lore-skills"] || [])
      add(
        name,
        "Skill",
        "College of Lore: Bonus Proficiencies",
        "Bard",
        3,
        classCharacterLevel(character, "Bard", 3),
      );
  if (
    character.subclass.Cleric === "Knowledge Domain" &&
    classLevels.Cleric >= 1
  )
    for (const name of character.subclassChoices?.[
      "Cleric:1:knowledge-skills"
    ] || [])
      add(
        name,
        "Skill",
        "Knowledge Domain: Blessings of Knowledge",
        "Cleric",
        1,
        classCharacterLevel(character, "Cleric", 1),
      );
  if (character.subclass.Cleric === "Nature Domain" && classLevels.Cleric >= 1)
    for (const name of character.subclassChoices?.["Cleric:1:nature-skill"] ||
      [])
      add(
        name,
        "Skill",
        "Nature Domain: Acolyte of Nature",
        "Cleric",
        1,
        classCharacterLevel(character, "Cleric", 1),
      );
  if ((classLevels.Monk || 0) >= 14)
    abilities.forEach((name) =>
      add(
        name,
        "Save",
        "Monk: Diamond Soul",
        "Monk",
        14,
        classCharacterLevel(character, "Monk", 14),
      ),
    );
  if ((classLevels.Rogue || 0) >= 15)
    add(
      "Wisdom",
      "Save",
      "Rogue: Slippery Mind",
      "Rogue",
      15,
      classCharacterLevel(character, "Rogue", 15),
    );
  if (
    character.subclass.Sorcerer === "Draconic Bloodline" &&
    classLevels.Sorcerer
  )
    add(
      "Draconic",
      "Language",
      "Draconic Bloodline: Dragon Ancestor",
      "Sorcerer",
      1,
      classCharacterLevel(character, "Sorcerer", 1),
    );
  if (
    classLevels.Warlock >= 2 &&
    Object.entries(activeSubclassChoices(character)).some(
      ([key, options]) =>
        key.startsWith("Warlock:") &&
        key.includes(":invocations-") &&
        options.includes("Beguiling Influence"),
    )
  )
    for (const name of ["Deception", "Persuasion"])
      add(
        name,
        "Skill",
        "Warlock: Beguiling Influence",
        "Warlock",
        2,
        classCharacterLevel(character, "Warlock", 2),
      );
  const bg = selectedBackground(character);
  for (const name of bg?.skills || [])
    add(name, "Skill", `Background: ${bg?.name}`, "", null, 1);
  for (const name of bg?.tools || [])
    if (
      !/^(one artisan tool|one gaming set|one musical instrument)$/i.test(name)
    )
      add(
        name,
        /vehicles/i.test(name) ? "Vehicle" : "Tool",
        `Background: ${bg?.name}`,
        "",
        null,
        1,
      );
  for (const plan of toolChoicePlans(character))
    for (const name of character.toolChoices?.[plan.key] || [])
      if (name !== "Additional language (Guild Merchant)")
        add(
          name,
          /vehicles/i.test(name) ? "Vehicle" : "Tool",
          plan.source,
          plan.className,
          plan.classLevel,
          plan.characterLevel,
        );
  for (const name of character.tools || [])
    add(
      name,
      /vehicles/i.test(name) ? "Vehicle" : "Tool",
      "Selected tool or instrument",
      "",
      null,
      1,
    );
  for (const plan of skillReplacementPlans(character)) {
    const chosen = character.skillReplacementChoices?.[plan.key] || "";
    if (plan.options.includes(chosen))
      add(
        chosen,
        "Skill",
        `${plan.source}: duplicate skill replacement`,
        plan.className,
        plan.classLevel,
        plan.characterLevel,
      );
  }
  for (const name of [
    ...(raceProfiles[character.race]?.languages || []),
    ...character.languages,
  ])
    add(
      name,
      "Language",
      raceProfiles[character.race]?.languages.includes(name)
        ? raceSource
        : "Additional race/background language choice",
      "",
      null,
      1,
    );
  if (
    character.subclass.Cleric === "Knowledge Domain" &&
    classLevels.Cleric >= 1
  )
    for (const name of character.subclassChoices?.[
      "Cleric:1:knowledge-languages"
    ] || [])
      add(
        name,
        "Language",
        "Knowledge Domain: Blessings of Knowledge",
        "Cleric",
        1,
        classCharacterLevel(character, "Cleric", 1),
      );
  if (classLevels.Ranger)
    for (const level of [1, 6, 14])
      if (classLevels.Ranger >= level)
        for (const name of character.subclassChoices?.[
          `Ranger:${level}:favored-language-${level}`
        ] || [])
          if (languageOptions.includes(name))
            add(
              name,
              "Language",
              `Ranger Favored Enemy language (level ${level})`,
              "Ranger",
              level,
              classCharacterLevel(character, "Ranger", level),
            );
  for (const item of character.otherProficiencies || [])
    add(
      item.name,
      item.kind,
      item.source || "Manually recorded proficiency",
      item.className,
      item.classLevel,
      item.characterLevel,
    );
  const trainedNames = new Set(
    rows
      .filter((item) => item.kind === "Skill" || item.kind === "Tool")
      .map((item) => item.name.toLowerCase()),
  );
  if (includeExpertise)
    for (const plan of expertisePlans(character))
      for (const name of character.expertiseChoices?.[plan.key] || []) {
        if (
          !plan.options.includes(name) ||
          !trainedNames.has(name.toLowerCase())
        )
          continue;
        const kind =
          rows.find((item) => item.name.toLowerCase() === name.toLowerCase())
            ?.kind || "Other";
        const level = plan.classLevel;
        const acquisition = classCharacterLevel(
          character,
          plan.className,
          level,
        );
        add(
          name,
          kind,
          `Expertise: ${plan.className} level ${level}`,
          plan.className,
          level,
          acquisition,
        );
        const entry = rows.find(
          (item) =>
            item.kind === kind &&
            item.name.toLowerCase() === name.toLowerCase(),
        );
        if (entry) entry.rank = "expertise";
      }
  if (character.featEnabled) {
    const featSelections = activeFeatSelections(character).map((pick) => ({
      ...pick,
      charLevel: pick.characterLevel,
    }));
    for (const featPick of featSelections) {
      const feat = findFeat(featPick.name);
      if (!feat) continue;
      const source = `Feat: ${feat.name}`;
      if (feat.name === "Lightly Armored")
        add(
          "Light armor",
          "Armor",
          source,
          featPick.className,
          featPick.classLevel,
          featPick.charLevel,
        );
      if (feat.name === "Moderately Armored") {
        add(
          "Medium armor",
          "Armor",
          source,
          featPick.className,
          featPick.classLevel,
          featPick.charLevel,
        );
        add(
          "Shields",
          "Armor",
          source,
          featPick.className,
          featPick.classLevel,
          featPick.charLevel,
        );
      }
      if (feat.name === "Heavily Armored")
        add(
          "Heavy armor",
          "Armor",
          source,
          featPick.className,
          featPick.classLevel,
          featPick.charLevel,
        );
      if (feat.name === "Resilient") {
        const ability = featAbilityFor(
          feat.name,
          character.asiChoices?.[featPick.key]?.abilities?.[0] ||
            character.raceFeatAbility,
        );
        if (ability)
          add(
            ability,
            "Save",
            source,
            featPick.className,
            featPick.classLevel,
            featPick.charLevel,
          );
      }
      if (feat.name === "Skilled")
        for (const option of character.featOptions?.[featPick.key] || []) {
          if (skills.includes(option))
            add(
              option,
              "Skill",
              source,
              featPick.className,
              featPick.classLevel,
              featPick.charLevel,
            );
          else if (option.startsWith("Musical instrument (")) {
            const label = option.slice(20, -1);
            const instrument =
              musicalInstrumentOptions.find(
                (item) => item.toLowerCase() === label.toLowerCase(),
              ) || label;
            add(
              instrument,
              "Tool",
              source,
              featPick.className,
              featPick.classLevel,
              featPick.charLevel,
            );
          } else
            add(
              option,
              /vehicles/i.test(option) ? "Vehicle" : "Tool",
              source,
              featPick.className,
              featPick.classLevel,
              featPick.charLevel,
            );
        }
      if (feat.name === "Weapon Master")
        for (const option of character.featOptions?.[featPick.key] || [])
          add(
            option,
            "Weapon",
            source,
            featPick.className,
            featPick.classLevel,
            featPick.charLevel,
          );
      if (feat.name === "Linguist")
        for (const option of character.featOptions?.[featPick.key] || [])
          if (languageOptions.includes(option))
            add(
              option,
              "Language",
              source,
              featPick.className,
              featPick.classLevel,
              featPick.charLevel,
            );
      if (feat.name === "Tavern Brawler")
        add(
          "Improvised weapons",
          "Weapon",
          source,
          featPick.className,
          featPick.classLevel,
          featPick.charLevel,
        );
    }
  }
  for (const [key, value] of Object.entries(character.sheetOverrides || {})) {
    const match = key.match(/^proficiency:(Skill|Save):(.+)$/);
    if (!match || !["0", "1"].includes(value)) continue;
    const kind = match[1] as "Skill" | "Save";
    const name = match[2];
    if (!(kind === "Skill" ? skills : abilities).includes(name)) continue;
    if (value === "0") {
      for (let index = rows.length - 1; index >= 0; index--)
        if (rows[index].kind === kind && rows[index].name === name)
          rows.splice(index, 1);
    } else
      add(
        name,
        kind,
        "Explicit imported/player proficiency override",
        "",
        null,
        null,
      );
  }
  return rows;
}

const simpleWeapons = weapons
  .filter((item) => item.category === "simple")
  .map((item) => item.name.toLowerCase());

const martialWeapons = weapons
  .filter((item) => item.category === "martial")
  .map((item) => item.name.toLowerCase());

type WeaponProfile = {
  die: string;
  type: string;
  range: string;
  properties: string;
  finesse?: boolean;
  ranged?: boolean;
  simpleMelee?: boolean;
};

const weaponProfiles: Record<string, WeaponProfile> = Object.fromEntries(
  weapons.map((item) => [
    item.name,
    {
      die: item.damage,
      type: item.damageType,
      range: item.normalRange
        ? `${item.normalRange}/${item.longRange} ft.`
        : `${item.reach} ft.`,
      properties: [
        ...item.properties,
        item.versatile ? `Versatile (${item.versatile})` : "",
      ]
        .filter(Boolean)
        .join(", "),
      finesse: item.properties.includes("finesse"),
      ranged: !item.melee,
      simpleMelee: item.category === "simple" && item.melee,
    },
  ]),
);

function weaponProfile(name: string) {
  const known = findWeapon(name);
  if (known) return weaponProfiles[known.name];
  const key = name
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .replace(/s$/i, "");
  return Object.entries(weaponProfiles).find(
    ([weapon]) =>
      weapon
        .toLowerCase()
        .replace(/[^a-z]/g, "")
        .replace(/s$/i, "") === key,
  )?.[1];
}

function knownWeaponCategory(
  name: string,
): "Simple weapons" | "Martial weapons" | "" {
  const normalized = name
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .replace(/s$/, "");
  const singularize = (weapon: string) =>
    weapon
      .toLowerCase()
      .replace(/[^a-z]/g, "")
      .replace(/s$/, "");
  if (simpleWeapons.some((weapon) => singularize(weapon) === normalized))
    return "Simple weapons";
  if (martialWeapons.some((weapon) => singularize(weapon) === normalized))
    return "Martial weapons";
  return "";
}

function attackProficient(
  attack: AttackEntry,
  proficiencies: ProficiencyEntry[],
) {
  if (/^unarmed(?: strike)?$/i.test(attack.name.trim())) return true;
  const category = knownWeaponCategory(attack.name);
  if (!category)
    return (
      attack.proficient ||
      (/improvised/i.test(`${attack.name} ${attack.properties}`) &&
        proficiencies.some(
          (item) => item.kind === "Weapon" && /improvised/i.test(item.name),
        ))
    );
  const name = attack.name
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .replace(/s$/, "");
  return proficiencies.some(
    (item) =>
      item.kind === "Weapon" &&
      (item.name.toLowerCase() === category.toLowerCase() ||
        item.name
          .toLowerCase()
          .replace(/[^a-z]/g, "")
          .replace(/s$/, "") === name),
  );
}

function isMonkWeapon(attack: AttackEntry, profile?: WeaponProfile) {
  return Boolean(
    profile &&
    !/heavy|two-handed/i.test(profile.properties) &&
    (profile.simpleMelee || attack.name.toLowerCase().includes("shortsword")),
  );
}

const armorProfiles: Record<
  string,
  {
    ac: number;
    category: "Light" | "Medium" | "Heavy";
    dexCap: number;
    strength?: number;
    stealth?: boolean;
  }
> = Object.fromEntries(
  catalogArmor
    .filter((item) => item.kind === "armor")
    .map((item) => [
      item.name,
      {
        ac: item.baseAc,
        category: (item.category[0].toUpperCase() + item.category.slice(1)) as
          "Light" | "Medium" | "Heavy",
        dexCap: item.dexterityCap === null ? Infinity : item.dexterityCap,
        strength: item.strengthRequirement,
        stealth: item.stealthDisadvantage,
      },
    ]),
);

function wornArmor(character: Character) {
  const item = findArmor(character.equippedArmor || "");
  return item && item.kind === "armor"
    ? ([item.name, armorProfiles[item.name]] as [
        string,
        (typeof armorProfiles)[string],
      ])
    : undefined;
}

export function firstUnarmoredDefense(character: Character): string {
  const levels = classLevelCounts(character);
  const candidates = ["Barbarian", "Monk"].filter((name) => levels[name]);
  if (candidates.length < 2) return candidates[0] || "";
  const ordered = candidates.map((name) => ({
    name,
    gained: classCharacterLevel(character, name, 1),
  }));
  if (ordered.some((item) => item.gained === null))
    return ["Barbarian", "Monk"].includes(initialClass(character))
      ? initialClass(character)
      : "";
  return ordered.sort((a, b) => a.gained! - b.gained!)[0].name;
}

function martialArtsActive(
  character: Character,
  classLevels: Record<string, number>,
) {
  if (!classLevels.Monk || character.equippedArmor || character.equippedShield)
    return false;
  return !activeEquipmentItems(character).some(
    (item) =>
      item.equipped &&
      item.quantity > 0 &&
      weaponProfile(item.name) &&
      !isMonkWeapon(
        { name: item.name } as AttackEntry,
        weaponProfile(item.name),
      ),
  );
}

function fightingStyles(character: Character) {
  return new Set(
    Object.entries(classLevelCounts(character)).flatMap(([className, level]) =>
      getSubclassChoicePlans(
        className,
        character.subclass[className] || "",
        level,
      )
        .filter((plan) => plan.key.startsWith("fighting-style-"))
        .flatMap(
          (plan) =>
            character.subclassChoices?.[
              `${className}:${plan.unlockLevel}:${plan.key}`
            ] || [],
        ),
    ),
  );
}

function attackAbility(
  attack: AttackEntry,
  character: Character,
  classLevels: Record<string, number>,
  final: Record<string, number>,
  profile?: WeaponProfile,
) {
  if (attack.ability && abilities.includes(attack.ability))
    return attack.ability;
  const unarmed = /^unarmed(?: strike)?$/i.test(attack.name.trim());
  const monkWeapon =
    martialArtsActive(character, classLevels) && isMonkWeapon(attack, profile);
  if ((unarmed || monkWeapon) && martialArtsActive(character, classLevels))
    return final.Dexterity >= final.Strength ? "Dexterity" : "Strength";
  if (unarmed) return "Strength";
  if (profile?.finesse || /finesse/i.test(attack.properties))
    return final.Dexterity >= final.Strength ? "Dexterity" : "Strength";
  if (profile?.ranged) return "Dexterity";
  if (/spell|cantrip/i.test(`${attack.name} ${attack.source}`)) {
    const sourceClass = character.classes.find((className) =>
      `${attack.name} ${attack.source}`
        .toLowerCase()
        .includes(className.toLowerCase()),
    );
    return (
      classTraining[sourceClass || initialClass(character) || ""]
        ?.spellAbility || "Charisma"
    );
  }
  return "Strength";
}

function attackDamage(
  attack: AttackEntry,
  character: Character,
  classLevels: Record<string, number>,
  final: Record<string, number>,
  ability: string,
  profile?: WeaponProfile,
) {
  if (attack.damage.trim()) return attack.damage;
  const mod = abilityModifier(final[ability] ?? 10);
  const unarmed = /^unarmed(?: strike)?$/i.test(attack.name.trim());
  if (unarmed) {
    const monkLevel = martialArtsActive(character, classLevels)
      ? classLevels.Monk || 0
      : 0;
    const tavernBrawler = activeFeatSelections(character).some(
      (pick) => pick.name === "Tavern Brawler",
    );
    const monkDie = monkLevel
      ? classProgression.Monk.levels[monkLevel - 1].martialArtsDie || "d4"
      : tavernBrawler
        ? "d4"
        : "1";
    const die = monkDie.startsWith("d") ? `1${monkDie}` : monkDie;
    return `${die}${mod ? ` ${formatMod(mod)}` : ""} bludgeoning`;
  }
  if (!profile) return "";
  if (profile.die === "—") return "Special";
  const monkLevel = martialArtsActive(character, classLevels)
    ? classLevels.Monk || 0
    : 0;
  const weaponDie =
    attack.mode === "two-handed"
      ? profile.properties.match(/versatile \((\d+d\d+)\)/i)?.[1] || profile.die
      : profile.die;
  const monkDie =
    monkLevel && isMonkWeapon(attack, profile)
      ? classProgression.Monk.levels[monkLevel - 1].martialArtsDie || weaponDie
      : weaponDie;
  const average = (die: string) => {
    const match = die.match(/^(\d*)d(\d+)$/i);
    return match
      ? (Number(match[1] || 1) * (Number(match[2]) + 1)) / 2
      : Number(die) || 0;
  };
  const bestDie = average(monkDie) > average(weaponDie) ? monkDie : weaponDie;
  const die = bestDie.startsWith("d") ? `1${bestDie}` : bestDie;
  const appliedMod =
    attack.mode === "off-hand" &&
    mod > 0 &&
    !fightingStyles(character).has("Two-Weapon Fighting")
      ? 0
      : mod;
  return `${die}${appliedMod ? ` ${formatMod(appliedMod)}` : ""} ${profile.type}`;
}

function automaticWeaponNames(
  character: Character,
): { name: string; source: string; mode?: AttackEntry["mode"] }[] {
  const found = new Map<
    string,
    { name: string; source: string; mode?: AttackEntry["mode"] }
  >();
  const profileNames = Object.keys(weaponProfiles).sort(
    (a, b) => b.length - a.length,
  );
  const addFromText = (text: string, source: string, exact = false) => {
    const normalized = text.toLowerCase();
    for (const name of profileNames) {
      const escaped = name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const plural = name.toLowerCase().endsWith("s") ? "" : "s?";
      if (
        (exact && normalized.trim() === name.toLowerCase()) ||
        (!exact &&
          new RegExp(
            `(?:^|[^a-z])${escaped.replace(/ /g, "\\s+")}${plural}(?:$|[^a-z])`,
            "i",
          ).test(normalized))
      ) {
        const key = name.toLowerCase();
        if (!found.has(key)) found.set(key, { name, source });
      }
    }
  };
  if (character.equipmentMethod !== "wealth")
    for (const packageName of character.equipment)
      if (!/^(start|pick|background|background-gp):/.test(packageName))
        addFromText(packageName, `Starting equipment: ${packageName}`);
  for (const item of activeEquipmentItems(character))
    if (item.quantity > 0 && item.name.trim()) {
      addFromText(item.name, item.source || "Inventory", true);
      const key = item.name.toLowerCase();
      const existing = found.get(key);
      if (existing && item.mode) existing.mode = item.mode;
    }
  return [...found.values()];
}

export function spellSelectionsForSheet(character: Character): ResolvedSpell[] {
  const scores = finalAbilities(character);
  const bonus = proficiencyBonus(character.level);
  const levels = classLevelCounts(character);
  const output: ResolvedSpell[] = [];
  const add = (
    name: string,
    source: string,
    status: SpellSelection["status"],
    ability: string,
    uses: string,
    automatic = true,
    acquiredLevel?: number,
  ) => {
    const definition = findSpell(name);
    const spellId = definition?.id || name;
    if (
      output.some(
        (row) =>
          row.spellId === spellId &&
          row.source === source &&
          row.status === status,
      )
    )
      return;
    output.push({
      spellId,
      name: definition?.name || name,
      source,
      status,
      ability,
      saveDC: 8 + bonus + abilityModifier(scores[ability] || 10),
      attackBonus: bonus + abilityModifier(scores[ability] || 10),
      uses,
      definition,
      automatic,
      acquiredLevel,
    });
  };
  for (const pick of character.spellSelections || []) {
    if (!isSpellChoiceAvailable(character, pick)) continue;
    let ability =
      classTraining[pick.source]?.spellAbility ||
      (["Fighter", "Rogue"].includes(pick.source) ? "Intelligence" : "");
    if (
      /high elf|forest gnome|wizard|arcane trickster|eldritch knight|spell mastery|signature spells/i.test(
        pick.source,
      )
    )
      ability = "Intelligence";
    if (
      /drow|tiefling|bard|sorcerer|warlock|paladin|pact of the tome|book of ancient secrets|magical secrets/i.test(
        pick.source,
      )
    )
      ability = "Charisma";
    if (
      /druid|cleric|ranger|monk|nature domain|circle of the land/i.test(
        pick.source,
      )
    )
      ability = "Wisdom";
    add(
      pick.spellId,
      pick.source,
      pick.status,
      ability || "Intelligence",
      pick.status === "arcanum"
        ? "Mystic Arcanum: once per long rest; does not use a spell slot"
        : pick.source === "Spell Mastery"
          ? "At will at its lowest spell level while prepared; expending a slot permits higher-level casting"
          : pick.source === "Signature Spells"
            ? "Always prepared without preparation cost; once per short or long rest at 3rd level without a slot; slots may also be used"
            : pick.status === "innate"
              ? "See granting feature for uses and recovery"
              : "Use the source's spellcasting rules",
      false,
      pick.acquiredLevel,
    );
  }
  if (character.race === "Tiefling") {
    add(
      "Thaumaturgy",
      "Tiefling: Infernal Legacy",
      "innate",
      "Charisma",
      "At will",
      true,
      1,
    );
    if (character.level >= 3)
      add(
        "Hellish Rebuke",
        "Tiefling: Infernal Legacy",
        "innate",
        "Charisma",
        "Once per long rest, cast as a 2nd-level spell",
        true,
        3,
      );
    if (character.level >= 5)
      add(
        "Darkness",
        "Tiefling: Infernal Legacy",
        "innate",
        "Charisma",
        "Once per long rest",
        true,
        5,
      );
  }
  if (character.race === "Elf" && character.subrace === "Dark Elf (Drow)") {
    add(
      "Dancing Lights",
      "Drow: Drow Magic",
      "innate",
      "Charisma",
      "At will",
      true,
      1,
    );
    if (character.level >= 3)
      add(
        "Faerie Fire",
        "Drow: Drow Magic",
        "innate",
        "Charisma",
        "Once per long rest",
        true,
        3,
      );
    if (character.level >= 5)
      add(
        "Darkness",
        "Drow: Drow Magic",
        "innate",
        "Charisma",
        "Once per long rest",
        true,
        5,
      );
  }
  if (character.race === "Gnome" && character.subrace === "Forest Gnome")
    add(
      "Minor Illusion",
      "Forest Gnome: Natural Illusionist",
      "innate",
      "Intelligence",
      "At will",
      true,
      1,
    );
  if (character.subclass.Cleric === "Light Domain" && levels.Cleric)
    add(
      "Light",
      "Light Domain: Bonus Cantrip",
      "innate",
      "Wisdom",
      "At will; additional cleric cantrip",
      true,
      classCharacterLevel(character, "Cleric", 1) ?? undefined,
    );
  const preparedTable = (
    className: string,
    table: string[][] | undefined,
    unlocks: number[],
    source: string,
  ) =>
    table?.forEach((names, index) => {
      if ((levels[className] || 0) >= unlocks[index])
        names.forEach((name) =>
          add(
            name,
            source,
            "prepared",
            classTraining[className].spellAbility!,
            "Always prepared; does not count against the preparation limit",
            true,
            classCharacterLevel(character, className, unlocks[index]) ??
              undefined,
          ),
        );
    });
  preparedTable(
    "Cleric",
    domainSpells[character.subclass.Cleric],
    [1, 3, 5, 7, 9],
    `Cleric: ${character.subclass.Cleric}`,
  );
  preparedTable(
    "Paladin",
    oathSpells[character.subclass.Paladin],
    [3, 5, 9, 13, 17],
    `Paladin: ${character.subclass.Paladin}`,
  );
  if (character.subclass.Druid === "Circle of the Land")
    preparedTable(
      "Druid",
      landSpells[character.subclassChoices?.["Druid:2:land"]?.[0] || ""],
      [3, 5, 7, 9],
      "Druid: Circle of the Land",
    );
  if (character.subclass.Monk === "Way of Shadow" && (levels.Monk || 0) >= 3) {
    add(
      "Minor Illusion",
      "Monk: Shadow Arts",
      "innate",
      "Wisdom",
      "At will",
      true,
      classCharacterLevel(character, "Monk", 3) ?? undefined,
    );
    ["Darkness", "Darkvision", "Pass without Trace", "Silence"].forEach(
      (name) =>
        add(
          name,
          "Monk: Shadow Arts",
          "innate",
          "Wisdom",
          "Spend 2 ki; cast without material components",
          true,
          classCharacterLevel(character, "Monk", 3) ?? undefined,
        ),
    );
  }
  if (
    character.subclass.Druid === "Circle of the Moon" &&
    (levels.Druid || 0) >= 14
  )
    add(
      "Alter Self",
      "Druid: Thousand Forms",
      "innate",
      "Wisdom",
      "At will; no spell slot",
      true,
      classCharacterLevel(character, "Druid", 14) ?? undefined,
    );
  if (
    character.subclass.Wizard === "School of Necromancy" &&
    (levels.Wizard || 0) >= 6
  )
    add(
      "Animate Dead",
      "Wizard: Undead Thralls",
      "spellbook",
      "Intelligence",
      "Added to the spellbook if not already present; use normal preparation and spell slots",
      true,
      classCharacterLevel(character, "Wizard", 6) ?? undefined,
    );
  if (
    character.subclass.Wizard === "School of Transmutation" &&
    (levels.Wizard || 0) >= 10
  ) {
    add(
      "Polymorph",
      "Wizard: Shapechanger",
      "spellbook",
      "Intelligence",
      "Added to spellbook if not already present",
      true,
      classCharacterLevel(character, "Wizard", 10) ?? undefined,
    );
    add(
      "Polymorph",
      "Wizard: Shapechanger",
      "innate",
      "Intelligence",
      "Once per short or long rest without a slot; target yourself; beast CR 1 or lower",
      true,
      classCharacterLevel(character, "Wizard", 10) ?? undefined,
    );
  }
  if (
    character.subclass.Barbarian === "Path of the Totem Warrior" &&
    (levels.Barbarian || 0) >= 3
  ) {
    ["Beast Sense", "Speak with Animals"].forEach((name) =>
      add(
        name,
        "Barbarian: Spirit Seeker",
        "ritual",
        "Wisdom",
        "Ritual casting only",
        true,
        classCharacterLevel(character, "Barbarian", 3) ?? undefined,
      ),
    );
    if (levels.Barbarian >= 10)
      add(
        "Commune with Nature",
        "Barbarian: Spirit Walker",
        "ritual",
        "Wisdom",
        "Ritual casting only",
        true,
        classCharacterLevel(character, "Barbarian", 10) ?? undefined,
      );
  }
  const invocations = new Set(
    Object.entries(activeSubclassChoices(character))
      .filter(
        ([key]) => key.startsWith("Warlock:") && key.includes(":invocations-"),
      )
      .flatMap(([, options]) => options),
  );
  const invocationSpells: [string, string, string][] = [
    [
      "Armor of Shadows",
      "Mage Armor",
      "At will, targeting yourself; no spell slot or material components. AC applies only while the spell is active.",
    ],
    [
      "Ascendant Step",
      "Levitate",
      "At will, targeting yourself; no slot or material components",
    ],
    ["Beast Speech", "Speak with Animals", "At will; no spell slot"],
    [
      "Chains of Carceri",
      "Hold Monster",
      "At will against celestials, fiends or elementals; no slot/materials. Each target once per long rest",
    ],
    ["Eldritch Sight", "Detect Magic", "At will; no spell slot"],
    [
      "Fiendish Vigor",
      "False Life",
      "At will at 1st level, targeting yourself; no slot or material components",
    ],
    ["Mask of Many Faces", "Disguise Self", "At will; no spell slot"],
    ["Master of Myriad Forms", "Alter Self", "At will; no spell slot"],
    [
      "Minions of Chaos",
      "Conjure Elemental",
      "Once per long rest; expends a Warlock slot",
    ],
    ["Mire the Mind", "Slow", "Once per long rest; expends a Warlock slot"],
    [
      "Misty Visions",
      "Silent Image",
      "At will; no slot or material components",
    ],
    [
      "Otherworldly Leap",
      "Jump",
      "At will, targeting yourself; no slot or material components",
    ],
    [
      "Sculptor of Flesh",
      "Polymorph",
      "Once per long rest; expends a Warlock slot",
    ],
    [
      "Sign of Ill Omen",
      "Bestow Curse",
      "Once per long rest; expends a Warlock slot",
    ],
    [
      "Thief of Five Fates",
      "Bane",
      "Once per long rest; expends a Warlock slot",
    ],
    ["Visions of Distant Realms", "Arcane Eye", "At will; no spell slot"],
    ["Whispers of the Grave", "Speak with Dead", "At will; no spell slot"],
  ];
  if (levels.Warlock >= 2)
    invocationSpells.forEach(([invocation, spell, uses]) => {
      if (invocations.has(invocation))
        add(spell, `Warlock: ${invocation}`, "innate", "Charisma", uses);
    });
  if (
    (character.subclassChoices?.["Warlock:3:pact-boon"] || []).includes(
      "Pact of the Chain",
    ) &&
    levels.Warlock >= 3
  )
    add(
      "Find Familiar",
      "Warlock: Pact of the Chain",
      "ritual",
      "Charisma",
      "May cast as a ritual; additional familiar forms are described by Pact of the Chain",
      true,
      classCharacterLevel(character, "Warlock", 3) ?? undefined,
    );
  return output;
}

export function derive(character: Character): Derived {
  const classLevels = classLevelCounts(character);
  const first = initialClass(character) || "";
  const initial = selectedClass(first);
  const final = finalAbilities(character);
  const featNames = new Set(
    activeFeatSelections(character)
      .map((pick) =>
        pick.name
          .trim()
          .toLowerCase()
          .replace(/[^a-z]/g, ""),
      )
      .filter(Boolean),
  );
  const prof = proficiencyBonus(character.level);
  const con = abilityModifier(final.Constitution);
  const hpBase =
    (initial?.hitDie || 8) +
    con +
    Array.from({ length: Math.max(0, character.level - 1) }, (_, i) => {
      const level = i + 2;
      const gained =
        character.classMode === "single" ? first : character.levelPath[level];
      const hitDie = selectedClass(gained)?.hitDie || 8;
      const roll =
        character.hpMethod === "rolled"
          ? character.hpRolls?.[level]
          : undefined;
      return Math.max(
        1,
        (roll !== undefined &&
        Number.isInteger(roll) &&
        roll >= 1 &&
        roll <= hitDie
          ? roll
          : hitDie / 2 + 1) + con,
      );
    }).reduce((a, b) => a + b, 0);
  const draconicHP =
    character.subclass.Sorcerer === "Draconic Bloodline"
      ? classLevels.Sorcerer || 0
      : 0;
  const hp = Math.max(
    1,
    hpBase +
      (character.race === "Dwarf" && character.subrace === "Hill Dwarf"
        ? character.level
        : 0) +
      (featNames.has("tough") ? character.level * 2 : 0) +
      draconicHP,
  );
  const proficiencies = proficiencyInventory(character, classLevels, first);
  const saves = Object.fromEntries(
    abilities.map((a) => [
      a,
      abilityModifier(final[a]) +
        (proficiencies.some((item) => item.kind === "Save" && item.name === a)
          ? prof
          : 0),
    ]),
  ) as Record<string, number>;
  const trained = new Set(
    proficiencies
      .filter((item) => item.kind === "Skill")
      .map((item) => item.name),
  );
  const expertise = new Set(
    expertisePlans(character)
      .flatMap((plan) => character.expertiseChoices?.[plan.key] || [])
      .filter((name) => trained.has(name)),
  );
  if (character.subclass.Cleric === "Knowledge Domain" && classLevels.Cleric)
    for (const name of character.subclassChoices?.[
      "Cleric:1:knowledge-skills"
    ] || [])
      if (trained.has(name)) expertise.add(name);
  const skillAbilities: Record<string, string> = {
    Acrobatics: "Dexterity",
    "Sleight of Hand": "Dexterity",
    Stealth: "Dexterity",
    "Animal Handling": "Wisdom",
    Insight: "Wisdom",
    Medicine: "Wisdom",
    Perception: "Wisdom",
    Survival: "Wisdom",
    Arcana: "Intelligence",
    History: "Intelligence",
    Investigation: "Intelligence",
    Nature: "Intelligence",
    Religion: "Intelligence",
    Athletics: "Strength",
    Deception: "Charisma",
    Intimidation: "Charisma",
    Performance: "Charisma",
    Persuasion: "Charisma",
  };
  const jackOfAllTrades = (classLevels.Bard || 0) >= 2;
  const remarkableAthlete =
    character.subclass.Fighter === "Champion" &&
    (classLevels.Fighter || 0) >= 7;
  const checkProficiency = (ability: string) =>
    Math.max(
      jackOfAllTrades ? Math.floor(prof / 2) : 0,
      remarkableAthlete &&
        ["Strength", "Dexterity", "Constitution"].includes(ability)
        ? Math.ceil(prof / 2)
        : 0,
    );
  const skillBonuses = Object.fromEntries(
    skills.map((s) => [
      s,
      abilityModifier(final[skillAbilities[s]]) +
        (trained.has(s)
          ? prof * (expertise.has(s) ? 2 : 1)
          : checkProficiency(skillAbilities[s])),
    ]),
  ) as Record<string, number>;
  const slotsByLevel: Record<number, number[]> = {
    1: [2],
    2: [3],
    3: [4, 2],
    4: [4, 3],
    5: [4, 3, 2],
    6: [4, 3, 3],
    7: [4, 3, 3, 1],
    8: [4, 3, 3, 2],
    9: [4, 3, 3, 3, 1],
    10: [4, 3, 3, 3, 2],
    11: [4, 3, 3, 3, 2, 1],
    12: [4, 3, 3, 3, 2, 1],
    13: [4, 3, 3, 3, 2, 1, 1],
    14: [4, 3, 3, 3, 2, 1, 1],
    15: [4, 3, 3, 3, 2, 1, 1, 1],
    16: [4, 3, 3, 3, 2, 1, 1, 1],
    17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
    18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
    19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
    20: [4, 3, 3, 3, 3, 2, 2, 1, 1],
  };
  const spellcastingClasses = Object.keys(classLevels).filter((name) => {
    const training = classTraining[name];
    const level = classLevels[name] || 0;
    if (training?.casting === "full") return level > 0;
    if (training?.casting === "half") return level >= 2;
    if (name === "Fighter")
      return level >= 3 && character.subclass[name] === "Eldritch Knight";
    if (name === "Rogue")
      return level >= 3 && character.subclass[name] === "Arcane Trickster";
    return false;
  });
  const hasSpellcasting = spellcastingClasses.length > 0;
  let spellcasterLevel = 0;
  if (character.classMode === "single" || spellcastingClasses.length === 1) {
    const casterName = spellcastingClasses[0] || first;
    const klass = classTraining[casterName];
    const classLevel = classLevels[casterName] || 0;
    spellcasterLevel =
      klass?.casting === "full"
        ? classLevel
        : klass?.casting === "half"
          ? Math.floor((classLevel + 1) / 2)
          : casterName === "Fighter" || casterName === "Rogue"
            ? Math.floor(classLevel / 3)
            : 0;
  } else {
    for (const [name, n] of Object.entries(classLevels)) {
      const casting = classTraining[name]?.casting;
      if (casting === "full") spellcasterLevel += n;
      if (casting === "half") spellcasterLevel += Math.floor(n / 2);
      if (name === "Fighter" && character.subclass[name] === "Eldritch Knight")
        spellcasterLevel += Math.floor(n / 3);
      if (name === "Rogue" && character.subclass[name] === "Arcane Trickster")
        spellcasterLevel += Math.floor(n / 3);
    }
  }
  const pactLevel = classLevels.Warlock || 0;
  const pactRow = pactLevel
    ? classProgression.Warlock.levels[pactLevel - 1]
    : undefined;
  const slots =
    spellcasterLevel > 0
      ? slotsByLevel[Math.min(20, spellcasterLevel)] || []
      : [];
  const onlyCaster =
    spellcastingClasses.length === 1 ? spellcastingClasses[0] : first;
  if (
    (character.classMode === "single" || spellcastingClasses.length === 1) &&
    ["Paladin", "Ranger"].includes(onlyCaster) &&
    classLevels[onlyCaster]
  ) {
    const rowSlots =
      classProgression[onlyCaster].levels[classLevels[onlyCaster] - 1]
        .spellSlots || [];
    slots.splice(0, slots.length, ...rowSlots);
  }
  const thirdSlots = (level: number) =>
    level < 3
      ? []
      : level < 4
        ? [2]
        : level < 7
          ? [3]
          : level < 10
            ? [4, 2]
            : level < 13
              ? [4, 3]
              : level < 16
                ? [4, 3, 2]
                : level < 19
                  ? [4, 3, 3]
                  : [4, 3, 3, 1];
  if (
    spellcastingClasses.length === 1 &&
    ["Fighter", "Rogue"].includes(onlyCaster)
  )
    slots.splice(0, slots.length, ...thirdSlots(classLevels[onlyCaster]));
  const spellcasting: SpellcastingProfile[] = [
    ...spellcastingClasses,
    ...(pactLevel ? ["Warlock"] : []),
  ].map((source) => {
    const level = classLevels[source];
    const row = classProgression[source]?.levels[level - 1];
    const third = ["Fighter", "Rogue"].includes(source);
    const ability = classTraining[source]?.spellAbility || "Intelligence";
    const classSlots = third ? thirdSlots(level) : row?.spellSlots || [];
    const cantripsKnown = third
      ? (source === "Rogue" ? 3 : 2) + (level >= 10 ? 1 : 0)
      : row?.cantripsKnown || 0;
    const thirdKnown =
      level < 3
        ? 0
        : [3, 4, 7, 8, 10, 11, 13, 14, 16, 19, 20].filter(
            (unlock) => level >= unlock,
          ).length + 2;
    const prepared = ["Cleric", "Druid", "Wizard", "Paladin"].includes(source);
    return {
      source,
      ability,
      classLevel: level,
      saveDC: 8 + prof + abilityModifier(final[ability]),
      attackBonus: prof + abilityModifier(final[ability]),
      cantripsKnown,
      spellsKnown: prepared
        ? null
        : third
          ? thirdKnown
          : (row?.spellsKnown ?? null),
      preparedLimit: prepared
        ? Math.max(
            1,
            (source === "Paladin" ? Math.floor(level / 2) : level) +
              abilityModifier(final[ability]),
          )
        : null,
      maxSpellLevel:
        source === "Warlock" ? pactRow?.pactSlotLevel || 0 : classSlots.length,
      slots: source === "Warlock" ? [pactRow?.pactSlots || 0] : [...classSlots],
      recovery:
        source === "Warlock"
          ? "Pact Magic slots recover after a short or long rest; separate from ordinary Spellcasting slots"
          : "Spellcasting slots recover after a long rest; feature-specific recovery may apply",
    };
  });
  const featureEntries = featureEntriesForSheet(character);
  const featureNames = [
    ...new Set(
      featureEntries.map((item) => `${item.sourceType}: ${item.name}`),
    ),
  ];
  const resolvedSpells = spellSelectionsForSheet(character);
  const automatic: AttackEntry[] = automaticWeaponNames(character).map(
    ({ name, source, mode }) => ({
      id: `auto-weapon-${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
      name,
      attackBonus: "",
      damage: "",
      range: "",
      properties: "",
      ability: "",
      proficient: false,
      source,
      mode,
    }),
  );
  automatic.push({
    id: "auto-unarmed-strike",
    name: "Unarmed Strike",
    attackBonus: "",
    damage: "",
    range: "5 ft.",
    properties: "",
    ability: "",
    proficient: true,
    source: "Available to every character",
  });
  const generatedSpellAttacks = new Set<string>();
  for (const spell of resolvedSpells)
    if (
      spell.definition?.attack &&
      (spell.acquiredLevel === undefined ||
        spell.acquiredLevel <= character.level)
    ) {
      const spellAttackKey = `${spell.source}:${spell.spellId}`;
      const attack = spell.definition.attack;
      const scale =
        attack.scaling === "cantrip"
          ? character.level >= 17
            ? 4
            : character.level >= 11
              ? 3
              : character.level >= 5
                ? 2
                : 1
          : 1;
      const damage = attack.dice.replace(
        /^(\d+)d/,
        (_, n) => `${attack.beams ? Number(n) : Number(n) * scale}d`,
      );
      const agonizing =
        spell.definition.name === "Eldritch Blast" &&
        Object.values(activeSubclassChoices(character)).some((options) =>
          options.includes("Agonizing Blast"),
        ) &&
        classLevels.Warlock >= 2
          ? abilityModifier(final.Charisma)
          : 0;
      const eldritchSpear =
        spell.name === "Eldritch Blast" &&
        Object.entries(activeSubclassChoices(character)).some(
          ([key, options]) =>
            key.startsWith("Warlock:") && options.includes("Eldritch Spear"),
        ) &&
        classLevels.Warlock >= 2;
      const range = (
        eldritchSpear ? "300 feet" : spell.definition.range
      ).replace(
        /^(\d+) (feet|foot|ft\.?)/i,
        (_, distance, unit) =>
          `${Number(distance) * (featNames.has("spellsniper") ? 2 : 1)} ${unit}`,
      );
      const resolvedAttack: AttackEntry = {
        id: `auto-spell-${spell.source.replace(/[^a-z0-9]/gi, "-")}-${spell.spellId}`,
        name: `${spell.name} (${spell.source})`,
        attackBonus: formatMod(spell.attackBonus),
        damage: `${damage}${agonizing ? ` ${formatMod(agonizing)}` : ""} ${attack.damageType}`,
        range,
        properties: [
          `${attack.kind} spell attack; ${spell.uses}`,
          attack.beams
            ? `${scale} beam${scale > 1 ? "s" : ""}; separate attack roll for each beam; damage shown per beam`
            : "",
          spell.definition.level
            ? `Base spell level ${spell.definition.level}; upcasting is chosen when cast`
            : "Cantrip damage scales with total character level",
          agonizing ? "Agonizing Blast adds Charisma to each beam" : "",
          featNames.has("spellsniper")
            ? "Spell Sniper doubles numeric spell range and ignores half and three-quarters cover"
            : "",
        ]
          .filter(Boolean)
          .join("; "),
        ability: spell.ability,
        proficient: true,
        source: `Spell: ${spell.source}`,
      };
      spell.attack = resolvedAttack;
      if (
        spell.status !== "spellbook" &&
        !generatedSpellAttacks.has(spellAttackKey)
      ) {
        generatedSpellAttacks.add(spellAttackKey);
        automatic.push(resolvedAttack);
      }
    }
  for (const spell of resolvedSpells) {
    const effect = spell.definition?.saveDamage;
    if (
      !effect ||
      !spell.definition ||
      (spell.acquiredLevel !== undefined &&
        spell.acquiredLevel > character.level)
    )
      continue;
    const scale =
      effect.scaling === "cantrip"
        ? character.level >= 17
          ? 4
          : character.level >= 11
            ? 3
            : character.level >= 5
              ? 2
              : 1
        : 1;
    // Infernal Legacy fixes this particular cast at 2nd level; ordinary slot choice happens at casting time.
    const extraDice =
      spell.source === "Tiefling: Infernal Legacy" &&
      spell.name === "Hellish Rebuke"
        ? effect.higherSlotDice || 0
        : 0;
    const damage = effect.dice.replace(
      /^(\d+)d/,
      (_, count) => `${Number(count) * scale + extraDice}d`,
    );
    const reference: AttackEntry = {
      id: `auto-spell-${spell.source.replace(/[^a-z0-9]/gi, "-")}-${spell.spellId}`,
      name: `${spell.name} (${spell.source})`,
      attackBonus: `${effect.ability.slice(0, 3).toUpperCase()} DC ${spell.saveDC}`,
      damage: `${damage} ${effect.damageType}`,
      range: spell.definition.range,
      properties: `${effect.onSave === "half" ? "Half damage on a successful save" : "No damage on a successful save"}; ${spell.definition.castingTime}${/^Use the source's spellcasting rules/.test(spell.uses) ? "" : `; ${spell.uses}`}`,
      ability: spell.ability,
      proficient: false,
      source: `Spell: ${spell.source}`,
    };
    spell.attack = reference;
    const key = `${spell.source}:${spell.spellId}`;
    if (spell.status !== "spellbook" && !generatedSpellAttacks.has(key)) {
      generatedSpellAttacks.add(key);
      automatic.push(reference);
    }
  }
  if (character.race === "Dragonborn") {
    const ancestry = dragonbornAncestryFor(
      character.subrace,
      character.ancestry,
    );
    const damage =
      character.level >= 16
        ? "5d6"
        : character.level >= 11
          ? "4d6"
          : character.level >= 6
            ? "3d6"
            : "2d6";
    const type = ancestry
      ? dragonDamageType(ancestry)
      : "ancestry type unresolved";
    const shape = ancestry ? dragonBreathShape(ancestry) : "shape unresolved";
    automatic.push({
      id: "auto-dragonborn-breath",
      name: "Breath Weapon",
      attackBonus: `Save DC ${8 + prof + abilityModifier(final.Constitution)}`,
      damage: `${damage} ${type || "damage type unresolved"}`,
      range: shape,
      properties: "Recharge: short or long rest",
      ability: "",
      proficient: false,
      source: "Dragonborn ancestry",
    });
  }
  const manualByName = new Map(
    character.attacks
      .filter((item) => item.name.trim())
      .map((item) => [item.name.trim().toLowerCase(), item]),
  );
  const manualById = new Map(character.attacks.map((item) => [item.id, item]));
  const mergedAttacks = [
    ...automatic.map(
      (item) =>
        manualById.get(item.id) ||
        manualByName.get(item.name.toLowerCase()) ||
        item,
    ),
    ...character.attacks.filter(
      (item) =>
        !automatic.some(
          (auto) =>
            auto.id === item.id ||
            auto.name.toLowerCase() === item.name.trim().toLowerCase(),
        ),
    ),
  ];
  const attacks = mergedAttacks.map((item) => {
    const original = automatic.find((auto) => auto.id === item.id);
    const mechanics = original
      ? {
          ...original,
          ...item,
          name: original.name,
          damage: item.damage || original.damage,
          ability: item.ability || original.ability,
          mode: item.mode || original.mode,
          proficient: item.proficient || original.proficient,
        }
      : item;
    const weapon = weaponProfile(mechanics.name);
    const ability = attackAbility(
      mechanics,
      character,
      classLevels,
      final,
      weapon,
    );
    const score = final[ability] ?? 10;
    const proficient = attackProficient(mechanics, proficiencies);
    const archery =
      weapon?.ranged && fightingStyles(character).has("Archery") ? 2 : 0;
    const bonus = abilityModifier(score) + (proficient ? prof : 0) + archery;
    const properties = [
      item.properties || weapon?.properties || original?.properties || "",
      archery ? "Archery +2 attack" : "",
      weapon &&
      !weapon.ranged &&
      /two-handed|versatile/i.test(weapon.properties) &&
      fightingStyles(character).has("Great Weapon Fighting")
        ? "Great Weapon Fighting: when wielded in two hands, reroll weapon damage dice of 1 or 2 once"
        : "",
      mechanics.mode === "off-hand"
        ? "Bonus action; requires qualifying two-weapon fighting Attack action"
        : "",
    ]
      .filter(Boolean)
      .join("; ");
    return {
      ...item,
      ability,
      damage: attackDamage(
        mechanics,
        character,
        classLevels,
        final,
        ability,
        weapon,
      ),
      range: item.range || weapon?.range || original?.range || "",
      properties,
      proficient,
      calculatedBonus:
        item.attackBonus.trim() ||
        original?.attackBonus.trim() ||
        formatMod(bonus),
    };
  });
  const conditionalAttacks: typeof attacks = [];
  for (const attack of attacks) {
    const profile = weaponProfile(
      automatic.find((auto) => auto.id === attack.id)?.name || attack.name,
    );
    const bonus = Number(attack.calculatedBonus.replace(/^\+/, ""));
    const damageMatch = attack.damage.match(
      /^(\d+d\d+|\d+)(?:\s+([+-]\d+))?(.*)$/i,
    );
    const proficientWeapon = attack.proficient && Boolean(profile);
    if (
      profile &&
      !profile.ranged &&
      !/two-handed/i.test(profile.properties) &&
      attack.mode !== "two-handed" &&
      attack.mode !== "off-hand" &&
      fightingStyles(character).has("Dueling") &&
      damageMatch
    ) {
      const modifier = Number(damageMatch[2] || 0) + 2;
      conditionalAttacks.push({
        ...attack,
        id: `${attack.id}-dueling`,
        name: `${attack.name} (Dueling, one weapon)`,
        damage: `${damageMatch[1]} ${formatMod(modifier)}${damageMatch[3]}`,
        properties: `${attack.properties}; requires this melee weapon in one hand and no other weapon wielded (shield allowed)`,
        source: `${attack.source} · Dueling conditional +2 damage`,
      });
    }
    if (
      featNames.has("greatweaponmaster") &&
      proficientWeapon &&
      /heavy/i.test(profile?.properties || "") &&
      !profile?.ranged &&
      Number.isFinite(bonus) &&
      damageMatch
    ) {
      const modifier = Number(damageMatch[2] || 0) + 10;
      conditionalAttacks.push({
        ...attack,
        id: `${attack.id}-gwm`,
        name: `${attack.name} (Great Weapon Master option)`,
        calculatedBonus: formatMod(bonus - 5),
        damage: `${damageMatch[1]} ${formatMod(modifier)}${damageMatch[3]}`,
        source: `${attack.source} · optional -5/+10 mode`,
      });
    }
    if (
      featNames.has("sharpshooter") &&
      proficientWeapon &&
      profile?.ranged &&
      Number.isFinite(bonus) &&
      damageMatch
    ) {
      const modifier = Number(damageMatch[2] || 0) + 10;
      conditionalAttacks.push({
        ...attack,
        id: `${attack.id}-ss`,
        name: `${attack.name} (Sharpshooter option)`,
        calculatedBonus: formatMod(bonus - 5),
        damage: `${damageMatch[1]} ${formatMod(modifier)}${damageMatch[3]}`,
        source: `${attack.source} · optional -5/+10 mode`,
      });
    }
    if (
      featNames.has("polearmmaster") &&
      proficientWeapon &&
      ["glaive", "halberd", "quarterstaff", "spear"].includes(
        attack.name.toLowerCase(),
      )
    ) {
      const abilityMod = abilityModifier(final[attack.ability] ?? 10);
      conditionalAttacks.push({
        ...attack,
        id: `${attack.id}-pam`,
        name: `${attack.name} (Polearm Master bonus action)`,
        damage: `1d4${abilityMod ? ` ${formatMod(abilityMod)}` : ""} bludgeoning`,
        properties: "Bonus action after qualifying Attack action; opposite end",
        source: `${attack.source} · Polearm Master`,
      });
    }
  }
  attacks.push(...conditionalAttacks);
  const attacksPerAction = Math.max(
    1,
    ...Object.entries(classLevels).map(
      ([name, n]) =>
        classProgression[name]?.levels[Math.max(0, n - 1)]?.extraAttacks || 1,
    ),
    classLevels.Bard >= 6 && character.subclass.Bard === "College of Valor"
      ? 2
      : 1,
  );
  const monkRow = classLevels.Monk
    ? classProgression.Monk.levels[classLevels.Monk - 1]
    : undefined;
  const speedBase = raceProfiles[character.race]?.speed || 30;
  const armor = wornArmor(character);
  const wearingArmor = Boolean(character.equippedArmor);
  const shieldBonus = character.equippedShield ? 2 : 0;
  const armorStrengthPenalty =
    armor?.[1].strength &&
    final.Strength < armor[1].strength &&
    character.race !== "Dwarf"
      ? 10
      : 0;
  const monkSpeed =
    !wearingArmor && !character.equippedShield
      ? monkRow?.unarmoredMovement || 0
      : 0;
  const barbarianSpeed =
    classLevels.Barbarian >= 5 && armor?.[1].category !== "Heavy" ? 10 : 0;
  const speed =
    (character.race === "Elf" && character.subrace === "Wood Elf"
      ? 35
      : speedBase) +
    monkSpeed +
    barbarianSpeed +
    (featNames.has("mobile") ? 10 : 0) -
    armorStrengthPenalty;
  const speedNotes = [
    monkSpeed
      ? `Monk Unarmored Movement +${monkSpeed} ft.`
      : monkRow?.unarmoredMovement
        ? "Monk movement inactive while armored or using a shield"
        : "",
    barbarianSpeed
      ? "Barbarian Fast Movement +10 ft."
      : classLevels.Barbarian >= 5
        ? "Fast Movement inactive in heavy armor"
        : "",
    featNames.has("mobile") ? "Mobile feat +10 ft." : "",
    armorStrengthPenalty ? "Armor Strength requirement unmet: -10 ft." : "",
  ]
    .filter(Boolean)
    .join("; ");
  const dex = abilityModifier(final.Dexterity);
  const acCandidates = [{ value: 10 + dex, note: "10 + Dexterity" }];
  const unarmoredDefense = firstUnarmoredDefense(character);
  if (wearingArmor) {
    acCandidates.splice(0);
    if (armor) {
      const cap =
        armor[1].category === "Medium" && featNames.has("mediumarmormaster")
          ? 3
          : armor[1].dexCap;
      acCandidates.push({
        value:
          armor[1].ac +
          (armor[1].category === "Heavy" ? 0 : Math.min(dex, cap)),
        note: `${armor[0]} ${armor[1].ac}${armor[1].category === "Heavy" ? " (no Dexterity)" : ` + Dexterity${Number.isFinite(cap) ? ` (maximum +${cap})` : ""}`}`,
      });
    } else
      acCandidates.push({
        value: 10 + dex,
        note: "Unrecognized armor; provisional unarmored baseline until resolved",
      });
  } else {
    if (unarmoredDefense === "Barbarian")
      acCandidates.push({
        value: 10 + dex + con,
        note: "10 + Dexterity + Constitution (first acquired Unarmored Defense: Barbarian)",
      });
    if (unarmoredDefense === "Monk" && !character.equippedShield)
      acCandidates.push({
        value: 10 + dex + abilityModifier(final.Wisdom),
        note: "10 + Dexterity + Wisdom (first acquired Unarmored Defense: Monk; no shield)",
      });
    if (draconicHP)
      acCandidates.push({
        value: 13 + dex,
        note: "13 + Dexterity (Draconic Resilience; no armor)",
      });
  }
  const bestAC = Math.max(...acCandidates.map((item) => item.value));
  const defenseBonus =
    wearingArmor && fightingStyles(character).has("Defense") ? 1 : 0;
  const equippedMelee = activeEquipmentItems(character).filter(
    (item) =>
      item.equipped &&
      item.quantity > 0 &&
      weaponProfile(item.name) &&
      !weaponProfile(item.name)?.ranged &&
      !/two-handed/i.test(weaponProfile(item.name)?.properties || "") &&
      item.mode !== "two-handed",
  );
  const dualWielderAC =
    featNames.has("dualwielder") && equippedMelee.length >= 2 ? 1 : 0;
  const automaticAC: Calculation = {
    value: bestAC + shieldBonus + defenseBonus + dualWielderAC,
    formula: `${acCandidates
      .filter((item) => item.value === bestAC)
      .map((item) => item.note)
      .join(
        " or ",
      )}${shieldBonus ? " + shield 2" : ""}${defenseBonus ? " + Defense style 1" : ""}${dualWielderAC ? " + Dual Wielder 1 (two melee weapons equipped)" : ""}`,
    sources: [
      "PHB 2014, Chapter 5: armor; Chapter 6: alternative AC formulas do not combine",
    ],
  };
  const acFormula = Number(character.acOverride)
    ? "Explicit AC override"
    : automaticAC.formula;
  const ac = Number(character.acOverride) || automaticAC.value;
  const initiative =
    dex + checkProficiency("Dexterity") + (featNames.has("alert") ? 5 : 0);
  const auraBonus =
    classLevels.Paladin >= 6 ? Math.max(1, abilityModifier(final.Charisma)) : 0;
  if (auraBonus)
    abilities.forEach((ability) => {
      saves[ability] += auraBonus;
    });
  const armorNotes = [
    armor?.[1].stealth &&
    !(armor[1].category === "Medium" && featNames.has("mediumarmormaster"))
      ? `${armor[0]} gives disadvantage on Dexterity (Stealth) checks`
      : "",
    character.equippedShield && unarmoredDefense === "Monk"
      ? "Shield disables Monk Unarmored Defense and Martial Arts"
      : "",
    unarmoredDefense && classLevels.Monk && classLevels.Barbarian
      ? `Only the first acquired Unarmored Defense (${unarmoredDefense}) is granted`
      : "",
  ].filter(Boolean);
  const calculations: Record<string, Calculation> = {
    proficiency: {
      value: prof,
      formula: `2 + floor((${character.level} - 1) / 4)`,
      sources: ["PHB 2014, Chapter 1: total character level"],
    },
    hp: {
      value: hp,
      formula: `Hit Dice (${character.hpMethod === "rolled" ? "recorded rolls; missing rolls are provisional averages" : "fixed averages"}) + Constitution at every level${draconicHP ? ` + ${draconicHP} Draconic Resilience` : ""}${character.race === "Dwarf" && character.subrace === "Hill Dwarf" ? ` + ${character.level} Dwarven Toughness` : ""}${featNames.has("tough") ? ` + ${character.level * 2} Tough` : ""}`,
      sources: [
        `${first || "Unselected"} initial Hit Die; later class-by-class Hit Dice`,
        "Constitution changes apply to every character level",
      ],
    },
    ac: { value: ac, formula: acFormula, sources: automaticAC.sources },
    initiative: {
      value: initiative,
      formula: `Dexterity ${formatMod(dex)}${checkProficiency("Dexterity") ? ` + ${checkProficiency("Dexterity")} ${remarkableAthlete ? "Remarkable Athlete" : "Jack of All Trades"}` : ""}${featNames.has("alert") ? " + Alert 5" : ""}`,
      sources: ["PHB 2014: initiative is a Dexterity ability check"],
    },
    speed: {
      value: speed,
      formula: `Ancestry speed + applicable movement bonuses - armor penalty${speedNotes ? `; ${speedNotes}` : ""}`,
      sources: [character.subrace || character.race || "Unselected ancestry"],
    },
    passivePerception: {
      value:
        10 + skillBonuses.Perception + (featNames.has("observant") ? 5 : 0),
      formula: `10 + Perception ${formatMod(skillBonuses.Perception)}${featNames.has("observant") ? " + Observant 5" : ""}`,
      sources: [
        "PHB 2014: passive checks; advantage/disadvantage changes the passive total by 5 when applicable",
      ],
    },
  };
  for (const ability of abilities)
    calculations[`save:${ability}`] = {
      value: saves[ability],
      formula: `${ability} modifier ${formatMod(abilityModifier(final[ability]))}${proficiencies.some((item) => item.kind === "Save" && item.name === ability) ? ` + proficiency ${prof}` : ""}${auraBonus ? ` + Aura of Protection ${auraBonus} (while conscious)` : ""}`,
      sources: proficiencies
        .filter((item) => item.kind === "Save" && item.name === ability)
        .map((item) => item.source),
    };
  for (const skill of skills)
    calculations[`skill:${skill}`] = {
      value: skillBonuses[skill],
      formula: `${skillAbilities[skill]} modifier ${formatMod(abilityModifier(final[skillAbilities[skill]]))}${trained.has(skill) ? ` + ${expertise.has(skill) ? "expertise" : "proficiency"} ${prof * (expertise.has(skill) ? 2 : 1)}` : checkProficiency(skillAbilities[skill]) ? ` + untrained check bonus ${checkProficiency(skillAbilities[skill])}` : ""}`,
      sources: proficiencies
        .filter((item) => item.kind === "Skill" && item.name === skill)
        .map((item) => item.source),
    };
  for (const attack of attacks)
    if (/^[+-]?\d+$/.test(attack.calculatedBonus))
      calculations[`attack:${attack.id}`] = {
        value: Number(attack.calculatedBonus),
        formula: attack.attackBonus.trim()
          ? "Explicit attack bonus override"
          : `${attack.ability} modifier${attack.proficient ? ` + proficiency ${prof}` : ""}${/Archery \+2/.test(attack.properties) ? " + Archery 2" : ""}${/-5\/\+10/.test(attack.source) ? " - 5 optional power attack" : ""}`,
        sources: [attack.source],
      };
  for (const [key, raw] of Object.entries(character.sheetOverrides || {}))
    if (
      raw.trim() !== "" &&
      Number.isFinite(Number(raw)) &&
      calculations[key]
    ) {
      calculations[key] = {
        value: Number(raw),
        formula: `Explicit imported/player override: ${raw}; calculated value ${calculations[key].value}`,
        sources: [...calculations[key].sources, "Manual override"],
      };
    }
  if (
    character.sheetOverrides?.["skill:Perception"]?.trim() &&
    Number.isFinite(Number(character.sheetOverrides["skill:Perception"])) &&
    !character.sheetOverrides?.passivePerception?.trim()
  )
    calculations.passivePerception = {
      value:
        10 +
        calculations["skill:Perception"].value +
        (featNames.has("observant") ? 5 : 0),
      formula: `10 + Perception override ${calculations["skill:Perception"].value}${featNames.has("observant") ? " + Observant 5" : ""}`,
      sources: ["Explicit Perception override", "PHB passive checks"],
    };
  for (const attack of attacks)
    if (calculations[`attack:${attack.id}`])
      attack.calculatedBonus = formatMod(
        calculations[`attack:${attack.id}`].value,
      );
  abilities.forEach((ability) => {
    saves[ability] = calculations[`save:${ability}`].value;
  });
  skills.forEach((skill) => {
    skillBonuses[skill] = calculations[`skill:${skill}`].value;
  });
  return {
    classLevels,
    initialClass: first,
    proficiency: calculations.proficiency.value,
    abilities: final,
    hp: calculations.hp.value,
    hitDice:
      Object.entries(classLevels)
        .map(([c, n]) => `${n}d${selectedClass(c)?.hitDie || 8}`)
        .join(" + ") || "—",
    ac: calculations.ac.value,
    initiative: calculations.initiative.value,
    speed: calculations.speed.value,
    saves,
    skillBonuses,
    passivePerception: calculations.passivePerception.value,
    spellcasterLevel: hasSpellcasting ? spellcasterLevel : 0,
    spellSlots: slots,
    features: featureNames,
    featureEntries,
    proficiencies,
    attacks,
    attacksPerAction,
    sneakAttackDice: classLevels.Rogue
      ? classProgression.Rogue.levels[classLevels.Rogue - 1].sneakAttackDice
      : 0,
    martialArtsDie: monkRow?.martialArtsDie || "",
    kiPoints: monkRow?.kiPoints || 0,
    pactSlots: pactRow?.pactSlots || 0,
    pactSlotLevel: pactRow?.pactSlotLevel || 0,
    speedNotes,
    acFormula: calculations.ac.formula,
    calculations,
    automaticAC,
    abilityBreakdown: abilityContributions(character),
    spellcasting,
    resolvedSpells,
    unarmoredDefense,
    armorNotes,
  };
}

function missingEntryRequirements(
  className: string,
  scores: Record<string, number>,
): string[] {
  const requirements = classTraining[className]?.entryPrerequisites || [];
  return requirements.flatMap((requirement) => {
    if (requirement.includes(" or ")) {
      const alternatives = requirement
        .split(" or ")
        .map((text) => text.match(/([A-Za-z]+)\s+(\d+)/))
        .filter(Boolean) as RegExpMatchArray[];
      return alternatives.some((match) => scores[match[1]] >= Number(match[2]))
        ? []
        : [requirement];
    }
    const match = requirement.match(/([A-Za-z]+)\s+(\d+)/);
    return match && scores[match[1]] < Number(match[2]) ? [requirement] : [];
  });
}

function multiclassPrerequisiteIssues(character: Character): string[] {
  if (character.classMode !== "multi") return [];
  const counts: Record<string, number> = {};
  const issues: string[] = [];
  for (
    let characterLevel = 1;
    characterLevel <= character.level;
    characterLevel++
  ) {
    const className = character.levelPath[characterLevel];
    if (!className) continue;
    counts[className] = (counts[className] || 0) + 1;
    if (characterLevel <= 1 || counts[className] !== 1) continue;
    const scores = finalAbilities(character, characterLevel - 1);
    const previousClass = character.levelPath[characterLevel - 1];
    const checkedClasses = [
      ...new Set([previousClass, className].filter(Boolean)),
    ];
    const missing = checkedClasses.flatMap((name) =>
      missingEntryRequirements(name, scores),
    );
    if (missing.length)
      issues.push(
        `${className} entry at character level ${characterLevel} requires the listed multiclass ability scores (${[...new Set(missing)].join("; ")}). Adjust scores in this stage before continuing.`,
      );
  }
  return issues;
}

export type ClassSkillPlan = {
  className: string;
  count: number;
  options: string[];
  initial: boolean;
};

export function classSkillPlans(character: Character): ClassSkillPlan[] {
  const names =
    character.classMode === "single"
      ? [initialClass(character)]
      : Object.keys(classLevelCounts(character));
  return names.flatMap((className, index) => {
    const training = classTraining[className];
    if (!training) return [];
    const initial = index === 0;
    const grantsSkill = initial
      ? training.skillCount > 0
      : training.multiclassProficiencies.some((x) => /skill/i.test(x));
    if (!grantsSkill) return [];
    const options = training.skillChoices.includes("Any skills")
      ? skills
      : training.skillChoices.filter((skill) => skills.includes(skill));
    return [
      { className, count: initial ? training.skillCount : 1, options, initial },
    ];
  });
}

export function selectedClassSkills(
  character: Character,
): Record<string, string[]> {
  const saved = character.classSkillChoices || {};
  if (Object.keys(saved).length) {
    const active = new Set(
      classSkillPlans(character).map((plan) => plan.className),
    );
    return Object.fromEntries(
      Object.entries(saved).filter(([name]) => active.has(name)),
    );
  }
  const first = initialClass(character);
  return first && character.skills.length ? { [first]: character.skills } : {};
}

export type ExpertisePlan = {
  key: string;
  className: string;
  classLevel: number;
  count: number;
  options: string[];
};

export function expertisePlans(character: Character): ExpertisePlan[] {
  const classLevels = classLevelCounts(character);
  const training = proficiencyInventory(
    character,
    classLevels,
    initialClass(character),
    false,
  );
  const plans: ExpertisePlan[] = [];
  const add = (className: string, classLevel: number) => {
    if ((classLevels[className] || 0) < classLevel) return;
    const acquired = classCharacterLevel(character, className, classLevel);
    const eligible = training.filter(
      (row) =>
        (row.kind === "Skill" ||
          (className === "Rogue" &&
            row.kind === "Tool" &&
            row.name.toLowerCase() === "thieves' tools")) &&
        (acquired === null ||
          row.characterLevel === null ||
          row.characterLevel <= acquired),
    );
    plans.push({
      key: `${className}:${classLevel}`,
      className,
      classLevel,
      count: 2,
      options: [...new Set(eligible.map((row) => row.name))].sort((a, b) =>
        a.localeCompare(b),
      ),
    });
  };
  add("Rogue", 1);
  add("Rogue", 6);
  add("Bard", 3);
  add("Bard", 10);
  return plans;
}

export function eligibleClassSkills(character: Character) {
  return [
    ...new Set(classSkillPlans(character).flatMap((plan) => plan.options)),
  ];
}

export function skillChoiceCount(character: Character) {
  return classSkillPlans(character).reduce((sum, plan) => sum + plan.count, 0);
}
