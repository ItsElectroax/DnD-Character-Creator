import { type SpellDefinition } from "../catalog/spells";
export type ClassPath = Record<number, string>;

/** Player-facing placement is supplied by the owning catalog, never inferred from prose. */
export type FeatureSheetRule = {
  section:
    "features" | "calculated" | "proficiencies" | "spellcasting" | "choices";
  description?: string;
  descriptionHr?: string;
  key?: string;
  notes?: string[];
  useCurrentText?: boolean;
};

export type FeatureEntry = {
  id: string;
  name: string;
  sourceType: "Race" | "Class" | "Subclass" | "Background" | "Feat" | "Other";
  sourceName: string;
  className: string;
  classLevel: number | null;
  characterLevel: number | null;
  description: string;
  uses: string;
  sourceReference?: string;
  sheet?: FeatureSheetRule;
};

export type EquipmentEntry = {
  id: string;
  name: string;
  quantity: number;
  source: string;
  characterLevel: number | null;
  className: string;
  classLevel: number | null;
  notes: string;
  catalogId?: string;
  equipped?: boolean;
  mode?: "one-handed" | "two-handed" | "thrown" | "off-hand";
};

export type AbilityScoreChoice = {
  mode: "plus2" | "split" | "feat";
  abilities: string[];
  feat: string;
};

export type AttackEntry = {
  id: string;
  name: string;
  attackBonus: string;
  damage: string;
  range: string;
  properties: string;
  ability: string;
  proficient: boolean;
  source: string;
  mode?: "one-handed" | "two-handed" | "thrown" | "off-hand";
};

export type ProficiencyEntry = {
  id: string;
  name: string;
  kind:
    | "Armor"
    | "Weapon"
    | "Tool"
    | "Vehicle"
    | "Language"
    | "Skill"
    | "Save"
    | "Other";
  source: string;
  className: string;
  classLevel: number | null;
  characterLevel: number | null;
  rank?: "expertise";
};

export type SpellSelection = {
  spellId: string;
  source: string;
  status: "known" | "prepared" | "spellbook" | "innate" | "ritual" | "arcanum";
  acquiredLevel?: number;
};

export type ResolvedSpell = SpellSelection & {
  name: string;
  definition?: SpellDefinition;
  ability: string;
  saveDC: number;
  attackBonus: number;
  uses: string;
  automatic: boolean;
  /** Calculated combat reference, including spellbook spells not prepared. */
  attack?: AttackEntry;
};

export type ValidationIssue = {
  id: string;
  severity: "error" | "warning" | "unresolved";
  stage: number;
  control: string;
  message: string;
  sourceReference?: string;
};

export type Calculation = { value: number; formula: string; sources: string[] };

export type Character = {
  version: 2;
  stage: number;
  confirmed: number[];
  visitedThrough?: number;
  identity: {
    name: string;
    player: string;
    alignment: string;
    age: string;
    height: string;
    weight: string;
    eyes: string;
    skin: string;
    hair: string;
    appearance: string;
    traits: string;
    ideal: string;
    bond: string;
    flaw: string;
    backstory: string;
    goal: string;
    allies: string;
    faction: string;
    treasure: string;
  };
  race: string;
  subrace: string;
  ancestry: string;
  raceFeat: string;
  classMode: "single" | "multi";
  classes: string[];
  level: number;
  levelPath: ClassPath;
  dmPermission: boolean;
  background: string;
  backgroundVariant: string;
  abilityMethod: "standard" | "point-buy" | "manual" | "rolled";
  baseAbilities: Record<string, number>;
  rollNotes: string;
  skills: string[];
  classSkillChoices: Record<string, string[]>;
  languages: string[];
  tools: string[];
  toolChoices: Record<string, string[]>;
  subclass: Record<string, string>;
  subclassChoices: Record<string, string[]>;
  featEnabled: boolean;
  raceFeatAbility: string;
  featOptions: Record<string, string[]>;
  equipment: string[];
  equipmentItems: EquipmentEntry[];
  attacks: AttackEntry[];
  featureEntries: FeatureEntry[];
  otherProficiencies: ProficiencyEntry[];
  spells: string[];
  notes: string;
  flexBonuses: string[];
  raceSkills: string[];
  expertiseChoices: Record<string, string[]>;
  skillReplacementChoices: Record<string, string>;
  asiChoices: Record<string, AbilityScoreChoice>;
  importedClassLevels: Record<string, number>;
  importedInitialClass: string;
  scoresAreFinal: boolean;
  xp: string;
  hpCurrent: string;
  hpTemp: string;
  acOverride: string;
  currency: Record<string, string>;
  inspiration: boolean;
  spellNotes: string;
  spellSelections: SpellSelection[];
  equippedArmor: string;
  equippedShield: boolean;
  hpRolls: Record<number, number>;
  hpMethod: "average" | "rolled";
  importedRawFields: Record<string, string>;
  importWarnings: string[];
  sheetOverrides: Record<string, string>;
  equipmentMethod: "package" | "wealth";
  startingGold: string;
};
