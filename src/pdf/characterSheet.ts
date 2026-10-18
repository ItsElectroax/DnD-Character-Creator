import {
  drawCheckMark,
  PDFCheckBox,
  PDFDocument,
  PDFField,
  PDFHexString,
  PDFName,
  PDFString,
  PDFTextField,
  rgb,
} from "pdf-lib";
import { backgrounds } from "../catalog/backgrounds";
import {
  classes,
  classProgression,
  subclassFeatureLevels,
} from "../catalog/classes";
import { findEquipment, packs } from "../catalog/equipment";
import { abilities, languages, skills } from "../catalog/proficiencies";
import { raceProfiles, races } from "../catalog/races";
import { findSpell } from "../catalog/spells";
import {
  activeEquipmentItems,
  derive,
  initialCharacter,
  validateBuild,
} from "../engine/character";
import {
  AttackEntry,
  Character,
  EquipmentEntry,
  FeatureEntry,
  ProficiencyEntry,
  ResolvedSpell,
} from "../engine/types";
import { t } from "../i18n/engine";
import "../i18n/register";
import { normalizeDraft } from "../storage/drafts";
import { loadBundledTemplate } from "../storage/templates";
import {
  ContinuationSection,
  embedCharacterFont,
  fitFormText,
  fitAcrossFormFields,
  fitFixedFormText,
  fillOriginalSpellRows,
  updateFixedTextAppearance,
  fitSingleLineText,
  fitSummaryText,
  PDFLocale,
  PDFLayoutReport,
  ReferenceEntry,
  removeGeneratedPages,
  safePDFText,
} from "./layout";
export { getSheetTemplate, storeSheetTemplate } from "../storage/templates";

const clean = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2022\u00b7]/g, "-")
    .replace(/[^\x20-\x7E\n\r\t]/g, "");
const normalize = (value: string) =>
  clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
