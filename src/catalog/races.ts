import type { FeatureSheetRule } from "../engine/types";

export type Race = {
  name: string;
  summary: string;
  traits: string;
  bonus: string;
  subraces: { name: string; detail: string; bonus: string }[];
};

/** PHB (2014), p. 34; official Basic Rules (2014), Races / Dragonborn. */
export const dragonbornAncestries: Record<
  string,
  {
    damageType: string;
    shape: string;
    save: "Dexterity" | "Constitution";
  }
> = {
  Black: { damageType: "acid", shape: "5-by-30-foot line", save: "Dexterity" },
  Blue: {
    damageType: "lightning",
    shape: "5-by-30-foot line",
    save: "Dexterity",
  },
  Brass: { damageType: "fire", shape: "5-by-30-foot line", save: "Dexterity" },
  Bronze: {
    damageType: "lightning",
    shape: "5-by-30-foot line",
    save: "Dexterity",
  },
  Copper: { damageType: "acid", shape: "5-by-30-foot line", save: "Dexterity" },
  Gold: { damageType: "fire", shape: "15-foot cone", save: "Dexterity" },
  Green: { damageType: "poison", shape: "15-foot cone", save: "Constitution" },
  Red: { damageType: "fire", shape: "15-foot cone", save: "Dexterity" },
  Silver: { damageType: "cold", shape: "15-foot cone", save: "Constitution" },
  White: { damageType: "cold", shape: "15-foot cone", save: "Constitution" },
};

