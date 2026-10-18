import { backgroundCatalogTranslations } from "../catalog/backgrounds";
import {
  classCatalogTranslations,
  classProgression,
  subclassCatalog,
} from "../catalog/classes";
import { equipmentCatalogTranslations } from "../catalog/equipment";
import { featCatalogTranslations } from "../catalog/feats";
import { proficiencyCatalogTranslations } from "../catalog/proficiencies";
import { raceCatalogTranslations, raceProfiles } from "../catalog/races";
import { spellCatalogTranslations } from "../catalog/spells";
import { registerDynamicTranslations, registerTranslations, t } from "./engine";
import { croatianPatterns, croatianTranslations } from "./hr";

registerTranslations({
  ...classCatalogTranslations(),
  ...raceCatalogTranslations(),
  ...backgroundCatalogTranslations(),
  ...proficiencyCatalogTranslations(),
  ...equipmentCatalogTranslations(),
  ...spellCatalogTranslations(),
  ...featCatalogTranslations(),
  ...croatianTranslations,
});
// Registration prepends patterns; a single call preserves their existing priority.
registerDynamicTranslations(croatianPatterns);

export function untranslatedRuleDescriptions(): string[] {
  const descriptions = [
    ...Object.values(classProgression).flatMap((tree) =>
      tree.levels.flatMap((row) => row.features.map((f) => f.description)),
    ),
    ...Object.values(raceProfiles).flatMap((r) =>
      [...r.traits, ...Object.values(r.subraceTraits).flat()].map(
        (f) => f.description,
      ),
    ),
    ...Object.values(subclassCatalog).flatMap((s) => [
      s.overview,
      ...Object.values(s.featureNotes),
    ]),
  ];
  return [...new Set(descriptions)].filter(
    (description) => t(description, "hr") === description,
  );
}
