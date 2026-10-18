const equipmentNamesHr: Record<string, string> = Object.fromEntries(
  `Dice set|Komplet kockica
Dragonchess set|Komplet zmajskog šaha
Playing card set|Komplet igraćih karata
Three-Dragon Ante set|Komplet igre Tri zmaja
Bagpipes|Gajde
Drum|Bubanj
Dulcimer|Cimbal
Flute|Flauta
Lute|Lutnja
Lyre|Lira
Horn|Rog
Pan flute|Panova frula
Shawm|Šalmaj
Viol|Viola da gamba
Carriage|Kočija
Cart|Kolica
Chariot|Bojna kola
Sled|Saonice
Wagon|Zaprežna kola
Galley|Galija
Keelboat|Riječni brod
Longship|Dugi brod
Rowboat|Čamac na vesla
Sailing ship|Jedrenjak
Warship|Ratni brod
Camel|Deva
Donkey or mule|Magarac ili mazga
Elephant|Slon
Draft horse|Tegleći konj
Riding horse|Jahaći konj
Mastiff|Mastif
Pony|Poni
Warhorse|Ratni konj
Coach cab (Between towns)|Prijevoz kočijom između gradova
Coach cab (Within a city)|Prijevoz kočijom unutar grada
Hireling (Skilled)|Obučeni najamnik
Hireling (Untrained)|Neobučeni najamnik
Messenger|Glasnik
Road or gate toll|Cestarina ili pristojba za ulaz
Ship's passage|Prijevoz brodom
Wheat (1 lb.)|Pšenica (1 funta)
Flour (1 lb.)|Brašno (1 funta)
Chicken|Kokoš
Salt (1 lb.)|Sol (1 funta)
Iron (1 lb.)|Željezo (1 funta)
Canvas (1 square yard)|Platno (1 kvadratni jard)
Copper (1 lb.)|Bakar (1 funta)
Cotton cloth (1 square yard)|Pamučna tkanina (1 kvadratni jard)
Ginger (1 lb.)|Đumbir (1 funta)
Goat|Koza
Cinnamon (1 lb.)|Cimet (1 funta)
Pepper (1 lb.)|Papar (1 funta)
Sheep|Ovca
Cloves (1 lb.)|Klinčići (1 funta)
Pig|Svinja
Silver (1 lb.)|Srebro (1 funta)
Linen (1 square yard)|Lanena tkanina (1 kvadratni jard)
Silk (1 square yard)|Svila (1 kvadratni jard)
Cow|Krava
Saffron (1 lb.)|Šafran (1 funta)
Ox|Vol
Gold (1 lb.)|Zlato (1 funta)
Platinum (1 lb.)|Platina (1 funta)`
    .split("\n")
    .map((line) => line.split("|")),
);

/** 2014 PHB ch. 5. Values are mechanical data; explanations are original. */
export const equipmentSource = "PHB (2014), chapter 5, pp. 143–161";
export type EquipmentKind =
  | "weapon"
  | "armor"
  | "shield"
  | "gear"
  | "tool"
  | "pack"
  | "mount"
  | "vehicle"
  | "service";
export type CatalogItem = {
  id: string;
  name: string;
  nameHr?: string;
  kind: EquipmentKind;
  description: string;
  descriptionHr?: string;
  costGp: number;
  weightLb: number;
  sourceReference: string;
  speedMph?: number;
  speedFt?: number;
  carryingCapacityLb?: number;
  unit?: string;
  minimumCost?: boolean;
};
export type WeaponDefinition = CatalogItem & {
  kind: "weapon";
  category: "simple" | "martial";
  melee: boolean;
  damage: string;
  damageType: string;
  properties: string[];
  normalRange?: number;
  longRange?: number;
  reach: number;
  versatile?: string;
};
export type ArmorDefinition = CatalogItem & {
  kind: "armor" | "shield";
  category: "light" | "medium" | "heavy" | "shield";
  baseAc: number;
  dexterityCap: number | null;
  strengthRequirement?: number;
  stealthDisadvantage: boolean;
};
export type PackDefinition = CatalogItem & {
  kind: "pack";
  contents: { name: string; quantity: number }[];
};
export const catalogId = (name: string) =>
  name
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const damageTypesHr: Record<string, string> = {
  bludgeoning: "udarna",
  piercing: "probodna",
  slashing: "rezna",
};
const weaponPropertiesHr: Record<string, string> = {
  light: "lagano",
  finesse: "precizno (finesse)",
  thrown: "za bacanje",
  versatile: "svestrano (versatile)",
  "two-handed": "dvoručno",
  heavy: "teško",
  reach: "povećan doseg",
  ammunition: "streljivo",
  loading: "punjenje",
  special: "posebno",
};
const weapon = (
  name: string,
  nameHr: string,
  category: "simple" | "martial",
  melee: boolean,
  damage: string,
  damageType: string,
  costGp: number,
  weightLb: number,
  properties: string[] = [],
  range?: [number, number],
  versatile?: string,
): WeaponDefinition => ({
  id: catalogId(name),
  name,
  nameHr,
  kind: "weapon",
  category,
  melee,
  damage,
  damageType,
  costGp,
  weightLb,
  properties,
  normalRange: range?.[0],
  longRange: range?.[1],
  reach: properties.includes("reach") ? 10 : 5,
  versatile,
  sourceReference: "PHB (2014), pp. 146–149",
  description: `${category === "simple" ? "Simple" : "Martial"} ${melee ? "melee" : "ranged"} weapon; ${damage === "—" ? "does not deal ordinary damage" : `${damage} ${damageType} damage`}. ${properties.length ? `Properties: ${properties.join(", ")}.` : "No additional weapon properties."}${range ? ` Normal/long range ${range[0]}/${range[1]} feet.` : ""}${versatile ? ` Two-handed damage ${versatile}.` : ""}${name === "Lance" ? " Attacks against targets within 5 feet have disadvantage. Requires two hands unless mounted." : ""}${name === "Net" ? " A hit restrains a Large or smaller creature. A DC 10 Strength check frees it; 5 slashing damage to the net (AC 10) destroys it. Huge or formless creatures are unaffected. Using it limits the action, bonus action, or reaction to one attack." : ""}`,
  descriptionHr: `${category === "simple" ? "Jednostavno" : "Bojno"} ${melee ? "blisko" : "dalekometno"} oružje; ${damage === "—" ? "ne nanosi uobičajenu štetu" : `šteta ${damage} ${damageTypesHr[damageType] || damageType}`}. ${properties.length ? `Svojstva: ${properties.map((property) => weaponPropertiesHr[property] || property).join(", ")}. ` : "Nema dodatnih svojstava oružja. "}${range ? `Uobičajeni/dugi domet ${range[0]}/${range[1]} stopa. ` : ""}${versatile ? `Šteta s dvije ruke: ${versatile}. ` : ""}${name === "Lance" ? "Napadi na mete unutar 5 stopa imaju nedostatak. Potrebne su dvije ruke, osim pri jahanju." : ""}${name === "Net" ? "Pogodak sputava (restrained) Veliko ili manje stvorenje. Provjera Snage DC 10 oslobađa ga; 5 rezne štete mreži (AC 10) uništava je. Golema stvorenja i ona bez oblika nisu pogođena. Uporaba ograničava radnju, bonus radnju ili reakciju na jedan napad." : ""}`,
});
export const weapons: WeaponDefinition[] = [
  weapon("Club", "Toljaga", "simple", true, "1d4", "bludgeoning", 0.1, 2, [
    "light",
  ]),
  weapon(
    "Dagger",
    "Bodež",
    "simple",
    true,
    "1d4",
    "piercing",
    2,
    1,
    ["finesse", "light", "thrown"],
    [20, 60],
  ),
  weapon(
    "Greatclub",
    "Velika toljaga",
    "simple",
    true,
    "1d8",
    "bludgeoning",
    0.2,
    10,
    ["two-handed"],
  ),
  weapon(
    "Handaxe",
    "Ručna sjekira",
    "simple",
    true,
    "1d6",
    "slashing",
    5,
    2,
    ["light", "thrown"],
    [20, 60],
  ),
  weapon(
    "Javelin",
    "Koplje za bacanje",
    "simple",
    true,
    "1d6",
    "piercing",
    0.5,
    2,
    ["thrown"],
    [30, 120],
  ),
  weapon(
    "Light hammer",
    "Laki čekić",
    "simple",
    true,
    "1d4",
    "bludgeoning",
    2,
    2,
    ["light", "thrown"],
    [20, 60],
  ),
  weapon("Mace", "Buzdovan", "simple", true, "1d6", "bludgeoning", 5, 4),
  weapon(
    "Quarterstaff",
    "Štap",
    "simple",
    true,
    "1d6",
    "bludgeoning",
    0.2,
    4,
    ["versatile"],
    undefined,
    "1d8",
  ),
  weapon("Sickle", "Srp", "simple", true, "1d4", "slashing", 1, 2, ["light"]),
  weapon(
    "Spear",
    "Koplje",
    "simple",
    true,
    "1d6",
    "piercing",
    1,
    3,
    ["thrown", "versatile"],
    [20, 60],
    "1d8",
  ),
  weapon(
    "Light crossbow",
    "Laki samostrel",
    "simple",
    false,
    "1d8",
    "piercing",
    25,
    5,
    ["ammunition", "loading", "two-handed"],
    [80, 320],
  ),
  weapon(
    "Dart",
    "Strelica za bacanje",
    "simple",
    false,
    "1d4",
    "piercing",
    0.05,
    0.25,
    ["finesse", "thrown"],
    [20, 60],
  ),
  weapon(
    "Shortbow",
    "Kratki luk",
    "simple",
    false,
    "1d6",
    "piercing",
    25,
    2,
    ["ammunition", "two-handed"],
    [80, 320],
  ),
  weapon(
    "Sling",
    "Praćka",
    "simple",
    false,
    "1d4",
    "bludgeoning",
    0.1,
    0,
    ["ammunition"],
    [30, 120],
  ),
  weapon(
    "Battleaxe",
    "Bojna sjekira",
    "martial",
    true,
    "1d8",
    "slashing",
    10,
    4,
    ["versatile"],
    undefined,
    "1d10",
  ),
  weapon("Flail", "Mlat", "martial", true, "1d8", "bludgeoning", 10, 2),
  weapon("Glaive", "Glefa", "martial", true, "1d10", "slashing", 20, 6, [
    "heavy",
    "reach",
    "two-handed",
  ]),
  weapon(
    "Greataxe",
    "Velika sjekira",
    "martial",
    true,
    "1d12",
    "slashing",
    30,
    7,
    ["heavy", "two-handed"],
  ),
  weapon(
    "Greatsword",
    "Veliki mač",
    "martial",
    true,
    "2d6",
    "slashing",
    50,
    6,
    ["heavy", "two-handed"],
  ),
  weapon("Halberd", "Helebarda", "martial", true, "1d10", "slashing", 20, 6, [
    "heavy",
    "reach",
    "two-handed",
  ]),
  weapon(
    "Lance",
    "Konjičko koplje",
    "martial",
    true,
    "1d12",
    "piercing",
    10,
    6,
    ["reach", "special"],
  ),
  weapon(
    "Longsword",
    "Dugi mač",
    "martial",
    true,
    "1d8",
    "slashing",
    15,
    3,
    ["versatile"],
    undefined,
    "1d10",
  ),
  weapon("Maul", "Malj", "martial", true, "2d6", "bludgeoning", 10, 10, [
    "heavy",
    "two-handed",
  ]),
  weapon(
    "Morningstar",
    "Zvjezdasti buzdovan",
    "martial",
    true,
    "1d8",
    "piercing",
    15,
    4,
  ),
  weapon("Pike", "Duga pika", "martial", true, "1d10", "piercing", 5, 18, [
    "heavy",
    "reach",
    "two-handed",
  ]),
  weapon("Rapier", "Rapir", "martial", true, "1d8", "piercing", 25, 2, [
    "finesse",
  ]),
  weapon("Scimitar", "Sablja", "martial", true, "1d6", "slashing", 25, 3, [
    "finesse",
    "light",
  ]),
  weapon(
    "Shortsword",
    "Kratki mač",
    "martial",
    true,
    "1d6",
    "piercing",
    10,
    2,
    ["finesse", "light"],
  ),
  weapon(
    "Trident",
    "Trozubac",
    "martial",
    true,
    "1d6",
    "piercing",
    5,
    4,
    ["thrown", "versatile"],
    [20, 60],
    "1d8",
  ),
  weapon("War pick", "Bojni pijuk", "martial", true, "1d8", "piercing", 5, 2),
  weapon(
    "Warhammer",
    "Bojni čekić",
    "martial",
    true,
    "1d8",
    "bludgeoning",
    15,
    2,
    ["versatile"],
    undefined,
    "1d10",
  ),
  weapon("Whip", "Bič", "martial", true, "1d4", "slashing", 2, 3, [
    "finesse",
    "reach",
  ]),
  weapon(
    "Blowgun",
    "Puhaljka",
    "martial",
    false,
    "1",
    "piercing",
    10,
    1,
    ["ammunition", "loading"],
    [25, 100],
  ),
  weapon(
    "Hand crossbow",
    "Ručni samostrel",
    "martial",
    false,
    "1d6",
    "piercing",
    75,
    3,
    ["ammunition", "light", "loading"],
    [30, 120],
  ),
  weapon(
    "Heavy crossbow",
    "Teški samostrel",
    "martial",
    false,
    "1d10",
    "piercing",
    50,
    18,
    ["ammunition", "heavy", "loading", "two-handed"],
    [100, 400],
  ),
  weapon(
    "Longbow",
    "Dugi luk",
    "martial",
    false,
    "1d8",
    "piercing",
    50,
    2,
    ["ammunition", "heavy", "two-handed"],
    [150, 600],
  ),
  weapon(
    "Net",
    "Mreža",
    "martial",
    false,
    "—",
    "special",
    1,
    3,
    ["special", "thrown"],
    [5, 15],
  ),
];
const armorItem = (
  name: string,
  nameHr: string,
  category: ArmorDefinition["category"],
  baseAc: number,
  dexterityCap: number | null,
  costGp: number,
  weightLb: number,
  stealthDisadvantage = false,
  strengthRequirement?: number,
): ArmorDefinition => ({
  id: catalogId(name),
  name,
  nameHr,
  kind: category === "shield" ? "shield" : "armor",
  category,
  baseAc,
  dexterityCap,
  costGp,
  weightLb,
  stealthDisadvantage,
  strengthRequirement,
  sourceReference: "PHB (2014), pp. 144–146",
  description:
    category === "shield"
      ? "Occupies one hand and adds +2 AC while wielded. Only one shield can benefit AC; shield proficiency is separate from armor proficiency."
      : `${category[0].toUpperCase() + category.slice(1)} armor: AC ${baseAc}${dexterityCap === 0 ? "" : dexterityCap === null ? " + Dexterity modifier" : ` + Dexterity modifier (maximum +${dexterityCap})`}. ${stealthDisadvantage ? "Imposes disadvantage on Stealth checks. " : ""}${strengthRequirement ? `Strength ${strengthRequirement} avoids a 10-foot speed reduction (dwarves ignore this armor speed penalty). ` : ""}Armor proficiency is required to avoid disadvantage on Strength/Dexterity checks, saves, and attacks and inability to cast spells.`,
  descriptionHr:
    category === "shield"
      ? "Zauzima jednu ruku i daje +2 AC. Potrebno je zasebno poznavanje štitova; više štitova ne zbraja bonus."
      : `${category === "light" ? "Laki" : category === "medium" ? "Srednji" : "Teški"} oklop: AC ${baseAc}${dexterityCap === 0 ? "" : dexterityCap === null ? " + modifikator Spretnosti" : ` + modifikator Spretnosti (najviše +${dexterityCap})`}.${stealthDisadvantage ? " Nedostatak na provjerama Prikrivanja." : ""}${strengthRequirement ? ` Snaga ${strengthRequirement} izbjegava smanjenje brzine za 10 stopa (patuljci zanemaruju ovu kaznu oklopa).` : ""} Obuka za ovaj oklop potrebna je kako biste izbjegli nedostatak na provjerama, spašavanjima i napadima Snagom ili Spretnošću te nemogućnost čaranja.`,
});
export const armor: ArmorDefinition[] = [
  armorItem("Padded", "Podstavljeni oklop", "light", 11, null, 5, 8, true),
  armorItem("Leather", "Kožni oklop", "light", 11, null, 10, 10),
  armorItem("Studded leather", "Koža sa zakovicama", "light", 12, null, 45, 13),
  armorItem("Hide", "Oklop od krzna", "medium", 12, 2, 10, 12),
  armorItem("Chain shirt", "Verižna košulja", "medium", 13, 2, 50, 20),
  armorItem("Scale mail", "Ljuskasti oklop", "medium", 14, 2, 50, 45, true),
  armorItem("Breastplate", "Prsni oklop", "medium", 14, 2, 400, 20),
  armorItem("Half plate", "Polupločasti oklop", "medium", 15, 2, 750, 40, true),
  armorItem("Ring mail", "Prstenasti oklop", "heavy", 14, 0, 30, 40, true),
  armorItem("Chain mail", "Verižni oklop", "heavy", 16, 0, 75, 55, true, 13),
  armorItem(
    "Splint",
    "Pločasti oklop s trakama",
    "heavy",
    17,
    0,
    200,
    60,
    true,
    15,
  ),
  armorItem("Plate", "Puni pločasti oklop", "heavy", 18, 0, 1500, 65, true, 15),
  armorItem("Shield", "Štit", "shield", 2, 0, 10, 6),
];
const pack = (
  name: string,
  nameHr: string,
  costGp: number,
  contents: [string, number][],
): PackDefinition => ({
  id: catalogId(name),
  name,
  nameHr,
  kind: "pack",
  costGp,
  weightLb: 0,
  sourceReference: "PHB (2014), p. 151",
  contents: contents.map(([name, quantity]) => ({ name, quantity })),
  description:
    contents.map(([name, n]) => `${n} × ${name}`).join("; ") +
    ". Pack contents are owned items, not automatic weapon or armor training.",
  descriptionHr:
    "Sadržaj: " +
    contents.map(([name, n]) => `${n} × ${name}`).join("; ") +
    ". Predmeti ne daju poznavanje opreme.",
});
export const packs: PackDefinition[] = [
  pack("Burglar's pack", "Provalnička oprema", 16, [
    ["Backpack", 1],
    ["Bag of 1,000 ball bearings", 1],
    ["String (10 feet)", 1],
    ["Bell", 1],
    ["Candle", 5],
    ["Crowbar", 1],
    ["Hammer", 1],
    ["Piton", 10],
    ["Hooded lantern", 1],
    ["Oil flask", 2],
    ["Rations (1 day)", 5],
    ["Tinderbox", 1],
    ["Waterskin", 1],
    ["Hempen rope (50 feet)", 1],
  ]),
  pack("Diplomat's pack", "Diplomatska oprema", 39, [
    ["Chest", 1],
    ["Case for maps and scrolls", 2],
    ["Fine clothes", 1],
    ["Ink bottle", 1],
    ["Ink pen", 1],
    ["Lamp", 1],
    ["Oil flask", 2],
    ["Paper sheet", 5],
    ["Perfume vial", 1],
    ["Sealing wax", 1],
    ["Soap", 1],
  ]),
  pack("Dungeoneer's pack", "Oprema za tamnice", 12, [
    ["Backpack", 1],
    ["Crowbar", 1],
    ["Hammer", 1],
    ["Piton", 10],
    ["Torch", 10],
    ["Tinderbox", 1],
    ["Rations (1 day)", 10],
    ["Waterskin", 1],
    ["Hempen rope (50 feet)", 1],
  ]),
  pack("Entertainer's pack", "Zabavljačka oprema", 40, [
    ["Backpack", 1],
    ["Bedroll", 1],
    ["Costume", 2],
    ["Candle", 5],
    ["Rations (1 day)", 5],
    ["Waterskin", 1],
    ["Disguise kit", 1],
  ]),
  pack("Explorer's pack", "Istraživačka oprema", 10, [
    ["Backpack", 1],
    ["Bedroll", 1],
    ["Mess kit", 1],
    ["Tinderbox", 1],
    ["Torch", 10],
    ["Rations (1 day)", 10],
    ["Waterskin", 1],
    ["Hempen rope (50 feet)", 1],
  ]),
  pack("Priest's pack", "Svećenička oprema", 19, [
    ["Backpack", 1],
    ["Blanket", 1],
    ["Candle", 10],
    ["Tinderbox", 1],
    ["Alms box", 1],
    ["Incense block", 2],
    ["Censer", 1],
    ["Vestments", 1],
    ["Rations (1 day)", 2],
    ["Waterskin", 1],
  ]),
  pack("Scholar's pack", "Učenjačka oprema", 40, [
    ["Backpack", 1],
    ["Book of lore", 1],
    ["Ink bottle", 1],
    ["Ink pen", 1],
    ["Parchment sheet", 10],
    ["Little bag of sand", 1],
    ["Small knife", 1],
  ]),
];
export type StartingEquipmentChoice = {
  id: string;
  className: string;
  title: string;
  choose: number;
  options: {
    id: string;
    label: string;
    items: { name: string; quantity: number }[];
    chooseFrom?: string[];
    chooseCount?: number;
  }[];
  sourceReference: string;
};
const bundle = (
  label: string,
  items: [string, number][],
  chooseFrom?: string[],
  chooseCount?: number,
) => ({
  id: catalogId(label),
  label,
  items: items.map(([name, quantity]) => ({ name, quantity })),
  chooseFrom,
  chooseCount,
});
const group = (
  className: string,
  id: string,
  title: string,
  options: StartingEquipmentChoice["options"],
): StartingEquipmentChoice => ({
  id: `${catalogId(className)}-${id}`,
  className,
  title,
  choose: 1,
  options,
  sourceReference: `PHB (2014), chapter 3, ${className}: Equipment`,
});
const simple = weapons
    .filter((w) => w.category === "simple")
    .map((w) => w.name),
  martial = weapons.filter((w) => w.category === "martial").map((w) => w.name),
  simpleMelee = weapons
    .filter((w) => w.category === "simple" && w.melee)
    .map((w) => w.name);
