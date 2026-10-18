import type { FeatureSheetRule } from "../engine/types";

export type ClassOption = {
  name: string;
  role: string;
  detail: string;
  hitDie: number;
  saves: string[];
  abilities: string;
  skills: string[];
  subclassAt: number;
  subclasses: string[];
  features: string[];
  spellcasting: boolean;
};

/** Card descriptions; mechanical fields below come from the full class records. */
const classSummaries: (Pick<
  ClassOption,
  "name" | "role" | "detail" | "abilities" | "features" | "spellcasting"
> & { skillSummary?: string[] })[] = [
  {
    name: "Barbarian",
    role: "Front-line warrior",
    detail:
      "Enter a battle focus called Rage to hit harder and withstand weapon blows. Best for bold, close-range play.",
    abilities: "Strength, Constitution",
    features: [
      "Rage",
      "Unarmored Defense",
      "Reckless Attack",
      "Danger Sense",
      "Extra Attack",
      "Feral Instinct",
      "Brutal Critical",
      "Relentless Rage",
      "Persistent Rage",
      "Indomitable Might",
      "Primal Champion",
    ],
    spellcasting: false,
  },
  {
    name: "Bard",
    role: "Magical support and versatile expert",
    detail:
      "Use music, magic, and broad skills to empower allies, hinder enemies, and adapt to many challenges.",
    abilities: "Charisma, Dexterity",
    features: [
      "Spellcasting",
      "Bardic Inspiration",
      "Jack of All Trades",
      "Song of Rest",
      "Expertise",
      "Font of Inspiration",
      "Countercharm",
      "Magical Secrets",
      "Superior Inspiration",
    ],
    spellcasting: true,
    skillSummary: ["Any three skills"],
  },
  {
    name: "Cleric",
    role: "Divine caster and resilient support",
    detail:
      "Choose a divine domain that shapes your magic and channel divine power to protect or defeat foes.",
    abilities: "Wisdom, Constitution",
    features: [
      "Spellcasting",
      "Divine Domain",
      "Channel Divinity",
      "Destroy Undead",
      "Divine Intervention",
    ],
    spellcasting: true,
  },
  {
    name: "Druid",
    role: "Nature caster and shapeshifter",
    detail:
      "Prepare nature magic and, from 2nd level, transform into eligible beasts with Wild Shape.",
    abilities: "Wisdom, Constitution",
    features: [
      "Druidic",
      "Spellcasting",
      "Wild Shape",
      "Timeless Body",
      "Beast Spells",
      "Archdruid",
    ],
    spellcasting: true,
  },
  {
    name: "Fighter",
    role: "Adaptable weapon specialist",
    detail:
      "A durable martial class with a fighting style, reliable self-healing, and many ways to customize combat.",
    abilities: "Strength or Dexterity, Constitution",
    features: [
      "Fighting Style",
      "Second Wind",
      "Action Surge",
      "Martial Archetype",
      "Extra Attack",
      "Indomitable",
      "Additional Extra Attack",
    ],
    spellcasting: false,
  },
  {
    name: "Monk",
    role: "Mobile martial artist",
    detail:
      "Fight unarmored with speed and focused Ki techniques. Dexterity and Wisdom support defense and class features.",
    abilities: "Dexterity, Wisdom",
    features: [
      "Unarmored Defense",
      "Martial Arts",
      "Ki",
      "Unarmored Movement",
      "Deflect Missiles",
      "Slow Fall",
      "Stunning Strike",
      "Evasion",
      "Stillness of Mind",
      "Purity of Body",
      "Diamond Soul",
      "Empty Body",
      "Perfect Self",
    ],
    spellcasting: false,
  },
  {
    name: "Paladin",
    role: "Armored defender with divine magic",
    detail:
      "Blend weapon attacks, protective auras, healing, and a sacred oath. Strong Charisma and Strength are common.",
    abilities: "Strength, Charisma",
    features: [
      "Divine Sense",
      "Lay on Hands",
      "Fighting Style",
      "Spellcasting",
      "Divine Smite",
      "Sacred Oath",
      "Extra Attack",
      "Aura of Protection",
      "Aura of Courage",
      "Improved Divine Smite",
      "Cleansing Touch",
    ],
    spellcasting: true,
  },
  {
    name: "Ranger",
    role: "Wilderness scout and martial explorer",
    detail:
      "Track threats, fight with weapons, and learn a limited set of nature-themed spells as you advance.",
    abilities: "Dexterity, Wisdom",
    features: [
      "Favored Enemy",
      "Natural Explorer",
      "Fighting Style",
      "Spellcasting",
      "Ranger Archetype",
      "Extra Attack",
      "Land's Stride",
      "Hide in Plain Sight",
      "Vanish",
      "Feral Senses",
      "Foe Slayer",
    ],
    spellcasting: true,
  },
  {
    name: "Rogue",
    role: "Skilled striker and infiltrator",
    detail:
      "Use Sneak Attack when the opening is right, and rely on expertise, mobility, and clever action options.",
    abilities: "Dexterity, Intelligence",
    features: [
      "Expertise",
      "Sneak Attack",
      "Thieves' Cant",
      "Cunning Action",
      "Uncanny Dodge",
      "Evasion",
      "Reliable Talent",
      "Blindsense",
      "Slippery Mind",
      "Elusive",
      "Stroke of Luck",
    ],
    spellcasting: false,
  },
  {
    name: "Sorcerer",
    role: "Innate spellcaster",
    detail:
      "Magic comes from your own nature. A focused spell list and Metamagic let you reshape how some spells work.",
    abilities: "Charisma, Constitution",
    features: [
      "Spellcasting",
      "Sorcerous Origin",
      "Font of Magic",
      "Metamagic",
      "Sorcerous Restoration",
    ],
    spellcasting: true,
  },
  {
    name: "Warlock",
    role: "Pact-bound magical specialist",
    detail:
      "A pact grants distinctive magic, customizable invocations, and a small pool of slots that return on a short rest.",
    abilities: "Charisma, Constitution",
    features: [
      "Otherworldly Patron",
      "Pact Magic",
      "Eldritch Invocations",
      "Pact Boon",
      "Mystic Arcanum",
      "Eldritch Master",
    ],
    spellcasting: true,
  },
  {
    name: "Wizard",
    role: "Studious spellcaster",
    detail:
      "Build a spellbook, prepare a smaller daily selection, and specialize in one of eight schools of magic.",
    abilities: "Intelligence, Constitution",
    features: [
      "Spellcasting",
      "Arcane Recovery",
      "Arcane Tradition",
      "Spell Mastery",
      "Signature Spells",
    ],
    spellcasting: true,
  },
];
export type FeatureDefinition = {
  name: string;
  description: string;
  choice?: boolean;
  sourceType: "Class" | "Subclass";
};

const classSheetSections: Record<string, FeatureSheetRule["section"]> = {
  "Ability Score Improvement": "calculated",
  Expertise: "calculated",
  "Jack of All Trades": "calculated",
  "Unarmored Defense": "calculated",
  "Fast Movement": "calculated",
  "Primal Champion": "calculated",
  "Draconic Resilience": "calculated",
  Archery: "calculated",
  Defense: "calculated",
  Dueling: "calculated",
  "Two-Weapon Fighting": "calculated",
  "Agonizing Blast": "calculated",
  "Eldritch Spear": "calculated",
  "Bonus Proficiency": "proficiencies",
  "Bonus Proficiencies": "proficiencies",
  "Student of War": "proficiencies",
  Spellcasting: "spellcasting",
  "Pact Magic": "spellcasting",
  "Mystic Arcanum": "spellcasting",
  "Magical Secrets": "spellcasting",
  "Additional Magical Secrets": "spellcasting",
  "Circle Spells": "spellcasting",
  "Domain Spells": "spellcasting",
  "Oath Spells": "spellcasting",
  "Expanded Spell List": "spellcasting",
  "Bonus Cantrip": "spellcasting",
  "Bonus Cantrips": "spellcasting",
  "Primal Path": "choices",
  "Bard College": "choices",
  "Divine Domain": "choices",
  "Druid Circle": "choices",
  "Martial Archetype": "choices",
  "Monastic Tradition": "choices",
  "Sacred Oath": "choices",
  "Ranger Archetype": "choices",
  "Roguish Archetype": "choices",
  "Sorcerous Origin": "choices",
  "Otherworldly Patron": "choices",
  "Arcane Tradition": "choices",
  "Fighting Style": "choices",
  "Additional Fighting Style": "choices",
  "Eldritch Invocations": "choices",
  Metamagic: "choices",
  "Pact Boon": "choices",
  "Aura Improvements": "choices",
  "Wild Shape Improvement": "choices",
  "Path Feature": "choices",
  "Bard College Feature": "choices",
  "Divine Domain Feature": "choices",
  "Druid Circle Feature": "choices",
  "Martial Archetype Feature": "choices",
  "Monastic Tradition Feature": "choices",
  "Sacred Oath Feature": "choices",
  "Ranger Archetype Feature": "choices",
  "Roguish Archetype Feature": "choices",
  "Sorcerous Origin Feature": "choices",
  "Otherworldly Patron Feature": "choices",
  "Arcane Tradition Feature": "choices",
};
export function classFeatureSheetRule(
  name: string,
  className: string,
  currentLevel: number,
): FeatureSheetRule {
  if (name === "Jack of All Trades")
    return {
      section: "features",
      description:
        "For other ability checks, add half your proficiency bonus (rounded down) whenever the check does not already include proficiency.",
      descriptionHr:
        "Ostalim provjerama osobina dodajte polovicu bonusa obučenosti (zaokruženu naniže) kad provjera već ne uključuje obučenost.",
    };
  if (["Arcane Recovery", "Second Wind", "Extra Attack"].includes(name))
    return { section: "features", useCurrentText: true };
  if (
    className === "Monk" &&
    ["Unarmored Movement", "Unarmored Movement Improvement"].includes(name)
  )
    return currentLevel < 9
      ? { section: "calculated" }
      : {
          section: "features",
          key: "Unarmored Movement",
          description:
            "While unarmored and without a shield, you can move along vertical surfaces and across liquids during your turn without falling during that movement.",
          descriptionHr:
            "Dok ne nosite oklop ni štit, tijekom svojeg poteza možete se kretati po okomitim površinama i preko tekućina bez pada tijekom toga kretanja.",
        };
  if (name === "Remarkable Athlete")
    return {
      section: "features",
      description:
        "When you make a running long jump, add your Strength modifier (minimum 1 foot) to the distance.",
      descriptionHr:
        "Pri skoku u dalj iz zaleta prijeđenoj udaljenosti dodajte modifikator Snage (najmanje 1 stopu).",
    };
  return { section: classSheetSections[name] || "features" };
}

export type ClassLevel = {
  level: number;
  features: FeatureDefinition[];
  asi: boolean;
  extraAttacks: number;
  sneakAttackDice: number;
  martialArtsDie?: string;
  kiPoints?: number;
  unarmoredMovement?: number;
  rageUses?: number | "Unlimited";
  rageDamage?: number;
  spellSlots?: number[];
  pactSlots?: number;
  pactSlotLevel?: number;
  spellsKnown?: number;
  cantripsKnown?: number;
  wildShapeUses?: number;
  wildShapeCR?: string;
  wildShapeLimits?: string;
  channelDivinityUses?: number;
  destroyUndeadCR?: string;
  actionSurgeUses?: number;
  indomitableUses?: number;
  invocationsKnown?: number;
  mysticArcanumLevel?: number;
  sorceryPoints?: number;
  bardicInspirationDie?: string;
  layOnHandsPool?: number;
  divineSenseUses?: number;
  auraRange?: number;
  favoredEnemyCount?: number;
  favoredTerrainCount?: number;
  arcaneRecoveryLevels?: number;
  subclassFeature?: boolean;
};

export type ClassTraining = {
  hitDie: number;
  saves: string[];
  armor: string[];
  weapons: string[];
  tools: string[];
  skillCount: number;
  skillChoices: string[];
  primaryAbilities: string[];
  entryPrerequisites: string[];
  multiclassProficiencies: string[];
  notes: string[];
  spellAbility?: string;
  casting?: "full" | "half" | "pact" | "none";
};

export type ClassProgression = { subclassAt: number; levels: ClassLevel[] };

const featureCopy: Record<string, string> = {
  Rage: "Enter a battle focus that strengthens Strength-based melee damage and resists common weapon damage; heavy armor prevents its benefits.",
  "Unarmored Defense":
    "When unarmored, calculate AC from Dexterity and Constitution instead of armor.",
  "Reckless Attack":
    "Trade safer defense for advantage on your Strength-based melee attacks this turn; attackers also gain advantage against you until your next turn.",
  "Danger Sense":
    "Gain an edge on many visible effects that call for Dexterity saves, while able to see and not incapacitated.",
  "Primal Path":
    "Choose a barbarian path; it grants features at barbarian levels 3, 6, 10, and 14.",
  "Path Feature":
    "Gain the feature granted by your chosen Primal Path at this barbarian level.",
  "Ability Score Improvement":
    "Increase ability scores, or choose a feat if that optional rule is enabled and you meet its prerequisite.",
  "Extra Attack":
    "Make two attacks when you take the Attack action. Later class-specific entries may raise this count.",
  "Fast Movement":
    "Your speed increases while you are not wearing heavy armor.",
  "Feral Instinct":
    "Improve initiative and your ability to act when surprised, subject to the feature's conditions.",
  "Brutal Critical":
    "Add the listed number of weapon damage dice when you score a melee weapon critical hit.",
  "Relentless Rage":
    "A Constitution save can keep you at 1 hit point instead of dropping to 0 while raging; the DC rises after repeated uses.",
  "Persistent Rage":
    "Rage no longer ends early for the usual lack of a recent attack or incoming damage.",
  "Indomitable Might":
    "Use your Strength score as the minimum for a Strength check when the check result would be lower.",
  "Primal Champion":
    "Increase Strength and Constitution maximums and scores as specified by the feature.",
  Spellcasting:
    "Gain the class's spell access, spellcasting ability, and spell progression for this class level.",
  "Divine Smite":
    "After hitting with a melee weapon attack, expend a spell slot to deal extra radiant damage; a higher-level slot adds more damage, with an additional die against undead or fiends.",
  Ki: "Gain ki points equal to your monk level. Spend them on listed monk techniques; all spent points return after a short or long rest. Your ki save DC is 8 + proficiency bonus + Wisdom modifier.",
  "Martial Arts":
    "While unarmed or using eligible monk weapons and meeting the feature's armor and shield limits, use Dexterity for attacks and damage, roll the Martial Arts die instead of the weapon's die when higher, and make an unarmed strike as a bonus action after attacking.",
  "Bardic Inspiration":
    "Inspire an ally with a die that can improve a check, attack roll, or saving throw; the die grows at bard levels 5, 10, and 15.",
  "Jack of All Trades":
    "Add half your proficiency bonus to ability checks that do not already include it.",
  "Song of Rest":
    "Allies who spend Hit Dice during a short rest gain extra healing; its die improves with bard level.",
  "Bard College":
    "Choose a college. It grants features at bard levels 3, 6, and 14.",
  Expertise:
    "Double your proficiency bonus for selected proficient skills; the bard gains another pair at level 10.",
  Countercharm:
    "Use music or words to bolster nearby listeners against fear and charm effects.",
  "Bard College Feature":
    "Gain the feature granted by your chosen Bard College at this level.",
  "Font of Inspiration":
    "Regain Bardic Inspiration uses on a short or long rest instead of only a long rest.",
  "Magical Secrets":
    "Learn selected spells from any class; the bard gains additional choices at levels 14 and 18.",
  "Superior Inspiration":
    "If you have no Bardic Inspiration uses when initiative is rolled, regain one.",
  "Divine Domain":
    "Choose a cleric domain. It grants domain features at cleric levels 1, 2, 6, 8, and 17.",
  "Channel Divinity":
    "Invoke a divine effect such as Turn Undead; uses per rest increase at cleric levels 6 and 18.",
  "Divine Domain Feature":
    "Gain the feature granted by your chosen Divine Domain at this level.",
  "Destroy Undead":
    "Undead affected by Turn Undead may be destroyed if their challenge rating is at or below this level's threshold.",
  "Divine Intervention":
    "Call for direct divine aid with a chance of success that improves with cleric level.",
  "Divine Intervention Improvement":
    "Divine Intervention succeeds automatically; its use is still limited by its recovery rule.",
  Druidic:
    "Know the secret language of druids and leave or notice hidden messages in it.",
  "Wild Shape":
    "Transform into eligible beasts; your druid level sets creature limits and uses recover on a rest.",
  "Druid Circle":
    "Choose a circle. It grants features at druid levels 2, 6, 10, and 14.",
  "Wild Shape Improvement":
    "Increase the challenge rating or movement forms available for Wild Shape.",
  "Druid Circle Feature":
    "Gain the feature granted by your chosen Druid Circle at this level.",
  "Beast Spells":
    "Cast many druid spells while in Wild Shape, subject to the feature's limits.",
  Archdruid:
    "Use Wild Shape with exceptional flexibility, including unlimited uses and spell components while transformed.",
  "Fighting Style":
    "Choose a combat style that grants a specific benefit; a style cannot be selected twice.",
  "Second Wind":
    "Use a bonus action to regain hit points; the feature recharges on a short or long rest.",
  "Action Surge":
    "Take one additional action on your turn; uses increase at fighter level 17.",
  "Martial Archetype":
    "Choose a fighter archetype; it grants features at fighter levels 3, 7, 10, 15, and 18.",
  "Martial Archetype Feature":
    "Gain the feature granted by your chosen Martial Archetype at this level.",
  Indomitable:
    "Reroll a failed saving throw; uses increase at fighter levels 13 and 17.",
  "Unarmored Movement":
    "Move faster while unarmored and not using a shield; the bonus increases with monk level.",
  "Monastic Tradition":
    "Choose a tradition; it grants features at monk levels 3, 6, 11, and 17.",
  "Deflect Missiles":
    "Use your reaction to reduce damage from a ranged weapon attack and possibly catch or throw its missile.",
  "Slow Fall": "Reduce falling damage using your reaction.",
  "Stunning Strike":
    "Spend ki after a melee weapon hit to try to stun the target.",
  "Ki-Empowered Strikes":
    "Your unarmed strikes count as magical for overcoming resistance and immunity.",
  "Monastic Tradition Feature":
    "Gain the feature granted by your chosen Monastic Tradition at this level.",
  Evasion:
    "Improve Dexterity saves against area effects: avoid damage on success and reduce it on failure.",
  "Stillness of Mind":
    "Use an action to end one effect causing you to be charmed or frightened.",
  "Unarmored Movement Improvement":
    "Gain the level 9 monk movement benefit, including movement across vertical surfaces and liquids during your turn.",
  "Purity of Body": "Become immune to disease and poison.",
  "Tongue of the Sun and Moon":
    "Understand all spoken languages and make yourself understood by creatures that understand a language.",
  "Diamond Soul":
    "Gain proficiency in all saving throws and spend ki to reroll a failed save.",
  "Timeless Body":
    "Gain age-related protections and reduced ordinary needs as described by your class.",
  "Empty Body":
    "Use ki to become invisible and resistant to most damage, or briefly enter the Astral Plane.",
  "Perfect Self":
    "Regain ki when initiative begins if you have none remaining.",
  "Divine Sense":
    "Detect certain nearby celestial, fiend, or undead presences and consecrated or desecrated places.",
  "Lay on Hands":
    "Draw from a healing pool to restore hit points or neutralize poison or disease.",
  "Divine Health": "Become immune to disease.",
  "Sacred Oath":
    "Choose an oath; it grants features at paladin levels 3, 7, 15, and 20, plus oath spells.",
  "Aura of Protection":
    "You and nearby allies add your Charisma modifier to saving throws while you are conscious.",
  "Sacred Oath Feature":
    "Gain the feature granted by your chosen Sacred Oath at this level.",
  "Aura of Courage":
    "You and nearby allies cannot be frightened while you are conscious.",
  "Improved Divine Smite": "Add radiant damage to your melee weapon hits.",
  "Cleansing Touch":
    "End a spell affecting yourself or a willing creature by touch; uses are limited by Charisma.",
  "Aura Improvements": "Your paladin auras extend to 30 feet.",
  "Favored Enemy":
    "Choose a favored enemy type; gain tracking and recall benefits and learn an associated language.",
  "Natural Explorer":
    "Choose a favored terrain; gain travel and exploration benefits there, with more terrains at levels 6 and 10.",
  "Primeval Awareness":
    "Spend a spell slot to sense the presence of certain creature types in the surrounding area.",
  "Ranger Archetype":
    "Choose a ranger archetype; it grants features at ranger levels 3, 7, 11, and 15.",
  "Ranger Archetype Feature":
    "Gain the feature granted by your chosen Ranger Archetype at this level.",
  "Favored Enemy Improvement":
    "Choose another favored enemy and associated language; improve the related benefits.",
  "Favored Enemy and Natural Explorer Improvements":
    "Choose an additional favored enemy and terrain, improving the corresponding benefits.",
  "Land’s Stride":
    "Move through nonmagical difficult terrain and plants more easily, with protection from some plant hazards.",
  "Natural Explorer Improvement":
    "Choose an additional favored terrain and gain further exploration benefits.",
  "Hide in Plain Sight":
    "Spend time creating camouflage that helps you hide while remaining still.",
  Vanish: "Hide as a bonus action and leave no trail unless you choose to.",
  "Feral Senses":
    "Fight unseen foes more effectively when you cannot see them, provided they are not hidden from you.",
  "Foe Slayer":
    "Add your Wisdom modifier to an attack or damage roll against a favored enemy once on each of your turns.",
  "Sneak Attack":
    "Once per turn, add the listed d6s to a qualifying finesse or ranged weapon attack when you have advantage or an eligible nearby ally distracts the target.",
  "Thieves’ Cant":
    "Understand and use a coded language of signs and expressions known to other trained rogues.",
  "Cunning Action": "Take Dash, Disengage, or Hide as a bonus action.",
  "Uncanny Dodge":
    "Use your reaction to halve damage from one attacker you can see.",
  "Roguish Archetype":
    "Choose an archetype; it grants features at rogue levels 3, 9, 13, and 17.",
  "Roguish Archetype Feature":
    "Gain the feature granted by your chosen Roguish Archetype at this level.",
  "Reliable Talent":
    "Treat a low d20 roll as a 10 for ability checks using a proficient skill or tool.",
  Blindsense:
    "Notice the location of hidden or invisible creatures nearby when you can hear.",
  "Slippery Mind": "Gain proficiency in Wisdom saving throws.",
  Elusive:
    "Attack rolls cannot gain advantage against you while you are not incapacitated.",
  "Stroke of Luck":
    "Turn a missed attack into a hit or treat a failed ability check as a 20, once per short or long rest.",
  "Sorcerous Origin":
    "Choose a source of innate magic; it grants features at sorcerer levels 1, 6, 14, and 18.",
  "Sorcerous Origin Feature":
    "Gain the feature granted by your chosen Sorcerous Origin at this level.",
  "Font of Magic":
    "Gain sorcery points and flexible casting options; your point maximum equals sorcerer level.",
  Metamagic:
    "Choose options that modify your spells by spending sorcery points; you gain more options at levels 10 and 17.",
  "Sorcerous Restoration":
    "Regain a small number of sorcery points after a short rest.",
  "Otherworldly Patron":
    "Choose a patron; it grants features at warlock levels 1, 6, 10, and 14 and adds spells to your options.",
  "Pact Magic":
    "Learn warlock spells and use a small set of same-level slots that recharge on a short or long rest.",
  "Eldritch Invocations":
    "Choose magical customizations; the number known rises as warlock level increases.",
  "Pact Boon":
    "Choose a pact gift that shapes your warlock's familiar, weapon, or book options.",
  "Otherworldly Patron Feature":
    "Gain the feature granted by your chosen Otherworldly Patron at this level.",
  "Mystic Arcanum":
    "Learn one patron-granted spell of the listed level, usable once per long rest without a pact slot.",
  "Eldritch Master":
    "Spend a minute entreating your patron to recover pact slots once per long rest.",
  "Arcane Recovery":
    "Once per day after a short rest, recover spell slots whose combined levels are at most half your wizard level rounded up; no slot above 5th.",
  "Arcane Tradition":
    "Choose a school; it grants features at wizard levels 2, 6, 10, and 14.",
  "Arcane Tradition Feature":
    "Gain the feature granted by your chosen Arcane Tradition at this level.",
  "Spell Mastery":
    "Choose one 1st-level and one 2nd-level spell in your spellbook to cast at will at their lowest level while prepared.",
  "Signature Spells":
    "Choose two 3rd-level spells that are always prepared and each can be cast once per rest without a slot.",
};

function feature(
  name: string,
  sourceType: FeatureDefinition["sourceType"] = "Class",
): FeatureDefinition {
  return {
    name,
    sourceType,
    description:
      featureCopy[name] ||
      "Gain this named feature at the listed class level. Apply its choice, uses, and limits from the 2014 PHB.",
  };
}

const commonFullSlots: number[][] = [
  [2],
  [3],
  [4, 2],
  [4, 3],
  [4, 3, 2],
  [4, 3, 3],
  [4, 3, 3, 1],
  [4, 3, 3, 2],
  [4, 3, 3, 3, 1],
  [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2, 1],
  [4, 3, 3, 3, 2, 1],
  [4, 3, 3, 3, 2, 1, 1],
  [4, 3, 3, 3, 2, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 2, 1, 1],
];

const rogueSneak = Array.from({ length: 20 }, (_, i) => Math.ceil((i + 1) / 2));

const asis: Record<string, number[]> = {
  Barbarian: [4, 8, 12, 16, 19],
  Bard: [4, 8, 12, 16, 19],
  Cleric: [4, 8, 12, 16, 19],
  Druid: [4, 8, 12, 16, 19],
  Fighter: [4, 6, 8, 12, 14, 16, 19],
  Monk: [4, 8, 12, 16, 19],
  Paladin: [4, 8, 12, 16, 19],
  Ranger: [4, 8, 12, 16, 19],
  Rogue: [4, 8, 10, 12, 16, 19],
  Sorcerer: [4, 8, 12, 16, 19],
  Warlock: [4, 8, 12, 16, 19],
  Wizard: [4, 8, 12, 16, 19],
};

