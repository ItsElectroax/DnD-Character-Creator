/** @jsxImportSource ../../i18n */
import React, { ReactNode, useId } from "react";
import { classProgression } from "../../catalog/classes";
import { featCatalog, findFeat } from "../../catalog/feats";
import { abilities } from "../../catalog/proficiencies";
import { derive, expertisePlans } from "../../engine/character";
import { Character } from "../../engine/types";
import { OptionEffects } from "./OptionEffects";
import type { CardArtwork } from "../artwork";
const publicBase =
  (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL ||
  "/";

export function Brand({
  title = "",
  showTitle = false,
}: {
  title?: string;
  showTitle?: boolean;
}) {
  return (
    <div
      className={`brand ${showTitle ? "brand--with-title" : "brand--welcome"}`}
    >
      <div className="brand-mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="brand-copy">
        <p className="eyebrow">
          D&D CHARACTER SYSTEM <i /> 5E • 2014 PHB
        </p>
        <h1
          className="brand-title"
          hidden={!showTitle}
          data-player-text={Boolean(title)}
        >
          {title || "CHARACTER CREATION"}
        </h1>
      </div>
    </div>
  );
}

export function ChoiceCard({
  selected,
  title,
  children,
  meta,
  onClick,
  disabled,
  className = "",
  artwork,
}: {
  selected: boolean;
  title: string;
  children: ReactNode;
  meta?: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  artwork?: CardArtwork;
}) {
  return (
    <button
      type="button"
      className={`choice-card ${artwork ? "choice-card--illustrated" : ""} ${selected ? "selected" : ""} ${className}`}
      aria-pressed={selected}
      aria-disabled={disabled || undefined}
      onClick={onClick}
      disabled={disabled}
    >
      {artwork && (
        <span className="choice-artwork" aria-hidden="true">
          <img
            src={`${publicBase}${artwork.src}`}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
            style={{ objectPosition: artwork.position }}
            onError={(event) => {
              event.currentTarget.hidden = true;
            }}
          />
        </span>
      )}
      <span className="choice-meta">
        {selected ? "SELECTED" : meta || "OPTION"}
      </span>
      <strong className="choice-title">{title}</strong>
      <span className="choice-copy">{children}</span>
      <OptionEffects />
    </button>
  );
}

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  const generatedId = useId();
  const firstControl = React.Children.toArray(children).find(
    (child) =>
      React.isValidElement(child) &&
      ["input", "select", "textarea"].includes(String(child.type)),
  ) as React.ReactElement<Record<string, unknown>> | undefined;
  const fieldId =
    typeof firstControl?.props.id === "string"
      ? firstControl.props.id
      : generatedId;
  const hintId = `${fieldId}-hint`;
  const controls = React.Children.map(children, (child) =>
    React.isValidElement<Record<string, unknown>>(child) &&
    ["input", "select", "textarea"].includes(String(child.type))
      ? React.cloneElement(child, {
          id: child.props.id || fieldId,
          "aria-describedby": hint ? hintId : child.props["aria-describedby"],
        })
      : child,
  );
  return (
    <label className={`field ${className}`} htmlFor={fieldId}>
      <span className="field-label">{label}</span>
      {controls}
      {hint && (
        <span className="field-hint" id={hintId}>
          {hint}
        </span>
      )}
    </label>
  );
}

export function SectionTitle({
  title,
  note,
}: {
  title: string;
  note?: string;
}) {
  return (
    <div className="section-title">
      <h3>{title}</h3>
      {note && <p>{note}</p>}
    </div>
  );
}

