/** @jsxImportSource ../../i18n */
import { derive, validateBuild } from "../../engine/character";
import { Character } from "../../engine/types";
import {
  CatalogAuditPanel,
  ImportReviewPanel,
} from "../components/ReviewDetails";
import { SectionTitle } from "../components/Shared";
import { stageNames } from "./config";
export function StageReview({
  c,
  d,
  go,
  update,
}: {
  c: Character;
  d: ReturnType<typeof derive>;
  go: (stage: number, control: string) => void;
  update: (patch: Partial<Character>) => void;
}) {
  const issues = validateBuild(c);
  const errors = issues.filter((issue) => issue.severity === "error");
  return (
    <div className="stage-body">
      <SectionTitle
        title="Build review"
        note="Every stage is checked against the same character data used by your sheet and PDF."
      />
      <div
        className={`validation-banner ${issues.length ? "draft" : "validated"}`}
      >
        <div className="validation-symbol">{issues.length ? "!" : "✓"}</div>
        <div>
          <strong>
            {errors.length
              ? "DRAFT — NEEDS INPUT"
              : issues.length
                ? "DRAFT — NEEDS SOURCE REVIEW"
                : "CHARACTER VALIDATED — 2014 PHB"}
          </strong>
          <p>
            {errors.length
              ? `${errors.length} required decisions need attention.`
              : issues.length
                ? "Review the unresolved source and table decisions below."
                : "No unresolved issues found."}
          </p>
        </div>
      </div>
      <div className="review-grid">
        <div className="detail-panel">
          <SectionTitle title="Choice and calculation summary" />
          <dl className="audit-list">
            <div>
              <dt>Race</dt>
              <dd>
                {c.race} / {c.subrace}
              </dd>
            </div>
            <div>
              <dt>Class plan</dt>
              <dd>
                {Object.entries(d.classLevels)
                  .map(([name, n]) => `${name} ${n}`)
                  .join(" / ") || "Unset"}
              </dd>
            </div>
            {[
              "hp",
              "ac",
              "proficiency",
              "initiative",
              "speed",
              "passivePerception",
            ].map((key) => (
              <div key={key}>
                <dt>{key}</dt>
                <dd>
                  <strong>{d.calculations[key].value}</strong>
                  <small>{d.calculations[key].formula}</small>
                  <small>{d.calculations[key].sources.join(" · ")}</small>
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="detail-panel">
          <SectionTitle title="Needs review" />
          <ul className="issue-list">
            {issues.map((issue) => (
              <li key={issue.id}>
                <span>{issue.severity === "error" ? "!" : "i"}</span>
                <div>
                  <strong>{issue.severity.toUpperCase()}</strong>
                  <p>{issue.message}</p>
                  <button
                    className="text-button"
                    onClick={() => go(issue.stage, issue.control)}
                  >
                    {stageNames[issue.stage]}
                  </button>
                  {issue.sourceReference && (
                    <small>{issue.sourceReference}</small>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {!issues.length && <p>No unresolved issues found.</p>}
        </div>
      </div>
      <ImportReviewPanel c={c} update={update} />
      <CatalogAuditPanel />
      <div className="detail-panel">
        <SectionTitle title="Level progression" />
        {Object.entries(d.classLevels).map(([name, count]) => (
          <details key={name}>
            <summary>
              {name} · {count} class levels
            </summary>
            {d.featureEntries
              .filter((item) => item.className === name)
              .map((item) => (
                <p key={item.id}>
                  {item.name} · class {item.classLevel} · character{" "}
                  {item.characterLevel ?? "unknown"}
                </p>
              ))}
          </details>
        ))}
      </div>
    </div>
  );
}
