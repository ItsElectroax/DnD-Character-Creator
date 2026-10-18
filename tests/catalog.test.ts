import test from "node:test";
import assert from "node:assert/strict";
import { backgrounds } from "../src/catalog/backgrounds";
import {
  classes,
  classLevelResources,
  classCatalogTranslations,
} from "../src/catalog/classes";
import {
  languageDetails,
  languages,
  skills,
} from "../src/catalog/proficiencies";
import { races, raceTraitsFor } from "../src/catalog/races";
import {
  classProgression,
  subclassFeatureLevels,
} from "../src/catalog/classes";
import {
  elementalDisciplineLevel,
  getChoiceOptionDetail,
  getSubclassChoicePlans,
  getSubclassCoverageGaps,
  getSubclassFeatureDetail,
  invocationDetails,
  landCircleSpells,
} from "../src/catalog/classes";
import { featCatalog, findFeat } from "../src/catalog/feats";
import {
  adventuringGear,
  armor,
  barding,
  equipmentCatalog,
  findEquipment,
  getBackgroundEquipment,
  getStartingEquipmentChoices,
  mounts,
  packs,
  startingWealthByClass,
  toolCatalog,
  weapons,
} from "../src/catalog/equipment";
import { findSpell, spellCatalog } from "../src/catalog/spells";
import { getCatalogAudit, phbInventory } from "../src/catalog/audit";

test("the independent PHB inventory has the exact race/class/feat families and 240 level rows", () => {
  assert.deepEqual(
    races.map((r) => r.name).sort(),
    [
      "Dwarf",
      "Elf",
      "Halfling",
      "Human",
      "Dragonborn",
      "Gnome",
      "Half-Elf",
      "Half-Orc",
      "Tiefling",
    ].sort(),
  );
  assert.deepEqual(
    classes.map((c) => c.name).sort(),
    [
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
    ].sort(),
  );
  assert.deepEqual(
    featCatalog.map((f) => f.name).sort(),
    phbInventory.feats.slice().sort(),
  );
  assert.equal(featCatalog.length, 42);
  assert.equal(backgrounds.length, 13);
  assert.equal(skills.length, 18);
  assert.equal(languages.length, 16);
  for (const c of classes) {
    assert.deepEqual(
      classProgression[c.name].levels.map((row) => row.level),
      Array.from({ length: 20 }, (_, i) => i + 1),
    );
    assert.deepEqual(
      c.subclasses.slice().sort(),
      phbInventory.subclasses[c.name as keyof typeof phbInventory.subclasses]
        .slice()
        .sort(),
    );
  }
});

test("all 40 subclass families unlock at the independent 2014 PHB levels and have named descriptions", () => {
  const byClass: Record<string, number[]> = {
    Barbarian: [3, 6, 10, 14],
    Bard: [3, 6, 14],
    Cleric: [1, 2, 6, 8, 17],
    Druid: [2, 6, 10, 14],
    Fighter: [3, 7, 10, 15, 18],
    Monk: [3, 6, 11, 17],
    Paladin: [3, 7, 15, 20],
    Ranger: [3, 7, 11, 15],
    Rogue: [3, 9, 13, 17],
    Sorcerer: [1, 6, 14, 18],
    Warlock: [1, 6, 10, 14],
    Wizard: [2, 6, 10, 14],
  };
  assert.equal(Object.keys(subclassFeatureLevels).length, 40);
  assert.deepEqual(getSubclassCoverageGaps(), []);
  for (const c of classes)
    for (const sub of c.subclasses) {
      assert.deepEqual(
        Object.keys(subclassFeatureLevels[sub]).map(Number),
        byClass[c.name],
        sub,
      );
      for (const name of Object.values(subclassFeatureLevels[sub]).flat())
        assert.ok(
          getSubclassFeatureDetail(sub, name).length > 30,
          `${sub}: ${name}`,
        );
    }
  assert.match(
    getSubclassFeatureDetail("Way of Shadow", "Cloak of Shadows"),
    /dim light or darkness/,
  );
  assert.match(
    getSubclassFeatureDetail("Trickery Domain", "Cloak of Shadows"),
    /until the end of your next turn/,
  );
  assert.match(
    getSubclassFeatureDetail("College of Valor", "Bonus Proficiencies"),
    /medium armor, shields, and martial weapons/,
  );
  assert.match(
    getSubclassFeatureDetail("Assassin", "Bonus Proficiencies"),
    /poisoner's kits/,
  );
});

