# Race and class audit — 2014 rules

Updated 18 October 2026. This report distinguishes executable coverage checks from independent source verification. Passing the application checks does not certify every PHB paragraph.

## Evidence and source limits

Primary sources opened during this audit:

- [Official 2014 Basic Rules: Races](https://www.dndbeyond.com/sources/dnd/basic-rules-2014/races).
- [Official 2014 Basic Rules: Classes](https://www.dndbeyond.com/sources/dnd/basic-rules-2014/classes).
- [Official PHB errata, 2021](https://media.wizards.com/2021/dnd/downloads/PH-Errata.pdf).

The open race chapter covers all nine families but omits the full Drow and Forest Gnome trait entries. The class chapter includes the twelve base classes and one detailed subclass per class: Berserker, Lore, Life, Land, Champion, Open Hand, Devotion, Hunter, Thief, Draconic Bloodline, Fiend and Evocation. Names of other subclasses appearing in that chapter do not constitute access to their full rules.

Attempts to open the 2014 PHB race/class compendium routes returned a purchase redirect or an error. The other 28 subclasses, Drow and Forest Gnome therefore retain a full-source comparison gap. Their internal controls, unlock tables, descriptions and derived output were still checked. Moon Druid CR correction reconciles the existing catalog's Circle Forms rule with its resource views; it is not claimed as a newly completed open-source PHB comparison.

## Race/lineage checklist

Every row below passes the automated lineage matrix: fixed and selected ability increases, unique trait names/IDs, and no overlapping darkvision entries. The Origin cards and the two flexible-ability editors use the same calculated increases and eligibility.

| Family | Lineages/options checked | Targeted checks |
| --- | --- | --- |
| Dwarf | Hill, Mountain | CON/secondary bonuses; toughness by total level; tool and armor grants |
| Elf | High, Wood, Drow | INT/WIS/CHA bonuses; High Elf cantrip resolution; Wood speed; replacement Drow darkvision |
| Halfling | Lightfoot, Stout | DEX/secondary bonuses; size/speed; distinct stealth/resilience traits |
| Human | Standard, Variant | Six bonuses versus two selected bonuses; skill/feat requirements; optional-rule validation |
| Dragonborn | Black, Blue, Brass, Bronze, Copper, Gold, Green, Red, Silver, White | One ancestry control; saved-card compatibility; damage type, shape/save and breath scaling |
| Gnome | Forest, Rock | INT/secondary bonuses; illusion spell ability; distinct tool/communication traits |
| Half-Elf | Half-Elf | CHA excluded from both flexible pickers; two distinct other abilities; two skills; language count |
| Half-Orc | Half-Orc | STR/CON; Intimidation; distinct endurance/critical traits |
| Tiefling | Tiefling | CHA/INT; racial spell unlocks at total levels 1/3/5; Hellish Rebuke at spell level 2 |

Total: **9 families, 24 selectable lineages/ancestries**. This count includes the ten Dragonborn ancestry cards, not ten separate races.

## Class and subclass checklist

For each class, all 20 resource rows have independent progression expectations. For every subclass, every level from 1 through 20 is derived and checked for acquired features only, unique feature IDs, eligible choice plans and correct before/at-unlock behavior. Level reductions are also checked without changing retained draft data.

| Class | Levels | Subclasses covered by the structural/derived matrix |
| --- | --- | --- |
| Barbarian | 1–20 | Berserker; Totem Warrior |
| Bard | 1–20 | Lore; Valor |
| Cleric | 1–20 | Knowledge; Life; Light; Nature; Tempest; Trickery; War |
| Druid | 1–20 | Land; Moon |
| Fighter | 1–20 | Champion; Battle Master; Eldritch Knight |
| Monk | 1–20 | Open Hand; Shadow; Four Elements |
| Paladin | 1–20 | Devotion; Ancients; Vengeance |
| Ranger | 1–20 | Hunter; Beast Master |
| Rogue | 1–20 | Thief; Assassin; Arcane Trickster |
| Sorcerer | 1–20 | Draconic Bloodline; Wild Magic |
| Warlock | 1–20 | Archfey; Fiend; Great Old One |
| Wizard | 1–20 | Abjuration; Conjuration; Divination; Enchantment; Evocation; Illusion; Necromancy; Transmutation |

Totals: **240 base-class level rows and 800 subclass/level states**. This is deterministic coverage of the application branches, not every possible race/class/feat/spell combination.

## Confirmed corrections

- The selected lineage's ability summary now includes its base and lineage increases. Variant Human no longer shows the standard Human increase there.
- Both Half-Elf ability editors exclude Charisma. Clearing the first flexible slot leaves the second slot in place.
- Drow's 120-foot darkvision replaces the inherited 60-foot entry. Sunlight Sensitivity now distinguishes attack rolls from sight-dependent Perception checks. The Elf family summary correctly calls magical sleep immunity an immunity.
- A valid High Elf cantrip selection resolves its feature marker. Innate racial descriptions separate future unlocks from what is available now.
- Monk timeline notes use Wisdom and require no shield. Moon Druid's resolved CR is shared by the feature descriptions and timeline. Level-1 Cleric/Druid/Paladin summaries no longer describe resources they have not acquired; Druid 20 shows unlimited Wild Shape uses.
- Sorcerer ancestry help no longer attributes damage resistance to Draconic Resilience. Beast Master command summaries follow the errata's Dodge and Multiattack changes.
- Ranger's humanoid option opens two specific race fields. Suggestions are optional: a specific table-appropriate humanoid race can be entered. Duplicate races are caught across acquisitions. The generic humanoid parent choice may recur only to record additional specific races. Switching enemy type deactivates its retained humanoid pair.
- Favored Enemy can record that its creatures speak no language without inventing a language proficiency.
- Repeat Fighting Styles, enemy types, terrains and grouped branch selections are disabled when already selected elsewhere. Inactive saved invocations no longer grant benefits after a level reduction.
- Spell choices use a shared active-source list. Retained spells from removed races/classes/features or unavailable spell levels grant no resolved spell/attack. The editor exposes those retained records for review and removal; saved records are not silently deleted.
- The character-library completion helper counts required choices and import decisions, while source-access warnings alone do not mark a character unfinished.

## Regression evidence

`tests/catalog.test.ts`, `tests/engine.test.ts` and `tests/integration.test.ts` contain the new matrices and targeted regressions. Existing coverage also checks multiclass entry scores, initial-class training, first-acquired Unarmored Defense, class-specific spell access, Pact Magic separation, duplicate skill replacement and exact draft/PDF restoration.

TypeScript checks and targeted regression runs were performed during implementation. The final combined suite/build and responsive browser evidence are recorded in `VERIFICATION.md` by the integration pass. English/Croatian controls, all nine stages, the agreed viewport widths, keyboard/zoom and reduced-motion checks belong to that visual integration pass; they must not be inferred solely from these catalog tests.

## Remaining limits

- Full protected PHB wording is not independently verified where the official compendium was unavailable. Existing source-audit warnings remain accurate.
- Named humanoid entries are player-authored choices: the UI cannot establish a campaign creature's type or spoken languages. It records two specific races and validates distinctness; the table confirms creature classification/language applicability.
- The regression matrix covers every supported branch and level, plus selected multiclass interactions. It is not an exhaustive Cartesian test of all multiclass histories, feats and equipment combinations.
- Numeric/resource comparisons and rendered-component checks do not replace the documented responsive browser review.