export const startingEquipmentChoices: StartingEquipmentChoice[] = [
  group("Barbarian", "weapon", "Primary weapon", [
    bundle("Greataxe", [["Greataxe", 1]]),
    bundle(
      "Any martial melee weapon",
      [],
      weapons
        .filter((w) => w.category === "martial" && w.melee)
        .map((w) => w.name),
      1,
    ),
  ]),
  group("Barbarian", "secondary", "Secondary weapons", [
    bundle("Two handaxes", [["Handaxe", 2]]),
    bundle("Any simple weapon", [], simple, 1),
  ]),
  group("Barbarian", "fixed", "Other class equipment", [
    bundle("Explorer's pack and four javelins", [
      ["Explorer's pack", 1],
      ["Javelin", 4],
    ]),
  ]),
  group("Bard", "weapon", "Weapon", [
    bundle("Rapier", [["Rapier", 1]]),
    bundle("Longsword", [["Longsword", 1]]),
    bundle("Any simple weapon", [], simple, 1),
  ]),
  group("Bard", "pack", "Pack", [
    bundle("Diplomat's pack", [["Diplomat's pack", 1]]),
    bundle("Entertainer's pack", [["Entertainer's pack", 1]]),
  ]),
  group("Bard", "instrument", "Instrument", [
    bundle("Lute", [["Lute", 1]]),
    bundle(
      "Any musical instrument",
      [],
      [
        "Bagpipes",
        "Drum",
        "Dulcimer",
        "Flute",
        "Lute",
        "Lyre",
        "Horn",
        "Pan flute",
        "Shawm",
        "Viol",
      ],
      1,
    ),
  ]),
  group("Bard", "fixed", "Other class equipment", [
    bundle("Leather armor and dagger", [
      ["Leather", 1],
      ["Dagger", 1],
    ]),
  ]),
  group("Cleric", "weapon", "Weapon", [
    bundle("Mace", [["Mace", 1]]),
    bundle("Warhammer (if proficient)", [["Warhammer", 1]]),
  ]),
  group("Cleric", "armor", "Armor", [
    bundle("Scale mail", [["Scale mail", 1]]),
    bundle("Leather", [["Leather", 1]]),
    bundle("Chain mail (if proficient)", [["Chain mail", 1]]),
  ]),
  group("Cleric", "ranged", "Secondary weapon", [
    bundle("Light crossbow and 20 bolts", [
      ["Light crossbow", 1],
      ["Crossbow bolts", 20],
    ]),
    bundle("Any simple weapon", [], simple, 1),
  ]),
  group("Cleric", "pack", "Pack", [
    bundle("Priest's pack", [["Priest's pack", 1]]),
    bundle("Explorer's pack", [["Explorer's pack", 1]]),
  ]),
  group("Cleric", "fixed", "Other class equipment", [
    bundle("Shield and holy symbol", [
      ["Shield", 1],
      ["Holy symbol", 1],
    ]),
  ]),
  group("Druid", "shield", "Shield or weapon", [
    bundle("Wooden shield", [["Shield", 1]]),
    bundle("Any simple weapon", [], simple, 1),
  ]),
  group("Druid", "weapon", "Weapon", [
    bundle("Scimitar", [["Scimitar", 1]]),
    bundle("Any simple melee weapon", [], simpleMelee, 1),
  ]),
  group("Druid", "fixed", "Other class equipment", [
    bundle("Leather armor, explorer's pack, druidic focus", [
      ["Leather", 1],
      ["Explorer's pack", 1],
      ["Druidic focus", 1],
    ]),
  ]),
  group("Fighter", "armor", "Armor", [
    bundle("Chain mail", [["Chain mail", 1]]),
    bundle("Leather armor, longbow, 20 arrows", [
      ["Leather", 1],
      ["Longbow", 1],
      ["Arrows", 20],
    ]),
  ]),
  group("Fighter", "weapon", "Martial equipment", [
    bundle("One martial weapon and shield", [["Shield", 1]], martial, 1),
    bundle("Two martial weapons", [], martial, 2),
  ]),
  group("Fighter", "secondary", "Secondary weapon", [
    bundle("Light crossbow and 20 bolts", [
      ["Light crossbow", 1],
      ["Crossbow bolts", 20],
    ]),
    bundle("Two handaxes", [["Handaxe", 2]]),
  ]),
  group("Fighter", "pack", "Pack", [
    bundle("Dungeoneer's pack", [["Dungeoneer's pack", 1]]),
    bundle("Explorer's pack", [["Explorer's pack", 1]]),
  ]),
  group("Monk", "weapon", "Weapon", [
    bundle("Shortsword", [["Shortsword", 1]]),
    bundle("Any simple weapon", [], simple, 1),
  ]),
  group("Monk", "pack", "Pack", [
    bundle("Dungeoneer's pack", [["Dungeoneer's pack", 1]]),
    bundle("Explorer's pack", [["Explorer's pack", 1]]),
  ]),
  group("Monk", "fixed", "Other class equipment", [
    bundle("Ten darts", [["Dart", 10]]),
  ]),
  group("Paladin", "weapon", "Martial equipment", [
    bundle("One martial weapon and shield", [["Shield", 1]], martial, 1),
    bundle("Two martial weapons", [], martial, 2),
  ]),
  group("Paladin", "secondary", "Secondary weapon", [
    bundle("Five javelins", [["Javelin", 5]]),
    bundle("Any simple melee weapon", [], simpleMelee, 1),
  ]),
  group("Paladin", "pack", "Pack", [
    bundle("Priest's pack", [["Priest's pack", 1]]),
    bundle("Explorer's pack", [["Explorer's pack", 1]]),
  ]),
  group("Paladin", "fixed", "Other class equipment", [
    bundle("Chain mail and holy symbol", [
      ["Chain mail", 1],
      ["Holy symbol", 1],
    ]),
  ]),
  group("Ranger", "armor", "Armor", [
    bundle("Scale mail", [["Scale mail", 1]]),
    bundle("Leather", [["Leather", 1]]),
  ]),
  group("Ranger", "weapon", "Melee weapons", [
    bundle("Two shortswords", [["Shortsword", 2]]),
    bundle("Two simple melee weapons", [], simpleMelee, 2),
  ]),
  group("Ranger", "pack", "Pack", [
    bundle("Dungeoneer's pack", [["Dungeoneer's pack", 1]]),
    bundle("Explorer's pack", [["Explorer's pack", 1]]),
  ]),
  group("Ranger", "fixed", "Other class equipment", [
    bundle("Longbow, quiver, 20 arrows", [
      ["Longbow", 1],
      ["Quiver", 1],
      ["Arrows", 20],
    ]),
  ]),
  group("Rogue", "weapon", "Primary weapon", [
    bundle("Rapier", [["Rapier", 1]]),
    bundle("Shortsword", [["Shortsword", 1]]),
  ]),
  group("Rogue", "secondary", "Secondary weapon", [
    bundle("Shortbow, quiver and 20 arrows", [
      ["Shortbow", 1],
      ["Quiver", 1],
      ["Arrows", 20],
    ]),
    bundle("Shortsword", [["Shortsword", 1]]),
  ]),
  group("Rogue", "pack", "Pack", [
    bundle("Burglar's pack", [["Burglar's pack", 1]]),
    bundle("Dungeoneer's pack", [["Dungeoneer's pack", 1]]),
    bundle("Explorer's pack", [["Explorer's pack", 1]]),
  ]),
  group("Rogue", "fixed", "Other class equipment", [
    bundle("Leather armor, two daggers, thieves' tools", [
      ["Leather", 1],
      ["Dagger", 2],
      ["Thieves' tools", 1],
    ]),
  ]),
  group("Sorcerer", "weapon", "Weapon", [
    bundle("Light crossbow and 20 bolts", [
      ["Light crossbow", 1],
      ["Crossbow bolts", 20],
    ]),
    bundle("Any simple weapon", [], simple, 1),
  ]),
  group("Sorcerer", "focus", "Components", [
    bundle("Component pouch", [["Component pouch", 1]]),
    bundle("Arcane focus", [["Arcane focus", 1]]),
  ]),
  group("Sorcerer", "pack", "Pack", [
    bundle("Dungeoneer's pack", [["Dungeoneer's pack", 1]]),
    bundle("Explorer's pack", [["Explorer's pack", 1]]),
  ]),
  group("Sorcerer", "fixed", "Other class equipment", [
    bundle("Two daggers", [["Dagger", 2]]),
  ]),
  group("Warlock", "weapon", "Weapon", [
    bundle("Light crossbow and 20 bolts", [
      ["Light crossbow", 1],
      ["Crossbow bolts", 20],
    ]),
    bundle("Any simple weapon", [], simple, 1),
  ]),
  group("Warlock", "focus", "Components", [
    bundle("Component pouch", [["Component pouch", 1]]),
    bundle("Arcane focus", [["Arcane focus", 1]]),
  ]),
  group("Warlock", "pack", "Pack", [
    bundle("Scholar's pack", [["Scholar's pack", 1]]),
    bundle("Dungeoneer's pack", [["Dungeoneer's pack", 1]]),
  ]),
  group("Warlock", "secondary", "Additional weapon", [
    bundle("Any simple weapon", [], simple, 1),
  ]),
  group("Warlock", "fixed", "Other class equipment", [
    bundle("Leather armor and two daggers", [
      ["Leather", 1],
      ["Dagger", 2],
    ]),
  ]),
  group("Wizard", "weapon", "Weapon", [
    bundle("Quarterstaff", [["Quarterstaff", 1]]),
    bundle("Dagger", [["Dagger", 1]]),
  ]),
  group("Wizard", "focus", "Components", [
    bundle("Component pouch", [["Component pouch", 1]]),
    bundle("Arcane focus", [["Arcane focus", 1]]),
  ]),
  group("Wizard", "pack", "Pack", [
    bundle("Scholar's pack", [["Scholar's pack", 1]]),
    bundle("Explorer's pack", [["Explorer's pack", 1]]),
  ]),
  group("Wizard", "fixed", "Other class equipment", [
    bundle("Spellbook", [["Spellbook", 1]]),
  ]),
];
export const getStartingEquipmentChoices = (className: string) =>
  startingEquipmentChoices.filter((choice) => choice.className === className);
