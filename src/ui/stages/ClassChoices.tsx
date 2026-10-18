/** @jsxImportSource ../../i18n */
import { backgrounds } from "../../catalog/backgrounds";
import {
  classProgression,
  classLevelResources,
  getChoiceOptionDetail,
  getSubclassChoicePlans,
  getSubclassFeatureDetail,
  subclassCatalog,
  subclassFeatureLevels,
} from "../../catalog/classes";
import { races } from "../../catalog/races";
import {
  abilityModifier,
  derive,
  selectedClass,
  spellChoiceSources,
} from "../../engine/character";
import { Character, FeatureEntry } from "../../engine/types";
import { getLocale } from "../../i18n/engine";
import {
  SkillReplacementPicker,
  SpellPicker,
} from "../components/CreationControls";
import { OptionEffects } from "../components/OptionEffects";
import {
  AdvancementEditor,
  ChoiceCard,
  ExpertisePicker,
  Field,
  SectionTitle,
} from "../components/Shared";
export function StageClassChoices({
  c,
  update,
  d,
}: {
  c: Character;
  update: (p: Partial<Character>) => void;
  d: ReturnType<typeof derive>;
}) {
  const choices = c.classes
    .map((name) => ({
      name,
      klass: selectedClass(name),
      level: d.classLevels[name] || 0,
    }))
    .filter((x) => x.klass);
  const addFeature = () => {
    const first = d.initialClass;
    update({
      featureEntries: [
        ...c.featureEntries,
        {
          id: crypto.randomUUID(),
          name: "",
          sourceType: "Class",
          sourceName: first,
          className: first,
          classLevel: 1,
          characterLevel: c.classMode === "single" ? 1 : null,
          description: "",
          uses: "",
        },
      ],
    });
  };
  const editFeature = (id: string, patch: Partial<FeatureEntry>) =>
    update({
      featureEntries: c.featureEntries.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    });
  const classAcquisitionLevel = (
    className: string,
    classLevel: number | null,
  ) => {
    if (classLevel === null) return null;
    if (c.classMode === "single")
      return classLevel <= c.level ? classLevel : null;
    let count = 0;
    for (let n = 1; n <= c.level; n++) {
      if (c.levelPath[n] === className && ++count === classLevel) return n;
    }
    return null;
  };
  const branchSelectionKey = (
    className: string,
    classLevel: number,
    id: string,
  ) => `${className}:${classLevel}:${id}`;
  const toggleBranchChoice = (key: string, option: string, limit: number) => {
    const existing = c.subclassChoices?.[key] || [];
    const nextValues = existing.includes(option)
      ? existing.filter((value) => value !== option)
      : existing.length < limit
        ? [...existing, option]
        : existing;
    update({
      subclassChoices: { ...(c.subclassChoices || {}), [key]: nextValues },
    });
  };
  const setSubclass = (className: string, subclassName: string) => {
    if (c.subclass[className] === subclassName) return;
    const applicable = getSubclassChoicePlans(
      className,
      subclassName,
      d.classLevels[className] || 0,
      c.subclassChoices,
    );
    const previous = { ...c.subclassChoices };
    for (const key of Object.keys(previous))
      if (key.startsWith(`${className}:`)) {
        const plan = applicable.find(
          (plan) => key === `${className}:${plan.unlockLevel}:${plan.key}`,
        );
        if (!plan) delete previous[key];
        else
          previous[key] = previous[key]
            .filter((option) =>
              plan.allowCustom
                ? Boolean(option.trim())
                : plan.options.includes(option),
            )
            .slice(0, plan.choose);
      }
    update({
      subclass: { ...c.subclass, [className]: subclassName },
      subclassChoices: previous,
    });
  };
  return (
    <div className="stage-body">
      <SkillReplacementPicker c={c} update={update} stage={5} />
      <SectionTitle
        title="Subclass and class choices"
        note="A subclass specializes your class. Some choices unlock only after a specific class level; character level alone does not unlock them."
      />
      {choices.map(({ name, klass, level }) => {
        if (!klass) return null;
        const unlocked = level >= classProgression[name].subclassAt;
        const selectedSubclass = c.subclass[name] || "";
        const branchPlans = getSubclassChoicePlans(
          name,
          selectedSubclass,
          level,
          c.subclassChoices,
        );
        return (
          <div className="class-choice-block" key={name}>
            <div className="class-choice-header">
              <div>
                <span className="summary-label">
                  {name.toUpperCase()} LEVEL {level}
                </span>
                <h3>
                  {unlocked
                    ? `Choose your ${name} subclass`
                    : `Subclass choice unlocks at ${classProgression[name].subclassAt}`}
                </h3>
              </div>
              <span
                className={`unlock-chip ${unlocked ? "unlocked" : "locked"}`}
              >
                {unlocked ? "AVAILABLE" : "NOT YET UNLOCKED"}
              </span>
            </div>
            <p>
              {unlocked
                ? "Each path changes later features and play style. Read the descriptions, then choose the direction that fits your character."
                : `You are currently below the class's subclass level. This selection is not applicable yet.`}
            </p>
            <div className="choice-grid subclass-grid">
              {klass.subclasses.map((sub) => (
                <ChoiceCard
                  key={sub}
                  selected={c.subclass[name] === sub}
                  title={sub}
                  meta={
                    unlocked
                      ? `LEVEL ${classProgression[name].subclassAt}+`
                      : `UNLOCKS AT ${classProgression[name].subclassAt}`
                  }
                  disabled={!unlocked}
                  onClick={() => setSubclass(name, sub)}
                >
                  {subclassDescription(sub)}
                  <span className="choice-subline">
                    <b>Feature levels:</b>{" "}
                    {Object.entries(subclassFeatureLevels[sub] || {})
                      .map(([n, features]) => `${n}: ${features.join(", ")}`)
                      .join(" · ") || "Class table feature"}
                  </span>
                  <span className="choice-subline">
                    <b>Source:</b>{" "}
                    {subclassCatalog[sub]?.source || "2014 PHB, Chapter 3"}
                  </span>
                </ChoiceCard>
              ))}
            </div>
            {branchPlans.map((plan) => {
              const key = branchSelectionKey(name, plan.unlockLevel, plan.key);
              const selected = c.subclassChoices?.[key] || [];
              const grouped =
                plan.key.startsWith("maneuvers-") ||
                plan.key.startsWith("metamagic-") ||
                plan.key.startsWith("elemental-disciplines-") ||
                plan.key.startsWith("invocations-") ||
                plan.key.startsWith("favored-enemy-") ||
                plan.key.startsWith("favored-humanoids-") ||
                plan.key.startsWith("favored-terrain-") ||
                plan.key.startsWith("fighting-style-");
              const usedElsewhere = grouped
                ? Object.entries(c.subclassChoices || {})
                    .filter(
                      ([otherKey]) =>
                        (plan.key.startsWith("fighting-style-")
                          ? otherKey.includes(":fighting-style-")
                          : otherKey.startsWith(`${name}:`)) &&
                        Number(otherKey.split(":")[1]) <=
                          (d.classLevels[otherKey.split(":")[0]] || 0) &&
                        otherKey !== key,
                    )
                    .flatMap(([, values]) => values)
                : [];
              if (plan.allowCustom) {
                const listId = `humanoid-races-${name}-${plan.unlockLevel}`;
                return (
                  <div className="detail-panel subclass-branch" key={key}>
                    <SectionTitle
                      title={`${plan.title} · choose ${plan.choose}`}
                      note={`${plan.className} level ${plan.unlockLevel} · ${plan.help}`}
                    />
                    <div className="flex-choice">
                      {Array.from({ length: plan.choose }, (_, index) => (
                        <Field key={index} label={`Humanoid race ${index + 1}`}>
                          <input
                            value={selected[index] || ""}
                            list={listId}
                            placeholder="Enter a specific humanoid race"
                            aria-invalid={Boolean(
                              selected[index] &&
                              [
                                ...selected.filter(
                                  (_, otherIndex) => otherIndex !== index,
                                ),
                                ...usedElsewhere,
                              ].some(
                                (value) =>
                                  value.trim().toLowerCase() ===
                                  selected[index].trim().toLowerCase(),
                              ),
                            )}
                            onChange={(event) => {
                              const values = Array.from(
                                { length: plan.choose },
                                (_, valueIndex) => selected[valueIndex] || "",
                              );
                              values[index] = event.target.value;
                              update({
                                subclassChoices: {
                                  ...c.subclassChoices,
                                  [key]: values,
                                },
                              });
                            }}
                          />
                        </Field>
                      ))}
                    </div>
                    <datalist id={listId}>
                      {plan.options.map((option) => (
                        <option value={option} key={option} />
                      ))}
                    </datalist>
                  </div>
                );
              }
              return (
                <div className="detail-panel subclass-branch" key={key}>
                  <SectionTitle
                    title={`${plan.title} · choose ${plan.choose}`}
                    note={`${plan.className} level ${plan.unlockLevel} · ${plan.help}`}
                  />
                  <div className="choice-grid">
                    {plan.options.map((option) => {
                      const detail = getChoiceOptionDetail(plan, option);
                      const reason =
                        detail.minimumLevel && level < detail.minimumLevel
                          ? `Requires ${name} level ${detail.minimumLevel}`
                          : detail.pactBoon &&
                              !c.subclassChoices[
                                "Warlock:3:pact-boon"
                              ]?.includes(detail.pactBoon)
                            ? `Requires ${detail.pactBoon}`
                            : detail.spellKnown &&
                                !d.resolvedSpells.some(
                                  (spell) =>
                                    spell.name === detail.spellKnown &&
                                    spell.source === "Warlock",
                                )
                              ? `Requires knowing ${detail.spellKnown}; select it below`
                              : usedElsewhere.includes(option) &&
                                  option !== "Humanoids (choose two races)"
                                ? "Already selected at another level"
                                : selected.length >= plan.choose
                                  ? "Selection limit reached"
                                  : "";
                      const descriptionId = `choice-${key}-${option}`.replace(
                        /[^a-zA-Z0-9-]/g,
                        "-",
                      );
                      return (
                        <label
                          className={`skill-option ${selected.includes(option) ? "skill-selected" : ""}`}
                          key={option}
                        >
                          <input
                            type="checkbox"
                            checked={selected.includes(option)}
                            aria-describedby={descriptionId}
                            disabled={
                              !selected.includes(option) && Boolean(reason)
                            }
                            onChange={() =>
                              toggleBranchChoice(key, option, plan.choose)
                            }
                          />
                          <span>
                            <strong>{option}</strong>
                            <small id={descriptionId}>
                              {getLocale() === "hr" && detail.descriptionHr
                                ? detail.descriptionHr
                                : detail.description}
                            </small>
                            {detail.reason && <small>{detail.reason}</small>}
                            {!selected.includes(option) && reason && (
                              <small>{reason}</small>
                            )}
                          </span>
                          <OptionEffects />
                        </label>
                      );
                    })}
                  </div>
                  <p className="soft-note">
                    Selected {selected.length} / {plan.choose}. Your choice is
                    recorded with its class level and appears in the character's
                    build data.
                  </p>
                </div>
              );
            })}
          </div>
        );
      })}
      {(spellChoiceSources(c).length > 0 || c.spellSelections.length > 0) && (
        <details className="detail-panel">
          <summary>Spell choices needed by class features</summary>
          <SpellPicker c={c} d={d} update={update} />
        </details>
      )}
      <ExpertisePicker c={c} update={update} />
      <AdvancementEditor c={c} update={update} />
      <div className="detail-panel">
        <div className="section-title">
          <div>
            <h3>FEATURES & TRAITS / LEVEL-SOURCED</h3>
            <p>
              Race, class, subclass, background, and named feat entries are
              generated automatically from your build. Add a separate manual
              record only for a table-specific option, imported wording, or a
              feature this app does not know. Character levels follow the
              multiclass path when it is set.
            </p>
          </div>
          <button className="quiet-button" onClick={addFeature}>
            ADD FEATURE
          </button>
        </div>
        {!d.featureEntries.length && !c.featureEntries.length && (
          <p className="not-applicable">
            No generated or manual features yet. Choose a race, class,
            background, or feat to populate this list automatically.
          </p>
        )}
        <div className="generated-feature-list">
          {d.featureEntries.map((item) => (
            <details key={item.id}>
              <summary>
                <strong>{item.name}</strong>
                <span>
                  {item.sourceType}: {item.sourceName}
                  {item.classLevel ? ` · class level ${item.classLevel}` : ""}
                  {item.characterLevel
                    ? ` · character level ${item.characterLevel}`
                    : ""}
                </span>
              </summary>
              <p>{item.description}</p>
              {item.uses && <small>{item.uses}</small>}
              {item.sourceReference && (
                <small>Source: {item.sourceReference}</small>
              )}
            </details>
          ))}
        </div>
        {c.featureEntries.map((item) => (
          <div className="structured-row feature-edit-row" key={item.id}>
            <Field label="Feature name">
              <input
                value={item.name}
                onChange={(e) => editFeature(item.id, { name: e.target.value })}
                placeholder="Feature or trait"
              />
            </Field>
            <Field label="Source type">
              <select
                value={item.sourceType}
                onChange={(e) => {
                  const sourceType = e.target
                    .value as FeatureEntry["sourceType"];
                  editFeature(item.id, {
                    sourceType,
                    sourceName:
                      sourceType === "Race"
                        ? c.race
                        : ["Class", "Subclass"].includes(sourceType)
                          ? item.className || d.initialClass
                          : sourceType,
                  });
                }}
              >
                {[
                  "Race",
                  "Class",
                  "Subclass",
                  "Background",
                  "Feat",
                  "Other",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="Source / class">
              <select
                value={item.className || item.sourceName}
                onChange={(e) => {
                  const className = e.target.value;
                  editFeature(item.id, {
                    className,
                    sourceName: ["Class", "Subclass"].includes(item.sourceType)
                      ? className
                      : item.sourceName,
                  });
                }}
              >
                {item.sourceType === "Race" ? (
                  races.map((x) => <option key={x.name}>{x.name}</option>)
                ) : item.sourceType === "Background" ? (
                  backgrounds.map((x) => <option key={x.name}>{x.name}</option>)
                ) : item.sourceType === "Class" ||
                  item.sourceType === "Subclass" ? (
                  c.classes.map((x) => <option key={x}>{x}</option>)
                ) : (
                  <option>{item.sourceName || "Other"}</option>
                )}
              </select>
            </Field>
            <Field label="Class level">
              <select
                value={item.classLevel ?? ""}
                onChange={(e) => {
                  const classLevel = e.target.value
                    ? Number(e.target.value)
                    : null;
                  editFeature(item.id, {
                    classLevel,
                    characterLevel: classAcquisitionLevel(
                      item.className,
                      classLevel,
                    ),
                  });
                }}
              >
                <option value="">Not class-based</option>
                {Array.from(
                  { length: Math.max(1, d.classLevels[item.className] || 1) },
                  (_, i) => i + 1,
                ).map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </Field>
            <Field label="Character level">
              <select
                value={item.characterLevel ?? ""}
                onChange={(e) =>
                  editFeature(item.id, {
                    characterLevel: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
              >
                <option value="">Unknown / path not set</option>
                {Array.from({ length: c.level }, (_, i) => i + 1).map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </Field>
            <Field label="Uses / recharge">
              <input
                value={item.uses}
                onChange={(e) => editFeature(item.id, { uses: e.target.value })}
                placeholder="Optional"
              />
            </Field>
            <Field label="Rules summary" className="wide-field">
              <textarea
                rows={2}
                value={item.description}
                onChange={(e) =>
                  editFeature(item.id, { description: e.target.value })
                }
                placeholder="Short reminder in your own words"
              />
            </Field>
            <button
              className="remove-row"
              aria-label={`Remove ${item.name || "feature"}`}
              onClick={() =>
                update({
                  featureEntries: c.featureEntries.filter(
                    (x) => x.id !== item.id,
                  ),
                })
              }
            >
              REMOVE
            </button>
          </div>
        ))}
      </div>
      <div className="timeline">
        <SectionTitle
          title="Complete class level tree"
          note="Every row shows that class level's features and resource scaling. Character level controls the proficiency bonus; this tree uses class level."
        />
        {choices.map(({ name, klass, level }) => {
          if (!klass) return null;
          const tree = classProgression[name];
          const subclass = c.subclass[name] || "";
          const subclassRows = subclassFeatureLevels[subclass] || {};
          return (
            <div key={name} className="mini-timeline">
              <h4>
                {name} / {level} of 20 class levels
                {subclass ? ` · ${subclass}` : ""}
              </h4>
              {tree.levels.map((row) => {
                const subFeatures = subclassRows[row.level] || [];
                const present = row.level <= level;
                const labels = row.features
                  .map((item) => item.name)
                  .filter(
                    (feature) =>
                      !(
                        subclass &&
                        [
                          "Path Feature",
                          "Bard College Feature",
                          "Divine Domain Feature",
                          "Druid Circle Feature",
                          "Martial Archetype Feature",
                          "Monastic Tradition Feature",
                          "Sacred Oath Feature",
                          "Ranger Archetype Feature",
                          "Roguish Archetype Feature",
                          "Sorcerous Origin Feature",
                          "Otherworldly Patron Feature",
                          "Arcane Tradition Feature",
                        ].includes(feature)
                      ),
                  );
                const allLabels = [...labels, ...subFeatures];
                return (
                  <div
                    className={`timeline-row ${present ? "past" : "future"}`}
                    key={row.level}
                  >
                    <span className="timeline-node">
                      {String(row.level).padStart(2, "0")}
                    </span>
                    <div>
                      <strong>
                        Class level {row.level}
                        {row.asi ? " · ability increase or optional feat" : ""}
                        {row.level === tree.subclassAt
                          ? " · subclass choice"
                          : ""}
                      </strong>
                      <p>
                        {allLabels.length
                          ? allLabels.join(" · ")
                          : "No new named feature at this level."}
                      </p>
                      <p className="timeline-resource">
                        {levelResourceSummary(
                          name,
                          row.level,
                          row,
                          d,
                          subclass,
                        )}
                      </p>
                      {allLabels.length > 0 && (
                        <details>
                          <summary>Beginner feature notes</summary>
                          <ul>
                            {row.features
                              .filter((item) => labels.includes(item.name))
                              .map((item) => (
                                <li key={item.name}>
                                  <strong>{item.name}:</strong>{" "}
                                  {item.description}
                                </li>
                              ))}
                            {subFeatures.map((feature) => {
                              const detail = {
                                description: getSubclassFeatureDetail(
                                  subclass,
                                  feature,
                                ),
                                sourceReference:
                                  subclassCatalog[subclass]?.source,
                              };
                              return (
                                <li key={`${feature}-${row.level}`}>
                                  <strong>{feature}:</strong>{" "}
                                  {detail?.description ||
                                    "Subclass description unresolved; source review required."}
                                  {detail?.sourceReference && (
                                    <small>
                                      {" "}
                                      Source: {detail.sourceReference}.
                                    </small>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </details>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function subclassDescription(name: string) {
  return (
    subclassCatalog[name]?.overview ||
    "Subclass description unresolved; consult the PHB entry before confirming."
  );
}
export function levelResourceSummary(
  className: string,
  level: number,
  row: (typeof classProgression.Barbarian.levels)[number],
  d: ReturnType<typeof derive>,
  subclass = "",
) {
  row = classLevelResources(className, row, subclass);
  if (className === "Barbarian")
    return `${row.rageUses === "Unlimited" ? "Rages: unlimited" : `Rages: ${row.rageUses ?? 0} per long rest`} · Rage damage +${row.rageDamage ?? 0}`;
  if (className === "Fighter")
    return `Attacks with the Attack action: ${row.extraAttacks} · Second Wind: one use per short or long rest${row.actionSurgeUses ? ` · Action Surge ${row.actionSurgeUses} use(s)` : ""}${row.indomitableUses ? ` · Indomitable ${row.indomitableUses} use(s)` : ""}`;
  if (className === "Rogue")
    return `Sneak Attack: ${row.sneakAttackDice}d6 once per turn`;
  if (className === "Monk")
    return `Martial Arts die: ${row.martialArtsDie} · Ki: ${row.kiPoints || "not yet gained"}${row.unarmoredMovement ? ` · unarmored speed +${row.unarmoredMovement} ft.` : ""}`;
  if (className === "Bard") {
    const slots = row.spellSlots?.length
      ? ` · spell slots ${row.spellSlots.join(" / ")}`
      : "";
    return `Bardic Inspiration: ${row.bardicInspirationDie}, ${Math.max(1, abilityModifier(d.abilities.Charisma))} use(s) · ${row.cantripsKnown} cantrips · ${row.spellsKnown} spells known${slots}`;
  }
  if (className === "Cleric")
    return `${row.cantripsKnown} cantrips · spell slots ${row.spellSlots?.join(" / ") || "none"}${row.channelDivinityUses ? ` · Channel Divinity ${row.channelDivinityUses} use(s) per rest` : ""}${row.destroyUndeadCR && row.destroyUndeadCR !== "—" ? ` · Destroy Undead threshold CR ${row.destroyUndeadCR}` : ""}`;
  if (className === "Druid")
    return `${row.cantripsKnown} cantrips · spell slots ${row.spellSlots?.join(" / ") || "none"}${level >= 2 ? ` · Wild Shape ${level >= 20 ? "unlimited uses" : `${row.wildShapeUses} uses`}, max beast CR ${row.wildShapeCR} (${row.wildShapeLimits})` : ""}`;
  if (className === "Paladin") {
    const prepared = Math.max(
      1,
      abilityModifier(d.abilities.Charisma) + Math.floor(level / 2),
    );
    const senses = Math.max(1, 1 + abilityModifier(d.abilities.Charisma));
    return `Lay on Hands pool ${row.layOnHandsPool} HP · Divine Sense ${senses} use(s)${level >= 2 ? ` · prepare up to ${prepared} paladin spells · slots ${row.spellSlots?.join(" / ") || "none"}` : ""}${row.auraRange ? ` · aura ${row.auraRange} ft.` : ""}`;
  }
  if (className === "Ranger")
    return `${row.favoredEnemyCount} favored enemy choice(s) · ${row.favoredTerrainCount} favored terrain choice(s) · ${row.spellsKnown} ranger spells known · slots ${row.spellSlots?.join(" / ") || "none"}`;
  if (className === "Sorcerer")
    return `${row.sorceryPoints} sorcery points · ${row.cantripsKnown} cantrips · ${row.spellsKnown} spells known · slots ${row.spellSlots?.join(" / ") || "none"}`;
  if (className === "Warlock")
    return `${row.pactSlots} pact slots at ${row.pactSlotLevel} level · ${row.cantripsKnown} cantrips · ${row.spellsKnown} spells known · ${row.invocationsKnown} invocations${row.mysticArcanumLevel ? ` · ${row.mysticArcanumLevel}th-level Mystic Arcanum` : ""}`;
  if (className === "Wizard") {
    const known = 6 + Math.max(0, level - 1) * 2;
    return `${row.cantripsKnown} cantrips · ${known} level-up spellbook spells before found/copy spells · Arcane Recovery up to ${row.arcaneRecoveryLevels} spell-slot levels once per day · slots ${row.spellSlots?.join(" / ") || "none"}`;
  }
  return row.spellSlots?.length
    ? `Spell slots ${row.spellSlots.join(" / ")}`
    : "No separate spell-slot progression at this class level.";
}
