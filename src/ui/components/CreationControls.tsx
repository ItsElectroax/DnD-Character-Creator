/** @jsxImportSource ../../i18n */
import { useId, useState } from "react";
import {
  armor,
  equipmentCatalog,
  findArmor,
  findEquipment,
  getBackgroundEquipment,
  getStartingEquipmentChoices,
  packs,
  startingWealthByClass,
} from "../../catalog/equipment";
import {
  findSpell,
  spellCatalog,
  type SpellDefinition,
} from "../../catalog/spells";
import {
  activeEquipmentItems,
  type Derived,
  isPatronSpell,
  isSpellChoiceAvailable,
  selectedBackground,
  skillReplacementPlans,
  spellChoiceSources,
} from "../../engine/character";
import { type Character, type EquipmentEntry } from "../../engine/types";
import { getLocale } from "../../i18n/engine";
import { OptionEffects } from "./OptionEffects";
type Props = { c: Character; update: (patch: Partial<Character>) => void };

export function StartingEquipmentPicker({
  c,
  update,
  initial,
}: { initial: string } & Props) {
  const background = getBackgroundEquipment(c.background, c.backgroundVariant);
  const backgroundToken = `background:${c.background}:${c.backgroundVariant}`;
  const groups = [
    ...getStartingEquipmentChoices(initial),
    ...background.choices,
  ];
  const regenerate = (tokens: string[]) => {
    const items: EquipmentEntry[] = [];
    const add = (name: string, quantity: number, groupId: string) => {
      const definition = findEquipment(name);
      const pack = packs.find((pack) => pack.name === name);
      if (pack) {
        for (const item of pack.contents)
          add(item.name, item.quantity * quantity, groupId);
        return;
      }
      const key = `start-${groupId}-${name}`;
      const existing = items.find((item) => item.id === key);
      if (existing) {
        existing.quantity += quantity;
        return;
      }
      const previous = c.equipmentItems.find((item) => item.id === key);
      items.push({
        ...previous,
        id: key,
        name,
        quantity,
        catalogId: definition?.id,
        source: groupId.startsWith("background-")
          ? `Background equipment: ${c.background}`
          : `Starting class: ${initial}`,
        className: groupId.startsWith("background-") ? "" : initial,
        classLevel: groupId.startsWith("background-") ? null : 1,
        characterLevel: 1,
        notes:
          previous?.notes ??
          definition?.description ??
          "PHB class starting equipment",
      });
    };
    for (const group of groups) {
      const option = group.options.find((option) =>
        tokens.includes(`start:${group.id}:${option.id}`),
      );
      if (!option) continue;
      for (const item of option.items) add(item.name, item.quantity, group.id);
      for (let index = 0; index < (option.chooseCount || 0); index++) {
        const selected = tokens
          .find((token) => token.startsWith(`pick:${group.id}:${index}:`))
          ?.split(":")
          .slice(3)
          .join(":");
        if (selected && option.chooseFrom?.includes(selected))
          add(selected, 1, group.id);
      }
    }
    if (tokens.includes(backgroundToken))
      for (const item of background.items)
        add(item.name, item.quantity, "background-fixed");
    update({
      equipment: tokens,
      equipmentItems: [
        ...c.equipmentItems.filter((item) => !item.id.startsWith("start-")),
        ...items,
      ],
    });
  };
  const methodControl = (
    <div className="equipment-method">
      <h3>Starting equipment method</h3>
      <div className="choice-grid">
        {(["package", "wealth"] as const).map((method) => (
          <label
            className={`skill-option ${c.equipmentMethod === method ? "skill-selected" : ""}`}
            key={method}
          >
            <input
              type="radio"
              name="equipment-method"
              checked={c.equipmentMethod === method}
              onChange={() => update({ equipmentMethod: method })}
            />
            <span>
              {method === "package"
                ? "Class and background equipment"
                : "Recorded starting gold"}
            </span>
            <OptionEffects />
          </label>
        ))}
      </div>
    </div>
  );
  if (c.equipmentMethod === "wealth") {
    const wealth = startingWealthByClass[initial];
    const spent = activeEquipmentItems(c).reduce(
      (sum, item) =>
        sum +
        (findEquipment(item.catalogId || item.name)?.costGp || 0) *
          item.quantity,
      0,
    );
    return (
      <div
        className="detail-panel equipment-choices"
        id="equipment-selections"
        tabIndex={-1}
      >
        {methodControl}
        <p>
          Starting gold replaces both class and background equipment. Record an
          actual roll; the app never rolls on your behalf.
        </p>
        {wealth && (
          <p>
            {wealth.dice} × {wealth.multiplier} gp · {wealth.sourceReference}
          </p>
        )}
        <label className="field">
          <span className="field-label">Recorded starting gold</span>
          <input
            inputMode="decimal"
            type="number"
            value={c.startingGold}
            onChange={(event) => update({ startingGold: event.target.value })}
          />
        </label>
        <p>
          Known inventory cost: {spent} gp. Record your remaining coins below
          after purchases. Items without a catalog price require review.
        </p>
        {c.equipmentItems.some((item) => item.id.startsWith("start-")) && (
          <>
            <p className="soft-note">
              Inactive class/background grants remain in inventory. Remove them
              before using the starting-gold alternative.
            </p>
            <button
              className="quiet-button"
              onClick={() =>
                update({
                  equipmentItems: c.equipmentItems.filter(
                    (item) => !item.id.startsWith("start-"),
                  ),
                })
              }
            >
              Remove inactive starting grants
            </button>
          </>
        )}
      </div>
    );
  }
  return (
    <div
      className="detail-panel equipment-choices"
      id="equipment-selections"
      tabIndex={-1}
    >
      {methodControl}
      <h3>Class starting equipment</h3>
      <p>
        Choose every group for your initial class. Packs expand into individual
        inventory items. Owning equipment does not equip it automatically.
      </p>
      {c.background && (
        <div className="background-equipment">
          <h4>Background equipment</h4>
          <p>
            {background.items
              .map((item) => `${item.quantity} × ${item.name}`)
              .join(" · ")}{" "}
            · {background.currency.gp} gp
          </p>
          {background.note && <p className="soft-note">{background.note}</p>}
          <button
            className="quiet-button"
            disabled={c.equipment.includes(backgroundToken)}
            onClick={() => {
              const previous = Number(
                c.equipment
                  .find((token) => token.startsWith("background-gp:"))
                  ?.split(":")[1] || 0,
              );
              regenerate([
                ...c.equipment.filter(
                  (token) =>
                    !token.startsWith("background:") &&
                    !token.startsWith("background-gp:"),
                ),
                backgroundToken,
                `background-gp:${background.currency.gp}`,
              ]);
              update({
                currency: {
                  ...c.currency,
                  GP: String(
                    (Number(c.currency.GP) || 0) -
                      previous +
                      background.currency.gp,
                  ),
                },
              });
            }}
          >
            Apply background equipment
          </button>
        </div>
      )}
      {groups.map((group) => {
        const selected = group.options.find((option) =>
          c.equipment.includes(`start:${group.id}:${option.id}`),
        );
        return (
          <fieldset key={group.id}>
            <legend>{group.title}</legend>
            <div className="choice-grid">
              {group.options.map((option) => (
                <label
                  className={`skill-option ${selected?.id === option.id ? "skill-selected" : ""}`}
                  key={option.id}
                >
                  <input
                    type="radio"
                    name={group.id}
                    checked={selected?.id === option.id}
                    onChange={() =>
                      regenerate([
                        ...c.equipment
                          .filter(
                            (token) =>
                              token.startsWith("start:") ||
                              token.startsWith("pick:") ||
                              token.startsWith("background:") ||
                              token.startsWith("background-gp:"),
                          )
                          .filter(
                            (token) =>
                              !token.startsWith(`start:${group.id}:`) &&
                              !token.startsWith(`pick:${group.id}:`),
                          ),
                        `start:${group.id}:${option.id}`,
                      ])
                    }
                  />
                  <span>
                    <strong>{option.label}</strong>
                    <small>
                      {option.items
                        .map((item) => `${item.quantity} × ${item.name}`)
                        .join(" · ")}
                    </small>
                  </span>
                  <OptionEffects />
                </label>
              ))}
            </div>
            {selected?.chooseFrom &&
              Array.from({ length: selected.chooseCount || 1 }, (_, index) => (
                <label className="field" key={index}>
                  <span className="field-label">Choose item {index + 1}</span>
                  <select
                    value={
                      c.equipment
                        .find((token) =>
                          token.startsWith(`pick:${group.id}:${index}:`),
                        )
                        ?.split(":")
                        .slice(3)
                        .join(":") || ""
                    }
                    onChange={(event) =>
                      regenerate([
                        ...c.equipment.filter(
                          (token) =>
                            !token.startsWith(`pick:${group.id}:${index}:`),
                        ),
                        `pick:${group.id}:${index}:${event.target.value}`,
                      ])
                    }
                  >
                    <option value="">Choose an item</option>
                    {selected.chooseFrom!.map((name) => (
                      <option value={name} key={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            <small className="source-note">{group.sourceReference}</small>
          </fieldset>
        );
      })}
      <details>
        <summary>Pack contents</summary>
        {packs.map((pack) => (
          <div key={pack.id}>
            <strong>{pack.name}</strong>
            <p>
              {pack.contents
                .map((item) => `${item.quantity} × ${item.name}`)
                .join(" · ")}
            </p>
          </div>
        ))}
      </details>
      {selectedBackground(c) && (
        <p className="soft-note">
          Background equipment is additional to class equipment. Check the
          background inventory choices below.
        </p>
      )}
    </div>
  );
}

export function ArmorClassControl({ c, d, update }: Props & { d: Derived }) {
  const valueId = useId();
  const helpId = useId();
  const override = c.sheetOverrides?.ac?.trim()
    ? c.sheetOverrides.ac
    : c.acOverride;
  const changeOverride = (value: string) => {
    const sheetOverrides = { ...c.sheetOverrides };
    delete sheetOverrides.ac;
    update({ acOverride: value, sheetOverrides });
  };
  return (
    <div className="automatic-ac-control">
      <span className="field-label" id={valueId}>
        Armor Class · automatic
      </span>
      <output
        className="automatic-ac-value"
        aria-labelledby={valueId}
        aria-describedby={helpId}
      >
        {d.automaticAC.value}
      </output>
      <small id={helpId}>{d.automaticAC.formula}</small>
      <small>
        Calculated from your equipped gear, abilities, and applicable features.
        Change your equipped gear above to update it.
      </small>
      <details
        className="ac-override-editor"
        open={Boolean(override) || undefined}
      >
        <summary>Manual AC override (optional)</summary>
        <label className="field">
          <span className="field-label">Override Armor Class</span>
          <input
            inputMode="numeric"
            value={override}
            onChange={(event) => changeOverride(event.target.value)}
          />
          <small>
            Use only for a DM-approved adjustment or an imported value. Blank
            uses the automatic calculation.
          </small>
        </label>
        {override && (
          <button
            type="button"
            className="quiet-button"
            onClick={() => changeOverride("")}
          >
            Use automatic AC
          </button>
        )}
      </details>
    </div>
  );
}

export function EquippedGear({ c, d, update }: Props & { d: Derived }) {
  const armorHintId = useId();
  const shieldHintId = useId();
  const owned = new Set(
    activeEquipmentItems(c)
      .filter((item) => item.quantity > 0)
      .map((item) => findArmor(item.catalogId || item.name)?.id),
  );
  const hasShield = armor.some(
    (item) => item.kind === "shield" && owned.has(item.id),
  );
  const hasArmor = armor.some(
    (item) => item.kind === "armor" && owned.has(item.id),
  );
  const equippedArmor = findArmor(c.equippedArmor);
  const missingArmor = Boolean(
    c.equippedArmor &&
    (equippedArmor?.kind !== "armor" || !owned.has(equippedArmor.id)),
  );
  const armorHint = missingArmor
    ? "This saved armor selection is not in your active inventory. Choose No armor or add the armor to your inventory."
    : !hasArmor
      ? "Add armor to your inventory to make it available here."
      : "";
  return (
    <div className="detail-panel" id="equipped-armor" tabIndex={-1}>
      <h3>Equipped gear and hit points</h3>
      <div className="form-grid">
        <label className="field">
          <span className="field-label">Armor worn</span>
          <select
            value={
              equippedArmor?.kind === "armor"
                ? equippedArmor.name
                : c.equippedArmor
            }
            aria-describedby={armorHint ? armorHintId : undefined}
            aria-invalid={missingArmor || undefined}
            onChange={(event) => {
              const value = event.target.value;
              const item = findArmor(value);
              if (!value || (item?.kind === "armor" && owned.has(item.id)))
                update({ equippedArmor: value });
            }}
          >
            <option value="">No armor</option>
            {c.equippedArmor && equippedArmor?.kind !== "armor" && (
              <option value={c.equippedArmor} disabled data-player-text>
                {c.equippedArmor}
              </option>
            )}
            {armor
              .filter((item) => item.kind === "armor")
              .map((item) => (
                <option
                  value={item.name}
                  key={item.id}
                  disabled={!owned.has(item.id)}
                >
                  {item.name}
                  {owned.has(item.id) ? "" : " — not in inventory"}
                </option>
              ))}
          </select>
          {armorHint && (
            <small className="field-hint" id={armorHintId}>
              {armorHint}
            </small>
          )}
        </label>
        <div className="equipped-shield-field">
          <label className={`check-row ${hasShield ? "" : "gear-unavailable"}`}>
            <input
              type="checkbox"
              checked={c.equippedShield}
              disabled={!hasShield}
              aria-describedby={!hasShield ? shieldHintId : undefined}
              onChange={(event) => {
                if (hasShield || !event.target.checked)
                  update({ equippedShield: event.target.checked });
              }}
            />
            <span>
              Shield equipped
              {!hasShield && (
                <small id={shieldHintId}>
                  Add a shield to your inventory to equip it.
                </small>
              )}
            </span>
            <OptionEffects />
          </label>
          {!hasShield && c.equippedShield && (
            <button
              type="button"
              className="quiet-button gear-clear"
              onClick={() => update({ equippedShield: false })}
            >
              Unequip shield
            </button>
          )}
        </div>
        <label className="field">
          <span className="field-label">Hit point method</span>
          <select
            value={c.hpMethod}
            onChange={(event) =>
              update({ hpMethod: event.target.value as Character["hpMethod"] })
            }
          >
            <option value="average">Fixed average</option>
            <option value="rolled">Recorded rolls</option>
          </select>
        </label>
      </div>
      {c.hpMethod === "rolled" && (
        <div className="choice-grid">
          {Array.from(
            { length: Math.max(0, c.level - 1) },
            (_, index) => index + 2,
          ).map((level) => (
            <label className="field" key={level}>
              <span className="field-label">HP die roll · level {level}</span>
              <input
                inputMode="numeric"
                type="number"
                min="1"
                max="12"
                value={c.hpRolls[level] ?? ""}
                onChange={(event) => {
                  const rolls = { ...c.hpRolls };
                  if (event.target.value === "") delete rolls[level];
                  else rolls[level] = Number(event.target.value);
                  update({ hpRolls: rolls });
                }}
              />
            </label>
          ))}
        </div>
      )}
      <p className="calculation-note">
        AC {d.ac}: {d.calculations.ac.formula}
      </p>
      <p className="calculation-note">
        HP {d.hp}: {d.calculations.hp.formula}
      </p>
      {d.armorNotes.map((note) => (
        <p className="soft-note" key={note}>
          {note}
        </p>
      ))}
    </div>
  );
}

export function CatalogInventory({ c, update }: Props) {
  const [query, setQuery] = useState("");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const visible = equipmentCatalog.filter((item) =>
    `${item.name} ${item.nameHr || ""}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <details className="detail-panel">
      <summary>Equipment catalogue</summary>
      <label className="field">
        <span className="field-label">Search equipment</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <div className="catalog-results equipment-results">
        {visible.map((item) => (
          <details
            className="catalog-result equipment-option"
            key={item.id}
            open={expandedItem === item.id}
          >
            <summary
              onClick={(event) => {
                event.preventDefault();
                setExpandedItem((previous) =>
                  previous === item.id ? null : item.id,
                );
              }}
            >
              <strong>
                {getLocale() === "hr" && item.nameHr
                  ? `${item.nameHr} (${item.name})`
                  : item.name}
              </strong>
              <span>{`${item.costGp} gp · ${item.weightLb} lb.`}</span>
              <OptionEffects />
            </summary>
            <p>
              {getLocale() === "hr" && item.descriptionHr
                ? item.descriptionHr
                : item.description}
            </p>
            <small>
              {`${item.costGp} gp · ${item.weightLb} lb. · ${item.sourceReference}`}
            </small>
            <button
              type="button"
              className="quiet-button"
              onClick={() =>
                update({
                  equipmentItems: [
                    ...c.equipmentItems,
                    {
                      id: crypto.randomUUID(),
                      catalogId: item.id,
                      name: item.name,
                      quantity: 1,
                      source: "Inventory selection",
                      className: "",
                      classLevel: null,
                      characterLevel: null,
                      notes: "",
                    },
                  ],
                })
              }
            >
              ADD ITEM
            </button>
          </details>
        ))}
      </div>
    </details>
  );
}

export function SpellPicker({ c, d, update }: Props & { d: Derived }) {
  const pickerId = useId();
  const [expandedSpell, setExpandedSpell] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [source, setSource] = useState(d.spellcasting[0]?.source || "");
  const [levelFilter, setLevelFilter] = useState("");
  const [status, setStatus] =
    useState<Character["spellSelections"][number]["status"]>("known");
  const sourceChoices = spellChoiceSources(c);
  const unavailableSelections = c.spellSelections.filter(
    (pick) => !isSpellChoiceAvailable(c, pick),
  );
  const actualSource = sourceChoices.includes(source)
    ? source
    : sourceChoices[0] || "";
  const profile = d.spellcasting.find(
    (profile) => profile.source === actualSource,
  );
  const className = actualSource.includes("High Elf")
    ? "Wizard"
    : actualSource.includes("Nature Domain") ||
        actualSource === "Circle of the Land"
      ? "Druid"
      : ["Fighter", "Rogue"].includes(actualSource)
        ? "Wizard"
        : ["Spell Mastery", "Signature Spells"].includes(actualSource)
          ? "Wizard"
          : actualSource.includes(": ")
            ? actualSource.split(": ")[1]
            : actualSource;
  const secretsMax = actualSource.startsWith("Magical Secrets")
    ? { 10: 5, 14: 7, 18: 9 }[
        Number(actualSource.split("Bard ")[1]) as 10 | 14 | 18
      ]
    : actualSource === "Additional Magical Secrets"
      ? 3
      : actualSource === "Spell Mastery"
        ? 2
        : actualSource === "Signature Spells"
          ? 3
          : undefined;
  const max =
    secretsMax ??
    profile?.maxSpellLevel ??
    (actualSource.startsWith("Magic Initiate")
      ? 1
      : actualSource === "Book of Ancient Secrets"
        ? Math.max(1, Math.ceil((d.classLevels.Warlock || 0) / 2))
        : actualSource.startsWith("Ritual Caster")
          ? Math.max(1, Math.ceil(c.level / 2))
          : 0);
  const allowedStatuses: Character["spellSelections"][number]["status"][] =
    actualSource.startsWith("Ritual Caster") ||
    actualSource === "Book of Ancient Secrets"
      ? ["ritual"]
      : profile?.source === "Wizard"
        ? ["spellbook", "prepared"]
        : profile?.preparedLimit !== null &&
            profile?.preparedLimit !== undefined
          ? ["prepared"]
          : profile?.source === "Warlock" && profile.classLevel >= 11
            ? ["known", "arcanum"]
            : ["known"];
  const actualStatus = allowedStatuses.includes(status)
    ? status
    : allowedStatuses[0];
  const visible = spellCatalog.filter(
    (spell) =>
      (!query ||
        `${spell.name} ${spell.nameHr || ""}`
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (!levelFilter || spell.level === Number(levelFilter)) &&
      (!actualSource ||
        [
          "Pact of the Tome",
          "Book of Ancient Secrets",
          "Additional Magical Secrets",
        ].includes(actualSource) ||
        actualSource.startsWith("Magical Secrets") ||
        spell.classes.includes(className) ||
        (actualSource === "Warlock" && isPatronSpell(c, spell.name))),
  );
  const selected = c.spellSelections.filter(
    (pick) => pick.source === actualSource,
  );
  // Cantrips are always known; the status selector controls leveled spells.
  const spellStatus = (spell: SpellDefinition) =>
    spell.level === 0 && actualStatus !== "ritual" ? "known" : actualStatus;
  const selectionState = (spell: SpellDefinition) => {
    const pickStatus = spellStatus(spell);
    const chosen = selected.some(
      (pick) => pick.spellId === spell.id && pick.status === pickStatus,
    );
    const levelOf = (pick: Character["spellSelections"][number]) =>
      findSpell(pick.spellId)?.level;
    const count = (
      matches: (pick: Character["spellSelections"][number]) => boolean,
    ) => new Set(selected.filter(matches).map((pick) => pick.spellId)).size;
    let reason = "";
    if (spell.level > max && pickStatus !== "arcanum")
      reason = "Unavailable at this source’s current class level.";
    else if (
      pickStatus === "arcanum" &&
      (spell.level < 6 ||
        spell.level >
          Math.min(9, 6 + Math.floor(((profile?.classLevel || 0) - 11) / 2)))
    )
      reason =
        "This spell is not available as Mystic Arcanum at this class level.";
    else if (pickStatus === "ritual" && (!spell.ritual || spell.level === 0))
      reason = "This spell is not a ritual.";
    else if (
      actualSource.startsWith("Spell Sniper") &&
      (spell.level !== 0 || !spell.attack)
    )
      reason = "Spell Sniper requires a cantrip with an attack roll.";
    else if (
      profile?.source === "Wizard" &&
      pickStatus === "prepared" &&
      !d.resolvedSpells.some(
        (pick) =>
          pick.spellId === spell.id &&
          pick.status === "spellbook" &&
          (pick.source === "Wizard" || pick.source.startsWith("Wizard:")),
      )
    )
      reason = "Add this spell to your spellbook before preparing it.";
    else if (actualSource === "Spell Mastery" && ![1, 2].includes(spell.level))
      reason = "Spell Mastery requires one 1st-level and one 2nd-level spell.";
    else if (actualSource === "Signature Spells" && spell.level !== 3)
      reason = "Signature Spells requires 3rd-level spells.";

    if (!reason && !chosen) {
      const cantripLimit =
        profile?.cantripsKnown ??
        (actualSource === "Pact of the Tome"
          ? 3
          : actualSource.startsWith("Magic Initiate")
            ? 2
            : ["High Elf", "Nature Domain", "Circle of the Land"].includes(
                  actualSource,
                ) || actualSource.startsWith("Spell Sniper")
              ? 1
              : null);
      if (
        spell.level === 0 &&
        cantripLimit !== null &&
        count((pick) => levelOf(pick) === 0) >= cantripLimit
      )
        reason =
          "Cantrip limit reached for this source. Remove a cantrip before adding another.";
      else if (
        pickStatus === "prepared" &&
        profile?.preparedLimit !== null &&
        profile?.preparedLimit !== undefined &&
        count(
          (pick) => pick.status === "prepared" && (levelOf(pick) ?? 0) > 0,
        ) >= profile.preparedLimit
      )
        reason =
          "Prepared spell limit reached. Unprepare a spell before adding another.";
      else if (
        spell.level > 0 &&
        pickStatus === "known" &&
        profile?.spellsKnown !== null &&
        profile?.spellsKnown !== undefined &&
        count((pick) => pick.status === "known" && (levelOf(pick) ?? 0) > 0) >=
          profile.spellsKnown -
            (actualSource === "Bard"
              ? [10, 14, 18].filter((level) => profile.classLevel >= level)
                  .length * 2
              : 0)
      )
        reason =
          "Known spell limit reached. Remove a spell before adding another.";
      else if (
        pickStatus === "arcanum" &&
        count(
          (pick) => pick.status === "arcanum" && levelOf(pick) === spell.level,
        ) >= 1
      )
        reason =
          "You already chose a Mystic Arcanum of this level. Remove it before choosing another.";
      else if (
        (actualSource.startsWith("Magic Initiate") &&
          spell.level > 0 &&
          count((pick) => levelOf(pick) === 1) >= 1) ||
        ((actualSource.startsWith("Magical Secrets") ||
          actualSource === "Additional Magical Secrets" ||
          actualSource === "Signature Spells") &&
          count(() => true) >= 2) ||
        (actualSource === "Spell Mastery" &&
          count((pick) => levelOf(pick) === spell.level) >= 1)
      )
        reason =
          "Feature spell limit reached. Remove a spell before adding another.";
    }
    return { chosen, pickStatus, reason };
  };
  const toggle = (spellId: string) => {
    const spell = findSpell(spellId);
    if (!spell) return;
    const { chosen, pickStatus, reason } = selectionState(spell);
    if (!chosen && reason) return;
    const found = c.spellSelections.find(
      (pick) =>
        pick.spellId === spellId &&
        pick.source === actualSource &&
        pick.status === pickStatus,
    );
    update({
      spellSelections: found
        ? c.spellSelections.filter((pick) => pick !== found)
        : [
            ...c.spellSelections,
            { spellId, source: actualSource, status: pickStatus },
          ],
      spells: c.spells.filter(
        (name) => findSpell(name)?.id !== spellId && name !== spellId,
      ),
    });
  };
  return (
    <div className="detail-panel" id="spell-selections" tabIndex={-1}>
      <h3>Spellcasting</h3>
      <p>
        Each spell keeps its granting class or feature. Higher multiclass slots
        do not unlock higher-level spells for an individual class.
      </p>
      {d.spellcasting.map((caster) => (
        <div className="spellcasting-profile" key={caster.source}>
          <strong>
            {caster.source} · level {caster.classLevel}
          </strong>
          <p>
            {caster.ability} · Save DC {caster.saveDC} · spell attack +
            {caster.attackBonus} · {`${caster.cantripsKnown} cantrips`}
            {caster.spellsKnown !== null
              ? ` · ${caster.spellsKnown} spells known`
              : ""}
            {caster.preparedLimit !== null
              ? ` · prepare up to ${caster.preparedLimit}`
              : ""}
          </p>
          <small>{caster.recovery}</small>
        </div>
      ))}
      {sourceChoices.length > 0 ? (
        <>
          <div className="form-grid">
            <label className="field">
              <span className="field-label">Spell source</span>
              <select
                value={actualSource}
                onChange={(event) => setSource(event.target.value)}
              >
                {sourceChoices.map((name) => (
                  <option value={name} key={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field-label">Spell status</span>
              <select
                aria-label="Spell status"
                aria-describedby={`${pickerId}-status-help`}
                value={actualStatus}
                onChange={(event) =>
                  setStatus(event.target.value as typeof status)
                }
              >
                {allowedStatuses.map((value) => (
                  <option value={value} key={value}>
                    {value === "spellbook"
                      ? "Spellbook"
                      : value === "arcanum"
                        ? "Arcanum"
                        : value.charAt(0).toUpperCase() + value.slice(1)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field-label">Search PHB spells</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <label className="field">
              <span className="field-label">Spell level</span>
              <select
                value={levelFilter}
                onChange={(event) => setLevelFilter(event.target.value)}
              >
                <option value="">All spell levels</option>
                {Array.from({ length: 10 }, (_, level) => (
                  <option value={level} key={level}>
                    {level === 0 ? "Cantrip" : `Level ${level}`}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="soft-note" id={`${pickerId}-status-help`}>
            {actualStatus === "ritual"
              ? "Choose ritual spells for this source."
              : profile?.source === "Wizard"
                ? "Add leveled spells to your spellbook, then switch to Prepared to choose your daily spells. Cantrips are always recorded as Known."
                : "This status applies to leveled spells. Cantrips are always recorded as Known."}
          </p>
          <div className="selected-spells">
            {selected.map((pick) => (
              <button
                className="quiet-button spell-remove"
                key={`${pick.spellId}-${pick.status}`}
                onClick={() =>
                  update({
                    spellSelections: c.spellSelections.filter(
                      (item) => item !== pick,
                    ),
                  })
                }
              >
                {findSpell(pick.spellId)?.name || pick.spellId} · {pick.status}{" "}
                ×
                <OptionEffects />
              </button>
            ))}
          </div>
          <div className="catalog-results spell-results">
            {visible.map((spell) => {
              const { chosen, reason: unavailableReason } =
                selectionState(spell);
              const unavailable = !chosen && Boolean(unavailableReason);
              const reasonId = `${pickerId}-${spell.id}-reason`;
              return (
                <details
                  className={`spell-detail ${chosen ? "selected" : ""}`}
                  key={spell.id}
                  open={expandedSpell === spell.id}
                >
                  <summary
                    onClick={(event) => {
                      event.preventDefault();
                      setExpandedSpell((previous) =>
                        previous === spell.id ? null : spell.id,
                      );
                    }}
                  >
                    <strong>
                      {getLocale() === "hr" && spell.nameHr
                        ? `${spell.nameHr} (${spell.name})`
                        : spell.name}
                    </strong>
                    <span>
                      {spell.level === 0 ? "Cantrip" : `Level ${spell.level}`} ·{" "}
                      {spell.school}
                      {chosen ? " ✓" : ""}
                    </span>
                    <OptionEffects />
                  </summary>
                  <p>
                    {getLocale() === "hr" && spell.descriptionHr
                      ? spell.descriptionHr
                      : spell.description}
                  </p>
                  <dl>
                    <dt>Casting time</dt>
                    <dd>
                      {spell.castingTime || "Source verification required"}
                    </dd>
                    <dt>Range</dt>
                    <dd>{spell.range || "Source verification required"}</dd>
                    <dt>Components</dt>
                    <dd>
                      {spell.components || "Source verification required"}
                    </dd>
                    <dt>Duration</dt>
                    <dd>
                      {spell.duration || "Source verification required"}
                      {spell.concentration ? " · Concentration" : ""}
                      {spell.ritual ? " · Ritual" : ""}
                    </dd>
                  </dl>
                  {spell.verification === "source-verification-needed" && (
                    <p className="soft-note">
                      {spell.metadataReference
                        ? "These spell details are checked against the official 2014 listing. The full rules summary still needs verification against the PHB."
                        : "Source verification required — this option is not counted as fully audited."}
                    </p>
                  )}
                  {spell.metadataReference && (
                    <small>
                      <a
                        href={spell.metadataReference}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Official 2014 spell details
                      </a>
                    </small>
                  )}
                  {unavailable && (
                    <p className="soft-note" id={reasonId}>
                      {unavailableReason}
                    </p>
                  )}
                  <small>{spell.sourceReference}</small>
                  <button
                    type="button"
                    className={`quiet-button ${chosen ? "spell-remove" : "spell-add"}`}
                    disabled={unavailable}
                    aria-describedby={unavailable ? reasonId : undefined}
                    onClick={() => toggle(spell.id)}
                  >
                    {chosen ? "REMOVE" : "Select spell"}
                  </button>
                </details>
              );
            })}
          </div>
        </>
      ) : (
        <p>No selectable spell source is unlocked yet.</p>
      )}
      {d.resolvedSpells.filter((spell) => spell.automatic).length > 0 && (
        <details>
          <summary>Automatically granted spells</summary>
          {d.resolvedSpells
            .filter((spell) => spell.automatic)
            .map((spell) => (
              <p key={`${spell.spellId}-${spell.source}`}>
                {spell.name} · {spell.source} · {spell.uses}
              </p>
            ))}
        </details>
      )}
      {unavailableSelections.length > 0 && (
        <section className="detail-panel">
          <h4>Spells to review</h4>
          <p>
            These retained choices are unavailable for the current race, class,
            or level. They grant no spell benefits. Remove them here or restore
            their granting choice.
          </p>
          <div className="generated-feature-list">
            {unavailableSelections.map((pick, index) => (
              <div
                className="section-title"
                key={`${pick.source}-${pick.status}-${pick.spellId}-${index}`}
              >
                <div>
                  <strong>
                    {findSpell(pick.spellId)?.name || pick.spellId}
                  </strong>
                  <small>{pick.source}</small>
                </div>
                <button
                  type="button"
                  className="quiet-button spell-remove"
                  onClick={() =>
                    update({
                      spellSelections: c.spellSelections.filter(
                        (item) => item !== pick,
                      ),
                    })
                  }
                >
                  REMOVE
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
      {c.spells.length > 0 && (
        <p className="soft-note">
          Legacy spells without a recorded source:{" "}
          <span data-player-text>{c.spells.join(", ")}</span>. Assign them above
          so access can be validated.
        </p>
      )}
      <label className="field">
        <span className="field-label">Spellcasting note</span>
        <textarea
          value={c.spellNotes}
          onChange={(event) => update({ spellNotes: event.target.value })}
        />
      </label>
    </div>
  );
}

export function SkillReplacementPicker({
  c,
  update,
  stage,
}: Props & { stage: 4 | 5 }) {
  const plans = skillReplacementPlans(c).filter((plan) => plan.stage === stage);
  if (!plans.length) return null;
  return (
    <section
      className="detail-panel"
      id={`skill-replacements-${stage}`}
      tabIndex={-1}
    >
      <h3>Duplicate skill replacements</h3>
      <p>
        If two sources grant the same skill proficiency, choose a different
        skill instead. This keeps both training sources without adding the
        proficiency bonus twice.
      </p>
      <div className="form-grid">
        {plans.map((plan) => (
          <label className="field" key={plan.key}>
            <span className="field-label">{plan.label}</span>
            <select
              value={c.skillReplacementChoices?.[plan.key] || ""}
              onChange={(event) =>
                update({
                  skillReplacementChoices: {
                    ...c.skillReplacementChoices,
                    [plan.key]: event.target.value,
                  },
                })
              }
            >
              <option value="">Choose a replacement skill</option>
              {plan.options.map((name) => (
                <option value={name} key={name}>
                  {name}
                </option>
              ))}
            </select>
            <small>
              {plan.source} · character level {plan.characterLevel ?? "unknown"}
            </small>
          </label>
        ))}
      </div>
    </section>
  );
}