/** PHB (2014), p. 143: this alternative replaces class AND background equipment. */
export const startingWealthByClass: Record<
  string,
  {
    dice: string;
    multiplier: number;
    min: number;
    max: number;
    sourceReference: string;
  }
> = Object.fromEntries(
  Object.entries({
    Barbarian: [2, 10],
    Bard: [5, 10],
    Cleric: [5, 10],
    Druid: [2, 10],
    Fighter: [5, 10],
    Monk: [5, 1],
    Paladin: [5, 10],
    Ranger: [5, 10],
    Rogue: [4, 10],
    Sorcerer: [3, 10],
    Warlock: [4, 10],
    Wizard: [4, 10],
  }).map(([name, [dice, multiplier]]) => [
    name,
    {
      dice: `${dice}d4`,
      multiplier,
      min: dice * multiplier,
      max: dice * 4 * multiplier,
      sourceReference: "PHB (2014), p. 143: Starting Wealth by Class",
    },
  ]),
);
export const classStartingWealth = startingWealthByClass;
const otherEquipmentData: Omit<
  CatalogItem,
  "id" | "description" | "sourceReference"
>[] = [
  {
    name: "Arrows (20)",
    kind: "gear",
    costGp: 1,
    weightLb: 1,
  },
  {
    name: "Blowgun needles (50)",
    kind: "gear",
    costGp: 1,
    weightLb: 1,
  },
  {
    name: "Crossbow bolts (20)",
    kind: "gear",
    costGp: 1,
    weightLb: 1.5,
  },
  {
    name: "Sling bullets (20)",
    kind: "gear",
    costGp: 0.04,
    weightLb: 1.5,
  },
  {
    name: "Crystal",
    kind: "gear",
    costGp: 10,
    weightLb: 1,
  },
  {
    name: "Orb",
    kind: "gear",
    costGp: 20,
    weightLb: 3,
  },
  {
    name: "Rod",
    kind: "gear",
    costGp: 10,
    weightLb: 2,
  },
  {
    name: "Staff",
    kind: "gear",
    costGp: 5,
    weightLb: 4,
  },
  {
    name: "Wand",
    kind: "gear",
    costGp: 10,
    weightLb: 1,
  },
  {
    name: "Sprig of mistletoe",
    kind: "gear",
    costGp: 1,
    weightLb: 0,
  },
  {
    name: "Totem",
    kind: "gear",
    costGp: 1,
    weightLb: 0,
  },
  {
    name: "Wooden staff",
    kind: "gear",
    costGp: 5,
    weightLb: 4,
  },
  {
    name: "Yew wand",
    kind: "gear",
    costGp: 10,
    weightLb: 1,
  },
  {
    name: "Amulet",
    kind: "gear",
    costGp: 5,
    weightLb: 1,
  },
  {
    name: "Emblem",
    kind: "gear",
    costGp: 5,
    weightLb: 0,
  },
  {
    name: "Reliquary",
    kind: "gear",
    costGp: 5,
    weightLb: 2,
  },
  {
    name: "Abacus",
    kind: "gear",
    costGp: 2,
    weightLb: 2,
  },
  {
    name: "Acid (vial)",
    kind: "gear",
    costGp: 25,
    weightLb: 1,
  },
  {
    name: "Alchemist's fire (flask)",
    kind: "gear",
    costGp: 50,
    weightLb: 1,
  },
  {
    name: "Antitoxin (vial)",
    kind: "gear",
    costGp: 50,
    weightLb: 0,
  },
  {
    name: "Backpack",
    kind: "gear",
    costGp: 2,
    weightLb: 5,
  },
  {
    name: "Ball bearings (bag of 1,000)",
    kind: "gear",
    costGp: 1,
    weightLb: 2,
  },
  {
    name: "Barrel",
    kind: "gear",
    costGp: 2,
    weightLb: 70,
  },
  {
    name: "Basket",
    kind: "gear",
    costGp: 0.4,
    weightLb: 2,
  },
  {
    name: "Bedroll",
    kind: "gear",
    costGp: 1,
    weightLb: 7,
  },
  {
    name: "Bell",
    kind: "gear",
    costGp: 1,
    weightLb: 0,
  },
  {
    name: "Blanket",
    kind: "gear",
    costGp: 0.5,
    weightLb: 3,
  },
  {
    name: "Block and tackle",
    kind: "gear",
    costGp: 1,
    weightLb: 5,
  },
  {
    name: "Book",
    kind: "gear",
    costGp: 25,
    weightLb: 5,
  },
  {
    name: "Bottle, glass",
    kind: "gear",
    costGp: 2,
    weightLb: 2,
  },
  {
    name: "Bucket",
    kind: "gear",
    costGp: 0.05,
    weightLb: 2,
  },
  {
    name: "Caltrops (bag of 20)",
    kind: "gear",
    costGp: 1,
    weightLb: 2,
  },
  {
    name: "Candle",
    kind: "gear",
    costGp: 0.01,
    weightLb: 0,
  },
  {
    name: "Case, crossbow bolt",
    kind: "gear",
    costGp: 1,
    weightLb: 1,
  },
  {
    name: "Case, map or scroll",
    kind: "gear",
    costGp: 1,
    weightLb: 1,
  },
  {
    name: "Chain (10 feet)",
    kind: "gear",
    costGp: 5,
    weightLb: 10,
  },
  {
    name: "Chalk (1 piece)",
    kind: "gear",
    costGp: 0.01,
    weightLb: 0,
  },
  {
    name: "Chest",
    kind: "gear",
    costGp: 5,
    weightLb: 25,
  },
  {
    name: "Climber's kit",
    kind: "gear",
    costGp: 25,
    weightLb: 12,
  },
  {
    name: "Clothes, common",
    kind: "gear",
    costGp: 0.5,
    weightLb: 3,
  },
  {
    name: "Clothes, costume",
    kind: "gear",
    costGp: 5,
    weightLb: 4,
  },
  {
    name: "Clothes, fine",
    kind: "gear",
    costGp: 15,
    weightLb: 6,
  },
  {
    name: "Clothes, traveler's",
    kind: "gear",
    costGp: 2,
    weightLb: 4,
  },
  {
    name: "Component pouch",
    kind: "gear",
    costGp: 25,
    weightLb: 2,
  },
  {
    name: "Crowbar",
    kind: "gear",
    costGp: 2,
    weightLb: 5,
  },
  {
    name: "Fishing tackle",
    kind: "gear",
    costGp: 1,
    weightLb: 4,
  },
  {
    name: "Flask or tankard",
    kind: "gear",
    costGp: 0.02,
    weightLb: 1,
  },
  {
    name: "Grappling hook",
    kind: "gear",
    costGp: 2,
    weightLb: 4,
  },
  {
    name: "Hammer",
    kind: "gear",
    costGp: 1,
    weightLb: 3,
  },
  {
    name: "Hammer, sledge",
    kind: "gear",
    costGp: 2,
    weightLb: 10,
  },
  {
    name: "Healer's kit",
    kind: "gear",
    costGp: 5,
    weightLb: 3,
  },
  {
    name: "Holy water (flask)",
    kind: "gear",
    costGp: 25,
    weightLb: 1,
  },
  {
    name: "Hourglass",
    kind: "gear",
    costGp: 25,
    weightLb: 1,
  },
  {
    name: "Hunting trap",
    kind: "gear",
    costGp: 5,
    weightLb: 25,
  },
  {
    name: "Ink (1 ounce bottle)",
    kind: "gear",
    costGp: 10,
    weightLb: 0,
  },
  {
    name: "Ink pen",
    kind: "gear",
    costGp: 0.02,
    weightLb: 0,
  },
  {
    name: "Jug or pitcher",
    kind: "gear",
    costGp: 0.02,
    weightLb: 4,
  },
  {
    name: "Ladder (10 foot)",
    kind: "gear",
    costGp: 0.1,
    weightLb: 25,
  },
  {
    name: "Lamp",
    kind: "gear",
    costGp: 0.5,
    weightLb: 1,
  },
  {
    name: "Lantern, bullseye",
    kind: "gear",
    costGp: 10,
    weightLb: 2,
  },
  {
    name: "Lantern, hooded",
    kind: "gear",
    costGp: 5,
    weightLb: 2,
  },
  {
    name: "Lock",
    kind: "gear",
    costGp: 10,
    weightLb: 1,
  },
  {
    name: "Magnifying glass",
    kind: "gear",
    costGp: 100,
    weightLb: 0,
  },
  {
    name: "Manacles",
    kind: "gear",
    costGp: 2,
    weightLb: 6,
  },
  {
    name: "Mess kit",
    kind: "gear",
    costGp: 0.2,
    weightLb: 1,
  },
  {
    name: "Mirror, steel",
    kind: "gear",
    costGp: 5,
    weightLb: 0.5,
  },
  {
    name: "Oil (flask)",
    kind: "gear",
    costGp: 0.1,
    weightLb: 1,
  },
  {
    name: "Paper (one sheet)",
    kind: "gear",
    costGp: 0.2,
    weightLb: 0,
  },
  {
    name: "Parchment (one sheet)",
    kind: "gear",
    costGp: 0.1,
    weightLb: 0,
  },
  {
    name: "Perfume (vial)",
    kind: "gear",
    costGp: 5,
    weightLb: 0,
  },
  {
    name: "Pick, miner's",
    kind: "gear",
    costGp: 2,
    weightLb: 10,
  },
  {
    name: "Piton",
    kind: "gear",
    costGp: 0.05,
    weightLb: 0.25,
  },
  {
    name: "Poison, basic (vial)",
    kind: "gear",
    costGp: 100,
    weightLb: 0,
  },
  {
    name: "Pole (10-foot)",
    kind: "gear",
    costGp: 0.05,
    weightLb: 7,
  },
  {
    name: "Pot, iron",
    kind: "gear",
    costGp: 2,
    weightLb: 10,
  },
  {
    name: "Potion of healing",
    kind: "gear",
    costGp: 50,
    weightLb: 0.5,
  },
  {
    name: "Pouch",
    kind: "gear",
    costGp: 0.5,
    weightLb: 1,
  },
  {
    name: "Quiver",
    kind: "gear",
    costGp: 1,
    weightLb: 1,
  },
  {
    name: "Ram, portable",
    kind: "gear",
    costGp: 4,
    weightLb: 35,
  },
  {
    name: "Rations (1 day)",
    kind: "gear",
    costGp: 0.5,
    weightLb: 2,
  },
  {
    name: "Robes",
    kind: "gear",
    costGp: 1,
    weightLb: 4,
  },
  {
    name: "Rope, hempen (50 feet)",
    kind: "gear",
    costGp: 1,
    weightLb: 10,
  },
  {
    name: "Rope, silk (50 feet)",
    kind: "gear",
    costGp: 10,
    weightLb: 5,
  },
  {
    name: "Sack",
    kind: "gear",
    costGp: 0.01,
    weightLb: 0.5,
  },
  {
    name: "Scale, merchant's",
    kind: "gear",
    costGp: 5,
    weightLb: 3,
  },
  {
    name: "Sealing wax",
    kind: "gear",
    costGp: 0.5,
    weightLb: 0,
  },
  {
    name: "Shovel",
    kind: "gear",
    costGp: 2,
    weightLb: 5,
  },
  {
    name: "Signal whistle",
    kind: "gear",
    costGp: 0.05,
    weightLb: 0,
  },
  {
    name: "Signet ring",
    kind: "gear",
    costGp: 5,
    weightLb: 0,
  },
  {
    name: "Soap",
    kind: "gear",
    costGp: 0.02,
    weightLb: 0,
  },
  {
    name: "Spellbook",
    kind: "gear",
    costGp: 50,
    weightLb: 3,
  },
  {
    name: "Spikes, iron (10)",
    kind: "gear",
    costGp: 1,
    weightLb: 5,
  },
  {
    name: "Spyglass",
    kind: "gear",
    costGp: 1000,
    weightLb: 1,
  },
  {
    name: "Tent, two-person",
    kind: "gear",
    costGp: 2,
    weightLb: 20,
  },
  {
    name: "Tinderbox",
    kind: "gear",
    costGp: 0.5,
    weightLb: 1,
  },
  {
    name: "Torch",
    kind: "gear",
    costGp: 0.01,
    weightLb: 1,
  },
  {
    name: "Vial",
    kind: "gear",
    costGp: 1,
    weightLb: 0,
  },
  {
    name: "Waterskin",
    kind: "gear",
    costGp: 0.2,
    weightLb: 5,
  },
  {
    name: "Whetstone",
    kind: "gear",
    costGp: 0.01,
    weightLb: 1,
  },
  {
    name: "Alchemist's supplies",
    kind: "tool",
    costGp: 50,
    weightLb: 8,
  },
  {
    name: "Brewer's supplies",
    kind: "tool",
    costGp: 20,
    weightLb: 9,
  },
  {
    name: "Calligrapher's supplies",
    kind: "tool",
    costGp: 10,
    weightLb: 5,
  },
  {
    name: "Carpenter's tools",
    kind: "tool",
    costGp: 8,
    weightLb: 6,
  },
  {
    name: "Cartographer's tools",
    kind: "tool",
    costGp: 15,
    weightLb: 6,
  },
  {
    name: "Cobbler's tools",
    kind: "tool",
    costGp: 5,
    weightLb: 5,
  },
  {
    name: "Cook's utensils",
    kind: "tool",
    costGp: 1,
    weightLb: 8,
  },
  {
    name: "Glassblower's tools",
    kind: "tool",
    costGp: 30,
    weightLb: 5,
  },
  {
    name: "Jeweler's tools",
    kind: "tool",
    costGp: 25,
    weightLb: 2,
  },
  {
    name: "Leatherworker's tools",
    kind: "tool",
    costGp: 5,
    weightLb: 5,
  },
  {
    name: "Mason's tools",
    kind: "tool",
    costGp: 10,
    weightLb: 8,
  },
  {
    name: "Painter's supplies",
    kind: "tool",
    costGp: 10,
    weightLb: 5,
  },
  {
    name: "Potter's tools",
    kind: "tool",
    costGp: 10,
    weightLb: 3,
  },
  {
    name: "Smith's tools",
    kind: "tool",
    costGp: 20,
    weightLb: 8,
  },
  {
    name: "Tinker's tools",
    kind: "tool",
    costGp: 50,
    weightLb: 10,
  },
  {
    name: "Weaver's tools",
    kind: "tool",
    costGp: 1,
    weightLb: 5,
  },
  {
    name: "Woodcarver's tools",
    kind: "tool",
    costGp: 1,
    weightLb: 5,
  },
  {
    name: "Dice set",
    kind: "tool",
    costGp: 0.1,
    weightLb: 0,
  },
  {
    name: "Dragonchess set",
    kind: "tool",
    costGp: 1,
    weightLb: 0.5,
  },
  {
    name: "Playing card set",
    kind: "tool",
    costGp: 0.5,
    weightLb: 0,
  },
  {
    name: "Three-Dragon Ante set",
    kind: "tool",
    costGp: 1,
    weightLb: 0,
  },
  {
    name: "Bagpipes",
    kind: "tool",
    costGp: 30,
    weightLb: 6,
  },
  {
    name: "Drum",
    kind: "tool",
    costGp: 6,
    weightLb: 3,
  },
  {
    name: "Dulcimer",
    kind: "tool",
    costGp: 25,
    weightLb: 10,
  },
  {
    name: "Flute",
    kind: "tool",
    costGp: 2,
    weightLb: 1,
  },
  {
    name: "Lute",
    kind: "tool",
    costGp: 35,
    weightLb: 2,
  },
  {
    name: "Lyre",
    kind: "tool",
    costGp: 30,
    weightLb: 2,
  },
  {
    name: "Horn",
    kind: "tool",
    costGp: 3,
    weightLb: 2,
  },
  {
    name: "Pan flute",
    kind: "tool",
    costGp: 12,
    weightLb: 2,
  },
  {
    name: "Shawm",
    kind: "tool",
    costGp: 2,
    weightLb: 1,
  },
  {
    name: "Viol",
    kind: "tool",
    costGp: 30,
    weightLb: 1,
  },
  {
    name: "Disguise kit",
    kind: "tool",
    costGp: 25,
    weightLb: 3,
  },
  {
    name: "Forgery kit",
    kind: "tool",
    costGp: 15,
    weightLb: 5,
  },
  {
    name: "Herbalism kit",
    kind: "tool",
    costGp: 5,
    weightLb: 3,
  },
  {
    name: "Navigator's tools",
    kind: "tool",
    costGp: 25,
    weightLb: 2,
  },
  {
    name: "Poisoner's kit",
    kind: "tool",
    costGp: 50,
    weightLb: 2,
  },
  {
    name: "Thieves' tools",
    kind: "tool",
    costGp: 25,
    weightLb: 1,
  },
  {
    name: "Bit and bridle",
    kind: "vehicle",
    costGp: 2,
    weightLb: 1,
  },
  {
    name: "Carriage",
    kind: "vehicle",
    costGp: 100,
    weightLb: 600,
  },
  {
    name: "Cart",
    kind: "vehicle",
    costGp: 15,
    weightLb: 200,
  },
  {
    name: "Chariot",
    kind: "vehicle",
    costGp: 250,
    weightLb: 100,
  },
  {
    name: "Feed (per day)",
    kind: "vehicle",
    costGp: 0.05,
    weightLb: 10,
  },
  {
    name: "Saddlebags",
    kind: "vehicle",
    costGp: 4,
    weightLb: 8,
  },
  {
    name: "Sled",
    kind: "vehicle",
    costGp: 20,
    weightLb: 300,
  },
  {
    name: "Stabling (per day)",
    kind: "vehicle",
    costGp: 0.5,
    weightLb: 0,
  },
  {
    name: "Wagon",
    kind: "vehicle",
    costGp: 35,
    weightLb: 400,
  },
  {
    name: "Exotic",
    kind: "vehicle",
    costGp: 60,
    weightLb: 40,
  },
  {
    name: "Military",
    kind: "vehicle",
    costGp: 20,
    weightLb: 30,
  },
  {
    name: "Pack",
    kind: "vehicle",
    costGp: 5,
    weightLb: 15,
  },
  {
    name: "Riding",
    kind: "vehicle",
    costGp: 10,
    weightLb: 25,
  },
  {
    name: "Galley",
    kind: "vehicle",
    costGp: 30000,
    weightLb: 0,
    speedMph: 4,
  },
  {
    name: "Keelboat",
    kind: "vehicle",
    costGp: 3000,
    weightLb: 0,
    speedMph: 1,
  },
  {
    name: "Longship",
    kind: "vehicle",
    costGp: 10000,
    weightLb: 0,
    speedMph: 3,
  },
  {
    name: "Rowboat",
    kind: "vehicle",
    costGp: 50,
    weightLb: 0,
    speedMph: 1.5,
  },
  {
    name: "Sailing ship",
    kind: "vehicle",
    costGp: 10000,
    weightLb: 0,
    speedMph: 2,
  },
  {
    name: "Warship",
    kind: "vehicle",
    costGp: 25000,
    weightLb: 0,
    speedMph: 2.5,
  },
];
const gearDescriptions: Record<string, [string, string, string?]> = {
  "Arrows (20)": [
    "Twenty arrows for a bow; each shot expends one. A minute searching after battle normally recovers half the spent ammunition.",
    "Dvadeset strijela za luk; svaki hitac troši jednu. Minuta traženja nakon borbe obično vraća polovicu potrošenih.",
    "Strijele (20)",
  ],
  "Blowgun needles (50)": [
    "Fifty needles for a blowgun. The weapon's damage and Loading rules apply; these are not pre-poisoned.",
    "Pedeset igala za puhaljku. Vrijede šteta i Loading oružja; nisu unaprijed otrovane.",
    "Igle za puhaljku (50)",
  ],
  "Crossbow bolts (20)": [
    "Twenty bolts for a crossbow. Loading requires a free hand even when a feature ignores the Loading property.",
    "Dvadeset vijaka za samostrel. Punjenje traži slobodnu ruku čak i kada značajka zanemaruje Loading.",
    "Samostrelski vijci (20)",
  ],
  "Sling bullets (20)": [
    "Twenty ammunition bullets for a sling. Loading a one-handed ammunition weapon still needs a free hand.",
    "Dvadeset kuglica za praćku. Punjenje jednoručnog streljačkog oružja i dalje traži slobodnu ruku.",
    "Kuglice za praćku (20)",
  ],
  Crystal: [
    "A crystal arcane focus for sorcerer, warlock, or wizard material components without a specified cost or consumption. It does not replace costly components.",
    "Kristalni fokus za sorcerer, warlock ili wizard materijale bez navedene cijene ili potrošnje. Ne zamjenjuje skupe sastavnice.",
    "Kristalni fokus",
  ],
  Orb: [
    "An orb arcane focus for eligible arcane classes. A focus channels spells but grants neither spellcasting nor additional spell slots.",
    "Kuglasti fokus za prikladne arkanske klase. Usmjerava čarolije, ali ne daje čaranje niti dodatne utore.",
    "Kuglasti fokus",
  ],
  Rod: [
    "A rod arcane focus replacing eligible mundane material components for sorcerers, warlocks, and wizards; costly and consumed materials remain required.",
    "Palica kao arkanski fokus zamjenjuje prikladne obične materijale sorcerera, warlocka i wizarda; skupi i potrošni ostaju.",
    "Palica kao fokus",
  ],
  Staff: [
    "A specially constructed arcane staff focus. The PHB allows a staff focus to be used as a quarterstaff; carrying it does not grant weapon training.",
    "Posebno izrađen arkanski štap. PHB dopušta korištenje kao quarterstaff; posjedovanje ne daje poznavanje oružja.",
    "Štap kao fokus",
  ],
  Wand: [
    "A wand arcane focus for eligible spellcasters. This ordinary focus has no charged attacks, bonuses, or spells of its own.",
    "Štapić kao arkanski fokus za prikladne čarobnjake. Običan fokus nema naboje, bonuse ni vlastite čarolije.",
    "Čarobni štapić kao fokus",
  ],
  "Sprig of mistletoe": [
    "A natural druidic focus replacing eligible inexpensive material components of druid spells. It grants no additional nature spells.",
    "Prirodni druidski fokus zamjenjuje prikladne jeftine materijale druidskih čarolija. Ne daje dodatne čarolije.",
    "Grančica imele",
  ],
  Totem: [
    "A sacred natural object serving as a druidic spell focus. This equipment is separate from the Totem Warrior subclass's chosen animal benefits.",
    "Sveti prirodni predmet kao druidski fokus. Oprema je zasebna od odabranih životinjskih prednosti Totem Warriora.",
    "Totem",
  ],
  "Wooden staff": [
    "A wooden druidic focus for appropriate material components. A staff's weapon use follows quarterstaff rules rather than giving free magical attacks.",
    "Drveni druidski fokus za prikladne materijale. Borbena uporaba slijedi quarterstaff, bez besplatnih čarobnih napada.",
    "Drveni druidski štap",
  ],
  "Yew wand": [
    "A yew druidic focus. It substitutes only components allowed by the druid's focus rule, not specifically priced or consumed materials.",
    "Druidski fokus od tise. Zamjenjuje samo dopuštene materijale, a ne sastavnice s cijenom ili potrošnjom.",
    "Štapić od tise",
  ],
  Amulet: [
    "A holy symbol clerics and paladins may visibly wear, hold, or bear on a shield for eligible spell materials. No divine powers come from the item alone.",
    "Sveti simbol koji cleric i paladin nose vidljivo, drže ili imaju na štitu za prikladne materijale. Sam predmet ne daje božanske moći.",
    "Amulet svetog simbola",
  ],
  Emblem: [
    "A holy emblem, often displayed on a shield, for cleric/paladin spell focus use. It does not itself grant shield proficiency or extra AC.",
    "Sveti grb, često na štitu, za fokus clerica i paladina. Sam ne daje poznavanje štita niti dodatni AC.",
    "Grb svetog simbola",
  ],
  Reliquary: [
    "A small container of a sacred relic functioning as a holy symbol for clerics and paladins. It has no listed magical bonus by itself.",
    "Mali spremnik svete relikvije kao sveti simbol clerica i paladina. Sam nema navedeni čarobni bonus.",
    "Relikvijar",
  ],
  Abacus: [
    "A counting frame for arithmetic, accounting, and keeping records. The PHB grants no automatic numeric check bonus for ownership.",
    "Računaljka za aritmetiku, račune i evidenciju. PHB ne daje automatski brojčani bonus za posjedovanje.",
    "Abak",
  ],
  "Acid (vial)": [
    "As an action, splash within 5 feet or throw to 20 feet using an improvised ranged attack. A hit deals 2d6 acid damage and expends the vial.",
    "Radnjom polijte do 5 stopa ili bacite do 20 kao improvizirani dalekometni napad. Pogodak daje 2d6 kisele štete i troši bočicu.",
    "Kiselina (bočica)",
  ],
  "Alchemist's fire (flask)": [
    "Throw up to 20 feet with an action and improvised ranged attack. A hit burns for 1d4 fire at each target turn start; an action and DC 10 Dexterity check extinguish it.",
    "Radnjom bacite do 20 stopa improviziranim napadom. Pogodak gori za 1d4 vatrene na početku poteza mete; radnja i Spretnost DC 10 gase.",
    "Alkemičarska vatra",
  ],
  "Antitoxin (vial)": [
    "Drinking grants advantage on saves against poison for 1 hour. It does not cure every existing poison, grant poison resistance, or benefit undead/constructs.",
    "Pijenje daje prednost spašavanja protiv otrova jedan sat. Ne liječi svaki postojeći otrov, ne daje otpor niti djeluje na nemrtve i konstrukte.",
    "Protuotrov",
  ],
  Backpack: [
    "Carry up to 1 cubic foot or 30 pounds of gear inside, with suitable items such as bedrolls or rope strapped outside.",
    "Unutra nosi do jedne kubične stope ili 30 funti opreme; prikladne vreće i užad vežu se izvana.",
    "Ruksak",
  ],
  "Ball bearings (bag of 1,000)": [
    "Spend an action covering a level 10-foot square. Crossing requires DC 10 Dexterity save or falling prone; moving at half speed avoids the save.",
    "Radnjom prekrijte ravan kvadrat 10 stopa. Prolazak traži Spretnost DC 10 ili pad; pola brzine izbjegava spašavanje.",
    "Kuglični ležajevi (1.000)",
  ],
  Barrel: [
    "A barrel holds 40 gallons of liquid or 4 cubic feet of solid material. Its listed weight is empty, not the contents.",
    "Bačva prima 40 galona tekućine ili četiri kubične stope tvari. Navedena težina ne uključuje sadržaj.",
    "Bačva",
  ],
  Basket: [
    "A woven carrier holding 2 cubic feet or 40 pounds of gear. It is not a sealed watertight container.",
    "Pleten spremnik za dvije kubične stope ili 40 funti opreme. Nije vodonepropusno zatvoren.",
    "Košara",
  ],
  Bedroll: [
    "Portable bedding for resting on a journey. A bedroll supplies comfort but does not waive long-rest requirements or exposure hazards.",
    "Prenosiva posteljina za putni odmor. Daje udobnost, ali ne uklanja uvjete dugog odmora ni opasnosti okoliša.",
    "Vreća za spavanje",
  ],
  Bell: [
    "A small sounding bell for signals or a simple improvised alarm. It does not independently detect intrusion without a triggering arrangement.",
    "Malo zvonce za znakove ili improvizirani alarm. Bez okidača samo ne otkriva uljeze.",
    "Zvonce",
  ],
  Blanket: [
    "A blanket for warmth and ordinary bedding. The DM decides its usefulness in environmental exposure; it has no universal cold resistance.",
    "Deka za toplinu i postelju. DM odlučuje korist u okolišu; ne daje opći otpor hladnoći.",
    "Deka",
  ],
  "Block and tackle": [
    "Pulleys allow you to hoist up to four times the weight you can normally lift when suitably anchored. They do not increase carrying capacity while walking.",
    "Prikladno učvršćeni koloturi podižu do četiri puta normalnog tereta. Ne povećavaju nosivost tijekom hoda.",
    "Koloturnik",
  ],
  Book: [
    "A book of ordinary written lore or illustrations. Its subject and useful knowledge need to be specified; it is not automatically a wizard spellbook.",
    "Knjiga običnog znanja ili slika. Tema i korisne informacije trebaju biti određene; nije automatski čarobnjačka knjiga.",
    "Knjiga",
  ],
  "Bottle, glass": [
    "A glass container holding 1½ pints of liquid. Buying an empty bottle supplies no potion, acid, or other contents.",
    "Staklena posuda za jednu i pol pintu tekućine. Prazna boca ne daje napitak, kiselinu ni sadržaj.",
    "Staklena boca",
  ],
  Bucket: [
    "A bucket holds 3 gallons of liquid or half a cubic foot of solid material. Contents add their own weight.",
    "Vjedro prima tri galona tekućine ili pola kubične stope tvari. Sadržaj dodaje svoju težinu.",
    "Vjedro",
  ],
  "Caltrops (bag of 20)": [
    "An action covers a 5-foot square. Entering requires DC 15 Dexterity save or 1 piercing damage, stopped movement, and −10 walking speed until healing. Half-speed movement avoids the save.",
    "Radnja pokriva kvadrat 5 stopa. Ulazak traži Spretnost DC 15 ili 1 probodne štete, prekid kretanja i −10 brzine do liječenja. Pola brzine izbjegava.",
    "Ježinci (20)",
  ],
  Candle: [
    "Burns for 1 hour, shedding bright light 5 feet and dim light for another 5 feet. It provides no darkness-piercing magic.",
    "Gori sat vremena, jako svijetli 5 stopa i prigušeno još 5. Ne probija čarobnu tamu.",
    "Svijeća",
  ],
  "Case, crossbow bolt": [
    "A wooden case holds up to 20 crossbow bolts. Ammunition is purchased separately unless a package explicitly includes it.",
    "Drvena kutija prima do 20 vijaka. Streljivo se kupuje zasebno osim kada je izričito u paketu.",
    "Kutija za samostrelsko streljivo",
  ],
  "Case, map or scroll": [
    "A protective case holds up to ten paper sheets or five parchment sheets rolled up. It contains no map or spell scroll by default.",
    "Zaštitni tuljac prima deset listova papira ili pet pergamenta. Ne sadrži kartu ni čarobni svitak sam po sebi.",
    "Tuljac za kartu ili svitak",
  ],
  "Chain (10 feet)": [
    "A 10-foot chain has 10 HP and can be burst with a DC 20 Strength check. Anchoring and locks are separate requirements.",
    "Lanac od 10 stopa ima 10 HP i puca provjerom Snage DC 20. Učvršćenje i brava zasebni su zahtjevi.",
    "Lanac (10 stopa)",
  ],
  "Chalk (1 piece)": [
    "A piece of chalk for writing and route marking on suitable surfaces. Weather and surface conditions affect durability.",
    "Komad krede za pisanje i označavanje puta na prikladnoj površini. Vrijeme i podloga određuju trajnost.",
    "Kreda",
  ],
  Chest: [
    "A large container holds up to 12 cubic feet or 300 pounds of gear. A chest does not include a lock unless specified.",
    "Veliki spremnik prima do 12 kubičnih stopa ili 300 funti opreme. Brava nije uključena osim ako je navedena.",
    "Sanduk",
  ],
  "Climber's kit": [
    "Use an action to anchor the harness. You cannot fall more than 25 feet from the anchor or climb farther than 25 feet away without releasing it.",
    "Radnjom učvrstite pojas. Ne padate dalje od 25 stopa od sidra niti se penjete dalje bez otpuštanja.",
    "Penjački pribor",
  ],
  "Clothes, common": [
    "Everyday clothing for ordinary work and travel. It gives no armor AC or automatic disguise proficiency.",
    "Svakodnevna odjeća za posao i put. Ne daje oklopni AC ni automatsko poznavanje prerušavanja.",
    "Obična odjeća",
  ],
  "Clothes, costume": [
    "An outfit for performance or a particular visual role. The costume is equipment, not an automatic successful impersonation.",
    "Odjeća za nastup ili određeni izgled. Kostim je oprema, a ne automatski uspješno predstavljanje.",
    "Kostim",
  ],
  "Clothes, fine": [
    "Formal high-quality clothing suited to wealthy social settings. Social access depends on context and background features, not clothing alone.",
    "Kvalitetna svečana odjeća za imućna društva. Društveni pristup ovisi o kontekstu i pozadini, ne samo odjeći.",
    "Fina odjeća",
  ],
  "Clothes, traveler's": [
    "Practical clothing designed for extended journeys. It supplies no special resistance or armor training.",
    "Praktična odjeća za duga putovanja. Ne daje poseban otpor ni poznavanje oklopa.",
    "Putna odjeća",
  ],
  "Component pouch": [
    "Supplies ordinary material spell components without a stated price. Specifically priced materials must still be acquired, and consumed materials must be replaced.",
    "Daje obične materijalne sastavnice bez navedene cijene. Skupi materijali još se nabavljaju, potrošni nadoknađuju.",
    "Torbica sa sastavnicama",
  ],
  Crowbar: [
    "Gain advantage on Strength checks when its leverage can actually help. It does not grant advantage on all Strength checks or attacks.",
    "Imate prednost provjera Snage kada poluga stvarno pomaže. Ne daje prednost svim provjerama Snage ni napadima.",
    "Pajser",
  ],
  "Fishing tackle": [
    "Rod, line, hooks, and related fishing supplies. Catching food depends on time, water, and any check the DM requires.",
    "Štap, struna, udice i ribolovne potrepštine. Ulov ovisi o vremenu, vodi i provjeri koju traži DM.",
    "Ribolovni pribor",
  ],
  "Flask or tankard": [
    "A small drinking container holding 1 pint. Its contents and their weight are separate.",
    "Mala posuda za piće obujma jedne pinte. Sadržaj i njegova težina zasebni su.",
    "Čutura ili krigla",
  ],
  "Grappling hook": [
    "Attach a rope to a suitable anchor point when conditions allow. It does not guarantee attachment, climbing success, or a combat grapple.",
    "Pričvrstite uže na prikladno sidrište ako uvjeti dopuštaju. Ne jamči učvršćenje, uspjeh penjanja ni borbeni zahvat.",
    "Kuka za penjanje",
  ],
  Hammer: [
    "A small hand tool for driving pitons, nails, and similar work. Using it as a weapon follows improvised-weapon rules unless the DM rules otherwise.",
    "Mali alat za klinove i čavle. Kao oružje slijedi improvizirana pravila osim ako DM odluči drukčije.",
    "Čekić",
  ],
  "Hammer, sledge": [
    "A heavy work hammer for breaking or driving material. It is not automatically a trained warhammer or maul.",
    "Težak radni čekić za lomljenje i zabijanje. Nije automatski poznati warhammer ili maul.",
    "Malj za rad",
  ],
  "Healer's kit": [
    "Ten uses. Spend an action and one use to stabilize a creature at 0 HP without a Medicine check. HP restoration requires the Healer feat or another rule.",
    "Deset uporaba. Radnjom i jednom uporabom stabilizirajte metu na 0 HP bez Medicine. Obnova HP traži Healer ili drugo pravilo.",
    "Liječnički pribor",
  ],
  "Holy water (flask)": [
    "Splash within 5 feet or throw 20 feet using an action and improvised ranged attack. A hit deals 2d6 radiant damage only to a fiend or undead.",
    "Radnjom polijte do 5 stopa ili bacite do 20 improviziranim napadom. Pogodak daje 2d6 blistave štete samo fiendu ili nemrtvom.",
    "Sveta voda",
  ],
  Hourglass: [
    "An ordinary sand timepiece for measuring a fixed interval. It supplies no magical time control or universal precision bonus.",
    "Običan pješčani mjerač stalnog intervala. Ne daje čarobnu kontrolu vremena ni opći bonus preciznosti.",
    "Pješčani sat",
  ],
  "Hunting trap": [
    "Set with an action. A trigger allows DC 13 Dexterity save or 1d4 piercing damage and stopped movement; escape uses an action and DC 13 Strength check, failed attempts cause 1 damage.",
    "Postavite radnjom. Okidač traži Spretnost DC 13 ili 1d4 probodne štete i prekid kretanja; bijeg troši radnju i Snagu DC 13, neuspjeh daje 1 štete.",
    "Lovačka zamka",
  ],
  "Ink (1 ounce bottle)": [
    "A bottle of ordinary writing ink. Special spell-copying materials and specifically priced spell inks follow their own costs.",
    "Boca obične tinte. Posebni materijali prepisivanja i čarobne tinte s cijenom imaju vlastite troškove.",
    "Tinta (unca)",
  ],
  "Ink pen": [
    "A reusable writing implement requiring ink and a suitable surface. It does not include a bottle of ink.",
    "Višekratni pisaći alat koji traži tintu i podlogu. Boca tinte nije uključena.",
    "Pero za tintu",
  ],
  "Jug or pitcher": [
    "A liquid container holding 1 gallon. Weight is for the empty vessel; liquid is additional.",
    "Posuda za jedan galon tekućine. Težina je za praznu posudu; tekućina se dodaje.",
    "Vrč",
  ],
  "Ladder (10 foot)": [
    "A 10-foot ladder helps reach or cross suitable gaps when safely positioned. It does not remove climbing or balance checks in dangerous conditions.",
    "Ljestve od 10 stopa pomažu dohvatiti i prijeći prikladne razmake. Opasni uvjeti i dalje mogu tražiti penjanje ili ravnotežu.",
    "Ljestve (10 stopa)",
  ],
  Lamp: [
    "One oil flask burns 6 hours, giving bright light 15 feet and dim light another 30 feet.",
    "Jedna čutura ulja gori šest sati, dajući jako svjetlo 15 stopa i prigušeno još 30.",
    "Svjetiljka",
  ],
  "Lantern, bullseye": [
    "One oil flask burns 6 hours. A focused cone shines bright for 60 feet and dim for 60 more.",
    "Jedna čutura ulja gori šest sati. Usmjeren stožac svijetli jako 60 stopa i prigušeno još 60.",
    "Usmjereni fenjer",
  ],
  "Lantern, hooded": [
    "One oil flask burns 6 hours, bright light 30 feet and dim light 30 more. An action lowers the hood to only dim light within 5 feet.",
    "Jedna čutura ulja gori šest sati, jako 30 stopa i prigušeno još 30. Radnjom spustite sjenilo na samo prigušenih 5 stopa.",
    "Zasjenjeni fenjer",
  ],
  Lock: [
    "Includes its key. Picking the standard lock requires thieves'-tools proficiency and a DC 15 Dexterity check; superior locks may differ.",
    "Uključuje ključ. Obična brava traži poznavanje lopovskog alata i Spretnost DC 15; bolje brave mogu se razlikovati.",
    "Brava",
  ],
  "Magnifying glass": [
    "Gain advantage on checks to appraise or inspect small/highly detailed items. Strong sunlight, tinder, and about 5 minutes can start a fire.",
    "Imate prednost pregleda ili procjene malih i detaljnih predmeta. Jako sunce, kresivo i oko pet minuta mogu zapaliti vatru.",
    "Povećalo",
  ],
  Manacles: [
    "Restrain Small/Medium creatures physically: escape Dexterity DC 20, break Strength DC 20, or pick with thieves' tools Dexterity DC 15. They have 15 HP and a key.",
    "Fizički vežu Mala i Srednja stvorenja: bijeg Spretnost DC 20, lom Snaga DC 20 ili alat za brave DC 15. Imaju 15 HP i ključ.",
    "Lisice",
  ],
  "Mess kit": [
    "A compact cup, cutlery, and a container whose halves can be used for eating or simple cooking.",
    "Kompaktna čaša, pribor i posuda čije polovice služe jelu ili jednostavnom kuhanju.",
    "Pribor za jelo",
  ],
  "Mirror, steel": [
    "A small reflective steel mirror for grooming, signals, or looking around an angle where practical. It provides no magical sight.",
    "Malo čelično ogledalo za uređivanje, znakove ili pogled oko kuta gdje je izvedivo. Ne daje čarobni vid.",
    "Čelično ogledalo",
  ],
  "Oil (flask)": [
    "Fuel or an improvised thrown coating. Fire before it dries adds 5 damage; burning a 5-foot square lasts two rounds and deals 5 fire once per turn on entry/end.",
    "Gorivo ili improvizirano bačeni premaz. Vatra prije sušenja dodaje 5 štete; zapaljeni kvadrat 5 stopa gori dvije runde i daje 5 vatrene jednom po potezu pri ulasku ili kraju.",
    "Ulje (čutura)",
  ],
  "Paper (one sheet)": [
    "One ordinary writing sheet for records, maps, or messages; not a prepared spell scroll.",
    "List za zapise, karte i poruke; nije pripremljeni čarobni svitak.",
    "Papir (list)",
  ],
  "Parchment (one sheet)": [
    "One sheet of parchment for durable writing or drawing. Spell transcription has additional class-specific costs.",
    "List pergamenta za pisanje i crtanje. Prepisivanje čarolija ima dodatne klasne troškove.",
    "Pergament (list)",
  ],
  "Perfume (vial)": [
    "Scented liquid for grooming or social presentation. It does not give a universal Charisma bonus.",
    "Mirisna tekućina za uređivanje i društvenu pojavu. Ne daje opći bonus Karizme.",
    "Parfem",
  ],
  "Pick, miner's": [
    "A digging tool for suitable rock and earth. It is not automatically a war pick or an instant tunneling device.",
    "Alat za prikladan kamen i zemlju. Nije automatski war pick niti trenutačno kopa tunel.",
    "Rudarski pijuk",
  ],
  Piton: [
    "An iron anchor spike used with suitable rock and tools. Placement and load safety depend on the surface.",
    "Željezni sidreni klin za prikladnu stijenu i alat. Položaj i sigurnost tereta ovise o površini.",
    "Klin za penjanje",
  ],
  "Poison, basic (vial)": [
    "Use an action to coat one piercing/slashing weapon or three ammunition pieces. Hits within 1 minute allow DC 10 Constitution save or 1d4 poison damage.",
    "Radnjom premažite jedno probodno ili rezno oružje ili tri streljiva. Pogoci unutar minute daju spašavanje Izdržljivosti DC 10 ili 1d4 otrovne štete.",
    "Obični otrov",
  ],
  "Pole (10-foot)": [
    "A long probing pole for checking reachable surfaces or manipulating objects from a safer distance. It is not an automatic trap detector.",
    "Duga motka za opipavanje površina i pomicanje predmeta sa sigurnije udaljenosti. Nije automatski detektor zamki.",
    "Motka (10 stopa)",
  ],
  "Pot, iron": [
    "An iron cooking vessel holding 1 gallon. It supplies a container, not food or fuel.",
    "Željezna posuda za kuhanje od jednog galona. Daje spremnik, a ne hranu ili gorivo.",
    "Željezni lonac",
  ],
  "Potion of healing": [
    "Drinking or administering uses an action under 2014 rules and restores 2d4 + 2 HP. The listed potion is consumed once.",
    "Pijenje ili davanje troši radnju prema 2014 pravilima i vraća 2d4 + 2 HP. Napitak se troši jednom.",
    "Napitak liječenja",
  ],
  Pouch: [
    "A small carrier holds one-fifth cubic foot or 6 pounds. It can store ammunition or coins but is not a component pouch.",
    "Mali spremnik za petinu kubične stope ili šest funti. Prima streljivo i novac, ali nije torbica sastavnica.",
    "Torbica",
  ],
  Quiver: [
    "A carrier for up to 20 arrows. It does not create or include arrows unless the chosen equipment package says so.",
    "Spremnik za do 20 strijela. Ne stvara i ne uključuje strijele osim ako paket kaže.",
    "Tobolac",
  ],
  "Ram, portable": [
    "Add +4 to Strength checks to break doors with this ram. One helper can give advantage while assisting its use.",
    "Dodajte +4 provjerama Snage za razbijanje vrata. Jedan pomagač može dati prednost pomažući uporabu.",
    "Prijenosni ovan",
  ],
  "Rations (1 day)": [
    "Preserved food for one day's ordinary travel requirements. Water is separate and larger creatures may need more food.",
    "Sačuvana hrana za jedan dan običnog puta. Voda je zasebna, a veće mete mogu trebati više.",
    "Obrok za jedan dan",
  ],
  Robes: [
    "A loose cloth outfit often worn by scholars or clergy. It grants no armor AC or magic by itself.",
    "Široka odjeća učenjaka ili svećenika. Sama ne daje oklopni AC ni magiju.",
    "Odora",
  ],
  "Rope, hempen (50 feet)": [
    "A 50-foot rope has 2 HP and bursts with DC 17 Strength. Secure knots, anchors, and safe load depend on circumstances.",
    "Uže od 50 stopa ima 2 HP i puca Snagom DC 17. Čvorovi, sidrišta i teret ovise o okolnostima.",
    "Konopljeno uže (50 stopa)",
  ],
  "Rope, silk (50 feet)": [
    "A lighter 50-foot rope with 2 HP and DC 17 Strength to burst. Its price does not grant magical strength.",
    "Lakše uže od 50 stopa s 2 HP i Snagom DC 17 za pucanje. Cijena ne daje čarobnu čvrstoću.",
    "Svileno uže (50 stopa)",
  ],
  Sack: [
    "A simple container for 1 cubic foot or 30 pounds of gear, with the contents adding their own weight.",
    "Jednostavan spremnik za jednu kubičnu stopu ili 30 funti opreme uz dodatnu težinu sadržaja.",
    "Vreća",
  ],
  "Scale, merchant's": [
    "Balance and weights measure small items up to 2 pounds for trade. It measures mass, not authenticity or magical value.",
    "Vaga i utezi mjere male predmete do dvije funte za trgovinu. Mjeri masu, a ne autentičnost ili čarobnu vrijednost.",
    "Trgovačka vaga",
  ],
  "Sealing wax": [
    "Wax for sealing documents and making impressions. A convincing forgery still requires the relevant skill/tool check.",
    "Vosak za zatvaranje dokumenata i otiske. Uvjerljiva krivotvorina i dalje traži relevantnu provjeru.",
    "Pečatni vosak",
  ],
  Shovel: [
    "A tool for digging loose soil and moving material. Excavation takes time based on the ground and labor available.",
    "Alat za kopanje rahle zemlje i premještanje tvari. Vrijeme ovisi o tlu i dostupnom radu.",
    "Lopata",
  ],
  "Signal whistle": [
    "A small whistle for audible signals. Distance heard depends on surroundings; it is not a magical communication link.",
    "Mala zviždaljka za čujne znakove. Domet ovisi o okolišu; nije čarobna veza.",
    "Signalna zviždaljka",
  ],
  "Signet ring": [
    "A ring bearing an identifying seal for wax impressions. Its authority depends on the actual owner and society.",
    "Prsten sa znakom za pečatni vosak. Autoritet ovisi o stvarnom vlasniku i društvu.",
    "Pečatni prsten",
  ],
  Soap: [
    "Ordinary soap for washing people and gear. It does not remove poisons, disease, curses, or magical effects by itself.",
    "Običan sapun za ljude i opremu. Sam ne uklanja otrove, bolesti, kletve ni magiju.",
    "Sapun",
  ],
  Spellbook: [
    "A 100-page blank wizard spellbook. A new book contains no spells; copying eligible wizard spells requires class rules, time, and special materials.",
    "Prazna čarobnjačka knjiga od 100 stranica. Nova nema čarolije; prepisivanje traži klasna pravila, vrijeme i posebne materijale.",
    "Knjiga čarolija",
  ],
  "Spikes, iron (10)": [
    "Ten iron spikes for anchoring, wedging, or similar physical work. They are ordinary gear, not automatically weapons or a trap.",
    "Deset željeznih klinova za učvršćenje, podupiranje i rad. Obična su oprema, ne automatsko oružje ili zamka.",
    "Željezni klinovi (10)",
  ],
  Spyglass: [
    "Magnifies viewed objects to twice their apparent size. It grants no stated universal Perception bonus or darkvision.",
    "Povećava prividnu veličinu predmeta dvostruko. Ne daje opći bonus Opažanja ni darkvision.",
    "Dalekozor",
  ],
  "Tent, two-person": [
    "Portable canvas shelter sized to sleep two. It does not prevent all environmental hazards or remove watch requirements.",
    "Prenosivi platneni zaklon za dvije osobe. Ne uklanja sve okolišne opasnosti ni potrebu straže.",
    "Šator za dvije osobe",
  ],
  Tinderbox: [
    "Flint, steel, and tinder. Lighting exposed fuel such as a torch takes an action; starting other ordinary fires takes 1 minute.",
    "Kremen, čelik i kresivo. Paljenje izloženog goriva poput baklje troši radnju; druge obične vatre minutu.",
    "Kutija za paljenje",
  ],
  Torch: [
    "Burns 1 hour, bright light 20 feet and dim another 20. A successful melee attack with a burning torch deals 1 fire damage.",
    "Gori jedan sat, jako svijetli 20 stopa i prigušeno još 20. Uspješan bliski napad zapaljenom bakljom daje 1 vatrene štete.",
    "Baklja",
  ],
  Vial: [
    "A small liquid vessel holding 4 ounces. It is empty unless a listed item supplies a particular liquid.",
    "Mala posuda za četiri unce tekućine. Prazna je ako predmet ne navodi određeni sadržaj.",
    "Bočica",
  ],
  Waterskin: [
    "Holds 4 pints of liquid; the listed 5-pound weight is full. Track whether it is filled when calculating carried weight.",
    "Prima četiri pinte tekućine; navedenih pet funti je puna. Za nošenu težinu pratite napunjenost.",
    "Mješina za vodu",
  ],
  Whetstone: [
    "A sharpening stone for ordinary blade maintenance. It gives no automatic attack or damage bonus.",
    "Kamen za obično oštrenje oštrica. Ne daje automatski bonus napada ni štete.",
    "Brus",
  ],
};
const toolFamily = (name: string) =>
  /^(Alchemist|Brewer|Calligrapher|Carpenter|Cartographer|Cobbler|Cook|Glassblower|Jeweler|Leatherworker|Mason|Painter|Potter|Smith|Tinker|Weaver|Woodcarver)'s /.test(
    name,
  )
    ? "artisan"
    : [
          "Bagpipes",
          "Drum",
          "Dulcimer",
          "Flute",
          "Lute",
          "Lyre",
          "Horn",
          "Pan flute",
          "Shawm",
          "Viol",
        ].includes(name)
      ? "instrument"
      : /set$/i.test(name)
        ? "game"
        : "kit";
