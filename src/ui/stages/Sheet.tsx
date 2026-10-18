/** @jsxImportSource ../../i18n */
import { abilities, skills } from "../../catalog/proficiencies";
import {
  abilityModifier,
  activeEquipmentItems,
  derive,
  featureEntriesForSheet,
  formatMod,
  validateBuild,
} from "../../engine/character";
import { Character, FeatureEntry } from "../../engine/types";

export function StageSheet({
  c,
  d,
  go,
  sheetReady,
  onExportPDF,
  onLoadPDF,
}: {
  c: Character;
  d: ReturnType<typeof derive>;
  go: (n: number) => void;
  sheetReady: boolean;
  onExportPDF: () => void;
  onLoadPDF: () => void;
}) {
  const issues = validateBuild(c);
  const valid = issues.length === 0;
  const needsInput = issues.some((issue) => issue.severity === "error");
  const displayName = c.identity.name || "Unnamed Character";
  const allFeatures = featureEntriesForSheet(c);
  const sheetItems = activeEquipmentItems(c);
  const legacyEquipment =
    c.equipmentMethod === "wealth"
      ? []
      : c.equipment.filter(
          (name) => !/^(start:|pick:|background:|background-gp:)/.test(name),
        );
  const groupKeys = [
    ...new Set(
      allFeatures.map(
        (item) =>
          `${item.sourceType}|${item.sourceName || item.className || "Unsorted"}`,
      ),
    ),
  ];
  const groupRank: Record<FeatureEntry["sourceType"], number> = {
    Race: 0,
    Class: 1,
    Subclass: 2,
    Background: 3,
    Feat: 4,
    Other: 5,
  };
  const featureGroups = groupKeys
    .map((key) => {
      const [sourceType, sourceName] = key.split("|") as [
        FeatureEntry["sourceType"],
        string,
      ];
      const entries = allFeatures
        .filter(
          (item) =>
            item.sourceType === sourceType &&
            (item.sourceName || item.className || "Unsorted") === sourceName,
        )
        .sort(
          (a, b) =>
            (a.classLevel ?? 99) - (b.classLevel ?? 99) ||
            (a.name || "").localeCompare(b.name || ""),
        );
      return { sourceType, sourceName, entries };
    })
    .sort((a, b) => groupRank[a.sourceType] - groupRank[b.sourceType]);
  return (
    <div className="stage-body sheet-body">
      <div className={`validation-banner ${valid ? "validated" : "draft"}`}>
        <div className="validation-symbol">{valid ? "i" : "!"}</div>
        <div>
          <strong>
            {valid
              ? "CHARACTER VALIDATED — 2014 PHB"
              : needsInput
                ? "DRAFT — NEEDS INPUT"
                : "DRAFT — NEEDS SOURCE REVIEW"}
          </strong>
          <p>
            Final sheet assembled from confirmed fields. See review stage for
            unresolved coverage; this application does not claim complete rules
            certification.
          </p>
        </div>
        <button className="text-button" onClick={() => go(7)}>
          Open audit
        </button>
      </div>
      <div className="pdf-bridge">
        <div>
          <strong>2014 FILLABLE CHARACTER SHEET</strong>
          <p>
            The standard fillable sheet is included. Character data is mapped
            automatically; a custom template is optional.
          </p>
        </div>
        <div>
          <button
            className="quiet-button"
            onClick={onExportPDF}
            disabled={!sheetReady}
          >
            EXPORT FILLED PDF
          </button>
          <button className="quiet-button" onClick={onLoadPDF}>
            Use custom template
          </button>
        </div>
      </div>
      <section className="sheet-identity">
        <div className="sheet-monogram">
          {displayName
            .split(/\s+/)
            .map((x) => x[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()}
        </div>
        <div className="sheet-ident-main">
          <span className="eyebrow">CHARACTER DOSSIER / 2014 PHB</span>
          <h3 data-player-text>{displayName}</h3>
          <p>
            {Object.entries(d.classLevels)
              .map(([name, n]) => `${name} ${n}`)
              .join(" / ") || "Class unset"}{" "}
            · Level {c.level} · {c.race || "Race unset"} {c.subrace}
          </p>
        </div>
        <div className="sheet-id-meta">
          <span>
            BACKGROUND<strong>{c.background || "Unset"}</strong>
          </span>
          <span>
            ALIGNMENT<strong>{c.identity.alignment || "Unset"}</strong>
          </span>
          <span>
            PROFICIENCY<strong>+{d.proficiency}</strong>
          </span>
        </div>
      </section>
      <div className="sheet-grid">
        <section className="sheet-card combat-card">
          <div className="sheet-card-head">
            <span>COMBAT PROFILE</span>
            <small>Derived from current class levels and ability scores</small>
          </div>
          <div className="combat-stats">
            <div>
              <span>ARMOR CLASS</span>
              <strong>{d.ac}</strong>
              <small>{d.acFormula}</small>
            </div>
            <div>
              <span>HIT POINTS</span>
              <strong>{d.hp}</strong>
              <small>{d.calculations.hp.formula}</small>
            </div>
            <div>
              <span>INITIATIVE</span>
              <strong>{formatMod(d.initiative)}</strong>
              <small>{d.calculations.initiative.formula}</small>
            </div>
            <div>
              <span>SPEED</span>
              <strong>{d.speed} ft.</strong>
              <small>{d.speedNotes || "Ancestry walking speed"}</small>
            </div>
            <div>
              <span>HIT DICE</span>
              <strong>{d.hitDice}</strong>
              <small>Remaining: unset</small>
            </div>
            <div>
              <span>PASSIVE PERCEPTION</span>
              <strong>{d.passivePerception}</strong>
              <small>{d.calculations.passivePerception.formula}</small>
            </div>
          </div>
          <div className="attack-note">
            <b>Attack action</b>
            <span>
              {d.attacksPerAction} attack{d.attacksPerAction === 1 ? "" : "s"}{" "}
              per Attack action
              {d.sneakAttackDice
                ? ` · Sneak Attack ${d.sneakAttackDice}d6 once per turn`
                : ""}
              {d.martialArtsDie ? ` · Martial Arts ${d.martialArtsDie}` : ""}
            </span>
          </div>
        </section>
        <section className="sheet-card">
          <div className="sheet-card-head">
            <span>ABILITY SCORES</span>
            <small>Ancestry + class-level choices</small>
          </div>
          <div className="ability-score-grid">
            {abilities.map((a) => (
              <div className="ability-score" key={a}>
                <span>{a.slice(0, 3).toUpperCase()}</span>
                <strong>{d.abilities[a]}</strong>
                <small>{formatMod(abilityModifier(d.abilities[a]))}</small>
              </div>
            ))}
          </div>
          <StatWheel values={d.abilities} />
        </section>
        <section className="sheet-card">
          <div className="sheet-card-head">
            <span>SAVING THROWS</span>
            <small>Initial class only, per multiclass rules</small>
          </div>
          <div className="compact-list">
            {abilities.map((a) => (
              <div key={a}>
                <span
                  className={
                    d.proficiencies.some(
                      (item) => item.kind === "Save" && item.name === a,
                    )
                      ? "trained-dot"
                      : "untrained-dot"
                  }
                />
                <strong>{a}</strong>
                <span>{formatMod(d.saves[a])}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="sheet-card">
          <div className="sheet-card-head">
            <span>SKILLS</span>
            <small>Ability + proficiency or expertise</small>
          </div>
          <div className="compact-list skills-list">
            {skills.map((s) => {
              const sources = d.proficiencies.filter(
                (item) => item.kind === "Skill" && item.name === s,
              );
              return (
                <div key={s}>
                  <span
                    className={sources.length ? "trained-dot" : "untrained-dot"}
                  />
                  <strong>{s}</strong>
                  <small>
                    {sources
                      .map(
                        (item) =>
                          `${item.source.includes("Expertise") ? "EXPERTISE" : item.source.startsWith("Class skill") ? "CLASS" : item.source.startsWith("Background") ? "BACKGROUND" : item.source.startsWith("Race") ? "RACE" : "OTHER"}`,
                      )
                      .join(" / ")}
                  </small>
                  <span>{formatMod(d.skillBonuses[s])}</span>
                </div>
              );
            })}
          </div>
        </section>
        <section className="sheet-card span-two">
          <div className="sheet-card-head">
            <span>FEATURES & TRAITS</span>
            <small>
              Grouped by source; every class entry shows both character level
              and class level
            </small>
          </div>
          {allFeatures.length ? (
            <div className="feature-groups">
              {featureGroups.map((group) => {
                const className = group.entries[0]?.className || "";
                const currentClassLevel = d.classLevels[className] || 0;
                const heading =
                  group.sourceType === "Race"
                    ? `${group.sourceName.toUpperCase()} — RACE TRAITS`
                    : group.sourceType === "Class"
                      ? `${group.sourceName.toUpperCase()} FEATURES — ${group.sourceName.toUpperCase()} ${currentClassLevel}`
                      : group.sourceType === "Subclass"
                        ? `${group.sourceName.toUpperCase()} — ${className.toUpperCase()} ${currentClassLevel}`
                        : `${group.sourceType.toUpperCase()} FEATURES — ${group.sourceName}`;
                return (
                  <section
                    className="feature-group"
                    key={`${group.sourceType}-${group.sourceName}`}
                  >
                    <h4>{heading}</h4>
                    <div className="level-entry-list">
                      {group.entries.map((item) => (
                        <div key={item.id}>
                          <span className="entry-level">
                            {item.characterLevel
                              ? `CL ${item.characterLevel}`
                              : item.classLevel
                                ? "CL ?"
                                : item.sourceType.toUpperCase()}
                          </span>
                          <div>
                            <strong
                              data-player-text={!item.id.startsWith("derived-")}
                            >
                              {item.name || "Unnamed feature"}
                            </strong>
                            <small
                              data-player-text={!item.id.startsWith("derived-")}
                            >
                              {item.sourceType}:{" "}
                              {item.sourceName ||
                                item.className ||
                                "Source unset"}
                              {item.classLevel
                                ? ` · ${item.className || item.sourceName} level ${item.classLevel}`
                                : ""}
                              {item.uses ? ` · ${item.uses}` : ""}
                            </small>
                            {item.sourceReference && (
                              <small>Source: {item.sourceReference}</small>
                            )}
                            {item.description && (
                              <p
                                data-player-text={
                                  !item.id.startsWith("derived-")
                                }
                              >
                                {item.id.startsWith("derived-") &&
                                item.description.includes(
                                  "Imported sheet note:",
                                ) ? (
                                  <>
                                    {
                                      item.description.split(
                                        "Imported sheet note:",
                                      )[0]
                                    }
                                    <br />
                                    <b>Imported sheet note:</b>{" "}
                                    <span data-player-text>
                                      {item.description
                                        .split("Imported sheet note:")
                                        .slice(1)
                                        .join("Imported sheet note:")}
                                    </span>
                                  </>
                                ) : (
                                  item.description
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <p>
              Unset. Choose a race and class to add their features
              automatically.
            </p>
          )}
          {c.featureEntries.length > 0 && (
            <p className="soft-note">
              Manual feature notes are included with the calculated entries so
              source tags and custom details remain visible.
            </p>
          )}
        </section>
        <section className="sheet-card">
          <div className="sheet-card-head">
            <span>PROFICIENCIES & LANGUAGES</span>
            <small>Source and level included</small>
          </div>
          {d.proficiencies.map((item) => (
            <p key={item.id}>
              <b>{item.kind}:</b>{" "}
              <span data-player-text={!item.id.startsWith("derived-")}>
                {item.name}
              </span>{" "}
              <small>
                · {item.source}
                {item.classLevel
                  ? ` · ${item.className} level ${item.classLevel}`
                  : ""}
                {item.characterLevel
                  ? ` · character level ${item.characterLevel}`
                  : ""}
              </small>
            </p>
          ))}
        </section>
        <section className="sheet-card">
          <div className="sheet-card-head">
            <span>EQUIPMENT & TREASURE</span>
            <small>Item rows retain quantity and source level</small>
          </div>
          <ul>
            {[
              ...legacyEquipment.map(
                (name) => `1 × ${name} · initial class package`,
              ),
              ...sheetItems.map(
                (item) =>
                  `${item.quantity} × ${item.name}${item.source ? ` · ${item.source}` : ""}${item.characterLevel ? ` · character level ${item.characterLevel}` : ""}${item.classLevel ? ` · ${item.className || "class"} level ${item.classLevel}` : ""}${item.notes ? ` — ${item.notes}` : ""}`,
              ),
            ].map((x, i) => (
              <li key={`${x}-${i}`} data-player-text>
                {x}
              </li>
            ))}
          </ul>
          {!legacyEquipment.length && !sheetItems.length && <p>Unset</p>}
          <p>
            <b>Currency:</b>{" "}
            {Object.entries(c.currency)
              .filter(([, v]) => v)
              .map(([coin, value]) => `${value} ${coin}`)
              .join(" · ") || "Unset"}
          </p>
          <p>
            <b>Treasure notes:</b>{" "}
            <span data-player-text>{c.notes || "Unset"}</span>
          </p>
        </section>
        <section className="sheet-card span-two">
          <div className="sheet-card-head">
            <span>ATTACKS</span>
            <small>
              Attack bonus uses final ability score and total character
              proficiency bonus
            </small>
          </div>
          {d.attacks.length ? (
            <div className="attack-list">
              {d.attacks.map((item) => (
                <div key={item.id}>
                  <strong data-player-text={!item.id.startsWith("auto-")}>
                    {item.name}
                  </strong>
                  <span>{item.calculatedBonus}</span>
                  <span data-player-text={!item.id.startsWith("auto-")}>
                    {item.damage || "Damage unset"}
                  </span>
                  <span data-player-text={!item.id.startsWith("auto-")}>
                    {[item.range, item.properties].filter(Boolean).join(" · ")}
                  </span>
                  <small data-player-text={!item.id.startsWith("auto-")}>
                    {item.source || "Source unset"}
                  </small>
                </div>
              ))}
            </div>
          ) : (
            <p>
              No weapon rows recorded. Add a weapon or attack in Stage 7; class
              attacks per action and Sneak Attack scaling are listed in Combat
              Profile.
            </p>
          )}
        </section>
        {(d.spellcasting.length > 0 || d.resolvedSpells.length > 0) && (
          <section className="sheet-card span-two">
            <div className="sheet-card-head">
              <span>SPELLCASTING</span>
              <small>Class tables by class level</small>
            </div>
            {d.spellcasting.map((caster) => (
              <div key={caster.source}>
                <h4>{caster.source}</h4>
                <p>
                  {caster.ability} · Save DC {caster.saveDC} · spell attack{" "}
                  {formatMod(caster.attackBonus)}
                </p>
                <p>{caster.recovery}</p>
              </div>
            ))}
            <p>
              <b>Spellcasting slots:</b>{" "}
              {d.spellSlots
                .map((count, index) => `L${index + 1}: ${count}`)
                .join(" · ") || "none"}
              {d.pactSlots
                ? ` · Pact Magic ${d.pactSlots} × level ${d.pactSlotLevel}, short/long rest`
                : ""}
            </p>
            {d.resolvedSpells.map((spell) => (
              <details key={`${spell.source}-${spell.spellId}-${spell.status}`}>
                <summary>
                  {spell.name} · {spell.source} · {spell.status}
                </summary>
                <p>
                  {spell.definition?.description ||
                    "Source verification required"}
                </p>
                <p>
                  {spell.ability} · Save DC {spell.saveDC} · spell attack{" "}
                  {formatMod(spell.attackBonus)} · {spell.uses}
                </p>
              </details>
            ))}
          </section>
        )}
        <section className="sheet-card span-two">
          <div className="sheet-card-head">
            <span>IDENTITY & STORY</span>
          </div>
          <div className="story-fields">
            {(
              [
                ["Age", c.identity.age],
                ["Height", c.identity.height],
                ["Weight", c.identity.weight],
                ["Eyes", c.identity.eyes],
                ["Skin", c.identity.skin],
                ["Hair", c.identity.hair],
                ["Appearance", c.identity.appearance],
                ["Personality", c.identity.traits],
                ["Ideal", c.identity.ideal],
                ["Bond", c.identity.bond],
                ["Flaw", c.identity.flaw],
                ["Backstory", c.identity.backstory],
                ["Current goal", c.identity.goal],
                ["Allies and organizations", c.identity.allies],
                ["Faction", c.identity.faction],
                ["Treasure", c.identity.treasure],
              ] as [string, string][]
            ).map(([label, value]) => (
              <div key={label}>
                <b>{label}</b>
                <span data-player-text>{value || "Unset"}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="sheet-card span-two audit-card">
          <div className="sheet-card-head">
            <span>RULES AUDIT</span>
            <small>{valid ? "VALIDATED" : "INCOMPLETE"} · 2014 PHB scope</small>
          </div>
          <p>
            Race traits and class/subclass level unlocks are listed with their
            source and level. Proficiency bonus uses total character level;
            features, attack scaling, and spell counts use each class level.
            Combat values use equipped items and recorded hit-point choices.
            Missing inputs and unresolved source checks are listed in Review.
          </p>
        </section>
      </div>
    </div>
  );
}

export function StatWheel({ values }: { values: Record<string, number> }) {
  const minimum = Math.min(3, ...Object.values(values));
  const maximum = Math.max(20, ...Object.values(values));
  const pts = abilities.map((a, i) => {
    const angle = -Math.PI / 2 + (i * Math.PI) / 3;
    const radius =
      Math.max(0, Math.min(1, (values[a] - minimum) / (maximum - minimum))) *
      73;
    return [
      110 + Math.cos(angle) * radius,
      90 + Math.sin(angle) * radius,
    ] as const;
  });
  const polygon = pts.map((p) => p.join(",")).join(" ");
  return (
    <div className="stat-wheel-wrap">
      <svg
        viewBox="0 0 220 180"
        role="img"
        aria-label={`Ability stat wheel. ${abilities.map((a) => `${a} ${values[a]}`).join(", ")}`}
      >
        <title>{`Six-ability stat wheel, scale ${minimum} to ${maximum}`}</title>
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <polygon
            key={scale}
            points={abilities
              .map((_, i) => {
                const angle = -Math.PI / 2 + (i * Math.PI) / 3;
                return `${110 + Math.cos(angle) * 73 * scale},${90 + Math.sin(angle) * 73 * scale}`;
              })
              .join(" ")}
            className="wheel-grid"
          />
        ))}
        {abilities.map((a, i) => {
          const angle = -Math.PI / 2 + (i * Math.PI) / 3;
          return (
            <line
              key={a}
              x1="110"
              y1="90"
              x2={110 + Math.cos(angle) * 73}
              y2={90 + Math.sin(angle) * 73}
              className="wheel-axis"
            />
          );
        })}
        <polygon points={polygon} className="wheel-value" />
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="3.2" className="wheel-point" />
        ))}
        {abilities.map((a, i) => {
          const angle = -Math.PI / 2 + (i * Math.PI) / 3;
          const x = 110 + Math.cos(angle) * 87;
          const y = 90 + Math.sin(angle) * 87;
          return (
            <text
              key={a}
              x={x}
              y={y}
              className="wheel-label"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {a.slice(0, 3).toUpperCase()} {values[a]}
            </text>
          );
        })}
      </svg>
      <span>{`Each axis uses the same ${minimum}–${maximum} scale.`}</span>
    </div>
  );
}
