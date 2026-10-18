/** @jsxImportSource ../../i18n */
import { abilities } from "../../catalog/proficiencies";
import {
  abilityModifier,
  derive,
  finalAbilities,
  formatMod,
  standardArray,
  validateStage,
} from "../../engine/character";
import { Character } from "../../engine/types";
import { t } from "../../i18n/engine";
import {
  AdvancementEditor,
  ChoiceCard,
  Field,
  SectionTitle,
} from "../components/Shared";
export function StageAbilities({
  c,
  update,
}: {
  c: Character;
  update: (p: Partial<Character>) => void;
}) {
  const method = c.abilityMethod;
  const setMethod = (value: Character["abilityMethod"]) => {
    if (value === c.abilityMethod) return;
    update({
      abilityMethod: value,
      scoresAreFinal: false,
      baseAbilities:
        value === "standard"
          ? Object.fromEntries(
              abilities.map((ability, index) => [
                ability,
                standardArray[index],
              ]),
            )
          : c.scoresAreFinal
            ? Object.fromEntries(
                abilities.map((ability) => [
                  ability,
                  value === "point-buy" ? 8 : 0,
                ]),
              )
            : c.baseAbilities,
    });
  };
  const used = Object.values(c.baseAbilities).reduce(
    (sum, value) =>
      sum +
      (value >= 8 && value <= 15
        ? (
            { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 } as Record<
              number,
              number
            >
          )[value]
        : 0),
    0,
  );
  const abilityData = derive(c).abilityBreakdown;
  const racial = finalAbilities(c);
  const setBase = (ability: string, value: number) =>
    update({
      scoresAreFinal: c.scoresAreFinal,
      baseAbilities: { ...c.baseAbilities, [ability]: value },
    });
  const standardOptions = (_ability: string) => standardArray;
  const changeBase = (ability: string, value: number) => {
    if (method !== "standard") return setBase(ability, value);
    const previous = Number(c.baseAbilities[ability]);
    const owner = abilities.find(
      (a) => a !== ability && Number(c.baseAbilities[a]) === value,
    );
    const next = { ...c.baseAbilities, [ability]: value };
    if (owner) next[owner] = previous;
    update({ scoresAreFinal: false, baseAbilities: next });
  };
  return (
    <div className="stage-body">
      <SectionTitle
        title="Ability scores"
        note="These six scores shape your character’s strengths. The linked modifier is added to most related checks."
      />
      {c.scoresAreFinal && (
        <p className="soft-note">
          Imported final scores are preserved. Editing a value does not add
          ancestry or advancement bonuses again. Choose a different method to
          rebuild pre-ancestry scores.
        </p>
      )}
      <div className="choice-grid method-grid">
        {(
          [
            [
              "standard",
              "Standard array",
              "A ready-to-use set of six scores. Assign each value once.",
            ],
            [
              "point-buy",
              "Point buy",
              "Build a balanced set. Spend exactly 27 points; each score costs more as it rises.",
            ],
            [
              "manual",
              "Enter scores",
              "Use scores your table has already rolled or agreed on.",
            ],
            [
              "rolled",
              "Rolled at table",
              "Record your actual rolls. This app never invents dice results.",
            ],
          ] as const
        ).map(([id, title, body]) => (
          <ChoiceCard
            key={id}
            selected={method === id}
            title={title}
            onClick={() => setMethod(id)}
          >
            {body}
          </ChoiceCard>
        ))}
      </div>
      {method === "rolled" && (
        <Field
          label="Your six rolled scores"
          hint="Enter the numbers your table produced, and assign them below."
        >
          <input
            value={c.rollNotes}
            onChange={(e) => update({ rollNotes: e.target.value })}
            placeholder="For example: 15, 14, 13, 12, 10, 8"
          />
        </Field>
      )}
      <div className="ability-table">
        <div className="ability-table-head">
          <span>ABILITY</span>
          <span>BASE SCORE</span>
          <span>ANCESTRY</span>
          <span>ADVANCEMENT</span>
          <span>FINAL</span>
          <span>MODIFIER</span>
        </div>
        {abilities.map((a, i) => (
          <div className="ability-row" key={a}>
            <div className="ability-name">
              <strong>{a}</strong>
              <small>
                {
                  [
                    "Physical power",
                    "Agility and reflexes",
                    "Health and stamina",
                    "Reasoning and memory",
                    "Awareness and intuition",
                    "Confidence and presence",
                  ][i]
                }
              </small>
            </div>
            {method === "standard" ? (
              <select
                id={`ability-${a}`}
                aria-invalid={
                  validateStage(c, 3).some(
                    (error) =>
                      error.includes(a) ||
                      /point buy|standard.array|base ability/i.test(error),
                  ) || undefined
                }
                aria-describedby="stage-validation"
                aria-label={`${a} base score`}
                value={c.baseAbilities[a]}
                onChange={(e) => changeBase(a, Number(e.target.value))}
              >
                {standardOptions(a).map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            ) : (
              <select
                id={`ability-${a}`}
                aria-invalid={
                  validateStage(c, 3).some(
                    (error) =>
                      error.includes(a) ||
                      /point buy|standard.array|base ability/i.test(error),
                  ) || undefined
                }
                aria-describedby="stage-validation"
                aria-label={`${a} base score`}
                value={c.baseAbilities[a]}
                onChange={(e) => setBase(a, Number(e.target.value))}
              >
                {Array.from(
                  {
                    length: c.scoresAreFinal
                      ? 30
                      : method === "point-buy"
                        ? 8
                        : 16,
                  },
                  (_, x) =>
                    x + (c.scoresAreFinal ? 1 : method === "point-buy" ? 8 : 3),
                ).map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            )}
            <span className="score-bonus" data-label={t("ANCESTRY")}>
              {formatMod(abilityData[a]?.ancestry || 0)}
            </span>
            <span className="score-bonus" data-label={t("ADVANCEMENT")}>
              {formatMod(abilityData[a]?.advancement || 0)}
            </span>
            <strong className="score-final" data-label={t("FINAL")}>
              {racial[a]}
            </strong>
            <span className="score-mod" data-label={t("MODIFIER")}>
              {formatMod(abilityModifier(racial[a]))}
            </span>
          </div>
        ))}
      </div>
      {method === "point-buy" && (
        <div className={`point-buy-meter ${used > 27 ? "invalid" : ""}`}>
          <div>
            <span>POINTS SPENT</span>
            <strong>
              {used} <small>/ 27</small>
            </strong>
          </div>
          <div className="meter-track">
            <span style={{ width: `${Math.min(100, (used / 27) * 100)}%` }} />
          </div>
          <p>
            {used === 27
              ? "All 27 points are assigned."
              : used < 27
                ? `Assign ${27 - used} more point${27 - used === 1 ? "" : "s"}.`
                : "Reduce one or more scores to fit the budget."}
          </p>
        </div>
      )}
      {((c.race === "Human" && c.subrace.includes("Variant")) ||
        c.race === "Half-Elf") && (
        <div className="detail-panel">
          <SectionTitle
            title="Flexible ancestry increases"
            note="Choose two different abilities to receive +1 each."
          />
          <div className="flex-choice">
            {[0, 1].map((i) => (
              <Field key={i} label={`+1 ability ${i + 1}`}>
                <select
                  value={c.flexBonuses[i] || ""}
                  onChange={(e) => {
                    const next = [...c.flexBonuses];
                    next[i] = e.target.value;
                    update({ flexBonuses: next });
                  }}
                >
                  <option value="">Choose an ability</option>
                  {abilities
                    .filter((a) => c.race !== "Half-Elf" || a !== "Charisma")
                    .filter(
                      (a) =>
                        a === c.flexBonuses[i] || !c.flexBonuses.includes(a),
                    )
                    .map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                </select>
              </Field>
            ))}
          </div>
        </div>
      )}
      <AdvancementEditor c={c} update={update} />
      <p className="soft-note">
        Scores are assigned before ancestry increases. The standard array and
        point-buy methods follow the PHB; rolled scores must come from your
        table.
      </p>
    </div>
  );
}
