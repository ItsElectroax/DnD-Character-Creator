import test from "node:test";
import assert from "node:assert/strict";
import { untranslatedRuleDescriptions } from "../src/i18n/register";
import { t } from "../src/i18n/engine";
import {
  derive,
  initialCharacter,
  validateStage,
} from "../src/engine/character";

test("every static class, race, and subclass feature description has a Croatian explanation", () => {
  assert.deepEqual(untranslatedRuleDescriptions(), []);
});

test("Croatian racial spell availability keeps level-gated reminders translated", () => {
  for (const [race, subrace, feature] of [
    ["Tiefling", "Tiefling", "Infernal Legacy"],
    ["Elf", "Dark Elf (Drow)", "Drow Magic"],
  ])
    for (const level of [1, 3, 5]) {
      const c = initialCharacter();
      c.race = race;
      c.subrace = subrace;
      c.classes = ["Fighter"];
      c.level = level;
      const description = derive(c).featureEntries.find(
        (item) => item.name === feature,
      )!.description;
      const translated = t(description, "hr");
      assert.match(translated, /Trenutno dostupno/);
      assert.ok(
        !/Available now|at will|once per long rest|cast as a 2nd-level spell/.test(
          translated,
        ),
        translated,
      );
    }
});

test("Croatian generated Monk and Bard feature paragraphs retain current numbers and rules", () => {
  const c = initialCharacter();
  c.classes = ["Monk"];
  c.level = 5;
  c.scoresAreFinal = true;
  c.baseAbilities.Wisdom = 14;
  const ki = derive(c).featureEntries.find((feature) => feature.name === "Ki")!;
  const translated = t(ki.description, "hr");
  assert.match(translated, /5 ki bodova/);
  assert.match(translated, /1 ki/);
  assert.match(translated, /Ki DC 13/);
  assert.ok(!translated.includes("Current at"));
  assert.ok(!translated.includes("Spend 1 ki"));
  assert.ok(!translated.includes("regain all after"));
  c.classes = ["Bard"];
  c.level = 5;
  c.baseAbilities.Charisma = 16;
  const inspiration = derive(c).featureEntries.find(
    (feature) => feature.name === "Bardic Inspiration",
  )!;
  const bard = t(inspiration.description, "hr");
  assert.match(bard, /d8/);
  assert.match(bard, /3 uporaba/);
  assert.ok(!bard.includes("Current at"));
  assert.ok(!bard.includes("use(s)"));
});

test("Croatian multiclass validation keeps score requirements and translates captured ability names", () => {
  const c = initialCharacter();
  c.classMode = "multi";
  c.classes = ["Bard", "Monk"];
  c.level = 2;
  c.levelPath = { 1: "Bard", 2: "Monk" };
  c.baseAbilities.Charisma = 8;
  c.baseAbilities.Wisdom = 8;
  const issue = validateStage(c, 3).find((message) =>
    message.includes("multiclass ability scores"),
  )!;
  assert.ok(issue);
  const translated = t(issue, "hr");
  assert.match(translated, /višeklasnost/);
  assert.match(translated, /Mudrost 13/);
  assert.match(translated, /Karizma 13/);
  assert.ok(!translated.includes("entry at character level"));
});

test("Croatian PDF continuation clauses translate joined live fields and stat ranges", () => {
  const casting = t(
    "4th-level 2. Spellcasting ability: Wisdom; save DC 18, spell attack +10. prepare up to 12 spells.",
    "hr",
  );
  assert.match(casting, /razina 4: 2/);
  assert.match(casting, /Mudrost/);
  assert.match(casting, /18/);
  assert.match(casting, /\+10/);
  assert.match(casting, /najviše 12/);
  assert.ok(!casting.includes("prepare up to"));
  assert.ok(!casting.includes("Spellcasting ability"));
  assert.equal(
    t("Choices recorded: Dexterity and Constitution", "hr"),
    "Zabilježeni odabiri: Spretnost i Izdržljivost",
  );
  assert.equal(
    t("Six-ability stat wheel, scale 0 to 24", "hr"),
    "Dijagram šest osobina, raspon od 0 do 24",
  );
  assert.equal(
    t("Each axis uses the same 0–24 scale.", "hr"),
    "Svaka os koristi isti raspon 0–24.",
  );
  assert.ok(
    !t(
      "Pact of the Tome grants 3 any-class cantrip choice(s); record them with that feature as the source.",
      "hr",
    ).includes("cantrip choice"),
  );
  assert.equal(
    t("Concentration, up to 1 minute", "hr"),
    "Koncentracija, do 1 minute",
  );
  assert.equal(t("60 feet", "hr"), "60 stopa");
  assert.equal(t("Touch", "hr"), "Dodir");
});

test("Croatian dense Cleric and background feature paragraphs have no known residual English clauses", () => {
  const c = initialCharacter();
  c.scoresAreFinal = true;
  c.classMode = "multi";
  c.level = 20;
  c.classes = ["Cleric", "Fighter"];
  c.levelPath = Object.fromEntries(
    Array.from({ length: 20 }, (_, i) => [i + 1, i < 8 ? "Cleric" : "Fighter"]),
  );
  c.baseAbilities.Wisdom = 18;
  c.background = "Sage";
  c.subclass.Cleric = "Life Domain";
  const features = derive(c).featureEntries;
  const casting = t(
    features.find(
      (feature) =>
        feature.name === "Spellcasting" && feature.className === "Cleric",
    )!.description,
    "hr",
  );
  assert.match(casting, /najviše 12/);
  assert.ok(!casting.includes("prepare up to"));
  const domain = t(
    features.find((feature) => feature.name === "Divine Domain")!.description,
    "hr",
  );
  assert.ok(!domain.includes("It unlocks additional features"));
  assert.match(domain, /razinama klase/);
  const researcher = t(
    features.find((feature) => feature.name === "Researcher")!.description,
    "hr",
  );
  assert.ok(!researcher.includes("You know how"));
  assert.match(researcher, /knjižnicama/);
  assert.equal(
    t("Choices recorded: Acrobatics and Stealth", "hr"),
    "Zabilježeni odabiri: Akrobatika i Prikrivanje",
  );
  assert.equal(t("1 round", "hr"), "1 krug");
});
