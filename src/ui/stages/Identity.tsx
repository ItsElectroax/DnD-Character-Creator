/** @jsxImportSource ../../i18n */
import { Character } from "../../engine/types";
import { Field, SectionTitle } from "../components/Shared";
export function StageIdentity({
  c,
  update,
}: {
  c: Character;
  update: (p: Partial<Character>) => void;
}) {
  const set = (key: keyof Character["identity"], value: string) =>
    update({ identity: { ...c.identity, [key]: value } });
  return (
    <div className="stage-body">
      <SectionTitle
        title="Identity and story"
        note="These are roleplaying details, not mechanical requirements. Leave a field blank if you want to decide later."
      />
      <div className="form-grid">
        <Field label="Character name">
          <input
            value={c.identity.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="What do people call them?"
          />
        </Field>
        <Field label="Player name">
          <input
            value={c.identity.player}
            onChange={(e) => set("player", e.target.value)}
            placeholder="Optional"
          />
        </Field>
        <Field
          label="Alignment"
          hint="A broad guide to ideals and behavior; it does not dictate how you must roleplay."
        >
          <select
            value={c.identity.alignment}
            onChange={(e) => set("alignment", e.target.value)}
          >
            <option value="">Choose or leave undecided</option>
            {[
              "Lawful Good",
              "Neutral Good",
              "Chaotic Good",
              "Lawful Neutral",
              "True Neutral",
              "Chaotic Neutral",
              "Lawful Evil",
              "Neutral Evil",
              "Chaotic Evil",
              "Unaligned",
            ].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="detail-panel">
        <SectionTitle
          title="Character details"
          note="Each detail has its own field, so PDF import and export can match the official sheet accurately."
        />
        <div className="form-grid physical-grid">
          {(
            [
              ["age", "Age", "e.g. 32 years"],
              ["height", "Height", "e.g. 5 ft. 10 in."],
              ["weight", "Weight", "e.g. 165 lb."],
              ["eyes", "Eyes", "Color or notable detail"],
              ["skin", "Skin", "Tone, scales, markings…"],
              ["hair", "Hair", "Color, style, texture…"],
            ] as const
          ).map(([key, label, placeholder]) => (
            <Field key={key} label={label}>
              <input
                value={c.identity[key]}
                onChange={(e) => set(key, e.target.value)}
                placeholder={placeholder}
              />
            </Field>
          ))}
        </div>
        <Field label="Appearance and distinguishing marks">
          <textarea
            rows={3}
            value={c.identity.appearance}
            onChange={(e) => set("appearance", e.target.value)}
            placeholder="Scars, tattoos, clothing, posture, or other visible details"
          />
        </Field>
      </div>
      <div className="form-grid story-grid">
        {(
          [
            [
              "traits",
              "Personality traits",
              "What habits or attitudes stand out?",
            ],
            ["ideal", "Ideal", "What principle guides their choices?"],
            ["bond", "Bond", "Who or what matters deeply to them?"],
            ["flaw", "Flaw", "What weakness complicates their goals?"],
          ] as const
        ).map(([key, label, hint]) => (
          <Field key={key} label={label} hint={hint}>
            <textarea
              rows={3}
              value={c.identity[key]}
              onChange={(e) => set(key, e.target.value)}
            />
          </Field>
        ))}
      </div>
      <div className="form-grid">
        <Field label="Backstory">
          <textarea
            rows={4}
            value={c.identity.backstory}
            onChange={(e) => set("backstory", e.target.value)}
            placeholder="Only include details you have decided are true."
          />
        </Field>
        <Field label="Current goal or unresolved thread">
          <textarea
            rows={4}
            value={c.identity.goal}
            onChange={(e) => set("goal", e.target.value)}
            placeholder="What are they trying to do next?"
          />
        </Field>
      </div>
      <div className="form-grid">
        {(
          [
            ["allies", "Allies and organizations"],
            ["faction", "Faction"],
            ["treasure", "Treasure"],
          ] as const
        ).map(([key, label]) => (
          <Field key={key} label={label}>
            <textarea
              value={c.identity[key]}
              onChange={(event) => set(key, event.target.value)}
            />
          </Field>
        ))}
      </div>
      <p className="soft-note">
        Identity fields are optional. The final sheet will show undecided
        details as “Unset” instead of inventing backstory.
      </p>
    </div>
  );
}
