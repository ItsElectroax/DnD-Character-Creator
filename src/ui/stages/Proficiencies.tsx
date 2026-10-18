/** @jsxImportSource ../../i18n */
import { findEquipment } from "../../catalog/equipment";
import {
  languageDetails,
  languages,
  skillDetails,
  skills,
} from "../../catalog/proficiencies";
import { raceProfiles } from "../../catalog/races";
import {
  additionalLanguageCount,
  classSkillPlans,
  derive,
  selectedBackground,
  selectedClassSkills,
  toolChoicePlans,
} from "../../engine/character";
import { Character, ProficiencyEntry } from "../../engine/types";
import { getLocale, t } from "../../i18n/engine";
import { SkillReplacementPicker } from "../components/CreationControls";
import { OptionEffects } from "../components/OptionEffects";
import { Field, SectionTitle } from "../components/Shared";
export function StageProficiencies({
  c,
  update,
  toggle,
  d,
}: {
  c: Character;
  update: (p: Partial<Character>) => void;
  toggle: (list: string[], value: string, count?: number) => string[];
  d: ReturnType<typeof derive>;
}) {
  const plans = classSkillPlans(c);
  const skillChoices = selectedClassSkills(c);
  const bg = selectedBackground(c);
  const classCount = plans.reduce((sum, plan) => sum + plan.count, 0);
  const classSkills = Object.values(skillChoices).flat();
  const toolPlans = toolChoicePlans(c);
  const allowedLanguages = additionalLanguageCount(c);
  const raceSkillCount =
    c.race === "Half-Elf"
      ? 2
      : c.race === "Human" && c.subrace.includes("Variant")
        ? 1
        : 0;
  const addProf = () =>
    update({
      otherProficiencies: [
        ...c.otherProficiencies,
        {
          id: crypto.randomUUID(),
          name: "",
          kind: "Tool",
          source: "",
          className: "",
          classLevel: null,
          characterLevel: null,
        },
      ],
    });
  const editProf = (id: string, patch: Partial<ProficiencyEntry>) =>
    update({
      otherProficiencies: c.otherProficiencies.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    });
  return (
    <div className="stage-body">
      <SectionTitle
        title="Skills, tools, and languages"
        note="Proficiency means training: add your proficiency bonus when you use that skill or tool. A skill can only be counted once."
      />
      <div className="pick-summary">
        <div>
          <span>CLASS SKILLS</span>
          <strong>
            {classSkills.length} / {classCount}
          </strong>
        </div>
        <div>
          <span>ANCESTRY SKILLS</span>
          <strong>
            {(c.raceSkills || []).length} / {raceSkillCount}
          </strong>
        </div>
        <div>
          <span>ADDITIONAL LANGUAGES</span>
          <strong>
            {c.languages.length} / {allowedLanguages}
          </strong>
        </div>
        <div>
          <span>BACKGROUND</span>
          <strong>{bg?.name || "Choose a background first"}</strong>
        </div>
      </div>
      <div className="selector-block">
        <SectionTitle
          title="Class skill choices"
          note="Each class has its own eligible list and choice count. Multiclass entry only grants a skill choice for classes that list one."
        />
        {plans.map((plan) => (
          <div className="skill-plan-block" key={plan.className}>
            <SectionTitle
              title={`${plan.className} · choose ${plan.count}`}
              note={
                plan.initial
                  ? "Starting class skill training."
                  : "Skill choice granted when you multiclass into this class."
              }
            />
            <div className="skill-grid">
              {plan.options.map((skill) => {
                const chosen = skillChoices[plan.className] || [];
                const selected = chosen.includes(skill);
                const fromBg = bg?.skills.includes(skill) || false;
                const fromPdf = c.otherProficiencies.some(
                  (item) => item.kind === "Skill" && item.name === skill,
                );
                const fromRace =
                  (c.raceSkills || []).includes(skill) ||
                  raceProfiles[c.race]?.passiveSkillProficiencies.includes(
                    skill,
                  ) ||
                  false;
                const selectedElsewhere = Object.entries(skillChoices).some(
                  ([other, names]) =>
                    other !== plan.className && names.includes(skill),
                );
                const disabled = !selected && chosen.length >= plan.count;
                return (
                  <label
                    key={`${plan.className}-${skill}`}
                    className={`skill-option ${selected ? "skill-selected" : ""} ${disabled ? "skill-disabled" : ""}`}
                    title={
                      selectedElsewhere
                        ? "Already selected from another class"
                        : undefined
                    }
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      disabled={disabled}
                      onChange={() => {
                        const next = {
                          ...skillChoices,
                          [plan.className]: toggle(chosen, skill, plan.count),
                        };
                        const all = [...new Set(Object.values(next).flat())];
                        update({ classSkillChoices: next, skills: all });
                      }}
                    />
                    <span className="skill-mark" aria-hidden="true"></span>
                    <span className="skill-copy">
                      <strong>{skill}</strong>
                      <small>
                        {skillDetails[skill]?.ability} ·{" "}
                        {skillDetails[skill]?.description}
                      </small>
                    </span>
                    {fromBg && <small>BACKGROUND</small>}
                    {fromRace && <small>RACE</small>}
                    {fromPdf && <small>IMPORTED</small>}
                    {selectedElsewhere && <small>ALREADY GRANTED</small>}
                    <OptionEffects />
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {raceSkillCount > 0 && (
        <div className="selector-block">
          <SectionTitle
            title={`${c.race} skill choices`}
            note={`Choose ${raceSkillCount} skill proficiencies granted by this ancestry. Duplicate grants offer a replacement skill below.`}
          />
          <div className="skill-grid">
            {skills.map((skill) => {
              const alreadyTrained =
                c.skills.includes(skill) ||
                bg?.skills.includes(skill) ||
                raceProfiles[c.race]?.passiveSkillProficiencies.includes(
                  skill,
                ) ||
                c.otherProficiencies.some(
                  (item) => item.kind === "Skill" && item.name === skill,
                );
              const selected = (c.raceSkills || []).includes(skill);
              return (
                <label
                  key={`race-${skill}`}
                  className={`skill-option ${selected ? "skill-selected" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    disabled={
                      !selected && c.raceSkills.length >= raceSkillCount
                    }
                    onChange={() =>
                      update({
                        raceSkills: toggle(
                          c.raceSkills || [],
                          skill,
                          raceSkillCount,
                        ),
                      })
                    }
                  />
                  <span className="skill-mark" aria-hidden="true"></span>
                  <span className="skill-copy">
                    <strong>{skill}</strong>
                    <small>
                      {skillDetails[skill]?.ability} ·{" "}
                      {skillDetails[skill]?.description}
                    </small>
                  </span>
                  {alreadyTrained && <small>ALREADY GRANTED</small>}
                  <OptionEffects />
                </label>
              );
            })}
          </div>
        </div>
      )}
      <SkillReplacementPicker c={c} update={update} stage={4} />
      <div className="two-column">
        <div className="detail-panel">
          <SectionTitle
            title="Tools & training"
            note="Pick from the exact 2014 PHB tools, instruments, or gaming sets your class, race, and background allow. Fixed proficiencies are shown separately."
          />
          {d.proficiencies.filter(
            (item) => item.kind === "Tool" || item.kind === "Vehicle",
          ).length > 0 && (
            <div className="tool-training-list">
              <strong>Already granted</strong>
              {d.proficiencies
                .filter(
                  (item) => item.kind === "Tool" || item.kind === "Vehicle",
                )
                .map((item) => (
                  <div key={item.id}>
                    <span>{item.name}</span>
                    <small>{item.source}</small>
                  </div>
                ))}
            </div>
          )}
          {toolPlans.length ? (
            <div className="tool-choice-list">
              {toolPlans.map((plan) => {
                const current = c.toolChoices?.[plan.key] || [];
                return (
                  <section key={plan.key}>
                    <h4>{plan.label}</h4>
                    <p>{plan.source} · choose from the eligible list below.</p>
                    <details className="tool-glossary">
                      <summary>Eligible tool details</summary>
                      <dl>
                        {plan.options.map((name) => (
                          <div key={name}>
                            <dt>{name}</dt>
                            <dd>{findEquipment(name)?.description || ""}</dd>
                          </div>
                        ))}
                      </dl>
                    </details>
                    <div className="tool-choice-fields">
                      {Array.from({ length: plan.count }, (_, index) => {
                        const currentValue = current[index] || "";
                        const selectedElsewhere = new Set(
                          Object.entries(c.toolChoices || {}).flatMap(
                            ([key, values]) =>
                              values.filter(
                                (_, otherIndex) =>
                                  key !== plan.key || otherIndex !== index,
                              ),
                          ),
                        );
                        const options = [
                          ...new Set([
                            ...plan.options,
                            ...(currentValue ? [currentValue] : []),
                          ]),
                        ].sort((a, b) => a.localeCompare(b));
                        return (
                          <Field
                            key={`${plan.key}-${index}`}
                            label={`${plan.label.split(":")[0]} choice ${index + 1}`}
                            hint={findEquipment(currentValue)?.description}
                          >
                            <select
                              value={currentValue}
                              onChange={(e) => {
                                const next = [...current];
                                next[index] = e.target.value;
                                update({
                                  toolChoices: {
                                    ...c.toolChoices,
                                    [plan.key]: next.filter(Boolean),
                                  },
                                });
                              }}
                            >
                              <option value="">
                                Choose a specific proficiency
                              </option>
                              {options.map((option) => (
                                <option
                                  key={option}
                                  value={option}
                                  disabled={
                                    selectedElsewhere.has(option) &&
                                    option !== currentValue
                                  }
                                >
                                  {option}
                                  {selectedElsewhere.has(option) &&
                                  option !== currentValue
                                    ? " — already selected"
                                    : ""}
                                </option>
                              ))}
                            </select>
                          </Field>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <p className="not-applicable">
              Your current class, race, and background grant no tool selection.
              Any fixed tool proficiencies still appear above and on the sheet.
            </p>
          )}
          {c.tools.length > 0 && (
            <p className="soft-note">
              Older saved/imported tool entries are preserved:{" "}
              {c.tools.join(", ")}. New choices are selected from the lists
              above.
            </p>
          )}
        </div>
        <div className="detail-panel">
          <SectionTitle
            title="Languages"
            note={
              allowedLanguages > 0
                ? `Choose ${allowedLanguages} additional language(s). Your ancestry's languages are listed below.`
                : "Your current choices grant no additional languages. The options below are a reference."
            }
          />
          <p className="language-guidance">
            Language training lets you speak a language and use its writing
            system, when it has one. Ask your DM before choosing an exotic
            language.
          </p>
          <div className="language-grid">
            {languages
              .filter(
                (x) => !(raceProfiles[c.race]?.languages || []).includes(x),
              )
              .map((language) => (
                <label
                  key={language}
                  title={languageDetails[language]?.description}
                  className={`language-choice ${c.languages.includes(language) ? "is-selected" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={c.languages.includes(language)}
                    disabled={
                      !c.languages.includes(language) &&
                      c.languages.length >= allowedLanguages
                    }
                    onChange={() =>
                      update({
                        languages: toggle(
                          c.languages,
                          language,
                          allowedLanguages,
                        ),
                      })
                    }
                  />
                  <span className="skill-copy">
                    <span className="language-name">
                      <strong>{language}</strong>
                      {languageDetails[language]?.exotic && (
                        <span className="language-tag">Exotic</span>
                      )}
                    </span>
                    <small>
                      {getLocale() === "hr"
                        ? languageDetails[language]?.speakersHr
                        : languageDetails[language]?.speakers}{" "}
                      ·{" "}
                      {languageDetails[language]?.script === "No script"
                        ? t("No written script")
                        : getLocale() === "hr"
                          ? `Pismo: ${languageDetails[language]?.scriptHr}`
                          : `${languageDetails[language]?.script} script`}
                    </small>
                  </span>
                  <OptionEffects />
                </label>
              ))}
          </div>
          <p className="soft-note">
            Known automatically:{" "}
            {raceProfiles[c.race]?.languages.join(", ") ||
              "choose a race first"}
            . Your other background and ancestry language choices appear in the
            final sheet with their sources.
          </p>
        </div>
      </div>
      <div className="detail-panel">
        <div className="section-title">
          <div>
            <h3>OTHER / IMPORTED PROFICIENCIES</h3>
            <p>
              Standard 2014 PHB tool choices are listed above. Use this area
              only for imported sheet entries or table-specific proficiencies
              that are not in the built-in choices.
            </p>
          </div>
          <button className="quiet-button" onClick={addProf}>
            ADD PROFICIENCY
          </button>
        </div>
        {c.otherProficiencies.map((item) => (
          <div className="structured-row proficiency-edit-row" key={item.id}>
            <Field label="Proficiency">
              <input
                value={item.name}
                onChange={(e) => editProf(item.id, { name: e.target.value })}
                placeholder="e.g. light armor, Dwarvish"
              />
            </Field>
            <Field label="Type">
              <select
                value={item.kind}
                onChange={(e) =>
                  editProf(item.id, {
                    kind: e.target.value as ProficiencyEntry["kind"],
                  })
                }
              >
                {[
                  "Armor",
                  "Weapon",
                  "Tool",
                  "Vehicle",
                  "Language",
                  "Skill",
                  "Save",
                  "Other",
                ].map((kind) => (
                  <option key={kind}>{kind}</option>
                ))}
              </select>
            </Field>
            <Field label="Granted by">
              <input
                value={item.source}
                onChange={(e) => editProf(item.id, { source: e.target.value })}
                placeholder="Race, class, background…"
              />
            </Field>
            <Field label="Class">
              <select
                value={item.className}
                onChange={(e) =>
                  editProf(item.id, { className: e.target.value })
                }
              >
                <option value="">Not class-specific</option>
                {c.classes.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </Field>
            <Field label="Class level">
              <input
                type="number"
                min="1"
                max="20"
                value={item.classLevel ?? ""}
                onChange={(e) =>
                  editProf(item.id, {
                    classLevel: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </Field>
            <Field label="Character level">
              <input
                type="number"
                min="1"
                max={c.level}
                value={item.characterLevel ?? ""}
                onChange={(e) =>
                  editProf(item.id, {
                    characterLevel: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
              />
            </Field>
            <button
              className="remove-row"
              onClick={() =>
                update({
                  otherProficiencies: c.otherProficiencies.filter(
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
    </div>
  );
}