const artisanCrafts: Record<string, [string, string, string]> = {
  "Alchemist's supplies": [
    "Alkemičarski pribor",
    "alchemical mixtures and laboratory analysis",
    "alkemijske smjese i laboratorijsku analizu",
  ],
  "Brewer's supplies": [
    "Pivarski pribor",
    "brewing and fermentation",
    "pivarstvo i fermentaciju",
  ],
  "Calligrapher's supplies": [
    "Kaligrafski pribor",
    "fine lettering and ornamental writing",
    "lijepo i ukrasno pisanje",
  ],
  "Carpenter's tools": [
    "Tesarski alat",
    "timber construction and wooden structures",
    "drvene konstrukcije",
  ],
  "Cartographer's tools": [
    "Kartografski alat",
    "drawing and reading accurate maps",
    "izradu i čitanje karata",
  ],
  "Cobbler's tools": [
    "Postolarski alat",
    "making and repairing footwear",
    "izradu i popravak obuće",
  ],
  "Cook's utensils": [
    "Kuharski pribor",
    "preparing food and cooking",
    "pripremu hrane i kuhanje",
  ],
  "Glassblower's tools": [
    "Staklarski alat",
    "forming and repairing glass objects",
    "oblikovanje i popravak stakla",
  ],
  "Jeweler's tools": [
    "Zlatarski alat",
    "gem setting and fine jewelry",
    "ugradnju dragulja i nakit",
  ],
  "Leatherworker's tools": [
    "Kožarski alat",
    "cutting, stitching, and working leather",
    "rezanje, šivanje i obradu kože",
  ],
  "Mason's tools": [
    "Klesarski alat",
    "stonework and masonry",
    "kamenorezačke i zidarske radove",
  ],
  "Painter's supplies": [
    "Slikarski pribor",
    "painting images and pigments",
    "slikanje i boje",
  ],
  "Potter's tools": [
    "Lončarski alat",
    "shaping and firing clay vessels",
    "oblikovanje i pečenje glinenih posuda",
  ],
  "Smith's tools": [
    "Kovački alat",
    "forging and repairing metalwork",
    "kovanje i popravak metala",
  ],
  "Tinker's tools": [
    "Popravljački alat",
    "mending ordinary objects and mechanisms",
    "popravak običnih predmeta i mehanizama",
  ],
  "Weaver's tools": [
    "Tkalački alat",
    "weaving and working cloth",
    "tkanje i obradu platna",
  ],
  "Woodcarver's tools": [
    "Drvorezbarski alat",
    "carving and shaping small wooden objects",
    "rezbarenje i oblikovanje drva",
  ],
};
for (const [name, [hrName, en, hr]] of Object.entries(artisanCrafts))
  gearDescriptions[name] = [
    `Artisan tools for ${en}. This individual proficiency adds proficiency bonus on relevant craft checks using the ability the DM calls for. Ownership grants no skill, crafting formula, or automatic success.`,
    `Obrtnički alat za ${hr}. Zasebno poznavanje dodaje bonus relevantnim provjerama svojstvom koje odabere DM. Posjedovanje ne daje vještinu, recept ni automatski uspjeh.`,
    hrName,
  ];