const id = () =>
  globalThis.crypto?.randomUUID?.() ||
  `import-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const FIELD = {
  name: "CharacterName",
  player: "PlayerName",
  classLevel: "ClassLevel",
  race: "Race ",
  background: "Background",
  alignment: "Alignment",
  xp: "XP",
  str: "STR",
  dex: "DEX",
  con: "CON",
  int: "INT",
  wis: "WIS",
  cha: "CHA",
  ac: "AC",
  initiative: "Initiative",
  speed: "Speed",
  hpMax: "HPMax",
  hpCurrent: "HPCurrent",
  hpTemp: "HPTemp",
  hpDice: "HD",
  hpDiceTotal: "HDTotal",
  passive: "Passive",
  inspiration: "Inspiration",
  traits: "PersonalityTraits ",
  ideals: "Ideals",
  bonds: "Bonds",
  flaws: "Flaws",
  proficiencies: "ProficienciesLang",
  equipment: "Equipment",
  features: "Features and Traits",
  extraFeatures: "Feat+Traits",
  backstory: "Backstory",
  allies: "Allies",
  treasure: "Treasure",
  faction: "FactionName",
  age: "Age",
  height: "Height",
  weight: "Weight",
  eyes: "Eyes",
  skin: "Skin",
  hair: "Hair",
  attackNotes: "AttacksSpellcasting",
} as const;

const abilityField: Record<string, string> = {
  Strength: "STR",
  Dexterity: "DEX",
  Constitution: "CON",
  Intelligence: "INT",
  Wisdom: "WIS",
  Charisma: "CHA",
};
const abilityModField: Record<string, string> = {
  Strength: "STRmod",
  Dexterity: "DEXmod",
  Constitution: "CONmod",
  Intelligence: "INTmod",
  Wisdom: "WISmod",
  Charisma: "CHamod",
};
const saveTextField: Record<string, string> = {
  Strength: "ST Strength",
  Dexterity: "ST Dexterity",
  Constitution: "ST Constitution",
  Intelligence: "ST Intelligence",
  Wisdom: "ST Wisdom",
  Charisma: "ST Charisma",
};
const saveCheckbox: Record<string, string> = {
  Strength: "Check Box 11",
  Dexterity: "Check Box 18",
  Constitution: "Check Box 19",
  Intelligence: "Check Box 20",
  Wisdom: "Check Box 21",
  Charisma: "Check Box 22",
};
const skillField: Record<string, string> = {
  Acrobatics: "Acrobatics",
  "Animal Handling": "Animal",
  Arcana: "Arcana",
  Athletics: "Athletics",
  Deception: "Deception ",
  History: "History ",
  Insight: "Insight",
  Intimidation: "Intimidation",
  Investigation: "Investigation ",
  Medicine: "Medicine",
  Nature: "Nature",
  Perception: "Perception ",
  Performance: "Performance",
  Persuasion: "Persuasion",
  Religion: "Religion",
  "Sleight of Hand": "SleightofHand",
  Stealth: "Stealth ",
  Survival: "Survival",
};
const skillCheckbox: Record<string, string> = Object.fromEntries(
  skills.map((skill, index) => [skill, `Check Box ${23 + index}`]),
);
const attackFields = [
  { name: "Wpn Name", bonus: "Wpn1 AtkBonus", damage: "Wpn1 Damage" },
  { name: "Wpn Name 2", bonus: "Wpn2 AtkBonus ", damage: "Wpn2 Damage" },
  { name: "Wpn Name 3", bonus: "Wpn3 AtkBonus   ", damage: "Wpn3 Damage  " },
];
const currencyField: Record<string, string> = {
  CP: "CP",
  SP: "SP",
  EP: "EP",
  GP: "GP",
  PP: "PP",
};

function textField(fields: PDFField[], name: string): PDFTextField | undefined {
  const field = fields.find(
    (item) => normalize(item.getName()) === normalize(name),
  );
  return field instanceof PDFTextField ? field : undefined;
}
function checkField(fields: PDFField[], name: string): PDFCheckBox | undefined {
  const field = fields.find(
    (item) => normalize(item.getName()) === normalize(name),
  );
  return field instanceof PDFCheckBox ? field : undefined;
}
function getText(fields: PDFField[], name: string) {
  return textField(fields, name)?.getText()?.trim() || "";
}
function setChecked(fields: PDFField[], name: string, value: boolean) {
  const field = checkField(fields, name);
  if (!field) return;
  if (value) field.check();
  else field.uncheck();
}
function getChecked(fields: PDFField[], name: string) {
  return checkField(fields, name)?.isChecked() || false;
}
function normalizedNameMatch(value: string, options: string[]) {
  const key = normalize(value);
  if (!key) return undefined;
  return (
    options.find((option) => normalize(option) === key) ||
    options.find(
      (option) =>
        key.includes(normalize(option)) || normalize(option).includes(key),
    )
  );
}
function parseClassLevels(value: string) {
  const result: Record<string, number> = {};
  const source = value.replace(/&/g, " ");
  const escaped = classes
    .map((option) => option.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .sort((a, b) => b.length - a.length)
    .join("|");
  const pattern = new RegExp(
    `\\b(${escaped})\\s*(?:level\\s*)?(\\d+)\\b`,
    "gi",
  );
  for (const match of source.matchAll(pattern))
    result[
      classes.find(
        (option) => normalize(option.name) === normalize(match[1]),
      )!.name
    ] = Number(match[2]);
  return result;
}
function parseTaggedFeature(
  line: string,
  sourceType: FeatureEntry["sourceType"],
): FeatureEntry {
  const sourceReference = line.match(/\s+Source:\s*(.*)$/i)?.[1];
  if (sourceReference) line = line.replace(/\s+Source:\s*.*$/i, "");
  const match = line.match(
    /^\[(Race|Class|Subclass|Background|Feat|Other)\|([^|]*)\|CL=(\d+|-)\|LV=(\d+|-)\]\s*([^|]+?)(?:\s+-\s+(.*))?$/i,
  );
  if (match) {
    const kind = match[1] as FeatureEntry["sourceType"];
    const sourceName = match[2].trim();
    const description = match[6]?.trim() || "";
    const usesMatch = description.match(/\s*\[Uses:\s*(.*?)\]\s*$/i);
    return {
      id: id(),
      sourceType: kind,
      sourceName,
      className: ["Class", "Subclass"].includes(kind) ? sourceName : "",
      classLevel: match[3] === "-" ? null : Number(match[3]),
      characterLevel: match[4] === "-" ? null : Number(match[4]),
      name: match[5].trim(),
      description: usesMatch
        ? description.slice(0, usesMatch.index).trim()
        : description,
      uses: usesMatch?.[1] || "",
      sourceReference,
    };
  }
  const readableLevel = line.match(
    /^(.+?) level (\d+) \(character level (unknown|\d+)\)(?: \/ (.+?))? - (.*)$/i,
  );
  if (readableLevel) {
    const className =
      classes.find(
        (option) => normalize(option.name) === normalize(readableLevel[1]),
      )?.name || readableLevel[1].trim();
    const kind: FeatureEntry["sourceType"] = readableLevel[4]
      ? "Subclass"
      : "Class";
    const sourceName = readableLevel[4]?.trim() || className;
    const split = readableLevel[5].split(/\s+--\s+/);
    const name = split.shift()?.trim() || "Unnamed imported feature";
    const rawDescription = split.join(" -- ");
    const uses = rawDescription.match(/\s+Choice \/ uses:\s*([\s\S]*)$/i);
    return {
      id: id(),
      sourceType: kind,
      sourceName,
      className,
      classLevel: Number(readableLevel[2]),
      characterLevel:
        readableLevel[3] === "unknown" ? null : Number(readableLevel[3]),
      name,
      description: uses
        ? rawDescription.slice(0, uses.index).trim()
        : rawDescription,
      uses: uses?.[1] || "",
      sourceReference,
    };
  }
  const readableSource = line.match(
    /^(Race|Class|Subclass|Background|Feat|Other):\s*(.*?)\s+-\s+(.*)$/i,
  );
  if (readableSource) {
    const kind = readableSource[1] as FeatureEntry["sourceType"];
    const sourceName = readableSource[2].trim();
    const split = readableSource[3].split(/\s+--\s+/);
    const name = split.shift()?.trim() || "Unnamed imported feature";
    const rawDescription = split.join(" -- ");
    const uses = rawDescription.match(/\s+Choice \/ uses:\s*([\s\S]*)$/i);
    return {
      id: id(),
      sourceType: kind,
      sourceName,
      className: ["Class", "Subclass"].includes(kind) ? sourceName : "",
      classLevel: null,
      characterLevel: null,
      name,
      description: uses
        ? rawDescription.slice(0, uses.index).trim()
        : rawDescription,
      uses: uses?.[1] || "",
      sourceReference,
    };
  }
  return {
    id: id(),
    sourceType,
    sourceName: "Imported from fillable sheet",
    className: "",
    classLevel: null,
    characterLevel: null,
    name: line.trim(),
    description: "",
    uses: "",
  };
}
const importedFeatureAliases: Record<string, string> = {
  expertise: "Expertise",
  sneakattack: "Sneak Attack",
  thievescant: "Thieves’ Cant",
  cunningaction: "Cunning Action",
  unarmoreddefense: "Unarmored Defense",
  martialarts: "Martial Arts",
  ki: "Ki",
  flurryofblows: "Flurry of Blows",
  patientdefense: "Patient Defense",
  stepofthewind: "Step of the Wind",
  unarmoredmovement: "Unarmored Movement",
  deflectmissiles: "Deflect Missiles",
  slowfall: "Slow Fall",
  extraattack: "Extra Attack",
  dodatninapad: "Extra Attack",
  stunningstrike: "Stunning Strike",
  kiempoweredstrikes: "Ki-Empowered Strikes",
  evasion: "Evasion",
  stillnessofmind: "Stillness of Mind",
  abilityscoreimprovement: "Ability Score Improvement",
  openhandtechnique: "Open Hand Technique",
  wholenessofbody: "Wholeness of Body",
  tamnovidnost: "Darkvision (60 ft.)",
  patuljackaotpornost: "Dwarven Resilience",
  patuljackaborbenobuka: "Dwarven Combat Training",
  patuljackaborbenaobuka: "Dwarven Combat Training",
  vjestinasalatom: "Tool Proficiency",
  poznavanjekamena: "Stonecunning",
  patuljackazilavost: "Dwarven Toughness",
  obranabezoklopa: "Unarmored Defense",
  borilackevjestine: "Martial Arts",
  barazudaraca: "Flurry of Blows",
  strpljivaobrana: "Patient Defense",
  korakvjetra: "Step of the Wind",
  kretanjebezoklopa: "Unarmored Movement",
  odbijanjeprojektila: "Deflect Missiles",
  sporipad: "Slow Fall",
  zapanjujuciudarac: "Stunning Strike",
  udarciprozetikijem: "Ki-Empowered Strikes",
  smirenostiuma: "Stillness of Mind",
  smirenostuma: "Stillness of Mind",
  povecanjeosobina: "Ability Score Improvement",
  izbjegavanje: "Evasion",
  tehnikatvorenesake: "Open Hand Technique",
  tehnikaotvorenesake: "Open Hand Technique",
  cjelovitosttijela: "Wholeness of Body",
};
function canonicalFeatureName(value: string) {
  const raw = value.replace(/\s*\([^)]*\)\s*$/, "").trim();
  return importedFeatureAliases[normalize(raw.replace(/[’']/g, ""))] || raw;
}
function parseFeatureSectionLines(
  rawLines: string[],
  character: Character,
): FeatureEntry[] {
  let currentClass = "";
  let sectionLevel = 0;
  let inRaceSection = false;
  const result: FeatureEntry[] = [];
  const classPattern = classes
    .map((item) => item.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  for (const raw of rawLines) {
    if (
      /^\[(?:Race|Class|Subclass|Background|Feat|Other)\||^(?:Race|Class|Subclass|Background|Feat|Other):\s*.*\s+-\s+|^.+ level \d+ \(character level /i.test(
        raw,
      )
    ) {
      result.push(parseTaggedFeature(raw, "Other"));
      continue;
    }
    const header = raw.match(
      new RegExp(
        `(?:^|[—–-])\\s*(${classPattern})\\s*(?:level\\s*)?(\\d+)\\s*$`,
        "i",
      ),
    );
    if (header) {
      currentClass =
        classes.find((item) => normalize(item.name) === normalize(header[1]))
          ?.name || header[1];
      sectionLevel = Number(header[2]);
      inRaceSection = false;
      continue;
    }
    if (
      /^(?:PATULJAK|PATULJACKA|DWARF|RACE|RACIAL TRAITS)\b/i.test(raw.trim())
    ) {
      currentClass = "";
      sectionLevel = 0;
      inRaceSection = true;
      continue;
    }
    const line = raw.replace(/^[\s•*-]+/, "").trim();
    if (!line || /^x+$/i.test(line)) continue;
    if (!line.includes(":") && line === line.toUpperCase()) continue;
    const parts = line.split(/:(.*)/s);
    let rawName = canonicalFeatureName(parts[0].trim());
    let description = (parts[1] || "").trim();
    if (inRaceSection && !description) {
      const key = normalize(line);
      const alias = Object.entries(importedFeatureAliases)
        .filter(([name]) => key.startsWith(name))
        .sort((a, b) => b[0].length - a[0].length)[0];
      if (alias) {
        rawName = alias[1];
        description = line
          .replace(/^\S+\s*/, "")
          .replace(/[.!]+$/, "")
          .trim();
      }
    }
    if (inRaceSection) {
      const racialRows =
        raceProfiles[character.race]?.traits.concat(
          ...Object.values(raceProfiles[character.race]?.subraceTraits || {}),
        ) || [];
      const trait = racialRows.find(
        (item) => normalize(item.name) === normalize(rawName),
      );
      if (trait) {
        result.push({
          id: id(),
          sourceType: "Race",
          sourceName: character.subrace || character.race,
          className: "",
          classLevel: null,
          characterLevel: 1,
          name: trait.name,
          description: description || line,
          uses: "",
          sourceReference: "PHB 2014, chapter 2",
        });
        continue;
      }
      result.push({
        id: id(),
        sourceType: "Race",
        sourceName: character.subrace || character.race,
        className: "",
        classLevel: null,
        characterLevel: 1,
        name: rawName,
        description,
        uses: "",
        sourceReference: "Imported racial trait; verify PHB 2014, chapter 2",
      });
      continue;
    }
    if (!rawName || !description) {
      result.push(parseTaggedFeature(line, "Other"));
      continue;
    }
    if (!currentClass || !sectionLevel) {
      result.push(parseTaggedFeature(line, "Other"));
      continue;
    }
    const nameKey = normalize(rawName);
    const subclass = character.subclass[currentClass] || "";
    const subclassMatch = Object.entries(subclassFeatureLevels[subclass] || {})
      .flatMap(([level, names]) =>
        names.map((feature) => ({ level: Number(level), feature })),
      )
      .find(
        (item) =>
          item.level <= sectionLevel && normalize(item.feature) === nameKey,
      );
    const coreRows =
      classProgression[currentClass]?.levels.slice(0, sectionLevel) || [];
    const coreMatch = coreRows
      .flatMap((row) =>
        row.features.map((feature) => ({
          level: row.level,
          feature: feature.name,
        })),
      )
      .find((item) => normalize(item.feature) === nameKey);
    const monkKiOption =
      currentClass === "Monk" &&
      ["Flurry of Blows", "Patient Defense", "Step of the Wind"].some(
        (feature) => normalize(feature) === nameKey,
      )
        ? 2
        : 0;
    const unlock = subclassMatch?.level || coreMatch?.level || monkKiOption;
    if (!unlock) {
      result.push({
        id: id(),
        sourceType: "Other",
        sourceName: `Imported from ${currentClass} level ${sectionLevel}`,
        className: "",
        classLevel: null,
        characterLevel: null,
        name: rawName,
        description,
        uses: "",
      });
      continue;
    }
    const sourceType: FeatureEntry["sourceType"] = subclassMatch
      ? "Subclass"
      : "Class";
    const sourceName = subclassMatch ? subclass : currentClass;
    if (rawName === "Ability Score Improvement") {
      const asi = description.match(
        /\+2\s+(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma|STR|DEX|CON|INT|WIS|CHA)/i,
      );
      const abilityNames: Record<string, string> = {
        str: "Strength",
        dex: "Dexterity",
        con: "Constitution",
        int: "Intelligence",
        wis: "Wisdom",
        cha: "Charisma",
      };
      if (asi) {
        const choice = abilityNames[asi[1].toLowerCase()] || asi[1];
        character.asiChoices[`${currentClass}:${unlock}`] = {
          mode: "plus2",
          abilities: [choice],
          feat: "",
        };
      }
    }
    result.push({
      id: id(),
      sourceType,
      sourceName,
      className: currentClass,
      classLevel: unlock,
      characterLevel: character.classMode === "single" ? unlock : null,
      name: rawName,
      description,
      uses: "",
    });
  }
  return result;
}
function parseEquipment(line: string): EquipmentEntry {
  const match = line.match(
    /^\[Q=(\d+)\|SRC=([^|]*)\|CLASS=([^|]*)\|CL=(\d+|-)\|LV=(\d+|-)\]\s*([^|]+?)(?:\s+-\s+(.*))?$/i,
  );
  if (!match)
    return {
      id: id(),
      name: line.trim(),
      quantity: 1,
      source: "Imported from fillable sheet",
      characterLevel: null,
      className: "",
      classLevel: null,
      notes: "",
    };
  return {
    id: id(),
    quantity: Number(match[1]),
    source: match[2].trim(),
    className: match[3].trim(),
    classLevel: match[4] === "-" ? null : Number(match[4]),
    characterLevel: match[5] === "-" ? null : Number(match[5]),
    name: match[6].trim(),
    notes: match[7]?.trim() || "",
  };
}
function parseProficiency(line: string): ProficiencyEntry {
  const match = line.match(
    /^\[(KIND=[^|]*)\|SRC=([^|]*)\|CLASS=([^|]*)\|CL=(\d+|-)\|LV=(\d+|-)\]\s*(.*)$/i,
  );
  if (!match)
    return {
      id: id(),
      name: line.trim(),
      kind: "Other",
      source: "Imported from fillable sheet",
      className: "",
      classLevel: null,
      characterLevel: null,
    };
  const kindText = match[1].slice(5).trim();
  const kinds: ProficiencyEntry["kind"][] = [
    "Armor",
    "Weapon",
    "Tool",
    "Vehicle",
    "Language",
    "Skill",
    "Save",
    "Other",
  ];
  const kind =
    kinds.find((item) => item.toLowerCase() === kindText.toLowerCase()) ||
    "Other";
  return {
    id: id(),
    kind,
    source: match[2].trim(),
    className: match[3].trim(),
    classLevel: match[4] === "-" ? null : Number(match[4]),
    characterLevel: match[5] === "-" ? null : Number(match[5]),
    name: match[6].trim(),
  };
}
function lines(value: string) {
  return value
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);
}
function textToProficiencies(value: string) {
  return value
    .split(/[\n,;]+/)
    .map((x) => x.trim())
    .filter(Boolean);
}
const proficiencyAliases: Record<string, string> = {
  zajednicki: "Common",
  patuljacki: "Dwarvish",
  vilinski: "Elvish",
  jednostavnaoruzja: "Simple weapons",
  kratkimacevi: "Shortswords",
  bojnasjekira: "Battleaxe",
  rucnasjekira: "Handaxe",
  lakicekic: "Light hammer",
  ratnicekic: "Warhammer",
  zidarskialat: "Mason's tools",
  stolarskialat: "Carpenter's tools",
  priborzaprerusavanje: "Disguise kit",
  lopovskialat: "Thieves' tools",
  landvehicles: "Vehicles (land)",
};
function categorizedProficiencies(value: string): ProficiencyEntry[] {
  const result: ProficiencyEntry[] = [];
  let kind: ProficiencyEntry["kind"] = "Other";
  const categories: [RegExp, ProficiencyEntry["kind"]][] = [
    [/^(?:armor(?: proficiencies)?|oklop)\s*:/i, "Armor"],
    [/^(?:weapons?(?: proficiencies)?|oruzja)\s*:/i, "Weapon"],
    [/^(?:tools?(?: proficiencies)?|alati)\s*:/i, "Tool"],
    [/^(?:languages?|jezici)\s*:/i, "Language"],
    [/^(?:skills?|vjestine)\s*:/i, "Skill"],
    [/^(?:vehicles?|vozila)\s*:/i, "Vehicle"],
  ];
  for (let raw of lines(value)) {
    if (/^x+$/i.test(raw)) continue;
    if (/^\[KIND=/i.test(raw)) {
      result.push(parseProficiency(raw));
      continue;
    }
    const ascii = clean(raw);
    const heading = categories.find(([pattern]) => pattern.test(ascii));
    if (heading) {
      kind = heading[1];
      raw = raw.slice(raw.indexOf(":") + 1).trim();
      if (!raw) continue;
    }
    if (/^(?:note|napomena)\s*:/i.test(clean(raw))) {
      result.push({
        id: id(),
        kind: "Other",
        name: raw,
        source: "Imported note",
        className: "",
        classLevel: null,
        characterLevel: null,
      });
      continue;
    }
    for (const item of textToProficiencies(raw)) {
      const name = item
        .replace(/^[-•*]\s*/, "")
        .replace(/\.$/, "")
        .trim();
      if (!name || /^(?:none|nema|no armor)$/i.test(name)) continue;
      const canonical = proficiencyAliases[normalize(name)] || name;
      const language = languages.find(
        (option) => normalize(option) === normalize(canonical),
      );
      const skill = skills.find(
        (option) => normalize(option) === normalize(canonical),
      );
      result.push({
        id: id(),
        name: language || skill || canonical,
        kind: language ? "Language" : skill ? "Skill" : kind,
        source: "Imported proficiency (source not recorded on PDF)",
        className: "",
        classLevel: null,
        characterLevel: null,
      });
    }
  }
  return result;
}

const attackAliases: Record<string, string> = {
  nenaoruzaniudarac: "Unarmed Strike",
  napadnenaoruzanimudarcem: "Unarmed Strike",
  kratkimac: "Shortsword",
  strelica: "Dart",
};
function externalAttack(
  name: string,
  attackBonus: string,
  damage: string,
  source: string,
): AttackEntry | undefined {
  name = name.trim();
  attackBonus = attackBonus.trim().replace(/−/g, "-");
  damage = damage.trim();
  if (
    !name ||
    /^(?:spells?|spellcasting|carolije|napomena|note|sneak attack)$/i.test(
      clean(name),
    )
  )
    return undefined;
  if (
    !/^[+-]?\d+$/.test(attackBonus) ||
    !/\b(?:\d+d\d+|\d+\s+(?:bludge|pierc|slash|tupa|prob|steta))/i.test(
      clean(damage),
    )
  )
    return undefined;
  return {
    id: id(),
    name: attackAliases[normalize(name)] || name,
    attackBonus,
    damage,
    range: "",
    properties: "",
    ability: "",
    proficient: false,
    source,
  };
}

export type PDFFieldValue = string | boolean;
export type PDFFieldConflict = {
  field: string;
  label: string;
  baseline: PDFFieldValue;
  current: PDFFieldValue;
  kind: "mechanical";
  attackId?: string;
};
export type PDFTemplateInfo = {
  supported: boolean;
  fieldCount: number;
  pageCount: number;
  hasSpellPage: boolean;
  missingFields: string[];
};
export type PDFImport = {
  character: Character;
  warnings: string[];
  rawFields: Record<string, PDFFieldValue>;
  conflicts: PDFFieldConflict[];
  fromAppExport: boolean;
  template: PDFTemplateInfo;
};
const payloadKey = PDFName.of("DnDCreatorPayload");
function fieldValues(fields: PDFField[]): Record<string, PDFFieldValue> {
  return Object.fromEntries(
    fields
      .filter(
        (field) =>
          field instanceof PDFTextField || field instanceof PDFCheckBox,
      )
      .map((field) => [
        field.getName(),
        field instanceof PDFTextField
          ? field.getText() || ""
          : (field as PDFCheckBox).isChecked(),
      ]),
  );
}
function templateInfo(pdf: PDFDocument, fields: PDFField[]): PDFTemplateInfo {
  const missingFields = [
    FIELD.name,
    FIELD.classLevel,
    "ProfBonus",
    FIELD.features,
    FIELD.equipment,
  ].filter((name) => !textField(fields, name));
  return {
    supported: Boolean(
      textField(fields, FIELD.name) && textField(fields, FIELD.classLevel),
    ),
    fieldCount: fields.length,
    pageCount: pdf.getPageCount(),
    hasSpellPage: Boolean(textField(fields, "Spellcasting Class 2")),
    missingFields,
  };
}
export async function inspectSheetTemplate(
  bytes: Uint8Array,
): Promise<PDFTemplateInfo> {
  const pdf = await PDFDocument.load(bytes);
  return templateInfo(pdf, pdf.getForm().getFields());
}
const identityFields: Record<string, string> = {
  [FIELD.name]: "name",
  "CharacterName 2": "name",
  [FIELD.player]: "player",
  [FIELD.alignment]: "alignment",
  [FIELD.traits]: "traits",
  [FIELD.ideals]: "ideal",
  [FIELD.bonds]: "bond",
  [FIELD.flaws]: "flaw",
  [FIELD.age]: "age",
  [FIELD.height]: "height",
  [FIELD.weight]: "weight",
  [FIELD.eyes]: "eyes",
  [FIELD.skin]: "skin",
  [FIELD.hair]: "hair",
  [FIELD.backstory]: "backstory",
  [FIELD.allies]: "allies",
  [FIELD.faction]: "faction",
  [FIELD.treasure]: "treasure",
  CharacterAppearance: "appearance",
};
function preserveOverflowNarrative(
  original: string,
  baseline: string,
  edited: string,
): string {
  const marker = /(?:\n|^)(?:Pg|Str)\.\s*\d+\s*→\s*$/;
  if (!marker.test(baseline)) return edited;
  const preview = baseline.replace(marker, "").trim();
  const replacement = edited.replace(marker, "").trim();
  if (!preview || !replacement) return edited;
  const pattern = preview
    .split(/\s+/)
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("\\s+");
  const match = original.match(new RegExp(`^${pattern}`));
  if (!match) return edited;
  const before = preview.replace(/\s+/g, " ");
  const after = replacement.replace(/\s+/g, " ");
  let prefix = 0;
  while (
    prefix < before.length &&
    prefix < after.length &&
    before[prefix] === after[prefix]
  )
    prefix++;
  let suffix = 0;
  while (
    suffix < before.length - prefix &&
    suffix < after.length - prefix &&
    before[before.length - 1 - suffix] === after[after.length - 1 - suffix]
  )
    suffix++;
  const map: number[] = [];
  for (const token of match[0].matchAll(/\s+|\S/g)) {
    if (/\s/.test(token[0])) map.push(token.index!);
    else map.push(token.index!);
  }
  map.push(match[0].length);
  return (
    original.slice(0, map[prefix]) +
    after.slice(prefix, after.length - suffix) +
    original.slice(map[before.length - suffix])
  );
}

export async function importFillableSheet(
  bytes: Uint8Array,
): Promise<PDFImport> {
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: false });
  const form = pdf.getForm();
  const fields = form.getFields();
  const rawFields = fieldValues(fields);
  const template = templateInfo(pdf, fields);
  if (!fields.length)
    throw new Error(
      "This PDF has no fillable form fields. Choose the 2014 fillable character sheet.",
    );
  if (
    !fields.some(
      (field) => normalize(field.getName()) === normalize(FIELD.name),
    ) ||
    !fields.some(
      (field) => normalize(field.getName()) === normalize(FIELD.classLevel),
    )
  )
    throw new Error(
      "This fillable PDF is not the supported 2014 D&D character sheet. Use the attached 5E_CharacterSheet_Fillable.pdf.",
    );
  const encoded = pdf.catalog.get(payloadKey);
  if (encoded instanceof PDFString || encoded instanceof PDFHexString) {
    try {
      const payload: unknown = JSON.parse(encoded.decodeText());
      if (
        !payload ||
        typeof payload !== "object" ||
        (payload as { format?: unknown }).format !== "dnd-2014-character" ||
        (payload as { version?: unknown }).version !== 2
      )
        throw new Error("Unsupported embedded character payload.");
      const saved = payload as {
        character: unknown;
        baseline?: Record<string, PDFFieldValue>;
        attackRows?: unknown;
      };
      const restored = normalizeDraft(saved.character);
      if (!saved.baseline || typeof saved.baseline !== "object")
        throw new Error("The embedded PDF baseline is missing.");
      const conflicts: PDFFieldConflict[] = [];
      const warnings: string[] = [];
      const edits: Record<string, string> = {};
      for (const [field, current] of Object.entries(rawFields)) {
        if (!(field in saved.baseline) || current === saved.baseline[field])
          continue;
        const identityKey = Object.entries(identityFields).find(
          ([key]) => normalize(key) === normalize(field),
        )?.[1];
        if (identityKey && typeof current === "string") {
          // A changed continuation marker must not erase the full embedded narrative.
          if (
            /^(?:Continued: page|Nastavak: str\.|(?:Pg|Str)\.\s*\d+\s*→)$/i.test(
              current,
            )
          )
            continue;
          if (
            edits[identityKey] !== undefined &&
            edits[identityKey] !== current
          ) {
            warnings.push(
              `Repeated ${identityKey} fields differ; the edited first value is preserved for review.`,
            );
            continue;
          }
          const identity = restored.identity as unknown as Record<
            string,
            string
          >;
          const value = preserveOverflowNarrative(
            identity[identityKey] || "",
            String(saved.baseline[field]),
            current,
          );
          edits[identityKey] = value;
          identity[identityKey] = value;
        } else if (
          field === FIELD.xp ||
          field === FIELD.hpCurrent ||
          field === FIELD.hpTemp ||
          Object.values(currencyField).includes(field)
        ) {
          if (typeof current === "string") {
            if (field === FIELD.xp) restored.xp = current;
            else if (field === FIELD.hpCurrent) restored.hpCurrent = current;
            else if (field === FIELD.hpTemp) restored.hpTemp = current;
            else restored.currency[field] = current;
          }
        } else {
          const attackRow = attackFields.findIndex((row) =>
            Object.values(row).includes(field),
          );
          conflicts.push({
            field,
            label: field,
            baseline: saved.baseline[field],
            current,
            kind: "mechanical",
            ...(attackRow >= 0 && Array.isArray(saved.attackRows)
              ? {
                  attackId:
                    typeof saved.attackRows[attackRow] === "string"
                      ? saved.attackRows[attackRow]
                      : "",
                }
              : {}),
          });
        }
      }
      if (conflicts.length)
        warnings.push(
          `${conflicts.length} mechanical PDF field edit(s) differ from the exported build. The complete build is restored; review those edits before applying overrides.`,
        );
      return {
        character: restored,
        warnings,
        rawFields,
        conflicts,
        fromAppExport: true,
        template,
      };
    } catch (error) {
      // An invalid payload never bypasses normal import validation.
      throw new Error(
        `This app-generated PDF has invalid embedded character data: ${error instanceof Error ? error.message : "unknown error"}. Import the original character JSON or an unmodified sheet.`,
      );
    }
  }
  const c = initialCharacter();
  const warnings: string[] = [];
  const classText = getText(fields, FIELD.classLevel);
  const classLevels = parseClassLevels(classText);
  c.importedClassLevels = classLevels;
  c.classes = Object.keys(classLevels);
  c.level = Math.max(
    1,
    Math.min(
      20,
      Object.values(classLevels).reduce((a, b) => a + b, 0) ||
        Number(classText.match(/\d+/)?.[0] || 1),
    ),
  );
  c.classMode = c.classes.length > 1 ? "multi" : "single";
  c.importedInitialClass = c.classes[0] || "";
  if (c.classMode === "single" && c.classes[0]) c.classes = [c.classes[0]];
  if (c.classMode === "multi") {
    c.levelPath = Object.fromEntries(
      Array.from({ length: c.level }, (_, i) => [i + 1, ""]),
    );
    warnings.push(
      "The standard sheet stores class totals but not the chronological multiclass level path. Enter the class gained at each character level before validation.",
    );
  }
  if (!c.classes.length && classText)
    warnings.push(
      `Could not read a class split from "${classText}"; choose a class manually.`,
    );
  const raceText = getText(fields, FIELD.race);
  c.race =
    normalizedNameMatch(
      raceText,
      races.map((x) => x.name),
    ) || "";
  if (!c.race && normalize(raceText).includes("patuljak")) c.race = "Dwarf";
  const family = races.find((x) => x.name === c.race);
  c.subrace =
    family?.subraces.find((x) =>
      normalize(raceText).includes(normalize(x.name)),
    )?.name || "";
  if (c.race === "Dwarf" && normalize(raceText).includes("brdski"))
    c.subrace = "Hill Dwarf";
  if (c.race === "Human" && normalize(raceText).includes("variant"))
    c.subrace = "Variant Human (PHB optional)";
  if (!c.race && raceText)
    warnings.push(`Could not match race "${raceText}" to a PHB race family.`);
  const bgText = getText(fields, FIELD.background);
  c.background =
    normalizedNameMatch(
      bgText,
      backgrounds.map((x) => x.name),
    ) || "";
  if (!c.background && normalize(bgText) === "ulicar") c.background = "Urchin";
  if (!c.background && bgText)
    warnings.push(
      `Could not match background "${bgText}" to a PHB background.`,
    );
  c.identity.name = getText(fields, FIELD.name);
  c.identity.player = getText(fields, FIELD.player);
  c.identity.alignment = getText(fields, FIELD.alignment);
  c.identity.traits = getText(fields, FIELD.traits);
  c.identity.ideal = getText(fields, FIELD.ideals);
  c.identity.bond = getText(fields, FIELD.bonds);
  c.identity.flaw = getText(fields, FIELD.flaws);
  c.identity.age = getText(fields, FIELD.age);
  c.identity.height = getText(fields, FIELD.height);
  c.identity.weight = getText(fields, FIELD.weight);
  c.identity.eyes = getText(fields, FIELD.eyes);
  c.identity.skin = getText(fields, FIELD.skin);
  c.identity.hair = getText(fields, FIELD.hair);
  const rawBackstory = getText(fields, FIELD.backstory);
  const appearanceMatch = rawBackstory.match(
    /\[Appearance notes\]\r?\n([\s\S]*?)\r?\n\[\/Appearance notes\]/,
  );
  c.identity.appearance = appearanceMatch?.[1] || "";
  c.identity.backstory = appearanceMatch
    ? rawBackstory.replace(appearanceMatch[0], "").trim()
    : rawBackstory;
  Object.assign(c.identity, {
    allies: getText(fields, FIELD.allies),
    faction: getText(fields, FIELD.faction),
    treasure: getText(fields, FIELD.treasure),
  });
  c.identity.appearance ||= getText(fields, "CharacterAppearance");
  c.xp = getText(fields, FIELD.xp);
  c.hpCurrent = getText(fields, FIELD.hpCurrent);
  c.hpTemp = getText(fields, FIELD.hpTemp);
  c.acOverride = getText(fields, FIELD.ac);
  c.inspiration = !["", "no", "false", "0"].includes(
    getText(fields, FIELD.inspiration).toLowerCase(),
  );
  c.currency = Object.fromEntries(
    Object.entries(currencyField).map(([coin, field]) => [
      coin,
      getText(fields, field),
    ]),
  );
  c.scoresAreFinal = true;
  const abilityFields: Record<string, string> = {
    Strength: FIELD.str,
    Dexterity: FIELD.dex,
    Constitution: FIELD.con,
    Intelligence: FIELD.int,
    Wisdom: FIELD.wis,
    Charisma: FIELD.cha,
  };
  c.baseAbilities = Object.fromEntries(
    abilities.map((ability) => [
      ability,
      Number(getText(fields, abilityFields[ability])) || 0,
    ]),
  );
  c.abilityMethod = "manual";
  for (const ability of abilities)
    if (!getText(fields, abilityFields[ability]))
      warnings.push(`Ability score ${ability} was blank in the PDF.`);

  for (const item of categorizedProficiencies(
    getText(fields, FIELD.proficiencies),
  )) {
    c.otherProficiencies.push(item);
    if (
      item.kind === "Language" &&
      languages.includes(item.name) &&
      item.name !== "Common" &&
      !(raceProfiles[c.race]?.languages || []).includes(item.name)
    )
      c.languages.push(item.name);
  }
  const importedSkills = skills.filter((skill) =>
    getChecked(fields, skillCheckbox[skill]),
  );
  for (const skill of importedSkills)
    if (
      !c.otherProficiencies.some(
        (item) => item.kind === "Skill" && item.name === skill,
      )
    )
      c.otherProficiencies.push({
        id: id(),
        name: skill,
        kind: "Skill",
        source: "Imported proficiency (source not recorded on PDF)",
        className: "",
        classLevel: null,
        characterLevel: null,
      });
  for (const ability of abilities)
    if (
      getChecked(fields, saveCheckbox[ability]) &&
      !c.otherProficiencies.some(
        (item) => item.kind === "Save" && item.name === ability,
      )
    )
      c.otherProficiencies.push({
        id: id(),
        name: ability,
        kind: "Save",
        source: "Imported saving throw proficiency",
        className: "",
        classLevel: null,
        characterLevel: null,
      });

  const featureLines = [
    ...lines(getText(fields, FIELD.features)),
    ...lines(getText(fields, FIELD.extraFeatures)),
  ];
  const featureText = featureLines.join(" ");
  for (const option of classes) {
    const found = option.subclasses.find((sub) =>
      normalize(featureText).includes(normalize(sub)),
    );
    if (found && c.classes.includes(option.name))
      c.subclass[option.name] = found;
  }
  if (
    normalize(featureText).includes("putotvorenesake") &&
    c.classes.includes("Monk")
  )
    c.subclass.Monk = "Way of the Open Hand";
  if (!c.race && normalize(featureText).includes("patuljak")) {
    c.race = "Dwarf";
    c.subrace = normalize(featureText).includes("brdski") ? "Hill Dwarf" : "";
  }
  c.featureEntries = parseFeatureSectionLines(featureLines, c);
  const expertiseNames = [
    getText(fields, FIELD.features),
    getText(fields, FIELD.extraFeatures),
  ]
    .join("\n")
    .matchAll(/Expertise(?:\s+recorded)?\s*:\s*([^;\r\n]+)/gi);
  const parsedExpertise = [...expertiseNames].flatMap((match) =>
    match[1]
      .replace(/\s+and\s+/gi, ",")
      .split(",")
      .map((value) => normalizedNameMatch(value.trim(), skills))
      .filter((value): value is string => Boolean(value)),
  );
  if (classLevels.Rogue && parsedExpertise.length)
    c.expertiseChoices["Rogue:1"] = [...new Set(parsedExpertise)].slice(0, 2);
  else if ((classLevels.Bard || 0) >= 3 && parsedExpertise.length)
    c.expertiseChoices["Bard:3"] = [...new Set(parsedExpertise)].slice(0, 2);
  if (parsedExpertise.length > 2)
    warnings.push(
      "The imported Expertise text lists more than two choices; verify which class-level Expertise feature granted each one.",
    );
  const equipmentText = lines(getText(fields, FIELD.equipment));
  c.equipmentItems = equipmentText.map(parseEquipment);
  c.notes = "";
  c.attacks = attackFields.flatMap((row, index) => {
    const item = externalAttack(
      getText(fields, row.name),
      getText(fields, row.bonus),
      getText(fields, row.damage),
      `Imported attack row ${index + 1}; explicit values`,
    );
    return item ? [item] : [];
  });
  const rawAttackNotes = getText(fields, FIELD.attackNotes);
  for (const [index, line] of lines(rawAttackNotes).entries()) {
    if (/^x+$/i.test(line)) continue;
    if (/^(?:Spellcasting|Spells chosen|Čarolije)\s*:/i.test(line)) {
      c.spellNotes = [c.spellNotes, line].filter(Boolean).join("\n");
      continue;
    }
    const pipe = line.split(/\s*\|\s*/);
    const colon = line.match(/^([^:]+):\s*([+-]?\d+)\s*[,;]\s*(.*)$/);
    const item =
      pipe.length >= 3
        ? externalAttack(
            pipe[0],
            pipe[1],
            pipe.slice(2).join("; "),
            `Imported attack notes row ${index + 1}; explicit values`,
          )
        : colon
          ? externalAttack(
              colon[1],
              colon[2],
              colon[3],
              `Imported attack notes row ${index + 1}; explicit values`,
            )
          : undefined;
    if (
      item &&
      !c.attacks.some(
        (existing) => normalize(existing.name) === normalize(item.name),
      )
    )
      c.attacks.push(item);
    else if (!item)
      c.spellNotes = [c.spellNotes, line].filter(Boolean).join("\n");
  }
  const spellFields = fields.filter(
    (field) =>
      field instanceof PDFTextField && /^Spells /i.test(field.getName()),
  );
  c.spells = [
    ...new Set(
      spellFields
        .map((field) => (field as PDFTextField).getText()?.trim() || "")
        .filter(Boolean),
    ),
  ];
  if (c.spells.length)
    warnings.push(
      "Imported spell names are preserved, but this PDF does not identify each spell's class, acquisition level, or known/prepared status. Assign those sources before validation.",
    );
  Object.assign(c, {
    importedRawFields: Object.fromEntries(
      Object.entries(rawFields).map(([key, value]) => [key, String(value)]),
    ),
  });
  c.stage = 0;
  c.confirmed = [];
  if (c.scoresAreFinal)
    warnings.push(
      "The PDF stores final ability scores but not the pre-ancestry scores. Scores are preserved as entered; changing ancestry may require a manual score audit.",
    );
  if (
    c.otherProficiencies.some((x) => x.source.includes("not recorded on PDF"))
  )
    warnings.push(
      "The PDF does not label the source of skill and save proficiencies. Imported proficiency source tags are marked unknown where needed.",
    );
  const calculated = derive(c);
  const numericFields: Record<string, number> = {
    [FIELD.hpMax]: calculated.hp,
    [FIELD.initiative]: calculated.initiative,
    [FIELD.speed]: calculated.speed,
    [FIELD.passive]: calculated.passivePerception,
    ProfBonus: calculated.proficiency,
    ...Object.fromEntries(
      abilities.map((name) => [saveTextField[name], calculated.saves[name]]),
    ),
    ...Object.fromEntries(
      skills.map((name) => [skillField[name], calculated.skillBonuses[name]]),
    ),
  };
  const conflicts: PDFFieldConflict[] = [];
  for (const [field, expected] of Object.entries(numericFields)) {
    const current = getText(fields, field);
    const value = Number(
      current
        .replace(/−/g, "-")
        .replace(/\s*ft\.?$/i, "")
        .trim(),
    );
    if (current && Number.isFinite(value) && value !== expected)
      conflicts.push({
        field,
        label: field,
        baseline: String(expected),
        current,
        kind: "mechanical",
      });
  }
  if (conflicts.length)
    warnings.push(
      `${conflicts.length} values on the external PDF differ from the calculated build. Preserve selected values as explicit overrides or review the missing character decisions.`,
    );
  c.importWarnings = [...warnings];
  return {
    character: c,
    warnings,
    rawFields,
    conflicts,
    fromAppExport: false,
    template,
  };
}

/** Accept only reviewed visible edits; preserve the complete class path and all automatic choices. */
export function resolvePDFImport(
  result: PDFImport,
  acceptedFields: string[] = [],
): Character {
  const character = normalizeDraft(result.character);
  const accepted = new Set(acceptedFields);
  const values = result.rawFields;
  const mutable = character as Character & {
    sheetOverrides: Record<string, string>;
    importedRawFields: Record<string, string>;
    importWarnings?: string[];
  };
  mutable.sheetOverrides ||= {};
  mutable.importedRawFields = Object.fromEntries(
    Object.entries(values).map(([field, value]) => [field, String(value)]),
  );
  const numeric: Record<string, string> = {
    [FIELD.hpMax]: "hp",
    [FIELD.speed]: "speed",
    [FIELD.initiative]: "initiative",
    [FIELD.passive]: "passivePerception",
    ProfBonus: "proficiency",
    ...Object.fromEntries(
      Object.entries(saveTextField).map(([name, field]) => [
        field,
        `save:${name}`,
      ]),
    ),
    ...Object.fromEntries(
      Object.entries(skillField).map(([name, field]) => [
        field,
        `skill:${name}`,
      ]),
    ),
  };
  const numericValue = (value: PDFFieldValue) =>
    typeof value === "string"
      ? Number(
          value
            .replace(/−/g, "-")
            .replace(/\s*(?:ft\.?|m)$/i, "")
            .trim(),
        )
      : NaN;
  const attacks = derive(character).attacks;
  for (const conflict of result.conflicts) {
    if (!accepted.has(conflict.field)) continue;
    const name = conflict.field;
    const normalized = normalize(name);
    const score = Object.entries(abilityField).find(
      ([, field]) => normalize(field) === normalized,
    )?.[0];
    const number = numericValue(conflict.current);
    if (score && Number.isFinite(number) && number >= 1 && number <= 30) {
      if (!character.scoresAreFinal)
        character.baseAbilities = { ...derive(character).abilities };
      character.scoresAreFinal = true;
      character.baseAbilities[score] = number;
    } else if (normalized === normalize(FIELD.ac) && Number.isFinite(number))
      character.acOverride = String(number);
    else if (
      Object.keys(numeric).some((field) => normalize(field) === normalized) &&
      Number.isFinite(number)
    ) {
      const key = Object.entries(numeric).find(
        ([field]) => normalize(field) === normalized,
      )![1];
      mutable.sheetOverrides[key] = String(number);
    } else if (
      typeof conflict.current === "boolean" &&
      [...Object.values(saveCheckbox), ...Object.values(skillCheckbox)].some(
        (field) => normalize(field) === normalized,
      )
    ) {
      const save = Object.entries(saveCheckbox).find(
        ([, field]) => normalize(field) === normalized,
      )?.[0];
      const skill = Object.entries(skillCheckbox).find(
        ([, field]) => normalize(field) === normalized,
      )?.[0];
      mutable.sheetOverrides[
        `proficiency:${save ? "Save" : "Skill"}:${save || skill}`
      ] = conflict.current ? "1" : "0";
    } else {
      const row = attackFields.findIndex((fields) =>
        Object.values(fields).some((field) => normalize(field) === normalized),
      );
      const original =
        conflict.attackId === undefined
          ? attacks[row]
          : attacks.find((attack) => attack.id === conflict.attackId);
      if (row >= 0 && original) {
        const existing = character.attacks.find(
          (item) =>
            item.id === original.id ||
            normalize(item.name) === normalize(original.name),
        );
        const item: AttackEntry = existing || {
          id: original.id,
          name: original.name,
          attackBonus: "",
          damage: "",
          range: "",
          properties: "",
          ability: "",
          proficient: false,
          mode: original.mode,
          source: `PDF override of ${original.source}`,
        };
        const column = Object.entries(attackFields[row]).find(
          ([, field]) => normalize(field) === normalized,
        )?.[0];
        if (column === "name") item.name = String(conflict.current);
        if (column === "bonus") item.attackBonus = String(conflict.current);
        if (column === "damage") item.damage = String(conflict.current);
        if (!existing) character.attacks.push(item);
      } else {
        mutable.importWarnings = [
          ...(mutable.importWarnings || []),
          `PDF edit to ${name} was preserved as raw text and requires manual reconciliation; it cannot safely replace the class path or character decisions.`,
        ];
      }
    }
  }
  if (acceptedFields.length) character.confirmed = [];
  return character;
}

function classLevelString(c: Character, locale: PDFLocale = "en") {
  const levels =
    c.classMode === "multi" && Object.values(c.levelPath).some(Boolean)
      ? Object.entries(c.levelPath)
          .filter(([, name]) => name)
          .reduce<Record<string, number>>(
            (sum, [, name]) => ({ ...sum, [name]: (sum[name] || 0) + 1 }),
            {},
          )
      : c.classMode === "multi"
        ? c.importedClassLevels
        : c.classes[0]
          ? { [c.classes[0]]: c.level }
          : {};
  const ordered = c.classes
    .filter((name) => levels[name])
    .map((name) => [name, levels[name]] as const);
  return ordered
    .map(([name, level]) => `${t(name, locale)} ${level}`)
    .join(" / ");
}
function proficiencySummary(entries: ProficiencyEntry[], locale: PDFLocale) {
  const headings: Partial<Record<ProficiencyEntry["kind"], string>> =
    locale === "hr"
      ? {
          Armor: "OKLOPI",
          Weapon: "ORUŽJA",
          Tool: "ALATI",
          Vehicle: "VOZILA",
          Language: "JEZICI",
          Other: "OSTALE OBUKE",
        }
      : {
          Armor: "ARMOR",
          Weapon: "WEAPONS",
          Tool: "TOOLS",
          Vehicle: "VEHICLES",
          Language: "LANGUAGES",
          Other: "OTHER TRAINING",
        };
  return Object.entries(headings)
    .flatMap(([kind, heading]) => {
      const names = [
        ...new Set(
          entries
            .filter((item) => item.kind === kind)
            .map(
              (item) =>
                `${t(item.name, locale)}${item.rank === "expertise" ? (locale === "hr" ? " (dvostruki bonus obučenosti)" : " (double proficiency)") : ""}`,
            ),
        ),
      ];
      return names.length ? [`${heading}\n• ${names.join("\n• ")}`] : [];
    })
    .join("\n\n");
}

function equipmentSummary(entries: EquipmentEntry[], locale: PDFLocale) {
  const groups = new Map<
    string,
    Map<string, { name: string; quantity: number; notes: string }>
  >();
  const headings =
    locale === "hr"
      ? {
          weapon: "ORUŽJA",
          armor: "OKLOPI I ŠTITOVI",
          tool: "ALATI",
          pack: "PAKETI",
          gear: "OSTALA OPREMA",
        }
      : {
          weapon: "WEAPONS",
          armor: "ARMOR & SHIELDS",
          tool: "TOOLS",
          pack: "PACKS",
          gear: "OTHER GEAR",
        };
  for (const item of entries) {
    const fixed = findEquipment(item.catalogId || item.name);
    const kind = fixed?.kind === "shield" ? "armor" : fixed?.kind || "gear";
    const heading = headings[kind as keyof typeof headings] || headings.gear;
    const name =
      locale === "hr" &&
      fixed?.nameHr &&
      (!item.catalogId || item.name === fixed.name || item.name === fixed.id)
        ? `${fixed.nameHr} (${fixed.name})`
        : item.name;
    // Starting equipment copies catalog help into notes. Do not print that help as personal notes.
    const notes =
      [fixed?.description, fixed?.descriptionHr].includes(item.notes) ||
      (/^(?:start-|background-)/.test(item.id) &&
        /^PHB (?:class|background) starting equipment$/.test(item.notes))
        ? ""
        : item.notes;
    if (!groups.has(heading)) groups.set(heading, new Map());
    const key = `${name}\u0000${notes}`;
    const group = groups.get(heading)!;
    const existing = group.get(key);
    if (existing) existing.quantity += item.quantity;
    else group.set(key, { name, quantity: item.quantity, notes });
  }
  return Object.values(headings)
    .filter((heading) => groups.has(heading))
    .map(
      (heading) =>
        `${heading}\n${[...groups.get(heading)!.values()].map((item) => `• ${item.name} × ${item.quantity}${item.notes ? ` — ${item.notes}` : ""}`).join("\n")}`,
    )
    .join("\n\n");
}

function featureSummary(
  entries: FeatureEntry[],
  character: Character,
  derived: ReturnType<typeof derive>,
  locale: PDFLocale,
) {
  const groups = new Map<string, string[]>();
  const seen = new Set<string>();
  for (const item of entries) {
    const generated = item.id.startsWith("derived-");
    const noteMarker = "Imported sheet note:";
    const noteStart = item.description.lastIndexOf(noteMarker);
    const importedNote =
      generated && noteStart >= 0
        ? item.description.slice(noteStart + noteMarker.length).trim()
        : "";
    const omitted = generated && item.sheet?.section !== "features";
    if (omitted && !importedNote) continue;
    const key = `${item.sourceType}:${item.className}:${item.sourceName}:${item.sheet?.key || item.name}`;
    if (generated && seen.has(key)) continue;
    seen.add(key);
    const classGroup =
      item.className && ["Class", "Subclass"].includes(item.sourceType);
    const heading = classGroup
      ? `${t(item.className, locale)} ${derived.classLevels[item.className] || ""}${character.subclass[item.className] ? ` - ${t(character.subclass[item.className], locale)}` : ""}`
      : `${t(item.sourceType, locale)} - ${generated ? t(item.sourceName, locale) : item.sourceName}`;
    const description = generated
      ? item.sheet?.description ||
        (noteStart >= 0
          ? item.description.slice(0, noteStart).trim()
          : item.description
        ).replace(
          /^[^.]+ grants this feature at [^.]+ level \d+(?:st|nd|rd|th)?\.\s*/,
          "",
        )
      : item.description;
    const text = omitted
      ? ""
      : generated
        ? locale === "hr" && item.sheet?.descriptionHr
          ? item.sheet.descriptionHr
          : t(description, locale)
        : description;
    const notes = generated
      ? (item.sheet?.notes || []).map((note) => t(note, locale))
      : [item.uses].filter(Boolean);
    const line = `• ${generated ? t(item.name, locale) : item.name}: ${[text, ...notes, importedNote].filter(Boolean).join("\n  ")}`;
    if (!groups.has(heading)) groups.set(heading, []);
    groups.get(heading)!.push(line);
  }
  return [...groups]
    .map(
      ([heading, lines]) =>
        `${heading.toLocaleUpperCase(locale)}\n${lines.join("\n\n")}`,
    )
    .join("\n\n");
}
const signed = (value: number) => (value >= 0 ? `+${value}` : String(value));

export async function exportFillableSheet(
  templateBytes: Uint8Array,
  character: Character,
  locale: PDFLocale = "en",
  onLayout?: (report: PDFLayoutReport) => void,
): Promise<Uint8Array> {
  let pdf = await PDFDocument.load(templateBytes);
  // Older app exports rebuilt the spell page. Return those to the untouched form.
  if (
    pdf
      .getPages()
      .some((page) => page.node.has(PDFName.of("DnDCreatorSpellBaseContents")))
  )
    pdf = await PDFDocument.load(await loadBundledTemplate());
  removeGeneratedPages(pdf);
  const form = pdf.getForm();
  const fields = form.getFields();
  if (!templateInfo(pdf, fields).supported)
    throw new Error(
      "This template is not the supported fillable 2014 D&D character sheet.",
    );
  const font = await embedCharacterFont(pdf);
  const numberFont = await embedCharacterFont(pdf, "Inconsolata-Regular.ttf");
  const compactFields: PDFTextField[] = [];
  const derived = derive(character);
  const overflow: ContinuationSection[] = [];
  const layoutReport: PDFLayoutReport = {
    pageCount: pdf.getPageCount(),
    smallestFont: 9,
    warnings: [],
  };
  const title = (en: string, hr: string) => (locale === "hr" ? hr : en);
  const audit = validateBuild(character);
  const isDraft = audit.length > 0;
  const auditSections: ContinuationSection[] = [];
  if (isDraft) {
    const severity = {
      error: title("ERROR", "POGREŠKA"),
      warning: title("WARNING", "UPOZORENJE"),
      unresolved: title("UNRESOLVED", "NERIJEŠENO"),
    };
    auditSections.push({
      pageBreakBefore: true,
      title: title(
        "DRAFT - RULES AND SOURCE AUDIT",
        "NACRT - PROVJERA PRAVILA I IZVORA",
      ),
      text: [
        title(
          "DRAFT: this character has outstanding decisions or rules/source review. The standard form remains editable; this page lists the issues present at export.",
          "NACRT: ovaj lik ima nedovršene odluke ili zahtijeva provjeru pravila i izvora. Standardni list ostaje ispunjiv; ovdje su navedena pitanja prisutna pri izvozu.",
        ),
        ...audit.map(
          (issue) =>
            `${severity[issue.severity]} - ${title("Stage", "Korak")} ${issue.stage + 1}\n${t(issue.message, locale)}${issue.sourceReference ? `\n${title("Source", "Izvor")}: ${issue.sourceReference}` : ""}`,
        ),
      ].join("\n\n"),
    });
  }
  const set = (name: string, value: unknown, label = name) => {
    const field = textField(fields, name);
    const compact =
      Object.values(saveTextField).includes(name) ||
      Object.values(skillField).includes(name);
    if (field) {
      fitFormText(
        field,
        safePDFText(value),
        compact ? numberFont : font,
        label,
        overflow,
        compact,
      );
      if (compact) compactFields.push(field);
    } else if (value !== undefined && value !== null && String(value).trim())
      overflow.push({ title: label, text: safePDFText(value) });
  };
  for (const field of fields) {
    if (
      field instanceof PDFTextField &&
      /^CharacterName(?:\s+\d+)?$/i.test(field.getName().trim())
    )
      fitFormText(
        field,
        character.identity.name,
        font,
        title("Character name", "Ime lika"),
        overflow,
      );
  }
  set(FIELD.player, character.identity.player, title("Player", "Igrač"));
  set(
    FIELD.classLevel,
    classLevelString(character, locale),
    title("Class and level", "Klasa i razina"),
  );
  set(
    FIELD.race,
    `${t(character.race, locale)}${character.subrace && character.subrace !== character.race ? ` · ${t(character.subrace, locale)}` : ""}`,
    title("Race", "Rasa"),
  );
  set(
    FIELD.background,
    t(character.background, locale),
    title("Background", "Pozadina"),
  );
  set(
    FIELD.alignment,
    character.identity.alignment,
    title("Alignment", "Moralno opredjeljenje"),
  );
  set(FIELD.xp, character.xp, title("Experience", "Iskustvo"));
  set("ProfBonus", signed(derived.proficiency));
  set(FIELD.ac, derived.ac);
  set(FIELD.initiative, signed(derived.initiative));
  set(FIELD.speed, `${derived.speed} ft.`);
  set(FIELD.hpMax, derived.hp);
  set(FIELD.hpCurrent, character.hpCurrent);
  set(FIELD.hpTemp, character.hpTemp);
  set(FIELD.hpDice, derived.hitDice);
  set(
    FIELD.hpDiceTotal,
    Object.values(derived.classLevels).reduce((a, b) => a + b, 0),
  );
  set(FIELD.passive, derived.passivePerception);
  set(FIELD.inspiration, character.inspiration ? "X" : "");
  set(
    FIELD.traits,
    character.identity.traits,
    title("Personality traits", "Osobine ličnosti"),
  );
  set(FIELD.ideals, character.identity.ideal, title("Ideals", "Ideali"));
  set(FIELD.bonds, character.identity.bond, title("Bonds", "Veze"));
  set(FIELD.flaws, character.identity.flaw, title("Flaws", "Mane"));
  for (const key of [
    "age",
    "height",
    "weight",
    "eyes",
    "skin",
    "hair",
  ] as const)
    set(FIELD[key], character.identity[key]);
  const hasAppearance = Boolean(textField(fields, "CharacterAppearance"));
  if (hasAppearance)
    set(
      "CharacterAppearance",
      character.identity.appearance,
      title("Appearance", "Izgled"),
    );
  const appearanceBlock =
    !hasAppearance && character.identity.appearance
      ? `${title("Appearance notes", "Bilješke o izgledu")}:\n${character.identity.appearance}`
      : "";
  set(
    FIELD.backstory,
    [
      character.identity.backstory,
      appearanceBlock,
      character.identity.goal
        ? `${title("Current goal", "Trenutačni cilj")}: ${character.identity.goal}`
        : "",
      character.notes
        ? `${title("Player notes", "Bilješke igrača")}: ${character.notes}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n"),
    title("Backstory and appearance", "Životna priča i izgled"),
  );
  set(
    FIELD.allies,
    character.identity.allies,
    title("Allies and organizations", "Saveznici i organizacije"),
  );
  set(FIELD.treasure, character.identity.treasure, title("Treasure", "Blago"));
  set(
    FIELD.faction,
    character.identity.faction,
    title("Faction", "Organizacija"),
  );
  for (const [coin, field] of Object.entries(currencyField))
    set(field, character.currency[coin] || "");
  for (const ability of abilities) {
    set(abilityField[ability], derived.abilities[ability]);
    set(
      abilityModField[ability],
      signed(Math.floor((derived.abilities[ability] - 10) / 2)),
    );
    // Saves and skills are already final numbers in the shared sheet model.
    set(saveTextField[ability], signed(derived.saves[ability]));
    setChecked(
      fields,
      saveCheckbox[ability],
      derived.proficiencies.some(
        (item) => item.kind === "Save" && item.name === ability,
      ),
    );
  }
  for (const skill of skills) {
    set(skillField[skill], signed(derived.skillBonuses[skill]));
    setChecked(
      fields,
      skillCheckbox[skill],
      derived.proficiencies.some(
        (item) => item.kind === "Skill" && item.name === skill,
      ),
    );
  }
  const summary = (
    name: string,
    text: string,
    label: string,
    reference = text,
  ) => {
    const field = textField(fields, name);
    if (field && reference === text)
      fitAcrossFormFields(
        pdf,
        [field],
        text,
        font,
        label,
        overflow,
        locale,
        name === FIELD.attackNotes,
      );
    else if (field)
      fitSummaryText(field, text, reference, font, label, overflow);
    else if (reference) overflow.push({ title: label, text: reference });
  };
  summary(
    FIELD.proficiencies,
    proficiencySummary(derived.proficiencies, locale),
    title("Proficiencies and languages", "Obuke i jezici"),
  );
  const equipment: EquipmentEntry[] = [
    ...(character.equipmentMethod === "wealth"
      ? []
      : character.equipment.filter(
          (name) => !/^(?:start|pick|background|background-gp):/.test(name),
        )
    ).map((name) => ({
      id: `package-${name}`,
      name,
      quantity: 1,
      source: "Initial class package",
      characterLevel: 1,
      className: derived.initialClass,
      classLevel: 1,
      notes: "",
    })),
    ...activeEquipmentItems(character),
  ];
  const inventory = equipmentSummary(equipment, locale);
  const packDetails = [
    ...new Set(
      equipment.map((item) => findEquipment(item.catalogId || item.name)?.id),
    ),
  ].flatMap((id) => {
    const pack = packs.find((pack) => pack.id === id);
    return pack
      ? [
          `${locale === "hr" && pack.nameHr ? pack.nameHr : pack.name}\n${pack.contents.map((item) => `• ${t(item.name, locale)} × ${item.quantity}`).join("\n")}`,
        ]
      : [];
  });
  summary(
    FIELD.equipment,
    inventory,
    title("Equipment", "Oprema"),
    [inventory, ...packDetails].join("\n\n"),
  );
  const featureEntries = [...derived.featureEntries].sort((a, b) => {
    const order = {
      Class: 0,
      Subclass: 0,
      Race: 1,
      Background: 2,
      Feat: 3,
      Other: 4,
    };
    return (
      order[a.sourceType] - order[b.sourceType] ||
      (a.characterLevel ?? 99) - (b.characterLevel ?? 99) ||
      (a.classLevel ?? 99) - (b.classLevel ?? 99)
    );
  });
  const draftNote = isDraft
    ? title(
        "DRAFT - review decisions in the app.",
        "NACRT - provjerite odluke u aplikaciji.",
      )
    : "";
  fitAcrossFormFields(
    pdf,
    [
      textField(fields, FIELD.features),
      textField(fields, FIELD.extraFeatures),
    ].filter((field): field is PDFTextField => Boolean(field)),
    [draftNote, featureSummary(featureEntries, character, derived, locale)]
      .filter(Boolean)
      .join("\n\n"),
    font,
    title(
      "Features and traits - play reference",
      "Sposobnosti i osobine - pregled za igru",
    ),
    overflow,
    locale,
    true,
  );
  const damageAbbreviations: Record<string, string> =
    locale === "hr"
      ? {
          bludgeoning: "udar.",
          piercing: "prob.",
          slashing: "rez.",
          fire: "vatra",
          cold: "hlad.",
          lightning: "munja",
          necrotic: "nekr.",
          radiant: "svet.",
          thunder: "grom",
          psychic: "psih.",
          poison: "otrov",
          acid: "kisel.",
          force: "sila",
        }
      : {
          bludgeoning: "blg.",
          piercing: "prc.",
          slashing: "slsh.",
          lightning: "ltn.",
          necrotic: "necr.",
          radiant: "rad.",
          thunder: "thnd.",
          psychic: "psych.",
        };
  const nonSpellAttacks = derived.attacks.filter(
    (item) => !item.id.startsWith("auto-spell-"),
  );
  for (let i = 0; i < attackFields.length; i++) {
    const item = nonSpellAttacks[i];
    const row = attackFields[i];
    const shortName =
      item?.name === "Unarmed Strike"
        ? title("Unarmed", "Nenaoruž.")
        : item?.name.replace(/ \([^)]*\)$/, "") || "";
    const shortDamage = (item?.damage || "")
      .replace(/\s+([+-])\s*/g, "$1")
      .replace(/\b[a-z]+\b/g, (word) => damageAbbreviations[word] || word);
    const shortBonus = (item?.calculatedBonus || "").replace(
      /^[A-Z]{3} DC /,
      "DC",
    );
    for (const [name, value] of [
      [row.name, shortName],
      [row.bonus, shortBonus],
      [row.damage, shortDamage],
    ]) {
      const field = textField(fields, name);
      if (field) fitSingleLineText(field, value, font);
    }
  }
  const attackText = nonSpellAttacks
    .slice(attackFields.length)
    .map((item) => {
      const generated = item.id.startsWith("auto-");
      const damage = item.damage
        .replace(/\s*([+-])\s*/g, " $1 ")
        .replace(/\s+([a-z]+)\b/g, (match, word: string) =>
          damageAbbreviations[word]
            ? damageAbbreviations[word].replace(/\.$/, "")
            : match,
        );
      return `${generated ? t(item.name, locale) : item.name} | ${item.calculatedBonus} | ${damage}`;
    })
    .join("\n");
  summary(
    FIELD.attackNotes,
    attackText,
    title("Additional attacks", "Dodatni napadi"),
    attackText,
  );

  const caster = derived.spellcasting[0];
  set("Spellcasting Class 2", caster ? t(caster.source, locale) : "");
  set("SpellcastingAbility 2", caster ? t(caster.ability, locale) : "");
  set("SpellSaveDC  2", caster?.saveDC ?? "");
  set("SpellAtkBonus 2", caster ? signed(caster.attackBonus) : "");
  for (let level = 1; level <= 9; level++) {
    const ordinary = derived.spellSlots[level - 1] || 0;
    set(`SlotsTotal ${level + 18}`, ordinary || "");
    set(`SlotsRemaining ${level + 18}`, "");
  }
  const spellFields = fields.filter(
    (field): field is PDFTextField =>
      field instanceof PDFTextField && /^Spells /i.test(field.getName()),
  );
  for (const field of spellFields) field.setText("");
  // One reference entry per source/spell, even when a prepared Wizard spell is also in the book.
  const spellChoices: {
    choice: ResolvedSpell;
    definition: ReturnType<typeof findSpell>;
    statuses: Set<ResolvedSpell["status"]>;
    indexFields: NonNullable<ReferenceEntry["indexFields"]>;
  }[] = [];
  for (const choice of derived.resolvedSpells) {
    const existing = spellChoices.find(
      (item) =>
        item.choice.source === choice.source &&
        item.choice.spellId === choice.spellId,
    );
    if (existing) {
      existing.statuses.add(choice.status);
      if (
        choice.status === "prepared" ||
        existing.choice.status === "spellbook"
      )
        existing.choice = choice;
    } else
      spellChoices.push({
        choice,
        definition: choice.definition || findSpell(choice.spellId),
        statuses: new Set([choice.status]),
        indexFields: [],
      });
  }
  spellChoices.sort(
    (a, b) =>
      (a.definition?.level ?? 99) - (b.definition?.level ?? 99) ||
      (a.definition?.name || a.choice.spellId).localeCompare(
        b.definition?.name || b.choice.spellId,
      ),
  );
  const statusLabels: Record<string, string> =
    locale === "hr"
      ? {
          known: "poznata",
          prepared: "pripremljena",
          spellbook: "knjiga čarolija",
          innate: "urođena",
          ritual: "ritual",
          arcanum: "mistični arkanum",
        }
      : {
          known: "known",
          prepared: "prepared",
          spellbook: "spellbook",
          innate: "innate",
          ritual: "ritual",
          arcanum: "Mystic Arcanum",
        };
  const sources = [
    ...new Set([
      ...derived.spellcasting.map((profile) => profile.source),
      ...spellChoices.map((item) => item.choice.source),
    ]),
  ];
  for (const source of sources) {
    const selected = spellChoices.filter(
      (item) => item.choice.source === source,
    );
    if (!selected.length) continue;
    const profile = derived.spellcasting.find((item) => item.source === source);
    const sample = selected[0].choice;
    const entries: ReferenceEntry[] = selected.map(
      ({ choice, definition, statuses, indexFields }) => {
        const name = definition?.name || choice.spellId;
        const combat =
          derived.attacks.find((attack) => attack.id === choice.attack?.id) ||
          choice.attack;
        const check =
          definition?.saveDamage || definition?.save
            ? `${t(definition.saveDamage?.ability || definition.save || "", locale)} ${title("save", "spasonosno bacanje")}`
            : definition?.attack
              ? title(
                  `${definition.attack.kind === "ranged" ? "Ranged" : "Melee"} spell attack`,
                  `${definition.attack.kind === "ranged" ? "Dalekometni" : "Bliski"} napad čarolijom`,
                )
              : "";
        const damage = combat
          ? `${definition?.level && choice.status !== "innate" ? title("Base damage", "Osnovna šteta") : title("Current damage", "Trenutačna šteta")}: ${t(combat.damage, locale)}`
          : "";
        const uses =
          choice.uses &&
          !/^Use the source's spellcasting rules\.?$/.test(choice.uses)
            ? t(choice.uses, locale)
            : "";
        return {
          title:
            locale === "hr" && definition?.nameHr
              ? `${definition.nameHr} (${name})`
              : name,
          subtitle: `${definition?.level === 0 ? title("Cantrip", "Trik") : `${title("Level", "Razina")} ${definition?.level ?? "?"}`} · ${definition ? t(definition.school, locale) : ""} · ${[...statuses].map((status) => statusLabels[status]).join(" / ")}`,
          metadata: definition
            ? [
                `${title("Casting time", "Vrijeme bacanja")}: ${t(definition.castingTime, locale)} | ${title("Range", "Domet")}: ${t(combat?.range || definition.range, locale)}`,
                `${title("Components", "Komponente")}: ${definition.components} | ${title("Duration", "Trajanje")}: ${t(definition.duration, locale)}${definition.concentration ? ` · ${title("concentration", "koncentracija")}` : ""}${definition.ritual ? ` · ${title("ritual available", "moguć ritual")}` : ""}`,
                [check, damage].filter(Boolean).join(" | "),
              ].filter(Boolean)
            : [],
          text:
            (locale === "hr"
              ? definition?.descriptionHr || definition?.description
              : definition?.description) ||
            title(
              "Unresolved catalog spell; choose a PHB entry.",
              "Nerazriješena čarolija; odaberite unos iz PHB-a.",
            ),
          spell: {
            levelNumber: definition?.level,
            level:
              definition?.level === 0
                ? title("Cantrip", "Trik")
                : `${title("Level", "Razina")} ${definition?.level ?? "?"}`,
            status: [...statuses]
              .map((status) => statusLabels[status])
              .join(" / "),
            source,
            prepared: statuses.has("prepared"),
            castingTime: t(definition?.castingTime || "", locale),
            range: t(combat?.range || definition?.range || "", locale),
            components: definition?.components || "",
            duration: `${t(definition?.duration || "", locale)}${definition?.ritual ? " · ritual" : ""}`,
            combat: [check, damage].filter(Boolean).join(" | "),
            damage: combat
              ? t(combat.damage, locale)
              : t(definition?.damageReference || "", locale),
            check,
            ritual: definition?.ritual,
            saveAbility: definition?.saveDamage?.ability || definition?.save,
            attackKind: definition?.attack?.kind,
            rowEffect:
              locale === "hr"
                ? (definition?.rowReference?.effectHr ??
                  definition?.rowReference?.effect ??
                  t(definition?.school || "", locale))
                : (definition?.rowReference?.effect ?? definition?.school),
            target:
              locale === "hr"
                ? definition?.rowReference?.targetHr ||
                  definition?.rowReference?.target
                : definition?.rowReference?.target,
          },
          notes: [
            statuses.has("spellbook") && !statuses.has("prepared")
              ? title(
                  "Not prepared; spellbook reference only.",
                  "Nije pripremljena; samo pregled knjige čarolija.",
                )
              : "",
            uses,
            definition?.saveDamage
              ? definition.saveDamage.onSave === "half"
                ? title(
                    "Successful save: half damage.",
                    "Uspješno spasonosno bacanje: pola štete.",
                  )
                : title(
                    "Successful save: no damage.",
                    "Uspješno spasonosno bacanje: nema štete.",
                  )
              : "",
            definition?.attack?.beams && combat
              ? t(
                  combat.properties
                    .split(";")
                    .filter((part) => /beam|zraka/.test(part))
                    .join(";"),
                  locale,
                )
              : "",
          ].filter(Boolean),
          indexFields,
        };
      },
    );
    if (source === "Warlock" && derived.pactSlots)
      entries[0].notes = [
        `${title("Pact Magic", "Magija pakta")}: ${derived.pactSlots} × ${title("level", "razina")} ${derived.pactSlotLevel}. ${t(profile?.recovery || "", locale)}`,
        ...(entries[0].notes || []),
      ];
    overflow.push({
      pageBreakBefore: true,
      title: `${title("Spell reference", "Pregled čarolija")} - ${t(source, locale)}${profile ? ` ${profile.classLevel}` : ""}`,
      text: "",
      entries,
      // The primary source's statistics already occupy the standard form's boxes.
      stats:
        source === caster?.source
          ? undefined
          : [
              {
                label: title("CASTING ABILITY", "OSOBINA ZA ČARANJE"),
                value: t(profile?.ability || sample.ability, locale),
              },
              {
                label: title("SPELL SAVE DC", "SPASONOSNI DC"),
                value: String(profile?.saveDC ?? sample.saveDC),
              },
              {
                label: title("SPELL ATTACK", "NAPAD ČAROLIJOM"),
                value: signed(profile?.attackBonus ?? sample.attackBonus),
              },
            ],
    });
  }
  if (character.spells.length)
    overflow.push({
      title: title(
        "Imported or legacy spell names - review sources",
        "Uvezene čarolije - provjerite izvore",
      ),
      text: character.spells.join("\n"),
      entries: [
        {
          title: title("Imported spell names", "Uvezeni nazivi čarolija"),
          subtitle: title("Sources unresolved", "Nerazriješeni izvori"),
          metadata: [],
          text: character.spells.join("\n"),
        },
      ],
    });
  // Respect the fixed-page export: fit existing boxes, never append overflow pages.
  for (const section of overflow)
    if (section.field) {
      const value =
        section.fixedText ||
        (section.appendToPreview
          ? [section.preview, section.text].filter(Boolean).join("\n\n")
          : section.text);
      fitFixedFormText(
        section.field,
        value,
        font,
        section.title,
        layoutReport,
        locale,
      );
    }
  fillOriginalSpellRows(
    fields,
    font,
    overflow.filter((section) => section.entries),
    layoutReport,
    locale,
  );
  if (auditSections.length)
    layoutReport.warnings.push(
      title(
        "Outstanding character decisions and source checks remain listed in the app.",
        "Nedovršene odluke lika i provjere izvora ostaju navedene u aplikaciji.",
      ),
    );
  for (const field of fields)
    if (
      field instanceof PDFTextField &&
      field.isMultiline() &&
      field.isScrollable()
    )
      updateFixedTextAppearance(field, font);
  form.updateFieldAppearances(font);
  // Older templates use unembedded Dingbats glyphs for checks. Vector marks
  // keep the saved and printed state consistent with each field's value.
  for (const field of fields)
    if (field instanceof PDFCheckBox)
      field.updateAppearances((_field, widget) => {
        const { width, height } = widget.getRectangle();
        const mark = drawCheckMark({
          x: width / 2,
          y: height / 2,
          size: Math.min(width, height) * 0.6,
          thickness: 0.8,
          color: rgb(0, 0, 0),
        });
        // The form's printed circles already outline these controls.
        return { normal: { on: mark, off: [] }, down: { on: mark, off: [] } };
      });
  for (const field of compactFields) field.updateAppearances(numberFont);
  const baseline = fieldValues(fields);
  pdf.catalog.set(
    payloadKey,
    PDFHexString.fromText(
      JSON.stringify({
        format: "dnd-2014-character",
        version: 2,
        character,
        baseline,
        locale,
        layout: layoutReport,
        attackRows: nonSpellAttacks
          .slice(0, attackFields.length)
          .map((attack) => attack.id),
      }),
    ),
  );
  pdf.setProducer("2014 PHB Character Creator");
  onLayout?.(layoutReport);
  return pdf.save();
}
