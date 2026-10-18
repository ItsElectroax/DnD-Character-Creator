export const backgrounds = [
  {
    name: "Acolyte",
    detail:
      "Raised in a temple or religious community; you know how to find help among faithful of your tradition.",
    skills: ["Insight", "Religion"],
    tools: [],
    languages: 2,
  },
  {
    name: "Charlatan",
    detail:
      "You survived through false identities, tricks, and a talent for reading people.",
    skills: ["Deception", "Sleight of Hand"],
    tools: ["Disguise kit", "Forgery kit"],
    languages: 0,
  },
  {
    name: "Criminal / Spy",
    detail:
      "You have a contact in a criminal network; Spy is a variant focused on information gathering.",
    skills: ["Deception", "Stealth"],
    tools: ["One gaming set", "Thieves' tools"],
    languages: 0,
  },
  {
    name: "Entertainer / Gladiator",
    detail:
      "You earn a living through performance, from music and acting to public combat.",
    skills: ["Acrobatics", "Performance"],
    tools: ["Disguise kit", "One musical instrument"],
    languages: 0,
  },
  {
    name: "Folk Hero",
    detail: "Ordinary people remember the deed that made you a local champion.",
    skills: ["Animal Handling", "Survival"],
    tools: ["One artisan tool", "Land vehicles"],
    languages: 0,
  },
  {
    name: "Guild Artisan / Merchant",
    detail:
      "You trained in a trade and belong to a network of fellow craftspeople or traders.",
    skills: ["Insight", "Persuasion"],
    tools: ["One artisan tool"],
    languages: 1,
  },
  {
    name: "Hermit",
    detail:
      "A period of isolation gave you a perspective most people do not share.",
    skills: ["Medicine", "Religion"],
    tools: ["Herbalism kit"],
    languages: 1,
  },
  {
    name: "Noble / Knight",
    detail:
      "You were raised with status, obligations, and a place in a powerful family or order.",
    skills: ["History", "Persuasion"],
    tools: ["One gaming set"],
    languages: 1,
  },
  {
    name: "Outlander",
    detail:
      "You are at home in the wild and can remember geography and routes.",
    skills: ["Athletics", "Survival"],
    tools: ["One musical instrument"],
    languages: 1,
  },
  {
    name: "Sage",
    detail:
      "Years of study taught you how to research and where knowledge may be found.",
    skills: ["Arcana", "History"],
    tools: [],
    languages: 2,
  },
  {
    name: "Sailor / Pirate",
    detail:
      "You worked at sea; Pirate is a variant associated with a less lawful reputation.",
    skills: ["Athletics", "Perception"],
    tools: ["Navigator's tools", "Water vehicles"],
    languages: 0,
  },
  {
    name: "Soldier",
    detail:
      "Military service taught you discipline, rank, and battlefield routines.",
    skills: ["Athletics", "Intimidation"],
    tools: ["One gaming set", "Land vehicles"],
    languages: 0,
  },
  {
    name: "Urchin",
    detail:
      "You learned to survive in a city by moving quickly and staying unnoticed.",
    skills: ["Sleight of Hand", "Stealth"],
    tools: ["Disguise kit", "Thieves' tools"],
    languages: 0,
  },
];

export const backgroundVariants: Record<
  string,
  { name: string; description: string; descriptionHr: string }[]