Object.assign(gearDescriptions, {
  "Exotic saddle": [
    "A saddle required to ride an aquatic or flying mount. The mount itself and any appropriate training are separate.",
    "Sedlo potrebno za vodenu ili leteću jahaću životinju. Životinja i prikladna obuka su zasebne.",
    "Egzotično sedlo",
  ],
  "Military saddle": [
    "A combat-supporting saddle grants advantage on checks to remain mounted. It adds no AC or attack bonus.",
    "Borbeno sedlo daje prednost provjera da ostanete na životinji. Ne daje AC ni bonus napada.",
    "Vojno sedlo",
  ],
  "Pack saddle": [
    "A saddle designed for securing carried goods on a pack animal. It grants no additional carrying capacity beyond the animal's normal limit.",
    "Sedlo za teret na tovarnoj životinji. Ne povećava njezinu uobičajenu nosivost.",
    "Tovarno sedlo",
  ],
  "Riding saddle": [
    "A standard riding saddle for a suitable land mount. The Military saddle's special advantage is not included.",
    "Obično sedlo za prikladnu kopnenu životinju. Ne uključuje prednost vojnog sedla.",
    "Jahaće sedlo",
  ],
  "Feed (per day)": [
    "A day's listed animal feed, weighing 10 pounds. A particular animal's actual food needs depend on its size and the environment.",
    "Dnevna navedena hrana za životinju od deset funti. Stvarne potrebe ovise o veličini i okolišu.",
    "Hrana za životinju (dan)",
  ],
  "Stabling (per day)": [
    "Daily lodging for an ordinary mount, priced separately from purchasing or feeding it. Availability depends on local facilities.",
    "Dnevni smještaj obične jahaće životinje, zasebno od kupnje i hrane. Ovisi o lokalnim stajama.",
    "Staja (dan)",
  ],
  "Bit and bridle": [
    "A bit and headgear for directing a suitable riding animal. It does not train the mount or grant Animal Handling proficiency.",
    "Žvale i uzda za usmjeravanje prikladne jahaće životinje. Ne obučava životinju niti daje vještinu.",
    "Žvale i uzda",
  ],
  Saddlebags: [
    "Bags secured to a saddle for carrying possessions. Their contents count against the animal's carrying capacity.",
    "Bisage na sedlu za stvari. Sadržaj ulazi u nosivost životinje.",
    "Bisage",
  ],
  "Disguise kit": [
    "Cosmetics, dyes, and props for physical disguises. Its proficiency applies to relevant disguise checks, separate from Deception and magical illusions.",
    "Kozmetika, boje i rekviziti za fizičko prerušavanje. Poznavanje vrijedi za provjere prerušavanja, odvojeno od Obmane i iluzija.",
    "Pribor za prerušavanje",
  ],
  "Forgery kit": [
    "Writing, seals, and finishing supplies for forged documents. Its own proficiency helps relevant physical-forgery checks; it does not teach languages or ensure the document is accepted.",
    "Pisanje, pečati i materijali za krivotvorene dokumente. Poznavanje pomaže fizičkoj krivotvorini; ne uči jezike niti jamči prihvaćanje.",
    "Krivotvoriteljski pribor",
  ],
  "Herbalism kit": [
    "Implements for identifying, preparing, and applying herbs. Proficiency is required to create antitoxin and healing potions under the PHB crafting rules; the kit itself contains neither finished potions nor a free healing action.",
    "Alat za prepoznavanje, pripremu i primjenu bilja. Poznavanje je potrebno za izradu protuotrova i napitaka liječenja prema PHB-u; pribor ne sadrži gotove napitke ni besplatno liječenje.",
    "Travarski pribor",
  ],
  "Navigator's tools": [
    "Instruments for charting sea routes and following navigation charts. Proficiency applies to checks to avoid becoming lost at sea; it is separate from operating a water vehicle.",
    "Instrumenti za morske rute i navigacijske karte. Poznavanje vrijedi za izbjegavanje gubljenja na moru; odvojeno je od upravljanja brodom.",
    "Navigacijski alat",
  ],
  "Poisoner's kit": [
    "Vials, chemicals, and implements for crafting or applying poisons. Proficiency applies to relevant checks but does not grant immunity, a poison supply, or unrestricted access to ingredients.",
    "Bočice, kemikalije i alat za izradu i primjenu otrova. Poznavanje pomaže provjerama, ali ne daje imunost, zalihe ni neograničen pristup sastojcima.",
    "Otrovarski pribor",
  ],
  "Thieves' tools": [
    "Picks and small implements for opening locks and disarming traps. Proficiency adds the proficiency bonus when applicable; the DM selects the ability and DC, and a tool kit does not make every trap disarmable.",
    "Otvarači i mali alati za brave i zamke. Poznavanje dodaje bonus kada vrijedi; DM bira svojstvo i DC, a pribor ne omogućuje deaktivaciju svake zamke.",
    "Lopovski alat",
  ],
});
export const otherEquipment: CatalogItem[] = otherEquipmentData.map((item) => {
  if (["Exotic", "Military", "Pack", "Riding"].includes(item.name)) {
    item.name = `${item.name} saddle`;
    item.kind = "gear";
  }
  if (item.name === "Feed (per day)") item.kind = "gear";
  if (["Bit and bridle", "Saddlebags"].includes(item.name)) item.kind = "gear";
  if (item.name === "Stabling (per day)") item.kind = "service";
  const detail = gearDescriptions[item.name];
  const family = toolFamily(item.name);
  const toolText =
    family === "artisan"
      ? `Tools for the ${item.name.replace(/'s /, " ")} craft. The individual tool proficiency adds your proficiency bonus to relevant craft checks; the DM chooses the ability. Owning tools does not grant training.`
      : family === "instrument"
        ? `A ${item.name.toLowerCase()} for musical performance. Its own proficiency applies to playing checks; a bard may use it as a spellcasting focus. It does not grant Performance skill proficiency.`
        : family === "game"
          ? `A ${item.name.toLowerCase()} for playing its particular game. Its separate tool proficiency applies to relevant game checks; knowing a different game does not grant this proficiency.`
          : `${item.name} supplies for its specific activity. Its individual proficiency applies to relevant checks; possessing the kit does not grant training.`;
  return {
    ...item,
    id: catalogId(item.name),
    nameHr: detail?.[2],
    sourceReference: equipmentSource,
    description:
      detail?.[0] ||
      (item.kind === "tool"
        ? toolText
        : item.kind === "vehicle"
          ? `${item.name}: ${item.speedMph ? `travel speed ${item.speedMph} miles per hour. ` : "Requires a suitable draft animal or rider as appropriate. "}Vehicle control in difficult circumstances can use land/water vehicle proficiency. Purchase does not provide a crew or proficiency.`
          : "This item has no implemented original explanation; review its PHB entry before applying a special effect."),
    descriptionHr:
      detail?.[1] ||
      (item.kind === "tool"
        ? `${item.name}: alat za ${family === "artisan" ? "odabrani obrt" : family === "instrument" ? "glazbeni nastup" : family === "game" ? "odabranu igru" : "poseban zadatak"}. Zasebno poznavanje dodaje bonus relevantnim provjerama; DM odabire svojstvo. Samo posjedovanje ne daje poznavanje.`
        : item.kind === "vehicle"
          ? `${item.name}: ${item.speedMph ? `brzina ${item.speedMph} milja na sat. ` : "Potreban je odgovarajući prijevoz ili vučna životinja. "}Teško upravljanje koristi poznavanje kopnenih ili vodenih vozila. Kupnja ne daje posadu niti poznavanje.`
          : "Izvorno objašnjenje ovog predmeta još nije izrađeno; posebne učinke provjerite u PHB-u."),
  };
});
const mountData = [
  { name: "Camel", costGp: 50, speedFt: 50, carryingCapacityLb: 480 },
  { name: "Donkey or mule", costGp: 8, speedFt: 40, carryingCapacityLb: 420 },
  { name: "Elephant", costGp: 200, speedFt: 40, carryingCapacityLb: 1320 },
  { name: "Draft horse", costGp: 50, speedFt: 40, carryingCapacityLb: 540 },
  { name: "Riding horse", costGp: 75, speedFt: 60, carryingCapacityLb: 480 },
  { name: "Mastiff", costGp: 25, speedFt: 40, carryingCapacityLb: 195 },
  { name: "Pony", costGp: 30, speedFt: 40, carryingCapacityLb: 225 },
  { name: "Warhorse", costGp: 400, speedFt: 60, carryingCapacityLb: 540 },
];
export const mounts: CatalogItem[] = mountData.map((item) => ({
  ...item,
  id: catalogId(item.name),
  kind: "mount",
  weightLb: 0,
  sourceReference: "PHB (2014), p. 157",
  description: `${item.name}: speed ${item.speedFt} feet and base carrying capacity ${item.carryingCapacityLb} pounds. Pulling a carriage/cart/chariot/sled/wagon permits up to five times this capacity including the vehicle. Purchase does not grant Animal Handling, a saddle, combat training, or companion subclass benefits.`,
  descriptionHr: `${item.name}: brzina ${item.speedFt} stopa, osnovna nosivost ${item.carryingCapacityLb} funti. Vuča vozila dopušta do pet puta taj teret uključujući vozilo. Kupnja ne daje vještinu, sedlo, borbenu obuku niti značajke pratioca.`,
}));
const serviceData = [
  { name: "Coach cab (Between towns)", costGp: 0.03, unit: "mile" },
  { name: "Coach cab (Within a city)", costGp: 0.01, unit: "use" },
  { name: "Hireling (Skilled)", costGp: 2, unit: "day" },
  { name: "Hireling (Untrained)", costGp: 0.2, unit: "day" },
  { name: "Messenger", costGp: 0.02, unit: "mile" },
  { name: "Road or gate toll", costGp: 0.01, unit: "use" },
  { name: "Ship's passage", costGp: 0.1, unit: "mile" },
];
export const services: CatalogItem[] = serviceData.map((item) => ({
  ...item,
  id: catalogId(item.name),
  kind: "service",
  weightLb: 0,
  minimumCost: /Hireling/.test(item.name),
  sourceReference: "PHB (2014), p. 159",
  description: `${item.name}: ${item.costGp} gp per ${item.unit}. Availability and agreement depend on the settlement and provider; skilled hireling prices are a minimum, and dangerous work may cost more. Payment buys a service, not character proficiency or automatic obedience.`,
  descriptionHr: `${item.name}: ${item.costGp} gp po jedinici ${item.unit}. Dostupnost i dogovor ovise o mjestu i pružatelju; kvalificirani rad je najmanja cijena, opasan rad može biti skuplji. Plaćanje ne daje poznavanje ni automatsku poslušnost.`,
}));
export const toolCatalog = otherEquipment.filter(
  (item) => item.kind === "tool",
);
export const adventuringGear = otherEquipment.filter(
  (item) => item.kind === "gear",
);
export const barding: CatalogItem[] = armor
  .filter((item) => item.kind === "armor")
  .map((item) => ({
    id: `${item.id}-barding`,
    name: `${item.name} barding`,
    nameHr: `Oklop životinje: ${item.nameHr}`,
    kind: "gear",
    costGp: item.costGp * 4,
    weightLb: item.weightLb * 2,
    sourceReference: "PHB (2014), p. 155",
    description: `${item.name} armor fitted to an animal: four times the humanoid cost and twice its weight. The animal's armor proficiency and applicable AC/dexterity limits still matter; buying barding grants no proficiency.`,
    descriptionHr: `${item.nameHr} prilagođen životinji: četiri puta cijena i dvostruka težina. Poznavanje oklopa životinje i granice AC-a i Spretnosti i dalje vrijede; kupnja ne daje poznavanje.`,
  }));