export const races: Race[] = [
  {
    name: "Dwarf",
    summary:
      "Hardy, steady folk with a strong tradition of craft and community.",
    traits:
      "Darkvision, resilience against poison, weapon and tool training, and stone lore.",
    bonus: "+2 Constitution",
    subraces: [
      {
        name: "Hill Dwarf",
        detail: "A sturdy tradition of learning and health.",
        bonus: "+1 Wisdom; +1 maximum HP each level",
      },
      {
        name: "Mountain Dwarf",
        detail: "A stronger martial tradition with broader armor training.",
        bonus: "+2 Strength; light and medium armor training",
      },
    ],
  },
  {
    name: "Elf",
    summary:
      "Long-lived, perceptive people with a magical connection to the world.",
    traits:
      "Darkvision, keen senses, immunity to magical sleep, and a trance-like rest.",
    bonus: "+2 Dexterity",
    subraces: [
      {
        name: "High Elf",
        detail: "A scholarly tradition with a cantrip and extra language.",
        bonus: "+1 Intelligence; one wizard cantrip",
      },
      {
        name: "Wood Elf",
        detail: "A swift, perceptive people at home in forests.",
        bonus: "+1 Wisdom; faster speed and Mask of the Wild",
      },
      {
        name: "Dark Elf (Drow)",
        detail:
          "A subterranean lineage with superior darkvision and innate magic.",
        bonus: "+1 Charisma; sunlight sensitivity",
      },
    ],
  },
  {
    name: "Halfling",
    summary: "Small, nimble folk known for luck, courage, and resourcefulness.",
    traits: "Lucky, brave, nimble movement through larger creatures' spaces.",
    bonus: "+2 Dexterity",
    subraces: [
      {
        name: "Lightfoot",
        detail: "Naturally stealthy and socially adaptable.",
        bonus: "+1 Charisma; Naturally Stealthy",
      },
      {
        name: "Stout",
        detail: "A hardy lineage with extra resistance to poison.",
        bonus: "+1 Constitution; Stout Resilience",
      },
    ],
  },
  {
    name: "Human",
    summary: "Versatile and ambitious, humans adapt to nearly any path.",
    traits: "Flexible ability increases and broad potential.",
    bonus: "+1 to all six abilities",
    subraces: [
      {
        name: "Standard Human",
        detail: "A balanced increase across every ability score.",
        bonus: "+1 to all abilities",
      },
      {
        name: "Variant Human (PHB optional)",
        detail:
          "Trade the broad increases for focused talents and an early feat.",
        bonus: "+1 to two abilities; one skill; one feat if feats are enabled",
      },
    ],
  },
  {
    name: "Dragonborn",
    summary:
      "Proud people whose draconic ancestry shapes their breath and resistance.",
    traits: "A damaging breath weapon and resistance linked to your ancestry.",
    bonus: "+2 Strength, +1 Charisma",
    subraces: Object.entries(dragonbornAncestries).map(([name, ancestry]) => ({
      name: `${name} ancestry`,
      detail: `Resist ${ancestry.damageType} damage. Your breath deals ${ancestry.damageType} damage in a ${ancestry.shape} (${ancestry.save} save).`,
      bonus: "Breath weapon and matching damage resistance",
    })),
  },
  {
    name: "Gnome",
    summary:
      "Curious, clever people with an instinct for illusion and invention.",
    traits: "Darkvision and strong mental defenses against magic.",
    bonus: "+2 Intelligence",
    subraces: [
      {
        name: "Forest Gnome",
        detail: "A quiet woodland tradition with minor illusion magic.",
        bonus: "+1 Dexterity; Minor Illusion",
      },
      {
        name: "Rock Gnome",
        detail: "A practical tinkering tradition.",
        bonus: "+1 Constitution; artisan lore and tinkering",
      },
    ],
  },
  {
    name: "Half-Elf",
    summary:
      "People between two worlds, often combining adaptability with charm.",
    traits: "Darkvision, fey ancestry, two flexible skill proficiencies.",
    bonus: "+2 Charisma; +1 to two other abilities",
    subraces: [
      {
        name: "Half-Elf",
        detail: "Choose two different abilities for the flexible increases.",
        bonus: "Two skills of your choice",
      },
    ],
  },
  {
    name: "Half-Orc",
    summary:
      "Powerful, resilient people who can endure a blow that would fell others.",
    traits:
      "Darkvision, intimidation, relentless endurance, and savage criticals.",
    bonus: "+2 Strength, +1 Constitution",
    subraces: [
      {
        name: "Half-Orc",
        detail: "A forceful combatant who can briefly stay standing at 0 HP.",
        bonus: "Relentless Endurance; Savage Attacks",
      },
    ],
  },
  {
    name: "Tiefling",
    summary:
      "People carrying an infernal legacy, with innate magic and fire resistance.",
    traits:
      "Darkvision, resistance to fire, and spells learned through ancestry.",
    bonus: "+2 Charisma, +1 Intelligence",
    subraces: [
      {
        name: "Tiefling",
        detail:
          "A standard infernal legacy that grants a small spell progression.",
        bonus: "Thaumaturgy, Hellish Rebuke, Darkness",
      },
    ],
  },
];
/** The ancestry card is authoritative; the separate value supports older saves. */
export function dragonbornAncestryFor(
  subrace: string,
  legacyAncestry = "",
): string {
  const options = races.find((race) => race.name === "Dragonborn")!.subraces;
  const selected = options.find((option) => option.name === subrace);
  if (selected) return selected.name.replace(/ ancestry$/, "");
  return options.some((option) => option.name === `${legacyAncestry} ancestry`)
    ? legacyAncestry
    : "";
}

const raceSheetSections: Record<string, FeatureSheetRule["section"]> = {
  "Ability Score Increases": "calculated",
  "Focused Ability Increases": "calculated",
  "Dwarven Toughness": "calculated",
  "Fleet of Foot": "calculated",
  "Dwarven Combat Training": "proficiencies",
  "Dwarven Armor Training": "proficiencies",
  "Elf Weapon Training": "proficiencies",
  "Drow Weapon Training": "proficiencies",
  "Keen Senses": "proficiencies",
  "Tool Proficiency": "proficiencies",
  "Skill Proficiency": "proficiencies",
  "Skill Versatility": "proficiencies",
  "Extra Language": "proficiencies",
  Menacing: "proficiencies",
  "High Elf Cantrip": "spellcasting",
  "Natural Illusionist": "spellcasting",
  "Drow Magic": "spellcasting",
  "Infernal Legacy": "spellcasting",
  Feat: "choices",
  "Draconic Ancestry": "choices",
};
export function raceFeatureSheetRule(name: string): FeatureSheetRule {
  return { section: raceSheetSections[name] || "features" };
}