test("branch acquisition counts and prerequisites obey 2014 PHB and official errata", () => {
  const monk3 = getSubclassChoicePlans("Monk", "Way of the Four Elements", 3),
    monk17 = getSubclassChoicePlans("Monk", "Way of the Four Elements", 17);
  assert.equal(monk3[0].choose, 1);
  assert.equal(monk17.length, 4);
  assert.equal(elementalDisciplineLevel("Eternal Mountain Defense"), 17);
  for (const plan of monk17)
    for (const option of plan.options) {
      assert.ok(elementalDisciplineLevel(option) <= plan.unlockLevel);
      assert.ok(getChoiceOptionDetail(plan, option).descriptionHr);
    }
  assert.ok(!monk3[0].options.includes("Gong of the Summit"));
  assert.ok(!monk3[0].options.includes("Breath of Winter"));
  const sorc = getSubclassChoicePlans("Sorcerer", "Wild Magic", 20).filter(
    (p) => p.key.startsWith("metamagic"),
  );
  assert.deepEqual(
    sorc.map((p) => [p.unlockLevel, p.choose]),
    [
      [3, 2],
      [10, 1],
      [17, 1],
    ],
  );
  assert.match(sorc[0].help, /does not grant replacement/);
  const maneuvers = getSubclassChoicePlans(
    "Fighter",
    "Battle Master",
    20,
  ).filter((p) => p.key.startsWith("maneuvers"));
  assert.deepEqual(
    maneuvers.map((p) => [p.unlockLevel, p.choose]),
    [
      [3, 3],
      [7, 2],
      [10, 2],
      [15, 2],
    ],
  );
  const invocations = getSubclassChoicePlans("Warlock", "The Fiend", 20).filter(
    (p) => p.key.startsWith("invocations"),
  );
  assert.deepEqual(
    invocations.map((p) => [p.unlockLevel, p.choose]),
    [
      [2, 2],
      [5, 1],
      [7, 1],
      [9, 1],
      [12, 1],
      [15, 1],
      [18, 1],
    ],
  );
  assert.equal(Object.keys(invocationDetails).length, 32);
  assert.equal(invocationDetails["Lifedrinker"].minimumLevel, 12);
  assert.equal(invocationDetails["Lifedrinker"].pactBoon, "Pact of the Blade");
  assert.equal(
    invocationDetails["Agonizing Blast"].spellKnown,
    "Eldritch Blast",
  );
  for (const plan of getSubclassChoicePlans(
    "Barbarian",
    "Path of the Totem Warrior",
    20,
  ))
    assert.deepEqual(plan.options, ["Bear", "Eagle", "Wolf"]);
  for (const land of Object.values(landCircleSpells))
    assert.deepEqual(Object.keys(land).map(Number), [3, 5, 7, 9]);
});

test("feats have original bilingual rules, explicit options and corrected formulas", () => {
  for (const feat of featCatalog) {
    assert.ok(feat.description.length > 45, feat.name);
    assert.ok(
      feat.descriptionHr && feat.descriptionHr !== feat.description,
      feat.name,
    );
    assert.equal(feat.optional, true);
    assert.match(feat.sourceReference || "", /2014/);
  }
  assert.match(
    findFeat("Healer")!.description,
    /1d6 \+ 4 \+ the target's maximum number of Hit Dice/,
  );
  assert.match(findFeat("Durable")!.description, /minimum total healing/);
  assert.match(findFeat("Actor")!.description, /at least 1 minute/);
  assert.equal(findFeat("Linguist")!.choiceCount, 3);
  assert.equal(findFeat("Martial Adept")!.choiceCount, 2);
  assert.match(
    findFeat("Martial Adept")!.description,
    /one d6 superiority die/,
  );
  assert.equal(findFeat("Spell Sniper")!.choiceOptions!.length, 6);
  assert.match(
    findFeat("Elemental Adept")!.description,
    /only with a different damage type/,
  );
});

