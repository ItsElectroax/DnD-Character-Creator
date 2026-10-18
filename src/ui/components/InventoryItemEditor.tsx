/** @jsxImportSource ../../i18n */
import { useId, type ReactNode } from "react";
import { findArmor, findEquipment } from "../../catalog/equipment";
import { type Character, type EquipmentEntry } from "../../engine/types";
import { getLocale } from "../../i18n/engine";
import { OptionEffects } from "./OptionEffects";

function InventoryField({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`field ${className}`}>
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}

export function InventoryItemEditor({
  c,
  item,
  update,
  open,
  onOpenChange,
  autofocus,
}: {
  c: Character;
  item: EquipmentEntry;
  update: (patch: Partial<Character>) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  autofocus: boolean;
}) {
  const id = useId();
  const definition = findEquipment(item.catalogId || item.name);
  const armor = findArmor(item.catalogId || item.name);
  const canonicalName = definition?.name === item.name;
  const name =
    getLocale() === "hr" && canonicalName && definition.nameHr
      ? `${definition.nameHr} (${item.name})`
      : item.name;
  const wornArmor = findArmor(c.equippedArmor);
  const equipped =
    armor?.kind === "armor"
      ? wornArmor?.id === armor.id
      : armor?.kind === "shield"
        ? c.equippedShield
        : Boolean(item.equipped);
  const edit = (
    patch: Partial<EquipmentEntry>,
    buildPatch: Partial<Character> = {},
  ) =>
    update({
      equipmentItems: c.equipmentItems.map((row) =>
        row.id === item.id ? { ...row, ...patch } : row,
      ),
      ...buildPatch,
    });
  const equip = (checked: boolean) => {
    if (checked && item.quantity <= 0) return;
    edit(
      { equipped: checked },
      armor?.kind === "armor"
        ? { equippedArmor: checked ? armor.name : "" }
        : armor?.kind === "shield"
          ? { equippedShield: checked }
          : {},
    );
  };
  return (
    <details className="inventory-item" open={open}>
      <summary
        onClick={(event) => {
          event.preventDefault();
          onOpenChange(!open);
        }}
      >
        <strong data-player-text={Boolean(item.name)}>
          {name || <span>Unnamed item</span>}
        </strong>
        <span className="inventory-quantity">
          <span>Qty</span> {item.quantity}
        </span>
        {equipped && <span className="inventory-equipped">Equipped</span>}
        <OptionEffects />
      </summary>
      <div className="inventory-editor-body">
        <div className="inventory-primary-fields">
          <InventoryField label="Item" className="inventory-name-field">
            <input
              autoFocus={autofocus}
              value={item.name}
              onChange={(event) => {
                const match = findEquipment(event.target.value);
                edit({ name: event.target.value, catalogId: match?.id });
              }}
              placeholder="Item name"
            />
          </InventoryField>
          <InventoryField label="Qty" className="inventory-qty-field">
            <input
              type="number"
              min="0"
              value={item.quantity}
              onChange={(event) =>
                edit({ quantity: Number(event.target.value) })
              }
            />
          </InventoryField>
          <div className="inventory-equip-field">
            <span className="field-label" id={`${id}-equipped`}>
              Equipment status
            </span>
            <label
              className={`check-row ${item.quantity <= 0 ? "gear-unavailable" : ""}`}
            >
              <input
                type="checkbox"
                aria-labelledby={`${id}-equipped`}
                checked={equipped}
                disabled={item.quantity <= 0}
                onChange={(event) => equip(event.target.checked)}
              />
              <span>Equipped</span>
              <OptionEffects />
            </label>
          </div>
          {definition?.kind === "weapon" && (
            <InventoryField
              label="Weapon mode"
              className="inventory-mode-field"
            >
              <select
                value={item.mode || ""}
                onChange={(event) =>
                  edit({
                    mode: event.target.value
                      ? (event.target.value as EquipmentEntry["mode"])
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
            </InventoryField>
          )}
        </div>
        <InventoryField label="Notes" className="inventory-notes-field">
          <input
            value={item.notes}
            onChange={(event) => edit({ notes: event.target.value })}
            placeholder="Equipped, carried, attunement…"
          />
        </InventoryField>
        <section
          className="inventory-acquisition"
          aria-labelledby={`${id}-acquisition`}
        >
          <h4 id={`${id}-acquisition`}>Source and acquisition</h4>
          <div className="inventory-acquisition-fields">
            <InventoryField label="Source">
              <input
                value={item.source}
                onChange={(event) => edit({ source: event.target.value })}
                placeholder="Class, background, found…"
              />
            </InventoryField>
            <InventoryField label="Class">
              <select
                value={item.className}
                onChange={(event) => edit({ className: event.target.value })}
              >
                <option value="">Not class-specific</option>
                {c.classes.map((name) => (
                  <option value={name} key={name}>
                    {name}
                  </option>
                ))}
              </select>
            </InventoryField>
            <InventoryField label="Class level">
              <input
                type="number"
                min="1"
                max="20"
                value={item.classLevel ?? ""}
                onChange={(event) =>
                  edit({
                    classLevel: event.target.value
                      ? Number(event.target.value)
                      : null,
                  })
                }
              />
            </InventoryField>
            <InventoryField label="Character level">
              <input
                type="number"
                min="1"
                max={c.level}
                value={item.characterLevel ?? ""}
                onChange={(event) =>
                  edit({
                    characterLevel: event.target.value
                      ? Number(event.target.value)
                      : null,
                  })
                }
              />
            </InventoryField>
          </div>
        </section>
        <div className="inventory-editor-footer">
          <button
            type="button"
            className="quiet-button inventory-remove spell-remove"
            onClick={() =>
              update({
                equipmentItems: c.equipmentItems.filter(
                  (row) => row.id !== item.id,
                ),
              })
            }
          >
            Remove item
          </button>
        </div>
      </div>
    </details>
  );
}
