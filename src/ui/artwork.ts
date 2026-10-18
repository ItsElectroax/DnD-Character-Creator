/** Official 2014 Legacy illustrations from D&D Beyond. Artwork © Wizards of the Coast.
 * UI presentation only; canonical race/class keys remain language independent. */
export type CardArtwork = {
  src: string;
  sourcePage: string;
  sourceImage: string;
  position: string;
};
export const cardArtwork: Record<
  "race" | "class",
  Record<string, CardArtwork>
> = {
  race: {
    Dragonborn: {
      src: "artwork/race-dragonborn.webp",
      sourcePage: "https://www.dndbeyond.com/species/16-dragonborn",
      sourceImage:
        "https://www.dndbeyond.com/avatars/thumbnails/6/340/420/618/636272677995471928.png",
      position: "75% 0%",
    },
    Dwarf: {
      src: "artwork/race-dwarf.webp",
      sourcePage: "https://www.dndbeyond.com/species/13-dwarf",
      sourceImage:
        "https://www.dndbeyond.com/avatars/thumbnails/6/254/420/618/636271781394265550.png",
      position: "75% 0%",
    },
    Elf: {
      src: "artwork/race-elf.webp",
      sourcePage: "https://www.dndbeyond.com/species/3-elf",
      sourceImage:
        "https://www.dndbeyond.com/avatars/thumbnails/7/639/420/618/636287075350739045.png",
      position: "75% 0%",
    },
    Gnome: {
      src: "artwork/race-gnome.webp",
      sourcePage: "https://www.dndbeyond.com/species/18-gnome",
      sourceImage:
        "https://www.dndbeyond.com/avatars/thumbnails/6/334/420/618/636272671553055253.png",
      position: "75% 0%",
    },
    "Half-Elf": {
      src: "artwork/race-half-elf.webp",
      sourcePage: "https://www.dndbeyond.com/species/20-half-elf",
      sourceImage:
        "https://www.dndbeyond.com/avatars/thumbnails/6/481/420/618/636274618102950794.png",
      position: "75% 0%",
    },
    Halfling: {
      src: "artwork/race-halfling.webp",
      sourcePage: "https://www.dndbeyond.com/species/14-halfling",
      sourceImage:
        "https://www.dndbeyond.com/avatars/thumbnails/6/256/420/618/636271789409776659.png",
      position: "75% 0%",
    },
    "Half-Orc": {
      src: "artwork/race-half-orc.webp",
      sourcePage: "https://www.dndbeyond.com/species/2-half-orc",
      sourceImage:
        "https://www.dndbeyond.com/avatars/thumbnails/6/466/420/618/636274570630462055.png",
      position: "75% 0%",
    },
    Human: {
      src: "artwork/race-human.webp",
      sourcePage: "https://www.dndbeyond.com/species/1-human",
      sourceImage:
        "https://www.dndbeyond.com/avatars/thumbnails/6/258/420/618/636271801914013762.png",
      position: "75% 0%",
    },
    Tiefling: {
      src: "artwork/race-tiefling.webp",
      sourcePage: "https://www.dndbeyond.com/species/7-tiefling",
      sourceImage:
        "https://www.dndbeyond.com/avatars/thumbnails/7/641/420/618/636287076637981942.png",
      position: "75% 0%",
    },
  },
  class: {
    Barbarian: {
      src: "artwork/class-barbarian.webp",
      sourcePage: "https://www.dndbeyond.com/classes/9-barbarian",
      sourceImage:
        "https://www.dndbeyond.com/avatars/thumbnails/6/342/420/618/636272680339895080.png",
      position: "75% 0%",
    },
    Bard: {
      src: "artwork/class-bard.webp",
      sourcePage: "https://www.dndbeyond.com/classes/1-bard",
      sourceImage:
        "https://www.dndbeyond.com/avatars/thumbnails/6/369/420/618/636272705936709430.png",
      position: "75% 0%",
    },
    Cleric: {
      src: "artwork/class-cleric.webp",
      sourcePage: "https://www.dndbeyond.com/classes/2-cleric",
      sourceImage:
        "https://www.dndbeyond.com/avatars/thumbnails/6/371/420/618/636272706155064423.png",
      position: "75% 0%",
    },
    Druid: {
      src: "artwork/class-druid.webp",
      sourcePage: "https://www.dndbeyond.com/classes/3-druid",
      sourceImage:
        "https://www.dndbeyond.com/avatars/thumbnails/6/346/420/618/636272691461725405.png",
      position: "75% 0%",
    },
    Fighter: {
      src: "artwork/class-fighter.webp",
      sourcePage: "https://www.dndbeyond.com/classes/10-fighter",
      sourceImage:
        "https://www.dndbeyond.com/avatars/thumbnails/6/359/420/618/636272697874197438.png",
      position: "75% 0%",
    },
    Monk: {
      src: "artwork/class-monk.webp",
      sourcePage: "https://www.dndbeyond.com/classes/11-monk",
      sourceImage:
        "https://www.dndbeyond.com/avatars/thumbnails/6/489/420/618/636274646181411106.png",
      position: "75% 0%",
    },
    Paladin: {
      src: "artwork/class-paladin.webp",
      sourcePage: "https://www.dndbeyond.com/classes/4-paladin",
      sourceImage:
        "https://www.dndbeyond.com/avatars/thumbnails/6/365/420/618/636272701937419552.png",
      position: "75% 0%",
    },
    Ranger: {
      src: "artwork/class-ranger.webp",
      sourcePage: "https://www.dndbeyond.com/classes/5-ranger",
      sourceImage:
        "https://www.dndbeyond.com/avatars/thumbnails/6/367/420/618/636272702826438096.png",
      position: "75% 0%",
    },
    Rogue: {
      src: "artwork/class-rogue.webp",
      sourcePage: "https://www.dndbeyond.com/classes/12-rogue",
      sourceImage:
        "https://www.dndbeyond.com/avatars/thumbnails/6/384/420/618/636272820319276620.png",
      position: "75% 0%",
    },
    Sorcerer: {
      src: "artwork/class-sorcerer.webp",
      sourcePage: "https://www.dndbeyond.com/classes/6-sorcerer",
      sourceImage:
        "https://www.dndbeyond.com/avatars/thumbnails/6/485/420/618/636274643818663058.png",
      position: "75% 0%",
    },
    Warlock: {
      src: "artwork/class-warlock.webp",
      sourcePage: "https://www.dndbeyond.com/classes/7-warlock",
      sourceImage:
        "https://www.dndbeyond.com/avatars/thumbnails/6/375/420/618/636272708661726603.png",
      position: "75% 0%",
    },
    Wizard: {
      src: "artwork/class-wizard.webp",
      sourcePage: "https://www.dndbeyond.com/classes/8-wizard",
      sourceImage:
        "https://www.dndbeyond.com/avatars/thumbnails/6/357/420/618/636272696881281556.png",
      position: "75% 0%",
    },
  },
};