test("full equipment mechanics include all PHB weapons/armor/packs, tools, gear and starting grants", () => {
  assert.equal(weapons.length, 37);
  assert.equal(armor.length, 13);
  assert.equal(packs.length, 7);
  assert.equal(toolCatalog.length, 37);
  assert.equal(mounts.length, 8);
  assert.equal(barding.length, 12);
  assert.ok(adventuringGear.length >= 99);
  assert.equal(
    new Set(equipmentCatalog.map((i) => i.id)).size,
    equipmentCatalog.length,
  );
  for (const item of equipmentCatalog) {
    assert.ok(Number.isFinite(item.costGp) && item.costGp >= 0, item.name);
    assert.ok(Number.isFinite(item.weightLb) && item.weightLb >= 0, item.name);
    assert.ok(!/not implemented/.test(item.description), item.name);
  }
  assert.equal(findEquipment("Arrows")!.costGp, 0.05);
  assert.equal(findEquipment("Leather armor")!.id, "leather");
  assert.equal(findEquipment("Hooded lantern")!.id, "lantern-hooded");
  assert.equal(findEquipment("Potion of healing")!.costGp, 50);
  assert.match(findEquipment("Healer's kit")!.description, /Ten uses/);
  for (const c of classes) {
    assert.ok(getStartingEquipmentChoices(c.name).length >= 3, c.name);
    for (const g of getStartingEquipmentChoices(c.name)) {
      assert.equal(g.choose, 1);
      assert.ok(g.options.length > 0);
      for (const option of g.options)
        if (option.chooseFrom)
          assert.ok(
            option.chooseCount! >= 1 &&
              option.chooseFrom.length >= option.chooseCount!,
          );
    }
  }
  for (const b of backgrounds) {
    const grant = getBackgroundEquipment(b.name);
    assert.ok(grant.items.length > 0, b.name);
    assert.ok(grant.currency.gp >= 5, b.name);
  }
  assert.deepEqual(
    [
      startingWealthByClass.Monk.dice,
      startingWealthByClass.Monk.multiplier,
      startingWealthByClass.Monk.min,
      startingWealthByClass.Monk.max,
    ],
    ["5d4", 1, 5, 20],
  );
  assert.deepEqual(
    [
      startingWealthByClass.Fighter.dice,
      startingWealthByClass.Fighter.multiplier,
    ],
    ["5d4", 10],
  );
});

test("spell summaries and IDs are real entries; unverifiable metadata cannot count as verified coverage", () => {
  assert.equal(
    new Set(spellCatalog.map((s) => s.id)).size,
    spellCatalog.length,
  );
  for (const spell of spellCatalog) {
    assert.ok(spell.descriptionComplete, spell.name);
    assert.ok(
      spell.descriptionHr && spell.descriptionHr !== spell.description,
      spell.name,
    );
    assert.ok(spell.classes.length > 0, spell.name);
    assert.ok(spell.level >= 0 && spell.level <= 9, spell.name);
    if (spell.verification === "verified-open-rules") {
      assert.ok(spell.school, spell.name);
      assert.ok(spell.castingTime, spell.name);
      assert.ok(spell.range, spell.name);
      assert.ok(spell.components, spell.name);
      assert.ok(spell.duration, spell.name);
    }
  }
  assert.equal(findSpell("Arcane Hand")?.name, "Bigby's Hand");
  assert.equal(findSpell("Nystul’s Magic Aura")?.level, 2);
  assert.equal(findSpell("Mirage Arcane")?.level, 7);
  assert.equal(findSpell("Fire Bolt")?.attack?.dice, "1d10");
  assert.equal(findSpell("Eldritch Blast")?.attack?.beams, true);
  assert.equal(
    findSpell("Witch Bolt")?.verification,
    "source-verification-needed",
  );
  assert.equal(findSpell("Sorcerous Burst"), undefined);
  const report = getCatalogAudit();
  assert.equal(report.complete, false);
  assert.ok(report.issues.some((i) => i.id === "phb-spell-index-access"));
  assert.ok(report.issues.some((i) => i.id === "spell-source-witch-bolt"));
  assert.ok(!report.issues.some((i) => i.id.startsWith("spell-description-")));
});

test("Knight equipment guidance agrees with the selected background feature variant", () => {
  const knight = getBackgroundEquipment("Noble / Knight", "Knight");
  const retainers = getBackgroundEquipment(
    "Noble / Knight",
    "Knight (Retainers)",
  );
  assert.match(knight.note || "", /This Knight uses Position of Privilege/);
  assert.match(
    retainers.note || "",
    /Retainers replaces Position of Privilege/,
  );
  assert.match(
    retainers.note || "",
    /exactly three loyal noncombatant attendants/,
  );
  assert.deepEqual(knight.items, retainers.items);
  assert.deepEqual(knight.currency, retainers.currency);
});