const core: Record<string, string[][]> = {
  Barbarian: [
    ["Rage", "Unarmored Defense"],
    ["Reckless Attack", "Danger Sense"],
    ["Primal Path"],
    ["Ability Score Improvement"],
    ["Extra Attack", "Fast Movement"],
    ["Path Feature"],
    ["Feral Instinct"],
    ["Ability Score Improvement"],
    ["Brutal Critical"],
    ["Path Feature"],
    ["Relentless Rage"],
    ["Ability Score Improvement"],
    ["Brutal Critical"],
    ["Path Feature"],
    ["Persistent Rage"],
    ["Ability Score Improvement"],
    ["Brutal Critical"],
    ["Indomitable Might"],
    ["Ability Score Improvement"],
    ["Primal Champion"],
  ],
  Bard: [
    ["Spellcasting", "Bardic Inspiration"],
    ["Jack of All Trades", "Song of Rest"],
    ["Bard College", "Expertise"],
    ["Ability Score Improvement"],
    ["Font of Inspiration", "Bardic Inspiration"],
    ["Countercharm", "Bard College Feature"],
    [],
    ["Ability Score Improvement"],
    ["Song of Rest"],
    ["Expertise", "Magical Secrets", "Bardic Inspiration"],
    [],
    ["Ability Score Improvement"],
    ["Song of Rest"],
    ["Magical Secrets", "Bard College Feature"],
    ["Bardic Inspiration"],
    ["Ability Score Improvement"],
    ["Song of Rest"],
    ["Magical Secrets"],
    ["Ability Score Improvement"],
    ["Superior Inspiration"],
  ],
  Cleric: [
    ["Spellcasting", "Divine Domain"],
    ["Channel Divinity", "Divine Domain Feature"],
    [],
    ["Ability Score Improvement"],
    ["Destroy Undead"],
    ["Channel Divinity", "Divine Domain Feature"],
    [],
    ["Ability Score Improvement", "Destroy Undead", "Divine Domain Feature"],
    [],
    ["Divine Intervention"],
    ["Destroy Undead"],
    ["Ability Score Improvement"],
    [],
    ["Destroy Undead"],
    [],
    ["Ability Score Improvement"],
    ["Destroy Undead", "Divine Domain Feature"],
    ["Channel Divinity"],
    ["Ability Score Improvement"],
    ["Divine Intervention Improvement"],
  ],
  Druid: [
    ["Druidic", "Spellcasting"],
    ["Wild Shape", "Druid Circle"],
    [],
    ["Wild Shape Improvement", "Ability Score Improvement"],
    [],
    ["Druid Circle Feature"],
    [],
    ["Wild Shape Improvement", "Ability Score Improvement"],
    [],
    ["Druid Circle Feature"],
    [],
    ["Ability Score Improvement"],
    [],
    ["Druid Circle Feature"],
    [],
    ["Ability Score Improvement"],
    [],
    ["Timeless Body", "Beast Spells"],
    ["Ability Score Improvement"],
    ["Archdruid"],
  ],
  Fighter: [
    ["Fighting Style", "Second Wind"],
    ["Action Surge"],
    ["Martial Archetype"],
    ["Ability Score Improvement"],
    ["Extra Attack"],
    ["Ability Score Improvement"],
    ["Martial Archetype Feature"],
    ["Ability Score Improvement"],
    ["Indomitable"],
    ["Martial Archetype Feature"],
    ["Extra Attack"],
    ["Ability Score Improvement"],
    ["Indomitable"],
    ["Ability Score Improvement"],
    ["Martial Archetype Feature"],
    ["Ability Score Improvement"],
    ["Action Surge", "Indomitable"],
    ["Martial Archetype Feature"],
    ["Ability Score Improvement"],
    ["Extra Attack"],
  ],
  Monk: [
    ["Unarmored Defense", "Martial Arts"],
    ["Ki", "Unarmored Movement"],
    ["Monastic Tradition", "Deflect Missiles"],
    ["Ability Score Improvement", "Slow Fall"],
    ["Extra Attack", "Stunning Strike"],
    ["Ki-Empowered Strikes", "Monastic Tradition Feature"],
    ["Evasion", "Stillness of Mind"],
    ["Ability Score Improvement"],
    ["Unarmored Movement Improvement"],
    ["Purity of Body"],
    ["Monastic Tradition Feature"],
    ["Ability Score Improvement"],
    ["Tongue of the Sun and Moon"],
    ["Diamond Soul"],
    ["Timeless Body"],
    ["Ability Score Improvement"],
    ["Monastic Tradition Feature"],
    ["Empty Body"],
    ["Ability Score Improvement"],
    ["Perfect Self"],
  ],
  Paladin: [
    ["Divine Sense", "Lay on Hands"],
    ["Fighting Style", "Spellcasting", "Divine Smite"],
    ["Divine Health", "Sacred Oath"],
    ["Ability Score Improvement"],
    ["Extra Attack"],
    ["Aura of Protection"],
    ["Sacred Oath Feature"],
    ["Ability Score Improvement"],
    [],
    ["Aura of Courage"],
    ["Improved Divine Smite"],
    ["Ability Score Improvement"],
    [],
    ["Cleansing Touch"],
    ["Sacred Oath Feature"],
    ["Ability Score Improvement"],
    [],
    ["Aura Improvements"],
    ["Ability Score Improvement"],
    ["Sacred Oath Feature"],
  ],
  Ranger: [
    ["Favored Enemy", "Natural Explorer"],
    ["Fighting Style", "Spellcasting"],
    ["Ranger Archetype", "Primeval Awareness"],
    ["Ability Score Improvement"],
    ["Extra Attack"],
    ["Favored Enemy and Natural Explorer Improvements"],
    ["Ranger Archetype Feature"],
    ["Ability Score Improvement", "Land’s Stride"],
    [],
    ["Natural Explorer Improvement", "Hide in Plain Sight"],
    ["Ranger Archetype Feature"],
    ["Ability Score Improvement"],
    [],
    ["Favored Enemy Improvement", "Vanish"],
    ["Ranger Archetype Feature"],
    ["Ability Score Improvement"],
    [],
    ["Feral Senses"],
    ["Ability Score Improvement"],
    ["Foe Slayer"],
  ],
  Rogue: [
    ["Expertise", "Sneak Attack", "Thieves’ Cant"],
    ["Cunning Action"],
    ["Roguish Archetype"],
    ["Ability Score Improvement"],
    ["Uncanny Dodge"],
    ["Expertise"],
    ["Evasion"],
    ["Ability Score Improvement"],
    ["Roguish Archetype Feature"],
    ["Ability Score Improvement"],
    ["Reliable Talent"],
    ["Ability Score Improvement"],
    ["Roguish Archetype Feature"],
    ["Blindsense"],
    ["Slippery Mind"],
    ["Ability Score Improvement"],
    ["Roguish Archetype Feature"],
    ["Elusive"],
    ["Ability Score Improvement"],
    ["Stroke of Luck"],
  ],
  Sorcerer: [
    ["Spellcasting", "Sorcerous Origin"],
    ["Font of Magic"],
    ["Metamagic"],
    ["Ability Score Improvement"],
    [],
    ["Sorcerous Origin Feature"],
    [],
    ["Ability Score Improvement"],
    [],
    ["Metamagic"],
    [],
    ["Ability Score Improvement"],
    [],
    ["Sorcerous Origin Feature"],
    [],
    ["Ability Score Improvement"],
    ["Metamagic"],
    ["Sorcerous Origin Feature"],
    ["Ability Score Improvement"],
    ["Sorcerous Restoration"],
  ],
  Warlock: [
    ["Otherworldly Patron", "Pact Magic"],
    ["Eldritch Invocations"],
    ["Pact Boon"],
    ["Ability Score Improvement"],
    [],
    ["Otherworldly Patron Feature"],
    [],
    ["Ability Score Improvement"],
    [],
    ["Otherworldly Patron Feature"],
    ["Mystic Arcanum"],
    ["Ability Score Improvement"],
    ["Mystic Arcanum"],
    ["Otherworldly Patron Feature"],
    ["Mystic Arcanum"],
    ["Ability Score Improvement"],
    ["Mystic Arcanum"],
    [],
    ["Ability Score Improvement"],
    ["Eldritch Master"],
  ],
  Wizard: [
    ["Spellcasting", "Arcane Recovery"],
    ["Arcane Tradition"],
    [],
    ["Ability Score Improvement"],
    [],
    ["Arcane Tradition Feature"],
    [],
    ["Ability Score Improvement"],
    [],
    ["Arcane Tradition Feature"],
    [],
    ["Ability Score Improvement"],
    [],
    ["Arcane Tradition Feature"],
    [],
    ["Ability Score Improvement"],
    [],
    ["Spell Mastery"],
    ["Ability Score Improvement"],
    ["Signature Spells"],
  ],
};

export const classProgression: Record<string, ClassProgression> =
  Object.fromEntries(
    Object.entries(core).map(([className, rows]) => {
      const subclassAt =
        { Cleric: 1, Druid: 2, Sorcerer: 1, Warlock: 1, Wizard: 2 }[
          className
        ] || 3;
      const levels: ClassLevel[] = Array.from({ length: 20 }, (_, i) => {
        const level = i + 1;
        const names = rows[i] || [];
        const values: Partial<ClassLevel> = {};
        if (className === "Barbarian") {
          values.rageUses = [1, 2].includes(level)
            ? 2
            : level < 6
              ? 3
              : level < 12
                ? 4
                : level < 17
                  ? 5
                  : level < 20
                    ? 6
                    : "Unlimited";
          values.rageDamage = level < 9 ? 2 : level < 16 ? 3 : 4;
        }
        if (className === "Fighter")
          values.extraAttacks =
            level >= 20 ? 4 : level >= 11 ? 3 : level >= 5 ? 2 : 1;
        if (
          className === "Barbarian" ||
          className === "Monk" ||
          className === "Paladin" ||
          className === "Ranger"
        )
          values.extraAttacks =
            level >= 5 &&
            ["Barbarian", "Monk", "Paladin", "Ranger"].includes(className)
              ? 2
              : 1;
        if (className === "Rogue") values.sneakAttackDice = rogueSneak[i];
        if (className === "Monk") {
          values.kiPoints = level < 2 ? 0 : level;
          values.martialArtsDie =
            level >= 17 ? "d10" : level >= 11 ? "d8" : level >= 5 ? "d6" : "d4";
          values.unarmoredMovement =
            level < 2
              ? 0
              : level < 6
                ? 10
                : level < 10
                  ? 15
                  : level < 14
                    ? 20
                    : level < 18
                      ? 25
                      : 30;
        }
        if (className === "Druid") {
          values.wildShapeUses = level >= 2 ? 2 : 0;
          values.wildShapeCR =
            level < 2 ? "—" : level < 4 ? "1/4" : level < 8 ? "1/2" : "1";
          values.wildShapeLimits =
            level < 2
              ? "Not available"
              : level < 4
                ? "No swimming or flying speed"
                : level < 8
                  ? "Flying speed not yet available"
                  : "Swimming and flying speeds allowed";
        }
        if (className === "Cleric") {
          values.channelDivinityUses =
            level < 2 ? 0 : level < 6 ? 1 : level < 18 ? 2 : 3;
          values.destroyUndeadCR =
            level < 5
              ? "—"
              : level < 8
                ? "1/2"
                : level < 11
                  ? "1"
                  : level < 14
                    ? "2"
                    : level < 17
                      ? "3"
                      : "4";
        }
        if (className === "Fighter") {
          values.actionSurgeUses = level < 2 ? 0 : level < 17 ? 1 : 2;
          values.indomitableUses =
            level < 9 ? 0 : level < 13 ? 1 : level < 17 ? 2 : 3;
        }
        if (className === "Warlock") {
          values.invocationsKnown =
            level < 2
              ? 0
              : level < 5
                ? 2
                : level < 7
                  ? 3
                  : level < 9
                    ? 4
                    : level < 12
                      ? 5
                      : level < 15
                        ? 6
                        : level < 18
                          ? 7
                          : 8;
          values.mysticArcanumLevel =
            level >= 17
              ? 9
              : level >= 15
                ? 8
                : level >= 13
                  ? 7
                  : level >= 11
                    ? 6
                    : 0;
        }
        if (className === "Sorcerer")
          values.sorceryPoints = level >= 2 ? level : 0;
        if (className === "Bard")
          values.bardicInspirationDie =
            level >= 15
              ? "d12"
              : level >= 10
                ? "d10"
                : level >= 5
                  ? "d8"
                  : "d6";
        if (className === "Paladin") {
          values.layOnHandsPool = level * 5;
          values.auraRange = level >= 18 ? 30 : level >= 6 ? 10 : 0;
        }
        if (className === "Ranger") {
          values.favoredEnemyCount = level < 6 ? 1 : level < 14 ? 2 : 3;
          values.favoredTerrainCount = level < 6 ? 1 : level < 10 ? 2 : 3;
        }
        if (className === "Wizard")
          values.arcaneRecoveryLevels = Math.ceil(level / 2);
        if (
          ["Bard", "Cleric", "Druid", "Sorcerer", "Wizard"].includes(className)
        )
          values.spellSlots = commonFullSlots[i];
        if (className === "Paladin" || className === "Ranger")
          values.spellSlots =
            level < 2 ? [] : commonFullSlots[Math.ceil(level / 2) - 1];
        if (className === "Bard") {
          values.cantripsKnown = level < 4 ? 2 : level < 10 ? 3 : 4;
          values.spellsKnown =
            level === 1
              ? 4
              : level === 2
                ? 5
                : level === 3
                  ? 6
                  : level === 4
                    ? 7
                    : level === 5
                      ? 8
                      : level === 6
                        ? 9
                        : level === 7
                          ? 10
                          : level === 8
                            ? 11
                            : level === 9
                              ? 12
                              : level === 10
                                ? 14
                                : level === 11
                                  ? 15
                                  : level === 12
                                    ? 15
                                    : level === 13
                                      ? 16
                                      : level === 14
                                        ? 18
                                        : level === 15
                                          ? 19
                                          : level === 16
                                            ? 19
                                            : level === 17
                                              ? 20
                                              : 22;
        }
        if (className === "Sorcerer") {
          values.cantripsKnown = level < 4 ? 4 : level < 10 ? 5 : 6;
          values.spellsKnown =
            level === 1
              ? 2
              : level === 2
                ? 3
                : level === 3
                  ? 4
                  : level === 4
                    ? 5
                    : level === 5
                      ? 6
                      : level === 6
                        ? 7
                        : level === 7
                          ? 8
                          : level === 8
                            ? 9
                            : level === 9
                              ? 10
                              : level === 10
                                ? 11
                                : level === 11
                                  ? 12
                                  : level === 12
                                    ? 12
                                    : level === 13
                                      ? 13
                                      : level === 14
                                        ? 13
                                        : level === 15
                                          ? 14
                                          : level === 16
                                            ? 14
                                            : level === 17
                                              ? 15
                                              : 15;
        }
        if (className === "Warlock") {
          values.cantripsKnown = level < 4 ? 2 : level < 10 ? 3 : 4;
          values.spellsKnown =
            level === 1
              ? 2
              : level === 2
                ? 3
                : level === 3
                  ? 4
                  : level === 4
                    ? 5
                    : level === 5
                      ? 6
                      : level === 6
                        ? 7
                        : level === 7
                          ? 8
                          : level === 8
                            ? 9
                            : level === 9
                              ? 10
                              : level === 10
                                ? 10
                                : level === 11
                                  ? 11
                                  : level === 12
                                    ? 11
                                    : level === 13
                                      ? 12
                                      : level === 14
                                        ? 12
                                        : level === 15
                                          ? 13
                                          : level === 16
                                            ? 13
                                            : level === 17
                                              ? 14
                                              : level === 18
                                                ? 14
                                                : level === 19
                                                  ? 15
                                                  : 15;
          values.pactSlots =
            level < 2 ? 1 : level < 11 ? 2 : level < 17 ? 3 : 4;
          values.pactSlotLevel =
            level < 3 ? 1 : level < 5 ? 2 : level < 7 ? 3 : level < 9 ? 4 : 5;
        }
        if (className === "Ranger")
          values.spellsKnown = [
            0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11,
          ][level - 1];
        if (className === "Cleric")
          values.cantripsKnown = level < 4 ? 3 : level < 10 ? 4 : 5;
        if (className === "Druid")
          values.cantripsKnown = level < 4 ? 2 : level < 10 ? 3 : 4;
        if (className === "Wizard")
          values.cantripsKnown = level < 4 ? 3 : level < 10 ? 4 : 5;
        return {
          level,
          features: names.map((n) =>
            className === "Monk" && n === "Unarmored Defense"
              ? {
                  ...feature(n),
                  description:
                    "While wearing no armor and wielding no shield, your AC equals 10 + Dexterity modifier + Wisdom modifier. If you already gained Unarmored Defense from another class, multiclassing does not grant this version.",
                }
              : feature(n),
          ),
          asi: asis[className].includes(level),
          extraAttacks: 1,
          sneakAttackDice: 0,
          ...values,
          subclassFeature: names.some((n) =>
            /^(Path|Bard College Feature|Divine Domain Feature|Druid Circle Feature|Martial Archetype Feature|Monastic Tradition Feature|Sacred Oath Feature|Ranger Archetype Feature|Roguish Archetype Feature|Sorcerous Origin Feature|Otherworldly Patron Feature|Arcane Tradition Feature)$/.test(
              n,
            ),
          ),
        };
      });
      return [className, { subclassAt, levels }];
    }),
  );

/** Resolved resources shared by feature text and the class-level timeline. */
export function classLevelResources(
  className: string,
  row: ClassLevel,
  subclass = "",
): ClassLevel {
  return className === "Druid" &&
    subclass === "Circle of the Moon" &&
    row.level >= 2
    ? {
        ...row,
        wildShapeCR: String(row.level < 6 ? 1 : Math.floor(row.level / 3)),
      }
    : row;
}