export type RaceTrait = {
  name: string;
  description: string;
  sourceType: "Race";
  choice?: boolean;
  optional?: boolean;
};

export type RaceProfile = {
  size: string;
  speed: number;
  languages: string[];
  traits: RaceTrait[];
  subraceTraits: Record<string, RaceTrait[]>;
  passiveSkillProficiencies: string[];
  notes: string[];
};

const racial = (
  name: string,
  description: string,
  extra: Partial<RaceTrait> = {},
): RaceTrait => ({ name, description, sourceType: "Race", ...extra });

export const raceProfiles: Record<string, RaceProfile> = {
  Dwarf: {
    size: "Medium",
    speed: 25,
    languages: ["Common", "Dwarvish"],
    passiveSkillProficiencies: [],
    traits: [
      racial(
        "Darkvision (60 ft.)",
        "See in darkness as dim light and dim light as bright light; darkness remains grayscale.",
      ),
      racial(
        "Dwarven Resilience",
        "Advantage on saves against poison and resistance to poison damage.",
      ),
      racial(
        "Dwarven Combat Training",
        "Proficiency with battleaxes, handaxes, light hammers, and warhammers.",
      ),
      racial(
        "Tool Proficiency",
        "Choose smith's, brewer's, or mason's tools.",
        { choice: true },
      ),
      racial(
        "Stonecunning",
        "Double proficiency on Intelligence (History) checks about stonework origins.",
      ),
    ],
    subraceTraits: {
      "Hill Dwarf": [
        racial(
          "Dwarven Toughness",
          "Your maximum hit points increase by 1 per character level; current maximum is recalculated with level.",
        ),
      ],
      "Mountain Dwarf": [
        racial(
          "Dwarven Armor Training",
          "Gain light and medium armor proficiency.",
        ),
      ],
    },
    notes: [
      "Base Constitution +2; Hill adds Wisdom +1; Mountain adds Strength +2.",
    ],
  },
  Elf: {
    size: "Medium",
    speed: 30,
    languages: ["Common", "Elvish"],
    passiveSkillProficiencies: ["Perception"],
    traits: [
      racial(
        "Darkvision (60 ft.)",
        "See in darkness as dim light and dim light as bright light; darkness remains grayscale.",
      ),
      racial("Keen Senses", "Gain proficiency in Perception."),
      racial(
        "Fey Ancestry",
        "Advantage on saves against charm; magic cannot put you to sleep.",
      ),
      racial("Trance", "Meditate for 4 hours instead of sleeping for 8 hours."),
    ],
    subraceTraits: {
      "High Elf": [
        racial(
          "Elf Weapon Training",
          "Proficiency with longswords, shortswords, shortbows, and longbows.",
        ),
        racial(
          "High Elf Cantrip",
          "Choose one wizard cantrip; Intelligence is its spellcasting ability.",
          { choice: true },
        ),
        racial("Extra Language", "Choose one additional language.", {
          choice: true,
        }),
      ],
      "Wood Elf": [
        racial(
          "Elf Weapon Training",
          "Proficiency with longswords, shortswords, shortbows, and longbows.",
        ),
        racial("Fleet of Foot", "Walking speed is 35 feet."),
        racial(
          "Mask of the Wild",
          "May attempt to hide with only natural phenomena providing light obscurement.",
        ),
      ],
      "Dark Elf (Drow)": [
        racial(
          "Superior Darkvision (120 ft.)",
          "Darkvision range is 120 feet.",
        ),
        racial(
          "Sunlight Sensitivity",
          "Disadvantage on attack rolls and sight-based Perception checks when you or the target or object you are perceiving is in direct sunlight.",
        ),
        racial(
          "Drow Magic",
          "Dancing Lights; at character level 3, Faerie Fire; at level 5, Darkness. Charisma is the spell ability.",
        ),
        racial(
          "Drow Weapon Training",
          "Proficiency with rapiers, shortswords, and hand crossbows.",
        ),
      ],
    },
    notes: [
      "Base Dexterity +2; High Elf adds Intelligence +1, Wood Elf Wisdom +1, Drow Charisma +1.",
    ],
  },
  Halfling: {
    size: "Small",
    speed: 25,
    languages: ["Common", "Halfling"],
    passiveSkillProficiencies: [],
    traits: [
      racial(
        "Lucky",
        "Reroll a 1 on an attack, ability check, or saving throw and use the new roll.",
      ),
      racial("Brave", "Advantage on saves against being frightened."),
      racial(
        "Halfling Nimbleness",
        "Move through the space of a creature larger than you.",
      ),
    ],
    subraceTraits: {
      Lightfoot: [
        racial(
          "Naturally Stealthy",
          "Try to hide behind a creature at least one size larger than you.",
        ),
      ],
      Stout: [
        racial(
          "Stout Resilience",
          "Advantage on saves against poison and resistance to poison damage.",
        ),
      ],
    },
    notes: [
      "Base Dexterity +2; Lightfoot adds Charisma +1; Stout adds Constitution +1.",
    ],
  },
  Human: {
    size: "Medium",
    speed: 30,
    languages: ["Common"],
    passiveSkillProficiencies: [],
    traits: [
      racial("Extra Language", "Choose one language in addition to Common.", {
        choice: true,
      }),
    ],
    subraceTraits: {
      "Standard Human": [
        racial(
          "Ability Score Increases",
          "Increase all six ability scores by 1.",
        ),
      ],
      "Variant Human (PHB optional)": [
        racial(
          "Focused Ability Increases",
          "Increase two different abilities by 1.",
          { choice: true },
        ),
        racial("Skill Proficiency", "Choose one skill proficiency.", {
          choice: true,
        }),
        racial(
          "Feat",
          "Choose one feat if the optional feat rule is enabled; feat prerequisites still apply.",
          { choice: true, optional: true },
        ),
      ],
    },
    notes: [
      "Standard human: +1 to all abilities. Variant human: +1 to two abilities, one skill, and one optional feat; DM approval is required for feats.",
    ],
  },
  Dragonborn: {
    size: "Medium",
    speed: 30,
    languages: ["Common", "Draconic"],
    passiveSkillProficiencies: [],
    traits: [
      racial(
        "Draconic Ancestry",
        "Choose ancestry; it sets breath weapon damage type and shape and the matching damage resistance.",
        { choice: true },
      ),
      racial(
        "Breath Weapon",
        "Exhale the ancestry's energy in a line or cone. Target saves use DC 8 + Constitution modifier + proficiency bonus; damage scales at character levels 1, 6, 11, and 16; recharge on a short or long rest.",
      ),
      racial(
        "Damage Resistance",
        "Resist damage matching your chosen draconic ancestry.",
      ),
    ],
    subraceTraits: {},
    notes: [
      "Ability increases: Strength +2 and Charisma +1.",
      "Ancestry: Black acid line/Dex save; Blue lightning line/Dex; Brass fire line/Dex; Bronze lightning line/Dex; Copper acid line/Dex; Gold fire cone/Dex; Green poison cone/Con; Red fire cone/Dex; Silver cold cone/Con; White cold cone/Con. Lines are 5 by 30 ft.; cones are 15 ft.",
      "Breath damage: 2d6 at levels 1–5, 3d6 at 6–10, 4d6 at 11–15, 5d6 at 16+; half on a successful save.",
    ],
  },
  Gnome: {
    size: "Small",
    speed: 25,
    languages: ["Common", "Gnomish"],
    passiveSkillProficiencies: [],
    traits: [
      racial(
        "Darkvision (60 ft.)",
        "See in darkness as dim light and dim light as bright light; darkness remains grayscale.",
      ),
      racial(
        "Gnome Cunning",
        "Advantage on Intelligence, Wisdom, and Charisma saves against magic.",
      ),
    ],
    subraceTraits: {
      "Forest Gnome": [
        racial(
          "Natural Illusionist",
          "Know Minor Illusion; Intelligence is your spellcasting ability.",
        ),
        racial(
          "Speak with Small Beasts",
          "Communicate simple ideas with Small or smaller beasts.",
        ),
      ],
      "Rock Gnome": [
        racial(
          "Artificer's Lore",
          "Double proficiency on Intelligence (History) checks about magic, alchemy, or technology.",
        ),
        racial(
          "Tinker",
          "Gain proficiency with tinker's tools. With an hour and 10 gp of materials, make one tiny clockwork device; you can maintain up to three at once.",
        ),
      ],
    },
    notes: [
      "Base Intelligence +2; Forest adds Dexterity +1; Rock adds Constitution +1.",
    ],
  },
  "Half-Elf": {
    size: "Medium",
    speed: 30,
    languages: ["Common", "Elvish"],
    passiveSkillProficiencies: [],
    traits: [
      racial(
        "Ability Score Increases",
        "Charisma +2 and two other different abilities of your choice +1 each.",
        { choice: true },
      ),
      racial(
        "Darkvision (60 ft.)",
        "See in darkness as dim light and dim light as bright light; darkness remains grayscale.",
      ),
      racial(
        "Fey Ancestry",
        "Advantage on saves against charm; magic cannot put you to sleep.",
      ),
      racial("Skill Versatility", "Choose proficiency in two skills.", {
        choice: true,
      }),
      racial(
        "Extra Language",
        "Choose one language beyond Common and Elvish.",
        { choice: true },
      ),
    ],
    subraceTraits: {},
    notes: [
      "A half-elf receives no elf subrace weapon training, Trance, or Keen Senses unless another source grants it.",
    ],
  },
  "Half-Orc": {
    size: "Medium",
    speed: 30,
    languages: ["Common", "Orc"],
    passiveSkillProficiencies: ["Intimidation"],
    traits: [
      racial(
        "Darkvision (60 ft.)",
        "See in darkness as dim light and dim light as bright light; darkness remains grayscale.",
      ),
      racial("Menacing", "Gain proficiency in Intimidation."),
      racial(
        "Relentless Endurance",
        "Once per long rest, drop to 1 hit point instead of 0 when not killed outright.",
      ),
      racial(
        "Savage Attacks",
        "On a melee weapon critical hit, add one weapon damage die.",
      ),
    ],
    subraceTraits: {},
    notes: ["Ability increases: Strength +2 and Constitution +1."],
  },
  Tiefling: {
    size: "Medium",
    speed: 30,
    languages: ["Common", "Infernal"],
    passiveSkillProficiencies: [],
    traits: [
      racial(
        "Darkvision (60 ft.)",
        "See in darkness as dim light and dim light as bright light; darkness remains grayscale.",
      ),
      racial("Hellish Resistance", "Resist fire damage."),
      racial(
        "Infernal Legacy",
        "Know Thaumaturgy; at character level 3, cast Hellish Rebuke once per long rest; at level 5, cast Darkness once per long rest. Charisma is the spell ability.",
      ),
    ],
    subraceTraits: {},
    notes: ["Ability increases: Charisma +2 and Intelligence +1."],
  },
};