const tradeData: [string, number, number][] = [
  ["Wheat (1 lb.)", 0.01, 1],
  ["Flour (1 lb.)", 0.02, 1],
  ["Chicken", 0.02, 0],
  ["Salt (1 lb.)", 0.05, 1],
  ["Iron (1 lb.)", 0.1, 1],
  ["Canvas (1 square yard)", 0.1, 0],
  ["Copper (1 lb.)", 0.5, 1],
  ["Cotton cloth (1 square yard)", 0.5, 0],
  ["Ginger (1 lb.)", 1, 1],
  ["Goat", 1, 0],
  ["Cinnamon (1 lb.)", 2, 1],
  ["Pepper (1 lb.)", 2, 1],
  ["Sheep", 2, 0],
  ["Cloves (1 lb.)", 3, 1],
  ["Pig", 3, 0],
  ["Silver (1 lb.)", 5, 1],
  ["Linen (1 square yard)", 5, 0],
  ["Silk (1 square yard)", 10, 0],
  ["Cow", 10, 0],
  ["Saffron (1 lb.)", 15, 1],
  ["Ox", 15, 0],
  ["Gold (1 lb.)", 50, 1],
  ["Platinum (1 lb.)", 500, 1],
];
export const tradeGoods: CatalogItem[] = tradeData.map(
  ([name, costGp, weightLb]) => ({
    id: catalogId(name),
    name,
    kind: "gear",
    costGp,
    weightLb,
    sourceReference: "PHB (2014), p. 157: Trade Goods",
    description: `${name}: a standard trade quantity valued at ${costGp} gp. Trade goods normally retain full value when exchanged, subject to a buyer and local availability. Any unlisted carrying weight must be recorded separately.`,
    descriptionHr: `${name}: uobičajena trgovačka količina vrijednosti ${costGp} gp. Trgovačka roba obično zadržava punu vrijednost uz kupca i dostupnost. Nenavedenu težinu treba zapisati zasebno.`,
  }),
);
export const lifestyleExpenses = [
  { name: "Wretched", gpPerDay: 0 },
  { name: "Squalid", gpPerDay: 0.1 },
  { name: "Poor", gpPerDay: 0.2 },
  { name: "Modest", gpPerDay: 1 },
  { name: "Comfortable", gpPerDay: 2 },
  { name: "Wealthy", gpPerDay: 4 },
  { name: "Aristocratic", gpPerDay: 10 },
].map((item) => ({
  ...item,
  minimum: item.name === "Aristocratic",
  sourceReference: "PHB (2014), pp. 157–158",
  description:
    "Daily lifestyle cost covers ordinary accommodation, food, drink, and equipment maintenance between adventures. Social effects and availability depend on the settlement.",
}));
export const equipmentCatalog: CatalogItem[] = [
  ...weapons,
  ...armor,
  ...packs,
  ...otherEquipment,
  ...mounts,
  ...services,
  ...barding,
  ...tradeGoods,
];
const equipmentAliases: Record<string, string> = {
  "leather-armor": "leather",
  "studded-leather-armor": "studded-leather",
  "wooden-shield": "shield",
  "staff-weapon": "quarterstaff",
  "belaying-pin-club": "club",
  "hempen-rope-50-feet": "rope-hempen-50-feet",
  "silk-rope-50-feet": "rope-silk-50-feet",
  "case-for-maps-and-scrolls": "case-map-or-scroll",
  "hooded-lantern": "lantern-hooded",
  "bullseye-lantern": "lantern-bullseye",
  "oil-flask": "oil-flask",
  "ink-bottle": "ink-1-ounce-bottle",
  "black-ink-bottle": "ink-1-ounce-bottle",
  "book-of-lore": "book",
  "fine-clothes": "clothes-fine",
  "common-clothes": "clothes-common",
  "travelers-clothes": "clothes-travelers",
  costume: "clothes-costume",
  "paper-sheet": "paper-one-sheet",
  "parchment-sheet": "parchment-one-sheet",
  "small-knife": "dagger",
  "iron-pot": "pot-iron",
  "bag-of-1000-ball-bearings": "ball-bearings-bag-of-1-000",
  "holy-symbol": "amulet",
  "druidic-focus": "sprig-of-mistletoe",
  "arcane-focus": "crystal",
  mule: "donkey-or-mule",
  "winter-blanket": "blanket",
  "perfume-vial": "perfume-vial",
};
export const findEquipment = (idOrName: string): CatalogItem | undefined => {
  const key = catalogId(idOrName),
    alias = equipmentAliases[key] || key;
  const unitAmmo: Record<string, [string, number]> = {
    arrows: ["Arrows (20)", 20],
    arrow: ["Arrows (20)", 20],
    "crossbow-bolts": ["Crossbow bolts (20)", 20],
    "crossbow-bolt": ["Crossbow bolts (20)", 20],
    "sling-bullets": ["Sling bullets (20)", 20],
    "blowgun-needles": ["Blowgun needles (50)", 50],
  };
  const ammo = unitAmmo[key];
  if (ammo) {
    const base = equipmentCatalog.find((item) => item.name === ammo[0]);
    if (base)
      return {
        ...base,
        id: key,
        name: idOrName,
        costGp: base.costGp / ammo[1],
        weightLb: base.weightLb / ammo[1],
      };
  }
  return equipmentCatalog.find(
    (item) => item.id === alias || catalogId(item.name) === alias,
  );
};
export const findWeapon = (idOrName: string) =>
  weapons.find(
    (item) =>
      item.id === idOrName ||
      item.name.toLowerCase() === idOrName.toLowerCase(),
  );
