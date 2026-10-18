/** @jsxImportSource ../../i18n */
import { backgrounds } from "../../catalog/backgrounds";
import {
  backgroundVariantOptions,
  selectedBackground,
} from "../../engine/character";
import { Character } from "../../engine/types";
import { ChoiceCard, Field, SectionTitle } from "../components/Shared";
export function StageBackground({
  c,
  update,
}: {
  c: Character;
  update: (p: Partial<Character>) => void;
}) {
  const b = selectedBackground(c);
  return (
    <div className="stage-body">
      <SectionTitle
        title="Choose a background"
        note="A background describes your life before adventuring. It grants skills and practical proficiencies that complement your class."
      />
      <div className="choice-grid background-grid">
        {backgrounds.map((item) => (
          <ChoiceCard
            key={item.name}
            selected={c.background === item.name}
            title={item.name}
            meta={`${item.skills.join(" • ")} • ${item.languages ? `${item.languages} language(s)` : item.tools.join(", ")}`}
            onClick={() => update({ background: item.name })}
          >
            {item.detail}
            <span className="choice-subline">
              <b>Proficiencies:</b> {item.skills.join(", ")}
              {item.tools.length ? ` · ${item.tools.join(", ")}` : ""}
            </span>
            {item.languages > 0 && (
              <span className="choice-subline">
                Choose {item.languages} additional language(s).
              </span>
            )}
          </ChoiceCard>
        ))}
      </div>
      {b && backgroundVariantOptions(c.background).length > 0 && (
        <Field label="Background variant">
          <select
            value={c.backgroundVariant}
            onChange={(event) =>
              update({ backgroundVariant: event.target.value })
            }
          >
            <option value="">Standard background</option>
            {backgroundVariantOptions(c.background).map((variant) => (
              <option value={variant} key={variant}>
                {variant}
              </option>
            ))}
          </select>
        </Field>
      )}
      {b && (
        <div className="selected-summary">
          <div>
            <span className="summary-label">
              BACKGROUND FEATURE · ADDED TO FEATURES & TRAITS
            </span>
            <strong>
              {
                (
                  {
                    Acolyte: "Shelter of the Faithful",
                    Charlatan: "False Identity",
                    "Criminal / Spy": "Criminal Contact",
                    "Entertainer / Gladiator": "By Popular Demand",
                    "Folk Hero": "Rustic Hospitality",
                    "Guild Artisan / Merchant": "Guild Membership",
                    Hermit: "Discovery",
                    "Noble / Knight": "Position of Privilege",
                    Outlander: "Wanderer",
                    Sage: "Researcher",
                    "Sailor / Pirate": "Ship's Passage",
                    Soldier: "Military Rank",
                    Urchin: "City Secrets",
                  } as Record<string, string>
                )[b.name]
              }
            </strong>
          </div>
          <p>
            The sheet creates a level-sourced background feature summary
            automatically. Its full table interpretation can depend on setting
            and DM rulings.
          </p>
        </div>
      )}
    </div>
  );
}