export function raceTraitsFor(
  raceName: string,
  subraceName: string,
): RaceTrait[] {
  const race = raceProfiles[raceName];
  return race
    ? [
        ...race.traits.filter(
          (trait) =>
            !(
              raceName === "Elf" &&
              subraceName === "Dark Elf (Drow)" &&
              trait.name === "Darkvision (60 ft.)"
            ),
        ),
        ...(race.subraceTraits[subraceName] || []),
      ]
    : [];
}
/** Localized descriptions owned by this catalog. */
const localizedDescriptions: Record<string, string> = {
  "Disadvantage on attack rolls and sight-based Perception checks when you or the target or object you are perceiving is in direct sunlight.":
    "Imate nedostatak na napade i provjere Opažanja temeljene na vidu kada ste vi, meta ili promatrani predmet na izravnoj sunčevoj svjetlosti.",
  "Charisma +2 and two other different abilities of your choice +1 each.":
    "Karizma +2 te dvije druge različite osobine po vašem izboru +1.",
  "Darkvision, keen senses, immunity to magical sleep, and a trance-like rest.":
    "Vid u mraku, izoštrena osjetila, imunost na magijsko uspavljivanje i odmor u transu.",
  "See in darkness as dim light and dim light as bright light; darkness remains grayscale.":
    "U mraku vidite kao pri prigušenom svjetlu, a pri prigušenom svjetlu kao na jarkom. U mraku razlikujete samo sive tonove.",
  "Advantage on saves against poison and resistance to poison damage.":
    "Prednost na spasonosna bacanja protiv otrova i otpornost na štetu od otrova.",
  "Proficiency with battleaxes, handaxes, light hammers, and warhammers.":
    "Poznavanje battleaxe, handaxe, light hammer i warhammer oružja.",
  "Choose smith's, brewer's, or mason's tools.":
    "Odaberite kovački, pivarski ili zidarski alat.",
  "Double proficiency on Intelligence (History) checks about stonework origins.":
    "Udvostručite bonus obučenosti na provjerama Inteligencije (History) o podrijetlu kamenih radova.",
  "Your maximum hit points increase by 1 per character level; current maximum is recalculated with level.":
    "Maksimum HP povećava se za 1 po razini lika i ponovno računa pri promjeni razine.",
  "Gain light and medium armor proficiency.":
    "Stječete poznavanje lakih i srednjih oklopa.",
  "Gain proficiency in Perception.":
    "Stječete obučenost u vještini Perception.",
  "Advantage on saves against charm; magic cannot put you to sleep.":
    "Prednost na spasonosna bacanja protiv šarma; magija vas ne može uspavati.",
  "Meditate for 4 hours instead of sleeping for 8 hours.":
    "Umjesto osam sati sna meditirate četiri sata.",
  "Proficiency with longswords, shortswords, shortbows, and longbows.":
    "Poznavanje longsword, shortsword, shortbow i longbow oružja.",
  "Choose one wizard cantrip; Intelligence is its spellcasting ability.":
    "Odaberite jednu wizard jednostavnu čaroliju. Osobina za njezino čaranje je Inteligencija.",
  "Choose one additional language.":
    "Odaberite jedan dodatni jezik uz jezike koje podrijetlo već daje.",
  "Walking speed is 35 feet.": "Brzina hodanja iznosi 35 stopa.",
  "May attempt to hide with only natural phenomena providing light obscurement.":
    "Možete pokušati skrivanje kad vas prirodne pojave samo blago zaklanjaju.",
  "Darkvision range is 120 feet.": "Doseg darkvisiona iznosi 120 stopa.",
  "Disadvantage on certain sight-based attacks and Perception checks in direct sunlight.":
    "Na izravnom suncu imate nedostatak na određene napade i provjere Perception koje se oslanjaju na vid.",
  "Dancing Lights; at character level 3, Faerie Fire; at level 5, Darkness. Charisma is the spell ability.":
    "Poznajete Dancing Lights; na razini lika 3 dobivate Faerie Fire, a na 5 Darkness. Osobina za čaranje je Karizma.",
  "Proficiency with rapiers, shortswords, and hand crossbows.":
    "Poznavanje rapier, shortsword i hand crossbow oružja.",
  "Reroll a 1 on an attack, ability check, or saving throw and use the new roll.":
    "Ako na napadu, provjeri osobine ili spasonosnom bacanju bacite 1, ponovite bacanje i koristite novi rezultat.",
  "Advantage on saves against being frightened.":
    "Prednost na spasonosna bacanja protiv prestrašenosti.",
  "Move through the space of a creature larger than you.":
    "Možete prolaziti prostorom stvorenja koje je barem jednu veličinu veće od vas.",
  "Try to hide behind a creature at least one size larger than you.":
    "Možete se pokušati sakriti iza stvorenja koje je barem jednu veličinu veće od vas.",
  "Choose one language in addition to Common.":
    "Odaberite jedan dodatni jezik uz jezike koje podrijetlo već daje.",
  "Increase all six ability scores by 1.":
    "Povećajte svih šest vrijednosti osobina za 1.",
  "Increase two different abilities by 1.":
    "Povećajte dvije različite osobine za 1.",
  "Choose one skill proficiency.": "Odaberite jednu obučenost u vještini.",
  "Choose one feat if the optional feat rule is enabled; feat prerequisites still apply.":
    "Odaberite talent ako je uključeno to neobavezno pravilo. Njegovi preduvjeti i dalje vrijede.",
  "Choose ancestry; it sets breath weapon damage type and shape and the matching damage resistance.":
    "Odaberite zmajsko podrijetlo. Određuje vrstu i oblik daha te pripadajuću otpornost na štetu.",
  "Exhale the ancestry's energy in a line or cone. Target saves use DC 8 + Constitution modifier + proficiency bonus; damage scales at character levels 1, 6, 11, and 16; recharge on a short or long rest.":
    "Izdahnite energiju podrijetla u liniji ili stošcu. DC = 8 + modifikator Izdržljivosti + bonus obučenosti. Šteta raste na razinama lika 1, 6, 11 i 16. Obnavlja se nakon kratkog ili dugog odmora.",
  "Resist damage matching your chosen draconic ancestry.":
    "Imate otpornost na vrstu štete odabranoga zmajskog podrijetla.",
  "Advantage on Intelligence, Wisdom, and Charisma saves against magic.":
    "Prednost na spasonosna bacanja Inteligencije, Mudrosti i Karizme protiv magije.",
  "Know Minor Illusion; Intelligence is your spellcasting ability.":
    "Poznajete Minor Illusion. Osobina za čaranje je Inteligencija.",
  "Communicate simple ideas with Small or smaller beasts.":
    "Možete jednostavno razmjenjivati ideje s Malim i sitnijim zvijerima.",
  "Double proficiency on Intelligence (History) checks about magic, alchemy, or technology.":
    "Udvostručite bonus obučenosti na provjerama Inteligencije (History) o magiji, alkemiji i tehnologiji.",
  "Gain proficiency with tinker's tools. With an hour and 10 gp of materials, make one tiny clockwork device; you can maintain up to three at once.":
    "Stječete poznavanje tinker's tools. Uz sat rada i 10 gp materijala izrađujete jedan sitni mehanizam; istodobno možete održavati najviše tri.",
  "Charisma +2 and two different abilities of your choice +1 each.":
    "Karizma +2 te dvije druge različite osobine po vašem izboru +1.",
  "Choose proficiency in two skills.":
    "Odaberite obučenost u dvije različite vještine.",
  "Choose one language beyond Common and Elvish.":
    "Odaberite jedan dodatni jezik uz jezike koje podrijetlo već daje.",
  "Gain proficiency in Intimidation.":
    "Stječete obučenost u vještini Intimidation.",
  "Once per long rest, drop to 1 hit point instead of 0 when not killed outright.":
    "Jednom po dugom odmoru ostajete na 1 HP umjesto pada na 0 ako vas šteta ne ubije odmah.",
  "On a melee weapon critical hit, add one weapon damage die.":
    "Pri kritičnom bliskom pogotku oružjem dodajte jednu kockicu štete oružja.",
  "Resist fire damage.": "Imate otpornost na vatrenu štetu.",
  "Know Thaumaturgy; at character level 3, cast Hellish Rebuke once per long rest; at level 5, cast Darkness once per long rest. Charisma is the spell ability.":
    "Poznajete Thaumaturgy. Od razine lika 3 jednom po dugom odmoru bacate Hellish Rebuke, a od 5 Darkness. Osobina za čaranje je Karizma.",
};
export const raceCatalogTranslations = () => localizedDescriptions;