export const findArmor = (idOrName: string) =>
  armor.find(
    (item) =>
      item.id === idOrName ||
      item.name.toLowerCase() === idOrName.toLowerCase(),
  );

export type BackgroundEquipment = {
  items: { name: string; quantity: number }[];
  currency: { gp: number };
  choices: StartingEquipmentChoice[];
  sourceReference: string;
  note?: string;
};
const bg = (
  items: [string, number][],
  gp: number,
  choices: StartingEquipmentChoice[] = [],
  note?: string,
): BackgroundEquipment => ({
  items: items.map(([name, quantity]) => ({ name, quantity })),
  currency: { gp },
  choices,
  sourceReference: "PHB (2014), chapter 4, pp. 125–141",
  note,
});
const instruments = [
  "Bagpipes",
  "Drum",
  "Dulcimer",
  "Flute",
  "Lute",
  "Lyre",
  "Horn",
  "Pan flute",
  "Shawm",
  "Viol",
];
const artisans = [
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
export function getBackgroundEquipment(
  background: string,
  variant = "",
): BackgroundEquipment {
  const name = background.split(" / ")[0];
  const choice = (id: string, title: string, from: string[]) => ({
    ...group(`Background ${name}`, id, title, [bundle(title, [], from, 1)]),
    sourceReference: "PHB (2014), chapter 4: Background equipment",
  });
  switch (name) {
    case "Acolyte":
      return bg(
        [
          ["Holy symbol", 1],
          ["Incense stick", 5],
          ["Vestments", 1],
          ["Common clothes", 1],
          ["Pouch", 1],
        ],
        15,
        [
          choice("devotional", "Prayer book or prayer wheel", [
            "Prayer book",
            "Prayer wheel",
          ]),
        ],
      );
    case "Charlatan":
      return bg(
        [
          ["Fine clothes", 1],
          ["Disguise kit", 1],
          ["Pouch", 1],
        ],
        15,
        [
          choice("con", "Tools of your chosen con", [
            "Stoppered bottles of colored liquid",
            "Weighted dice set",
            "Marked playing cards",
            "Signet ring of an imaginary duke",
          ]),
        ],
      );
    case "Criminal":
      return bg(
        [
          ["Crowbar", 1],
          ["Dark common clothes with hood", 1],
          ["Pouch", 1],
        ],
        15,
        [],
        variant === "Spy"
          ? "Spy uses Criminal equipment and proficiencies; the contact is an information network."
          : undefined,
      );
    case "Entertainer":
      return bg(
        [
          ["Costume", 1],
          ["Pouch", 1],
        ],
        15,
        [
          choice(
            "instrument",
            variant === "Gladiator"
              ? "Instrument or unusual weapon"
              : "Musical instrument",
            variant === "Gladiator"
              ? [...instruments, "Trident", "Net"]
              : instruments,
          ),
          choice("admirer", "Token from an admirer", [
            "Love letter",
            "Lock of hair",
            "Small trinket",
          ]),
        ],
      );
    case "Folk Hero":
      return bg(
        [
          ["Shovel", 1],
          ["Iron pot", 1],
          ["Common clothes", 1],
          ["Pouch", 1],
        ],
        10,
        [choice("tool", "Artisan's tools", artisans)],
      );
    case "Guild Artisan":
      return bg(
        [
          ["Letter of introduction from guild", 1],
          ["Traveler's clothes", 1],
          ["Pouch", 1],
        ],
        15,
        variant === "Guild Merchant"
          ? [
              choice("merchant", "Merchant equipment", [
                ...artisans,
                "Mule and cart (replace artisan's tools)",
              ]),
            ]
          : [choice("tool", "Artisan's tools", artisans)],
        "Guild membership carries 5 gp monthly dues; possessions do not grant proficiency.",
      );
    case "Hermit":
      return bg(
        [
          ["Case of notes from studies or prayers", 1],
          ["Winter blanket", 1],
          ["Common clothes", 1],
          ["Herbalism kit", 1],
        ],
        5,
      );
    case "Noble":
      return bg(
        [
          ["Fine clothes", 1],
          ["Signet ring", 1],
          ["Scroll of pedigree", 1],
          ["Purse", 1],
        ],
        25,
        [],
        variant === "Knight (Retainers)"
          ? "Retainers replaces Position of Privilege and provides exactly three loyal noncombatant attendants. They do not fight, provide combat attacks or extra actions, or follow you into obvious danger."
          : variant === "Knight"
            ? "This Knight uses Position of Privilege. Select Knight (Retainers) to replace that feature with three noncombatant attendants."
            : undefined,
      );
    case "Outlander":
      return bg(
        [
          ["Staff", 1],
          ["Hunting trap", 1],
          ["Trophy from an animal you killed", 1],
          ["Traveler's clothes", 1],
          ["Pouch", 1],
        ],
        10,
      );
    case "Sage":
      return bg(
        [
          ["Black ink bottle", 1],
          ["Quill", 1],
          ["Small knife", 1],
          ["Letter from a dead colleague with an unanswered question", 1],
          ["Common clothes", 1],
          ["Pouch", 1],
        ],
        10,
      );
    case "Sailor":
      return bg(
        [
          ["Belaying pin (club)", 1],
          ["Silk rope (50 feet)", 1],
          ["Common clothes", 1],
          ["Pouch", 1],
        ],
        10,
        [
          choice("charm", "Lucky charm", [
            "Rabbit foot",
            "Small stone with central hole",
            "Other agreed lucky charm",
          ]),
        ],
        variant === "Pirate"
          ? "Bad Reputation replaces Ship's Passage; other sailor proficiencies and equipment remain."
          : undefined,
      );
    case "Soldier":
      return bg(
        [
          ["Insignia of rank", 1],
          ["Trophy from a fallen enemy", 1],
          ["Common clothes", 1],
          ["Pouch", 1],
        ],
        10,
        [choice("game", "Gaming set", ["Bone dice set", "Playing card set"])],
      );
    case "Urchin":
      return bg(
        [
          ["Small knife", 1],
          ["Map of your home city", 1],
          ["Pet mouse", 1],
          ["Token of your parents", 1],
          ["Common clothes", 1],
          ["Pouch", 1],
        ],
        10,
      );
    default:
      return bg(
        [],
        0,
        [],
        background
          ? "The selected background has no verified PHB equipment mapping."
          : "Choose a background to receive its equipment.",
      );
  }
}
for (const item of equipmentCatalog) {
  item.nameHr ||= equipmentNamesHr[item.name];
  if (item.nameHr && item.descriptionHr?.startsWith(item.name + ":"))
    item.descriptionHr =
      `${item.nameHr} (${item.name})` +
      item.descriptionHr.slice(item.name.length);
}
export const equipmentCatalogTranslations = () => {
  const pairs: Record<string, string> = {};
  for (const item of equipmentCatalog) {
    if (item.nameHr) pairs[item.name] = `${item.nameHr} (${item.name})`;
    if (item.descriptionHr) pairs[item.description] = item.descriptionHr;
  }
  return pairs;
};