> = {
  "Criminal / Spy": [
    {
      name: "Criminal",
      description:
        "Use a criminal contact to relay messages through local networks. Your specialty shapes the story; it does not add another skill.",
      descriptionHr:
        "Zločinačka veza prenosi poruke mrežom poznanika. Specijalnost oblikuje priču, a ne dodatnu vještinu.",
    },
    {
      name: "Spy",
      description:
        "Use the Criminal rules for an intelligence operative. The contact becomes an intelligence network; the two skills and tools remain those of Criminal.",
      descriptionHr:
        "Koristite Criminal pravila za obavještajca. Veza postaje obavještajna mreža; vještine i alati ostaju isti.",
    },
  ],
  "Entertainer / Gladiator": [
    {
      name: "Entertainer",
      description:
        "By Popular Demand helps find food, lodging, and local recognition by performing. Select three performance routines; these are roleplaying specialties, not extra skill proficiency.",
      descriptionHr:
        "By Popular Demand nastupima pomaže dobiti hranu, smještaj i prepoznatljivost. Tri odabrana načina nastupa su priča, a ne dodatne vještine.",
    },
    {
      name: "Gladiator",
      description:
        "Perform in arenas or fighting venues using the Entertainer feature. An inexpensive unusual weapon such as a trident or net may replace the starting instrument; possession does not grant weapon proficiency.",
      descriptionHr:
        "Koristite Entertainer značajku za arene i borilišta. Jeftino neobično oružje, primjerice trozubac ili mreža, može zamijeniti instrument; posjedovanje ne daje poznavanje oružja.",
    },
  ],
  "Guild Artisan / Merchant": [
    {
      name: "Guild Artisan",
      description:
        "Guild membership offers support and professional contacts. It expects monthly dues of 5 gp and can create obligations; it is not unlimited free gold or services.",
      descriptionHr:
        "Članstvo ceha daje potporu i poslovne veze. Traži 5 gp mjesečne članarine i može stvarati obveze; nije neograničen novac ili besplatna usluga.",
    },
    {
      name: "Guild Merchant",
      description:
        "Use the merchant variant of Guild Artisan. With DM agreement, replace artisan-tool proficiency with navigator's tools or one additional language, and replace the starting artisan tools with a mule and cart.",
      descriptionHr:
        "Koristite trgovačku inačicu Guild Artisana. Uz DM-a zamijenite poznavanje obrtničkog alata navigacijskim alatom ili dodatnim jezikom, a početni alat mazgom i kolima.",
    },
  ],
  "Noble / Knight": [
    {
      name: "Noble",
      description:
        "Position of Privilege gives access and social consideration appropriate to your station. It does not override laws, compel obedience, or guarantee audience in every society.",
      descriptionHr:
        "Position of Privilege daje pristup i obzir prema staležu. Ne poništava zakone, ne prisiljava poslušnost niti jamči prijam u svakom društvu.",
    },
    {
      name: "Knight",
      description:
        "Replace Position of Privilege with Retainers: three loyal noncombatant attendants who perform ordinary tasks. They do not fight for you or follow you into obvious danger.",
      descriptionHr:
        "Zamijenite Position of Privilege značajkom Retainers: tri odana neborbena pratitelja za obične zadatke. Ne bore se za vas i ne slijede vas u očitu opasnost.",
    },
  ],
  "Sailor / Pirate": [
    {
      name: "Sailor",
      description:
        "Ship's Passage can secure passage for you and companions when a ship and connection are available; timing, destination, and required work depend on the crew.",
      descriptionHr:
        "Ship's Passage može osigurati put vama i družini ako postoje brod i veza; vrijeme, odredište i rad ovise o posadi.",
    },
    {
      name: "Pirate",
      description:
        "Bad Reputation replaces Ship's Passage. Ordinary people may hesitate to report minor offenses because they fear you; serious crimes and consequences remain subject to the DM and setting.",
      descriptionHr:
        "Bad Reputation zamjenjuje Ship's Passage. Ljudi mogu oklijevati prijaviti sitne prijestupe zbog straha; teški zločini i posljedice ostaju stvar DM-a i svijeta.",
    },
  ],
};
/** Localized descriptions owned by this catalog. */
const localizedDescriptions: Record<string, string> = {
  "Use a criminal contact to relay messages through local networks. Your specialty shapes the story; it does not add another skill.":
    "Zločinačka veza prenosi poruke mrežom poznanika. Specijalnost oblikuje priču, a ne dodatnu vještinu.",
  "Use the Criminal rules for an intelligence operative. The contact becomes an intelligence network; the two skills and tools remain those of Criminal.":
    "Koristite Criminal pravila za obavještajca. Veza postaje obavještajna mreža; vještine i alati ostaju isti.",
  "By Popular Demand helps find food, lodging, and local recognition by performing. Select three performance routines; these are roleplaying specialties, not extra skill proficiency.":
    "By Popular Demand nastupima pomaže dobiti hranu, smještaj i prepoznatljivost. Tri odabrana načina nastupa su priča, a ne dodatne vještine.",
  "Perform in arenas or fighting venues using the Entertainer feature. An inexpensive unusual weapon such as a trident or net may replace the starting instrument; possession does not grant weapon proficiency.":
    "Koristite Entertainer značajku za arene i borilišta. Jeftino neobično oružje, primjerice trozubac ili mreža, može zamijeniti instrument; posjedovanje ne daje poznavanje oružja.",
  "Guild membership offers support and professional contacts. It expects monthly dues of 5 gp and can create obligations; it is not unlimited free gold or services.":
    "Članstvo ceha daje potporu i poslovne veze. Traži 5 gp mjesečne članarine i može stvarati obveze; nije neograničen novac ili besplatna usluga.",
  "Use the merchant variant of Guild Artisan. With DM agreement, replace artisan-tool proficiency with navigator's tools or one additional language, and replace the starting artisan tools with a mule and cart.":
    "Koristite trgovačku inačicu Guild Artisana. Uz DM-a zamijenite poznavanje obrtničkog alata navigacijskim alatom ili dodatnim jezikom, a početni alat mazgom i kolima.",
  "Position of Privilege gives access and social consideration appropriate to your station. It does not override laws, compel obedience, or guarantee audience in every society.":
    "Position of Privilege daje pristup i obzir prema staležu. Ne poništava zakone, ne prisiljava poslušnost niti jamči prijam u svakom društvu.",
  "Replace Position of Privilege with Retainers: three loyal noncombatant attendants who perform ordinary tasks. They do not fight for you or follow you into obvious danger.":
    "Zamijenite Position of Privilege značajkom Retainers: tri odana neborbena pratitelja za obične zadatke. Ne bore se za vas i ne slijede vas u očitu opasnost.",
  "Ship's Passage can secure passage for you and companions when a ship and connection are available; timing, destination, and required work depend on the crew.":
    "Ship's Passage može osigurati put vama i družini ako postoje brod i veza; vrijeme, odredište i rad ovise o posadi.",
  "Bad Reputation replaces Ship's Passage. Ordinary people may hesitate to report minor offenses because they fear you; serious crimes and consequences remain subject to the DM and setting.":
    "Bad Reputation zamjenjuje Ship's Passage. Ljudi mogu oklijevati prijaviti sitne prijestupe zbog straha; teški zločini i posljedice ostaju stvar DM-a i svijeta.",
};
export const backgroundCatalogTranslations = () => localizedDescriptions;
