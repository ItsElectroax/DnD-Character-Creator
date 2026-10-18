import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import {
  PDFDocument,
  PDFDict,
  PDFName,
  PDFRawStream,
  decodePDFRawStream,
} from "pdf-lib";
import { abilities, skills } from "../src/catalog/proficiencies";
import { initialCharacter, derive } from "../src/engine/character";
import { normalizeDraft } from "../src/storage/drafts";
import {
  exportFillableSheet,
  importFillableSheet,
  resolvePDFImport,
  inspectSheetTemplate,
} from "../src/pdf/characterSheet";

const sign = (n: number) => (n >= 0 ? `+${n}` : String(n));
const saveFields: Record<string, string> = {
  Strength: "ST Strength",
  Dexterity: "ST Dexterity",
  Constitution: "ST Constitution",
  Intelligence: "ST Intelligence",
  Wisdom: "ST Wisdom",
  Charisma: "ST Charisma",
};
const saveChecks: Record<string, string> = {
  Strength: "Check Box 11",
  Dexterity: "Check Box 18",
  Constitution: "Check Box 19",
  Intelligence: "Check Box 20",
  Wisdom: "Check Box 21",
  Charisma: "Check Box 22",
};
const skillFields: Record<string, string> = {
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
const serialize = (value: unknown) => JSON.parse(JSON.stringify(value));
async function template() {
  const doc = await PDFDocument.create();
  const pages = [doc.addPage(), doc.addPage(), doc.addPage()];
  const form = doc.getForm();
  const textNames = [
    "CharacterName",
    "CharacterName 2",
    "PlayerName",
    "ClassLevel",
    "Race ",
    "Background",
    "Alignment",
    "XP",
    "ProfBonus",
    "AC",
    "Initiative",
    "Speed",
    "HPMax",
    "HPCurrent",
    "HPTemp",
    "HD",
    "HDTotal",
    "Passive",
    "Inspiration",
    "PersonalityTraits ",
    "Ideals",
    "Bonds",
    "Flaws",
    "ProficienciesLang",
    "Equipment",
    "Features and Traits",
    "Feat+Traits",
    "Backstory",
    "Allies",
    "Treasure",
    "FactionName",
    "Age",
    "Height",
    "Weight",
    "Eyes",
    "Skin",
    "Hair",
    "AttacksSpellcasting",
    "STR",
    "DEX",
    "CON",
    "INT",
    "WIS",
    "CHA",
    "STRmod",
    "DEXmod ",
    "CONmod",
    "INTmod",
    "WISmod",
    "CHamod",
    ...Object.values(saveFields),
    ...Object.values(skillFields),
    "Wpn Name",
    "Wpn Name 2",
    "Wpn Name 3",
    "Wpn1 AtkBonus",
    "Wpn2 AtkBonus ",
    "Wpn3 AtkBonus   ",
    "Wpn1 Damage",
    "Wpn2 Damage ",
    "Wpn3 Damage ",
    "CP",
    "SP",
    "EP",
    "GP",
    "PP",
    "Spellcasting Class 2",
    "SpellcastingAbility 2",
    "SpellSaveDC  2",
    "SpellAtkBonus 2",
    ...Array.from({ length: 9 }, (_, i) => `SlotsTotal ${19 + i}`),
    ...Array.from({ length: 9 }, (_, i) => `SlotsRemaining ${19 + i}`),
  ];
  for (const [i, name] of [...new Set(textNames)].entries()) {
    const field = form.createTextField(name);
    const wide = [
      "Features and Traits",
      "Feat+Traits",
      "Backstory",
      "Equipment",
      "ProficienciesLang",
      "AttacksSpellcasting",
      "Allies",
      "Treasure",
    ].includes(name);
    if (wide) field.enableMultiline();
    field.addToPage(pages[i % 3], {
      x: 30 + (i % 3) * 175,
      y: 50 + (i % 24) * 26,
      width: wide ? 160 : 150,
      height: wide ? 80 : 20,
    });
  }
  for (const [i, name] of [
    ...new Set([
      ...Object.values(saveChecks),
      ...skills.map((_, i) => `Check Box ${23 + i}`),
    ]),
  ].entries())
    form
      .createCheckBox(name)
      .addToPage(pages[0], { x: 10, y: 40 + i * 14, width: 8, height: 8 });
  for (const [i, name] of [
    "Spells 1014",
    "Spells 1015",
    "Spells 1023",
  ].entries())
    form.createTextField(name).addToPage(pages[2], {
      x: 40,
      y: i === 0 ? 600 : 420 - i * 14,
      width: 150,
      height: 13,
    });
  return doc.save();
}
function build() {
  const c = initialCharacter();
  c.race = "Dwarf";
  c.subrace = "Hill Dwarf";
  c.classes = ["Monk"];
  c.level = 7;
  c.subclass = { Monk: "Way of the Open Hand" };
  c.background = "Urchin";
  c.abilityMethod = "manual";
  c.classSkillChoices.Monk = ["Athletics", "Insight"];
  c.baseAbilities = {
    Strength: 10,
    Dexterity: 16,
    Constitution: 14,
    Intelligence: 8,
    Wisdom: 16,
    Charisma: 12,
  };
  c.identity.name = "Štef Čačić Žulj Đurić";
  c.identity.backstory = "Čarobna šuma, selo i obitelj. ".repeat(120);
  c.identity.allies = "Štefica i Đuro";
  c.identity.treasure = "Očev sat";
  c.identity.faction = "Čuvari";
  c.equipmentItems = ["shortsword", "dagger", "shortbow", "quarterstaff"].map(
    (name) => ({
      id: name,
      catalogId: name,
      name,
      quantity: 1,
      equipped: true,
      source: "Player choice",
      characterLevel: 1,
      className: "Monk",
      classLevel: 1,
      notes: "",
      mode: "one-handed" as const,
    }),
  );
  return c;
}
const originalFetch = globalThis.fetch;
async function withFonts(fn: () => Promise<void>) {
  globalThis.fetch = async (url) =>
    new Response(
      fs.readFileSync(
        String(url).includes("templates/")
          ? "public/templates/5E_CharacterSheet_Fillable.pdf"
          : `public/fonts/${String(url).includes("Inconsolata") ? "Inconsolata-Regular.ttf" : "DejaVuSans.ttf"}`,
      ),
      { status: 200 },
    );
  try {
    await fn();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

test("PDF sheet shares all six saves, eighteen skills, proficiency flags, Unicode and complete build", async () =>
  withFonts(async () => {
    const c = build();
    const expected = derive(c);
    const bytes = await exportFillableSheet(await template(), c, "hr");
    const pdf = await PDFDocument.load(bytes);
    const form = pdf.getForm();
    assert.equal(
      form.getTextField("ProfBonus").getText(),
      sign(expected.proficiency),
    );
    assert.match(form.getTextField("Features and Traits").getText()!, /NACRT/);
    for (const ability of abilities) {
      assert.equal(
        form.getTextField(saveFields[ability]).getText(),
        sign(expected.saves[ability]),
      );
      assert.equal(
        form.getCheckBox(saveChecks[ability]).isChecked(),
        expected.proficiencies.some(
          (p) => p.kind === "Save" && p.name === ability,
        ),
      );
    }
    const check = form.getCheckBox(saveChecks.Strength);
    const normal = check.acroField.getWidgets()[0].getAppearances()!
      .normal as PDFDict;
    const mark = normal.lookup(PDFName.of("Yes"), PDFRawStream);
    const markText = new TextDecoder().decode(
      decodePDFRawStream(mark).decode(),
    );
    assert.doesNotMatch(markText, /ZaDb|BT/);
    assert.match(markText, /\bl\b/);
    skills.forEach((skill, i) => {
      assert.equal(
        form.getTextField(skillFields[skill]).getText(),
        sign(expected.skillBonuses[skill]),
      );
      assert.equal(
        form.getCheckBox(`Check Box ${23 + i}`).isChecked(),
        expected.proficiencies.some(
          (p) => p.kind === "Skill" && p.name === skill,
        ),
      );
    });
    assert.equal(form.getTextField("CharacterName").getText(), c.identity.name);
    assert.equal(
      form.getTextField("CharacterName 2").getText(),
      c.identity.name,
    );
    assert.equal(form.getTextField("Allies").getText(), c.identity.allies);
    assert.equal(
      form.getTextField("FactionName").getText(),
      c.identity.faction,
    );
    assert.equal(form.getTextField("Treasure").getText(), c.identity.treasure);
    const restored = await importFillableSheet(bytes);
    assert.equal(restored.fromAppExport, true);
    assert.equal(restored.conflicts.length, 0);
    assert.deepEqual(serialize(restored.character), serialize(c));
    assert.equal(restored.character.attacks.length, 0);
    assert(expected.attacks.length > 3);
    assert.equal(pdf.getPageCount(), 3);
    const twice = await exportFillableSheet(bytes, c, "hr");
    assert.equal(
      (await PDFDocument.load(twice)).getPageCount(),
      pdf.getPageCount(),
    );
    form
      .getTextField("Backstory")
      .setText(
        form.getTextField("Backstory").getText()!.replace("Čarobna", "Tajna"),
      );
    form.getTextField("Hair").setText("Sijeda");
    form.getTextField("ST Dexterity").setText("+99");
    form.getCheckBox("Check Box 11").uncheck();
    form.getCheckBox("Check Box 25").check();
    const edited = await importFillableSheet(
      await pdf.save({ updateFieldAppearances: false }),
    );
    assert.equal(edited.character.identity.hair, "Sijeda");
    assert.equal(
      edited.character.identity.backstory,
      c.identity.backstory.replace("Čarobna", "Tajna"),
    );
    assert.equal(edited.conflicts.length, 3);
    const accepted = resolvePDFImport(edited, [
      "ST Dexterity",
      "Check Box 11",
      "Check Box 25",
    ]);
    assert.equal(accepted.sheetOverrides["save:Dexterity"], "99");
    assert(
      !derive(accepted).proficiencies.some(
        (p) => p.kind === "Save" && p.name === "Strength",
      ),
    );
    assert(
      derive(accepted).proficiencies.some(
        (p) => p.kind === "Skill" && p.name === "Arcana",
      ),
    );
    assert.equal(edited.character.attacks.length, 0);
  }));

test("PDF template inspection does not import or invent a character", async () => {
  const info = await inspectSheetTemplate(await template());
  assert.equal(info.supported, true);
  assert.equal(info.hasSpellPage, true);
  assert.equal(info.pageCount, 3);
});

test("supplied external sheets keep racial traits, accents and categorized proficiencies without fake attacks", async (t) => {
  const folder = process.env.DND_PDF_FIXTURES || "C:/Users/Daniel/Downloads";
  for (const name of [
    "StefIII_Toma_Character_Sheet.pdf",
    "5E_CharacterSheet_Reid.pdf",
  ]) {
    const path = `${folder}/${name}`;
    if (!fs.existsSync(path)) {
      t.diagnostic(`Optional external fixture unavailable: ${name}`);
      continue;
    }
    const result = await importFillableSheet(fs.readFileSync(path));
    assert(result.character.identity.name);
    assert(result.character.identity.allies);
    assert(
      result.character.otherProficiencies.some(
        (p) => p.kind === "Language" && p.name === "Common",
      ),
    );
    assert(
      !result.character.attacks.some((a) =>
        /čarolije|sneak attack/i.test(a.name),
      ),
    );
    if (name.startsWith("Stef")) {
      assert(result.character.identity.name.includes("Štef"));
      assert.equal(
        result.character.featureEntries.filter((f) => f.sourceType === "Race")
          .length,
        6,
      );
      assert.equal(result.character.attacks.length, 3);
    } else assert.equal(result.character.attacks.length, 4);
    assert(Object.keys(result.rawFields).length > 100);
  }
});

test("spell fields use shared casting calculations and keep Pact Magic separate", async () =>
  withFonts(async () => {
    const c = build();
    c.classes = ["Wizard", "Warlock"];
    c.level = 5;
    c.classMode = "multi";
    c.dmPermission = true;
    c.levelPath = {
      1: "Wizard",
      2: "Wizard",
      3: "Wizard",
      4: "Warlock",
      5: "Warlock",
    };
    c.subclass = { Wizard: "School of Evocation", Warlock: "The Fiend" };
    c.spellSelections = [
      {
        spellId: "fire-bolt",
        source: "Wizard",
        status: "known",
        acquiredLevel: 1,
      },
      {
        spellId: "magic-missile",
        source: "Wizard",
        status: "prepared",
        acquiredLevel: 1,
      },
      {
        spellId: "eldritch-blast",
        source: "Warlock",
        status: "known",
        acquiredLevel: 4,
      },
    ];
    const d = derive(c);
    const output = await exportFillableSheet(await template(), c);
    const pdf = await PDFDocument.load(output);
    const form = pdf.getForm();
    const caster = d.spellcasting[0];
    assert.equal(form.getTextField("Spellcasting Class 2").getText(), "Wizard");
    assert.equal(
      form.getTextField("SpellSaveDC  2").getText(),
      String(caster.saveDC),
    );
    assert.equal(
      form.getTextField("SpellAtkBonus 2").getText(),
      sign(caster.attackBonus),
    );
    assert.equal(
      form.getTextField("SlotsTotal 19").getText(),
      String(d.spellSlots[0]),
    );
    assert.equal(
      form.getTextField("SlotsTotal 20").getText(),
      String(d.spellSlots[1]),
    );
    assert.equal(d.pactSlots, 2);
    assert.match(
      form.getTextField("Spells 1014").getText()!,
      /^Fire Bolt \| spell atk: ranged \| 1 \| 1 \(V,S\) \| /,
    );
    assert.match(form.getTextField("Spells 1014").getText()!, /2d10 fire/);
    assert.match(form.getTextField("Spells 1014").getText()!, /120 ft/);
    assert.match(
      form.getTextField("Spells 1015").getText()!,
      /3 × \(1d4\+1\) force/,
    );
    const restored = await importFillableSheet(output);
    assert.deepEqual(restored.character.spellSelections, c.spellSelections);
    const before = derive(restored.character).attacks.find(
      (a) => a.name === "Shortsword",
    )!;
    restored.character.baseAbilities.Dexterity += 2;
    const after = derive(restored.character).attacks.find(
      (a) => a.name === "Shortsword",
    )!;
    assert.notEqual(after.calculatedBonus, before.calculatedBonus);
    assert.equal(restored.character.attacks.length, 0);
  }));

test("wealth PDF output excludes retained inactive package items while preserving exact draft state", async () =>
  withFonts(async () => {
    const c = build();
    c.equipmentMethod = "wealth";
    c.startingGold = "15";
    c.equipment = ["Shortsword package", "start:old:token"];
    c.equipmentItems = [
      {
        id: "start-old-Shortsword",
        catalogId: "shortsword",
        name: "Shortsword",
        quantity: 1,
        source: "Starting class: Monk",
        characterLevel: 1,
        className: "Monk",
        classLevel: 1,
        notes: "",
      },
      {
        id: "purchased-dagger",
        catalogId: "dagger",
        name: "Dagger",
        quantity: 1,
        source: "Purchased",
        characterLevel: 1,
        className: "",
        classLevel: null,
        notes: "",
      },
    ];
    const bytes = await exportFillableSheet(await template(), c);
    const pdf = await PDFDocument.load(bytes);
    const equipment = pdf.getForm().getTextField("Equipment").getText() || "";
    assert.match(equipment, /Dagger/);
    assert.doesNotMatch(equipment, /Shortsword|start:old/);
    assert(!derive(c).attacks.some((attack) => attack.name === "Shortsword"));
    const recovered = await importFillableSheet(bytes);
    assert.equal(recovered.character.equipmentMethod, "wealth");
    assert.equal(recovered.character.startingGold, "15");
    assert.deepEqual(
      serialize(recovered.character.equipmentItems),
      serialize(normalizeDraft(c).equipmentItems),
    );
    assert.deepEqual(recovered.character.equipment, c.equipment);
  }));

test("spell export fills original rows exactly without changing the PDF layout", async () =>
  withFonts(async () => {
    const { PDFTextField } = await import("pdf-lib");
    const c = build();
    c.classes = ["Wizard"];
    c.subclass = { Wizard: "School of Abjuration" };
    c.race = "Human";
    c.subrace = "Standard Human";
    c.level = 8;
    c.identity.backstory = "Short story.";
    c.spellSelections = [
      {
        spellId: "acid-splash",
        source: "Wizard",
        status: "known",
        acquiredLevel: 1,
      },
      {
        spellId: "magic-missile",
        source: "Wizard",
        status: "prepared",
        acquiredLevel: 1,
      },
    ];
    const original = await PDFDocument.load(
      fs.readFileSync("public/templates/5E_CharacterSheet_Fillable.pdf"),
    );
    const content = (doc: InstanceType<typeof PDFDocument>) =>
      doc.getPages().map((page) => {
        const c = page.node.Contents();
        return (
          c instanceof PDFRawStream
            ? [c]
            : c
                ?.asArray()
                .map((ref) => doc.context.lookup(ref, PDFRawStream)) || []
        )
          .map((stream) => Array.from(decodePDFRawStream(stream).decode()))
          .flat();
      });
    const geometry = (doc: InstanceType<typeof PDFDocument>) =>
      Object.fromEntries(
        doc
          .getForm()
          .getFields()
          .map((field) => [
            field.getName(),
            field.acroField.getWidgets().map((widget) => widget.getRectangle()),
          ]),
      );
    for (const locale of ["en", "hr"] as const) {
      const bytes = await exportFillableSheet(
        fs.readFileSync("public/templates/5E_CharacterSheet_Fillable.pdf"),
        c,
        locale,
      );
      const pdf = await PDFDocument.load(bytes);
      assert.equal(pdf.getPageCount(), 3);
      assert.equal(pdf.getForm().getFields().length, 334);
      assert.deepEqual(content(pdf), content(original));
      assert.deepEqual(geometry(pdf), geometry(original));
      const row = pdf.getForm().getTextField("Spells 1014");
      if (locale === "en")
        assert.equal(
          row.getText(),
          "Acid Splash | DEX | 2 (5 ft) | 1 (V,S) | 2d6 acid | 60 ft",
        );
      else
        assert.match(
          row.getText()!,
          /\| SPR \| 2 \(5 ft\) \| 1 \(V,S\) \| 2d6 kiselinska \| 60 ft$/,
        );
      assert.equal(row.isMultiline(), false);
      assert.equal(row.isScrollable(), true);
      assert.equal(
        pdf
          .getForm()
          .getTextField("Spells 1015")
          .getText()
          ?.includes(locale === "en" ? "Magic Missile |" : "(Magic Missile) |"),
        true,
      );
      const recovered = await importFillableSheet(bytes);
      assert.deepEqual(serialize(recovered.character), serialize(c));
      assert.equal(recovered.conflicts.length, 0);
      const blank = normalizeDraft(c);
      blank.spellSelections = [];
      const emptied = await PDFDocument.load(
        await exportFillableSheet(bytes, blank, locale),
      );
      const { PDFCheckBox } = await import("pdf-lib");
      const spellChecks = (doc: InstanceType<typeof PDFDocument>) =>
        doc
          .getForm()
          .getFields()
          .filter(
            (field) =>
              field instanceof PDFCheckBox &&
              field.isChecked() &&
              field.acroField
                .getWidgets()
                .some(
                  (widget) =>
                    widget.dict.get(PDFName.of("P"))?.toString() ===
                    doc.getPage(2).ref.toString(),
                ),
          );
      assert.equal(spellChecks(pdf).length, 1);
      assert.equal(spellChecks(emptied).length, 0);
      const repeated = await exportFillableSheet(bytes, c, locale);
      const again = await PDFDocument.load(repeated);
      assert.deepEqual(content(again), content(original));
      assert.deepEqual(geometry(again), geometry(original));
      assert(
        pdf
          .getForm()
          .getFields()
          .filter(
            (field) =>
              field instanceof PDFTextField && /^Spells /.test(field.getName()),
          )
          .every(
            (field) =>
              !(field as InstanceType<typeof PDFTextField>)
                .getText()
                ?.includes("\n"),
          ),
      );
    }
  }));

test("previously redesigned app exports return to the original template", async () =>
  withFonts(async () => {
    const original = await PDFDocument.load(
      fs.readFileSync("public/templates/5E_CharacterSheet_Fillable.pdf"),
    );
    original
      .getPage(2)
      .node.set(
        PDFName.of("DnDCreatorSpellBaseContents"),
        PDFName.of("LegacyLayout"),
      );
    original
      .getForm()
      .getTextField("Spells 1014")
      .acroField.getWidgets()[0]
      .setRectangle({ x: 12, y: 12, width: 400, height: 100 });
    const c = build();
    c.identity.backstory = "Short story.";
    const restored = await PDFDocument.load(
      await exportFillableSheet(await original.save(), c),
    );
    const native = await PDFDocument.load(
      fs.readFileSync("public/templates/5E_CharacterSheet_Fillable.pdf"),
    );
    assert.deepEqual(
      restored
        .getForm()
        .getTextField("Spells 1014")
        .acroField.getWidgets()[0]
        .getRectangle(),
      native
        .getForm()
        .getTextField("Spells 1014")
        .acroField.getWidgets()[0]
        .getRectangle(),
    );
    assert.equal(
      restored.getPage(2).node.has(PDFName.of("DnDCreatorSpellBaseContents")),
      false,
    );
  }));

test("spell lists exceeding native row capacity stay complete in their original level section", async () =>
  withFonts(async () => {
    const c = build();
    c.classes = ["Wizard"];
    c.subclass = { Wizard: "School of Abjuration" };
    c.race = "Human";
    c.subrace = "Standard Human";
    c.identity.backstory = "Short story.";
    const { spellCatalog } = await import("../src/catalog/spells");
    const spells = spellCatalog
      .filter((spell) => spell.level === 1 && spell.classes.includes("Wizard"))
      .slice(0, 18);
    c.spellSelections = spells.map((spell) => ({
      spellId: spell.id,
      source: "Wizard",
      status: "spellbook" as const,
      acquiredLevel: 1,
    }));
    let report: import("../src/pdf/layout").PDFLayoutReport | undefined;
    const output = await exportFillableSheet(
      fs.readFileSync("public/templates/5E_CharacterSheet_Fillable.pdf"),
      c,
      "en",
      (value) => (report = value),
    );
    const pdf = await PDFDocument.load(output);
    const fields = pdf.getForm();
    const names = [
      "Spells 1015",
      ...Array.from({ length: 11 }, (_, i) => `Spells ${1023 + i}`),
    ];
    const values = names
      .map((name) => fields.getTextField(name).getText() || "")
      .join("\n");
    for (const spell of spells) assert(values.includes(`${spell.name} |`));
    assert.match(fields.getTextField("Spells 1033").getText()!, / \|\| /);
    assert.equal(fields.getTextField("Spells 1046").getText() || "", "");
    assert(
      report!.warnings.some((message) =>
        message.includes("18 spells / 12 original rows"),
      ),
    );
    assert.equal(pdf.getPageCount(), 3);
    assert.deepEqual(
      serialize((await importFillableSheet(output)).character),
      serialize(c),
    );
  }));

test("fixed-page export reports oversized narrative without losing authored text or appending pages", async () =>
  withFonts(async () => {
    const c = build();
    let report: import("../src/pdf/layout").PDFLayoutReport | undefined;
    const bytes = await exportFillableSheet(
      fs.readFileSync("public/templates/5E_CharacterSheet_Fillable.pdf"),
      c,
      "en",
      (value) => (report = value),
    );
    const pdf = await PDFDocument.load(bytes);
    assert.equal(pdf.getPageCount(), 3);
    assert.equal(
      pdf.getForm().getTextField("Backstory").getText(),
      c.identity.backstory,
    );
    assert(
      report!.warnings.some((warning) => /Backstory.*printable/.test(warning)),
    );
    assert.deepEqual(
      serialize((await importFillableSheet(bytes)).character),
      serialize(c),
    );
  }));

test("edits to empty weapon rows cannot freeze a spell's automatic attack", async () =>
  withFonts(async () => {
    const c = build();
    c.classes = ["Wizard"];
    c.subclass = { Wizard: "School of Abjuration" };
    c.race = "Human";
    c.subrace = "Standard Human";
    c.equipment = [];
    c.equipmentItems = [];
    c.identity.backstory = "Short story.";
    c.spellSelections = [
      {
        spellId: "fire-bolt",
        source: "Wizard",
        status: "known",
        acquiredLevel: 1,
      },
    ];
    const bytes = await exportFillableSheet(
      fs.readFileSync("public/templates/5E_CharacterSheet_Fillable.pdf"),
      c,
    );
    const doc = await PDFDocument.load(bytes);
    assert.equal(doc.getForm().getTextField("Wpn Name 2").getText() || "", "");
    doc.getForm().getTextField("Wpn Name 2").setText("Player weapon note");
    const imported = await importFillableSheet(
      await doc.save({ updateFieldAppearances: false }),
    );
    assert.equal(
      imported.conflicts.find((conflict) => conflict.field === "Wpn Name 2")
        ?.attackId,
      "",
    );
    const accepted = resolvePDFImport(imported, ["Wpn Name 2"]);
    assert.equal(accepted.attacks.length, 0);
    assert.equal(
      accepted.importedRawFields["Wpn Name 2"],
      "Player weapon note",
    );
    const before = derive(accepted).attacks.find((attack) =>
      attack.id.startsWith("auto-spell-"),
    )!;
    accepted.baseAbilities.Intelligence += 2;
    assert.notEqual(
      derive(accepted).attacks.find((attack) => attack.id === before.id)!
        .calculatedBonus,
      before.calculatedBonus,
    );
  }));

test("multiline previews reserve the real font leading, descenders and continuation marker", async () =>
  withFonts(async () => {
    const { embedCharacterFont, fitFormText, addContinuationPages } =
      await import("../src/pdf/layout");
    const { layoutMultilineText, PDFName } = await import("pdf-lib");
    const pdf = await PDFDocument.create();
    const page = pdf.addPage();
    const font = await embedCharacterFont(pdf);
    const field = pdf.getForm().createTextField("narrative");
    field.enableMultiline();
    field.addToPage(page, {
      x: 30,
      y: 30,
      width: 180,
      height: 80,
      borderWidth: 1,
    });
    const sections: Parameters<typeof addContinuationPages>[2] = [];
    fitFormText(
      field,
      "Čarobna priča s đavlom i obitelji. ".repeat(80),
      font,
      "Narrative",
      sections,
    );
    assert.equal(sections.length, 1);
    addContinuationPages(pdf, font, sections, "Štef", "en");
    pdf.getForm().updateFieldAppearances(font);
    const widget = field.acroField.getWidgets()[0];
    const rect = widget.getRectangle();
    const inset = (widget.getBorderStyle()?.getWidth() || 0) + 1;
    const bounds = {
      x: 0,
      y: 0,
      width: rect.width - inset * 2,
      height: rect.height - inset * 2,
    };
    const lines = layoutMultilineText(field.getText()!, {
      font,
      fontSize: 9,
      alignment: field.getAlignment(),
      bounds,
    }).lines;
    const descent =
      font.heightAtSize(9) - font.heightAtSize(9, { descender: false });
    assert.match(lines.at(-1)!.text, /Pg\. 2/);
    assert(
      lines.every((line) => line.y >= descent && line.width <= bounds.width),
    );
    assert.match(widget.dict.get(PDFName.of("DA"))!.toString(), /9 Tf/);
  }));

test("readable player fields group training and inventory and keep full mechanics in the payload", async () =>
  withFonts(async () => {
    const c = build();
    c.classes = ["Wizard"];
    c.subclass = { Wizard: "School of Abjuration" };
    c.race = "Tiefling";
    c.subrace = "Tiefling";
    c.level = 8;
    c.background = "Sage";
    c.spellSelections = [
      {
        spellId: "acid-splash",
        source: "Wizard",
        status: "known",
        acquiredLevel: 1,
      },
      {
        spellId: "poison-spray",
        source: "Wizard",
        status: "known",
        acquiredLevel: 1,
      },
      {
        spellId: "witch-bolt",
        source: "Wizard",
        status: "spellbook",
        acquiredLevel: 1,
      },
    ];
    const d = derive(c);
    const acid = d.resolvedSpells.find((s) => s.spellId === "acid-splash")!;
    const poison = d.resolvedSpells.find((s) => s.spellId === "poison-spray")!;
    const rebuke = d.resolvedSpells.find(
      (s) => s.spellId === "hellish-rebuke",
    )!;
    assert.equal(acid.attack?.damage, "2d6 acid");
    assert.equal(poison.attack?.damage, "2d12 poison");
    assert.equal(acid.attack?.range, "60 feet");
    assert.equal(rebuke.attack?.damage, "3d10 fire");
    assert.equal(
      d.resolvedSpells.find((s) => s.spellId === "witch-bolt")?.attack?.damage,
      "1d12 lightning",
    );
    assert(!d.attacks.some((a) => a.name.startsWith("Witch Bolt")));
    const bytes = await exportFillableSheet(
      fs.readFileSync("public/templates/5E_CharacterSheet_Fillable.pdf"),
      c,
    );
    const pdf = await PDFDocument.load(bytes);
    const f = pdf.getForm();
    const prof = f.getTextField("ProficienciesLang").getText()!;
    assert.match(prof, /WEAPONS\n• /);
    assert.match(prof, /LANGUAGES\n• /);
    assert.doesNotMatch(prof, /character level|Starting class|Save:|Skill:/);
    const features = f.getTextField("Features and Traits").getText()!;
    assert.doesNotMatch(features, /• Spellcasting:/);
    assert.match(features, /• Arcane Recovery:/);
    assert.doesNotMatch(
      features,
      /character level|Source:|grants this feature at/,
    );
    assert.match(f.getTextField("Equipment").getText()!, /• /);
    assert.doesNotMatch(
      f.getTextField("Equipment").getText()!,
      /Player choice|character level/,
    );
    const restored = await importFillableSheet(bytes);
    assert.deepEqual(serialize(restored.character), serialize(c));
    assert.equal(restored.conflicts.length, 0);
    c.level = 11;
    assert.equal(
      derive(c).resolvedSpells.find((s) => s.spellId === "poison-spray")?.attack
        ?.damage,
      "3d12 poison",
    );
  }));

test("short overflow sections share a reference page and bullet previews remain complete", async () =>
  withFonts(async () => {
    const { embedCharacterFont, fitSummaryText, addContinuationPages } =
      await import("../src/pdf/layout");
    const pdf = await PDFDocument.create();
    const page = pdf.addPage();
    const font = await embedCharacterFont(pdf);
    const field = pdf.getForm().createTextField("summary");
    field.enableMultiline();
    field.addToPage(page, {
      x: 30,
      y: 30,
      width: 180,
      height: 90,
      borderWidth: 1,
    });
    const bullets = [
      "HEADING",
      "• First complete item.",
      "• Second complete item.",
      "• Third item with a very long description. ".repeat(20),
    ].join("\n");
    const sections: Parameters<typeof addContinuationPages>[2] = [];
    fitSummaryText(field, bullets, bullets, font, "Inventory", sections);
    sections.push({ title: "Goal", text: "Find my cat." });
    addContinuationPages(pdf, font, sections, "Štef", "en");
    assert.equal(pdf.getPageCount(), 2);
    assert.match(field.getText()!, /First complete item\./);
    assert.doesNotMatch(field.getText()!, /Third item/);
    assert.match(field.getText()!, /Pg\. 2/);
  }));

test("feature boxes continue with complete entries before appending any remaining text", async () =>
  withFonts(async () => {
    const { embedCharacterFont, fitAcrossFormFields, addContinuationPages } =
      await import("../src/pdf/layout");
    const pdf = await PDFDocument.create();
    const p1 = pdf.addPage();
    const p2 = pdf.addPage();
    const font = await embedCharacterFont(pdf);
    const first = pdf.getForm().createTextField("first");
    first.enableMultiline();
    first.addToPage(p1, { x: 30, y: 30, width: 200, height: 65 });
    const second = pdf.getForm().createTextField("second");
    second.enableMultiline();
    second.addToPage(p2, { x: 30, y: 30, width: 250, height: 230 });
    const text =
      "CLASS\n• First ability: Use one action to help an ally.\n\n• Second ability: Use a reaction to protect an ally.\n\nRACE\n• Third ability: See in the dark.";
    const sections: Parameters<typeof addContinuationPages>[2] = [];
    fitAcrossFormFields(
      pdf,
      [first, second],
      text,
      font,
      "Features",
      sections,
      "en",
      true,
    );
    assert.match(first.getText()!, /First ability/);
    assert.match(first.getText()!, /Pg\. 2/);
    assert.doesNotMatch(second.getText()!, /First ability/);
    assert.match(second.getText()!, /Second ability/);
    assert.match(second.getText()!, /Third ability/);
    assert.equal(sections.length, 0);
  }));

test("spell reference blocks repeat their title only on a real split and link the index to their first page", async () =>
  withFonts(async () => {
    const { embedCharacterFont, addContinuationPages } =
      await import("../src/pdf/layout");
    const { PDFPage } = await import("pdf-lib");
    const pdf = await PDFDocument.create();
    const original = pdf.addPage();
    const font = await embedCharacterFont(pdf);
    const field = pdf.getForm().createTextField("spell");
    field.addToPage(original, { x: 30, y: 30, width: 150, height: 14 });
    const records: {
      page: number;
      text: string;
      y: number;
      width: number;
      x: number;
    }[] = [];
    const native = PDFPage.prototype.drawText;
    PDFPage.prototype.drawText = function (text, options) {
      records.push({
        page: pdf.getPages().indexOf(this),
        text,
        y: options?.y || 0,
        x: options?.x || 0,
        width: font.widthOfTextAtSize(text, options?.size || 10),
      });
      return native.call(this, text, options);
    };
    try {
      addContinuationPages(
        pdf,
        font,
        [
          {
            title: "Spell reference - Wizard",
            text: "",
            pageBreakBefore: true,
            entries: [
              {
                title: "Short spell",
                subtitle: "Cantrip · known",
                metadata: ["Range: 60 feet", "Damage: 2d10 fire"],
                text: "Choose a visible target.",
                indexFields: [{ field, label: "Short spell" }],
              },
              {
                title: "Very long spell",
                subtitle: "Level 1 · spellbook",
                metadata: ["Casting time: 1 action", "Range: 120 feet"],
                text: "Keep every word of this unusually long explanation together with the right spell heading. ".repeat(
                  110,
                ),
              },
            ],
          },
        ],
        "Štef",
        "en",
      );
    } finally {
      PDFPage.prototype.drawText = native;
    }
    assert.match(field.getText()!, /^Short spell p\. 2$/);
    assert.equal(records.filter((r) => r.text === "Short spell").length, 1);
    assert.ok(
      records.filter((r) => r.text.includes("Very long spell")).length > 1,
    );
    for (const r of records) {
      assert.ok(r.y >= 23, `Low text: ${r.text}`);
      assert.ok(r.x + r.width <= 572, `Wide text: ${r.text}`);
    }
  }));
