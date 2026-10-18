/** @jsxImportSource ../../i18n */
import { useState } from "react";
import { abilities } from "../../catalog/proficiencies";
import { derive, formatMod } from "../../engine/character";
import { AttackEntry, Character } from "../../engine/types";
import {
  ArmorClassControl,
  CatalogInventory,
  EquippedGear,
  SpellPicker,
  StartingEquipmentPicker,
} from "../components/CreationControls";
import { InventoryItemEditor } from "../components/InventoryItemEditor";
import { OptionEffects } from "../components/OptionEffects";
import { Field, SectionTitle } from "../components/Shared";
export function StageGear({
  c,
  update,
  d,
}: {
  c: Character;
  update: (p: Partial<Character>) => void;
  d: ReturnType<typeof derive>;
}) {
  const first = d.initialClass;
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [newItemId, setNewItemId] = useState<string | null>(null);
  const addItem = () => {
    const id = crypto.randomUUID();
    setOpenItemId(id);
    setNewItemId(id);
    update({
      equipmentItems: [
        ...c.equipmentItems,
        {
          id,
          name: "",
          quantity: 1,
          source: "",
          characterLevel: 1,
          className: "",
          classLevel: null,
          notes: "",
        },
      ],
    });
  };
  const addAttack = () =>
    update({
      attacks: [
        ...c.attacks,
        {
          id: crypto.randomUUID(),
          name: "",
          attackBonus: "",
          damage: "",
          range: "",
          properties: "",
          ability: "",
          proficient: false,
          source: "",
        },
      ],
    });
  const editAttack = (id: string, patch: Partial<AttackEntry>) =>
    update({
      attacks: c.attacks.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    });
  return (
    <div className="stage-body">
      <SectionTitle
        title="Starting equipment & magic"
        note="Choose gear for the initial class and background. Later multiclass entries do not grant another class's starting package."
      />
      <StartingEquipmentPicker c={c} update={update} initial={first} />
      <EquippedGear c={c} update={update} d={d} />
      <CatalogInventory c={c} update={update} />
      <div className="detail-panel inventory-panel">
        <div className="section-title">
          <div>
            <h3>EQUIPMENT / QUANTITY / ACQUISITION</h3>
            <p>
              Keep each item separate so it can be mapped into the PDF inventory
              field with its quantity and source level.
            </p>
          </div>
          <button
            type="button"
            className="quiet-button inventory-add"
            onClick={addItem}
          >
            <span aria-hidden="true">＋</span> ADD ITEM
          </button>
        </div>
        {!c.equipmentItems.length && (
          <p className="not-applicable">
            No individual items entered yet. The starting class package above
            exports as its own inventory entry.
          </p>
        )}
        {c.equipmentItems.map((item) => (
          <InventoryItemEditor
            key={item.id}
            c={c}
            item={item}
            update={update}
            open={openItemId === item.id}
            autofocus={newItemId === item.id}
            onOpenChange={(open) =>
              setOpenItemId((previous) =>
                open ? item.id : previous === item.id ? null : previous,
              )
            }
          />
        ))}
      </div>
      <div className="detail-panel">
        <div className="section-title">
          <div>
            <h3>ATTACKS / AUTOMATIC FROM GEAR & LEVEL</h3>
            <p>
              Known weapons in your selected starting package and inventory are
              added automatically, along with Unarmed Strike. Ability,
              proficiency bonus, damage dice, Monk weapon scaling, and
              Dragonborn breath damage update from your current build. Add an
              entry below only for a spell, feature, or weapon not listed.
            </p>
          </div>
          <button className="quiet-button" onClick={addAttack}>
            ADD ATTACK
          </button>
        </div>
        <div className="attack-list">
          {d.attacks.map((item) => (
            <div key={item.id}>
              <strong>{item.name}</strong>
              <span>{item.calculatedBonus}</span>
              <span data-player-text={!item.id.startsWith("auto-")}>
                {item.damage || "Damage unset"}
              </span>
              <span>
                {[item.range, item.properties].filter(Boolean).join(" · ")}
              </span>
              <small>{item.source || "Automatic or manually recorded"}</small>
            </div>
          ))}
        </div>
        {c.equipment.some((item) =>
          /choose (?:one|a|any)|your choice|one simple weapon|one martial weapon/i.test(
            item,
          ),
        ) && (
          <p className="soft-note">
            Your selected package includes an unspecified weapon choice. Name
            the exact weapon under Equipment / Quantity / Acquisition to
            calculate its attack row.
          </p>
        )}
        {c.attacks.length > 0 && (
          <p className="soft-note">
            The editable entries below override the automatic row with the same
            name. Remove an override to return to automatic values.
          </p>
        )}
        {c.attacks.map((item, index) => (
          <div className="structured-row attack-edit-row" key={item.id}>
            <Field label={`Attack ${index + 1} name`}>
              <input
                value={item.name}
                onChange={(e) => editAttack(item.id, { name: e.target.value })}
                placeholder="Weapon or spell attack"
              />
            </Field>
            <Field label="Ability">
              <select
                value={item.ability}
                onChange={(e) =>
                  editAttack(item.id, { ability: e.target.value })
                }
              >
                <option value="">Auto from weapon and class</option>
                {abilities.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </Field>
            <Field label="Weapon mode">
              <select
                value={item.mode || ""}
                onChange={(event) =>
                  editAttack(item.id, {
                    mode: event.target.value
                      ? (event.target.value as AttackEntry["mode"])
                      : undefined,
                  })
                }
              >
                <option value="">Auto / one-handed</option>
                <option value="one-handed">One-handed</option>
                <option value="two-handed">Two-handed</option>
                <option value="thrown">Thrown</option>
                <option value="off-hand">Off-hand bonus attack</option>
              </select>
            </Field>
            <Field label="Attack bonus override">
              <input
                value={item.attackBonus}
                onChange={(e) =>
                  editAttack(item.id, { attackBonus: e.target.value })
                }
                placeholder={
                  d.attacks.find((attack) => attack.id === item.id)
                    ?.calculatedBonus || "Auto from ability + training"
                }
              />
            </Field>
            <label className="check-row compact-check">
              <input
                type="checkbox"
                checked={item.proficient}
                onChange={(e) =>
                  editAttack(item.id, { proficient: e.target.checked })
                }
              />
              <span>
                <strong>Proficient</strong>
              </span>
              <OptionEffects />
            </label>
            <Field label="Damage / type">
              <input
                value={item.damage}
                onChange={(e) =>
                  editAttack(item.id, { damage: e.target.value })
                }
                placeholder={
                  d.attacks.find((attack) => attack.id === item.id)?.damage
                    ? `Auto: ${d.attacks.find((attack) => attack.id === item.id)?.damage}`
                    : "Auto from weapon"
                }
              />
            </Field>
            <Field label="Range">
              <input
                value={item.range}
                onChange={(e) => editAttack(item.id, { range: e.target.value })}
                placeholder={
                  d.attacks.find((attack) => attack.id === item.id)?.range ||
                  "Auto from weapon"
                }
              />
            </Field>
            <Field label="Properties">
              <input
                value={item.properties}
                onChange={(e) =>
                  editAttack(item.id, { properties: e.target.value })
                }
                placeholder={
                  d.attacks.find((attack) => attack.id === item.id)
                    ?.properties || "Auto from weapon"
                }
              />
            </Field>
            <Field label="Granted by">
              <input
                value={item.source}
                onChange={(e) =>
                  editAttack(item.id, { source: e.target.value })
                }
                placeholder="Weapon, spell, or class feature"
              />
            </Field>
            <button
              className="remove-row"
              onClick={() =>
                update({ attacks: c.attacks.filter((x) => x.id !== item.id) })
              }
            >
              REMOVE
            </button>
          </div>
        ))}
      </div>
      <div className="gear-notes-and-spells">
        <details className="detail-panel inventory-notes">
          <summary>
            <strong>Other inventory notes</strong>
            <span>Notes and currency</span>
          </summary>
          <div className="inventory-notes-body">
            <p>Keep treasure or unstructured notes separate from item rows.</p>
            <Field label="Treasure / notes">
              <textarea
                rows={3}
                value={c.notes}
                onChange={(e) => update({ notes: e.target.value })}
                placeholder="Treasure, story items, or a reminder…"
              />
            </Field>
            <div className="currency-grid">
              {Object.entries(c.currency).map(([coin, value]) => (
                <Field key={coin} label={coin}>
                  <input
                    value={value}
                    onChange={(e) =>
                      update({
                        currency: { ...c.currency, [coin]: e.target.value },
                      })
                    }
                    inputMode="numeric"
                  />
                </Field>
              ))}
            </div>
          </div>
        </details>
        <SpellPicker c={c} update={update} d={d} />
      </div>
      <div className="combat-tracking-layout">
        <ArmorClassControl c={c} d={d} update={update} />
        <div className="player-tracking">
          <Field label="Current HP">
            <input
              value={c.hpCurrent}
              onChange={(e) => update({ hpCurrent: e.target.value })}
            />
          </Field>
          <Field label="Temporary HP">
            <input
              value={c.hpTemp}
              onChange={(e) => update({ hpTemp: e.target.value })}
            />
          </Field>
          <Field label="Experience points">
            <input
              value={c.xp}
              onChange={(e) => update({ xp: e.target.value })}
            />
          </Field>
          <label className="check-row compact-check">
            <input
              type="checkbox"
              checked={c.inspiration}
              onChange={(e) => update({ inspiration: e.target.checked })}
            />
            <span>
              <strong>Inspiration</strong>
            </span>
            <OptionEffects />
          </label>
        </div>
      </div>
      <div className="combat-preview">
        <div>
          <span>ARMOR CLASS</span>
          <strong>{d.ac}</strong>
          <small>{d.calculations.ac.formula}</small>
        </div>
        <div>
          <span>HIT POINTS</span>
          <strong>{d.hp}</strong>
          <small>Average after 1st level: {d.hitDice || "—"}</small>
        </div>
        <div>
          <span>INITIATIVE</span>
          <strong>{formatMod(d.initiative)}</strong>
          <small>{d.calculations.initiative.formula}</small>
        </div>
        <div>
          <span>HIT DICE</span>
          <strong>{d.hitDice || "—"}</strong>
          <small>By class level</small>
        </div>
      </div>
    </div>
  );
}
