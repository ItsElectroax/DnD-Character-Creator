/** @jsxImportSource ../../i18n */
import { getCatalogAudit } from "../../catalog/audit";
import { type Character } from "../../engine/types";

export function CatalogAuditPanel() {
  const audit = getCatalogAudit();
  const pending = audit.issues.filter(
    (issue) => issue.kind === "source-access",
  );
  const gaps = audit.issues.filter((issue) => issue.kind !== "source-access");
  return (
    <details className="detail-panel catalog-audit" id="catalog-audit">
      <summary>Catalog coverage</summary>
      <p>
        Coverage counts measure recorded definitions. Source verification and
        functional coverage are checked separately.
      </p>
      <dl className="audit-list">
        {Object.entries(audit.counts).map(([key, value]) => (
          <div key={key}>
            <dt>{key.replace(/([A-Z])/g, " $1")}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <h4>Implementation and coverage gaps</h4>
      {gaps.length ? (
        <ul>
          {gaps.map((issue) => (
            <li key={issue.id}>{issue.message}</li>
          ))}
        </ul>
      ) : (
        <p>
          No catalog definition gaps detected by the independent inventory
          checks.
        </p>
      )}
      <h4>Primary source dependencies</h4>
      <p>
        {pending.length} source checks remain open. An option with an unverified
        source does not count as fully audited.
      </p>
      <ul>
        {pending.map((issue) => (
          <li key={issue.id}>{issue.message}</li>
        ))}
      </ul>
    </details>
  );
}

export function ImportReviewPanel({
  c,
  update,
}: {
  c: Character;
  update: (patch: Partial<Character>) => void;
}) {
  const overrides = Object.entries(c.sheetOverrides);
  return (
    <>
      {overrides.length > 0 && (
        <section className="detail-panel" id="sheet-overrides" tabIndex={-1}>
          <h3>Explicit sheet overrides</h3>
          <p>
            These imported or manually accepted values take priority over
            calculation. Clear an override to restore automatic updates.
          </p>
          <div className="override-list">
            {overrides.map(([key, value]) => (
              <div key={key}>
                <strong>{key}</strong>
                <span data-player-text>{value}</span>
                <button
                  className="quiet-button"
                  onClick={() => {
                    const next = { ...c.sheetOverrides };
                    delete next[key];
                    update({ sheetOverrides: next });
                  }}
                >
                  Restore calculated value
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
      {(c.importWarnings.length > 0 ||
        Object.keys(c.importedRawFields).length > 0) && (
        <section className="detail-panel" id="import-review" tabIndex={-1}>
          <h3>Imported sheet review</h3>
          {c.importWarnings.length > 0 && (
            <>
              <ul>
                {c.importWarnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
              <button
                className="quiet-button"
                onClick={() => update({ importWarnings: [] })}
              >
                Acknowledge imported sheet notes
              </button>
              <p>
                Acknowledging these notes does not clear current rules errors or
                explicit overrides.
              </p>
            </>
          )}
          <details>
            <summary>Original imported form values</summary>
            <dl className="audit-list">
              {Object.entries(c.importedRawFields).map(([key, value]) => (
                <div key={key}>
                  <dt data-player-text>{key}</dt>
                  <dd data-player-text>{value}</dd>
                </div>
              ))}
            </dl>
          </details>
        </section>
      )}
    </>
  );
}