test("all sixteen languages have distinct bilingual speaker context and preserve PHB scripts", () => {
  const details = languages.map((name) => languageDetails[name]);
  assert.equal(details.length, 16);
  assert.equal(new Set(details.map((detail) => detail.description)).size, 16);
  assert.equal(new Set(details.map((detail) => detail.descriptionHr)).size, 16);
  for (const detail of details) {
    assert.ok(detail.speakers);
    assert.ok(detail.speakersHr);
    assert.ok(detail.nameHr);
    assert.ok(detail.scriptHr);
    assert.ok(
      !/A language proficiency grants|Poznavanje daje govor/.test(
        detail.description + detail.descriptionHr,
      ),
    );
  }
  assert.equal(languageDetails.Giant.speakers, "ogres and giants");
  assert.equal(languageDetails.Giant.script, "Dwarvish");
  assert.equal(languageDetails["Deep Speech"].script, "No script");
  assert.equal(languageDetails["Deep Speech"].exotic, true);
  assert.equal(languageDetails.Common.exotic, false);
  assert.equal(languageDetails.Undercommon.speakers, "Underdark traders");
});

test("all 24 lineage trait lists have unique entries and Drow darkvision replaces the base range", () => {
  assert.equal(races.flatMap((race) => race.subraces).length, 24);
  for (const race of races)
    for (const lineage of race.subraces) {
      const traits = raceTraitsFor(race.name, lineage.name);
      assert.ok(traits.length > 0, lineage.name);
      assert.equal(
        new Set(traits.map((trait) => trait.name)).size,
        traits.length,
        lineage.name,
      );
      assert.ok(
        traits.every((trait) => trait.description.length > 15),
        lineage.name,
      );
      assert.ok(
        traits.filter((trait) => /darkvision/i.test(trait.name)).length <= 1,
        lineage.name,
      );
    }
  assert.deepEqual(
    raceTraitsFor("Elf", "Dark Elf (Drow)")
      .filter((trait) => /darkvision/i.test(trait.name))
      .map((trait) => trait.name),
    ["Superior Darkvision (120 ft.)"],
  );
});

test("all 40 subclasses have unique eligible choice plans immediately before and at every unlock", () => {
  for (const klass of classes)
    for (const subclass of klass.subclasses)
      for (let level = 1; level <= 20; level++) {
        const plans = getSubclassChoicePlans(klass.name, subclass, level);
        assert.equal(
          new Set(plans.map((plan) => `${plan.unlockLevel}:${plan.key}`)).size,
          plans.length,
          `${subclass} ${level}`,
        );
        for (const plan of plans) {
          assert.ok(plan.unlockLevel <= level, `${subclass} ${plan.key}`);
          assert.ok(
            plan.options.length >= plan.choose && plan.choose > 0,
            `${subclass} ${plan.key}`,
          );
          assert.equal(
            new Set(plan.options).size,
            plan.options.length,
            `${subclass} ${plan.key}`,
          );
          assert.ok(
            !getSubclassChoicePlans(
              klass.name,
              subclass,
              plan.unlockLevel - 1,
            ).some((previous) => previous.key === plan.key),
            `${subclass} ${plan.key} appeared early`,
          );
        }
      }
});

test("Moon druid resources resolve at each level without changing base druid progression", () => {
  for (const row of classProgression.Druid.levels) {
    const resolved = classLevelResources("Druid", row, "Circle of the Moon");
    assert.equal(
      resolved.wildShapeCR,
      row.level < 2
        ? "—"
        : String(row.level < 6 ? 1 : Math.floor(row.level / 3)),
    );
    assert.equal(resolved.wildShapeLimits, row.wildShapeLimits);
    assert.equal(classLevelResources("Druid", row, "Circle of the Land"), row);
  }
  const monk = classProgression.Monk.levels[0].features.find(
    (feature) => feature.name === "Unarmored Defense",
  )!;
  assert.match(monk.description, /Wisdom/);
  assert.doesNotMatch(monk.description, /Constitution/);
  assert.match(classCatalogTranslations()[monk.description], /Mudrosti/);
  assert.doesNotMatch(
    getSubclassChoicePlans("Sorcerer", "Draconic Bloodline", 1)[0].help,
    /used by Draconic Resilience/,
  );
  assert.match(
    getSubclassFeatureDetail("Beast Master", "Bestial Fury"),
    /Multiattack/,
  );
  assert.doesNotMatch(
    getSubclassFeatureDetail("Beast Master", "Exceptional Training"),
    /Dash, Disengage, Dodge/,
  );
});