export function getClassFeatureCoverageGaps(): string[] {
  const generic =
    "Gain this named feature at the listed class level. Apply its choice, uses, and limits from the 2014 PHB.";
  const subclassPlaceholders = new Set([
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
  return [
    ...new Set(
      Object.values(classProgression).flatMap((tree) =>
        tree.levels.flatMap((row) =>
          row.features
            .filter(
              (item) =>
                item.description === generic &&
                !subclassPlaceholders.has(item.name),
            )
            .map((item) => item.name),
        ),
      ),
    ),
  ].sort();
}

export const subclassFeatureLevels: Record<string, Record<number, string[]>> = {
  "Path of the Berserker": {
    3: ["Frenzy"],
    6: ["Mindless Rage"],
    10: ["Intimidating Presence"],
    14: ["Retaliation"],
  },
  "Path of the Totem Warrior": {
    3: ["Spirit Seeker", "Totem Spirit (choose one animal spirit)"],
    6: ["Aspect of the Beast (choose one animal spirit)"],
    10: ["Spirit Walker"],
    14: ["Totemic Attunement (choose one animal spirit)"],
  },
  "College of Lore": {
    3: ["Bonus Proficiencies", "Cutting Words"],
    6: ["Additional Magical Secrets"],
    14: ["Peerless Skill"],
  },
  "College of Valor": {
    3: ["Bonus Proficiencies", "Combat Inspiration"],
    6: ["Extra Attack"],
    14: ["Battle Magic"],
  },
  "Knowledge Domain": {
    1: ["Blessings of Knowledge"],
    2: ["Knowledge of the Ages"],
    6: ["Read Thoughts"],
    8: ["Potent Spellcasting"],
    17: ["Visions of the Past"],
  },
  "Life Domain": {
    1: ["Bonus Proficiency", "Disciple of Life"],
    2: ["Preserve Life"],
    6: ["Blessed Healer"],
    8: ["Divine Strike"],
    17: ["Supreme Healing"],
  },
  "Light Domain": {
    1: ["Bonus Cantrip", "Warding Flare"],
    2: ["Radiance of the Dawn"],
    6: ["Improved Flare"],
    8: ["Potent Spellcasting"],
    17: ["Corona of Light"],
  },
  "Nature Domain": {
    1: ["Acolyte of Nature", "Bonus Proficiency"],
    2: ["Charm Animals and Plants"],
    6: ["Dampen Elements"],
    8: ["Divine Strike"],
    17: ["Master of Nature"],
  },
  "Tempest Domain": {
    1: ["Bonus Proficiencies", "Wrath of the Storm"],
    2: ["Destructive Wrath"],
    6: ["Thunderbolt Strike"],
    8: ["Divine Strike"],
    17: ["Stormborn"],
  },
  "Trickery Domain": {
    1: ["Blessing of the Trickster"],
    2: ["Invoke Duplicity"],
    6: ["Cloak of Shadows"],
    8: ["Divine Strike"],
    17: ["Improved Duplicity"],
  },
  "War Domain": {
    1: ["Bonus Proficiencies", "War Priest"],
    2: ["Guided Strike"],
    6: ["War God's Blessing"],
    8: ["Divine Strike"],
    17: ["Avatar of Battle"],
  },
  "Circle of the Land": {
    2: [
      "Bonus Cantrip",
      "Natural Recovery",
      "Circle Spells (choose land; additional spells at druid levels 3, 5, 7, and 9)",
    ],
    6: ["Land's Stride"],
    10: ["Nature's Ward"],
    14: ["Nature's Sanctuary"],
  },
  "Circle of the Moon": {
    2: ["Combat Wild Shape", "Circle Forms"],
    6: ["Primal Strike"],
    10: ["Elemental Wild Shape"],
    14: ["Thousand Forms"],
  },
  Champion: {
    3: ["Improved Critical"],
    7: ["Remarkable Athlete"],
    10: ["Additional Fighting Style"],
    15: ["Superior Critical"],
    18: ["Survivor"],
  },
  "Battle Master": {
    3: ["Combat Superiority", "Student of War"],
    7: ["Know Your Enemy"],
    10: ["Improved Combat Superiority"],
    15: ["Relentless"],
    18: ["Improved Combat Superiority"],
  },
  "Eldritch Knight": {
    3: ["Spellcasting", "Weapon Bond"],
    7: ["War Magic"],
    10: ["Eldritch Strike"],
    15: ["Arcane Charge"],
    18: ["Improved War Magic"],
  },
  "Way of the Open Hand": {
    3: ["Open Hand Technique"],
    6: ["Wholeness of Body"],
    11: ["Tranquility"],
    17: ["Quivering Palm"],
  },
  "Way of Shadow": {
    3: ["Shadow Arts"],
    6: ["Shadow Step"],
    11: ["Cloak of Shadows"],
    17: ["Opportunist"],
  },
  "Way of the Four Elements": {
    3: ["Disciple of the Elements (choose disciplines)"],
    6: ["Elemental Discipline"],
    11: ["Elemental Discipline"],
    17: ["Elemental Discipline"],
  },
  "Oath of Devotion": {
    3: [
      "Oath Spells",
      "Channel Divinity: Sacred Weapon",
      "Channel Divinity: Turn the Unholy",
    ],
    7: ["Aura of Devotion"],
    15: ["Purity of Spirit"],
    20: ["Holy Nimbus"],
  },
  "Oath of the Ancients": {
    3: [
      "Oath Spells",
      "Channel Divinity: Nature's Wrath",
      "Channel Divinity: Turn the Faithless",
    ],
    7: ["Aura of Warding"],
    15: ["Undying Sentinel"],
    20: ["Elder Champion"],
  },
  "Oath of Vengeance": {
    3: [
      "Oath Spells",
      "Channel Divinity: Abjure Enemy",
      "Channel Divinity: Vow of Enmity",
    ],
    7: ["Relentless Avenger"],
    15: ["Soul of Vengeance"],
    20: ["Avenging Angel"],
  },
  Hunter: {
    3: ["Hunter's Prey (choose one option)"],
    7: ["Defensive Tactics (choose one option)"],
    11: ["Multiattack (choose one option)"],
    15: ["Superior Hunter's Defense (choose one option)"],
  },
  "Beast Master": {
    3: ["Ranger's Companion"],
    7: ["Exceptional Training"],
    11: ["Bestial Fury"],
    15: ["Share Spells"],
  },
  Thief: {
    3: ["Fast Hands", "Second-Story Work"],
    9: ["Supreme Sneak"],
    13: ["Use Magic Device"],
    17: ["Thief's Reflexes"],
  },
  Assassin: {
    3: ["Bonus Proficiencies", "Assassinate"],
    9: ["Infiltration Expertise"],
    13: ["Impostor"],
    17: ["Death Strike"],
  },
  "Arcane Trickster": {
    3: ["Spellcasting", "Mage Hand Legerdemain"],
    9: ["Magical Ambush"],
    13: ["Versatile Trickster"],
    17: ["Spell Thief"],
  },
  "Draconic Bloodline": {
    1: ["Dragon Ancestor", "Draconic Resilience"],
    6: ["Elemental Affinity"],
    14: ["Dragon Wings"],
    18: ["Draconic Presence"],
  },
  "Wild Magic": {
    1: ["Wild Magic Surge", "Tides of Chaos"],
    6: ["Bend Luck"],
    14: ["Controlled Chaos"],
    18: ["Spell Bombardment"],
  },
  "The Archfey": {
    1: ["Expanded Spell List", "Fey Presence"],
    6: ["Misty Escape"],
    10: ["Beguiling Defenses"],
    14: ["Dark Delirium"],
  },
  "The Fiend": {
    1: ["Expanded Spell List", "Dark One's Blessing"],
    6: ["Dark One's Own Luck"],
    10: ["Fiendish Resilience"],
    14: ["Hurl Through Hell"],
  },
  "The Great Old One": {
    1: ["Expanded Spell List", "Awakened Mind"],
    6: ["Entropic Ward"],
    10: ["Thought Shield"],
    14: ["Create Thrall"],
  },
  "School of Abjuration": {
    2: ["Abjuration Savant", "Arcane Ward"],
    6: ["Projected Ward"],
    10: ["Improved Abjuration"],
    14: ["Spell Resistance"],
  },
  "School of Conjuration": {
    2: ["Conjuration Savant", "Minor Conjuration"],
    6: ["Benign Transposition"],
    10: ["Focused Conjuration"],
    14: ["Durable Summons"],
  },
  "School of Divination": {
    2: ["Divination Savant", "Portent"],
    6: ["Expert Divination"],
    10: ["The Third Eye"],
    14: ["Greater Portent"],
  },
  "School of Enchantment": {
    2: ["Enchantment Savant", "Hypnotic Gaze"],
    6: ["Instinctive Charm"],
    10: ["Split Enchantment"],
    14: ["Alter Memories"],
  },
  "School of Evocation": {
    2: ["Evocation Savant", "Sculpt Spells"],
    6: ["Potent Cantrip"],
    10: ["Empowered Evocation"],
    14: ["Overchannel"],
  },
  "School of Illusion": {
    2: ["Illusion Savant", "Improved Minor Illusion"],
    6: ["Malleable Illusions"],
    10: ["Illusory Self"],
    14: ["Illusory Reality"],
  },
  "School of Necromancy": {
    2: ["Necromancy Savant", "Grim Harvest"],
    6: ["Undead Thralls"],
    10: ["Inured to Undeath"],
    14: ["Command Undead"],
  },
  "School of Transmutation": {
    2: ["Transmutation Savant", "Minor Alchemy"],
    6: ["Transmuter's Stone"],
    10: ["Shapechanger"],
    14: ["Master Transmuter"],
  },
};

const choices = (value: string) =>
  value
    .split(";")
    .map((x) => x.trim())
    .filter(Boolean);

export const classTraining: Record<string, ClassTraining> = {
  Barbarian: {
    hitDie: 12,
    saves: ["Strength", "Constitution"],
    armor: choices("Light armor;Medium armor;Shields"),
    weapons: ["Simple weapons", "Martial weapons"],
    tools: [],
    skillCount: 2,
    skillChoices: choices(
      "Animal Handling;Athletics;Intimidation;Nature;Perception;Survival",
    ),
    primaryAbilities: ["Strength", "Constitution"],
    entryPrerequisites: ["Strength 13"],
    multiclassProficiencies: choices("Shields;Simple weapons;Martial weapons"),
    notes: ["Rage benefits do not work in heavy armor."],
  },
  Bard: {
    hitDie: 8,
    saves: ["Dexterity", "Charisma"],
    armor: ["Light armor"],
    weapons: choices(
      "Simple weapons;Hand crossbows;Longswords;Rapiers;Shortswords",
    ),
    tools: ["Choose three musical instruments"],
    skillCount: 3,
    skillChoices: ["Any skills"],
    primaryAbilities: ["Charisma", "Dexterity"],
    entryPrerequisites: ["Charisma 13"],
    multiclassProficiencies: choices(
      "Light armor;Choose one skill;Choose one musical instrument",
    ),
    notes: [
      "Bards gain three skills of their choice.",
      "A musical instrument can serve as a spellcasting focus.",
    ],
    spellAbility: "Charisma",
    casting: "full",
  },
  Cleric: {
    hitDie: 8,
    saves: ["Wisdom", "Charisma"],
    armor: choices("Light armor;Medium armor;Shields"),
    weapons: ["Simple weapons"],
    tools: [],
    skillCount: 2,
    skillChoices: choices("History;Insight;Medicine;Persuasion;Religion"),
    primaryAbilities: ["Wisdom"],
    entryPrerequisites: ["Wisdom 13"],
    multiclassProficiencies: choices("Light armor;Medium armor;Shields"),
    notes: ["Domain choice is gained at cleric level 1."],
    spellAbility: "Wisdom",
    casting: "full",
  },
  Druid: {
    hitDie: 8,
    saves: ["Intelligence", "Wisdom"],
    armor: choices("Light armor;Medium armor;Shields"),
    weapons: choices(
      "Clubs;Daggers;Darts;Javelins;Maces;Quarterstaffs;Scimitars;Sickles;Slings;Spears",
    ),
    tools: ["Herbalism kit"],
    skillCount: 2,
    skillChoices: choices(
      "Arcana;Animal Handling;Insight;Medicine;Nature;Perception;Religion;Survival",
    ),
    primaryAbilities: ["Wisdom"],
    entryPrerequisites: ["Wisdom 13"],
    multiclassProficiencies: choices("Light armor;Medium armor;Shields"),
    notes: [
      "Druids will not wear metal armor or use metal shields.",
      "Druidic is granted automatically.",
    ],
    spellAbility: "Wisdom",
    casting: "full",
  },
  Fighter: {
    hitDie: 10,
    saves: ["Strength", "Constitution"],
    armor: ["All armor", "Shields"],
    weapons: ["Simple weapons", "Martial weapons"],
    tools: [],
    skillCount: 2,
    skillChoices: choices(
      "Acrobatics;Animal Handling;Athletics;History;Insight;Intimidation;Perception;Survival",
    ),
    primaryAbilities: ["Strength", "Dexterity"],
    entryPrerequisites: ["Strength 13 or Dexterity 13"],
    multiclassProficiencies: choices(
      "Light armor;Medium armor;Shields;Simple weapons;Martial weapons",
    ),
    notes: [],
  },
  Monk: {
    hitDie: 8,
    saves: ["Strength", "Dexterity"],
    armor: [],
    weapons: choices("Simple weapons;Shortswords"),
    tools: ["Choose one artisan's tool or musical instrument"],
    skillCount: 2,
    skillChoices: choices(
      "Acrobatics;Athletics;History;Insight;Religion;Stealth",
    ),
    primaryAbilities: ["Dexterity", "Wisdom"],
    entryPrerequisites: ["Dexterity 13", "Wisdom 13"],
    multiclassProficiencies: choices("Simple weapons;Shortswords"),
    notes: [
      "Unarmored Defense and Unarmored Movement require no armor and no shield.",
    ],
  },
  Paladin: {
    hitDie: 10,
    saves: ["Wisdom", "Charisma"],
    armor: choices("All armor;Shields"),
    weapons: ["Simple weapons", "Martial weapons"],
    tools: [],
    skillCount: 2,
    skillChoices: choices(
      "Athletics;Insight;Intimidation;Medicine;Persuasion;Religion",
    ),
    primaryAbilities: ["Strength", "Charisma"],
    entryPrerequisites: ["Strength 13", "Charisma 13"],
    multiclassProficiencies: choices(
      "Light armor;Medium armor;Shields;Simple weapons;Martial weapons",
    ),
    notes: ["Spellcasting begins at paladin level 2."],
    spellAbility: "Charisma",
    casting: "half",
  },
  Ranger: {
    hitDie: 10,
    saves: ["Strength", "Dexterity"],
    armor: choices("Light armor;Medium armor;Shields"),
    weapons: ["Simple weapons", "Martial weapons"],
    tools: [],
    skillCount: 3,
    skillChoices: choices(
      "Animal Handling;Athletics;Insight;Investigation;Nature;Perception;Stealth;Survival",
    ),
    primaryAbilities: ["Dexterity", "Wisdom"],
    entryPrerequisites: ["Dexterity 13", "Wisdom 13"],
    multiclassProficiencies: choices(
      "Light armor;Medium armor;Shields;Simple weapons;Martial weapons;Choose one skill",
    ),
    notes: ["Spellcasting begins at ranger level 2."],
    spellAbility: "Wisdom",
    casting: "half",
  },
  Rogue: {
    hitDie: 8,
    saves: ["Dexterity", "Intelligence"],
    armor: ["Light armor"],
    weapons: choices(
      "Simple weapons;Hand crossbows;Longswords;Rapiers;Shortswords",
    ),
    tools: ["Thieves' tools"],
    skillCount: 4,
    skillChoices: choices(
      "Acrobatics;Athletics;Deception;Insight;Intimidation;Investigation;Perception;Performance;Persuasion;Sleight of Hand;Stealth",
    ),
    primaryAbilities: ["Dexterity"],
    entryPrerequisites: ["Dexterity 13"],
    multiclassProficiencies: choices(
      "Light armor;Choose one skill;Thieves' tools",
    ),
    notes: [
      "Expertise applies to proficiencies selected at rogue levels 1 and 6.",
    ],
  },
  Sorcerer: {
    hitDie: 6,
    saves: ["Constitution", "Charisma"],
    armor: [],
    weapons: choices("Daggers;Darts;Slings;Quarterstaffs;Light crossbows"),
    tools: [],
    skillCount: 2,
    skillChoices: choices(
      "Arcana;Deception;Insight;Intimidation;Persuasion;Religion",
    ),
    primaryAbilities: ["Charisma", "Constitution"],
    entryPrerequisites: ["Charisma 13"],
    multiclassProficiencies: [],
    notes: ["Sorcerous Origin is gained at sorcerer level 1."],
    spellAbility: "Charisma",
    casting: "full",
  },
  Warlock: {
    hitDie: 8,
    saves: ["Wisdom", "Charisma"],
    armor: ["Light armor"],
    weapons: ["Simple weapons"],
    tools: [],
    skillCount: 2,
    skillChoices: choices(
      "Arcana;Deception;History;Intimidation;Investigation;Nature;Religion",
    ),
    primaryAbilities: ["Charisma", "Constitution"],
    entryPrerequisites: ["Charisma 13"],
    multiclassProficiencies: choices("Light armor;Simple weapons"),
    notes: [
      "Pact slots recharge on a short or long rest.",
      "Otherworldly Patron is gained at warlock level 1.",
    ],
    spellAbility: "Charisma",
    casting: "pact",
  },
  Wizard: {
    hitDie: 6,
    saves: ["Intelligence", "Wisdom"],
    armor: [],
    weapons: choices("Daggers;Darts;Slings;Quarterstaffs;Light crossbows"),
    tools: [],
    skillCount: 2,
    skillChoices: choices(
      "Arcana;History;Insight;Investigation;Medicine;Religion",
    ),
    primaryAbilities: ["Intelligence"],
    entryPrerequisites: ["Intelligence 13"],
    multiclassProficiencies: [],
    notes: [
      "Arcane Tradition is gained at wizard level 2.",
      "A spellbook is part of the wizard's spell access.",
    ],
    spellAbility: "Intelligence",
    casting: "full",
  },
};

export function activeClassFeatures(
  className: string,
  level: number,
  subclassName = "",
): FeatureDefinition[] {
  const tree = classProgression[className];
  if (!tree || level < 1) return [];
  const result = tree.levels
    .slice(0, Math.min(20, level))
    .flatMap((row) => row.features);
  const subclass = subclassFeatureLevels[subclassName];
  if (subclass)
    for (const [unlock, names] of Object.entries(subclass))
      if (Number(unlock) <= level)
        result.push(...names.map((name) => feature(name, "Subclass")));
  return result;
}
export type SubclassDetail = {
  className: string;
  title: string;
  overview: string;
  source: string;
  featureNotes: Record<string, string>;
};

export type ChoicePlan = {
  key: string;
  className: string;
  subclass: string;
  unlockLevel: number;
  title: string;
  choose: number;
  options: string[];
  allowCustom?: boolean;
  help: string;
  sourceReference?: string;
};

export type ChoiceOptionDetail = {
  description: string;
  descriptionHr?: string;
  minimumLevel?: number;
  reason?: string;
  pactBoon?: string;
  spellKnown?: string;
  sourceReference?: string;
};

export const optionId = (name: string) =>
  name
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const featureNotes: Record<string, string> = {
  "Bonus Proficiency":
    "The Nature Domain grants proficiency with heavy armor at cleric level 1. This is a subclass grant even when multiclass entry did not grant heavy armor; possessing armor does not itself grant proficiency.",
  Frenzy:
    "While raging, you can choose to enter a frenzy. It enables a bonus-action melee weapon attack on later turns of that rage; when the rage ends, the frenzy causes one level of exhaustion.",
  "Mindless Rage":
    "While raging, you cannot be charmed or frightened. If either condition is already affecting you when you rage, that effect is suspended for the rage's duration.",
  "Intimidating Presence":
    "Use an action to frighten a creature you can see within range. The target makes a Wisdom save against your class feature DC; maintaining the effect takes your action on later turns, and the target can repeat the save.",
  Retaliation:
    "When a creature within 5 feet damages you, you can use your reaction to make a melee weapon attack against it.",
  "Spirit Seeker":
    "You can cast Beast Sense and Speak with Animals as rituals. These are utility spells tied to this path; they do not use spell slots when cast as rituals.",
  "Totem Spirit (choose one animal spirit)":
    "Choose Bear, Eagle, or Wolf when this feature is gained. The spirit's benefit applies while raging and differs by animal; record the chosen spirit because it determines the feature's effect.",
  "Aspect of the Beast (choose one animal spirit)":
    "Choose an animal spirit. Bear, Eagle, and Wolf grant different exploration or travel benefits; this choice can match or differ from your earlier totem spirit.",
  "Spirit Walker":
    "You can cast Commune with Nature as a ritual. The spirit answers with information about the surrounding natural area, subject to the spell's normal limits.",
  "Totemic Attunement (choose one animal spirit)":
    "Choose Bear, Eagle, or Wolf for a stronger rage-linked benefit. Record this choice separately; the result depends on the selected spirit.",
  "Bonus Proficiencies":
    "Gain the proficiencies named by this subclass feature. The exact grants depend on the selected subclass; any overlapping proficiency is not counted twice.",
  "Cutting Words":
    "When a creature you can hear makes an attack roll, ability check, or damage roll, you can use your reaction and expend Bardic Inspiration to subtract the die from its result, subject to the feature's exclusions.",
  "Additional Magical Secrets":
    "Learn two spells of your choice from any class list. Each must be a level you can cast; these spells count as bard spells for you and do not count against your normal spells known.",
  "Peerless Skill":
    "When you make an ability check, you may expend a Bardic Inspiration use and add its die to your own check after rolling the d20, potentially turning a failure into a success.",
  "Combat Inspiration":
    "An inspired creature can add the Bardic Inspiration die to weapon damage, or use its reaction to add the die to AC against one attack after seeing the roll.",
  "Battle Magic":
    "After using an action to cast a bard spell, you can make one weapon attack as a bonus action.",
  "Blessings of Knowledge":
    "Choose two eligible knowledge skills and gain proficiency and expertise in them. You also learn two languages of your choice.",
  "Knowledge of the Ages":
    "Use Channel Divinity to gain proficiency in one skill or tool for a limited time. Choose the proficiency when you invoke the feature.",
  "Read Thoughts":
    "Use Channel Divinity to read a nearby creature's surface thoughts; a failed Wisdom save can let you probe deeper and influence it with a suggestion effect.",
  "Potent Spellcasting":
    "Add your Wisdom modifier to the damage you deal with a cleric cantrip.",
  "Visions of the Past":
    "Meditate to receive a vision about a recent event or an object's history. The information depends on the question and the DM's description of the past.",
  "Disciple of Life":
    "When you restore hit points with a spell of 1st level or higher, add a bonus based on the spell's level to the healing of one target.",
  "Preserve Life":
    "Use Channel Divinity to distribute a pool of healing among creatures within range. It cannot raise a creature above half its hit point maximum and cannot affect undead or constructs.",
  "Blessed Healer":
    "When you cast a 1st-level-or-higher spell that restores another creature's hit points, you also regain a smaller amount of hit points.",
  "Divine Strike":
    "Once on each of your turns when you hit with a weapon attack, deal extra damage of the domain's type. The extra damage increases at cleric level 14.",
  "Supreme Healing":
    "When you roll dice to restore hit points with a spell, treat each healing die as having rolled its maximum value.",
  "Bonus Cantrip":
    "Learn the cantrip specified by the domain feature. It counts as a cleric cantrip for you and does not count against your normal cantrips known.",
  "Warding Flare":
    "When a creature you can see attacks you, use your reaction to impose disadvantage on that attack. Uses are limited and recharge on a long rest.",
  "Radiance of the Dawn":
    "Use Channel Divinity to disperse magical darkness and deal radiant damage to hostile creatures in the area; a Constitution save reduces the damage.",
  "Improved Flare":
    "You can use Warding Flare to protect an eligible nearby creature, rather than only yourself.",
  "Corona of Light":
    "Use an action to create a radiant aura that makes nearby enemies more vulnerable to your fire and radiant spells for a limited duration.",
  "Acolyte of Nature":
    "Choose one druid cantrip and learn it. You also gain proficiency in one nature-related skill from the feature's list.",
  "Charm Animals and Plants":
    "Use Channel Divinity to charm eligible beasts and plants within range that fail a Wisdom save.",
  "Dampen Elements":
    "When you or a nearby creature takes acid, cold, fire, lightning, or thunder damage, use your reaction to grant resistance to that instance of damage.",
  "Master of Nature":
    "When you charm an animal or plant with your domain feature, you can command affected creatures as a bonus action while they remain charmed.",
  "Wrath of the Storm":
    "When a nearby creature hits you with an attack, use your reaction to deal lightning or thunder damage; a Dexterity save reduces the damage. Uses recharge on a long rest.",
  "Destructive Wrath":
    "When you roll lightning or thunder damage, use Channel Divinity to deal maximum damage instead of rolling.",
  "Thunderbolt Strike":
    "When you deal lightning damage to a Large-or-smaller creature, you can push it away from you.",
  Stormborn:
    "You gain a flying speed while outdoors, subject to the feature's conditions.",
  "Blessing of the Trickster":
    "Use an action to touch a willing creature other than yourself. It gains advantage on Dexterity (Stealth) checks for 1 hour or until you use the feature again. No rest or resource is needed to use this blessing again.",
  "Invoke Duplicity":
    "Use an action and Channel Divinity to create a perfect visual duplicate within 30 feet for up to 1 minute, requiring concentration as if on a spell. Move it up to 30 feet with a bonus action, remaining within 120 feet. You may cast spells as though at its location but must use your own senses. When both you and the duplicate are within 5 feet of a creature that sees it, you have advantage on attacks against that creature.",
  "Cloak of Shadows":
    "Use an action and Channel Divinity to become invisible until the end of your next turn. Attacking or casting a spell ends it early. This cleric feature has no dim-light or darkness requirement.",
  "Improved Duplicity":
    "Your duplicate becomes more capable: you can create additional duplicates and use them to improve attacks under the feature's conditions.",
  "War Priest":
    "After taking the Attack action, make an additional weapon attack as a bonus action. The number of uses depends on your Wisdom modifier and returns on a long rest.",
  "Guided Strike":
    "When you or a nearby creature makes an attack roll, use Channel Divinity to add a bonus after seeing the roll but before its outcome is declared.",
  "War God's Blessing":
    "Use your reaction and Channel Divinity to grant Guided Strike's attack bonus to another creature's attack.",
  "Avatar of Battle":
    "You gain resistance to bludgeoning, piercing, and slashing damage from nonmagical weapons.",
  "Natural Recovery":
    "Once per day during a short rest, recover eligible expended spell slots whose combined levels fit the feature's limit. No recovered slot can be 6th level or higher.",
  "Circle Spells (choose land; additional spells at druid levels 3, 5, 7, and 9)":
    "Choose Arctic, Coast, Desert, Forest, Grassland, Mountain, Swamp, or Underdark. The selected land grants a fixed set of circle spells at the listed druid levels; these spells are always prepared and do not count against your prepared-spell limit.",
  "Land's Stride":
    "Move through nonmagical difficult terrain without extra movement and pass through nonmagical plants without their usual penalties. Magical plants and effects can still hinder you.",
  "Nature's Ward":
    "You cannot be charmed or frightened by elementals or fey, and disease and poison no longer affect you.",
  "Nature's Sanctuary":
    "When a beast or plant attacks you, it may need to make a Wisdom save or be unable to attack you for a time; the effect can end if you harm it.",
  "Combat Wild Shape":
    "Use Wild Shape as a bonus action. While transformed, you can expend a spell slot as a bonus action to restore hit points to yourself.",
  "Circle Forms":
    "At druid level 2, Wild Shape may use beasts up to CR 1 instead of the normal CR ceiling. From druid level 6, the ceiling is druid level divided by 3, rounded down. You must have seen the beast. Movement restrictions still follow normal druid progression: no swimming speed before level 4 and no flying speed before level 8.",
  "Primal Strike":
    "Your attacks in beast form count as magical for overcoming resistance and immunity to nonmagical attacks.",
  "Elemental Wild Shape":
    "Expend two uses of Wild Shape at once to transform into an eligible air, earth, fire, or water elemental.",
  "Thousand Forms": "Cast Alter Self at will without expending a spell slot.",
  "Improved Critical":
    "Your weapon attacks score a critical hit on a d20 roll of 19 or 20.",
  "Remarkable Athlete":
    "Add half your proficiency bonus, rounded up, to eligible Strength, Dexterity, and Constitution checks that do not already include proficiency. Your running long jump also gains distance based on Strength.",
  "Additional Fighting Style":
    "Choose one additional option from the Fighter's Fighting Style list. You cannot select a style you already have unless its rule explicitly allows it.",
  "Superior Critical":
    "Your weapon attacks score a critical hit on a d20 roll of 18–20.",
  Survivor:
    "At the start of your turn, regain hit points while conscious and at or below half your hit point maximum.",
  "Combat Superiority":
    "Learn combat maneuvers and gain superiority dice. Spend a die when using a maneuver; the die size and number of maneuvers known improve at specified fighter levels, and expended dice return on a short or long rest.",
  "Student of War": "Gain proficiency with one artisan's tool of your choice.",
  "Know Your Enemy":
    "After observing or interacting with a creature outside combat, learn whether it is superior, equal, or inferior to you in selected physical or combat statistics.",
  "Improved Combat Superiority":
    "Your superiority dice increase in size at the fighter levels listed in the class progression.",
  Relentless:
    "When you begin combat without a superiority die remaining, regain one die.",
  "Weapon Bond":
    "Bond with a weapon through a ritual. You cannot be disarmed of it unless incapacitated, and you can summon it to your hand while it is on the same plane.",
  "War Magic":
    "After using an action to cast a cantrip, you can make a weapon attack as a bonus action.",
  "Eldritch Strike":
    "When you hit a creature with a weapon, it has disadvantage on its next saving throw against a spell you cast before the end of your next turn.",
  "Arcane Charge":
    "When you use Action Surge, teleport to an unoccupied space you can see within a limited distance before or after the additional action.",
  "Improved War Magic":
    "After using your action to cast a spell, you can make a weapon attack as a bonus action.",
  "Open Hand Technique":
    "When a Flurry of Blows attack hits, choose to deny the target's reactions, force a Strength save or push it, or force a Dexterity save or knock it prone.",
  "Wholeness of Body":
    "Use an action to regain hit points equal to three times your monk level. You regain the use after a long rest.",
  Tranquility:
    "After a long rest, gain a Sanctuary-like protective effect until your next long rest or until you break it in a specified way.",
  "Quivering Palm":
    "Spend ki after a hit to set a vibration in the target. Later, use an action to trigger it; the target makes a Constitution save or drops to 0 hit points, with substantial damage on a success.",
  "Shadow Arts":
    "Spend ki to cast Darkness, Darkvision, Pass without Trace, or Silence without material components. You also learn Minor Illusion.",
  "Shadow Step":
    "In dim light or darkness, teleport between spaces you can see that are also dim or dark. Your next melee attack that turn has advantage.",
  Opportunist:
    "When a creature within 5 feet is hit by another creature's attack, use your reaction to make a melee attack against it.",
  "Disciple of the Elements (choose disciplines)":
    "Learn an elemental discipline. Some disciplines grant a spell-like effect and have a ki cost; the level at which you learn it limits which disciplines are available.",
  "Elemental Discipline":
    "Learn an additional eligible elemental discipline, or replace one you know with another available discipline. Record the exact discipline and ki cost.",
  "Oath Spells":
    "The oath grants named spells at specific paladin levels. They are always prepared and do not count against the number of paladin spells you can prepare.",
  "Channel Divinity: Sacred Weapon":
    "Use Channel Divinity to empower one weapon, adding your Charisma modifier to its attack rolls for a limited time and making it emit light.",
  "Channel Divinity: Turn the Unholy":
    "Use Channel Divinity to make eligible fiends and undead within range flee if they fail a Wisdom save.",
  "Aura of Devotion":
    "You and nearby allies cannot be charmed while you are conscious; the aura reaches farther at paladin level 18.",
  "Purity of Spirit":
    "You are always under the effects of Protection from Evil and Good. Against aberrations, celestials, elementals, fey, fiends, and undead, their attacks against you have disadvantage and they cannot charm, frighten, or possess you; existing such effects grant advantage on new saving throws. This permanent oath feature requires no concentration or material components.",
  "Holy Nimbus":
    "Use an action to radiate sunlight and deal radiant damage to nearby enemies; the transformation also grants defensive benefits for its duration.",
  "Channel Divinity: Nature's Wrath":
    "Use Channel Divinity to restrain a nearby creature with spectral vines if it fails a Strength or Dexterity save.",
  "Channel Divinity: Turn the Faithless":
    "Use Channel Divinity to make eligible fey and fiends within range flee if they fail a Wisdom save.",
  "Aura of Warding":
    "You and nearby allies take reduced damage from spells while you are conscious; the aura reaches farther at paladin level 18.",
  "Undying Sentinel":
    "Once per long rest, when damage would reduce you to 0 HP without killing you outright, remain at 1 HP instead. You suffer no drawbacks from old age and cannot be aged magically; the feature does not resurrect you or grant routine healing after a rest.",
  "Elder Champion":
    "Transform into an ancient nature champion, gaining regeneration, spellcasting benefits, and the ability to hinder nearby enemies.",
  "Channel Divinity: Abjure Enemy":
    "Use Channel Divinity to frighten and slow one creature that fails a Wisdom save; fiends and undead have a weaker defense against it.",
  "Channel Divinity: Vow of Enmity":
    "Use Channel Divinity to gain advantage on attacks against one visible creature for a limited time.",
  "Relentless Avenger":
    "When you hit a creature with an opportunity attack, move as part of the same reaction without provoking opportunity attacks from that creature.",
  "Soul of Vengeance":
    "When a creature affected by your Vow of Enmity attacks, use your reaction to make a melee weapon attack against it if it is in range.",
  "Avenging Angel":
    "Transform for a limited time, gaining a flying speed and an aura that can frighten enemies who see you.",
  "Hunter's Prey (choose one option)":
    "Choose Colossus Slayer, Giant Killer, or Horde Breaker. Each is a different once-per-turn damage or reaction-attack option; the chosen option determines when this feature applies.",
  "Defensive Tactics (choose one option)":
    "Choose Escape the Horde, Multiattack Defense, or Steel Will. The options defend against opportunity attacks, repeated attacks from one creature, or fear effects respectively.",
  "Multiattack (choose one option)":
    "Choose Volley or Whirlwind Attack. Volley attacks multiple creatures at range; Whirlwind Attack makes separate melee attacks against nearby creatures.",
  "Superior Hunter's Defense (choose one option)":
    "Choose Evasion, Stand Against the Tide, or Uncanny Dodge. These offer different defenses against area effects, missed melee attacks, or damage from an attacker you can see.",
  "Ranger's Companion":
    "Choose a beast no larger than Medium and no higher than CR 1/4. Add your proficiency bonus to its AC, attack rolls, damage rolls, and proficient saves/skills; its HP maximum is its normal maximum or four times your ranger level, whichever is higher. It takes its turn on your initiative. Direct its movement freely, but use your action to command Attack, Dash, Disengage, or Help; without a command it Dodges. From Extra Attack, you may make one weapon attack when commanding its Attack. It can react without a command and acts independently if you are absent or incapacitated.",
  "Exceptional Training":
    "On a turn when the companion does not attack, use your bonus action to command Dash, Disengage, or Help. Its attacks count as magical against resistance and immunity to nonmagical attacks. Without a command it already takes the Dodge action. The companion is the acting creature; your bonus action issues its command.",
  "Bestial Fury":
    "When you command your companion to take the Attack action, it can make two attacks or take its Multiattack action if it has one.",
  "Share Spells":
    "When you cast a spell targeting yourself, your companion can also benefit if it is within the feature's distance.",
  "Fast Hands":
    "Use Cunning Action to make a Sleight of Hand check, use thieves' tools to disarm a trap or open a lock, or take the Use an Object action as a bonus action.",
  "Second-Story Work":
    "Climb faster and increase the distance of running jumps based on your Dexterity modifier.",
  "Supreme Sneak":
    "Gain advantage on Dexterity (Stealth) checks when moving no more than half your speed on the same turn.",
  "Use Magic Device":
    "Ignore class, race, and level prerequisites when using magic items, subject to the feature's restrictions.",
  "Thief's Reflexes":
    "During the first round of combat, take an additional turn at your initiative minus 10. You cannot use this feature when surprised.",
  Assassinate:
    "You gain advantage against creatures that have not yet acted in the first combat round. A hit against a surprised creature is a critical hit.",
  "Infiltration Expertise":
    "Spend time and money to establish a false identity with supporting history and documentation.",
  Impostor:
    "Study a person to imitate their speech, writing, and behavior; a suspicious observer may test the disguise.",
  "Death Strike":
    "A surprised target that fails a Constitution save after your qualifying attack takes extra damage based on that attack's damage.",
  "Mage Hand Legerdemain":
    "Cast Mage Hand with the feature's enhancements and use it for delicate theft, disarming, or lock work at range.",
  "Magical Ambush":
    "When hidden from a creature, that creature has disadvantage on its saving throw against a spell you cast on it.",
  "Versatile Trickster":
    "Use Mage Hand to distract a creature and gain advantage on attacks against it under the feature's conditions.",
  "Spell Thief":
    "Use your reaction after a creature casts a spell targeting you to try to negate it and temporarily learn the spell if the target fails its save.",
  "Dragon Ancestor":
    "Choose a dragon type, learn Draconic, and double applicable proficiency on Charisma checks with dragons. Its damage type is used by Elemental Affinity from sorcerer level 6; Draconic Resilience grants AC and hit points independently of that type.",
  "Draconic Resilience":
    "Your hit point maximum increases by 1 for each sorcerer level. While not wearing armor, your AC is 13 + Dexterity modifier.",
  "Elemental Affinity":
    "When casting a spell matching your ancestry's damage type, add Charisma to one damage roll. You can spend sorcery points to gain resistance to that type temporarily.",
  "Dragon Wings":
    "Sprout dragon wings and gain a flying speed while you are not wearing armor that prevents their use.",
  "Draconic Presence":
    "Spend sorcery points to project an aura that can charm or frighten nearby creatures that fail a Wisdom save.",
  "Wild Magic Surge":
    "After casting an eligible sorcerer spell, the DM can call for a surge roll that may produce a random magical effect. The table result can have lasting or immediate consequences.",
  "Tides of Chaos":
    "Gain advantage on one eligible attack roll, ability check, or saving throw. The DM can later trigger a Wild Magic Surge to restore this feature.",
  "Bend Luck":
    "Spend sorcery points and use your reaction to add or subtract a d4 from another creature's attack roll, ability check, or saving throw.",
  "Controlled Chaos":
    "When a Wild Magic Surge occurs, roll twice on the surge table and choose which of the two results takes effect.",
  "Spell Bombardment":
    "When a spell's damage dice roll their highest number, roll one of those dice again and add the new result, subject to once-per-turn limits.",
  "Expanded Spell List":
    "The patron adds named spells to the warlock spell list. This expands which spells you may choose; it does not automatically grant every listed spell known.",
  "Fey Presence":
    "Use an action to project fey charm or fear in a nearby area. Affected creatures make a Wisdom save; uses return after a short or long rest.",
  "Misty Escape":
    "When you take damage, use your reaction to turn invisible and teleport a short distance. You can use this again after a short or long rest.",
  "Beguiling Defenses":
    "You are immune to charm. When a creature attempts to charm you, you can use your reaction to attempt to charm it in return.",
  "Dark Delirium":
    "Choose a nearby creature to experience an illusory realm; it makes a Wisdom save and may be incapacitated while the effect lasts.",
  "Dark One's Blessing":
    "When you reduce a hostile creature to 0 hit points, gain temporary hit points based on your Charisma modifier and warlock level.",
  "Dark One's Own Luck":
    "When you make an ability check or saving throw, add a d10 after rolling. Uses return on a short or long rest.",
  "Fiendish Resilience":
    "After a rest, choose one damage type and gain resistance to it until you choose again. Magical or silvered weapon damage is excluded from the listed choices.",
  "Hurl Through Hell":
    "Once per turn when you hit a creature, banish it temporarily through a harmful plane; it returns and takes psychic damage. Uses return on a long rest.",
  "Awakened Mind":
    "Communicate telepathically with a creature you can see within range if it understands at least one language; it does not automatically let it reply telepathically.",
  "Entropic Ward":
    "Use your reaction when a creature attacks you to impose disadvantage. If it misses, your next attack against it has advantage. Uses return on a short or long rest.",
  "Thought Shield":
    "Your thoughts cannot be read unless you allow it; you resist psychic damage and reflect some psychic damage to its source.",
  "Create Thrall":
    "Touch an incapacitated humanoid to charm it until a specified ending condition. You can communicate telepathically with it over a long distance while it is on the same plane.",
  "Arcane Ward":
    "Create a ward when you cast an abjuration spell. It absorbs damage before you do, has hit points based on wizard level and Intelligence, and regains hit points when you cast qualifying spells.",
  "Projected Ward":
    "When a nearby creature takes damage, use your reaction to have your Arcane Ward absorb that damage instead.",
  "Improved Abjuration":
    "Add your proficiency bonus to ability checks made as part of casting an abjuration spell, such as countering or dispelling magic.",
  "Spell Resistance":
    "Gain advantage on saving throws against spells and resistance to damage from spells.",
  "Minor Conjuration":
    "Use an action to conjure a small nonmagical object you have seen. It lasts for a limited time or until it is damaged or used to harm a creature.",
  "Benign Transposition":
    "Teleport to an unoccupied space you can see or swap places with a willing Small or Medium creature. You regain the use after a long rest or casting a conjuration spell of 1st level or higher.",
  "Focused Conjuration":
    "Taking damage cannot break your concentration on a conjuration spell.",
  "Durable Summons":
    "Each creature you summon or create with a conjuration spell gains 30 temporary HP. This is a fixed amount, independent of wizard level, and follows the normal rule against stacking temporary HP.",
  "Divination Savant":
    "Copying divination spells into your spellbook costs less time and gold than normal.",
  Portent:
    "After a long rest, roll two d20s and record them. Replace an attack roll, saving throw, or ability check made by you or a visible creature with a recorded result before the roll is made.",
  "Expert Divination":
    "When you cast a divination spell of 2nd level or higher using a spell slot, regain a lower-level spell slot under the feature's limits.",
  "The Third Eye":
    "Choose one benefit—darkvision, ethereal sight, greater comprehension, or seeing invisibility—after a rest. The benefit lasts until your next rest.",
  "Greater Portent":
    "Roll and record three Portent dice after a long rest instead of two.",
  "Hypnotic Gaze":
    "Use an action to charm and incapacitate a nearby creature that fails a Wisdom save. Maintain the effect with your action; damage or moving too far ends it.",
  "Instinctive Charm":
    "When a creature attacks you, use your reaction to redirect its attack toward another eligible creature. The attacker makes a Wisdom save to resist.",
  "Split Enchantment":
    "When you cast an enchantment spell that targets one creature, you can also target a second eligible creature.",
  "Alter Memories":
    "When a creature fails a save against your enchantment spell, you can alter or erase part of its memory and can make it unaware that it was charmed, subject to limits.",
  "Sculpt Spells":
    "When you cast an evocation spell affecting other creatures you can see, choose a limited number to automatically succeed on their saves and take no damage if they would normally take half on a success.",
  "Potent Cantrip":
    "When a creature succeeds on a saving throw against your damaging cantrip, it still takes a small portion of that cantrip's damage.",
  "Empowered Evocation":
    "Add your Intelligence modifier to one damage roll of an evocation wizard spell.",
  Overchannel:
    "Maximize damage from an eligible wizard spell. Repeated use before a long rest causes increasing necrotic damage to you.",
  "Improved Minor Illusion":
    "Learn Minor Illusion if you do not already know it, and create both its sound and image with a single casting.",
  "Malleable Illusions":
    "Use an action to alter the nature of a qualifying illusion you created, provided it remains within the spell's limits.",
  "Illusory Self":
    "Use a reaction to interpose an illusory duplicate when an attack hits you, causing the attack to miss. Uses return after a short or long rest.",
  "Illusory Reality":
    "Make one inanimate, nonmagical object in an illusion real for a limited time. It cannot directly deal damage or otherwise harm a creature.",
  "Necromancy Savant":
    "Copying necromancy spells into your spellbook costs less time and gold than normal.",
  "Grim Harvest":
    "Once per turn when a spell you cast kills one or more creatures, regain hit points based on the spell's level; the feature excludes undead and constructs.",
  "Undead Thralls":
    "Add Animate Dead to your spellbook and improve undead you create with it. When casting it, you can target an additional corpse or pile of bones.",
  "Inured to Undeath":
    "Gain resistance to necrotic damage and your hit point maximum cannot be reduced.",
  "Command Undead":
    "Use an action to target an undead creature and attempt to control it after a Charisma save. Stronger or intelligent undead have special limits.",
  "Transmutation Savant":
    "Copying transmutation spells into your spellbook costs less time and gold than normal.",
  "Minor Alchemy":
    "Spend time transforming a nonmagical wooden, stone, iron, copper, or silver object into another listed material; the change ends after a limited duration.",
  "Transmuter's Stone":
    "Create a stone that grants one selected benefit to its bearer, such as a movement, resistance, darkvision, or Constitution benefit. You may change the benefit by recasting a qualifying spell.",
  Shapechanger:
    "Add Polymorph to your spellbook and cast it on yourself without a spell slot, transforming only into a beast of limited challenge rating. Uses return after a short or long rest.",
  "Master Transmuter":
    "Consume your Transmuter's Stone to create one powerful effect, such as transforming matter, restoring life, curing a condition, or restoring youth; the stone is destroyed.",
  "Abjuration Savant":
    "When copying an abjuration spell into your spellbook, the time and gold cost are halved.",
  "Conjuration Savant":
    "When copying a conjuration spell into your spellbook, the time and gold cost are halved.",
  "Enchantment Savant":
    "When copying an enchantment spell into your spellbook, the time and gold cost are halved.",
  "Evocation Savant":
    "When copying an evocation spell into your spellbook, the time and gold cost are halved.",
  "Illusion Savant":
    "When copying an illusion spell into your spellbook, the time and gold cost are halved.",
  "Extra Attack":
    "When you take the Attack action on your turn, you can attack twice instead of once.",
  Spellcasting:
    "Gain a restricted Wizard spell progression through this subclass. Intelligence is the spellcasting ability; spell level, slots, spells known, and school restrictions follow the subclass table.",
};

const overview: Record<string, string> = {
  "Path of the Berserker":
    "A direct, aggressive Rage specialist. Frenzy adds a bonus-action attack but brings exhaustion, while later features defend against mental control and punish nearby attackers.",
  "Path of the Totem Warrior":
    "A spirit-guided path with separate animal choices at multiple levels. Bear emphasizes resilience, Eagle mobility and perception, and Wolf support for allies; each choice has its own effect.",
  "College of Lore":
    "A knowledge-focused bard with extra skill training, a reaction that weakens enemy rolls, additional spells from other class lists, and a way to improve your own checks.",
  "College of Valor":
    "A martial-support bard with armor and weapon training, inspiration that helps combat, Extra Attack, and a later spell-plus-weapon option.",
  "Knowledge Domain":
    "A scholarly cleric domain granting languages, skill expertise, temporary training, mind-reading, and access to information about the past.",
  "Life Domain":
    "A healer domain that improves healing spells, channels healing to a group, rewards healing allies, and eventually maximizes healing dice.",
  "Light Domain":
    "A radiant domain with a granted cantrip, a reaction that disrupts attacks, area radiant damage, and stronger radiant and fire magic.",
  "Nature Domain":
    "A nature-linked domain combining a druid cantrip and skill, influence over beasts and plants, and protection against elemental damage.",
  "Tempest Domain":
    "A storm domain with martial training, reactive lightning or thunder, maximized storm damage, forced movement, and later flight.",
  "Trickery Domain":
    "A deception-focused domain supporting stealth, creating a magical duplicate, and using shadows and illusions to confuse enemies.",
  "War Domain":
    "A battle-ready domain with martial training, bonus attacks, improved attack accuracy, support for allies' attacks, and weapon-damage resistance.",
  "Circle of the Land":
    "A terrain-based druid whose land choice sets bonus spells. Natural Recovery restores some spell slots, while later features improve movement and protection.",
  "Circle of the Moon":
    "A Wild Shape specialist that transforms quickly, uses stronger combat forms, gains magical attacks in beast form, and eventually takes elemental forms.",
  Champion:
    "A straightforward martial path improving critical-hit range, physical checks, fighting-style breadth, and low-health recovery.",
  "Battle Master":
    "A tactical fighter using superiority dice and chosen maneuvers. It adds an artisan-tool proficiency and later improves dice, tactical knowledge, and recovery.",
  "Eldritch Knight":
    "A fighter with a limited Wizard spell selection, bonded weapons, and features that combine spellcasting with weapon attacks and movement.",
  "Way of the Open Hand":
    "An unarmed-control path that adds effects to Flurry of Blows, self-healing, protective calm, and a costly delayed finishing technique.",
  "Way of Shadow":
    "A stealth path that spends ki on selected spells, teleports between shadows, becomes invisible in darkness, and attacks when nearby foes are struck.",
  "Way of the Four Elements":
    "An elemental path that spends ki on selected disciplines. Each discipline has a level requirement and cost; choices should be recorded by monk level.",
  "Oath of Devotion":
    "A protective oath with always-prepared oath spells, weapon empowerment, anti-undead power, a charm-proof aura, and a radiant transformation.",
  "Oath of the Ancients":
    "A life-protecting oath with nature-themed channel effects, resistance for nearby allies, strong survival, and a nature transformation.",
  "Oath of Vengeance":
    "A pursuit oath focused on marking and isolating a foe, chasing it, counterattacking, and eventually taking flight against enemies.",
  Hunter:
    "A tactical ranger who chooses one option at each feature tier. These four choices separately shape damage, defense, multiple-target attacks, and survival.",
  "Beast Master":
    "A ranger partnered with a beast. The companion has its own statistics and actions; the PHB command rules affect how it attacks and acts alongside you.",
  Thief:
    "A practical rogue focused on quick object use, climbing and jumping, stealth, magic items, and an extra first-round turn at high level.",
  Assassin:
    "An infiltration rogue gaining disguise and poison proficiencies, opening-round advantages, false identities, impersonation, and a surprise-based strike.",
  "Arcane Trickster":
    "A rogue with a restricted Wizard spell selection, enhanced Mage Hand, and features that exploit being hidden or distracting a target.",
  "Draconic Bloodline":
    "A sorcerer whose chosen dragon ancestry sets a damage affinity and later grants resilience, matching spell damage, flight, and a fear-or-charm aura.",
  "Wild Magic":
    "A sorcerer whose spells can trigger random surges. Tides of Chaos, Bend Luck, and later control features add ways to influence the uncertainty.",
  "The Archfey":
    "A pact with a fey power grants charm and fear, an emergency misty escape, charm defenses, and a later illusory prison.",
  "The Fiend":
    "A pact with a fiend grants durability from defeating foes, a boost to checks or saves, chosen damage resistance, and a banishing attack.",
  "The Great Old One":
    "A pact with an alien power grants limited telepathy, attack disruption, psychic defense, and the ability to bind a charmed creature.",
  "School of Abjuration":
    "A protective school that creates a damage-absorbing ward, extends it to allies, improves counter-magic checks, and resists spells.",
  "School of Conjuration":
    "A summoning school that creates a small object, enables short teleportation, protects concentration, and strengthens conjured creatures.",
  "School of Divination":
    "A foresight school centered on recorded Portent dice, recovering spell slots through divination, and choosing enhanced senses.",
  "School of Enchantment":
    "A mind-magic school with a maintained charm, redirected attacks, doubled single-target enchantments, and memory alteration.",
  "School of Evocation":
    "A damage-magic school that protects chosen allies from your area spells and improves cantrip and spell damage.",
  "School of Illusion":
    "An illusion school that improves Minor Illusion, reshapes existing illusions, creates a defensive duplicate, and makes one illusion object real.",
  "School of Necromancy":
    "A life-and-death school that can recover vitality after spell kills, strengthen created undead, resist necrotic effects, and control undead.",
  "School of Transmutation":
    "A transformation school that changes materials, creates a configurable stone, self-transforms, and eventually consumes the stone for a major effect.",
};

const classFor: Record<string, string> = {
  "Path of the Berserker": "Barbarian",
  "Path of the Totem Warrior": "Barbarian",
  "College of Lore": "Bard",
  "College of Valor": "Bard",
  "Knowledge Domain": "Cleric",
  "Life Domain": "Cleric",
  "Light Domain": "Cleric",
  "Nature Domain": "Cleric",
  "Tempest Domain": "Cleric",
  "Trickery Domain": "Cleric",
  "War Domain": "Cleric",
  "Circle of the Land": "Druid",
  "Circle of the Moon": "Druid",
  Champion: "Fighter",
  "Battle Master": "Fighter",
  "Eldritch Knight": "Fighter",
  "Way of the Open Hand": "Monk",
  "Way of Shadow": "Monk",
  "Way of the Four Elements": "Monk",
  "Oath of Devotion": "Paladin",
  "Oath of the Ancients": "Paladin",
  "Oath of Vengeance": "Paladin",
  Hunter: "Ranger",
  "Beast Master": "Ranger",
  Thief: "Rogue",
  Assassin: "Rogue",
  "Arcane Trickster": "Rogue",
  "Draconic Bloodline": "Sorcerer",
  "Wild Magic": "Sorcerer",
  "The Archfey": "Warlock",
  "The Fiend": "Warlock",
  "The Great Old One": "Warlock",
  "School of Abjuration": "Wizard",
  "School of Conjuration": "Wizard",
  "School of Divination": "Wizard",
  "School of Enchantment": "Wizard",
  "School of Evocation": "Wizard",
  "School of Illusion": "Wizard",
  "School of Necromancy": "Wizard",
  "School of Transmutation": "Wizard",
};

const subclassFeatureOverrides: Record<
  string,
  Record<string, [string, string]>
> = {
  "College of Lore": {
    "Bonus Proficiencies": [
      "Gain proficiency with three skills of your choice. Resolve the three skill choices separately; a duplicate grant does not produce expertise.",
      "Dobivate poznavanje triju odabranih vještina. Odaberite ih zasebno; duplikat ne postaje stručnost.",
    ],
  },
  "College of Valor": {
    "Bonus Proficiencies": [
      "Gain proficiency with medium armor, shields, and martial weapons at bard level 3. This does not provide the equipment itself or grant heavy armor.",
      "Na bard razini 3 dobivate poznavanje srednjeg oklopa, štitova i bojnog oružja. Ne dobivate samu opremu ni teški oklop.",
    ],
  },
  "Tempest Domain": {
    "Bonus Proficiencies": [
      "Gain proficiency with martial weapons and heavy armor at cleric level 1, including when this domain is gained through multiclass entry.",
      "Na cleric razini 1 dobivate poznavanje bojnog oružja i teškog oklopa, uključujući ulazak višeklasnosti.",
    ],
  },
  "War Domain": {
    "Bonus Proficiencies": [
      "Gain proficiency with martial weapons and heavy armor at cleric level 1. Proficiency does not add starting equipment when entering by multiclassing.",
      "Na cleric razini 1 dobivate poznavanje bojnog oružja i teškog oklopa. Poznavanje ne dodaje početnu opremu pri višeklasnom ulasku.",
    ],
  },
  Assassin: {
    "Bonus Proficiencies": [
      "Gain proficiency with disguise kits and poisoner's kits at rogue level 3. These are tool proficiencies, not extra skill choices or free poison supplies.",
      "Na rogue razini 3 učite pribor za prerušavanje i otrovarski pribor. To su alati, a ne dodatne vještine ili besplatni otrovi.",
    ],
  },
  "Life Domain": {
    "Bonus Proficiency": [
      "Gain proficiency with heavy armor at cleric level 1. The subclass grant applies even when the multiclass proficiency table did not grant heavy armor.",
      "Na cleric razini 1 učite teški oklop. Podklasno poznavanje vrijedi i kada ga višeklasni ulazak nije dao.",
    ],
    "Divine Strike": [
      "Once on each of your turns, a weapon hit deals +1d8 radiant damage, increasing to +2d8 at cleric level 14. Other turns and further hits that turn receive no benefit.",
      "Jednom po vlastitom potezu pogodak oružjem dodaje 1d8 blistave štete, odnosno 2d8 od cleric razine 14. Drugi potezi i daljnji pogoci ne dobivaju bonus.",
    ],
  },
  "Light Domain": {
    "Bonus Cantrip": [
      "Learn Light if you do not already know it. It is a cleric cantrip for you and does not count against your normal cleric cantrips known.",
      "Učite Light ako ga već ne znate. Za vas je cleric trik i ne troši normalan broj trikova.",
    ],
  },
  "Circle of the Land": {
    "Bonus Cantrip": [
      "Learn one druid cantrip of your choice at druid level 2. It does not count against the normal number of druid cantrips known.",
      "Na druid razini 2 učite jedan dodatni druidski trik. Ne troši normalan broj poznatih trikova.",
    ],
  },
  "Nature Domain": {
    "Divine Strike": [
      "Once on each of your turns, a weapon hit deals +1d8 cold, fire, or lightning damage of your choice; at cleric level 14 this becomes +2d8.",
      "Jednom po vlastitom potezu pogodak oružjem dodaje 1d8 hladne, vatrene ili munjevite štete po izboru; od cleric 14 daje 2d8.",
    ],
  },
  "Trickery Domain": {
    "Divine Strike": [
      "Once on each of your turns, a weapon hit deals +1d8 poison damage, rising to +2d8 at cleric level 14.",
      "Jednom po vlastitom potezu pogodak oružjem dodaje 1d8 otrovne štete, odnosno 2d8 od cleric 14.",
    ],
  },
  "Way of Shadow": {
    "Cloak of Shadows": [
      "While in dim light or darkness, use an action to become invisible until you attack, cast a spell, or enter bright light. This monk feature has no fixed one-round expiry and does not use Channel Divinity.",
      "U prigušenom svjetlu ili tami radnjom postanite nevidljivi do napada, čaranja ili ulaska u jako svjetlo. Ova monk značajka nema istek nakon runde niti troši Channel Divinity.",
    ],
  },
  "Eldritch Knight": {
    Spellcasting: [
      "From fighter level 3, learn wizard spells using Intelligence. Most levelled choices must be abjuration or evocation; the exceptions gained at fighter 3, 8, 14, and 20 may use any school. Cantrips are not school-restricted. Use the fighter's one-third-caster progression; multiclass shared slots do not expand spells you may learn.",
      "Od fighter 3 učite wizard čarolije Inteligencijom. Većina izbora razina mora biti abjuration ili evocation; iznimke na 3, 8, 14 i 20 dopuštaju svaku školu. Trikovi nisu ograničeni. Višeklasni utori ne proširuju što smijete učiti.",
    ],
  },
  "Arcane Trickster": {
    Spellcasting: [
      "From rogue level 3, learn wizard spells using Intelligence. Most levelled choices must be enchantment or illusion; choices gained at rogue 3, 8, 14, and 20 include any-school exceptions. Learn Mage Hand plus two wizard cantrips initially. Use the rogue's one-third-caster progression; higher multiclass slots do not unlock higher known spells.",
      "Od rogue 3 učite wizard čarolije Inteligencijom. Većina izbora mora biti enchantment ili illusion; 3, 8, 14 i 20 uključuju iznimke. Početno učite Mage Hand i dva wizard trika. Višeklasni utori ne otključavaju više poznate čarolije.",
    ],
  },
};

subclassFeatureOverrides["Tempest Domain"]["Divine Strike"] = [
  "Once on each of your turns, a weapon hit deals +1d8 thunder damage, rising to +2d8 at cleric level 14.",
  "Jednom po vlastitom potezu pogodak oružjem dodaje 1d8 gromovite štete, odnosno 2d8 od cleric 14.",
];

subclassFeatureOverrides["War Domain"]["Divine Strike"] = [
  "Once on each of your turns, a weapon hit deals an additional 1d8 of the weapon's damage type, rising to 2d8 at cleric level 14.",
  "Jednom po vlastitom potezu pogodak oružjem dodaje 1d8 vrste štete oružja, odnosno 2d8 od cleric 14.",
];

export const subclassCatalog: Record<string, SubclassDetail> =
  Object.fromEntries(
    Object.keys(subclassFeatureLevels).map((name) => [
      name,
      {
        className: classFor[name] || "",
        title: name,
        overview: overview[name] || "Subclass definition needs source review.",
        source: `Player’s Handbook (2014), Chapter 3 — ${classFor[name] || "class"}: ${name}`,
        featureNotes: Object.fromEntries(
          Object.values(subclassFeatureLevels[name])
            .flat()
            .map((feature) => [
              feature,
              subclassFeatureOverrides[name]?.[feature]?.[0] ||
                featureNotes[feature] ||
                "This feature is granted at the listed class level. Its detailed effect and any choice are not yet verified in this app; keep the character marked as needing review.",
            ]),
        ),
      },
    ]),
  );

export function getSubclassFeatureDetail(
  subclass: string,
  featureName: string,
): string {
  return (
    subclassCatalog[subclass]?.featureNotes[featureName] ||
    "Subclass feature not found in the PHB catalog; source review required."
  );
}

export function getSubclassCoverageGaps(): string[] {
  return Object.entries(subclassCatalog).flatMap(([subclass, detail]) =>
    Object.entries(detail.featureNotes)
      .filter(([, text]) => /not yet verified/.test(text))
      .map(([feature]) => `${subclass}: ${feature}`),
  );
}

const maneuvers = [
  "Commander's Strike",
  "Disarming Attack",
  "Distracting Strike",
  "Evasive Footwork",
  "Feinting Attack",
  "Goading Attack",
  "Lunging Attack",
  "Maneuvering Attack",
  "Menacing Attack",
  "Parry",
  "Precision Attack",
  "Pushing Attack",
  "Rally",
  "Riposte",
  "Sweeping Attack",
  "Trip Attack",
];

const elements = [
  "Elemental Attunement",
  "Fangs of the Fire Snake",
  "Fist of Four Thunders",
  "Fist of Unbroken Air",
  "Gong of the Summit",
  "Rush of the Gale Spirits",
  "Shape the Flowing River",
  "Sweeping Cinder Strike",
  "Water Whip",
  "Clench of the North Wind",
  "Eternal Mountain Defense",
  "Flames of the Phoenix",
  "Mist Stance",
  "Ride the Wind",
  "River of Hungry Flame",
  "Breath of Winter",
  "Wave of Rolling Earth",
];

const styles: Record<string, string[]> = {
  Fighter: [
    "Archery",
    "Defense",
    "Dueling",
    "Great Weapon Fighting",
    "Protection",
    "Two-Weapon Fighting",
  ],
  Paladin: ["Defense", "Dueling", "Great Weapon Fighting", "Protection"],
  Ranger: ["Archery", "Defense", "Dueling", "Two-Weapon Fighting"],
};

const artisanTools = [
  "Alchemist's supplies",
  "Brewer's supplies",
  "Calligrapher's supplies",
  "Carpenter's tools",
  "Cartographer's tools",
  "Cobbler's tools",
  "Cook's utensils",
  "Glassblower's tools",
  "Jeweler's tools",
  "Leatherworker's tools",
  "Mason's tools",
  "Painter's supplies",
  "Potter's tools",
  "Smith's tools",
  "Tinker's tools",
  "Weaver's tools",
  "Woodcarver's tools",
];

const hunterOptions: Record<number, string[]> = {
  3: ["Colossus Slayer", "Giant Killer", "Horde Breaker"],
  7: ["Escape the Horde", "Multiattack Defense", "Steel Will"],
  11: ["Volley", "Whirlwind Attack"],
  15: ["Evasion", "Stand Against the Tide", "Uncanny Dodge"],
};

const totemAnimals = ["Bear", "Eagle", "Wolf"];

const landOptions = [
  "Arctic",
  "Coast",
  "Desert",
  "Forest",
  "Grassland",
  "Mountain",
  "Swamp",
  "Underdark",
];

const rangerTerrains = [
  "Arctic",
  "Coast",
  "Desert",
  "Forest",
  "Grassland",
  "Mountain",
  "Swamp",
  "Underdark",
];

export const elementalDisciplineMinimumLevel: Record<string, number> = {
  "Breath of Winter": 17,
  "Clench of the North Wind": 6,
  "Eternal Mountain Defense": 17,
  "Flames of the Phoenix": 11,
  "Gong of the Summit": 6,
  "Mist Stance": 11,
  "Ride the Wind": 11,
  "River of Hungry Flame": 17,
  "Wave of Rolling Earth": 17,
};

export const elementalDisciplineLevel = (name: string) =>
  elementalDisciplineMinimumLevel[name] || 3;

const metamagic = [
  "Careful Spell",
  "Distant Spell",
  "Empowered Spell",
  "Extended Spell",
  "Heightened Spell",
  "Quickened Spell",
  "Subtle Spell",
  "Twinned Spell",
];

const skillNames = [
  "Acrobatics",
  "Animal Handling",
  "Arcana",
  "Athletics",
  "Deception",
  "History",
  "Insight",
  "Intimidation",
  "Investigation",
  "Medicine",
  "Nature",
  "Perception",
  "Performance",
  "Persuasion",
  "Religion",
  "Sleight of Hand",
  "Stealth",
  "Survival",
];

const knowledgeSkills = ["Arcana", "History", "Nature", "Religion"];

const languageNames = [
  "Abyssal",
  "Celestial",
  "Common",
  "Deep Speech",
  "Draconic",
  "Dwarvish",
  "Elvish",
  "Giant",
  "Gnomish",
  "Goblin",
  "Halfling",
  "Infernal",
  "Orc",
  "Primordial",
  "Sylvan",
  "Undercommon",
];

const enemyOptions = [
  "Aberrations",
  "Beasts",
  "Celestials",
  "Constructs",
  "Dragons",
  "Elementals",
  "Fey",
  "Fiends",
  "Giants",
  "Monstrosities",
  "Oozes",
  "Plants",
  "Undead",
  "Humanoids (choose two races)",
];

export function getSubclassChoicePlans(
  className: string,
  subclass: string,
  classLevel: number,
  selections: Record<string, string[]> = {},
): ChoicePlan[] {
  const plans: ChoicePlan[] = [];
  const add = (
    key: string,
    unlockLevel: number,
    title: string,
    choose: number,
    options: string[],
    help: string,
  ) => {
    if (classLevel >= unlockLevel)
      plans.push({
        key,
        className,
        subclass,
        unlockLevel,
        title,
        choose,
        options,
        help,
        sourceReference: `PHB (2014), chapter 3: ${className}`,
      });
  };
  if (className === "Barbarian" && subclass === "Path of the Totem Warrior") {
    add(
      "totem-spirit",
      3,
      "Totem Spirit",
      1,
      totemAnimals,
      "This spirit determines the rage benefit. Choose again at later totem features; you may repeat or change the animal.",
    );
    add(
      "aspect-beast",
      6,
      "Aspect of the Beast",
      1,
      totemAnimals,
      "Choose a travel or exploration benefit. It may differ from your Totem Spirit choice.",
    );
    add(
      "totemic-attunement",
      14,
      "Totemic Attunement",
      1,
      totemAnimals,
      "Choose a stronger rage-linked benefit. Record it separately from earlier spirit choices.",
    );
  }
  if (className === "Ranger" && subclass === "Hunter")
    for (const [level, options] of Object.entries(hunterOptions))
      add(
        `hunter-${level}`,
        Number(level),
        (
          {
            3: "Hunter's Prey",
            7: "Defensive Tactics",
            11: "Multiattack",
            15: "Superior Hunter's Defense",
          } as Record<number, string>
        )[Number(level)],
        1,
        options,
        "Choose one option at this feature level. Each option has its own trigger and effect; the feature description above summarizes the differences.",
      );
  if (className === "Druid" && subclass === "Circle of the Land")
    add(
      "land",
      2,
      "Circle Land",
      1,
      landOptions,
      "Your land determines the circle spells gained at druid levels 3, 5, 7, and 9.",
    );
  if (className === "Monk" && subclass === "Way of the Four Elements") {
    add(
      "elemental-disciplines-3",
      3,
      "Elemental Discipline",
      1,
      elements.filter(
        (item) =>
          item !== "Elemental Attunement" &&
          elementalDisciplineLevel(item) <= 3,
      ),
      "Elemental Attunement is learned automatically. Choose one additional discipline at monk level 3; learn one more at levels 6, 11, and 17. Each choice respects its acquisition level. Replacing a discipline at an unlock requires recording the change in the build history.",
    );
    for (const level of [6, 11, 17])
      if (classLevel >= level)
        add(
          `elemental-disciplines-${level}`,
          level,
          "Additional Elemental Discipline",
          1,
          elements.filter(
            (item) =>
              item !== "Elemental Attunement" &&
              elementalDisciplineLevel(item) <= level,
          ),
          "Choose one new discipline available when this monk level was gained; do not select a discipline twice.",
        );
  }
  if (className === "Fighter" && subclass === "Battle Master") {
    add(
      "maneuvers-3",
      3,
      "Combat Maneuvers",
      3,
      maneuvers,
      "Choose three maneuvers at fighter level 3. Learn two more at levels 7, 10, and 15; replace one maneuver when you gain a fighter level.",
    );
    for (const level of [7, 10, 15])
      if (classLevel >= level)
        add(
          `maneuvers-${level}`,
          level,
          "Additional Combat Maneuvers",
          2,
          maneuvers,
          "Choose two new maneuvers. Do not repeat one already selected; you may replace one known maneuver when you gain a fighter level.",
        );
    add(
      "student-tool",
      3,
      "Student of War Tool",
      1,
      artisanTools,
      "Choose one artisan's tool proficiency.",
    );
  }
  if (className === "Sorcerer" && subclass) {
    if (classLevel >= 3)
      add(
        "metamagic-3",
        3,
        "Metamagic Options",
        2,
        metamagic,
        "Choose two options at sorcerer level 3. You gain one more at sorcerer levels 10 and 17. The 2014 PHB does not grant replacement of Metamagic options on gaining a level.",
      );
    if (classLevel >= 10)
      add(
        "metamagic-10",
        10,
        "Additional Metamagic Option",
        1,
        metamagic,
        "Choose one new option not already known.",
      );
    if (classLevel >= 17)
      add(
        "metamagic-17",
        17,
        "Additional Metamagic Option",
        1,
        metamagic,
        "Choose one new option not already known.",
      );
  }
  if (className === "Warlock" && subclass)
    add(
      "pact-boon",
      3,
      "Pact Boon",
      1,
      ["Pact of the Chain", "Pact of the Blade", "Pact of the Tome"],
      "Choose the pact gift gained at warlock level 3; invocations can require a particular boon.",
    );
  if (className === "Warlock")
    for (const level of [2, 5, 7, 9, 12, 15, 18])
      add(
        `invocations-${level}`,
        level,
        "Eldritch Invocations",
        level === 2 ? 2 : 1,
        Object.keys(invocationDetails).filter(
          (name) => (invocationDetails[name].minimumLevel || 2) <= level,
        ),
        "Choose a new invocation. Level prerequisites refer to warlock level; Pact Boon and cantrip prerequisites still apply. You may replace one known invocation when gaining a warlock level; replacement history must preserve eligibility at acquisition.",
      );
  if (className === "Ranger") {
    for (const level of [1, 6, 14])
      if (classLevel >= level) {
        add(
          `favored-enemy-${level}`,
          level,
          `Favored Enemy at Ranger ${level}`,
          1,
          enemyOptions,
          "Choose a creature type or the humanoid option. Choosing humanoids requires recording two specific humanoid races.",
        );
        if (
          selections[`Ranger:${level}:favored-enemy-${level}`]?.includes(
            "Humanoids (choose two races)",
          )
        )
          add(
            `favored-humanoids-${level}`,
            level,
            `Favored Humanoid Races at Ranger ${level}`,
            2,
            [
              "Gnolls",
              "Goblins",
              "Hobgoblins",
              "Kobolds",
              "Lizardfolk",
              "Orcs",
              "Humans",
              "Elves",
              "Dwarves",
              "Yuan-ti purebloods",
            ],
            "Choose two different humanoid races. Only these races receive this Favored Enemy benefit; this does not grant a bonus against every humanoid.",
          );
        if (plans[plans.length - 1]?.key === `favored-humanoids-${level}`) {
          plans[plans.length - 1].allowCustom = true;
        }
        add(
          `favored-language-${level}`,
          level,
          `Favored Enemy Language at Ranger ${level}`,
          1,
          [...languageNames, "No language (chosen enemies speak none)"],
          "Choose a language spoken by a favored enemy, if they speak one. If none of the selected enemies speaks a language, choose No language. The selected language must plausibly be spoken by your enemy.",
        );
      }
    for (const level of [1, 6, 10])
      if (classLevel >= level)
        add(
          `favored-terrain-${level}`,
          level,
          `Natural Explorer Terrain at Ranger ${level}`,
          1,
          rangerTerrains,
          "Choose a favored terrain. Each terrain choice is recorded separately. This grants exploration benefits, not the Circle of the Land druid's bonus spells.",
        );
  }
  if (className === "Bard" && subclass === "College of Lore")
    add(
      "lore-skills",
      3,
      "College of Lore Bonus Skills",
      3,
      skillNames,
      "Choose any three skills. If already proficient, a skill cannot be selected again.",
    );
  if (className === "Cleric" && subclass === "Knowledge Domain") {
    add(
      "knowledge-skills",
      1,
      "Blessings of Knowledge Skills",
      2,
      knowledgeSkills,
      "Choose two different skills from this list; you gain expertise in the selected proficiencies.",
    );
    add(
      "knowledge-languages",
      1,
      "Blessings of Knowledge Languages",
      2,
      languageNames.filter((language) => language !== "Common"),
      "Choose two languages you do not already know.",
    );
  }
  if (className === "Cleric" && subclass === "Nature Domain")
    add(
      "nature-skill",
      1,
      "Acolyte of Nature Skill",
      1,
      ["Animal Handling", "Nature", "Survival"],
      "Choose one skill proficiency from this list.",
    );
  if (className === "Sorcerer" && subclass === "Draconic Bloodline")
    add(
      "dragon-ancestor",
      1,
      "Dragon Ancestor",
      1,
      [
        "Black",
        "Blue",
        "Brass",
        "Bronze",
        "Copper",
        "Gold",
        "Green",
        "Red",
        "Silver",
        "White",
      ],
      "Your ancestor sets the damage type used by Elemental Affinity from sorcerer level 6. Draconic Resilience grants AC and hit points, not damage resistance.",
    );
  if (["Fighter", "Paladin", "Ranger"].includes(className)) {
    const styleLevels =
      className === "Fighter"
        ? [1]
        : className === "Paladin" || className === "Ranger"
          ? [2]
          : [];
    if (className === "Fighter" && subclass === "Champion" && classLevel >= 10)
      styleLevels.push(10);
    for (const level of styleLevels)
      add(
        `fighting-style-${level}`,
        level,
        className === "Fighter" && level === 10
          ? "Additional Fighting Style"
          : "Fighting Style",
        1,
        styles[className],
        "Choose one style. A character cannot select the same Fighting Style twice.",
      );
  }
  return plans;
}

export function choicePlanForFeature(
  className: string,
  subclass: string,
  classLevel: number,
  featureName: string,
): ChoicePlan | undefined {
  const plans = getSubclassChoicePlans(className, subclass, classLevel);
  const match = (key: string) => plans.find((plan) => plan.key === key);
  if (className === "Barbarian" && subclass === "Path of the Totem Warrior") {
    if (featureName.startsWith("Totem Spirit")) return match("totem-spirit");
    if (featureName.startsWith("Aspect of the Beast"))
      return match("aspect-beast");
    if (featureName.startsWith("Totemic Attunement"))
      return match("totemic-attunement");
  }
  if (className === "Ranger" && subclass === "Hunter")
    return match(`hunter-${classLevel}`);
  if (
    className === "Druid" &&
    subclass === "Circle of the Land" &&
    featureName.includes("Circle Spells")
  )
    return match("land");
  if (className === "Fighter" && subclass === "Battle Master") {
    if (featureName === "Combat Superiority")
      return match(`maneuvers-${classLevel}`) || match("maneuvers-3");
    if (featureName === "Student of War") return match("student-tool");
  }
  if (
    className === "Monk" &&
    subclass === "Way of the Four Elements" &&
    (featureName.includes("Disciple") || featureName === "Elemental Discipline")
  )
    return (
      match(`elemental-disciplines-${classLevel}`) ||
      match("elemental-disciplines-3")
    );
  if (className === "Sorcerer" && featureName === "Metamagic")
    return match(`metamagic-${classLevel}`) || match("metamagic-3");
  if (
    className === "Bard" &&
    subclass === "College of Lore" &&
    featureName === "Bonus Proficiencies"
  )
    return match("lore-skills");
  if (
    className === "Cleric" &&
    subclass === "Knowledge Domain" &&
    featureName === "Blessings of Knowledge"
  )
    return match("knowledge-skills");
  if (
    className === "Cleric" &&
    subclass === "Nature Domain" &&
    featureName === "Acolyte of Nature"
  )
    return match("nature-skill");
  if (
    className === "Sorcerer" &&
    subclass === "Draconic Bloodline" &&
    featureName === "Dragon Ancestor"
  )
    return match("dragon-ancestor");
  if (className === "Warlock" && featureName === "Pact Boon")
    return match("pact-boon");
  if (className === "Warlock" && featureName === "Eldritch Invocations")
    return match(`invocations-${classLevel}`) || match("invocations-2");
  if (className === "Ranger" && featureName.includes("Favored Enemy"))
    return match(`favored-enemy-${classLevel}`);
  if (className === "Ranger" && featureName.includes("Natural Explorer"))
    return match(`favored-terrain-${classLevel}`);
  if (featureName === "Fighting Style")
    return match(`fighting-style-${classLevel}`);
  if (featureName === "Additional Fighting Style" && subclass === "Champion")
    return match("fighting-style-10");
  return undefined;
}

const branchDetails: Record<string, [string, string]> = {
  Archery: [
    "Add +2 to attack rolls made with ranged weapons. Thrown melee weapons are not ranged weapons; this style does not add damage.",
    "Dodajte +2 napadima dalekometnim oružjem. Bačeno blisko oružje nije dalekometno oružje; bonus ne povećava štetu.",
  ],
  Defense: [
    "Gain +1 AC while wearing armor. A shield alone is not worn armor for this benefit.",
    "Dobivate +1 AC dok nosite oklop. Sam štit ne zadovoljava uvjet nošenja oklopa.",
  ],
  Dueling: [
    "While holding a melee weapon in one hand and no other weapon, add +2 to its damage rolls. A shield is permitted; two-handed use is not.",
    "Dok u jednoj ruci držite blisko oružje i nemate drugo oružje, šteti dodajte +2. Štit je dopušten; korištenje s dvije ruke nije.",
  ],
  "Great Weapon Fighting": [
    "For damage dice of a melee weapon attack wielded in two hands, reroll a 1 or 2 once and use the new result. The weapon must be two-handed or versatile. This is a damage reroll, not a flat attack bonus.",
    "Pri bliskom napadu oružjem koje držite objema rukama jednom ponovno bacite kockice štete s rezultatom 1 ili 2. Oružje mora imati svojstvo two-handed ili versatile. Novi rezultat morate prihvatiti.",
  ],
  Protection: [
    "While wielding a shield, use your reaction when a creature you see attacks a target other than you within 5 feet. Impose disadvantage on that attack roll.",
    "Dok držite štit, reakcijom dajte nedostatak napadu vidljivog stvorenja na drugu metu unutar 5 stopa od vas.",
  ],
  "Two-Weapon Fighting": [
    "When using the two-weapon fighting bonus attack, add the attack's ability modifier to its damage. The normal light-weapon and free bonus-action requirements still apply.",
    "Kod dodatnog napada u borbi dvama oružjima šteti dodajte modifikator svojstva napada. I dalje vrijede uvjeti lakog oružja i slobodne bonus radnje.",
  ],
  "Commander's Strike": [
    "When taking the Attack action, give up one attack and spend your bonus action and one superiority die. An ally who can see or hear you may use their reaction for one weapon attack, adding your die to its damage on a hit.",
    "Pri radnji Napad žrtvujte jedan napad, bonus radnju i kockicu nadmoći. Saveznik koji vas vidi ili čuje može reakcijom napasti oružjem i pri pogotku dodati vašu kockicu šteti.",
  ],
  "Disarming Attack": [
    "After a weapon hit, spend one superiority die and add it to damage. On a failed Strength save, the target drops one held object you choose at its feet.",
    "Nakon pogotka oružjem potrošite kockicu nadmoći i dodajte je šteti. Meta pri neuspjelom spašavanju Snagom ispušta jedan odabrani predmet.",
  ],
  "Distracting Strike": [
    "After a weapon hit, spend one superiority die and add it to damage. The next attack against that target by someone other than you has advantage if made before your next turn.",
    "Nakon pogotka dodajte kockicu nadmoći šteti. Sljedeći napad druge osobe na tu metu prije vašeg sljedećeg poteza ima prednost.",
  ],
  "Evasive Footwork": [
    "When moving, spend one superiority die and add its roll to AC until you stop moving. It does not grant a lasting AC increase.",
    "Dok se krećete, potrošite kockicu nadmoći i dodajte rezultat AC-u do prestanka kretanja.",
  ],
  "Feinting Attack": [
    "Spend a bonus action and superiority die to feint at a creature within 5 feet. Your next attack against it this turn has advantage, and a hit adds the die to damage. Unused advantage expires this turn.",
    "Bonus radnjom i kockicom nadmoći fintirajte stvorenje unutar 5 stopa. Sljedeći napad na njega ovog poteza ima prednost i pri pogotku dodaje kockicu šteti.",
  ],
  "Goading Attack": [
    "After a weapon hit, add a superiority die to damage. A failed Wisdom save gives the target disadvantage on attacks against anyone other than you until the end of your next turn.",
    "Pogotku dodajte kockicu nadmoći. Pri neuspjelom spašavanju Mudrošću meta do kraja vašeg sljedećeg poteza ima nedostatak na napadima na druge osobe.",
  ],
  "Lunging Attack": [
    "Spend a superiority die to extend the reach of one melee weapon attack by 5 feet. Add the die to its damage if it hits.",
    "Potrošite kockicu nadmoći da doseg jednog bliskog napada produljite za 5 stopa. Pri pogotku je dodajte šteti.",
  ],
  "Maneuvering Attack": [
    "After a weapon hit, add a superiority die to damage. An ally who sees or hears you may use their reaction to move up to half speed without provoking opportunity attacks from your target.",
    "Pogotku dodajte kockicu nadmoći. Saveznik koji vas vidi ili čuje može reakcijom prijeći pola svoje brzine bez prilike za napad vaše mete.",
  ],
  "Menacing Attack": [
    "After a weapon hit, add a superiority die to damage. A failed Wisdom save frightens the target of you until the end of your next turn.",
    "Pogotku dodajte kockicu nadmoći. Pri neuspjelom spašavanju Mudrošću meta vas se boji do kraja vašeg sljedećeg poteza.",
  ],
  Parry: [
    "When another creature damages you with a melee attack, use your reaction and a superiority die to reduce that damage by the die result plus your Dexterity modifier.",
    "Kad vas drugo stvorenje ozlijedi bliskim napadom, reakcijom smanjite štetu za kockicu nadmoći i modifikator Spretnosti.",
  ],
  "Precision Attack": [
    "Spend one superiority die and add it to one weapon attack roll, before or after rolling the d20 but before applying the attack's effects. It adds no damage.",
    "Potrošite kockicu nadmoći i dodajte je bacanju napada oružjem prije ili poslije d20, ali prije primjene učinka. Ne dodaje štetu.",
  ],
  "Pushing Attack": [
    "After a weapon hit, add a superiority die to damage. A Large or smaller target that fails its Strength save is pushed up to 15 feet away from you.",
    "Pogotku dodajte kockicu nadmoći. Velika ili manja meta koja ne uspije u spašavanju Snagom odmiče se do 15 stopa od vas.",
  ],
  Rally: [
    "Use a bonus action and superiority die. A friendly creature who sees or hears you gains temporary HP equal to the die result plus your Charisma modifier. Temporary HP do not stack.",
    "Bonus radnjom potrošite kockicu nadmoći. Prijatelj koji vas vidi ili čuje dobiva privremene HP u iznosu kockice i modifikatora Karizme. Privremeni HP se ne zbrajaju.",
  ],
  Riposte: [
    "When a creature misses you with a melee attack, use your reaction and superiority die for one melee weapon attack against it. On a hit, add the die to damage.",
    "Kad vas stvorenje promaši bliskim napadom, reakcijom i kockicom nadmoći blisko ga napadnite oružjem. Pri pogotku dodajte kockicu šteti.",
  ],
  "Sweeping Attack": [
    "After a melee weapon hit, spend a superiority die to damage another creature within 5 feet of the first and within your reach. Your original attack roll must also hit its AC; it takes only the superiority die's damage of the original type.",
    "Nakon bliskog pogotka potrošite kockicu nadmoći za drugu metu unutar 5 stopa od prve i unutar dosega. Izvorno bacanje mora pogoditi i njezin AC; prima samo štetu kockice iste vrste.",
  ],
  "Trip Attack": [
    "After a weapon hit, add a superiority die to damage. A Large or smaller target that fails a Strength save falls prone.",
    "Pogotku dodajte kockicu nadmoći. Velika ili manja meta pada na tlo ako ne uspije u spašavanju Snagom.",
  ],
  "Careful Spell": [
    "Spend 1 sorcery point when a spell forces a saving throw. Up to your Charisma modifier (minimum one) chosen creatures automatically succeed on that save; success can still deal half damage.",
    "Potrošite 1 bod čarobnjaštva za čaroliju sa spašavanjem. Broj odabranih stvorenja do modifikatora Karizme (najmanje jedno) automatski uspijeva; uspjeh i dalje može značiti pola štete.",
  ],
  "Distant Spell": [
    "Spend 1 sorcery point to double a spell's range if it is at least 5 feet, or change a touch spell's range to 30 feet. It does not enlarge an area.",
    "Potrošite 1 bod čarobnjaštva za dvostruki domet od barem 5 stopa ili domet 30 stopa za čaroliju na dodir. Područje učinka se ne povećava.",
  ],
  "Empowered Spell": [
    "Spend 1 sorcery point to reroll up to your Charisma modifier (minimum one) damage dice of the spell and keep the new rolls. This option may be combined with another Metamagic option on that spell.",
    "Za 1 bod čarobnjaštva ponovno bacite do modifikatora Karizme (najmanje jednu) kockicu štete i prihvatite nove rezultate. Može se spojiti s drugom Metamagijom iste čarolije.",
  ],
  "Extended Spell": [
    "Spend 1 sorcery point to double a spell duration of at least 1 minute, up to 24 hours. Concentration remains required when the spell requires it.",
    "Za 1 bod čarobnjaštva udvostručite trajanje od barem jedne minute, najviše na 24 sata. Koncentracija i dalje vrijedi.",
  ],
  "Heightened Spell": [
    "Spend 3 sorcery points to give one target disadvantage on its first saving throw against the spell. Later saves are unaffected.",
    "Za 3 boda čarobnjaštva dajte jednoj meti nedostatak na prvo spašavanje protiv čarolije. Kasnija spašavanja ostaju nepromijenjena.",
  ],
  "Quickened Spell": [
    "Spend 2 sorcery points to change a spell's casting time from one action to one bonus action. The 2014 bonus-action spell rule still restricts other spells cast that turn.",
    "Za 2 boda čarobnjaštva promijenite vrijeme bacanja s jedne radnje na bonus radnju. I dalje vrijedi ograničenje drugih čarolija tijekom tog poteza iz pravila 2014.",
  ],
  "Subtle Spell": [
    "Spend 1 sorcery point to cast a spell without verbal or somatic components. Material components, including costly or consumed components, remain required.",
    "Za 1 bod čarobnjaštva bacite čaroliju bez glasovnih i pokretnih sastavnica. Materijalne sastavnice, uključujući skupe i potrošne, i dalje su potrebne.",
  ],
  "Twinned Spell": [
    "Spend sorcery points equal to a spell's level (one for a cantrip) to affect a second creature. The spell must target one creature, lack a range of self, and be incapable of targeting multiple creatures at the level used. Magic Missile and Scorching Ray do not qualify.",
    "Potrošite bodove čarobnjaštva jednake razini čarolije (jedan za trik) za drugu metu. Čarolija mora ciljati jedno stvorenje, ne smije imati domet Self niti na upotrijebljenoj razini moći ciljati više stvorenja. Magic Missile i Scorching Ray ne vrijede.",
  ],
  "Colossus Slayer": [
    "Once on each of your turns, a weapon hit deals +1d8 damage if the target was already below its hit point maximum. It does not apply to every hit.",
    "Jednom po vlastitom potezu pogodak oružjem dodaje 1d8 štete ako je meta već bila ispod maksimalnih HP. Ne vrijedi za svaki pogodak.",
  ],
  "Giant Killer": [
    "When a Large or larger creature within 5 feet hits or misses you with an attack, use your reaction to attack it immediately, provided you can see it.",
    "Kad vas Veliko ili veće stvorenje unutar 5 stopa pogodi ili promaši, možete ga odmah napasti reakcijom ako ga vidite.",
  ],
  "Horde Breaker": [
    "Once on each of your turns after a weapon attack, make another attack with the same weapon against a different creature within 5 feet of the original and within your weapon's range.",
    "Jednom po vlastitom potezu nakon napada oružjem napadnite istim oružjem drugo stvorenje unutar 5 stopa od prve mete i unutar dometa.",
  ],
  "Escape the Horde": [
    "Opportunity attacks against you have disadvantage. Other attacks are unaffected.",
    "Napadi prilike protiv vas imaju nedostatak. Ostali napadi nisu obuhvaćeni.",
  ],
  "Multiattack Defense": [
    "After a creature hits you, gain +4 AC against all its later attacks for the rest of that turn. This does not protect against other creatures.",
    "Nakon što vas stvorenje pogodi, dobivate +4 AC protiv njegovih kasnijih napada do kraja tog poteza. Ne vrijedi protiv drugih stvorenja.",
  ],
  "Steel Will": [
    "Gain advantage on saving throws against being frightened.",
    "Imate prednost na spašavanjima protiv zastrašenosti.",
  ],
  Volley: [
    "Use an action to make a ranged attack against any number of creatures within 10 feet of a point you can see within weapon range. Roll separately and expend ammunition for each target.",
    "Radnjom dalekometno napadnite odabrana stvorenja unutar 10 stopa od vidljive točke u dometu. Za svaku metu zasebno bacite napad i potrošite streljivo.",
  ],
  "Whirlwind Attack": [
    "Use an action to make a melee attack against any number of creatures within 5 feet. Roll each attack separately; Extra Attack does not add attacks to this special action.",
    "Radnjom blisko napadnite odabrana stvorenja unutar 5 stopa. Svaki napad bacite zasebno; Extra Attack ne dodaje napade ovoj posebnoj radnji.",
  ],
  Evasion: [
    "When an effect allows a Dexterity save for half damage, success deals no damage to you and failure deals half damage.",
    "Kad spašavanje Spretnosti dopušta pola štete, pri uspjehu ne primate štetu, a pri neuspjehu primate polovicu.",
  ],
  "Stand Against the Tide": [
    "When a hostile creature misses you with a melee attack, use your reaction to force it to repeat the same attack against another creature of your choice, other than itself.",
    "Kad vas neprijatelj promaši bliskim napadom, reakcijom ga prisilite da isti napad ponovi protiv drugog odabranog stvorenja, osim sebe.",
  ],
  "Uncanny Dodge": [
    "When an attacker you can see hits you, use your reaction to halve that attack's damage against you. It applies to one attack, not every attack that round.",
    "Kad vas pogodi napadač kojeg vidite, reakcijom prepolovite štetu tog napada. Vrijedi za jedan napad.",
  ],
  "Pact of the Chain": [
    "Learn Find Familiar and cast it as a ritual. The familiar may be an imp, pseudodragon, quasit, sprite, or normal form. When you take the Attack action, forgo one attack to let it make one attack using its reaction.",
    "Učite Find Familiar i možete je bacati kao obred. Pratilac može biti imp, pseudodragon, quasit, sprite ili običan oblik. Pri radnji Napad žrtvujte jedan napad kako bi pratilac jednom napao svojom reakcijom.",
  ],
  "Pact of the Blade": [
    "Use an action to create one melee pact weapon in an empty hand. You are proficient with it, and it counts as magical against resistance and immunity. A one-hour ritual can bind an eligible magic weapon instead. It does not change the weapon's Strength/Dexterity attack ability to Charisma.",
    "Radnjom stvorite jedno blisko paktno oružje u praznoj ruci. Poznajete ga i smatra se čarobnim protiv otpornosti i imunosti. Jednosatnim obredom možete vezati prikladno čarobno oružje. Svojstvo napada ne postaje Karizma.",
  ],
  "Pact of the Tome": [
    "Choose three cantrips from any classes' lists; while carrying the Book of Shadows, cast them as warlock spells using Charisma. They do not consume your normal cantrips-known allowance.",
    "Odaberite tri trika s popisa bilo kojih klasa. Dok nosite Book of Shadows, bacate ih kao warlock čarolije Karizmom. Ne troše uobičajen broj poznatih trikova.",
  ],
};

export const invocationDetails: Record<string, ChoiceOptionDetail> = {
  "Agonizing Blast": {
    spellKnown: "Eldritch Blast",
    description:
      "Add your Charisma modifier to the damage of each beam of Eldritch Blast that hits.",
    descriptionHr:
      "Svakom pogotku zrake Eldritch Blasta dodajte modifikator Karizme šteti.",
  },
  "Armor of Shadows": {
    description:
      "Cast Mage Armor on yourself at will without a spell slot or material components. It does not stack with worn armor.",
    descriptionHr:
      "Bacajte Mage Armor na sebe bez utora i materijala. Ne zbraja se s nošenim oklopom.",
  },
  "Ascendant Step": {
    minimumLevel: 9,
    description:
      "Cast Levitate on yourself at will without a spell slot or material components. Concentration still applies.",
    descriptionHr:
      "Od warlock razine 9 bacajte Levitate na sebe bez utora i materijala. Potrebna je koncentracija.",
  },
  "Beast Speech": {
    description: "Cast Speak with Animals at will without a spell slot.",
    descriptionHr: "Bacajte Speak with Animals bez ograničenja i bez utora.",
  },
  "Beguiling Influence": {
    description:
      "Gain proficiency in Deception and Persuasion. This grants no duplicate proficiency or expertise.",
    descriptionHr:
      "Dobivate poznavanje Obmane i Uvjeravanja. Ne daje dvostruko poznavanje ni stručnost.",
  },
  "Bewitching Whispers": {
    minimumLevel: 7,
    description:
      "Cast Compulsion once using a warlock spell slot. A long rest restores this invocation's use.",
    descriptionHr:
      "Jednom bacite Compulsion koristeći warlock utor. Dugi odmor obnavlja uporabu.",
  },
  "Book of Ancient Secrets": {
    pactBoon: "Pact of the Tome",
    description:
      "Add two 1st-level ritual spells from any classes to your Book of Shadows and cast them only as rituals unless learned another way. Copy found rituals up to half your warlock level (rounded up), paying 2 hours and 50 gp per spell level. You may also ritual-cast a known warlock spell with the ritual tag.",
    descriptionHr:
      "U Book of Shadows dodajte dvije obredne čarolije razine 1 s bilo kojih popisa. Bacajte ih kao obrede. Pronađene obrede do polovice warlock razine zaokružene naviše prepisujte uz 2 sata i 50 gp po razini. Poznate warlock obrede također smijete bacati obredno.",
  },
  "Chains of Carceri": {
    minimumLevel: 15,
    pactBoon: "Pact of the Chain",
    description:
      "Cast Hold Monster at will without slots or materials, but only on celestials, fiends, or elementals. After targeting a creature this way, finish a long rest before targeting it again.",
    descriptionHr:
      "Bacajte Hold Monster bez utora i materijala samo na celestials, fiends i elementals. Istu metu smijete ponovno odabrati tek nakon dugog odmora.",
  },
  "Devil's Sight": {
    description:
      "See normally in darkness, magical or nonmagical, to 120 feet. This does not change dim light.",
    descriptionHr:
      "Normalno vidite u čarobnoj i običnoj tami do 120 stopa. Ne mijenja prigušeno svjetlo.",
  },
  "Dreadful Word": {
    minimumLevel: 7,
    description:
      "Cast Confusion once using a warlock spell slot; regain this use after a long rest.",
    descriptionHr:
      "Jednom bacite Confusion koristeći warlock utor; dugi odmor obnavlja uporabu.",
  },
  "Eldritch Sight": {
    description:
      "Cast Detect Magic at will without a spell slot; concentration remains required.",
    descriptionHr:
      "Bacajte Detect Magic bez utora; koncentracija i dalje vrijedi.",
  },
  "Eldritch Spear": {
    spellKnown: "Eldritch Blast",
    description:
      "Eldritch Blast's range becomes 300 feet. Other spells retain their normal ranges.",
    descriptionHr:
      "Domet Eldritch Blasta postaje 300 stopa. Druge čarolije zadržavaju svoj domet.",
  },
  "Eyes of the Rune Keeper": {
    description:
      "Read all writing. This is not the ability to speak every language or decode every secret cipher.",
    descriptionHr:
      "Možete čitati sve pismo. To ne daje govor svih jezika niti automatsko rješavanje tajnih šifri.",
  },
  "Fiendish Vigor": {
    description:
      "Cast False Life on yourself at will as a 1st-level spell without slots or materials. Temporary HP replace rather than stack with other temporary HP.",
    descriptionHr:
      "Bacajte False Life na sebe kao čaroliju razine 1 bez utora i materijala. Privremeni HP se ne zbrajaju.",
  },
  "Gaze of Two Minds": {
    description:
      "Use an action to touch a willing humanoid and perceive through its senses until the end of your next turn, extending with an action each turn. You benefit from its special senses and are blind/deaf to your own surroundings.",
    descriptionHr:
      "Radnjom dodirnite voljnog humanoida i opažajte njegovim osjetilima do kraja sljedećeg poteza; radnjom produljujte svaki potez. Koristite njegova posebna osjetila, a vlastitu okolinu ne vidite ni čujete.",
  },
  Lifedrinker: {
    minimumLevel: 12,
    pactBoon: "Pact of the Blade",
    description:
      "A hit with your pact weapon deals extra necrotic damage equal to your Charisma modifier, minimum 1. This adds damage, not an attack bonus.",
    descriptionHr:
      "Pogodak paktnim oružjem dodaje nekrotičnu štetu jednaku modifikatoru Karizme, najmanje 1. Ne povećava bonus napada.",
  },
  "Mask of Many Faces": {
    description:
      "Cast Disguise Self at will without a spell slot. The disguise is an illusion and does not change physical dimensions.",
    descriptionHr:
      "Bacajte Disguise Self bez utora. Prerušavanje je iluzija i ne mijenja fizičke dimenzije.",
  },
  "Master of Myriad Forms": {
    minimumLevel: 15,
    description:
      "Cast Alter Self at will without a spell slot; concentration remains required.",
    descriptionHr:
      "Bacajte Alter Self bez utora; i dalje je potrebna koncentracija.",
  },
  "Minions of Chaos": {
    minimumLevel: 9,
    description:
      "Cast Conjure Elemental once using a warlock slot. A long rest restores the invocation use; the spell's concentration risk still applies.",
    descriptionHr:
      "Jednom bacite Conjure Elemental uz warlock utor. Dugi odmor obnavlja uporabu; rizik gubitka koncentracije i dalje vrijedi.",
  },
  "Mire the Mind": {
    minimumLevel: 5,
    description:
      "Cast Slow once using a warlock slot. Regain this use after a long rest.",
    descriptionHr:
      "Jednom bacite Slow uz warlock utor. Dugi odmor obnavlja uporabu.",
  },
  "Misty Visions": {
    description:
      "Cast Silent Image at will without slots or materials. Concentration and normal illusion limitations apply.",
    descriptionHr:
      "Bacajte Silent Image bez utora i materijala. Vrijede koncentracija i uobičajena ograničenja iluzija.",
  },
  "One with Shadows": {
    minimumLevel: 5,
    description:
      "In dim light or darkness, use an action to become invisible until you move, take an action, or take a reaction.",
    descriptionHr:
      "U prigušenom svjetlu ili tami radnjom postanite nevidljivi dok se ne pomaknete, učinite radnju ili reakciju.",
  },
  "Otherworldly Leap": {
    minimumLevel: 9,
    description:
      "Cast Jump on yourself at will without slots or materials. Jump distance remains limited by available movement.",
    descriptionHr:
      "Bacajte Jump na sebe bez utora i materijala. Skok i dalje troši raspoloživo kretanje.",
  },
  "Repelling Blast": {
    spellKnown: "Eldritch Blast",
    description:
      "Each Eldritch Blast beam that hits may push its target up to 10 feet directly away from you. No saving throw or size limit is specified by this invocation.",
    descriptionHr:
      "Svaka pogođena zraka Eldritch Blasta može odgurnuti metu do 10 stopa ravno od vas. Zaziv ne navodi spašavanje ni ograničenje veličine.",
  },
  "Sculptor of Flesh": {
    minimumLevel: 7,
    description:
      "Cast Polymorph once using a warlock slot; regain the invocation use after a long rest.",
    descriptionHr:
      "Jednom bacite Polymorph uz warlock utor; dugi odmor obnavlja uporabu.",
  },
  "Sign of Ill Omen": {
    minimumLevel: 5,
    description:
      "Cast Bestow Curse once using a warlock slot; regain this use after a long rest.",
    descriptionHr:
      "Jednom bacite Bestow Curse uz warlock utor; dugi odmor obnavlja uporabu.",
  },
  "Thief of Five Fates": {
    description:
      "Cast Bane once using a warlock spell slot; regain the invocation use after a long rest.",
    descriptionHr:
      "Jednom bacite Bane uz warlock utor; dugi odmor obnavlja uporabu.",
  },
  "Thirsting Blade": {
    minimumLevel: 5,
    pactBoon: "Pact of the Blade",
    description:
      "Attack twice with your pact weapon when taking the Attack action. This does not stack with Extra Attack to produce three attacks.",
    descriptionHr:
      "Radnjom Napad napadnite dvaput paktnim oružjem. Ne zbraja se s Extra Attackom za tri napada.",
  },
  "Visions of Distant Realms": {
    minimumLevel: 15,
    description:
      "Cast Arcane Eye at will without a spell slot; concentration remains required.",
    descriptionHr:
      "Bacajte Arcane Eye bez utora; koncentracija i dalje vrijedi.",
  },
  "Voice of the Chain Master": {
    pactBoon: "Pact of the Chain",
    description:
      "Communicate telepathically with your familiar and perceive through its senses while on the same plane. While perceiving through it, speak through it in your own voice, even if it cannot normally speak.",
    descriptionHr:
      "Telepatski komunicirajte s pratiteljem i koristite njegova osjetila na istoj ravni postojanja. Dok opažate kroz njega, govorite kroz njega vlastitim glasom čak i ako inače ne govori.",
  },
  "Whispers of the Grave": {
    minimumLevel: 9,
    description:
      "Cast Speak with Dead at will without a spell slot. The spell's normal restrictions still apply.",
    descriptionHr:
      "Bacajte Speak with Dead bez utora. Uobičajena ograničenja čarolije i dalje vrijede.",
  },
  "Witch Sight": {
    minimumLevel: 15,
    description:
      "See a shapechanger's true form and the true form of creatures concealed by illusion or transmutation while within 30 feet and in your line of sight. This is not general truesight.",
    descriptionHr:
      "Unutar 30 stopa i vidokruga vidite pravi oblik mjenjača oblika i stvorenja skrivenih iluzijom ili transmutacijom. To nije opći truesight.",
  },
};

const disciplineDetails: Record<string, [string, string]> = {
  "Elemental Attunement": [
    "Use an action to create a brief harmless elemental effect within 30 feet: air, a small flame or spray, lighting/snuffing a small flame, warming/chilling a small amount, or shaping a small amount of earth, fire, water, or mist. It grants no combat damage.",
    "Radnjom stvorite kratak bezopasan elementarni učinak unutar 30 stopa: zrak, plamen ili prskanje, paljenje ili gašenje malog plamena, grijanje, hlađenje ili oblikovanje male količine elementa. Ne nanosi borbenu štetu.",
  ],
  "Fangs of the Fire Snake": [
    "When taking the Attack action, spend 1 ki for fire tendrils: unarmed reach increases by 10 feet for that action and the rest of the turn, and hits deal fire instead of bludgeoning damage. On a hit, spend 1 additional ki for +1d10 fire damage.",
    "Pri radnji Napad potrošite 1 ki za vatrene udare: doseg golorukih napada raste za 10 stopa do kraja poteza, a šteta postaje vatrena. Pri pogotku možete potrošiti još 1 ki za dodatnih 1d10 vatrene štete.",
  ],
  "Fist of Four Thunders": [
    "Spend 2 ki to cast Thunderwave. Wisdom is the spellcasting ability; the spell uses its ordinary action, range, and area.",
    "Potrošite 2 ki za Thunderwave. Svojstvo čaranja je Mudrost; vrijede uobičajena radnja, domet i područje čarolije.",
  ],
  "Fist of Unbroken Air": [
    "As an action, spend 2 ki and choose a creature within 30 feet. A failed Strength save takes 3d10 bludgeoning damage, is pushed up to 20 feet, and falls prone; success halves damage and prevents movement/prone. Each extra ki adds 1d10 damage.",
    "Radnjom potrošite 2 ki za metu unutar 30 stopa. Neuspješno spašavanje Snagom znači 3d10 udarne štete, odgurivanje do 20 stopa i pad na tlo; uspjeh prepolovljuje štetu i sprječava odgurivanje i pad. Dodatni ki dodaje 1d10.",
  ],
  "Gong of the Summit": [
    "Requires monk level 6. Spend 3 ki to cast Shatter using Wisdom.",
    "Potrebna je monk razina 6. Potrošite 3 ki za Shatter koristeći Mudrost.",
  ],
  "Rush of the Gale Spirits": [
    "Spend 2 ki to cast Gust of Wind using Wisdom. Concentration applies.",
    "Potrošite 2 ki za Gust of Wind koristeći Mudrost. Potrebna je koncentracija.",
  ],
  "Shape the Flowing River": [
    "As an action, spend 1 ki to reshape water or ice in an area up to 30 feet on a side within 120 feet. You may freeze or thaw it, raise/lower it, or form shapes within its limits; you cannot trap or injure a creature with this effect.",
    "Radnjom potrošite 1 ki za preoblikovanje vode ili leda u području do 30 stopa po strani unutar 120 stopa. Možete zamrznuti, otopiti, podići, spustiti ili oblikovati tvar; ne možete zarobiti ni ozlijediti stvorenje.",
  ],
  "Sweeping Cinder Strike": [
    "Spend 2 ki to cast Burning Hands using Wisdom.",
    "Potrošite 2 ki za Burning Hands koristeći Mudrost.",
  ],
  "Water Whip": [
    "As an action (2014 PHB errata), spend 2 ki against a creature you see within 30 feet. A failed Dexterity save takes 3d10 bludgeoning damage and is pulled up to 25 feet closer or knocked prone; success halves damage and prevents movement/prone. Each extra ki adds 1d10 damage.",
    "Radnjom prema ispravcima PHB-a potrošite 2 ki na vidljivu metu unutar 30 stopa. Neuspješno spašavanje Spretnosti znači 3d10 udarne štete te privlačenje do 25 stopa ili pad. Uspjeh prepolovljuje štetu i sprječava pomak i pad. Dodatni ki dodaje 1d10.",
  ],
  "Clench of the North Wind": [
    "Requires monk level 6. Spend 3 ki to cast Hold Person using Wisdom; concentration applies.",
    "Potrebna je monk razina 6. Potrošite 3 ki za Hold Person koristeći Mudrost; vrijedi koncentracija.",
  ],
  "Eternal Mountain Defense": [
    "Requires monk level 17, corrected by the official errata. Spend 5 ki to cast Stoneskin on yourself; concentration applies.",
    "Prema službenim ispravcima potrebna je monk razina 17. Potrošite 5 ki za Stoneskin na sebe; vrijedi koncentracija.",
  ],
  "Flames of the Phoenix": [
    "Requires monk level 11. Spend 4 ki to cast Fireball using Wisdom.",
    "Potrebna je monk razina 11. Potrošite 4 ki za Fireball koristeći Mudrost.",
  ],
  "Mist Stance": [
    "Requires monk level 11. Spend 4 ki to cast Gaseous Form on yourself; concentration applies.",
    "Potrebna je monk razina 11. Potrošite 4 ki za Gaseous Form na sebe; vrijedi koncentracija.",
  ],
  "Ride the Wind": [
    "Requires monk level 11. Spend 4 ki to cast Fly on yourself; concentration applies.",
    "Potrebna je monk razina 11. Potrošite 4 ki za Fly na sebe; vrijedi koncentracija.",
  ],
  "River of Hungry Flame": [
    "Requires monk level 17. Spend 5 ki to cast Wall of Fire using Wisdom; concentration applies.",
    "Potrebna je monk razina 17. Potrošite 5 ki za Wall of Fire koristeći Mudrost; vrijedi koncentracija.",
  ],
  "Breath of Winter": [
    "Requires monk level 17. Spend 6 ki to cast Cone of Cold using Wisdom.",
    "Potrebna je monk razina 17. Potrošite 6 ki za Cone of Cold koristeći Mudrost.",
  ],
  "Wave of Rolling Earth": [
    "Requires monk level 17. Spend 6 ki to cast Wall of Stone using Wisdom; concentration applies.",
    "Potrebna je monk razina 17. Potrošite 6 ki za Wall of Stone koristeći Mudrost; vrijedi koncentracija.",
  ],
};

const totemDetails: Record<string, Record<string, [string, string]>> = {
  "totem-spirit": {
    Bear: [
      "While raging, resist every damage type except psychic. This replaces the narrow damage protection of ordinary Rage for that rage.",
      "Dok bjesnite, otporni ste na svu štetu osim psihičke.",
    ],
    Eagle: [
      "While raging without heavy armor, opportunity attacks against you have disadvantage and you may Dash as a bonus action.",
      "Dok bjesnite bez teškog oklopa, napadi prilike protiv vas imaju nedostatak i možete Jurišati bonus radnjom.",
    ],
    Wolf: [
      "While raging, your allies have advantage on melee attack rolls against hostile creatures within 5 feet of you.",
      "Dok bjesnite, saveznici imaju prednost na bliskim napadima na neprijatelje unutar 5 stopa od vas.",
    ],
  },
  "aspect-beast": {
    Bear: [
      "Double carrying capacity and gain advantage on Strength checks to push, pull, lift, or break objects.",
      "Udvostručite nosivost i imajte prednost na provjerama Snage za guranje, vučenje, dizanje i razbijanje predmeta.",
    ],
    Eagle: [
      "See up to 1 mile clearly and distinguish fine detail as if at 100 feet; dim light does not impose disadvantage on your Perception checks.",
      "Jasno vidite do jedne milje i sitne pojedinosti kao na 100 stopa. Prigušeno svjetlo ne daje nedostatak vašem Opažanju.",
    ],
    Wolf: [
      "Track creatures while traveling at a fast pace and move stealthily while traveling at a normal pace.",
      "Možete pratiti tragove brzim putnim tempom i kretati se neprimjetno normalnim tempom.",
    ],
  },
  "totemic-attunement": {
    Bear: [
      "While raging, a hostile creature within 5 feet has disadvantage on attacks against others. Creatures that cannot see/hear you or cannot be frightened are immune to this benefit.",
      "Dok bjesnite, neprijatelj unutar 5 stopa ima nedostatak na napadima na druge. Ne vrijedi ako vas ne vidi ili čuje ili je imun na strah.",
    ],
    Eagle: [
      "While raging, gain a flying speed equal to walking speed during your turn. If nothing holds you aloft at turn end, you fall.",
      "Dok bjesnite, tijekom poteza letite brzinom hodanja. Ako vas na kraju poteza ništa ne drži u zraku, padate.",
    ],
    Wolf: [
      "While raging, after a melee weapon hit on your turn, use a bonus action to knock a Large or smaller target prone without a save.",
      "Dok bjesnite, nakon bliskog pogotka oružjem tijekom svojeg poteza bonus radnjom srušite Veliku ili manju metu bez spašavanja.",
    ],
  },
};

export const landCircleSpells: Record<string, Record<number, string[]>> = {
  Arctic: {
    3: ["Hold Person", "Spike Growth"],
    5: ["Sleet Storm", "Slow"],
    7: ["Freedom of Movement", "Ice Storm"],
    9: ["Commune with Nature", "Cone of Cold"],
  },
  Coast: {
    3: ["Mirror Image", "Misty Step"],
    5: ["Water Breathing", "Water Walk"],
    7: ["Control Water", "Freedom of Movement"],
    9: ["Conjure Elemental", "Scrying"],
  },
  Desert: {
    3: ["Blur", "Silence"],
    5: ["Create Food and Water", "Protection from Energy"],
    7: ["Blight", "Hallucinatory Terrain"],
    9: ["Insect Plague", "Wall of Stone"],
  },
  Forest: {
    3: ["Barkskin", "Spider Climb"],
    5: ["Call Lightning", "Plant Growth"],
    7: ["Divination", "Freedom of Movement"],
    9: ["Commune with Nature", "Tree Stride"],
  },
  Grassland: {
    3: ["Invisibility", "Pass without Trace"],
    5: ["Daylight", "Haste"],
    7: ["Divination", "Freedom of Movement"],
    9: ["Dream", "Insect Plague"],
  },
  Mountain: {
    3: ["Spider Climb", "Spike Growth"],
    5: ["Lightning Bolt", "Meld into Stone"],
    7: ["Stone Shape", "Stoneskin"],
    9: ["Passwall", "Wall of Stone"],
  },
  Swamp: {
    3: ["Darkness", "Melf's Acid Arrow"],
    5: ["Water Walk", "Stinking Cloud"],
    7: ["Freedom of Movement", "Locate Creature"],
    9: ["Insect Plague", "Scrying"],
  },
  Underdark: {
    3: ["Spider Climb", "Web"],
    5: ["Gaseous Form", "Stinking Cloud"],
    7: ["Greater Invisibility", "Stone Shape"],
    9: ["Cloudkill", "Insect Plague"],
  },
};

export function getChoiceOptionDetail(
  plan: ChoicePlan,
  option: string,
): ChoiceOptionDetail {
  const base = {
    sourceReference:
      plan.sourceReference || `PHB (2014), chapter 3: ${plan.className}`,
  };
  if (plan.key.startsWith("invocations-")) {
    const detail = invocationDetails[option];
    return detail
      ? {
          ...base,
          ...detail,
          reason: [
            detail.minimumLevel ? `Warlock level ${detail.minimumLevel}` : "",
            detail.pactBoon || "",
            detail.spellKnown ? `Know ${detail.spellKnown}` : "",
          ]
            .filter(Boolean)
            .join("; "),
        }
      : {
          ...base,
          description:
            "Unrecognized invocation. Review the 2014 PHB before using this entry.",
        };
  }
  if (plan.key.startsWith("elemental-disciplines-")) {
    const text = disciplineDetails[option];
    return {
      ...base,
      description: text?.[0] || "Discipline description is not implemented.",
      descriptionHr: text?.[1],
      minimumLevel: elementalDisciplineLevel(option),
      reason: `Monk level ${elementalDisciplineLevel(option)}; ki points`,
    };
  }
  const totem = totemDetails[plan.key]?.[option];
  if (totem) return { ...base, description: totem[0], descriptionHr: totem[1] };
  const branch = branchDetails[option];
  if (branch)
    return { ...base, description: branch[0], descriptionHr: branch[1] };
  if (plan.key === "land") {
    const grants = landCircleSpells[option];
    return {
      ...base,
      description: `Your ${option} circle grants these always-prepared druid spells without using the prepared-spell allowance: ${Object.entries(
        grants || {},
      )
        .map(([level, names]) => `druid ${level}: ${names.join(", ")}`)
        .join(
          "; ",
        )}. They become druid spells for you even if normally on another list.`,
      descriptionHr: `Kružnica ${option} daje uvijek pripremljene druidske čarolije koje ne troše broj pripremljenih čarolija: ${Object.entries(
        grants || {},
      )
        .map(([level, names]) => `druid ${level}: ${names.join(", ")}`)
        .join("; ")}. Za vas su druidske čak i ako su inače na drugom popisu.`,
    };
  }
  if (plan.key.startsWith("favored-terrain"))
    return {
      ...base,
      description: `Choose ${option} as a favored terrain. On Intelligence or Wisdom checks related to it, double proficiency when using a proficient skill. After traveling at least an hour there, your group avoids nonmagical difficult-terrain slowdown and ordinary navigation loss; you remain alert, can stealth at normal pace when alone, gather twice as much food, and learn more from tracks. This grants no circle spells.`,
      descriptionHr: `Odaberite ${option} kao poznati teren. Udvostručite poznavanje za povezane provjere Inteligencije ili Mudrosti s poznatom vještinom. Nakon barem jednog sata putovanja tamo skupina lakše putuje i ne gubi se bez magije; ostajete budni, sami se šuljate normalnim tempom, skupljate dvostruko hrane i bolje čitate tragove. Ne dobivate čarolije kružnice.`,
    };
  if (plan.key.startsWith("favored-humanoids"))
    return {
      ...base,
      description: `Choose ${option} as one of the two humanoid races for this Favored Enemy. Gain advantage on Survival checks to track them and Intelligence checks to recall information about them; this grants no attack or damage bonus before Foe Slayer.`,
      descriptionHr: `Odaberite ${option} kao jednu od dvije humanoidne rase za ovog omiljenog neprijatelja. Imate prednost na provjerama Preživljavanja za praćenje te Inteligencije za znanje o njima. Prije sposobnosti Foe Slayer ne daje bonus napada ni štete.`,
    };
  if (plan.key.startsWith("favored-enemy"))
    return {
      ...base,
      description: `Choose ${option}. Gain advantage on Survival checks to track these enemies and Intelligence checks to recall information about them. Humanoids requires two specific humanoid races. This does not add attack or damage bonuses before Foe Slayer.`,
      descriptionHr: `Odaberite ${option}. Imate prednost na Preživljavanju za praćenje i provjerama Inteligencije za znanje o njima. Humanoidi traže dvije određene rase. Ne daje bonus napada ili štete prije Foe Slayera.`,
    };
  if (plan.key.includes("language"))
    return {
      ...base,
      ...(option === "No language (chosen enemies speak none)"
        ? {
            description:
              "Favored Enemy grants an associated language only if the chosen enemies speak one. Record that no language is available; this grants no language proficiency.",
            descriptionHr:
              "Omiljeni neprijatelj daje povezani jezik samo ako ga odabrani neprijatelji govore. Zabilježite da jezik nije dostupan; time se ne stječe poznavanje jezika.",
          }
        : {
            description: `Learn to speak, read, and write ${option}. Do not select a language already granted by another source. Favored Enemy languages must be spoken by a selected enemy; uncommon languages can require DM permission.`,
            descriptionHr: `Naučite govoriti, čitati i pisati jezik ${option}. Ne birajte već poznati jezik. Jezik omiljenog neprijatelja mora govoriti odabrani neprijatelj; neuobičajeni jezici mogu tražiti dopuštenje DM-a.`,
          }),
    };
  if (plan.key === "dragon-ancestor") {
    const type = (
      {
        Black: "acid",
        Blue: "lightning",
        Brass: "fire",
        Bronze: "lightning",
        Copper: "acid",
        Gold: "fire",
        Green: "poison",
        Red: "fire",
        Silver: "cold",
        White: "cold",
      } as Record<string, string>
    )[option];
    return {
      ...base,
      description: `${option} ancestry associates you with ${type} damage. Learn Draconic, double proficiency on applicable Charisma checks with dragons, and use this damage type for Elemental Affinity from sorcerer 6. Draconic Resilience itself grants AC and HP; it does not grant this resistance at level 1.`,
      descriptionHr: `Podrijetlo ${option} povezano je sa štetom ${type}. Učite Draconic, udvostručujete poznavanje primjenjivih provjera Karizme sa zmajevima i koristite tu vrstu za Elemental Affinity od sorcerer razine 6. Draconic Resilience daje AC i HP; na razini 1 ne daje taj otpor.`,
    };
  }
  const expert = plan.key === "knowledge-skills";
  return {
    ...base,
    description: `Gain ${expert ? "proficiency and double proficiency on relevant checks" : "proficiency"} with ${option}. Proficiency adds your proficiency bonus once; a duplicate grant does not add it twice.`,
    descriptionHr: `Dobivate ${expert ? "poznavanje i udvostručeni bonus na povezanim provjerama" : "poznavanje"} za ${option}. Bonus poznavanja ne zbraja se dvaput za ponovljeni izvor.`,
  };
}
export const patronExpandedSpells: Record<string, string[]> = {
  "The Archfey": [
    "Faerie Fire",
    "Sleep",
    "Calm Emotions",
    "Phantasmal Force",
    "Blink",
    "Plant Growth",
    "Dominate Beast",
    "Greater Invisibility",
    "Dominate Person",
    "Seeming",
  ],
  "The Fiend": [
    "Burning Hands",
    "Command",
    "Blindness/Deafness",
    "Scorching Ray",
    "Fireball",
    "Stinking Cloud",
    "Fire Shield",
    "Wall of Fire",
    "Flame Strike",
    "Hallow",
  ],
  "The Great Old One": [
    "Dissonant Whispers",
    "Tasha's Hideous Laughter",
    "Detect Thoughts",
    "Phantasmal Force",
    "Clairvoyance",
    "Sending",
    "Dominate Beast",
    "Evard's Black Tentacles",
    "Dominate Person",
    "Telekinesis",
  ],
};

export const domainSpells: Record<string, string[][]> = {
  "Knowledge Domain": [
    ["Command", "Identify"],
    ["Augury", "Suggestion"],
    ["Nondetection", "Speak with Dead"],
    ["Arcane Eye", "Confusion"],
    ["Legend Lore", "Scrying"],
  ],
  "Life Domain": [
    ["Bless", "Cure Wounds"],
    ["Lesser Restoration", "Spiritual Weapon"],
    ["Beacon of Hope", "Revivify"],
    ["Death Ward", "Guardian of Faith"],
    ["Mass Cure Wounds", "Raise Dead"],
  ],
  "Light Domain": [
    ["Burning Hands", "Faerie Fire"],
    ["Flaming Sphere", "Scorching Ray"],
    ["Daylight", "Fireball"],
    ["Guardian of Faith", "Wall of Fire"],
    ["Flame Strike", "Scrying"],
  ],
  "Nature Domain": [
    ["Animal Friendship", "Speak with Animals"],
    ["Barkskin", "Spike Growth"],
    ["Plant Growth", "Wind Wall"],
    ["Dominate Beast", "Grasping Vine"],
    ["Insect Plague", "Tree Stride"],
  ],
  "Tempest Domain": [
    ["Fog Cloud", "Thunderwave"],
    ["Gust of Wind", "Shatter"],
    ["Call Lightning", "Sleet Storm"],
    ["Control Water", "Ice Storm"],
    ["Destructive Wave", "Insect Plague"],
  ],
  "Trickery Domain": [
    ["Charm Person", "Disguise Self"],
    ["Mirror Image", "Pass without Trace"],
    ["Blink", "Dispel Magic"],
    ["Dimension Door", "Polymorph"],
    ["Dominate Person", "Modify Memory"],
  ],
  "War Domain": [
    ["Divine Favor", "Shield of Faith"],
    ["Magic Weapon", "Spiritual Weapon"],
    ["Crusader's Mantle", "Spirit Guardians"],
    ["Freedom of Movement", "Stoneskin"],
    ["Flame Strike", "Hold Monster"],
  ],
};

export const oathSpells: Record<string, string[][]> = {
  "Oath of Devotion": [
    ["Protection from Evil and Good", "Sanctuary"],
    ["Lesser Restoration", "Zone of Truth"],
    ["Beacon of Hope", "Dispel Magic"],
    ["Freedom of Movement", "Guardian of Faith"],
    ["Commune", "Flame Strike"],
  ],
  "Oath of the Ancients": [
    ["Ensnaring Strike", "Speak with Animals"],
    ["Moonbeam", "Misty Step"],
    ["Plant Growth", "Protection from Energy"],
    ["Ice Storm", "Stoneskin"],
    ["Commune with Nature", "Tree Stride"],
  ],
  "Oath of Vengeance": [
    ["Bane", "Hunter's Mark"],
    ["Hold Person", "Misty Step"],
    ["Haste", "Protection from Energy"],
    ["Banishment", "Dimension Door"],
    ["Hold Monster", "Scrying"],
  ],
};

/** Sheet calculations use the same circle spells in acquisition order. */
export const landSpells: Record<string, string[][]> = Object.fromEntries(
  Object.entries(landCircleSpells).map(([name, levels]) => [
    name,
    [3, 5, 7, 9].map((level) => levels[level]),
  ]),
);
/** Localized descriptions owned by this catalog. */

/** Shared class choices and previews use the same training/progression source. */
export const classes: ClassOption[] = classSummaries.map(
  ({ skillSummary, ...summary }) => ({
    ...summary,
    hitDie: classTraining[summary.name].hitDie,
    saves: classTraining[summary.name].saves,
    skills: skillSummary || classTraining[summary.name].skillChoices,
    subclassAt: classProgression[summary.name].subclassAt,
    subclasses: Object.values(subclassCatalog)
      .filter((subclass) => subclass.className === summary.name)
      .map((subclass) => subclass.title),
  }),
);

/** Croatian class text is keyed by feature name; the English description stays in its definition. */
const classFeatureTextHr: Record<string, string> = {
  Rage: "Uđite u borbeni bijes: povećava štetu bliskih napada temeljenih na Snazi i daje otpornost na uobičajenu fizičku štetu. Teški oklop onemogućuje te pogodnosti.",
  "Unarmored Defense":
    "Dok ne nosite oklop, AC računajte iz Spretnosti i Izdržljivosti umjesto oklopa. Redoslijed stjecanja klase određuje koju inačicu ove sposobnosti imate.",
  "Reckless Attack":
    "Za prednost na bliske napade temeljene na Snazi tijekom ovog poteza prihvatite slabiju obranu: do vašeg sljedećeg poteza napadači imaju prednost protiv vas.",
  "Danger Sense":
    "Dok vidite i niste onesposobljeni, imate prednost na spasonosna bacanja Spretnosti protiv mnogih vidljivih učinaka.",
  "Primal Path":
    "Odaberite barbarski put. Daje sposobnosti na barbarskim razinama 3, 6, 10 i 14.",
  "Ability Score Improvement":
    "Povećajte vrijednosti osobina ili odaberite talent ako je to neobavezno pravilo uključeno i ispunjavate preduvjete.",
  "Extra Attack":
    "Radnjom Napad izvedite dva napada. Kasnija poboljšanja pojedine klase mogu povećati taj broj.",
  "Fast Movement": "Brzina vam raste dok ne nosite teški oklop.",
  "Path Feature":
    "Na ovoj barbarskoj razini dobivate sposobnost odabranoga puta.",
  "Feral Instinct":
    "Poboljšava inicijativu i mogućnost djelovanja kad ste iznenađeni, uz navedene uvjete sposobnosti.",
  "Brutal Critical":
    "Pri kritičnom bliskom napadu oružjem dodajte navedeni broj kockica štete oružja.",
  "Relentless Rage":
    "Dok bjesnite, spasonosno bacanje Izdržljivosti može vas zadržati na 1 HP umjesto pada na 0. DC raste nakon ponovljenih uporaba.",
  "Persistent Rage":
    "Bijes više ne završava prije vremena samo zato što nedavno niste napali niti pretrpjeli štetu.",
  "Indomitable Might":
    "Ako bi rezultat provjere Snage bio niži od vrijednosti vaše Snage, upotrijebite samu vrijednost Snage.",
  "Primal Champion":
    "Snaga i Izdržljivost rastu za 4, a njihov maksimum postaje 24.",
  Spellcasting:
    "Dobivate pristup čarolijama, osobinu za čaranje i napredovanje čarolija ove klase na navedenoj razini.",
  "Bardic Inspiration":
    "Savezniku dajte kockicu inspiracije koju može dodati provjeri, napadu ili spasonosnom bacanju. Kockica raste na bardovim razinama 5, 10 i 15.",
  "Jack of All Trades":
    "Provjerama osobina koje već ne uključuju bonus obučenosti dodajte polovicu tog bonusa, zaokruženu naniže.",
  "Song of Rest":
    "Saveznici koji tijekom kratkog odmora troše Hit Dice dodatno liječe HP. Kockica liječenja raste s bardovom razinom.",
  "Bard College":
    "Odaberite bardovski kolegij. Daje sposobnosti na razinama 3, 6 i 14.",
  Expertise:
    "Za odabrane uvježbane vještine udvostručite bonus obučenosti. Bard na razini 10 bira još dvije.",
  "Font of Inspiration":
    "Uporabe Bardic Inspiration sada obnavljate nakon kratkog ili dugog odmora, umjesto samo nakon dugog.",
  Countercharm:
    "Glazbom ili govorom ojačajte obližnje slušatelje protiv straha i šarma.",
  "Bard College Feature":
    "Na ovoj razini dobivate sposobnost odabranoga bardovskog kolegija.",
  "Magical Secrets":
    "Naučite odabrane čarolije bilo koje klase. Bard dobiva dodatne odabire na razinama 14 i 18.",
  "Superior Inspiration":
    "Ako pri bacanju inicijative nemate uporaba Bardic Inspiration, obnovite jednu.",
  "Divine Domain":
    "Odaberite božansku domenu. Daje sposobnosti na kleričkim razinama 1, 2, 6, 8 i 17.",
  "Channel Divinity":
    "Prizovite božanski učinak, primjerice Turn Undead. Broj uporaba po odmoru raste na kleričkim razinama 6 i 18.",
  "Divine Domain Feature":
    "Na ovoj razini dobivate sposobnost odabrane božanske domene.",
  "Destroy Undead":
    "Nemrtvi pogođeni sposobnošću Turn Undead mogu biti uništeni ako njihov CR ne prelazi prag ove razine.",
  "Divine Intervention":
    "Zatražite izravnu božansku pomoć. Vjerojatnost uspjeha raste s kleričkom razinom.",
  "Divine Intervention Improvement":
    "Divine Intervention automatski uspijeva; ograničenje ponovne uporabe i dalje vrijedi.",
  Druidic:
    "Poznajete tajni druidski jezik te njime ostavljate i prepoznajete skrivene poruke.",
  "Wild Shape":
    "Pretvorite se u dopuštenu zvijer. Druidska razina određuje ograničenja oblika; uporabe se obnavljaju odmorom.",
  "Druid Circle":
    "Odaberite druidski krug. Daje sposobnosti na razinama 2, 6, 10 i 14.",
  "Wild Shape Improvement":
    "Povećava dopušteni CR ili dostupne načine kretanja oblika Wild Shape.",
  "Druid Circle Feature":
    "Na ovoj razini dobivate sposobnost odabranoga druidskog kruga.",
  "Timeless Body":
    "Dobivate zaštitu od posljedica starenja i smanjene uobičajene potrebe prema pravilima svoje klase.",
  "Beast Spells":
    "Dok ste u Wild Shape obliku, možete bacati mnoge druidske čarolije uz ograničenja sposobnosti.",
  Archdruid:
    "Wild Shape možete koristiti neograničeno, uz posebna pravila za čaranje i komponente dok ste preobraženi.",
  "Fighting Style":
    "Odaberite borbeni stil s određenom pogodnošću. Isti stil ne možete odabrati dvaput.",
  "Second Wind":
    "Bonus radnjom obnovite HP. Sposobnost se obnavlja nakon kratkog ili dugog odmora.",
  "Action Surge":
    "Na svom potezu izvedite jednu dodatnu radnju. Broj uporaba raste na fighter razini 17.",
  "Martial Archetype":
    "Odaberite borbeni arhetip. Daje sposobnosti na fighter razinama 3, 7, 10, 15 i 18.",
  "Martial Archetype Feature":
    "Na ovoj razini dobivate sposobnost odabranoga borbenog arhetipa.",
  Indomitable:
    "Ponovite neuspjelo spasonosno bacanje. Broj uporaba raste na fighter razinama 13 i 17.",
  "Martial Arts":
    "Dok ste bez oklopa i štita te nenaoružani ili koristite dopušteno monk oružje, za napad i štetu možete koristiti Spretnost. Kad je povoljnija, koristite kockicu Martial Arts. Nakon odgovarajućeg napada možete bonus radnjom izvesti nenaoružani udarac.",
  Ki: "Broj ki bodova jednak je razini monka. Trošite ih na navedene tehnike; svi se obnavljaju nakon kratkog ili dugog odmora. Ki DC = 8 + bonus obučenosti + modifikator Mudrosti.",
  "Unarmored Movement":
    "Brže se krećete dok ne nosite oklop niti štit. Bonus raste s monk razinom.",
  "Monastic Tradition":
    "Odaberite redovničku tradiciju. Daje sposobnosti na monk razinama 3, 6, 11 i 17.",
  "Deflect Missiles":
    "Reakcijom smanjite štetu dalekometnog napada oružjem; projektil možda možete uhvatiti ili vratiti.",
  "Slow Fall": "Reakcijom smanjite štetu od pada.",
  "Stunning Strike":
    "Nakon bliskog pogotka oružjem potrošite ki kako biste pokušali omamiti metu.",
  "Ki-Empowered Strikes":
    "Vaši nenaoružani udarci smatraju se magičnima pri savladavanju otpornosti i imuniteta.",
  "Monastic Tradition Feature":
    "Na ovoj razini dobivate sposobnost odabrane redovničke tradicije.",
  Evasion:
    "Protiv područnih učinaka sa spasonosnim bacanjem Spretnosti uspjeh uklanja štetu, a neuspjeh je prepolovi.",
  "Stillness of Mind":
    "Radnjom prekinite jedan učinak zbog kojeg ste šarmirani ili prestrašeni.",
  "Unarmored Movement Improvement":
    "Na monk razini 9 tijekom svog poteza možete prelaziti okomite površine i tekućine bez pada tijekom tog kretanja.",
  "Purity of Body": "Postajete imuni na bolesti i otrov.",
  "Tongue of the Sun and Moon":
    "Razumijete sve govorne jezike, a stvorenja koja poznaju jezik razumiju vaš govor.",
  "Diamond Soul":
    "Stječete obučenost u svim spasonosnim bacanjima i možete potrošiti ki za ponavljanje neuspjelog spasonosna bacanja.",
  "Empty Body":
    "Trošite ki da postanete nevidljivi i otporni na većinu štete ili da nakratko prijeđete u Astralnu ravan.",
  "Perfect Self":
    "Ako pri početku inicijative nemate ki bodova, obnovite ih prema sposobnosti.",
  "Divine Sense":
    "Otkrivate određene obližnje celestiale, fiendove, nemrtve te posvećena i oskvrnuta mjesta.",
  "Lay on Hands":
    "Iz zalihe liječenja obnavljajte HP ili neutralizirajte otrov i bolest.",
  "Divine Smite":
    "Nakon pogotka bliskim napadom oružjem potrošite mjesto za čaroliju čarolije za dodatnu svjetlosnu štetu. Viši mjesto za čaroliju daje više štete, a protiv nemrtvih ili fiendova dodajte još jednu kockicu.",
  "Divine Health": "Postajete imuni na bolesti.",
  "Sacred Oath":
    "Odaberite zakletvu. Daje sposobnosti na paladinskim razinama 3, 7, 15 i 20 te čarolije zakletve.",
  "Aura of Protection":
    "Dok ste pri svijesti, vi i obližnji saveznici spasonosnim bacanjima dodajete modifikator Karizme, najmanje +1.",
  "Sacred Oath Feature":
    "Na ovoj razini dobivate sposobnost odabrane svete zakletve.",
  "Aura of Courage":
    "Dok ste pri svijesti, vi i obližnji saveznici ne možete biti prestrašeni.",
  "Improved Divine Smite":
    "Bliski pogoci oružjem nanose dodatnu svjetlosnu štetu.",
  "Cleansing Touch":
    "Dodirom prekinite čaroliju na sebi ili voljnom stvorenju. Broj uporaba određuje Karizma.",
  "Aura Improvements": "Doseg paladinskih aura raste na 30 stopa.",
  "Favored Enemy":
    "Odaberite vrstu omiljenog neprijatelja. Dobivate pogodnosti za praćenje i prisjećanje podataka te povezani jezik.",
  "Natural Explorer":
    "Odaberite omiljeni teren i ondje dobivate putne i istraživačke pogodnosti. Dodatne terene birate na razinama 6 i 10.",
  "Ranger Archetype":
    "Odaberite rendžerski arhetip. Daje sposobnosti na razinama 3, 7, 11 i 15.",
  "Primeval Awareness":
    "Potrošite mjesto za čaroliju čarolije kako biste osjetili prisutnost određenih vrsta stvorenja u okolici.",
  "Favored Enemy and Natural Explorer Improvements":
    "Odaberite dodatnog omiljenog neprijatelja i teren te proširite povezane pogodnosti.",
  "Ranger Archetype Feature":
    "Na ovoj razini dobivate sposobnost odabranoga rendžerskog arhetipa.",
  "Land’s Stride":
    "Lakše prelazite nemagični teški teren i biljke te imate zaštitu od određenih biljnih opasnosti.",
  "Natural Explorer Improvement":
    "Odaberite dodatni omiljeni teren i proširite istraživačke pogodnosti.",
  "Hide in Plain Sight":
    "Odvojite vrijeme za izradu kamuflaže koja pomaže skrivanju dok ostajete nepomični.",
  "Favored Enemy Improvement":
    "Odaberite novog omiljenog neprijatelja i pripadajući jezik te proširite povezane pogodnosti.",
  Vanish: "Sakrijte se bonus radnjom i ne ostavljajte trag osim ako to želite.",
  "Feral Senses":
    "Učinkovitije se borite protiv protivnika koje ne vidite, pod uvjetom da nisu skriveni od vas.",
  "Foe Slayer":
    "Jednom u svakom svom potezu bacanju napada ili štete protiv omiljenog neprijatelja dodajte modifikator Mudrosti.",
  "Sneak Attack":
    "Jednom po potezu dodajte navedene d6 kockice odgovarajućem finesse ili dalekometnom pogotku ako imate prednost ili podoban saveznik uz metu odvraća njezinu pažnju.",
  "Thieves’ Cant":
    "Razumijete i koristite šifrirane znakove i izraze poznate drugim uvježbanim rogueovima.",
  "Cunning Action": "Bonus radnjom izvedite Dash, Disengage ili Hide.",
  "Roguish Archetype":
    "Odaberite rogue arhetip. Daje sposobnosti na razinama 3, 9, 13 i 17.",
  "Uncanny Dodge": "Reakcijom prepolovite štetu jednog napadača kojeg vidite.",
  "Roguish Archetype Feature":
    "Na ovoj razini dobivate sposobnost odabranoga rogue arhetipa.",
  "Reliable Talent":
    "Na provjeri s bonusom obučenosti bacanje d20 manje od 10 tretirajte kao 10.",
  Blindsense:
    "Dok možete čuti, prepoznajete položaj obližnjih skrivenih ili nevidljivih stvorenja.",
  "Slippery Mind": "Stječete obučenost u spasonosnim bacanjima Mudrosti.",
  Elusive:
    "Dok niste onesposobljeni, napadi protiv vas ne mogu imati prednost.",
  "Stroke of Luck":
    "Promašaj pretvorite u pogodak ili neuspjelu provjeru osobine tretirajte kao d20 rezultat 20. Jednom po kratkom ili dugom odmoru.",
  "Sorcerous Origin":
    "Odaberite izvor urođene magije. Daje sposobnosti na sorcerer razinama 1, 6, 14 i 18.",
  "Font of Magic":
    "Dobivate sorcery bodove i mogućnosti njihove pretvorbe u mjesta za čarolije. Maksimum bodova jednak je sorcerer razini.",
  Metamagic:
    "Odaberite načine mijenjanja čarolija trošenjem sorcery bodova. Više mogućnosti dobivate na razinama 10 i 17.",
  "Sorcerous Origin Feature":
    "Na ovoj razini dobivate sposobnost odabranoga magijskog podrijetla.",
  "Sorcerous Restoration":
    "Nakon kratkog odmora obnavljate navedeni broj sorcery bodova.",
  "Otherworldly Patron":
    "Odaberite patrona. Daje sposobnosti na warlock razinama 1, 6, 10 i 14 te proširuje izbor čarolija.",
  "Pact Magic":
    "Naučite warlock čarolije i koristite mali broj mjesta za čarolije iste razine koji se obnavljaju nakon kratkog ili dugog odmora.",
  "Eldritch Invocations":
    "Odaberite magijske prilagodbe. Broj poznatih invokacija raste s warlock razinom.",
  "Pact Boon":
    "Odaberite paktni dar koji oblikuje mogućnosti vašeg pratitelja, oružja ili knjige.",
  "Otherworldly Patron Feature":
    "Na ovoj razini dobivate sposobnost odabranoga patrona.",
  "Mystic Arcanum":
    "Naučite jednu patronovu čaroliju navedene razine. Bacite je jednom po dugom odmoru bez mjesta za čarolije Pact Magic.",
  "Eldritch Master":
    "Jednom po dugom odmoru jednu minutu molite patrona kako biste obnovili Pact Magic mjesta za čarolije.",
  "Arcane Recovery":
    "Jednom dnevno nakon kratkog odmora obnovite mjesta za čarolije čiji zbroj razina ne prelazi polovicu wizard razine, zaokruženu naviše. Nijedan obnovljeni mjesto za čaroliju ne smije biti iznad razine 5.",
  "Arcane Tradition":
    "Odaberite magijsku školu. Daje sposobnosti na wizard razinama 2, 6, 10 i 14.",
  "Arcane Tradition Feature":
    "Na ovoj razini dobivate sposobnost odabrane magijske tradicije.",
  "Spell Mastery":
    "Odaberite jednu čaroliju razine 1 i jednu razine 2 iz svoje knjige. Dok su pripremljene, možete ih bacati po volji na njihovoj najnižoj razini.",
  "Signature Spells":
    "Odaberite dvije čarolije razine 3. Uvijek su pripremljene i svaku jednom po odmoru možete baciti bez mjesta za čarolije.",
};
const classFeatureTextOverridesHr: Record<string, string> = {
  "Monk:Unarmored Defense":
    "Dok ne nosite oklop ni štit, AC je 10 + modifikator Spretnosti + modifikator Mudrosti. Ako ste ovu sposobnost već stekli iz druge klase, višeklasnost ne daje i ovu inačicu.",
};
const subclassFeatureTextHr: Record<string, string> = {
  Frenzy:
    "Pri ulasku u bijes možete odabrati pomamu. U kasnijim potezima tog bijesa omogućuje bliski napad oružjem kao bonus radnju. Završetak bijesa uzrokuje jednu razinu iscrpljenosti.",
  "Mindless Rage":
    "Tijekom bijesa ne možete biti šarmirani ni prestrašeni. Ako vas takav učinak već zahvaća, potisnut je dok bijes traje.",
  "Intimidating Presence":
    "Radnjom pokušajte prestrašiti vidljivo stvorenje u dosegu. Meta izvodi spasonosno bacanje Mudrosti protiv DC-a sposobnosti. Na kasnijim potezima održavanje troši vašu radnju, a meta može ponavljati spasonosno bacanje.",
  Retaliation:
    "Kad vam stvorenje unutar 5 stopa nanese štetu, reakcijom ga možete napasti bliskim oružjem.",
  "Spirit Seeker":
    "Beast Sense i Speak with Animals možete bacati kao obrede. Pri obrednom bacanju ove pomoćne čarolije ne troše mjesta za čarolije.",
  "Totem Spirit (choose one animal spirit)":
    "Odaberite Bear, Eagle ili Wolf. Svaka životinja daje drukčiju pogodnost tijekom bijesa. Zabilježite odabir jer određuje točan učinak sposobnosti.",
  "Aspect of the Beast (choose one animal spirit)":
    "Odaberite Bear, Eagle ili Wolf za odgovarajuću putnu ili istraživačku pogodnost. Odabir može biti jednak prethodnom totemu ili drukčiji.",
  "Spirit Walker":
    "Commune with Nature možete bacati kao obred. Duh daje podatke o prirodnoj okolici uz uobičajena ograničenja čarolije.",
  "Totemic Attunement (choose one animal spirit)":
    "Odaberite Bear, Eagle ili Wolf za snažniju pogodnost povezanu s bijesom. Ovaj odabir bilježite odvojeno od ranijih totema.",
  "Bonus Proficiencies":
    "Dobivate poznavanje triju odabranih vještina. Odaberite ih zasebno; duplikat ne postaje stručnost.",
  "Cutting Words":
    "Kad odgovarajuće stvorenje izvodi napad, provjeru osobine ili štetu, reakcijom i uporabom Bardic Inspiration oduzmite kockicu od rezultata. Uvjeti dosega, sluha i imuniteta iz sposobnosti i dalje vrijede.",
  "Additional Magical Secrets":
    "Naučite dvije čarolije bilo koje klase, razine koju možete bacati. Za vas su bardovske čarolije i ne troše uobičajeni broj poznatih čarolija.",
  "Peerless Skill":
    "Na vlastitoj provjeri osobine nakon bacanja d20 možete potrošiti Bardic Inspiration i dodati njezinu kockicu, potencijalno pretvarajući neuspjeh u uspjeh.",
  "Combat Inspiration":
    "Nadahnuto stvorenje može kockicu Bardic Inspiration dodati šteti oružja ili je reakcijom dodati AC-u protiv jednog napada nakon što vidi bacanje.",
  "Extra Attack":
    "Kad na svom potezu izvedete radnju Napad, možete napasti dvaput umjesto jednom.",
  "Battle Magic":
    "Nakon što radnjom bacite bardovsku čaroliju, bonus radnjom možete izvesti jedan napad oružjem.",
  "Blessings of Knowledge":
    "Odaberite dvije dopuštene vještine znanja. Stječete obučenost i udvostručeni bonus obučenosti u njima te dva jezika po izboru.",
  "Knowledge of the Ages":
    "Uporabom Channel Divinity privremeno steknite obučenost u jednoj vještini ili alatu. Odabirete je pri aktiviranju sposobnosti.",
  "Read Thoughts":
    "Uporabom Channel Divinity čitajte površne misli obližnjeg stvorenja. Neuspjelo spasonosno bacanje Mudrosti može omogućiti dublje djelovanje i učinak Suggestion.",
  "Potent Spellcasting":
    "Šteti svojih kleričkih jednostavnih čarolija dodajte modifikator Mudrosti.",
  "Visions of the Past":
    "Meditacijom primite viziju o nedavnom događaju ili povijesti predmeta. Dobiveni podaci ovise o pitanju i DM-ovu opisu prošlosti.",
  "Bonus Proficiency":
    "Na cleric razini 1 učite teški oklop. Podklasno poznavanje vrijedi i kada ga višeklasni ulazak nije dao.",
  "Disciple of Life":
    "Kad čarolijom razine 1 ili više obnavljate HP, liječenju dodajte bonus koji ovisi o razini čarolije.",
  "Preserve Life":
    "Uporabom Channel Divinity raspodijelite zalihu liječenja stvorenjima u dosegu. Nijednom ne može podići HP iznad polovice maksimuma; ne djeluje na nemrtve ni konstrukte.",
  "Blessed Healer":
    "Kad čarolijom razine 1 ili više vratite HP drugom stvorenju, i sami obnavljate manju količinu HP.",
  "Divine Strike":
    "Jednom po vlastitom potezu pogodak oružjem dodaje 1d8 blistave štete, odnosno 2d8 od cleric razine 14. Drugi potezi i daljnji pogoci ne dobivaju bonus.",
  "Supreme Healing":
    "Kad bacate kockice za liječenje čarolijom, svaku tretirajte kao da je dala najveći mogući rezultat.",
  "Bonus Cantrip":
    "Učite Light ako ga već ne znate. Za vas je cleric trik i ne troši normalan broj trikova.",
  "Warding Flare":
    "Kad vas napadne stvorenje koje vidite, reakcijom mu nametnite nedostatak na taj napad. Ograničene uporabe obnavljaju se dugim odmorom.",
  "Radiance of the Dawn":
    "Uporabom Channel Divinity raspršite magičnu tamu i nanesite svjetlosnu štetu neprijateljima u području. Spašavanje Izdržljivosti smanjuje štetu.",
  "Improved Flare":
    "Warding Flare možete koristiti za zaštitu odgovarajućeg obližnjeg stvorenja umjesto samo sebe.",
  "Corona of Light":
    "Radnjom stvorite privremenu svjetlosnu auru koja obližnje neprijatelje čini ranjivijima na vaše čarolije s vatrenom i svjetlosnom štetom.",
  "Acolyte of Nature":
    "Naučite jednu druidsku jednostavnu čaroliju i steknite obučenost u jednoj vještini povezanoj s prirodom s popisa sposobnosti.",
  "Charm Animals and Plants":
    "Uporabom Channel Divinity šarmirajte podobne zvijeri i biljke u dosegu koje ne uspiju na spasonosnom bacanju Mudrosti.",
  "Dampen Elements":
    "Kad vi ili obližnje stvorenje pretrpite kiselinsku, hladnu, vatrenu, munjevitu ili gromovitu štetu, reakcijom tom stvorenju dajte otpornost na tu pojedinačnu štetu.",
  "Master of Nature":
    "Kad domenom šarmirate životinju ili biljku, pogođenim stvorenjima možete bonus radnjom zapovijedati dok šarm traje.",
  "Wrath of the Storm":
    "Kad vas obližnje stvorenje pogodi napadom, reakcijom nanesite munjevitu ili gromovitu štetu. Spašavanje Spretnosti smanjuje štetu. Uporabe se obnavljaju dugim odmorom.",
  "Destructive Wrath":
    "Kad biste bacali munjevitu ili gromovitu štetu, potrošite Channel Divinity da umjesto bacanja nanesete maksimalnu štetu.",
  "Thunderbolt Strike":
    "Kad Velikom ili manjem stvorenju nanesete munjevitu štetu, možete ga odgurnuti od sebe.",
  Stormborn:
    "Dok ste na otvorenom, dobivate brzinu letenja uz uvjete navedene u sposobnosti.",
  "Blessing of the Trickster":
    "Dodirom voljnom stvorenju dajte prednost na provjere Spretnosti (Stealth). Traje sat vremena ili do ponovne uporabe; nije ograničeno dugim odmorom.",
  "Invoke Duplicity":
    "Uporabom Channel Divinity stvorite iluzornog dvojnika. Možete ga pomicati i bacati čarolije kao da ste na njegovu mjestu, ali koristite vlastita osjetila. Pogodnosti za napad ovise o položaju vas, mete i dvojnika.",
  "Cloak of Shadows":
    "Klerička inačica: Channel Divinity daje nevidljivost do kraja sljedećeg poteza, koja ranije završava napadom ili čaranjem. Monkova inačica zahtijeva prigušeno svjetlo ili tamu i završava napadom, čaranjem ili ulaskom u jarko svjetlo.",
  "Improved Duplicity":
    "Umjesto jednoga stvarate više dvojnika te ih koristite uz položajna i druga ograničenja sposobnosti.",
  "War Priest":
    "Nakon radnje Napad izvedite dodatni napad oružjem kao bonus radnju. Broj uporaba određuje modifikator Mudrosti; obnavljaju se dugim odmorom.",
  "Guided Strike":
    "Pri vlastitom napadu uporabom Channel Divinity dodajte bonus nakon što vidite bacanje, ali prije objave ishoda.",
  "War God's Blessing":
    "Reakcijom i uporabom Channel Divinity drugom stvorenju dajte bonus Guided Strike na njegov napad.",
  "Avatar of Battle":
    "Imate otpornost na tupu, probodnu i režuću štetu nemagičnih oružja.",
  "Natural Recovery":
    "Jednom dnevno tijekom kratkog odmora obnovite mjesta za čarolije čiji ukupan zbroj razina zadovoljava ograničenje sposobnosti. Ne možete obnoviti mjesta za čarolije razine 6 ili više.",
  "Circle Spells (choose land; additional spells at druid levels 3, 5, 7, and 9)":
    "Odaberite Arctic, Coast, Desert, Forest, Grassland, Mountain, Swamp ili Underdark. Teren daje određene čarolije na druidskim razinama 3, 5, 7 i 9. Uvijek su pripremljene i ne troše broj pripremljenih čarolija.",
  "Land's Stride":
    "Nemagični teški teren ne troši dodatno kretanje; nemagične biljke prelazite bez uobičajenih kazni. Magične biljke i učinci i dalje vas mogu ometati.",
  "Nature's Ward":
    "Elementali i fey ne mogu vas šarmirati niti prestrašiti. Bolesti i otrov više ne djeluju na vas.",
  "Nature's Sanctuary":
    "Zvijer ili biljka koja vas napada mora prema uvjetima sposobnosti uspjeti na spasonosnom bacanju Mudrosti ili vas privremeno ne može napasti. Učinak može završiti ako joj naudite.",
  "Combat Wild Shape":
    "Wild Shape koristite bonus radnjom. Dok ste preobraženi, bonus radnjom možete potrošiti mjesto za čaroliju čarolije za obnavljanje vlastitog HP-a.",
  "Circle Forms":
    "Krug Mjeseca povećava najveći CR dopuštenih zvijeri. Uobičajena ograničenja plivanja do razine 4 i letenja do razine 8 i dalje vrijede.",
  "Primal Strike":
    "Napadi u obliku zvijeri smatraju se magičnima za savladavanje otpornosti i imuniteta na nemagične napade.",
  "Elemental Wild Shape":
    "Odjednom potrošite dvije uporabe Wild Shape za oblik dopuštenog zračnog, zemljanog, vatrenog ili vodenog elementala.",
  "Thousand Forms":
    "Alter Self možete bacati po volji bez mjesta za čarolije čarolije.",
  "Improved Critical":
    "Napadi oružjem kritično pogađaju na d20 rezultatu 19 ili 20.",
  "Remarkable Athlete":
    "Provjerama Snage, Spretnosti i Izdržljivosti koje već ne uključuju obučenost dodajte polovicu bonusa obučenosti, zaokruženu naviše. Skok u dalj sa zaletom produljuje se prema Snazi.",
  "Additional Fighting Style":
    "Odaberite još jedan stil s fighter popisa. Ne možete ponovno odabrati već poznati stil osim ako pravilo izričito dopušta ponavljanje.",
  "Superior Critical":
    "Napadi oružjem kritično pogađaju na d20 rezultatu 18–20.",
  Survivor:
    "Na početku svog poteza obnavljate HP dok ste pri svijesti i imate najviše polovicu maksimalnog HP-a.",
  "Combat Superiority":
    "Naučite borbene manevre i steknite superiority kockice. Manevar troši kockicu; veličina kockice i broj manevara rastu na određenim fighter razinama. Potrošene kockice obnavljaju se kratkim ili dugim odmorom.",
  "Student of War": "Stječete poznavanje jednog obrtničkog alata po izboru.",
  "Know Your Enemy":
    "Promatranjem ili razgovorom izvan borbe saznajte je li stvorenje u odabranim fizičkim ili borbenim svojstvima bolje, jednako ili slabije od vas.",
  "Improved Combat Superiority":
    "Superiority kockice rastu na fighter razinama navedenim u napredovanju.",
  Relentless:
    "Ako pri početku borbe nemate nijednu superiority kockicu, obnovite jednu.",
  Spellcasting:
    "Od fighter 3 učite wizard čarolije Inteligencijom. Većina izbora razina mora biti abjuration ili evocation; iznimke na 3, 8, 14 i 20 dopuštaju svaku školu. Trikovi nisu ograničeni. Višeklasni utori ne proširuju što smijete učiti.",
  "Weapon Bond":
    "Obredom se povežite s oružjem. Dok niste onesposobljeni ne možete biti razoružani od tog oružja, a možete ga prizvati u ruku dok je na istoj ravni.",
  "War Magic":
    "Nakon što radnjom bacite jednostavnu čaroliju, bonus radnjom možete napasti oružjem.",
  "Eldritch Strike":
    "Stvorenje pogođeno vašim oružjem ima nedostatak na sljedeće spasonosno bacanje protiv vaše čarolije prije kraja vašeg sljedećeg poteza.",
  "Arcane Charge":
    "Pri uporabi Action Surge teleportirajte se na vidljivo slobodno mjesto unutar dosega prije ili nakon dodatne radnje.",
  "Improved War Magic":
    "Nakon što radnjom bacite čaroliju, bonus radnjom možete napasti oružjem.",
  "Open Hand Technique":
    "Kad pogodite udarcem Flurry of Blows, izaberite: onemogućite metine reakcije, odgurnite je nakon neuspjelog spasonosna bacanja Snage ili srušite nakon neuspjelog spasonosna bacanja Spretnosti.",
  "Wholeness of Body":
    "Radnjom obnovite HP jednak trostrukoj monk razini. Ponovno možete nakon dugog odmora.",
  Tranquility:
    "Nakon dugog odmora dobivate zaštitu nalik Sanctuaryju do sljedećeg dugog odmora ili dok je ne prekinete na način opisan sposobnošću.",
  "Quivering Palm":
    "Nakon pogotka potrošite ki da u meti ostavite vibraciju. Kasnijom radnjom je aktivirajte: meta izvodi spasonosno bacanje Izdržljivosti, na neuspjeh pada na 0 HP, a na uspjeh prima veliku štetu.",
  "Shadow Arts":
    "Trošenjem ki bacajte Darkness, Darkvision, Pass without Trace ili Silence bez materijalnih komponenti. Dodatno poznajete Minor Illusion.",
  "Shadow Step":
    "U prigušenom svjetlu ili tami teleportirajte se na vidljivo mjesto koje je također u prigušenom svjetlu ili tami. Sljedeći bliski napad u tom potezu ima prednost.",
  Opportunist:
    "Kad drugo stvorenje pogodi metu unutar 5 stopa od vas, reakcijom je možete napasti bliskim napadom.",
  "Disciple of the Elements (choose disciplines)":
    "Naučite elementarnu disciplinu. Neke daju učinak čarolije i troše ki. Vaša monk razina pri učenju određuje dostupne discipline.",
  "Elemental Discipline":
    "Naučite dodatnu dopuštenu disciplinu ili zamijenite poznatu drugom dostupnom. Zabilježite točnu disciplinu i ki trošak.",
  "Oath Spells":
    "Zakletva na određenim paladinskim razinama daje čarolije. Uvijek su pripremljene i ne troše broj redovno pripremljenih paladinskih čarolija.",
  "Channel Divinity: Sacred Weapon":
    "Uporabom Channel Divinity privremeno osnažite jedno oružje: napadima dodaje modifikator Karizme i emitira svjetlost.",
  "Channel Divinity: Turn the Unholy":
    "Uporabom Channel Divinity natjerajte podobne fiendove i nemrtve u dosegu na bijeg ako ne uspiju na spasonosnom bacanju Mudrosti.",
  "Aura of Devotion":
    "Dok ste pri svijesti, vi i obližnji saveznici ne možete biti šarmirani. Doseg raste na paladinskoj razini 18.",
  "Purity of Spirit":
    "Stalno ste pod učinkom Protection from Evil and Good, s njegovim zaštitama protiv određenih vrsta stvorenja.",
  "Holy Nimbus":
    "Radnjom emitirajte sunčevu svjetlost i nanosite svjetlosnu štetu obližnjim neprijateljima. Preobrazba tijekom trajanja daje i obrambene pogodnosti.",
  "Channel Divinity: Nature's Wrath":
    "Uporabom Channel Divinity pokušajte sputati obližnje stvorenje sablasnim lozama. Meta se spašava Snagom ili Spretnosti.",
  "Channel Divinity: Turn the Faithless":
    "Uporabom Channel Divinity natjerajte podobne fey i fiendove u dosegu na bijeg ako ne uspiju na spasonosnom bacanju Mudrosti.",
  "Aura of Warding":
    "Dok ste pri svijesti, vi i obližnji saveznici imate otpornost na štetu od čarolija. Doseg raste na paladinskoj razini 18.",
  "Undying Sentinel":
    "Jednom po dugom odmoru ostanite na 1 HP kad biste pali na 0, osim ako ste odmah ubijeni. Ne trpite slabost zbog starosti i ne možete magično ostarjeti.",
  "Elder Champion":
    "Pretvorite se u drevnoga prirodnog prvaka. Dobivate regeneraciju, pogodnosti za čaranje i mogućnost ometanja obližnjih neprijatelja.",
  "Channel Divinity: Abjure Enemy":
    "Uporabom Channel Divinity prestrašite i usporite jednu metu koja ne uspije na spasonosnom bacanju Mudrosti. Fiendovi i nemrtvi teže se odupiru.",
  "Channel Divinity: Vow of Enmity":
    "Uporabom Channel Divinity privremeno steknite prednost na napade protiv jednog vidljivog stvorenja.",
  "Relentless Avenger":
    "Kad pogodite napadom prilike, u sklopu iste reakcije pomaknite se bez izazivanja napada prilike te mete.",
  "Soul of Vengeance":
    "Kad meta vašeg Vow of Enmity napadne, reakcijom je možete napasti bliskim oružjem ako je u dosegu.",
  "Avenging Angel":
    "Privremeno se preobrazite i dobijte brzinu letenja te auru koja može prestrašiti neprijatelje koji vas vide.",
  "Hunter's Prey (choose one option)":
    "Odaberite Colossus Slayer, Giant Killer ili Horde Breaker. Svaka mogućnost ima drukčiji uvjet za dodatnu štetu ili napad; zabilježeni odabir određuje kada djeluje.",
  "Defensive Tactics (choose one option)":
    "Odaberite Escape the Horde, Multiattack Defense ili Steel Will. Redom štite od napada prilike, ponovljenih napada iste mete ili straha.",
  "Multiattack (choose one option)":
    "Odaberite Volley ili Whirlwind Attack. Volley omogućuje zasebne dalekometne napade na više meta; Whirlwind zasebne bliske napade na obližnje mete.",
  "Superior Hunter's Defense (choose one option)":
    "Odaberite Evasion, Stand Against the Tide ili Uncanny Dodge. Štite od područnih učinaka, promašenih bliskih napada ili štete vidljivog napadača.",
  "Ranger's Companion":
    "Dobivate zvijer koja djeluje na vašem rezultatu inicijative, tijekom vašeg poteza. Kretanje i zapovijedanje slijede posebna PHB pravila; za zapovijed napadom obično trošite svoju radnju. Odabranoj zvijeri dodaje se bonus obučenosti gdje je navedeno.",
  "Exceptional Training":
    "U potezu u kojem vaš pratitelj ne napada, bonus radnjom mu zapovjedite Dash, Disengage ili Help. Bez zapovijedi već koristi Dodge. Njegovi se napadi smatraju magičnima za otpornost i imunitet.",
  "Bestial Fury":
    "Kad pratitelju zapovjedite napad, može napasti dvaput ili koristiti svoju radnju Multiattack ako je ima.",
  "Share Spells":
    "Kad bacite čaroliju koja cilja vas, i pratitelj može imati korist ako je dovoljno blizu prema uvjetima sposobnosti.",
  "Fast Hands":
    "Cunning Action možete koristiti za provjeru Sleight of Hand, uporabu thieves' tools za zamku ili bravu, odnosno radnju Use an Object.",
  "Second-Story Work":
    "Brže se penjete i produljujete skok sa zaletom prema modifikatoru Spretnosti.",
  "Supreme Sneak":
    "Imate prednost na provjere Spretnosti (Stealth) ako se tijekom istog poteza krećete najviše polovicom brzine.",
  "Use Magic Device":
    "Pri uporabi magičnih predmeta zanemarite preduvjete klase, rase i razine uz ograničenja sposobnosti.",
  "Thief's Reflexes":
    "U prvom krugu borbe imate dodatni potez na inicijativi umanjenoj za 10. Ne vrijedi ako ste iznenađeni.",
  Assassinate:
    "Imate prednost protiv stvorenja koja u borbi još nisu djelovala. Pogodak protiv iznenađene mete jest kritični pogodak.",
  "Infiltration Expertise":
    "Uz vrijeme i novac uspostavite lažni identitet s uvjerljivom poviješću i dokumentima.",
  Impostor:
    "Proučavanjem osobe možete oponašati njezin govor, rukopis i ponašanje. Sumnjičav promatrač može provjeriti prijevaru.",
  "Death Strike":
    "Iznenađena meta nakon vašeg odgovarajućeg napada izvodi spasonosno bacanje Izdržljivosti. Neuspjeh povećava štetu prema pravilima sposobnosti.",
  "Mage Hand Legerdemain":
    "Mage Hand dobiva posebna poboljšanja za prikrivenu krađu, zamke i brave na daljinu.",
  "Magical Ambush":
    "Ako ste skriveni od mete, ona ima nedostatak na spasonosno bacanje protiv čarolije koju joj bacate.",
  "Versatile Trickster":
    "Mage Handom ometajte metu i steknite prednost na napade protiv nje uz uvjete sposobnosti.",
  "Spell Thief":
    "Reakcijom na čaroliju koja vas cilja pokušajte je poništiti i privremeno naučiti. Uspjeh ovisi o spasonosnom bacanju i drugim ograničenjima sposobnosti.",
  "Dragon Ancestor":
    "Odaberite vrstu zmaja, naučite Draconic i udvostručite primjenjivu obučenost na provjerama Karizme sa zmajevima. Vrsta štete koristi se za Elemental Affinity od razine čarobnjaka 6. Draconic Resilience neovisno daje AC i HP.",
  "Draconic Resilience":
    "Maksimalni HP raste za 1 po sorcerer razini. Bez oklopa vaš AC iznosi 13 + modifikator Spretnosti.",
  "Elemental Affinity":
    "Pri bacanju čarolije s vrstom štete vašeg zmajskog podrijetla jednom bacanju štete dodajte Karizmu. Sorcery bodovima možete privremeno dobiti otpornost na tu vrstu.",
  "Dragon Wings":
    "Razvijte zmajska krila i dobijte brzinu letenja dok ne nosite oklop koji sprječava njihovu uporabu.",
  "Draconic Presence":
    "Potrošite sorcery bodove za auru koja može šarmirati ili prestrašiti obližnje mete koje ne uspiju na spasonosnom bacanju Mudrosti.",
  "Wild Magic Surge":
    "Nakon odgovarajuće sorcerer čarolije DM može zatražiti bacanje za nalet divlje magije. Ishod na tablici može imati trenutne ili trajne posljedice.",
  "Tides of Chaos":
    "Steknite prednost na jedan dopušteni napad, provjeru ili spasonosno bacanje. DM kasnije može izazvati Wild Magic Surge kako bi obnovio ovu sposobnost.",
  "Bend Luck":
    "Reakcijom i trošenjem sorcery bodova dodajte ili oduzmite d4 od napada, provjere osobine ili spasonosna bacanja drugog stvorenja.",
  "Controlled Chaos":
    "Pri Wild Magic Surgeu bacite dvaput na tablici i odaberite koji rezultat djeluje.",
  "Spell Bombardment":
    "Kad kockica štete čarolije pokaže maksimum, jednu takvu kockicu bacite ponovno i dodajte novi rezultat, uz ograničenje jednom po potezu.",
  "Expanded Spell List":
    "Patron proširuje warlock popis određenim čarolijama. One postaju dostupni odabiri; ne učite ih sve automatski.",
  "Fey Presence":
    "Radnjom projicirajte fey šarm ili strah u obližnje područje. Mete izvode spasonosno bacanje Mudrosti. Uporaba se obnavlja kratkim ili dugim odmorom.",
  "Misty Escape":
    "Kad pretrpite štetu, reakcijom postanite nevidljivi i teleportirajte se unutar dosega. Ponovno nakon kratkog ili dugog odmora.",
  "Beguiling Defenses":
    "Imuni ste na šarm. Kad vas stvorenje pokuša šarmirati, reakcijom možete pokušati šarmirati njega.",
  "Dark Delirium":
    "Obližnju metu pokušajte zarobiti u iluzornom svijetu. Spašava se Mudrosti i tijekom učinka može biti onesposobljena.",
  "Dark One's Blessing":
    "Kad neprijatelja spustite na 0 HP, dobivate privremeni HP prema modifikatoru Karizme i warlock razini.",
  "Dark One's Own Luck":
    "Nakon bacanja dodajte d10 svojoj provjeri osobine ili spasonosnom bacanju. Obnavlja se kratkim ili dugim odmorom.",
  "Fiendish Resilience":
    "Nakon odmora odaberite vrstu štete i do sljedećeg odabira imajte otpornost na nju. Magično i posrebreno oružje podliježe iznimkama sposobnosti.",
  "Hurl Through Hell":
    "Pri pogotku privremeno protjerajte metu kroz opasnu ravan. Vraća se i prima psihičku štetu prema pravilima. Uporaba se obnavlja dugim odmorom.",
  "Awakened Mind":
    "Telepatski govorite vidljivoj meti u dosegu koja razumije barem jedan jezik. Time joj ne dajete automatsku mogućnost telepatskog odgovora.",
  "Entropic Ward":
    "Reakcijom nametnite nedostatak napadu protiv vas. Ako promaši, vaš sljedeći napad protiv tog napadača ima prednost. Obnavlja se kratkim ili dugim odmorom.",
  "Thought Shield":
    "Misli vam se ne mogu čitati bez dopuštenja. Imate otpornost na psihičku štetu i dio nje odražavate izvoru.",
  "Create Thrall":
    "Dodirnite onesposobljenog humanoida i šarmirajte ga do jednoga od navedenih uvjeta prekida. Na istoj ravni možete s njime telepatski komunicirati na veliku udaljenost.",
  "Abjuration Savant":
    "Vrijeme i zlato za prepisivanje abjuracijske čarolije u knjigu prepolovljeni su.",
  "Arcane Ward":
    "Pri bacanju abjuracije stvorite zaštitu koja prima štetu prije vas. HP joj ovisi o wizard razini i Inteligenciji, a odgovarajuće čarolije obnavljaju ga.",
  "Projected Ward":
    "Kad obližnje stvorenje pretrpi štetu, reakcijom prepustite svojoj Arcane Ward zaštiti da je primi umjesto njega.",
  "Improved Abjuration":
    "Provjerama osobina koje su dio abjuracijske čarolije, poput Counterspell ili Dispel Magic, dodajte bonus obučenosti.",
  "Spell Resistance":
    "Imate prednost na spasonosna bacanja protiv čarolija i otpornost na štetu od čarolija.",
  "Conjuration Savant":
    "Vrijeme i zlato za prepisivanje konjuracijske čarolije u knjigu prepolovljeni su.",
  "Minor Conjuration":
    "Radnjom prizovite mali nemagični predmet koji ste vidjeli. Traje ograničeno vrijeme ili dok nije oštećen ili upotrijebljen za nanošenje štete.",
  "Benign Transposition":
    "Teleportirajte se na vidljivo slobodno mjesto ili zamijenite mjesta s voljnim Malim ili Srednjim stvorenjem. Obnavlja se dugim odmorom ili konjuracijom razine 1 ili više.",
  "Focused Conjuration":
    "Primanje štete ne može prekinuti koncentraciju na vašu konjuracijsku čaroliju.",
  "Durable Summons":
    "Stvorenja koja prizovete ili stvorite konjuracijskom čarolijom dobivaju 30 privremenih HP.",
  "Divination Savant":
    "Prepisivanje divinacijskih čarolija u knjigu troši polovicu uobičajenog vremena i zlata.",
  Portent:
    "Nakon dugog odmora bacite i zabilježite dva d20. Prije odgovarajućeg bacanja možete jednim rezultatom zamijeniti napad, spasonosno bacanje ili provjeru sebe ili vidljivog stvorenja.",
  "Expert Divination":
    "Kad mjestom za čaroliju bacite divinacijsku čaroliju razine 2 ili više, obnovite mjesto za čaroliju niže razine uz ograničenja sposobnosti.",
  "The Third Eye":
    "Nakon odmora odaberite darkvision, eterski vid, bolje razumijevanje ili viđenje nevidljivosti. Pogodnost traje do sljedećeg odmora.",
  "Greater Portent":
    "Nakon dugog odmora bacite i zabilježite tri Portent kockice umjesto dvije.",
  "Enchantment Savant":
    "Vrijeme i zlato za prepisivanje enchantment čarolije u knjigu prepolovljeni su.",
  "Hypnotic Gaze":
    "Radnjom šarmirajte i onesposobite obližnju metu koja ne uspije na spasonosnom bacanju Mudrosti. Održavanje troši radnju; šteta ili prevelika udaljenost prekidaju učinak.",
  "Instinctive Charm":
    "Kad vas stvorenje napadne, reakcijom pokušajte preusmjeriti njegov napad na drugu podobnu metu. Napadač se opire spasonosnim bacanjem Mudrosti.",
  "Split Enchantment":
    "Kad enchantment čarolija odgovarajuće razine cilja jedno stvorenje, možete odabrati i drugu podobnu metu.",
  "Alter Memories":
    "Kad meta ne uspije na spasonosnom bacanju protiv vaše enchantment čarolije, uz ograničenja možete izmijeniti ili izbrisati dio njezina sjećanja i prikriti činjenicu da je bila šarmirana.",
  "Evocation Savant":
    "Vrijeme i zlato za prepisivanje evokacijske čarolije u knjigu prepolovljeni su.",
  "Sculpt Spells":
    "Pri evokaciji koja zahvaća vidljiva druga stvorenja odaberite dopušten broj. Automatski uspijevaju na spasonosnom bacanju i ne primaju štetu ako bi uspjeh inače prepolovio štetu.",
  "Potent Cantrip":
    "Stvorenje koje uspije na spasonosnom bacanju protiv vaše štetne jednostavne čarolije i dalje prima dio štete prema sposobnosti.",
  "Empowered Evocation":
    "Jednom bacanju štete wizard evokacijske čarolije dodajte modifikator Inteligencije.",
  Overchannel:
    "Maksimizirajte štetu dopuštene wizard čarolije. Ponovljena uporaba prije dugog odmora nanosi vam rastuću nekrotičnu štetu.",
  "Illusion Savant":
    "Vrijeme i zlato za prepisivanje iluzijske čarolije u knjigu prepolovljeni su.",
  "Improved Minor Illusion":
    "Ako ga već ne poznajete, naučite Minor Illusion. Jednim bacanjem možete stvoriti i zvuk i sliku.",
  "Malleable Illusions":
    "Radnjom promijenite prirodu odgovarajuće vlastite iluzije, ostajući unutar ograničenja čarolije.",
  "Illusory Self":
    "Kad vas napad pogodi, reakcijom umetnite iluzornog dvojnika i pretvorite pogodak u promašaj. Obnavlja se kratkim ili dugim odmorom.",
  "Illusory Reality":
    "Jedan neživi nemagični predmet iz iluzije privremeno učinite stvarnim. Ne može izravno nanositi štetu niti inače nauditi stvorenju.",
  "Necromancy Savant":
    "Prepisivanje nekromancijskih čarolija u knjigu troši polovicu uobičajenog vremena i zlata.",
  "Grim Harvest":
    "Jednom po potezu kad vašom čarolijom pogine barem jedno stvorenje, obnovite HP prema razini čarolije. Nemrtvi i konstrukti ne aktiviraju ovu sposobnost.",
  "Undead Thralls":
    "Animate Dead dodajte svojoj knjizi i poboljšajte njime stvorene nemrtve. Pri bacanju možete ciljati još jedno tijelo ili hrpu kostiju.",
  "Inured to Undeath":
    "Imate otpornost na nekrotičnu štetu, a vaš maksimum HP ne može se smanjiti.",
  "Command Undead":
    "Radnjom pokušajte preuzeti kontrolu nad nemrtvom metom koja se opire spasonosnim bacanjem Karizme. Snažni ili inteligentni nemrtvi imaju posebna ograničenja.",
  "Transmutation Savant":
    "Prepisivanje transmutacijskih čarolija u knjigu troši polovicu uobičajenog vremena i zlata.",
  "Minor Alchemy":
    "Radom privremeno promijenite nemagični predmet od drveta, kamena, željeza, bakra ili srebra u drugi materijal s popisa.",
  "Transmuter's Stone":
    "Izradite kamen koji nositelju daje odabranu pogodnost, primjerice kretanje, otpornost, darkvision ili Izdržljivost. Pogodnost mijenjate ponovnim bacanjem odgovarajuće čarolije.",
  Shapechanger:
    "Dodajte Polymorph u knjigu. Bez mjesta za čarolije ga možete baciti na sebe, isključivo za zvijer dopuštenog CR-a. Obnavlja se kratkim ili dugim odmorom.",
  "Master Transmuter":
    "Potrošite i uništite Transmuter's Stone za snažan učinak: pretvorbu tvari, vraćanje života, uklanjanje stanja ili vraćanje mladosti prema pravilima sposobnosti.",
};
const subclassFeatureTextOverridesHr: Record<string, string> = {
  "College of Valor:Bonus Proficiencies":
    "Na bard razini 3 dobivate poznavanje srednjeg oklopa, štitova i bojnog oružja. Ne dobivate samu opremu ni teški oklop.",
  "Nature Domain:Bonus Proficiency":
    "Domena Prirode daje poznavanje teškog oklopa.",
  "Nature Domain:Divine Strike":
    "Jednom po vlastitom potezu pogodak oružjem dodaje 1d8 hladne, vatrene ili munjevite štete po izboru; od cleric 14 daje 2d8.",
  "Tempest Domain:Bonus Proficiencies":
    "Na cleric razini 1 dobivate poznavanje bojnog oružja i teškog oklopa, uključujući ulazak višeklasnosti.",
  "Tempest Domain:Divine Strike":
    "Jednom po vlastitom potezu pogodak oružjem dodaje 1d8 gromovite štete, odnosno 2d8 od cleric 14.",
  "Trickery Domain:Divine Strike":
    "Jednom po vlastitom potezu pogodak oružjem dodaje 1d8 otrovne štete, odnosno 2d8 od cleric 14.",
  "War Domain:Bonus Proficiencies":
    "Na cleric razini 1 dobivate poznavanje bojnog oružja i teškog oklopa. Poznavanje ne dodaje početnu opremu pri višeklasnom ulasku.",
  "War Domain:Divine Strike":
    "Jednom po vlastitom potezu pogodak oružjem dodaje 1d8 vrste štete oružja, odnosno 2d8 od cleric 14.",
  "Circle of the Land:Bonus Cantrip":
    "Na druid razini 2 učite jedan dodatni druidski trik. Ne troši normalan broj poznatih trikova.",
  "Way of Shadow:Cloak of Shadows":
    "U prigušenom svjetlu ili tami radnjom postanite nevidljivi do napada, čaranja ili ulaska u jako svjetlo. Ova monk značajka nema istek nakon runde niti troši Channel Divinity.",
  "Assassin:Bonus Proficiencies":
    "Na rogue razini 3 učite pribor za prerušavanje i otrovarski pribor. To su alati, a ne dodatne vještine ili besplatni otrovi.",
  "Arcane Trickster:Spellcasting":
    "Od rogue 3 učite wizard čarolije Inteligencijom. Većina izbora mora biti enchantment ili illusion; 3, 8, 14 i 20 uključuju iznimke. Početno učite Mage Hand i dva wizard trika. Višeklasni utori ne otključavaju više poznate čarolije.",
};
const subclassOverviewTextHr: Record<string, string> = {
  "Path of the Berserker":
    "Izravan, agresivan put bijesa. Frenzy daje bonus napad, ali uz iscrpljenost. Kasnije sposobnosti štite od mentalne kontrole i kažnjavaju obližnje napadače.",
  "Path of the Totem Warrior":
    "Duhovni put s odvojenim odabirima životinja na više razina. Bear naglašava otpornost, Eagle pokretljivost i opažanje, Wolf podršku saveznicima. Svaki odabir ima vlastiti učinak.",
  "College of Lore":
    "Bard posvećen znanju dobiva dodatne vještine, reakciju koja oslabljuje tuđa bacanja, dodatne čarolije drugih klasa i poboljšanje vlastitih provjera.",
  "College of Valor":
    "Bard za borbenu podršku dobiva obuku za oklop i oružje, borbenu inspiraciju, Extra Attack i kasniju kombinaciju čarolije i napada oružjem.",
  "Knowledge Domain":
    "Učena klerička domena daje jezike, expertise u vještinama, privremenu obuku, čitanje misli i podatke o prošlosti.",
  "Life Domain":
    "Domena iscjelitelja poboljšava čarolije liječenja, raspodjeljuje liječenje skupini, nagrađuje liječenje saveznika i naposljetku maksimizira kockice liječenja.",
  "Light Domain":
    "Svjetlosna domena daje dodatnu jednostavnu čaroliju, reakciju za ometanje napada, područnu svjetlosnu štetu i snažniju vatrenu i svjetlosnu magiju.",
  "Nature Domain":
    "Domena prirode spaja druidsku jednostavnu čaroliju i vještinu, utjecaj na zvijeri i biljke te zaštitu od elementarne štete.",
  "Tempest Domain":
    "Olujna domena daje borbenu obuku, reakcijsku munjevitu ili gromovitu štetu, njezino maksimiziranje, prisilno pomicanje i kasnije letenje.",
  "Trickery Domain":
    "Domena prijevare podržava prikrivanje, stvara magijskog dvojnika te zbunjuje protivnike sjenama i iluzijama.",
  "War Domain":
    "Ratna domena daje borbenu obuku, bonus napade, preciznije napade, podršku napadima saveznika i otpornost na fizičku štetu oružja.",
  "Circle of the Land":
    "Druid povezan s terenom koji određuje dodatne čarolije. Natural Recovery vraća dio mjesta za čarolije, a kasnije sposobnosti poboljšavaju kretanje i zaštitu.",
  "Circle of the Moon":
    "Specijalist Wild Shapea brzo se preobražava, koristi snažnije borbene oblike, magijske napade zvijeri i naposljetku oblike elementala.",
  Champion:
    "Jednostavan borbeni put proširuje raspon kritičnih pogodaka, poboljšava fizičke provjere, dodaje borbeni stil i liječi pri niskom HP-u.",
  "Battle Master":
    "Taktični fighter koristi superiority kockice i odabrane manevre. Dobiva obrtnički alat, a kasnije bolje kockice, taktičke podatke i oporavak resursa.",
  "Eldritch Knight":
    "Fighter s ograničenim izborom wizard čarolija, povezanim oružjem i sposobnostima koje spajaju čaranje, napade oružjem i kretanje.",
  "Way of the Open Hand":
    "Put nenaoružane kontrole dodaje učinke Flurry of Blowsu, vlastito liječenje, zaštitni mir i skupu odgođenu završnu tehniku.",
  "Way of Shadow":
    "Prikriveni put troši ki na određene čarolije, teleportira se između sjena, skriva nevidljivošću u tami i napada kad su pogođeni obližnji protivnici.",
  "Way of the Four Elements":
    "Elementarni put troši ki na odabrane discipline. Svaka ima preduvjet razine i trošak; bilježite razinu monka na kojoj je odabrana.",
  "Oath of Devotion":
    "Zaštitnička zakletva daje uvijek pripremljene čarolije, osnaživanje oružja, moć protiv nemrtvih, auru protiv šarma i svjetlosnu preobrazbu.",
  "Oath of the Ancients":
    "Zakletva zaštite života daje prirodne božanske učinke, otpornost obližnjim saveznicima, snažno preživljavanje i prirodnu preobrazbu.",
  "Oath of Vengeance":
    "Zakletva progona usredotočena je na označavanje i izdvajanje neprijatelja, praćenje, protunapade i kasnije letenje.",
  Hunter:
    "Taktični ranger bira mogućnost na svakoj razini sposobnosti. Četiri odvojena odabira oblikuju štetu, obranu, napade na više meta i preživljavanje.",
  "Beast Master":
    "Ranger surađuje sa zvijeri koja ima vlastita svojstva i radnje. PHB pravila zapovijedanja određuju kako napada i djeluje uz vas.",
  Thief:
    "Praktični rogue specijalizira se za brzu uporabu predmeta, penjanje, skakanje, prikrivanje, magične predmete i dodatni potez u prvom krugu na visokoj razini.",
  Assassin:
    "Rogue za infiltraciju dobiva obuku za maske i otrove, pogodnosti na početku borbe, lažne identitete, oponašanje i udarac temeljen na iznenađenju.",
  "Arcane Trickster":
    "Rogue s ograničenim wizard čarolijama, poboljšanim Mage Handom i sposobnostima koje iskorištavaju skrivanje i ometanje mete.",
  "Draconic Bloodline":
    "Sorcerer bira zmajsko podrijetlo koje određuje vrstu štete. Dobiva otpornije tijelo, srodnu štetu čarolija, letenje i auru straha ili šarma.",
  "Wild Magic":
    "Sorcererove čarolije mogu izazvati nasumične nalete. Tides of Chaos, Bend Luck i kasnije sposobnosti daju načine utjecanja na neizvjesnost.",
  "The Archfey":
    "Pakt s fey silom daje šarm i strah, hitan bijeg u magli, obranu od šarma i kasniji iluzorni zatvor.",
  "The Fiend":
    "Pakt s fiendom daje izdržljivost poražavanjem protivnika, bonus provjeri ili spasonosnom bacanju, odabranu otpornost na štetu i protjerujući napad.",
  "The Great Old One":
    "Pakt s nezemaljskom silom daje ograničenu telepatiju, ometanje napada, psihičku zaštitu i vezivanje šarmiranog stvorenja.",
  "School of Abjuration":
    "Zaštitna škola stvara štit koji upija štetu, proširuje ga na saveznike, poboljšava provjere protumagije i štiti od čarolija.",
  "School of Conjuration":
    "Škola prizivanja stvara mali predmet, omogućuje kratku teleportaciju, štiti koncentraciju i osnažuje prizvana stvorenja.",
  "School of Divination":
    "Škola predviđanja koristi unaprijed zabilježene Portent kockice, obnavlja mjesta za čarolije divinacijom i daje poboljšana osjetila.",
  "School of Enchantment":
    "Škola uma daje održavani šarm, preusmjeravanje napada, dvostruko ciljanje enchantment čarolija i promjenu sjećanja.",
  "School of Evocation":
    "Škola štetne magije štiti odabrane saveznike od vaših područnih čarolija i poboljšava štetu jednostavnih i ostalih čarolija.",
  "School of Illusion":
    "Škola iluzije poboljšava Minor Illusion, mijenja postojeće iluzije, stvara obrambenog dvojnika i jedan iluzorni predmet čini stvarnim.",
  "School of Necromancy":
    "Škola života i smrti liječi nakon ubojstava čarolijom, osnažuje stvorene nemrtve, pruža nekrotičnu zaštitu i kontrolu nemrtvih.",
  "School of Transmutation":
    "Škola preobrazbe mijenja materijale, izrađuje prilagodljiv kamen, preobražava samog čarobnjaka i naposljetku troši kamen za snažan učinak.",
};

export function classCatalogTranslations(): Record<string, string> {
  const pairs: Record<string, string> = {};
  for (const [className, tree] of Object.entries(classProgression))
    for (const level of tree.levels)
      for (const feature of level.features) {
        const value =
          classFeatureTextOverridesHr[className + ":" + feature.name] ||
          classFeatureTextHr[feature.name];
        if (value) pairs[feature.description] = value;
      }
  for (const subclass of Object.values(subclassCatalog)) {
    pairs[subclass.overview] = subclassOverviewTextHr[subclass.title];
    for (const [name, description] of Object.entries(subclass.featureNotes)) {
      const value =
        subclassFeatureTextOverridesHr[subclass.title + ":" + name] ||
        subclassFeatureTextHr[name];
      if (value) pairs[description] = value;
    }
  }
  for (const group of Object.values(subclassFeatureOverrides))
    for (const [en, hr] of Object.values(group)) pairs[en] = hr;
  for (const [en, hr] of Object.values(branchDetails)) pairs[en] = hr;
  for (const [en, hr] of Object.values(disciplineDetails)) pairs[en] = hr;
  for (const group of Object.values(totemDetails))
    for (const [en, hr] of Object.values(group)) pairs[en] = hr;
  for (const detail of Object.values(invocationDetails))
    if (detail.descriptionHr) pairs[detail.description] = detail.descriptionHr;
  return pairs;
}
