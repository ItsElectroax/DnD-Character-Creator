/** @jsxImportSource ../../i18n */
import {
  classes,
  classProgression,
  classTraining,
} from "../../catalog/classes";
import { abilities } from "../../catalog/proficiencies";
import {
  dragonbornAncestryFor,
  raceProfiles,
  races,
  raceTraitsFor,
} from "../../catalog/races";
import { derive, racialBonuses, selectedRace } from "../../engine/character";
import { Character } from "../../engine/types";
import { OptionEffects } from "../components/OptionEffects";
import { ChoiceCard, Field, SectionTitle } from "../components/Shared";
import { cardArtwork } from "../artwork";
export function StageOrigin({
  c,
  d,
  update,
}: {
  c: Character;
  d: ReturnType<typeof derive>;
  update: (p: Partial<Character>) => void;
}) {
  const race = selectedRace(c);
  const flexibleAbilities = abilities.filter(
    (ability) => c.race !== "Half-Elf" || ability !== "Charisma",
  );
  const setClass = (name: string) => {
    if (c.classMode === "single" && c.classes[0] === name) return;
    const next =
      c.classMode === "single"
        ? [name]
        : c.classes.includes(name)
          ? c.classes.filter((x) => x !== name)
          : [...c.classes, name];
    const path = { ...c.levelPath };
    Object.keys(path).forEach((key) => {
      if (!next.includes(path[Number(key)])) path[Number(key)] = "";
    });
    update({
      classes: next,
      levelPath: path,
      importedClassLevels: {},
      importedInitialClass: "",
    });
  };
  const setMode = (mode: "single" | "multi") =>
    mode === c.classMode
      ? undefined
      : update({
          classMode: mode,
          classes: mode === "single" ? c.classes.slice(0, 1) : c.classes,
          level: mode === "multi" && c.level < 2 ? 2 : c.level,
          levelPath:
            mode === "multi" && c.level < 2
              ? { 1: c.levelPath[1] || "", 2: "" }
              : c.levelPath,
          dmPermission: mode === "multi" ? c.dmPermission : false,
          importedClassLevels: {},
          importedInitialClass: "",
        });
  const setLevel = (level: number) => {
    const path = { ...c.levelPath };
    for (let n = 1; n <= level; n++) if (!(n in path)) path[n] = "";
    Object.keys(path).forEach((n) => {
      if (Number(n) > level) delete path[Number(n)];
    });
    update({
      level,
      levelPath: path,
      importedClassLevels: {},
      importedInitialClass: "",
    });
  };
  return (
    <div className="stage-body">
      <div className="selector-block">
        <SectionTitle
          title="01 / Choose a race"
          note="Your ancestry adds distinctive abilities. Select a family, then review its lineage options."
        />
        <div className="choice-grid race-grid">
          {races.map((r) => (
            <ChoiceCard
              key={r.name}
              selected={c.race === r.name}
              title={r.name}
              artwork={cardArtwork.race[r.name]}
              meta={r.bonus}
              onClick={() =>
                c.race === r.name
                  ? undefined
                  : update({
                      race: r.name,
                      subrace: "",
                      flexBonuses: [],
                      ancestry: "",
                      raceSkills: [],
                      raceFeat: "",
                      raceFeatAbility: "",
                      featOptions: {
                        ...(c.featOptions || {}),
                        "Variant Human": [],
                      },
                    })
              }
            >
              {r.summary}
              <span className="choice-subline">{r.traits}</span>
            </ChoiceCard>
          ))}
        </div>
      </div>
      {race && (
        <div className="detail-panel">
          <SectionTitle
            title={`${race.name.toUpperCase()} / LINEAGE`}
            note={race.summary}
          />
          <p className="detail-lead">{race.traits}</p>
          <div className="choice-grid subrace-grid">
            {race.subraces.map((s) => (
              <ChoiceCard
                key={s.name}
                selected={c.subrace === s.name}
                title={s.name}
                meta={s.bonus}
                onClick={() =>
                  c.subrace === s.name
                    ? undefined
                    : update({
                        subrace: s.name,
                        ancestry:
                          c.race === "Dragonborn"
                            ? dragonbornAncestryFor(s.name)
                            : c.ancestry,
                        flexBonuses: [],
                        raceSkills: [],
                        raceFeat: s.name.includes("Variant") ? c.raceFeat : "",
                        raceFeatAbility: s.name.includes("Variant")
                          ? c.raceFeatAbility
                          : "",
                      })
                }
              >
                {s.detail}
              </ChoiceCard>
            ))}
          </div>
          {(c.subrace.includes("Variant") || c.race === "Half-Elf") && (
            <div className="flex-choice">
              <Field label="Flexible +1 choice one">
                <select
                  value={c.flexBonuses[0] || ""}
                  onChange={(e) =>
                    update({
                      flexBonuses: [
                        e.target.value,
                        c.flexBonuses[1] === e.target.value
                          ? ""
                          : c.flexBonuses[1] || "",
                      ],
                    })
                  }
                >
                  <option value="">Choose an ability</option>
                  {flexibleAbilities
                    .filter((a) => a !== c.flexBonuses[1])
                    .map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                </select>
              </Field>
              <Field label="Flexible +1 choice two">
                <select
                  value={c.flexBonuses[1] || ""}
                  onChange={(e) =>
                    update({
                      flexBonuses: [c.flexBonuses[0] || "", e.target.value],
                    })
                  }
                >
                  <option value="">Choose a different ability</option>
                  {flexibleAbilities
                    .filter((a) => a !== c.flexBonuses[0])
                    .map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                </select>
              </Field>
            </div>
          )}
          {c.subrace && raceProfiles[c.race] && (
            <div className="race-rules-overview">
              <div className="race-facts">
                <div>
                  <span>SIZE</span>
                  <strong>{raceProfiles[c.race].size}</strong>
                </div>
                <div>
                  <span>WALKING SPEED</span>
                  <strong>
                    {c.subrace === "Wood Elf" ? 35 : raceProfiles[c.race].speed}{" "}
                    ft.
                  </strong>
                </div>
                <div>
                  <span>LANGUAGES</span>
                  <strong>
                    {[
                      ...raceProfiles[c.race].languages,
                      ...(c.race === "Half-Elf" ||
                      c.race === "Human" ||
                      c.subrace === "High Elf"
                        ? ["+1 choice"]
                        : []),
                    ].join(", ")}
                  </strong>
                </div>
                <div>
                  <span>ABILITY INCREASES</span>
                  <strong>
                    {Object.entries(racialBonuses(c))
                      .map(([ability, amount]) => `+${amount} ${ability}`)
                      .join(", ")}
                    {(c.subrace.includes("Variant") || c.race === "Half-Elf") &&
                    c.flexBonuses.filter(Boolean).length < 2
                      ? " · choose two different +1 abilities"
                      : ""}
                  </strong>
                </div>
              </div>
              <SectionTitle
                title="TRAITS YOU GAIN"
                note="These entries are added to Features & Traits with their race source. Choice-based details remain marked until selected."
              />
              <div className="race-trait-list">
                {raceTraitsFor(c.race, c.subrace).map((trait) => (
                  <div key={trait.name}>
                    <strong>
                      {trait.name}
                      {trait.optional ? " · OPTIONAL" : ""}
                    </strong>
                    <p>{trait.description}</p>
                  </div>
                ))}
              </div>
              <p className="soft-note">
                Your race grants only the listed senses, resistances, skills,
                languages, weapon or armor training, and other features.
                Anything not listed here is not added automatically.
              </p>
              {raceProfiles[c.race].notes.map((note) => (
                <p className="soft-note" key={note}>
                  {note}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="selector-block">
        <SectionTitle
          title="02 / Select class mode"
          note="Your class defines your adventuring training and the abilities you use most."
        />
        <div className="choice-grid mode-grid">
          <ChoiceCard
            selected={c.classMode === "single"}
            title="Single-class"
            meta="DEFAULT"
            onClick={() => setMode("single")}
          >
            Follow one class from level 1 to 20. This is the straightforward
            path for most new players.
          </ChoiceCard>
          <ChoiceCard
            selected={c.classMode === "multi"}
            title="Multiclass"
            meta="PHB OPTIONAL • DM PERMISSION"
            onClick={() => setMode("multi")}
          >
            Combine two or more classes. This trades some high-level features
            for a broader mix; it is an optional rule that needs DM approval.
          </ChoiceCard>
        </div>
        {c.classMode === "multi" && (
          <label className="check-row dm-check">
            <input
              type="checkbox"
              checked={c.dmPermission}
              onChange={(e) => update({ dmPermission: e.target.checked })}
            />
            <span>
              <strong>My DM allows optional multiclassing.</strong>
              <small>Confirm before using this character in a campaign.</small>
            </span>
            <OptionEffects />
          </label>
        )}
      </div>
      <div className="selector-block">
        <SectionTitle
          title={
            c.classMode === "single"
              ? "03 / Choose your class"
              : "03 / Build your class plan"
          }
          note={
            c.classMode === "single"
              ? "Each class card lists its hit die, starting training, skill choices, and what it does not grant."
              : "Select at least two classes, then assign one class level for each total character level."
          }
        />
        <div className="choice-grid class-grid">
          {classes.map((cl) => {
            const training = classTraining[cl.name];
            return (
              <ChoiceCard
                key={cl.name}
                selected={c.classes.includes(cl.name)}
                title={cl.name}
                artwork={cardArtwork.class[cl.name]}
                meta={`D${training.hitDie} HIT DIE • ${cl.role}`}
                onClick={() => setClass(cl.name)}
              >
                <span>
                  <b>Key abilities:</b> {cl.abilities}
                </span>
                <span>
                  <b>Saving throw proficiencies:</b> {training.saves.join(", ")}{" "}
                  when this is your starting class; multiclass entry grants no
                  saves.
                </span>
                <span>{cl.detail}</span>
                <span className="choice-subline">
                  <b>Starting armor:</b> {training.armor.join(", ") || "none"} ·{" "}
                  <b>Weapons:</b> {training.weapons.join(", ") || "none"}
                </span>
                <span className="choice-subline">
                  <b>Tools:</b> {training.tools.join(", ") || "no fixed tool"} ·{" "}
                  <b>Skills:</b> choose {training.skillCount} from{" "}
                  {training.skillChoices.join(", ") || "none"}
                </span>
                {training.casting && training.casting !== "none" ? (
                  <span className="choice-subline">
                    <b>Spellcasting:</b> {training.casting} progression
                    {training.spellAbility ? ` · ${training.spellAbility}` : ""}
                  </span>
                ) : (
                  <span className="choice-subline">
                    <b>Spellcasting:</b> none from the base class
                    {cl.name === "Fighter"
                      ? " (Eldritch Knight subclass exception)"
                      : cl.name === "Rogue"
                        ? " (Arcane Trickster subclass exception)"
                        : ""}
                  </span>
                )}
                <span className="choice-subline">
                  <b>Multiclass entry:</b>{" "}
                  {training.entryPrerequisites.join(" and ")}
                </span>
                <span className="choice-subline">
                  <b>When multiclassing into this class:</b>{" "}
                  {training.multiclassProficiencies.join(", ") ||
                    "no additional proficiencies"}
                </span>
                {training.notes.map((note) => (
                  <span className="choice-subline" key={note}>
                    {note}
                  </span>
                ))}
                <span className="choice-subline">
                  <b>
                    Subclass at class level{" "}
                    {classProgression[cl.name].subclassAt}:
                  </b>{" "}
                  {cl.subclasses.join(" · ")}
                </span>
              </ChoiceCard>
            );
          })}
        </div>
        <div className="level-control">
          <Field
            label="Starting character level"
            hint="Proficiency bonus uses total character level. Class features and subclass choices use class level."
          >
            <select
              value={c.level}
              onChange={(e) => setLevel(Number(e.target.value))}
            >
              {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  Level {n}
                  {n === 1
                    ? " — beginning adventurer"
                    : n < 5
                      ? " — early adventurer"
                      : n < 11
                        ? " — seasoned adventurer"
                        : n < 17
                          ? " — high-level adventurer"
                          : " — legendary adventurer"}
                </option>
              ))}
            </select>
          </Field>
          <div className="level-badge">
            <span>TOTAL LEVEL</span>
            <strong>{String(c.level).padStart(2, "0")}</strong>
          </div>
        </div>
        {c.classMode === "multi" && c.classes.length > 0 && (
          <div className="path-builder">
            <div className="path-heading">
              <strong>LEVEL ACQUISITION PATH</strong>
              <span>Choose which class you gain at each character level.</span>
            </div>
            {c.importedInitialClass && (
              <p className="soft-note">
                The PDF gave class totals but not their acquisition order. The
                imported split is kept until you start filling this path; no
                chronology has been guessed.
              </p>
            )}
            {Array.from({ length: c.level }, (_, i) => i + 1).map((n) => (
              <div className="path-row" key={n}>
                <span className={`path-node ${n === 1 ? "origin-node" : ""}`}>
                  {String(n).padStart(2, "0")}
                </span>
                <label>
                  <span className="sr-only">Class at character level {n}</span>
                  <select
                    value={c.levelPath[n] || ""}
                    onChange={(e) =>
                      update({
                        levelPath: { ...c.levelPath, [n]: e.target.value },
                        importedClassLevels: {},
                        importedInitialClass: "",
                      })
                    }
                  >
                    <option value="">Choose class at level {n}</option>
                    {c.classes.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
                <span className="path-summary">
                  {Object.entries(d.classLevels)
                    .map(([name, count]) => `${name} ${count}`)
                    .join(" / ") || "No levels assigned"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="selected-summary">
        <div>
          <span className="summary-label">YOUR CURRENT PLAN</span>
          <strong>
            {race
              ? `${race.name}${c.subrace ? ` / ${c.subrace}` : ""}`
              : "Race not selected"}
          </strong>
        </div>
        <div>
          <span className="summary-label">CLASS PLAN</span>
          <strong>
            {c.classes.length
              ? Object.entries(d.classLevels)
                  .map(([name, n]) => `${name} ${n}`)
                  .join(" / ") || c.classes.join(" / ")
              : "Class not selected"}
          </strong>
        </div>
        <div>
          <span className="summary-label">LEVEL</span>
          <strong>{c.level}</strong>
        </div>
        <div>
          <span className="summary-label">INITIAL CLASS</span>
          <strong>{d.initialClass || "Not selected"}</strong>
        </div>
      </div>
    </div>
  );
}