export function ExpertisePicker({
  c,
  update,
}: {
  c: Character;
  update: (p: Partial<Character>) => void;
}) {
  const plans = expertisePlans(c);
  if (!plans.length) return null;
  return (
    <div className="detail-panel">
      <SectionTitle
        title="Expertise choices"
        note="Expertise doubles your proficiency bonus for a skill or tool you already know. Each class-level award is recorded separately."
      />
      {plans.map((plan) => {
        const selected = c.expertiseChoices?.[plan.key] || [];
        const chosenElsewhere = new Set(
          Object.entries(c.expertiseChoices || {})
            .filter(([key]) => key !== plan.key)
            .flatMap(([, items]) => items),
        );
        return (
          <div className="expertise-plan" key={plan.key}>
            <SectionTitle
              title={`${plan.className} level ${plan.classLevel} · choose ${plan.count}`}
              note="Select eligible proficiencies already on your sheet."
            />
            <div className="skill-grid">
              {plan.options.map((option) => {
                const checked = selected.includes(option);
                const disabled = !checked && chosenElsewhere.has(option);
                return (
                  <label
                    className={`skill-option ${checked ? "skill-selected" : ""} ${disabled ? "skill-disabled" : ""}`}
                    key={`${plan.key}-${option}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      aria-label={`${option} expertise from ${plan.className} level ${plan.classLevel}`}
                      onChange={() =>
                        update({
                          expertiseChoices: {
                            ...c.expertiseChoices,
                            [plan.key]: checked
                              ? selected.filter((item) => item !== option)
                              : selected.length < plan.count
                                ? [...selected, option]
                                : selected,
                          },
                        })
                      }
                    />
                    <span className="skill-mark" aria-hidden="true" />
                    <span>{option}</span>
                    {checked && <small>DOUBLE PROFICIENCY</small>}
                    <OptionEffects />
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AdvancementEditor({
  c,
  update,
}: {
  c: Character;
  update: (patch: Partial<Character>) => void;
}) {
  const d = derive(c);
  const choices = Object.entries(d.classLevels).map(([name, level]) => ({
    name,
    level,
  }));
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
  const setASI = (
    className: string,
    classLevel: number,
    choice: Character["asiChoices"][string],
  ) =>
    update({
      asiChoices: { ...c.asiChoices, [`${className}:${classLevel}`]: choice },
    });
  const setFeatOption = (key: string, value: string, count = 1) => {
    const existing = c.featOptions?.[key] || [];
    const values = existing.includes(value)
      ? existing.filter((item) => item !== value)
      : existing.length < count
        ? [...existing, value]
        : existing;
    update({ featOptions: { ...(c.featOptions || {}), [key]: values } });
  };
  const featChoiceControl = (featName: string, key: string) => {
    const feat = findFeat(featName);
    if (!feat?.choiceOptions?.length) return null;
    const count = feat.choiceCount || 1;
    const selected = c.featOptions?.[key] || [];
    return count === 1 ? (
      <Field label={feat.choiceLabel || "Feat choice"}>
        <select
          value={selected[0] || ""}
          onChange={(e) =>
            update({
              featOptions: {
                ...(c.featOptions || {}),
                [key]: e.target.value ? [e.target.value] : [],
              },
            })
          }
        >
          <option value="">Choose an option</option>
          {feat.choiceOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </Field>
    ) : (
      <div className="feat-choice-list">
        <strong>
          {feat.choiceLabel || "Feat choice"} · choose {count}
        </strong>
        <div className="choice-grid">
          {feat.choiceOptions.map((option) => (
            <label
              key={option}
              className={`skill-option ${selected.includes(option) ? "skill-selected" : ""}`}
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                disabled={
                  !selected.includes(option) && selected.length >= count
                }
                onChange={() => setFeatOption(key, option, count)}
              />
              <span>{option}</span>
              <OptionEffects />
            </label>
          ))}
        </div>
        <small>
          {selected.length} / {count} selected
        </small>
      </div>
    );
  };
  return (
    <div id="advancement-editor" tabIndex={-1} className="advancement-editor">
      {" "}
      <div className="detail-panel">
        <SectionTitle
          title="Ability Score Improvements"
          note="Record each ASI at the class level that grants it. A +2 increase or two different +1 increases affect calculated scores; a feat can replace it only when the optional feat rule is enabled."
        />
        {choices.flatMap(({ name, level }) =>
          (classProgression[name]?.levels || [])
            .filter((row) => row.asi && row.level <= level)
            .map((row) => {
              const key = `${name}:${row.level}`;
              const choice = c.asiChoices[key];
              const charLevel = classAcquisitionLevel(name, row.level);
              return (
                <div className="asi-choice-row" key={key}>
                  <div>
                    <strong>
                      {name} level {row.level} ASI
                    </strong>
                    <small>
                      {charLevel
                        ? `Character level ${charLevel}`
                        : "Character level unknown until the acquisition path is set"}
                    </small>
                  </div>
                  <Field label="Choice">
                    <select
                      aria-label={`${name} level ${row.level} ability improvement choice`}
                      value={choice?.mode || ""}
                      onChange={(e) => {
                        const mode = e.target.value as
                          "plus2" | "split" | "feat";
                        if (!mode) {
                          const next = { ...c.asiChoices };
                          delete next[key];
                          update({ asiChoices: next });
                        } else
                          setASI(name, row.level, {
                            mode,
                            abilities: choice?.abilities || [],
                            feat: choice?.feat || "",
                          });
                      }}
                    >
                      <option value="">Choose an improvement</option>
                      <option value="plus2">Increase one ability by 2</option>
                      <option value="split">
                        Increase two different abilities by 1
                      </option>
                      <option value="feat" disabled={!c.featEnabled}>
                        Choose an optional feat
                        {!c.featEnabled ? " — enable feats above" : ""}
                      </option>
                    </select>
                  </Field>
                  {choice?.mode === "plus2" && (
                    <Field label="Ability increased by 2">
                      <select
                        value={choice.abilities[0] || ""}
                        onChange={(e) =>
                          setASI(name, row.level, {
                            ...choice,
                            abilities: [e.target.value],
                          })
                        }
                      >
                        <option value="">Choose ability</option>
                        {abilities.map((ability) => (
                          <option key={ability}>{ability}</option>
                        ))}
                      </select>
                    </Field>
                  )}
                  {choice?.mode === "split" && (
                    <>
                      <Field label="First +1 ability">
                        <select
                          value={choice.abilities[0] || ""}
                          onChange={(e) =>
                            setASI(name, row.level, {
                              ...choice,
                              abilities: [
                                e.target.value,
                                choice.abilities[1] || "",
                              ],
                            })
                          }
                        >
                          <option value="">Choose ability</option>
                          {abilities.map((ability) => (
                            <option key={ability}>{ability}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Second +1 ability">
                        <select
                          value={choice.abilities[1] || ""}
                          onChange={(e) =>
                            setASI(name, row.level, {
                              ...choice,
                              abilities: [
                                choice.abilities[0] || "",
                                e.target.value,
                              ],
                            })
                          }
                        >
                          <option value="">Choose a different ability</option>
                          {abilities
                            .filter(
                              (ability) => ability !== choice.abilities[0],
                            )
                            .map((ability) => (
                              <option key={ability}>{ability}</option>
                            ))}
                        </select>
                      </Field>
                    </>
                  )}
                  {choice?.mode === "feat" && (
                    <div className="feat-choice-detail">
                      <Field label="Choose a PHB feat">
                        <select
                          value={choice.feat}
                          onChange={(e) => {
                            update({
                              asiChoices: {
                                ...c.asiChoices,
                                [`${name}:${row.level}`]: {
                                  ...choice,
                                  feat: e.target.value,
                                  abilities: [],
                                },
                              },
                              featOptions: {
                                ...c.featOptions,
                                [`${name}:${row.level}`]: [],
                              },
                            });
                          }}
                        >
                          <option value="">Select a feat</option>
                          {featCatalog.map((feat) => (
                            <option key={feat.name} value={feat.name}>
                              {feat.name}
                              {feat.prerequisite !== "None"
                                ? ` — prerequisite: ${feat.prerequisite}`
                                : ""}
                            </option>
                          ))}
                        </select>
                      </Field>
                      {findFeat(choice.feat) && (
                        <p className="body-copy">
                          {findFeat(choice.feat)?.description}
                        </p>
                      )}
                      {findFeat(choice.feat)?.abilityChoice && (
                        <Field label="Feat ability increase">
                          <select
                            value={choice.abilities[0] || ""}
                            onChange={(e) =>
                              setASI(name, row.level, {
                                ...choice,
                                abilities: [e.target.value],
                              })
                            }
                          >
                            <option value="">Choose +1 ability</option>
                            {findFeat(choice.feat)?.abilityChoice?.map(
                              (option) => (
                                <option key={option}>{option}</option>
                              ),
                            )}
                          </select>
                        </Field>
                      )}
                      {featChoiceControl(choice.feat, `${name}:${row.level}`)}
                    </div>
                  )}
                </div>
              );
            }),
        )}
      </div>
      <div className="detail-panel">
        <SectionTitle
          title="Optional feat rule"
          note="Feats are PHB optional. When enabled, a feat may replace an ability-score increase at eligible class levels."
        />
        <label className="check-row">
          <input
            type="checkbox"
            checked={c.featEnabled}
            onChange={(e) => update({ featEnabled: e.target.checked })}
          />
          <span>
            <strong>Enable PHB feats</strong>
            <small>
              Feats are not automatically awarded; the character must reach a
              class level with an ASI choice.
            </small>
          </span>
          <OptionEffects />
        </label>
        {c.race === "Human" && c.subrace.includes("Variant") && (
          <>
            <Field
              label="Variant Human starting feat"
              hint="This optional feature grants one PHB feat. Choose a listed feat and satisfy its prerequisite."
            >
              <select
                disabled={!c.featEnabled}
                value={c.raceFeat}
                onChange={(e) =>
                  update({
                    raceFeat: e.target.value,
                    raceFeatAbility: "",
                    featOptions: {
                      ...(c.featOptions || {}),
                      "Variant Human": [],
                    },
                  })
                }
              >
                <option value="">
                  {c.featEnabled ? "Choose a feat" : "Enable feats first"}
                </option>
                {featCatalog.map((feat) => (
                  <option key={feat.name} value={feat.name}>
                    {feat.name}
                    {feat.prerequisite !== "None"
                      ? ` — prerequisite: ${feat.prerequisite}`
                      : ""}
                  </option>
                ))}
              </select>
            </Field>
            {findFeat(c.raceFeat) && (
              <div className="detail-panel">
                <p className="body-copy">{findFeat(c.raceFeat)?.description}</p>
                {findFeat(c.raceFeat)?.abilityChoice && (
                  <Field label="Feat ability increase">
                    <select
                      value={c.raceFeatAbility}
                      onChange={(e) =>
                        update({ raceFeatAbility: e.target.value })
                      }
                    >
                      <option value="">Choose +1 ability</option>
                      {findFeat(c.raceFeat)?.abilityChoice?.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  </Field>
                )}
                {featChoiceControl(c.raceFeat, "Variant Human")}
              </div>
            )}
          </>
        )}
        <p className="soft-note">
          The PHB feat catalogue shows prerequisites, ability increases, and a
          rules summary. Some feat-specific selections and situational effects
          still require a choice or table ruling.
        </p>
      </div>
    </div>
  );
}
