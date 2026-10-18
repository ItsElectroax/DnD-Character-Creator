import type { FeatureSheetRule } from "../engine/types";
/** Original-language, PHB-only feat summaries for character creation. */
export type FeatDefinition = {
  name: string;
  prerequisite: string;
  description: string;
  descriptionHr?: string;
  nameHr?: string;
  id?: string;
  sourceReference?: string;
  optional?: boolean;
  abilityChoice?: string[];
  abilityFixed?: string;
  choiceOptions?: string[];
  choiceLabel?: string;
  choiceCount?: number;
};
const none = "None";
export const featCatalog: FeatDefinition[] = [
  {
    name: "Actor",
    prerequisite: none,
    abilityFixed: "Charisma",
    description:
      "Increase Charisma by 1. You gain advantage when pretending to be someone else, and you can imitate another person's speech or sounds after listening to them.",
  },
  {
    name: "Alert",
    prerequisite: none,
    description:
      "Add 5 to initiative, cannot be surprised while conscious, and hidden attackers do not gain advantage against you merely for being unseen.",
  },
  {
    name: "Athlete",
    prerequisite: none,
    abilityChoice: ["Strength", "Dexterity"],
    description:
      "Increase Strength or Dexterity by 1. Standing from prone costs less movement; climbing costs no extra movement; running jumps need less distance.",
  },
  {
    name: "Charger",
    prerequisite: none,
    description:
      "After you Dash, use a bonus action to make one melee weapon attack or shove. If you moved at least 10 feet in a straight line first, the attack deals extra damage or the shove pushes farther.",
  },
  {
    name: "Crossbow Expert",
    prerequisite: none,
    description:
      "Ignore the loading property of crossbows you are proficient with; being within 5 feet of a hostile creature does not impose disadvantage on ranged attack rolls; after attacking with a one-handed weapon, you can make a bonus-action hand-crossbow attack.",
  },
  {
    name: "Defensive Duelist",
    prerequisite: "Dexterity 13 or higher",
    description:
      "While wielding a finesse weapon you are proficient with, use your reaction after being hit by a melee attack to add proficiency bonus to AC against that attack, potentially causing it to miss.",
  },
  {
    name: "Dual Wielder",
    prerequisite: none,
    description:
      "Gain +1 AC while holding a separate melee weapon in each hand; use two-weapon fighting with non-light one-handed melee weapons; draw or stow two one-handed weapons together.",
  },
  {
    name: "Dungeon Delver",
    prerequisite: none,
    description:
      "Gain benefits to noticing and avoiding hidden traps, resist trap damage, and search for secret doors more effectively while traveling at a normal pace.",
  },
  {
    name: "Durable",
    prerequisite: none,
    abilityFixed: "Constitution",
    description:
      "Increase Constitution by 1. When spending Hit Dice during a short rest, the minimum healing from each die is twice your Constitution modifier, minimum 2, plus the die roll's normal Constitution modifier.",
  },
  {
    name: "Elemental Adept",
    prerequisite: "Ability to cast at least one spell",
    choiceOptions: ["Acid", "Cold", "Fire", "Lightning", "Thunder"],
    choiceLabel: "Elemental damage type",
    description:
      "Choose one eligible damage type. Your spells ignore resistance to that type, and a 1 on its damage dice counts as a 2. Choose a different eligible type again if you take this feat later.",
  },
  {
    name: "Grappler",
    prerequisite: "Strength 13 or higher",
    description:
      "Gain advantage on attacks against a creature you are grappling. Use an action to pin a creature you are grappling; both of you become restrained until the grapple ends.",
  },
  {
    name: "Great Weapon Master",
    prerequisite: none,
    description:
      "After a melee weapon critical hit or reducing a creature to 0 hit points with one, make a melee attack as a bonus action. Before an attack with a heavy melee weapon you are proficient with, you can take -5 to the attack roll for +10 damage on a hit.",
  },
  {
    name: "Healer",
    prerequisite: none,
    description:
      "Using a healer's kit to stabilize a creature also restores 1 hit point. Once per creature per rest, use a kit and an action to restore hit points based on the target's Hit Dice and your proficiency bonus.",
  },
  {
    name: "Heavily Armored",
    prerequisite: "Proficiency with medium armor",
    abilityFixed: "Strength",
    description:
      "Increase Strength by 1 and gain proficiency with heavy armor.",
  },
  {
    name: "Heavy Armor Master",
    prerequisite: "Proficiency with heavy armor",
    abilityFixed: "Strength",
    description:
      "Increase Strength by 1. While wearing heavy armor, reduce incoming nonmagical bludgeoning, piercing, and slashing damage by 3.",
  },
  {
    name: "Inspiring Leader",
    prerequisite: "Charisma 13 or higher",
    description:
      "Spend 10 minutes inspiring up to six friendly creatures, including yourself. Each gains temporary hit points based on your level and Charisma modifier; a creature cannot benefit again until it finishes a short or long rest.",
  },
  {
    name: "Keen Mind",
    prerequisite: none,
    abilityFixed: "Intelligence",
    description:
      "Increase Intelligence by 1. You always know north, hours until sunrise or sunset, and can accurately recall anything you have seen or heard within the past month.",
  },
  {
    name: "Lightly Armored",
    prerequisite: none,
    abilityChoice: ["Strength", "Dexterity"],
    description:
      "Increase Strength or Dexterity by 1 and gain proficiency with light armor.",
  },
  {
    name: "Linguist",
    prerequisite: none,
    abilityFixed: "Intelligence",
    choiceOptions: [
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
    ],
    choiceCount: 3,
    choiceLabel: "Languages",
    description:
      "Increase Intelligence by 1, learn three languages, and create written ciphers that others can decipher only with your instruction, a successful Intelligence check, or magic.",
  },
  {
    name: "Lucky",
    prerequisite: none,
    description:
      "Gain three luck points per long rest. Spend a point to roll an extra d20 and choose which result is used for your attack roll, ability check, or saving throw, or to affect an attack made against you.",
  },
  {
    name: "Mage Slayer",
    prerequisite: none,
    description:
      "When a creature within 5 feet casts a spell, use your reaction to make a melee weapon attack. Creatures you damage have disadvantage on concentration saves, and you have advantage on saves against spells cast by nearby creatures.",
  },
  {
    name: "Magic Initiate",
    prerequisite: none,
    choiceOptions: ["Bard", "Cleric", "Druid", "Sorcerer", "Warlock", "Wizard"],
    choiceLabel: "Spell list class",
    description:
      "Choose a class spell list. Learn two cantrips and one 1st-level spell from it; cast that 1st-level spell once per long rest without a slot. The chosen class ability governs these spells.",
  },
  {
    name: "Martial Adept",
    prerequisite: none,
    choiceOptions: [
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
    ],
    choiceLabel: "Maneuvers",
    choiceCount: 2,
    description:
      "Learn two Battle Master maneuvers and gain one d6 superiority die, added to any dice gained from another source. The die returns on a short or long rest. A maneuver save uses DC 8 + proficiency bonus + your choice of Strength or Dexterity modifier. The official errata defines this feat's die as d6; it does not automatically copy a larger die.",
  },
  {
    name: "Medium Armor Master",
    prerequisite: "Proficiency with medium armor",
    description:
      "Wearing medium armor no longer imposes disadvantage on Dexterity (Stealth) checks, and its maximum Dexterity bonus to AC increases from +2 to +3.",
  },
  {
    name: "Mobile",
    prerequisite: none,
    description:
      "Increase speed by 10 feet. Dashing ignores difficult terrain for that turn. After making a melee attack against a creature, you do not provoke opportunity attacks from it for the rest of the turn, hit or miss.",
  },
  {
    name: "Moderately Armored",
    prerequisite: "Proficiency with light armor",
    abilityChoice: ["Strength", "Dexterity"],
    description:
      "Increase Strength or Dexterity by 1 and gain proficiency with medium armor and shields.",
  },
  {
    name: "Mounted Combatant",
    prerequisite: none,
    description:
      "Gain advantage on melee attacks against unmounted creatures smaller than your mount. Redirect attacks aimed at your mount and improve its Dexterity saves against effects that allow half damage on a success.",
  },
  {
    name: "Observant",
    prerequisite: none,
    abilityChoice: ["Intelligence", "Wisdom"],
    description:
      "Increase Intelligence or Wisdom by 1. If you can see a creature's mouth, you can read its lips; gain +5 to passive Wisdom (Perception) and Intelligence (Investigation).",
  },
  {
    name: "Polearm Master",
    prerequisite: none,
    description:
      "After attacking with a glaive, halberd, quarterstaff, or spear, use a bonus action to attack with the opposite end. Creatures provoke an opportunity attack when they enter your reach with one of those weapons.",
  },
  {
    name: "Resilient",
    prerequisite: none,
    abilityChoice: [
      "Strength",
      "Dexterity",
      "Constitution",
      "Intelligence",
      "Wisdom",
      "Charisma",
    ],
    description:
      "Increase one ability score by 1 and gain proficiency in saving throws using that ability.",
  },
  {
    name: "Ritual Caster",
    prerequisite: "Intelligence or Wisdom 13 or higher",
    choiceOptions: ["Bard", "Cleric", "Druid", "Sorcerer", "Warlock", "Wizard"],
    choiceLabel: "Ritual list class",
    description:
      "Choose a class and gain a ritual book with two 1st-level ritual spells from that class's list. You can cast rituals from the book; add more eligible rituals by finding and copying them.",
  },
  {
    name: "Savage Attacker",
    prerequisite: none,
    description:
      "Once on each of your turns when rolling damage for a melee weapon attack, reroll the weapon's damage dice and use either total.",
  },
  {
    name: "Sentinel",
    prerequisite: none,
    description:
      "Opportunity hits reduce the target's speed to 0 for the turn. Disengage does not prevent your opportunity attacks. When a nearby creature attacks someone other than you, use your reaction to make a melee attack against it.",
  },
  {
    name: "Sharpshooter",
    prerequisite: none,
    description:
      "Ranged attacks ignore long-range disadvantage and most cover short of total cover. Before a proficient ranged weapon attack, choose -5 to the attack roll for +10 damage on a hit.",
  },
  {
    name: "Shield Master",
    prerequisite: none,
    description:
      "When taking the Attack action while wielding a shield, use a bonus action to shove. Add your shield's AC bonus to eligible Dexterity saves against effects targeting only you; use your reaction to take no damage on a successful save when the effect allows half damage.",
  },
  {
    name: "Skilled",
    prerequisite: none,
    choiceOptions: [
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
      "Disguise kit",
      "Forgery kit",
      "Dice set",
      "Dragonchess set",
      "Playing card set",
      "Three-Dragon Ante set",
      "Herbalism kit",
      "Musical instrument (bagpipes)",
      "Musical instrument (drum)",
      "Musical instrument (dulcimer)",
      "Musical instrument (flute)",
      "Musical instrument (lute)",
      "Musical instrument (lyre)",
      "Musical instrument (horn)",
      "Musical instrument (pan flute)",
      "Musical instrument (shawm)",
      "Musical instrument (viol)",
      "Navigator's tools",
      "Poisoner's kit",
      "Thieves' tools",
      "Land vehicles",
      "Water vehicles",
    ],
    choiceLabel: "Skill or tool proficiencies",
    choiceCount: 3,
    description:
      "Gain proficiency in any combination of three skills or tools of your choice.",
  },
  {
    name: "Skulker",
    prerequisite: "Dexterity 13 or higher",
    description:
      "You can attempt to hide when lightly obscured from the creature you are hiding from. Missing a ranged weapon attack while hidden does not reveal your position, and dim light does not impose disadvantage on your sight-based Perception checks.",
  },
  {
    name: "Spell Sniper",
    prerequisite: "Ability to cast at least one spell",
    choiceOptions: ["Bard", "Cleric", "Druid", "Sorcerer", "Warlock", "Wizard"],
    choiceLabel: "Cantrip spell list",
    description:
      "Double the range of spells requiring an attack roll, and ignore half and three-quarters cover with ranged spell attacks. Learn one cantrip requiring an attack roll from Bard, Cleric, Druid, Sorcerer, Warlock, or Wizard. The chosen class determines the cantrip's casting ability; this can differ from your other spells.",
  },
  {
    name: "Tavern Brawler",
    prerequisite: none,
    abilityChoice: ["Strength", "Constitution"],
    description:
      "Increase Strength or Constitution by 1. Gain proficiency with improvised weapons; your unarmed strike damage die becomes d4. After hitting with an unarmed strike or improvised weapon on your turn, use a bonus action to attempt to grapple the target. Every character is already proficient with their unarmed strikes under the corrected 2014 rules.",
  },
  {
    name: "Tough",
    prerequisite: none,
    description:
      "Your hit point maximum increases by twice your character level when you gain this feat and by 2 more whenever you gain another character level.",
  },
  {
    name: "War Caster",
    prerequisite: "Ability to cast at least one spell",
    description:
      "Gain advantage on Constitution saves to maintain concentration after damage. Perform somatic components while holding weapons or a shield. You may cast a one-target spell as an opportunity attack when its trigger is met.",
  },
  {
    name: "Weapon Master",
    prerequisite: none,
    abilityChoice: ["Strength", "Dexterity"],
    choiceOptions: [
      "Club",
      "Dagger",
      "Greatclub",
      "Handaxe",
      "Javelin",
      "Light hammer",
      "Mace",
      "Quarterstaff",
      "Sickle",
      "Spear",
      "Light crossbow",
      "Dart",
      "Shortbow",
      "Sling",
      "Battleaxe",
      "Flail",
      "Glaive",
      "Greataxe",
      "Greatsword",
      "Halberd",
      "Lance",
      "Longsword",
      "Maul",
      "Morningstar",
      "Pike",
      "Rapier",
      "Scimitar",
      "Shortsword",
      "Trident",
      "War pick",
      "Warhammer",
      "Whip",
      "Blowgun",
      "Hand crossbow",
      "Heavy crossbow",
      "Longbow",
      "Net",
    ],
    choiceLabel: "Weapon proficiencies",
    choiceCount: 4,
    description:
      "Increase Strength or Dexterity by 1 and gain proficiency with four simple or martial weapons of your choice.",
  },
];
const featDetails: Record<string, { nameHr: string; en: string; hr: string }> =
  {
    Actor: {
      nameHr: "Glumac",
      en: "Increase Charisma by 1, maximum 20. Gain advantage on Deception and Performance checks to pass yourself off as someone else. After listening to a creature's speech or another sound for at least 1 minute, mimic it; listeners can contest your Deception with Insight to detect the imitation.",
      hr: "Povećajte Karizmu za 1 do najviše 20. Imate prednost Obmane i Nastupa za predstavljanje kao druga osoba. Nakon barem minute slušanja oponašajte govor ili zvuk; slušatelji suprotstavljaju Uvid vašoj Obmani.",
    },
    Alert: {
      nameHr: "Budnost",
      en: "Add +5 initiative. While conscious, you cannot be surprised. Other creatures gain no advantage on attacks against you merely because you cannot see them; other reasons for advantage still apply.",
      hr: "Dodajte +5 inicijativi. Dok ste pri svijesti ne možete biti iznenađeni. Drugi ne dobivaju prednost napada samo zato što ih ne vidite; drugi izvori prednosti ostaju.",
    },
    Athlete: {
      nameHr: "Atletičar",
      en: "Increase Strength or Dexterity by 1, maximum 20. Standing from prone costs 5 feet of movement, climbing costs no extra movement, and a running long/high jump needs only a 5-foot run-up rather than 10 feet.",
      hr: "Povećajte Snagu ili Spretnost za 1 do 20. Ustajanje troši 5 stopa, penjanje ne troši dodatno kretanje, a skok iz zaleta traži 5 umjesto 10 stopa zaleta.",
    },
    Charger: {
      nameHr: "Jurišnik",
      en: "When using your action to Dash, use a bonus action for one melee weapon attack or shove. If you first move at least 10 feet straight immediately before that bonus action, choose +5 damage on a hit or push a successfully shoved target up to 10 feet away.",
      hr: "Kad radnjom Jurišate, bonus radnjom jednom blisko napadnite oružjem ili gurnite. Nakon barem 10 stopa ravnog kretanja neposredno prije bonus radnje odaberite +5 štete pri pogotku ili guranje do 10 stopa pri uspjehu.",
    },
    "Crossbow Expert": {
      nameHr: "Stručnjak za samostrele",
      en: "Ignore Loading on crossbows you are proficient with, but still need ammunition and a free loading hand. Nearby hostile creatures do not impose disadvantage on any ranged attack roll. After the Attack action includes an attack with a one-handed weapon, use a bonus action to attack with a held hand crossbow.",
      hr: "Zanemarite Loading poznatih samostrela, ali trebate streljivo i slobodnu ruku za punjenje. Bliski neprijatelji ne daju nedostatak dalekometnim napadima. Nakon radnje Napad s jednoručnim oružjem bonus radnjom napadnite ručnim samostrelom.",
    },
    "Defensive Duelist": {
      nameHr: "Obrambeni dvobojac",
      en: "Requires Dexterity 13. While wielding a proficient finesse weapon, react to a melee hit by adding your proficiency bonus to AC against that one attack, possibly turning it into a miss. It does not protect against later attacks or ranged attacks.",
      hr: "Potrebna Spretnost 13. Dok držite poznato finesse oružje, reagirajte na bliski pogodak dodavanjem bonusa poznavanja AC-u samo za taj napad. Ne štiti od kasnijih ili dalekometnih napada.",
    },
    "Dual Wielder": {
      nameHr: "Dva oružja",
      en: "Gain +1 AC while holding a different melee weapon in each hand. Two-weapon fighting may use one-handed melee weapons without the Light property. Draw/stow two one-handed weapons when you would normally draw/stow one; this does not itself grant extra attacks.",
      hr: "Dobivate +1 AC s odvojenim bliskim oružjem u svakoj ruci. Borba dvama oružjima dopušta jednoručno blisko oružje bez Light. Izvlačite ili spremate dva kada biste jedno; samo po sebi ne daje dodatne napade.",
    },
    "Dungeon Delver": {
      nameHr: "Istraživač tamnica",
      en: "Gain advantage on Perception and Investigation checks to detect secret doors, advantage on saves to avoid/resist traps, and resistance to trap damage. Fast travel no longer imposes its normal −5 passive Perception penalty.",
      hr: "Imate prednost Opažanja i Istraživanja za tajna vrata, prednost spašavanja protiv zamki i otpor šteti zamki. Brzi putni tempo više ne daje uobičajenih −5 pasivnom Opažanju.",
    },
    Durable: {
      nameHr: "Izdržljiv",
      en: "Increase Constitution by 1, maximum 20. When rolling a Hit Die to regain HP, the minimum total healing from that roll is twice your Constitution modifier, minimum 2. Do not add Constitution a second time after applying that minimum.",
      hr: "Povećajte Izdržljivost za 1 do 20. Pri trošenju Hit Diea najmanje ukupno liječenje tog bacanja je dvostruki modifikator Izdržljivosti, najmanje 2. Nakon primjene minimuma ne dodajte Izdržljivost ponovno.",
    },
    "Elemental Adept": {
      nameHr: "Elementarni adept",
      en: "Requires at least one spell. Choose acid, cold, fire, lightning, or thunder. Your spells ignore resistance to that type, and you may treat each damage die result of 1 as 2 when rolling its spell damage. Immunity remains. This feat may be repeated only with a different damage type.",
      hr: "Treba barem jednu čaroliju. Odaberite kiselinu, hladnoću, vatru, munju ili grom. Čarolije zanemaruju otpor te vrste, a rezultat 1 na njihovim kockicama štete možete računati kao 2. Imunost ostaje. Ponavlja se samo s drugom vrstom.",
    },
    Grappler: {
      nameHr: "Hrvač",
      en: "Requires Strength 13. Have advantage on attacks against a creature you are grappling. Use an action to attempt another grapple check to pin it; success restrains both of you until that grapple ends. Ordinary size restrictions still apply.",
      hr: "Potrebna Snaga 13. Imate prednost napada na metu koju držite u zahvatu. Radnjom ponovite provjeru zahvata za priklještenje; uspjeh sputava oboje do prekida. Uobičajena ograničenja veličine vrijede.",
    },
    "Great Weapon Master": {
      nameHr: "Majstor velikog oružja",
      en: "On your turn, a melee weapon critical hit or reducing a creature to 0 HP with a melee weapon permits one bonus-action melee weapon attack. Before a proficient heavy-weapon melee attack, choose −5 attack for +10 damage. The extra attack and heavy-weapon benefit have different requirements.",
      hr: "Tijekom svojeg poteza kritični bliski pogodak oružjem ili spuštanje mete na 0 HP njime dopušta jedan bonus bliski napad. Prije poznatog teškog bliskog napada odaberite −5 napada za +10 štete. Ta dva učinka imaju različite uvjete.",
    },
    Healer: {
      nameHr: "Liječnik",
      en: "Stabilizing a creature with a healer's kit also restores 1 HP. As an action, expend a kit use to restore 1d6 + 4 + the target's maximum number of Hit Dice HP. A target cannot receive this latter healing again until it finishes a short or long rest; your proficiency bonus is not part of the formula.",
      hr: "Stabiliziranje liječničkim priborom vraća i 1 HP. Radnjom potrošite uporabu za 1d6 + 4 + najveći broj Hit Dicea mete HP. To liječenje ista meta ponavlja tek nakon kratkog ili dugog odmora; vaš bonus poznavanja nije u formuli.",
    },
    "Heavily Armored": {
      nameHr: "Teško oklopljen",
      en: "Requires medium-armor proficiency. Increase Strength by 1, maximum 20, and gain heavy-armor proficiency. This feat provides no armor item and does not remove Strength-based speed requirements.",
      hr: "Treba poznavanje srednjeg oklopa. Povećajte Snagu za 1 do 20 i naučite teški oklop. Ne daje sam predmet i ne uklanja uvjet Snage za brzinu.",
    },
    "Heavy Armor Master": {
      nameHr: "Majstor teškog oklopa",
      en: "Requires heavy-armor proficiency. Increase Strength by 1, maximum 20. While wearing heavy armor, reduce bludgeoning, piercing, and slashing damage from nonmagical attacks by 3 per instance; other damage and magical attacks are unchanged.",
      hr: "Treba poznavanje teškog oklopa. Povećajte Snagu za 1 do 20. U teškom oklopu smanjite udarnu, probodnu i reznu štetu nečarobnih napada za 3 po primitku; drugo ostaje.",
    },
    "Inspiring Leader": {
      nameHr: "Nadahnujući vođa",
      en: "Requires Charisma 13. Spend 10 minutes inspiring up to six friendly creatures within 30 feet, including yourself, that see/hear and understand you. Each gains temporary HP equal to your level + Charisma modifier. A creature benefits once between its short/long rests; temporary HP do not stack.",
      hr: "Treba Karizmu 13. Deset minuta nadahnjujte do šest prijatelja do 30 stopa, uključujući sebe, koji vas vide ili čuju i razumiju. Privremeni HP jednaki su vašoj razini + modifikator Karizme. Meta ponavlja nakon odmora; HP se ne zbrajaju.",
    },
    "Keen Mind": {
      nameHr: "Oštar um",
      en: "Increase Intelligence by 1, maximum 20. Always know north and hours until sunrise/sunset. Accurately recall things seen or heard within the last month; this grants no automatic knowledge of facts you never encountered.",
      hr: "Povećajte Inteligenciju za 1 do 20. Uvijek znate sjever i sate do izlaska ili zalaska sunca. Točno pamtite viđeno i čuveno posljednjeg mjeseca; ne daje nepoznate činjenice.",
    },
    "Lightly Armored": {
      nameHr: "Lako oklopljen",
      en: "Increase Strength or Dexterity by 1, maximum 20, and gain light-armor proficiency. It grants neither shields nor an actual suit of armor.",
      hr: "Povećajte Snagu ili Spretnost za 1 do 20 i naučite laki oklop. Ne daje štitove ni sam oklop.",
    },
    Linguist: {
      nameHr: "Jezikoslovac",
      en: "Increase Intelligence by 1, maximum 20, and learn three languages. Create written ciphers; without your teaching or magic, deciphering requires an Intelligence check against your Intelligence score + proficiency bonus.",
      hr: "Povećajte Inteligenciju za 1 do 20 i naučite tri jezika. Stvarajte pisane šifre; bez vaše poduke ili magije razrješavanje traži provjeru Inteligencije protiv vaše vrijednosti Inteligencije + bonus poznavanja.",
    },
    Lucky: {
      nameHr: "Sretnik",
      en: "Gain three luck points, restored by a long rest. Spend one after rolling but before the outcome for an extra d20 on your attack, check, or save, choosing the die used. You may instead affect an attack against you; multiple luck spends on that attack cancel rather than add dice.",
      hr: "Dobivate tri boda sreće nakon dugog odmora. Potrošite jedan poslije bacanja, prije ishoda, za dodatni d20 vlastitog napada, provjere ili spašavanja i birajte kockicu. Možete utjecati na napad protiv vas; višestruka trošenja na isti napad poništavaju se.",
    },
    "Mage Slayer": {
      nameHr: "Ubojica čarobnjaka",
      en: "When a creature within 5 feet casts a spell, react with a melee weapon attack. Your damage gives its concentration saves disadvantage. Have advantage on saves against spells cast by creatures within 5 feet. The reaction does not automatically interrupt the spell.",
      hr: "Kad stvorenje do 5 stopa čara, reakcijom blisko napadnite oružjem. Vaša šteta daje mu nedostatak spašavanja koncentracije. Imate prednost spašavanja protiv čarolija iz blizine 5 stopa. Reakcija sama ne prekida čaroliju.",
    },
    "Magic Initiate": {
      nameHr: "Čarobni početnik",
      en: "Choose Bard, Cleric, Druid, Sorcerer, Warlock, or Wizard. Learn two cantrips and one level-1 spell from that list. Cast that spell at level 1 once per long rest through this feat. Casting ability follows the chosen class; ordinary class-slot casting depends on your class rules.",
      hr: "Odaberite Bard, Cleric, Druid, Sorcerer, Warlock ili Wizard. Učite dva trika i jednu čaroliju razine 1 s popisa. Ovom vještinom bacite je na razini 1 jednom po dugom odmoru. Svojstvo slijedi odabranu klasu; obični utori slijede klasna pravila.",
    },
    "Martial Adept": {
      nameHr: "Borbeni adept",
      en: "Learn two Battle Master maneuvers. Gain one d6 superiority die in addition to dice from other sources, recovered on a short/long rest. A maneuver save uses DC 8 + proficiency + your choice of Strength/Dexterity modifier. Official errata fixes this feat's die as d6.",
      hr: "Učite dva Battle Master manevra i dobivate jednu dodatnu kockicu nadmoći d6 koja se obnavlja kratkim ili dugim odmorom. DC je 8 + poznavanje + odabrani modifikator Snage ili Spretnosti. Ispravci određuju d6.",
    },
    "Medium Armor Master": {
      nameHr: "Majstor srednjeg oklopa",
      en: "Requires medium-armor proficiency. Medium armor no longer imposes Stealth disadvantage. If Dexterity is at least 16, its AC contribution can reach +3 instead of the normal +2; lower Dexterity is unchanged.",
      hr: "Treba poznavanje srednjeg oklopa. Srednji oklop više ne daje nedostatak Šuljanja. Sa Spretnosti barem 16 doprinos AC-u doseže +3 umjesto +2; niže vrijednosti ostaju.",
    },
    Mobile: {
      nameHr: "Pokretljivost",
      en: "Increase speed by 10 feet. Using Dash makes difficult terrain cost no extra movement that turn. After making any melee attack against a creature, hit or miss, avoid its opportunity attacks for the rest of that turn.",
      hr: "Brzina raste za 10 stopa. Juriš uklanja dodatni trošak teškog terena taj potez. Nakon bilo kojeg bliskog napada na metu, pogodio ili ne, ne izazivate njezine napade prilike ostatak poteza.",
    },
    "Moderately Armored": {
      nameHr: "Srednje oklopljen",
      en: "Requires light-armor proficiency. Increase Strength or Dexterity by 1, maximum 20, and gain proficiency with medium armor and shields. Equipment still needs to be acquired and equipped.",
      hr: "Treba poznavanje lakog oklopa. Povećajte Snagu ili Spretnost za 1 do 20 te naučite srednji oklop i štitove. Opremu još treba nabaviti i obući.",
    },
    "Mounted Combatant": {
      nameHr: "Konjički borac",
      en: "While mounted and not incapacitated, gain advantage on melee attacks against unmounted creatures smaller than your mount. Force an attack targeting the mount to target you. For Dexterity saves allowing half damage, the mount takes none on success and half on failure.",
      hr: "Dok jašete i niste onesposobljeni, imate prednost bliskih napada na nejašuće mete manje od životinje. Preusmjerite napad sa životinje na sebe. Njezino spašavanje Spretnosti za pola daje nula pri uspjehu i pola pri neuspjehu.",
    },
    Observant: {
      nameHr: "Pronicljivost",
      en: "Increase Intelligence or Wisdom by 1, maximum 20. Read lips when you see a speaking mouth and understand its language. Add +5 to passive Perception and passive Investigation, not to rolled checks.",
      hr: "Povećajte Inteligenciju ili Mudrost za 1 do 20. Čitajte usne vidljivih govornika čiji jezik razumijete. Dodajte +5 pasivnom Opažanju i Istraživanju, a ne bacanim provjerama.",
    },
    "Polearm Master": {
      nameHr: "Majstor motkastog oružja",
      en: "When the Attack action uses only a glaive, halberd, quarterstaff, or spear, make a bonus-action opposite-end attack for d4 bludgeoning using the same ability. While wielding any of those or a pike, creatures provoke an opportunity attack on entering your reach. The pike grants entry attacks but not the bonus strike.",
      hr: "Kad radnja Napad koristi samo glefu, helebardu, štap ili koplje, bonus radnjom udarite drugim krajem za d4 udarne štete istim svojstvom. S tim oružjem ili pikom mete izazivaju napad prilike ulaskom u doseg. Pika ne daje bonus udarac.",
    },
    Resilient: {
      nameHr: "Otporan",
      en: "Choose one ability. Increase it by 1, maximum 20, and gain proficiency in that ability's saving throws. A save already proficient does not receive a second proficiency bonus.",
      hr: "Odaberite svojstvo, povećajte ga za 1 do 20 i naučite njegova spašavanja. Već poznato spašavanje ne dobiva drugi bonus poznavanja.",
    },
    "Ritual Caster": {
      nameHr: "Obredni čarobnjak",
      en: "Requires Intelligence or Wisdom 13. Choose one eligible class and two level-1 rituals from its list for your ritual book. Cast them only as rituals through this feat. Found eligible rituals up to half your character level rounded up cost 2 hours and 50 gp per spell level to copy; casting ability follows the chosen class.",
      hr: "Treba Inteligenciju ili Mudrost 13. Odaberite klasu i dva obreda razine 1 u knjigu. Ovom vještinom bacate ih samo obredno. Pronađene obrede do polovice ukupne razine zaokružene naviše prepisujete za 2 sata i 50 gp po razini; svojstvo slijedi klasu.",
    },
    "Savage Attacker": {
      nameHr: "Divlji napadač",
      en: "Once per turn, when rolling melee weapon damage, reroll the weapon's damage dice and choose either total. It does not reroll extra dice from Sneak Attack or Divine Smite.",
      hr: "Jednom po potezu pri šteti bliskog oružja ponovno bacite njegove kockice i odaberite zbroj. Ne ponavlja dodatne kockice Sneak Attacka ili Divine Smitea.",
    },
    Sentinel: {
      nameHr: "Stražar",
      en: "A hit with an opportunity attack sets speed to 0 for the rest of the turn; Disengage does not prevent your opportunity attacks. When a creature within 5 feet attacks another target lacking Sentinel, react with one melee weapon attack against it. This reaction is not itself an opportunity attack.",
      hr: "Pogodak napadom prilike postavlja brzinu na 0 do kraja poteza; Disengage ne štiti. Kad stvorenje do 5 stopa napadne drugu metu bez Sentinela, reakcijom ga jednom blisko napadnite. Ta reakcija nije napad prilike.",
    },
    Sharpshooter: {
      nameHr: "Oštrostrijelac",
      en: "Long range imposes no disadvantage on your ranged weapon attack rolls, and ranged weapon attacks ignore half/three-quarters cover. Before a proficient ranged-weapon attack, choose −5 attack for +10 damage. Total cover and other disadvantage remain.",
      hr: "Dalek domet ne daje nedostatak dalekometnim napadima oružjem, a oni zanemaruju pola i tri četvrtine zaklona. Prije poznatog dalekometnog napada odaberite −5 napada za +10 štete. Potpuni zaklon i drugi nedostaci ostaju.",
    },
    "Shield Master": {
      nameHr: "Majstor štita",
      en: "While wielding a shield, the Attack action allows a bonus-action shove within 5 feet. Add the shield AC bonus to Dexterity saves against effects targeting only you when not incapacitated. On a successful Dexterity save for half damage, react to take none instead.",
      hr: "Sa štitom radnja Napad dopušta guranje bonus radnjom do 5 stopa. Dok niste onesposobljeni dodajte bonus štita spašavanjima Spretnosti učinaka samo na vas. Reakcijom uspješno spašavanje za pola štete pretvorite u nula.",
    },
    Skilled: {
      nameHr: "Vješt",
      en: "Gain three distinct proficiencies in any mix of skills and tools. No duplicate proficiency becomes expertise, and tool proficiency is separate from possessing its kit.",
      hr: "Dobivate tri različita poznavanja u bilo kojoj kombinaciji vještina i alata. Duplikat ne postaje stručnost; poznavanje alata nije posjedovanje pribora.",
    },
    Skulker: {
      nameHr: "Prikrivač",
      en: "Requires Dexterity 13. You may try hiding while lightly obscured from the observer. Missing a ranged weapon attack while hidden does not reveal you. Dim light does not penalize sight-based Perception checks.",
      hr: "Treba Spretnost 13. Možete pokušati skrivanje kada ste blago zaklonjeni od promatrača. Promašen dalekometni napad iz skrivanja ne otkriva vas. Prigušeno svjetlo ne kažnjava vizualno Opažanje.",
    },
    "Spell Sniper": {
      nameHr: "Čarobni strijelac",
      en: "Requires at least one spell. Double a spell's range when it requires an attack roll; ranged spell attacks ignore half/three-quarters cover. Learn one attack-roll cantrip from an eligible class list, using that class's casting ability rather than automatically your main class's.",
      hr: "Treba barem jednu čaroliju. Udvostručite domet čarolije s napadom; dalekometni napadi čarolijom zanemaruju pola i tri četvrtine zaklona. Učite jedan napadni trik s odabranog popisa njegovim svojstvom čaranja.",
    },
    "Tavern Brawler": {
      nameHr: "Krčmarski borac",
      en: "Increase Strength or Constitution by 1, maximum 20. Gain improvised-weapon proficiency and d4 unarmed damage. After your unarmed/improvised hit on your turn, attempt a grapple as a bonus action; normal grapple size/hand requirements apply. All characters already have unarmed proficiency.",
      hr: "Povećajte Snagu ili Izdržljivost za 1 do 20. Naučite improvizirano oružje i goloruku štetu d4. Nakon takvog pogotka vlastitog poteza bonus radnjom pokušajte zahvat uz normalne uvjete veličine i ruke. Svi već poznaju goloruke napade.",
    },
    Tough: {
      nameHr: "Žilavost",
      en: "Increase maximum HP by twice your current character level, and by 2 for each later character level. The bonus uses total character level across all classes and is recalculated when this feat is gained or removed.",
      hr: "Povećajte maksimalne HP za dvostruku ukupnu razinu te za 2 po kasnijoj razini. Koristi ukupne razine svih klasa i ponovno se računa dodavanjem ili uklanjanjem vještine.",
    },
    "War Caster": {
      nameHr: "Ratni čarobnjak",
      en: "Requires at least one spell. Gain advantage on concentration saves caused by damage and perform somatic components with weapons/shield in hand. When movement provokes your opportunity attack, react by casting a one-action spell that targets only that creature; material and verbal components still apply.",
      hr: "Treba barem jednu čaroliju. Imate prednost spašavanja koncentracije zbog štete i izvodite pokretne sastavnice s oružjem ili štitom. Kad kretanje izazove napad prilike, reakcijom bacite jednorađnu čaroliju samo na tu metu; materijali i govor vrijede.",
    },
    "Weapon Master": {
      nameHr: "Majstor oružja",
      en: "Increase Strength or Dexterity by 1, maximum 20, and gain proficiency with four distinct simple or martial weapons. This grants attack-roll proficiency only, not equipment, Fighting Styles, or extra damage.",
      hr: "Povećajte Snagu ili Spretnost za 1 do 20 i naučite četiri različita jednostavna ili bojna oružja. Daje poznavanje napada, a ne opremu, stil borbe ni dodatnu štetu.",
    },
  };
