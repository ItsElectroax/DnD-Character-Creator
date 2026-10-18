import { backgrounds } from "./backgrounds";
import {
  classes,
  classProgression,
  getClassFeatureCoverageGaps,
  getSubclassChoicePlans,
  getSubclassCoverageGaps,
  invocationDetails,
  subclassCatalog,
  subclassFeatureLevels,
} from "./classes";
import {
  adventuringGear,
  armor,
  barding,
  equipmentCatalog,
  mounts,
  packs,
  services,
  startingEquipmentChoices,
  toolCatalog,
  tradeGoods,
  weapons,
} from "./equipment";
import { featCatalog } from "./feats";
import { languages, skills } from "./proficiencies";
import { races } from "./races";
import { spellCatalog } from "./spells";

export type CatalogAuditIssue = {
  id: string;
  category: string;
  kind: "implementation" | "source-access" | "coverage";
  message: string;
  optionId?: string;
};
/** This inventory is maintained independently of rendering and calculation code. */
export const phbInventory = {
  races: [
    "Dwarf",
    "Elf",
    "Halfling",
    "Human",
    "Dragonborn",
    "Gnome",
    "Half-Elf",
    "Half-Orc",
    "Tiefling",
  ],
  classes: [
    "Barbarian",
    "Bard",
    "Cleric",
    "Druid",
    "Fighter",
    "Monk",
    "Paladin",
    "Ranger",
    "Rogue",
    "Sorcerer",
    "Warlock",
    "Wizard",
  ],
  subclasses: {
    Barbarian: ["Path of the Berserker", "Path of the Totem Warrior"],
    Bard: ["College of Lore", "College of Valor"],
    Cleric: [
      "Knowledge Domain",
      "Life Domain",
      "Light Domain",
      "Nature Domain",
      "Tempest Domain",
      "Trickery Domain",
      "War Domain",
    ],
    Druid: ["Circle of the Land", "Circle of the Moon"],
    Fighter: ["Champion", "Battle Master", "Eldritch Knight"],
    Monk: ["Way of the Open Hand", "Way of Shadow", "Way of the Four Elements"],
    Paladin: ["Oath of Devotion", "Oath of the Ancients", "Oath of Vengeance"],
    Ranger: ["Hunter", "Beast Master"],
    Rogue: ["Thief", "Assassin", "Arcane Trickster"],
    Sorcerer: ["Draconic Bloodline", "Wild Magic"],
    Warlock: ["The Archfey", "The Fiend", "The Great Old One"],
    Wizard: [
      "School of Abjuration",
      "School of Conjuration",
      "School of Divination",
      "School of Enchantment",
      "School of Evocation",
      "School of Illusion",
      "School of Necromancy",
      "School of Transmutation",
    ],
  },
  feats: [
    "Actor",
    "Alert",
    "Athlete",
    "Charger",
    "Crossbow Expert",
    "Defensive Duelist",
    "Dual Wielder",
    "Dungeon Delver",
    "Durable",
    "Elemental Adept",
    "Grappler",
    "Great Weapon Master",
    "Healer",
    "Heavily Armored",
    "Heavy Armor Master",
    "Inspiring Leader",
    "Keen Mind",
    "Lightly Armored",
    "Linguist",
    "Lucky",
    "Mage Slayer",
    "Magic Initiate",
    "Martial Adept",
    "Medium Armor Master",
    "Mobile",
    "Moderately Armored",
    "Mounted Combatant",
    "Observant",
    "Polearm Master",
    "Resilient",
    "Ritual Caster",
    "Savage Attacker",
    "Sentinel",
    "Sharpshooter",
    "Shield Master",
    "Skilled",
    "Skulker",
    "Spell Sniper",
    "Tavern Brawler",
    "Tough",
    "War Caster",
    "Weapon Master",
  ],
  packs: [
    "Burglar's pack",
    "Diplomat's pack",
    "Dungeoneer's pack",
    "Entertainer's pack",
    "Explorer's pack",
    "Priest's pack",
    "Scholar's pack",
  ],
  weaponCount: 37,
  armorAndShieldCount: 13,
  backgroundCount: 13,
  skills: 18,
  languages: 16,
  subclassCount: 40,
  classLevelCount: 240,
};
export function getCatalogAudit() {
  const issues: CatalogAuditIssue[] = [];
  const missing = (category: string, expected: string[], actual: string[]) => {
    for (const name of expected)
      if (!actual.includes(name))
        issues.push({
          id: `missing-${category}-${name}`,
          category,
          kind: "coverage",
          message: `Missing PHB ${category}: ${name}.`,
          optionId: name,
        });
    for (const name of actual)
      if (!expected.includes(name))
        issues.push({
          id: `extra-${category}-${name}`,
          category,
          kind: "coverage",
          message: `Unexpected ${category} outside the independent PHB inventory: ${name}.`,
          optionId: name,
        });
  };
  missing(
    "race",
    phbInventory.races,
    races.map((r) => r.name),
  );
  missing(
    "class",
    phbInventory.classes,
    classes.map((c) => c.name),
  );
  missing(
    "feat",
    phbInventory.feats,
    featCatalog.map((f) => f.name),
  );
  missing(
    "pack",
    phbInventory.packs,
    packs.map((p) => p.name),
  );
  for (const [className, subclasses] of Object.entries(
    phbInventory.subclasses,
  )) {
    missing(
      `${className}-subclass`,
      subclasses,
      classes.find((c) => c.name === className)?.subclasses || [],
    );
    for (let level = 1; level <= 20; level++)
      if (
        !classProgression[className]?.levels.some((row) => row.level === level)
      )
        issues.push({
          id: `level-${className}-${level}`,
          category: "class-level",
          kind: "coverage",
          message: `${className} level ${level} has no progression row.`,
        });
    for (const name of subclasses)
      if (!subclassCatalog[name] || !subclassFeatureLevels[name])
        issues.push({
          id: `subclass-${name}`,
          category: "subclass",
          kind: "coverage",
          message: `${name} has no feature unlock table or detail definition.`,
        });
    for (const subclass of subclasses)
      for (const plan of getSubclassChoicePlans(className, subclass, 20))
        if (
          plan.choose < 1 ||
          plan.choose > plan.options.length ||
          new Set(plan.options).size !== plan.options.length
        )
          issues.push({
            id: `choice-${className}-${subclass}-${plan.key}`,
            category: "choice",
            kind: "coverage",
            message: `Invalid choice count or duplicate options: ${subclass}, ${plan.title}.`,
          });
  }
  for (const feature of [
    ...getClassFeatureCoverageGaps(),
    ...getSubclassCoverageGaps(),
  ])
    issues.push({
      id: `feature-${feature}`,
      category: "feature",
      kind: "implementation",
      message: `A named feature lacks its own explanation: ${feature}.`,
      optionId: feature,
    });
  for (const spell of spellCatalog) {
    if (spell.verification === "source-verification-needed")
      issues.push({
        id: `spell-source-${spell.id}`,
        category: "spell",
        kind: "source-access",
        message: spell.metadataReference
          ? `${spell.name}: basic spell details are checked against the official 2014 listing; full rules wording still requires primary-source verification.`
          : `${spell.name}: complete 2014 PHB metadata and wording still require primary-source verification.`,
        optionId: spell.id,
      });
    for (const field of [
      "school",
      "castingTime",
      "range",
      "components",
      "duration",
    ] as const)
      if (!spell[field].trim())
        issues.push({
          id: `spell-field-${spell.id}-${field}`,
          category: "spell",
          kind: "implementation",
          message: `${spell.name}: missing ${field} data.`,
          optionId: spell.id,
        });
    if (!spell.descriptionComplete)
      issues.push({
        id: `spell-description-${spell.id}`,
        category: "spell",
        kind: "implementation",
        message: `${spell.name}: an original detailed spell explanation is not yet implemented.`,
        optionId: spell.id,
      });
    if (!spell.classes.length || spell.level < 0 || spell.level > 9)
      issues.push({
        id: `spell-metadata-${spell.id}`,
        category: "spell",
        kind: "coverage",
        message: `${spell.name}: invalid class-list membership or spell level.`,
        optionId: spell.id,
      });
  }
  // The authenticated PHB compendium is not available in this workspace. An open
  // Basic Rules subset is not evidence that every PHB-only branch was checked.
  issues.push({
    id: "phb-authority-access",
    category: "authority",
    kind: "source-access",
    message:
      "The full 2014 PHB compendium requires access that is unavailable in this workspace. Proprietary subclass, feat, background, and spell entries have original paraphrases, but an exhaustive primary-source comparison remains a dependency. Public 2014 Basic Rules and official errata have been checked; 2024 content is excluded.",
  });
  issues.push({
    id: "phb-spell-index-access",
    category: "spell-inventory",
    kind: "source-access",
    message:
      "The independent complete PHB chapter-11 spell index is unavailable behind compendium access. The provisional catalog contains canonical PHB names and normalizes SRD aliases, but its total alone is not evidence of complete PHB coverage.",
  });
  for (const item of equipmentCatalog)
    if (/not implemented/.test(item.description))
      issues.push({
        id: `equipment-detail-${item.id}`,
        category: "equipment",
        kind: "implementation",
        message: `${item.name}: original explanation is not implemented.`,
        optionId: item.id,
      });
  const counts = {
    races: races.length,
    classes: classes.length,
    classLevels: Object.values(classProgression).reduce(
      (sum, p) => sum + p.levels.length,
      0,
    ),
    subclasses: Object.keys(subclassCatalog).length,
    backgrounds: backgrounds.length,
    feats: featCatalog.length,
    spells: spellCatalog.length,
    spellDescriptions: spellCatalog.filter((s) => s.descriptionComplete).length,
    spellsWithVerifiedMetadata: spellCatalog.filter(
      (s) =>
        s.verification === "verified-open-rules" ||
        Boolean(s.metadataReference),
    ).length,
    spellsWithPendingRulesReview: spellCatalog.filter(
      (s) => s.verification === "source-verification-needed",
    ).length,
    skills: skills.length,
    languages: languages.length,
    weapons: weapons.length,
    armorAndShields: armor.length,
    packs: packs.length,
    tools: toolCatalog.length,
    adventuringGear: adventuringGear.length,
    mounts: mounts.length,
    services: services.length,
    barding: barding.length,
    tradeGoods: tradeGoods.length,
    equipmentTotal: equipmentCatalog.length,
    startingEquipmentGroups: startingEquipmentChoices.length,
    invocations: Object.keys(invocationDetails).length,
  };
  return { complete: issues.length === 0, counts, issues };
}
export const catalogCoverageReport = getCatalogAudit;
