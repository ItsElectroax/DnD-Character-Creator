export const skills = [
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

export const abilities = [
  "Strength",
  "Dexterity",
  "Constitution",
  "Intelligence",
  "Wisdom",
  "Charisma",
];

export const languages = [
  "Common",
  "Dwarvish",
  "Elvish",
  "Giant",
  "Gnomish",
  "Goblin",
  "Halfling",
  "Orc",
  "Abyssal",
  "Celestial",
  "Draconic",
  "Deep Speech",
  "Infernal",
  "Primordial",
  "Sylvan",
  "Undercommon",
];

export const skillDetails: Record<
  string,
  { ability: string; description: string; descriptionHr: string }
> = {
  Acrobatics: {
    ability: "Dexterity",
    description:
      "Balance, tumbling, and keeping your feet on unstable ground. It does not replace Athletics for every jump or climb.",
    descriptionHr:
      "Ravnoteža, prevrtanje i ostajanje na nogama na nestabilnom tlu. Ne zamjenjuje Atletiku za svaki skok ili penjanje.",
  },
  "Animal Handling": {
    ability: "Wisdom",
    description:
      "Calm, understand, or direct a domesticated animal when its behavior is uncertain. It is not magical control.",
    descriptionHr:
      "Smirivanje, razumijevanje i usmjeravanje pripitomljenih životinja kada je ponašanje nesigurno. Nije čarobna kontrola.",
  },
  Arcana: {
    ability: "Intelligence",
    description:
      "Recall knowledge about spells, magic traditions, planes, and magical symbols.",
    descriptionHr:
      "Prisjećanje znanja o čarolijama, čarobnim tradicijama, ravnima i znakovima.",
  },
  Athletics: {
    ability: "Strength",
    description:
      "Difficult climbing, swimming, jumping, grappling, and physical exertion.",
    descriptionHr:
      "Teško penjanje, plivanje, skakanje, hrvanje i fizički napor.",
  },
  Deception: {
    ability: "Charisma",
    description:
      "Convincingly conceal the truth through speech or actions; opposed outcomes depend on the situation.",
    descriptionHr:
      "Uvjerljivo prikrivanje istine govorom i postupcima; suprotstavljeni ishodi ovise o situaciji.",
  },
  History: {
    ability: "Intelligence",
    description:
      "Recall people, wars, nations, legends, and other historical facts.",
    descriptionHr:
      "Prisjećanje ljudi, ratova, država, legendi i drugih povijesnih činjenica.",
  },
  Insight: {
    ability: "Wisdom",
    description:
      "Read motives and intent from behavior. Success is not automatic mind reading or a perfect lie detector.",
    descriptionHr:
      "Procjena motiva i namjere iz ponašanja. Uspjeh nije čitanje misli ni savršen detektor laži.",
  },
  Intimidation: {
    ability: "Charisma",
    description:
      "Influence others with threats or forceful presence. The DM may call for another ability in a particular approach.",
    descriptionHr:
      "Utjecaj prijetnjama ili snažnom pojavom. DM za određeni pristup može odabrati drugo svojstvo.",
  },
  Investigation: {
    ability: "Intelligence",
    description:
      "Draw conclusions from clues, search for concealed mechanisms, and reason through evidence.",
    descriptionHr:
      "Zaključivanje iz tragova, traženje skrivenih mehanizama i analiza dokaza.",
  },
  Medicine: {
    ability: "Wisdom",
    description:
      "Stabilize a dying creature or diagnose illness when a check is needed. It does not normally restore HP.",
    descriptionHr:
      "Stabiliziranje umirućeg ili dijagnosticiranje bolesti kada je potrebna provjera. Obično ne obnavlja HP.",
  },
  Nature: {
    ability: "Intelligence",
    description:
      "Recall information about terrain, weather, animals, and plants.",
    descriptionHr:
      "Prisjećanje podataka o terenu, vremenu, životinjama i biljkama.",
  },
  Perception: {
    ability: "Wisdom",
    description:
      "Notice creatures, sounds, scents, and details. Passive Perception normally equals 10 + your Perception modifier.",
    descriptionHr:
      "Uočavanje stvorenja, zvukova, mirisa i pojedinosti. Pasivno Opažanje obično je 10 + modifikator Opažanja.",
  },
  Performance: {
    ability: "Charisma",
    description:
      "Entertain an audience through music, dance, acting, or storytelling.",
    descriptionHr:
      "Zabavljanje publike glazbom, plesom, glumom i pripovijedanjem.",
  },
  Persuasion: {
    ability: "Charisma",
    description:
      "Influence others honestly and tactfully through requests, argument, or negotiation.",
    descriptionHr:
      "Iskren i taktičan utjecaj zahtjevima, argumentima i pregovorima.",
  },
  Religion: {
    ability: "Intelligence",
    description:
      "Recall deities, religious practices, cults, sacred symbols, and divine traditions.",
    descriptionHr:
      "Prisjećanje božanstava, vjerskih običaja, kultova, svetih znakova i tradicija.",
  },
  "Sleight of Hand": {
    ability: "Dexterity",
    description:
      "Perform delicate hidden manipulation, pickpocketing, or palming an object. Lockpicking uses thieves' tools instead.",
    descriptionHr:
      "Skrivena vješta manipulacija, džeparenje i skrivanje predmeta u dlanu. Otključavanje koristi lopovski alat.",
  },
  Stealth: {
    ability: "Dexterity",
    description:
      "Move quietly and conceal yourself when hiding is possible. Armor, light, cover, and observers affect the attempt.",
    descriptionHr:
      "Tiho kretanje i skrivanje kada je moguće. Oklop, svjetlo, zaklon i promatrači utječu na pokušaj.",
  },
  Survival: {
    ability: "Wisdom",
    description:
      "Track, forage, navigate wilderness, and recognize environmental dangers.",
    descriptionHr:
      "Praćenje tragova, traženje hrane, snalaženje u divljini i prepoznavanje okolišnih opasnosti.",
  },
};

export const languageDetails: Record<
  string,
  {
    exotic: boolean;
    script: string;
    scriptHr: string;
    nameHr: string;
    speakers: string;
    speakersHr: string;
    description: string;
    descriptionHr: string;
  }
> = Object.fromEntries(
  languages.map((name) => {
    const exotic = [
      "Abyssal",
      "Celestial",
      "Draconic",
      "Deep Speech",
      "Infernal",
      "Primordial",
      "Sylvan",
      "Undercommon",
    ].includes(name);
    const script = (
      {
        Common: "Common",
        Dwarvish: "Dwarvish",
        Elvish: "Elvish",
        Giant: "Dwarvish",
        Gnomish: "Dwarvish",
        Goblin: "Dwarvish",
        Halfling: "Common",
        Orc: "Dwarvish",
        Abyssal: "Infernal",
        Celestial: "Celestial",
        Draconic: "Draconic",
        "Deep Speech": "No script",
        Infernal: "Infernal",
        Primordial: "Dwarvish",
        Sylvan: "Elvish",
        Undercommon: "Elvish",
      } as Record<string, string>
    )[name];
    const context: Record<string, [string, string, string, string, string]> = {
      Common: [
        "Zajednički",
        "humans",
        "ljudi",
        "A widespread shared language associated with humans and communication between different peoples.",
        "Raširen zajednički jezik ljudi, koristan za sporazumijevanje među različitim narodima.",
      ],
      Dwarvish: [
        "Patuljački",
        "dwarves",
        "patuljci",
        "The language of dwarven communities; its alphabet also appears in several other PHB languages.",
        "Jezik patuljačkih zajednica; njegovo se pismo koristi i za nekoliko drugih PHB jezika.",
      ],
      Elvish: [
        "Vilenjački",
        "elves",
        "vilenjaci",
        "Spoken by elves. Its alphabet is also used for Sylvan and Undercommon.",
        "Govore ga vilenjaci. Njegovo se pismo koristi i za Sylvan i Undercommon.",
      ],
      Giant: [
        "Divovski",
        "ogres and giants",
        "ogri i divovi",
        "The language shared by ogres and giants, written with the Dwarvish alphabet.",
        "Jezik ogra i divova, zapisan patuljačkim pismom.",
      ],
      Gnomish: [
        "Gnomovski",
        "gnomes",
        "gnomovi",
        "Spoken by gnomes; it uses Dwarvish letters without becoming the same language as Dwarvish.",
        "Govore ga gnomovi; koristi patuljačka slova, ali je zaseban jezik od patuljačkog.",
      ],
      Goblin: [
        "Goblinski",
        "goblinoids",
        "goblinoidi",
        "A shared language of goblinoids, including goblins, hobgoblins, and bugbears.",
        "Zajednički jezik goblinoida, uključujući gobline, hobgobline i bugbearove.",
      ],
      Halfling: [
        "Polutanski",
        "halflings",
        "polutani",
        "The language of halfling communities, written using the Common alphabet.",
        "Jezik polutanskih zajednica, zapisan pismom zajedničkog jezika.",
      ],
      Orc: [
        "Orkovski",
        "orcs",
        "orci",
        "Spoken by orcs and written with Dwarvish letters; knowing Dwarvish does not teach Orc.",
        "Govore ga orci i pišu patuljačkim slovima; poznavanje patuljačkog ne daje orkovski.",
      ],
      Abyssal: [
        "Bezdanjski",
        "demons",
        "demoni",
        "The language associated with demons and the Abyss; it is distinct from the devils' Infernal.",
        "Jezik demona i Bezdana; razlikuje se od đavoljeg Infernala.",
      ],
      Celestial: [
        "Nebeski",
        "celestials",
        "nebeska bića",
        "Spoken by celestial beings, using its own Celestial script.",
        "Govore ga nebeska bića i koriste vlastito nebesko pismo.",
      ],
      Draconic: [
        "Zmajski",
        "dragons and dragonborn",
        "zmajevi i zmajorodni",
        "The language of dragons and dragonborn, with its own Draconic alphabet.",
        "Jezik zmajeva i zmajorodnih, s vlastitim zmajskim pismom.",
      ],
      "Deep Speech": [
        "Duboki govor",
        "mind flayers and beholders",
        "ilithidi i beholderi",
        "Associated with mind flayers and beholders. The PHB lists no usual written script for it.",
        "Povezan je s ilithidima i beholderima. PHB za njega ne navodi uobičajeno pismo.",
      ],
      Infernal: [
        "Pakleni",
        "devils",
        "đavli",
        "The language of devils; sharing its alphabet with Abyssal does not make the two languages interchangeable.",
        "Jezik đavola; dijeljenje pisma s bezdanjskim ne čini ta dva jezika istima.",
      ],
      Primordial: [
        "Prvotni",
        "elementals",
        "elementali",
        "The language associated with elemental creatures and their elemental dialects.",
        "Jezik elementala i njihovih elementarnih narječja.",
      ],
      Sylvan: [
        "Vilinski",
        "fey creatures",
        "vilinska bića",
        "Spoken by fey creatures. It uses the Elvish alphabet but remains a separate language.",
        "Govore ga vilinska bića. Koristi vilenjačko pismo, ali ostaje zaseban jezik.",
      ],
      Undercommon: [
        "Podzemni zajednički",
        "Underdark traders",
        "trgovci Podzemlja",
        "A shared language used by Underdark traders; it is not the language of every underground creature.",
        "Zajednički jezik trgovaca Podzemlja; ne govore ga automatski sva podzemna stvorenja.",
      ],
    };
    const [nameHr, speakers, speakersHr, description, descriptionHr] =
      context[name];
    const scriptHr = (
      {
        Common: "pismo zajedničkog jezika",
        Dwarvish: "patuljačko",
        Elvish: "vilenjačko",
        Infernal: "pakleno",
        Celestial: "nebesko",
        Draconic: "zmajsko",
        "No script": "nema uobičajenog pisma",
      } as Record<string, string>
    )[script];
    return [
      name,
      {
        exotic,
        script,
        scriptHr,
        nameHr,
        speakers,
        speakersHr,
        description,
        descriptionHr,
      },
    ];
  }),
);
export const artisanToolOptions = [
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

export const gamingSetOptions = [
  "Dice set",
  "Dragonchess set",
  "Playing card set",
  "Three-Dragon Ante set",
];

export const musicalInstrumentOptions = [
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

export const otherToolOptions = [
  "Disguise kit",
  "Forgery kit",
  "Herbalism kit",
  "Navigator's tools",
  "Poisoner's kit",
  "Thieves' tools",
  "Land vehicles",
  "Water vehicles",
];

export const allToolOptions = [
  ...artisanToolOptions,
  ...gamingSetOptions,
  ...musicalInstrumentOptions,
  ...otherToolOptions,
];
/** Localized descriptions owned by this catalog. */
const localizedDescriptions: Record<string, string> = {
  "Balance, tumbling, and keeping your feet on unstable ground. It does not replace Athletics for every jump or climb.":
    "Ravnoteža, prevrtanje i ostajanje na nogama na nestabilnom tlu. Ne zamjenjuje Atletiku za svaki skok ili penjanje.",
  "Calm, understand, or direct a domesticated animal when its behavior is uncertain. It is not magical control.":
    "Smirivanje, razumijevanje i usmjeravanje pripitomljenih životinja kada je ponašanje nesigurno. Nije čarobna kontrola.",
  "Recall knowledge about spells, magic traditions, planes, and magical symbols.":
    "Prisjećanje znanja o čarolijama, čarobnim tradicijama, ravnima i znakovima.",
  "Difficult climbing, swimming, jumping, grappling, and physical exertion.":
    "Teško penjanje, plivanje, skakanje, hrvanje i fizički napor.",
  "Convincingly conceal the truth through speech or actions; opposed outcomes depend on the situation.":
    "Uvjerljivo prikrivanje istine govorom i postupcima; suprotstavljeni ishodi ovise o situaciji.",
  "Recall people, wars, nations, legends, and other historical facts.":
    "Prisjećanje ljudi, ratova, država, legendi i drugih povijesnih činjenica.",
  "Read motives and intent from behavior. Success is not automatic mind reading or a perfect lie detector.":
    "Procjena motiva i namjere iz ponašanja. Uspjeh nije čitanje misli ni savršen detektor laži.",
  "Influence others with threats or forceful presence. The DM may call for another ability in a particular approach.":
    "Utjecaj prijetnjama ili snažnom pojavom. DM za određeni pristup može odabrati drugo svojstvo.",
  "Draw conclusions from clues, search for concealed mechanisms, and reason through evidence.":
    "Zaključivanje iz tragova, traženje skrivenih mehanizama i analiza dokaza.",
  "Stabilize a dying creature or diagnose illness when a check is needed. It does not normally restore HP.":
    "Stabiliziranje umirućeg ili dijagnosticiranje bolesti kada je potrebna provjera. Obično ne obnavlja HP.",
  "Recall information about terrain, weather, animals, and plants.":
    "Prisjećanje podataka o terenu, vremenu, životinjama i biljkama.",
  "Notice creatures, sounds, scents, and details. Passive Perception normally equals 10 + your Perception modifier.":
    "Uočavanje stvorenja, zvukova, mirisa i pojedinosti. Pasivno Opažanje obično je 10 + modifikator Opažanja.",
  "Entertain an audience through music, dance, acting, or storytelling.":
    "Zabavljanje publike glazbom, plesom, glumom i pripovijedanjem.",
  "Influence others honestly and tactfully through requests, argument, or negotiation.":
    "Iskren i taktičan utjecaj zahtjevima, argumentima i pregovorima.",
  "Recall deities, religious practices, cults, sacred symbols, and divine traditions.":
    "Prisjećanje božanstava, vjerskih običaja, kultova, svetih znakova i tradicija.",
  "Perform delicate hidden manipulation, pickpocketing, or palming an object. Lockpicking uses thieves' tools instead.":
    "Skrivena vješta manipulacija, džeparenje i skrivanje predmeta u dlanu. Otključavanje koristi lopovski alat.",
  "Move quietly and conceal yourself when hiding is possible. Armor, light, cover, and observers affect the attempt.":
    "Tiho kretanje i skrivanje kada je moguće. Oklop, svjetlo, zaklon i promatrači utječu na pokušaj.",
  "Track, forage, navigate wilderness, and recognize environmental dangers.":
    "Praćenje tragova, traženje hrane, snalaženje u divljini i prepoznavanje okolišnih opasnosti.",
  "A widespread shared language associated with humans and communication between different peoples.":
    "Raširen zajednički jezik ljudi, koristan za sporazumijevanje među različitim narodima.",
  "The language of dwarven communities; its alphabet also appears in several other PHB languages.":
    "Jezik patuljačkih zajednica; njegovo se pismo koristi i za nekoliko drugih PHB jezika.",
  "Spoken by elves. Its alphabet is also used for Sylvan and Undercommon.":
    "Govore ga vilenjaci. Njegovo se pismo koristi i za Sylvan i Undercommon.",
  "The language shared by ogres and giants, written with the Dwarvish alphabet.":
    "Jezik ogra i divova, zapisan patuljačkim pismom.",
  "Spoken by gnomes; it uses Dwarvish letters without becoming the same language as Dwarvish.":
    "Govore ga gnomovi; koristi patuljačka slova, ali je zaseban jezik od patuljačkog.",
  "A shared language of goblinoids, including goblins, hobgoblins, and bugbears.":
    "Zajednički jezik goblinoida, uključujući gobline, hobgobline i bugbearove.",
  "The language of halfling communities, written using the Common alphabet.":
    "Jezik polutanskih zajednica, zapisan pismom zajedničkog jezika.",
  "Spoken by orcs and written with Dwarvish letters; knowing Dwarvish does not teach Orc.":
    "Govore ga orci i pišu patuljačkim slovima; poznavanje patuljačkog ne daje orkovski.",
  "The language associated with demons and the Abyss; it is distinct from the devils' Infernal.":
    "Jezik demona i Bezdana; razlikuje se od đavoljeg Infernala.",
  "Spoken by celestial beings, using its own Celestial script.":
    "Govore ga nebeska bića i koriste vlastito nebesko pismo.",
  "The language of dragons and dragonborn, with its own Draconic alphabet.":
    "Jezik zmajeva i zmajorodnih, s vlastitim zmajskim pismom.",
  "Associated with mind flayers and beholders. The PHB lists no usual written script for it.":
    "Povezan je s ilithidima i beholderima. PHB za njega ne navodi uobičajeno pismo.",
  "The language of devils; sharing its alphabet with Abyssal does not make the two languages interchangeable.":
    "Jezik đavola; dijeljenje pisma s bezdanjskim ne čini ta dva jezika istima.",
  "The language associated with elemental creatures and their elemental dialects.":
    "Jezik elementala i njihovih elementarnih narječja.",
  "Spoken by fey creatures. It uses the Elvish alphabet but remains a separate language.":
    "Govore ga vilinska bića. Koristi vilenjačko pismo, ali ostaje zaseban jezik.",
  "A shared language used by Underdark traders; it is not the language of every underground creature.":
    "Zajednički jezik trgovaca Podzemlja; ne govore ga automatski sva podzemna stvorenja.",
};
export const proficiencyCatalogTranslations = () => localizedDescriptions;