test("all 240 class resource rows obey independent 2014 progression expectations", () => {
  const bardKnown = [
    4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22,
  ];
  const rangerKnown = [
    0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11,
  ];
  const sorcererKnown = [
    2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15,
  ];
  const warlockKnown = [
    2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15,
  ];
  for (let level = 1; level <= 20; level++) {
    const at = (name: string) => classProgression[name].levels[level - 1];
    assert.equal(
      at("Barbarian").rageUses,
      level < 3
        ? 2
        : level < 6
          ? 3
          : level < 12
            ? 4
            : level < 17
              ? 5
              : level < 20
                ? 6
                : "Unlimited",
    );
    assert.equal(
      at("Barbarian").rageDamage,
      level < 9 ? 2 : level < 16 ? 3 : 4,
    );
    assert.equal(at("Bard").spellsKnown, bardKnown[level - 1]);
    assert.equal(
      at("Bard").bardicInspirationDie,
      level < 5 ? "d6" : level < 10 ? "d8" : level < 15 ? "d10" : "d12",
    );
    assert.equal(
      at("Cleric").channelDivinityUses,
      level < 2 ? 0 : level < 6 ? 1 : level < 18 ? 2 : 3,
    );
    assert.equal(
      at("Cleric").cantripsKnown,
      level < 4 ? 3 : level < 10 ? 4 : 5,
    );
    assert.equal(at("Druid").cantripsKnown, level < 4 ? 2 : level < 10 ? 3 : 4);
    assert.equal(
      at("Druid").wildShapeCR,
      level < 2 ? "—" : level < 4 ? "1/4" : level < 8 ? "1/2" : "1",
    );
    assert.equal(
      at("Fighter").extraAttacks,
      level < 5 ? 1 : level < 11 ? 2 : level < 20 ? 3 : 4,
    );
    assert.equal(
      at("Fighter").actionSurgeUses,
      level < 2 ? 0 : level < 17 ? 1 : 2,
    );
    assert.equal(
      at("Fighter").indomitableUses,
      level < 9 ? 0 : level < 13 ? 1 : level < 17 ? 2 : 3,
    );
    assert.equal(at("Monk").kiPoints, level < 2 ? 0 : level);
    assert.equal(
      at("Monk").martialArtsDie,
      level < 5 ? "d4" : level < 11 ? "d6" : level < 17 ? "d8" : "d10",
    );
    assert.equal(
      at("Monk").unarmoredMovement,
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
                : 30,
    );
    assert.equal(at("Paladin").layOnHandsPool, level * 5);
    assert.equal(
      at("Ranger").favoredEnemyCount,
      level < 6 ? 1 : level < 14 ? 2 : 3,
    );
    assert.equal(
      at("Ranger").favoredTerrainCount,
      level < 6 ? 1 : level < 10 ? 2 : 3,
    );
    assert.equal(at("Ranger").spellsKnown, rangerKnown[level - 1]);
    assert.equal(at("Rogue").sneakAttackDice, Math.ceil(level / 2));
    assert.equal(at("Sorcerer").sorceryPoints, level < 2 ? 0 : level);
    assert.equal(at("Sorcerer").spellsKnown, sorcererKnown[level - 1]);
    assert.equal(at("Warlock").spellsKnown, warlockKnown[level - 1]);
    assert.equal(
      at("Warlock").pactSlots,
      level < 2 ? 1 : level < 11 ? 2 : level < 17 ? 3 : 4,
    );
    assert.equal(
      at("Warlock").pactSlotLevel,
      Math.min(5, Math.ceil(level / 2)),
    );
    assert.equal(at("Wizard").arcaneRecoveryLevels, Math.ceil(level / 2));
    assert.equal(
      at("Wizard").cantripsKnown,
      level < 4 ? 3 : level < 10 ? 4 : 5,
    );
  }
  const ordinary = [4, 8, 12, 16, 19];
  for (const klass of classes)
    assert.deepEqual(
      classProgression[klass.name].levels
        .filter((row) => row.asi)
        .map((row) => row.level),
      klass.name === "Fighter"
        ? [4, 6, 8, 12, 14, 16, 19]
        : klass.name === "Rogue"
          ? [4, 8, 10, 12, 16, 19]
          : ordinary,
    );
});
