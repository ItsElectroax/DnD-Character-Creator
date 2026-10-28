/** @jsxImportSource ../i18n */
import {
  ChangeEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  derive,
  classLevelCounts,
  initialCharacter,
  isCharacterUnfinished,
  validateBuild,
  validateStage,
} from "../engine/character";
import { Character } from "../engine/types";
import { getLocale, setLocale, t, type Locale } from "../i18n/engine";
import { type PDFImport } from "../pdf/characterSheet";
import type { PDFLayoutReport } from "../pdf/layout";
import {
  createLibraryCharacter,
  deleteLibraryCharacter,
  getRawDraftRecovery,
  getRawLibraryRecovery,
  loadCharacterLibrary,
  normalizeDraft,
  openLibraryCharacter,
  saveCharacterLibrary,
  resumeCharacterLibrary,
  updateLibraryCharacter,
  type CharacterLibrary,
} from "../storage/drafts";
import { getSheetTemplate, storeSheetTemplate } from "../storage/templates";
import { OptionEffects } from "./components/OptionEffects";
import { Brand, Field, SectionTitle } from "./components/Shared";
import { LanguageSwitch, WelcomeScreen } from "./components/WelcomeScreen";
import { useCursorSpotlight, useStageMotion } from "./motion";
import { StageAbilities } from "./stages/Abilities";
import { StageBackground } from "./stages/Background";
import { StageClassChoices } from "./stages/ClassChoices";
import { stageGuidance, stageNames } from "./stages/config";
import { StageGear } from "./stages/Gear";
import { StageIdentity } from "./stages/Identity";
import { StageOrigin } from "./stages/Origin";
import { StageProficiencies } from "./stages/Proficiencies";
import { StageReview } from "./stages/Review";
import { StageSheet } from "./stages/Sheet";
export function App({
  initialScreen = "welcome",
  initialWelcomeView = "actions",
}: {
  initialScreen?: "welcome" | "builder";
  initialWelcomeView?: "actions" | "saved";
} = {}) {
  const [boot] = useState(loadCharacterLibrary);
  const [library, setLibrary] = useState(boot.library);
  const libraryRef = useRef(boot.library);
  const completionCache = useRef(new WeakMap<Character, boolean>());
  const [welcomeView, setWelcomeView] = useState<"actions" | "saved">(
    initialWelcomeView,
  );
  const [screen, setScreen] = useState<"welcome" | "leaving" | "builder">(
    initialScreen,
  );
  const [entrance, setEntrance] = useState(false);
  const [returning, setReturning] = useState(false);
  const [importing, setImporting] = useState(false);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const returnTransition = useRef<(() => void) | null>(null);
  const [c, setC] = useState<Character>(
    () =>
      boot.library.entries.find((entry) => entry.id === boot.library.activeId)
        ?.character || initialCharacter(),
  );
  const currentCharacter = useRef(c);
  currentCharacter.current = c;
  const [showImport, setShowImport] = useState(boot.warning);
  const [libraryError, setLibraryError] = useState("");
  const [locale, updateLocale] = useState<Locale>(getLocale);
  const [pdfLocale, setPDFLocale] = useState<Locale>(getLocale);
  const [autosavePaused, setAutosavePaused] = useState(boot.autosaveBlocked);
  const [saveStatus, setSaveStatus] = useState<
    "saving" | "saved" | "failed" | "paused"
  >("saved");
  const [sheetReady, setSheetReady] = useState(false);
  const [templateError, setTemplateError] = useState("");
  const [furthest, setFurthest] = useState(
    Math.max(0, c.stage, c.visitedThrough || 0, ...c.confirmed),
  );
  const [pendingPDF, setPendingPDF] = useState<PDFImport | null>(null);
  const [acceptedPDFFields, setAcceptedPDFFields] = useState<string[]>([]);
  const acceptingPDF = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const pdfInput = useRef<HTMLInputElement>(null);
  const templateInput = useRef<HTMLInputElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const appRoot = useRef<HTMLElement>(null);
  const stagePanel = useRef<HTMLElement>(null);
  const motion = useStageMotion(c.stage, stagePanel, heading);
  useCursorSpotlight(appRoot, c.stage, screen);
  const rawRecovery = () => getRawLibraryRecovery() ?? getRawDraftRecovery();
  const downloadRecoveries = () => {
    const libraryRaw = getRawLibraryRecovery();
    const draftRaw = getRawDraftRecovery();
    if (libraryRaw !== null)
      download(libraryRaw, "character-library-recovery.txt", "text/plain");
    if (draftRaw !== null)
      download(draftRaw, "character-draft-recovery.txt", "text/plain");
  };
  const resumeSaving = () => {
    downloadRecoveries();
    const result = resumeCharacterLibrary(saveCurrent());
    libraryRef.current = result.library;
    setLibrary(result.library);
    setLibraryError(result.warning);
    setAutosavePaused(!result.saved);
    setSaveStatus(result.saved ? "saved" : "paused");
  };
  const commitLibrary = (next: CharacterLibrary, requireSaved = false) => {
    if (autosavePaused) {
      setSaveStatus("paused");
      if (requireSaved) {
        setLibraryError(
          "Saving is paused. Download the recovery data and resume saving before deleting a character.",
        );
        return false;
      }
      libraryRef.current = next;
      setLibrary(next);
      return false;
    }
    const result = saveCharacterLibrary(next);
    setSaveStatus(result.saved ? "saved" : "failed");
    setLibraryError(result.saved ? "" : result.warning);
    if (!requireSaved || result.saved) {
      libraryRef.current = next;
      setLibrary(next);
    }
    return result.saved;
  };
  const changeLocale = (language: Locale) => {
    setLocale(language);
    updateLocale(language);
  };
  const enterBuilder = () => {
    if (
      screen === "builder" ||
      transitionTimer.current !== null ||
      returnTransition.current
    )
      return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setScreen("builder");
      return;
    }
    setScreen("leaving");
    transitionTimer.current = setTimeout(() => {
      transitionTimer.current = null;
      setEntrance(true);
      setScreen("builder");
    }, 420);
  };
  useEffect(
    () => () => {
      if (transitionTimer.current !== null)
        clearTimeout(transitionTimer.current);
      returnTransition.current?.();
    },
    [],
  );
  useEffect(() => {
    if (screen !== "builder") return;
    const frame = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
      heading.current?.focus({ preventScroll: true });
      const rail =
        appRoot.current?.querySelector<HTMLElement>(".progress-rail");
      const current = rail?.querySelector<HTMLElement>('[aria-current="step"]');
      if (rail && current)
        rail.scrollLeft +=
          current.getBoundingClientRect().left -
          rail.getBoundingClientRect().left -
          (rail.clientWidth - current.getBoundingClientRect().width) / 2;
    });
    const timer = setTimeout(() => setEntrance(false), 1100);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [screen]);
  useEffect(() => {
    if (autosavePaused) {
      setSaveStatus("paused");
      return;
    }
    const current = libraryRef.current;
    if (screen !== "builder" || !current.activeId) return;
    setSaveStatus("saving");
    commitLibrary(updateLibraryCharacter(current, current.activeId, c));
  }, [c, autosavePaused, screen]);
  useEffect(() => {
    getSheetTemplate()
      .then((value) => setSheetReady(Boolean(value)))
      .catch((error) => {
        setSheetReady(false);
        setTemplateError(
          error instanceof Error
            ? error.message
            : "The built-in PDF template could not be loaded. Reload the app or choose an optional custom template.",
        );
      });
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  useEffect(() => {
    if (!pendingPDF) return;
    const previous = document.activeElement as HTMLElement | null;
    const dialog = document.querySelector<HTMLElement>(".import-review");
    const controls = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input, select, textarea, [tabindex="0"]',
        ) || [],
      );
    controls()[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (acceptingPDF.current) return;
        setPendingPDF(null);
      }
      if (event.key === "Tab") {
        const list = controls();
        const first = list[0],
          last = list[list.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [pendingPDF]);
  const d = useMemo(() => derive(c), [c]);
  const errs = validateStage(c);
  const allIssues = validateBuild(c);
  const update = (patch: Partial<Character>) =>
    setC((prev) => ({
      ...prev,
      ...patch,
      confirmed: prev.confirmed.filter((n) => n < (patch.stage ?? prev.stage)),
    }));
  const go = (stage: number, onComplete?: () => void) => {
    if (returnTransition.current) return;
    setEntrance(false);
    const target = Math.max(0, Math.min(8, stage));
    if (target === c.stage) {
      onComplete?.();
      return;
    }
    void motion.navigate(
      () =>
        setC((prev) => ({
          ...prev,
          stage: target,
          visitedThrough: Math.max(
            prev.visitedThrough || 0,
            prev.stage,
            target,
          ),
        })),
      onComplete,
    );
  };
  const confirmStage = () => {
    if (errs.length || motion.busy || returnTransition.current) return;
    setEntrance(false);
    void motion.navigate(() => {
      setFurthest(Math.max(furthest, c.stage + 1));
      setC((prev) => ({
        ...prev,
        confirmed: [...new Set([...prev.confirmed, prev.stage])],
        visitedThrough: Math.max(
          prev.visitedThrough || 0,
          Math.min(8, prev.stage + 1),
        ),
        stage: Math.min(8, prev.stage + 1),
      }));
    });
  };
  const saveCurrent = () => {
    const current = libraryRef.current;
    return current.activeId
      ? updateLibraryCharacter(
          current,
          current.activeId,
          currentCharacter.current,
        )
      : current;
  };
  const adopt = (character: Character) => {
    motion.cancel();
    commitLibrary(createLibraryCharacter(saveCurrent(), character));
    setC(character);
    setFurthest(
      Math.max(
        character.stage,
        character.visitedThrough || 0,
        ...character.confirmed,
        0,
      ),
    );
  };
  const openSaved = (id: string) => {
    const next = openLibraryCharacter(
      libraryRef.current,
      id,
      currentCharacter.current,
    );
    const entry = next.entries.find((item) => item.id === id);
    if (!entry) return;
    motion.cancel();
    commitLibrary(next);
    setC(entry.character);
    setFurthest(
      Math.max(
        entry.character.stage,
        entry.character.visitedThrough || 0,
        ...entry.character.confirmed,
        0,
      ),
    );
    setShowImport("");
    enterBuilder();
  };
  const showWelcome = (view: "actions" | "saved" = "actions") => {
    if (
      screen !== "builder" ||
      returnTransition.current ||
      transitionTimer.current !== null ||
      importing
    )
      return;
    commitLibrary(saveCurrent());
    motion.cancel();
    setEntrance(false);
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const root = appRoot.current;
    const groups = Array.from(
      root?.querySelectorAll<HTMLElement>(
        ":scope > .progress-rail, :scope > .stage-heading, :scope > .stage-panel, :scope > .bottom-navigation, :scope > .page-footnote, :scope > .toast",
      ) || [],
    );
    const blocked = [...groups];
    const toolbar = root?.querySelector<HTMLElement>(".header-right");
    if (toolbar) blocked.push(toolbar);
    const previousInert = blocked.map((node) => node.inert);
    const animations: Animation[] = [];
    let finished = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const cleanup = () => {
      finished = true;
      clearTimeout(timer);
      preference.removeEventListener("change", changed);
      animations.forEach((animation) => animation.cancel());
      blocked.forEach((node, index) => {
        node.inert = previousInert[index];
      });
      returnTransition.current = null;
    };
    const finish = () => {
      if (finished) return;
      cleanup();
      setReturning(false);
      setWelcomeView(view);
      // Unmounting the builder mounts a fresh welcome scene, replaying its
      // existing letter/description entrances without remounting the logo.
      setScreen("welcome");
    };
    const changed = () => {
      if (preference.matches) finish();
    };
    returnTransition.current = cleanup;
    if (preference.matches || !root || typeof root.animate !== "function") {
      finish();
      return;
    }
    setReturning(true);
    blocked.forEach((node) => {
      node.inert = true;
    });
    root
      .querySelectorAll("[data-spotlight], [data-click-wave]")
      .forEach((node) => {
        node.removeAttribute("data-spotlight");
        node.removeAttribute("data-click-wave");
      });
    const visible = groups.filter((node) => {
      const rect = node.getBoundingClientRect();
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        rect.bottom > 0 &&
        rect.top < innerHeight
      );
    });
    visible.forEach((node) => {
      const direction = node.matches(
        ".stage-heading, .bottom-navigation, .page-footnote",
      )
        ? -1
        : 1;
      animations.push(
        node.animate(
          [
            { opacity: 1, transform: "translate(0, 0)" },
            { opacity: 0, transform: `translate(${direction * 18}px, -4px)` },
          ],
          { duration: 200, easing: "ease-in", fill: "forwards" },
        ),
      );
    });
    preference.addEventListener("change", changed);
    timer = setTimeout(finish, 280);
    void Promise.allSettled(
      animations.map((animation) => animation.finished),
    ).then(finish);
  };
  const showSaved = () => showWelcome("saved");
  const deleteSaved = (id: string): boolean => {
    if (!libraryRef.current.entries.some((item) => item.id === id))
      return false;
    const wasActive = libraryRef.current.activeId === id;
    if (!commitLibrary(deleteLibraryCharacter(libraryRef.current, id), true))
      return false;
    if (wasActive) setC(initialCharacter());
    return true;
  };
  const savedCharacters = useMemo(
    () =>
      screen === "builder"
        ? []
        : library.entries
            .slice()
            .sort(
              (a, b) =>
                b.lastOpenedAt.localeCompare(a.lastOpenedAt) ||
                b.updatedAt.localeCompare(a.updatedAt),
            )
            .map((entry) => {
              const unfinished =
                completionCache.current.get(entry.character) ??
                isCharacterUnfinished(entry.character);
              completionCache.current.set(entry.character, unfinished);
              return {
                id: entry.id,
                name: entry.character.identity.name,
                race: t(entry.character.race, locale),
                lineage:
                  entry.character.subrace === entry.character.race
                    ? ""
                    : t(entry.character.subrace, locale),
                classSummary: Object.entries(classLevelCounts(entry.character))
                  .map(([name, level]) => `${t(name, locale)} ${level}`)
                  .join(" / "),
                updatedAt: entry.updatedAt,
                unfinished,
                active: entry.id === library.activeId,
              };
            }),
    [library, locale, screen],
  );
  const resetStage = () => {
    if (returnTransition.current) return;
    if (!window.confirm(t("Reset the choices in this stage?"))) return;
    const next = { ...c };
    const base = initialCharacter();
    if (c.stage === 0)
      Object.assign(next, {
        race: "",
        subrace: "",
        ancestry: "",
        raceFeat: "",
        raceFeatAbility: "",
        flexBonuses: [],
        classMode: "single",
        classes: [],
        level: 1,
        levelPath: { 1: "" },
        dmPermission: false,
        importedClassLevels: {},
        importedInitialClass: "",
      });
    if (c.stage === 1) next.identity = base.identity;
    if (c.stage === 2) next.background = "";
    if (c.stage === 3)
      Object.assign(next, {
        abilityMethod: "standard",
        baseAbilities: base.baseAbilities,
        rollNotes: "",
        scoresAreFinal: false,
        asiChoices: {},
      });
    if (c.stage === 4)
      Object.assign(next, {
        skills: [],
        classSkillChoices: {},
        raceSkills: [],
        languages: [],
        tools: [],
        toolChoices: {},
        otherProficiencies: [],
        skillReplacementChoices: {},
      });
    if (c.stage === 5)
      Object.assign(next, {
        subclass: {},
        subclassChoices: {},
        featureEntries: [],
        expertiseChoices: {},
        asiChoices: {},
      });
    if (c.stage === 6)
      Object.assign(next, {
        equipment: [],
        equipmentItems: [],
        attacks: [],
        spells: [],
        spellSelections: [],
        notes: "",
        spellNotes: "",
        acOverride: "",
        equippedArmor: "",
        equippedShield: false,
      });
    next.confirmed = next.confirmed.filter((n) => n < c.stage);
    setC(next);
  };
  const toggle = (list: string[], value: string, count = Infinity) =>
    list.includes(value)
      ? list.filter((item) => item !== value)
      : list.length < count
        ? [...list, value]
        : list;
  const download = (bytes: BlobPart, name: string, type: string) => {
    const url = URL.createObjectURL(new Blob([bytes], { type }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const slug = () =>
    (c.identity.name || "dnd-character")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-");
  const exportCharacter = () =>
    download(JSON.stringify(c, null, 2), `${slug()}.json`, "application/json");
  const importCharacter = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setShowImport(boot.warning);
    try {
      const loaded = normalizeDraft(
        JSON.parse((await file.text()).replace(/^\uFEFF/, "")),
      );
      adopt(loaded);
      enterBuilder();
      setShowImport("Character added to your saved characters.");
    } catch (error) {
      setShowImport(
        error instanceof Error
          ? error.message
          : "Could not read this character file.",
      );
    } finally {
      setImporting(false);
    }
    event.target.value = "";
  };
  const loadTemplate = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { PDFDocument } = await import("pdf-lib");
      const pdf = await PDFDocument.load(bytes);
      const fields = pdf
        .getForm()
        .getFields()
        .map((field) => field.getName().trim());
      if (!fields.includes("CharacterName") || !fields.includes("ClassLevel"))
        throw new Error("Choose the supported 2014 fillable character sheet.");
      await storeSheetTemplate(bytes);
      setSheetReady(true);
      setTemplateError("");
      setShowImport(
        "PDF template loaded. Your current character is unchanged.",
      );
    } catch (error) {
      setShowImport(
        error instanceof Error
          ? error.message
          : "Could not load the PDF template.",
      );
    }
    event.target.value = "";
  };
  const importPDF = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setShowImport(boot.warning);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { importFillableSheet } = await import("../pdf/characterSheet");
      const result = await importFillableSheet(bytes);
      setAcceptedPDFFields([]);
      setPendingPDF(result);
    } catch (error) {
      setShowImport(
        error instanceof Error ? error.message : "Could not import this PDF.",
      );
    } finally {
      setImporting(false);
    }
    event.target.value = "";
  };
  const acceptPDF = async () => {
    if (!pendingPDF || acceptingPDF.current) return;
    acceptingPDF.current = true;
    setImporting(true);
    try {
      const { resolvePDFImport } = await import("../pdf/characterSheet");
      const character = resolvePDFImport(pendingPDF, acceptedPDFFields);
      adopt(character);
      enterBuilder();
      setShowImport(
        ["Fillable character sheet imported.", ...pendingPDF.warnings].join(
          " ",
        ),
      );
      setPendingPDF(null);
    } catch (error) {
      setShowImport(
        error instanceof Error ? error.message : "Could not import this PDF.",
      );
    } finally {
      acceptingPDF.current = false;
      setImporting(false);
    }
  };
  const exportPDF = async () => {
    try {
      const template = await getSheetTemplate();
      const { exportFillableSheet } = await import("../pdf/characterSheet");
      let report: PDFLayoutReport | undefined;
      const bytes = await exportFillableSheet(
        template,
        c,
        pdfLocale,
        (value) => {
          report = value;
        },
      );
      download(
        bytes as BlobPart,
        `${slug()}-${pdfLocale}-fillable.pdf`,
        "application/pdf",
      );
      setShowImport(
        [
          t("PDF exported within the original pages."),
          ...(report?.warnings || []),
        ].join(" "),
      );
    } catch (error) {
      setShowImport(
        error instanceof Error ? error.message : "Could not export the PDF.",
      );
    }
  };
  const jumpToIssue = (stage: number, control: string) => {
    go(stage, () => {
      const target =
        document.getElementById(control) ||
        document.getElementById("stage-title");
      target?.scrollIntoView({ block: "center" });
      target?.focus();
    });
  };
  const importUI = (
    <>
      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={importCharacter}
      />
      <input
        ref={pdfInput}
        type="file"
        accept="application/pdf,.pdf"
        hidden
        onChange={importPDF}
      />
      <input
        ref={templateInput}
        type="file"
        accept="application/pdf,.pdf"
        hidden
        onChange={loadTemplate}
      />
      {showImport && (
        <div className="toast" role="status">
          <span>{showImport}</span>
          <button onClick={() => setShowImport("")} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}
      {libraryError && (
        <div className="toast save-failed" role="alert">
          <span>{libraryError}</span>
          <button className="quiet-button" onClick={exportCharacter}>
            Export JSON
          </button>
        </div>
      )}
      {pendingPDF && (
        <div
          className="import-review"
          role="dialog"
          aria-modal="true"
          aria-labelledby="import-review-title"
        >
          <div className="detail-panel">
            <h2 id="import-review-title">Review PDF changes</h2>
            <p>
              Importing this sheet adds a character to your library. Your other
              saved characters are kept.
            </p>
            {pendingPDF.warnings.map((warning, index) => (
              <p className="soft-note" key={index}>
                {warning}
              </p>
            ))}
            {pendingPDF.conflicts.length > 0 && (
              <>
                <p>
                  Choose external mechanical edits to preserve as explicit
                  overrides. Leave unchecked to retain the recovered build and
                  calculated values.
                </p>
                {pendingPDF.conflicts.map((conflict) => (
                  <label className="check-row" key={conflict.field}>
                    <input
                      type="checkbox"
                      checked={acceptedPDFFields.includes(conflict.field)}
                      onChange={() =>
                        setAcceptedPDFFields(
                          toggle(acceptedPDFFields, conflict.field),
                        )
                      }
                    />
                    <span>
                      <strong>{conflict.label}</strong>
                      <small data-player-text>
                        PDF: {conflict.current} · Saved: {conflict.baseline}
                      </small>
                    </span>
                    <OptionEffects />
                  </label>
                ))}
              </>
            )}
            <div className="button-row">
              <button
                className="quiet-button"
                disabled={importing}
                onClick={() => setPendingPDF(null)}
              >
                Cancel
              </button>
              <button
                className="nav-button confirm-button"
                onClick={acceptPDF}
                disabled={importing}
              >
                Import selected changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
  const welcome = (
    <WelcomeScreen
      showHeader={false}
      locale={locale}
      onLocaleChange={changeLocale}
      onNew={() => {
        adopt(initialCharacter());
        setShowImport(boot.warning);
        enterBuilder();
      }}
      onJSON={() => fileInput.current?.click()}
      onPDF={() => pdfInput.current?.click()}
      savedCharacters={savedCharacters}
      onOpenSaved={openSaved}
      onDeleteSaved={deleteSaved}
      initialView={welcomeView}
      leaving={screen === "leaving"}
      loading={importing}
    >
      {importUI}
      {rawRecovery() !== null && boot.warning && (
        <button
          className="quiet-button welcome-recovery"
          onClick={downloadRecoveries}
        >
          Download original recovery data
        </button>
      )}
    </WelcomeScreen>
  );
  return (
    <main
      className={`app-shell ${screen !== "builder" ? "welcome-shell" : entrance && !returning ? "builder-entering" : ""}`}
      ref={appRoot}
      aria-busy={returning || undefined}
      data-screen-phase={returning ? "returning" : undefined}
    >
      <header
        className={`top-header site-header ${screen !== "builder" ? "is-welcome" : ""}`}
      >
        <Brand title={c.identity.name} showTitle={screen === "builder"} />
        <div className="header-right">
          {screen === "builder" && (
            <div className="stage-readout">
              <span>{t(`STAGE ${c.stage + 1} / 9`)}</span>
              <strong>{Math.round(((c.stage + 1) / 9) * 100)}%</strong>
            </div>
          )}
          <LanguageSwitch
            key="language"
            locale={locale}
            onChange={changeLocale}
            disabled={screen === "leaving" || returning || importing}
          />
          {screen === "builder" && (
            <CharacterActions>
              <summary aria-label={t("Character actions")}>
                <span className="actions-label-full">Character actions</span>
                <span className="actions-label-compact" aria-hidden="true">
                  Actions
                </span>
              </summary>
              <div className="header-actions">
                <button className="quiet-button" onClick={showSaved}>
                  Saved characters
                </button>
                <button className="quiet-button" onClick={exportCharacter}>
                  Export JSON
                </button>
                <button
                  className="quiet-button"
                  onClick={() => fileInput.current?.click()}
                >
                  Import JSON
                </button>
                <button
                  className="quiet-button"
                  onClick={() => templateInput.current?.click()}
                >
                  Use custom template
                </button>
                <button
                  className="quiet-button"
                  onClick={() => pdfInput.current?.click()}
                >
                  Import PDF
                </button>
                <button
                  className="quiet-button"
                  onClick={exportPDF}
                  disabled={!sheetReady}
                >
                  Export PDF
                </button>
                {rawRecovery() !== null && boot.warning && (
                  <button className="quiet-button" onClick={downloadRecoveries}>
                    Download original recovery data
                  </button>
                )}
                {autosavePaused && (
                  <button className="quiet-button" onClick={resumeSaving}>
                    Download recovery and resume saving
                  </button>
                )}
                <button
                  className="quiet-button"
                  onClick={() => adopt(initialCharacter())}
                >
                  New
                </button>
              </div>
            </CharacterActions>
          )}
        </div>
      </header>
      {screen !== "builder" ? (
        welcome
      ) : (
        <>
          <nav className="progress-rail" aria-label="Character creation stages">
            {stageNames.map((label, index) => (
              <button
                key={label}
                className={`progress-step ${index === c.stage ? "current" : ""} ${c.confirmed.includes(index) ? "done" : ""}`}
                aria-current={index === c.stage ? "step" : undefined}
                disabled={index > furthest || motion.busy || returning}
                onClick={() => go(index)}
              >
                <span className="progress-top" />
                <span className="step-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="step-label">{label}</span>
              </button>
            ))}
          </nav>
          <section className="stage-heading">
            <div>
              <p className="eyebrow">
                {t(
                  `CREATION SEQUENCE / ${String(c.stage + 1).padStart(2, "0")}`,
                )}
              </p>
              <h2 id="stage-title" ref={heading} tabIndex={-1}>
                {stageNames[c.stage]}
              </h2>
              <p>{stageGuidance[c.stage]}</p>
            </div>
            <div
              className={`autosave ${saveStatus === "failed" ? "save-failed" : ""}`}
              role="status"
            >
              <span className="save-dot" />
              {saveStatus === "paused"
                ? "Saving paused — preserve recovery data"
                : saveStatus === "saving"
                  ? "Saving draft…"
                  : saveStatus === "saved"
                    ? "Draft saved in this browser"
                    : "Draft could not be saved — export a copy"}
            </div>
          </section>
          {importUI}
          <section
            className="stage-panel"
            ref={stagePanel}
            aria-busy={motion.busy || returning || undefined}
            data-motion-phase={
              motion.phase === "idle" ? undefined : motion.phase
            }
            aria-labelledby="stage-title"
            id={`stage-${c.stage}`}
          >
            <div className="panel-kicker">
              <span>2014 PLAYER'S HANDBOOK RULESET</span>
              <span className="panel-index">
                {String(c.stage + 1).padStart(2, "0")} <b>/</b> 09
              </span>
            </div>
            {c.stage === 0 && <StageOrigin c={c} d={d} update={update} />}{" "}
            {c.stage === 1 && <StageIdentity c={c} update={update} />}{" "}
            {c.stage === 2 && <StageBackground c={c} update={update} />}{" "}
            {c.stage === 3 && <StageAbilities c={c} update={update} />}{" "}
            {c.stage === 4 && (
              <StageProficiencies c={c} update={update} toggle={toggle} d={d} />
            )}{" "}
            {c.stage === 5 && <StageClassChoices c={c} update={update} d={d} />}{" "}
            {c.stage === 6 && <StageGear c={c} update={update} d={d} />}{" "}
            {c.stage === 7 && (
              <StageReview c={c} d={d} go={jumpToIssue} update={update} />
            )}{" "}
            {c.stage === 8 && (
              <>
                <div className="detail-panel export-preflight">
                  <SectionTitle
                    title="PDF export preflight"
                    note="Export keeps the original sheet pages. No overflow pages are added."
                  />
                  <p>
                    {allIssues.some((issue) => issue.severity === "error")
                      ? "Character decisions still need attention. You may export a clearly marked draft."
                      : "All required character choices are complete."}
                  </p>
                  <p>
                    Spells fill the original single-line rows with compact
                    values. Overflow is allowed. Full character data stays
                    embedded for re-import.
                  </p>
                  {!sheetReady && (
                    <p className="soft-note">
                      {templateError || "Loading the built-in fillable sheet…"}
                    </p>
                  )}
                  {allIssues.length > 0 && (
                    <details>
                      <summary>Outstanding decisions and source checks</summary>
                      <ul className="validation-errors">
                        {allIssues.map((issue) => (
                          <li key={issue.id}>
                            <button
                              className="validation-link"
                              onClick={() =>
                                jumpToIssue(issue.stage, issue.control)
                              }
                            >
                              {issue.message}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                  <Field label="PDF language">
                    <select
                      value={pdfLocale}
                      onChange={(event) =>
                        setPDFLocale(event.target.value as Locale)
                      }
                    >
                      <option value="en">English</option>
                      <option value="hr">Croatian</option>
                    </select>
                  </Field>
                </div>
                <StageSheet
                  c={c}
                  d={d}
                  go={go}
                  sheetReady={sheetReady}
                  onExportPDF={exportPDF}
                  onLoadPDF={() => templateInput.current?.click()}
                />
              </>
            )}
            <div className="rules-strip" role="status" id="stage-validation">
              <span className="rule-icon">{errs.length ? "!" : "i"}</span>
              <div>
                <strong>
                  {errs.length ? "NEEDS ATTENTION" : "READY TO CONTINUE"}
                </strong>
                {errs.length ? (
                  <ul className="validation-errors">
                    {errs.map((error, index) => (
                      <li key={index}>
                        <button
                          className="validation-link"
                          onClick={() => {
                            const issue = allIssues.find(
                              (issue) => issue.message === error,
                            );
                            jumpToIssue(
                              issue?.stage ?? c.stage,
                              issue?.control ?? `stage-${c.stage}`,
                            );
                          }}
                        >
                          {error}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    Your choices stay editable. Derived values update as you
                    change earlier decisions.
                  </p>
                )}
              </div>
            </div>
          </section>
          <footer className="bottom-navigation">
            <button
              className="nav-button back-button"
              disabled={motion.busy || returning}
              onClick={() => (c.stage === 0 ? showWelcome() : go(c.stage - 1))}
            >
              ← BACK
            </button>
            <button
              className="nav-button reset-button"
              onClick={resetStage}
              disabled={motion.busy || returning}
            >
              RESET THIS STAGE
            </button>
            <button
              className="nav-button confirm-button"
              onClick={c.stage === 8 ? exportPDF : confirmStage}
              disabled={
                motion.busy ||
                returning ||
                (c.stage === 8 ? !sheetReady : errs.length > 0)
              }
            >
              {c.stage === 8 ? "EXPORT FILLABLE PDF" : "CONFIRM & CONTINUE"} →
            </button>
          </footer>
          <p className="page-footnote">
            Rules reference: 2014 Player's Handbook with official errata.
            Unresolved choices remain marked on draft sheets.
          </p>
        </>
      )}
    </main>
  );
}

export function CharacterActions({ children }: { children: ReactNode }) {
  const menu = useRef<HTMLDetailsElement>(null);
  const position = () => {
    const node = menu.current;
    const panel = node?.querySelector<HTMLElement>(".header-actions");
    if (!node?.open || !panel) return;
    const bounds = node.getBoundingClientRect();
    const width = panel.getBoundingClientRect().width;
    const available = document.documentElement.clientWidth;
    const left = Math.max(
      12,
      Math.min(bounds.right - width, available - width - 12),
    );
    panel.style.setProperty("--actions-offset", `${left - bounds.left}px`);
  };
  useEffect(() => {
    const observer = new ResizeObserver(position);
    if (menu.current) observer.observe(menu.current);
    window.addEventListener("resize", position);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", position);
    };
  }, []);
  return (
    <details
      ref={menu}
      className="character-actions"
      onToggle={position}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.currentTarget.open = false;
          event.currentTarget.querySelector("summary")?.focus();
        }
      }}
      onClick={(event) => {
        if ((event.target as Element).closest("button"))
          event.currentTarget.open = false;
      }}
    >
      {children}
    </details>
  );
}