for (const feat of featCatalog) {
  const detail = featDetails[feat.name];
  if (detail) {
    feat.description = detail.en;
    feat.descriptionHr = detail.hr;
    feat.nameHr = detail.nameHr;
  }
  feat.id = feat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  feat.sourceReference =
    "PHB (2014), chapter 6, pp. 165–170; official PHB errata";
  feat.optional = true;
}
export const featCatalogTranslations = () =>
  Object.fromEntries(
    featCatalog.flatMap((feat) => [
      [feat.name, `${feat.nameHr} (${feat.name})`],
      [feat.description, feat.descriptionHr || feat.description],
    ]),
  );
export const featsByName: Record<string, FeatDefinition> = Object.fromEntries(
  featCatalog.map((feat) => [feat.name.toLowerCase(), feat]),
);
export function findFeat(name: string) {
  return featsByName[name.trim().toLowerCase()];
}
export function featAbilityFor(name: string, chosen: string) {
  const feat = findFeat(name);
  if (!feat) return "";
  if (feat.abilityFixed) return feat.abilityFixed;
  return feat.abilityChoice?.includes(chosen) ? chosen : "";
}

/** Mixed feats retain their situational effects after their numeric grants are applied. */
const featPlayText: Record<string, [string, string]> = {
  Actor: [
    "Gain advantage on Deception and Performance checks when passing yourself off as someone else. After listening for at least 1 minute, imitate a creature's speech or another sound; listeners may contest your Deception with Insight.",
    "Imate prednost na Obmanu i Nastup kad se predstavljate kao druga osoba. Nakon barem 1 minute slušanja oponašajte govor stvorenja ili drugi zvuk; slušatelji mogu suprotstaviti Uvid vašoj Obmani.",
  ],
  Alert: [
    "While conscious, you cannot be surprised. Creatures do not gain advantage against you solely because you cannot see them.",
    "Dok ste pri svijesti, ne možete biti iznenađeni. Stvorenja ne dobivaju prednost protiv vas samo zato što ih ne vidite.",
  ],
  Athlete: [
    "Standing from prone costs 5 feet of movement. Climbing costs no extra movement. Running long and high jumps require only a 5-foot run-up.",
    "Ustajanje iz ležećeg položaja troši 5 stopa kretanja. Penjanje ne troši dodatno kretanje. Skokovi u dalj i vis iz zaleta zahtijevaju samo 5 stopa zaleta.",
  ],
  "Dual Wielder": [
    "Use two-weapon fighting with one-handed melee weapons even when they are not light. Draw or stow two one-handed weapons when you could normally draw or stow one.",
    "Borite se dvama jednoručnim bliskim oružjima čak i kad nisu laka. Izvucite ili spremite dva jednoručna oružja kad biste inače mogli jedno.",
  ],
  Durable: [
    "When you roll a Hit Die to regain hit points, the minimum number of hit points regained from that roll equals twice your Constitution modifier (minimum 2).",
    "Kad bacite Kockicu izdržljivosti za oporavak bodova zdravlja, oporavite najmanje dvostruki modifikator Izdržljivosti (najmanje 2).",
  ],
  "Heavy Armor Master": [
    "While wearing heavy armor, reduce bludgeoning, piercing and slashing damage from nonmagical weapons by 3.",
    "Dok nosite teški oklop, smanjite udarnu, probodnu i režuću štetu nemagičnih oružja za 3.",
  ],
  "Keen Mind": [
    "Always know north and the hours until the next sunrise or sunset. Accurately recall anything seen or heard within the past month.",
    "Uvijek znate gdje je sjever i koliko sati ima do idućeg izlaska ili zalaska sunca. Točno se sjećate svega viđenog i čutog tijekom proteklog mjeseca.",
  ],
  Linguist: [
    "Create written ciphers. Others cannot decipher them unless you teach them, they succeed on an Intelligence check (DC = your Intelligence score + proficiency bonus), or they use magic.",
    "Stvarajte pisane šifre. Drugi ih ne mogu odgonetnuti osim ako ih podučite, uspiju u provjeri Inteligencije (DC = vaša vrijednost Inteligencije + bonus obučenosti) ili upotrijebe magiju.",
  ],
  Mobile: [
    "After using Dash, difficult terrain costs no extra movement that turn. After making a melee attack against a creature, you do not provoke opportunity attacks from that creature for the rest of the turn, whether you hit or miss.",
    "Nakon radnje Juriš, težak teren taj potez ne troši dodatno kretanje. Nakon bliskog napada na stvorenje, do kraja poteza ne izazivate njegove prigodne napade, pogodili ili promašili.",
  ],
  Observant: [
    "If you can see a creature's mouth while it speaks a language you understand, you can read its lips. Add +5 to passive Investigation checks.",
    "Ako vidite usta stvorenja dok govori jezik koji razumijete, možete mu čitati s usana. Dodajte +5 pasivnim provjerama Istraživanja.",
  ],
  "Tavern Brawler": [
    "After hitting a creature with an unarmed strike or improvised weapon on your turn, use a bonus action to attempt to grapple it.",
    "Nakon što tijekom svojeg poteza pogodite stvorenje nenaoružanim udarcem ili improviziranim oružjem, bonus radnjom pokušajte ga uhvatiti.",
  ],
  "Spell Sniper": [
    "Your ranged spell attacks ignore half cover and three-quarters cover.",
    "Vaši dalekometni napadi čarolijama zanemaruju poluzaklon i tročetvrtinski zaklon.",
  ],
};
export function featFeatureSheetRule(name: string): FeatureSheetRule {
  if (
    [
      "Tough",
      "Resilient",
      "Lightly Armored",
      "Moderately Armored",
      "Heavily Armored",
      "Skilled",
      "Weapon Master",
    ].includes(name)
  )
    return { section: "calculated" };
  if (name === "Magic Initiate") return { section: "spellcasting" };
  const text = featPlayText[name];
  return text
    ? { section: "features", description: text[0], descriptionHr: text[1] }
    : { section: "features" };
}
