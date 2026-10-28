/** @jsxImportSource ../../i18n */
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { t, type Locale } from "../../i18n/engine";
import { OptionEffects } from "./OptionEffects";
import { Brand } from "./Shared";

export function LanguageSwitch({
  locale,
  onChange,
  disabled = false,
}: {
  locale: Locale;
  onChange: (language: Locale) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className="locale-switch"
      role="group"
      aria-label="Interface language"
      title="Interface language"
    >
      {(["en", "hr"] as const).map((language) => (
        <button
          key={language}
          type="button"
          className={`locale-choice ${locale === language ? "active" : ""}`}
          aria-label={language === "en" ? "English" : "Croatian"}
          aria-pressed={locale === language}
          disabled={disabled}
          onClick={() => onChange(language)}
        >
          <span aria-hidden="true">{language.toUpperCase()}</span>
          <span className="sr-only">
            {language === "en" ? "English" : "Croatian"}
          </span>
          <OptionEffects />
        </button>
      ))}
      <button
        type="button"
        className="locale-toggle active"
        aria-label={
          locale === "en"
            ? "Language: English. Switch to Croatian."
            : "Language: Croatian. Switch to English."
        }
        title={
          locale === "en"
            ? "Language: English. Switch to Croatian."
            : "Language: Croatian. Switch to English."
        }
        disabled={disabled}
        onClick={() => onChange(locale === "en" ? "hr" : "en")}
      >
        <span aria-hidden="true">{locale.toUpperCase()}</span>
        <OptionEffects />
      </button>
    </div>
  );
}

function StartIcon({ kind }: { kind: "saved" | "new" | "json" | "pdf" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {kind === "new" ? (
        <>
          <path d="M12 5v14M5 12h14" />
          <path d="m5 3 14 0 2 2v14l-2 2H5l-2-2V5Z" />
        </>
      ) : kind === "saved" ? (
        <>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 9h18M10 9v11" />
          <path d="M6 6.5h.01M14 12h4m-4 4h4" />
        </>
      ) : (
        <>
          <path d="M6 3h8l4 4v14H6Z" />
          <path d="M14 3v5h4" />
          {kind === "json" ? (
            <path d="m10 11-2 3 2 3m4-6 2 3-2 3" />
          ) : (
            <path d="M9 12h6m-6 3h6m-6 3h4" />
          )}
        </>
      )}
    </svg>
  );
}

export interface SavedCharacterSummary {
  id: string;
  name: string;
  race: string;
  lineage?: string;
  classSummary: string;
  updatedAt: number | string;
  unfinished: boolean;
  active?: boolean;
}

/** Round a single continuous outline, including the two concave T corners. */
function confirmationOutline(points: number[][]) {
  const corners = points.map(([x, y], index) => {
    const previous = points[(index + points.length - 1) % points.length];
    const next = points[(index + 1) % points.length];
    const incoming = Math.hypot(previous[0] - x, previous[1] - y);
    const outgoing = Math.hypot(next[0] - x, next[1] - y);
    const radius = Math.min(6, incoming / 2, outgoing / 2);
    return {
      before: [
        x + ((previous[0] - x) * radius) / (incoming || 1),
        y + ((previous[1] - y) * radius) / (incoming || 1),
      ],
      after: [
        x + ((next[0] - x) * radius) / (outgoing || 1),
        y + ((next[1] - y) * radius) / (outgoing || 1),
      ],
      corner: [x, y],
    };
  });
  return `M ${corners[0].before.join(" ")} ${corners.map(({ before, corner, after }) => `L ${before.join(" ")} Q ${corner.join(" ")} ${after.join(" ")}`).join(" ")} Z`;
}

function DeleteConfirmation({
  anchor,
  scroller,
  id,
  locale,
  onDismiss,
}: {
  anchor: HTMLButtonElement;
  scroller: HTMLDivElement | null;
  id: string;
  locale: Locale;
  onDismiss: () => void;
}) {
  const prompt = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
    stemLeft: number;
    stemRight: number;
    iconWidth: number;
    iconHeight: number;
    visible: boolean;
  } | null>(null);
  useLayoutEffect(() => {
    let frame = 0;
    const place = () => {
      frame = 0;
      const rect = anchor.getBoundingClientRect();
      const bounds = scroller?.getBoundingClientRect();
      const scrolling =
        scroller && getComputedStyle(scroller).overflowY !== "visible";
      const topLimit = scrolling && bounds ? Math.max(0, bounds.top) : 0;
      const bottomLimit =
        scrolling && bounds
          ? Math.min(innerHeight, bounds.bottom)
          : innerHeight;
      const width = Math.min(196, document.documentElement.clientWidth - 16);
      const left = Math.max(
        8,
        Math.min(
          rect.left + rect.width / 2 - width / 2,
          document.documentElement.clientWidth - width - 8,
        ),
      );
      const stemLeft = Math.max(0.5, rect.left - 4 - left);
      const stemRight = Math.min(width - 0.5, rect.right + 4 - left);
      setPosition({
        left,
        top: rect.top - 42,
        width,
        height: 38 + rect.height + 8,
        stemLeft,
        stemRight,
        iconWidth: rect.width,
        iconHeight: rect.height,
        visible:
          anchor.isConnected &&
          rect.width > 0 &&
          rect.top >= topLimit &&
          rect.bottom <= bottomLimit &&
          rect.left >= 0 &&
          rect.right <= innerWidth,
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(place);
    };
    const outside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !anchor.contains(event.target) &&
        !prompt.current?.contains(event.target)
      )
        onDismiss();
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onDismiss();
        anchor.focus({ preventScroll: true });
      }
    };
    place();
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    document.addEventListener("pointerdown", outside, true);
    document.addEventListener("keydown", escape);
    const resize = new ResizeObserver(schedule);
    resize.observe(anchor);
    if (scroller) resize.observe(scroller);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("pointerdown", outside, true);
      document.removeEventListener("keydown", escape);
    };
  }, [anchor, scroller, onDismiss]);
  if (!position) return null;
  const outline = confirmationOutline([
    [0.5, 0.5],
    [position.width - 0.5, 0.5],
    [position.width - 0.5, 38],
    [position.stemRight, 38],
    [position.stemRight, position.height - 0.5],
    [position.stemLeft, position.height - 0.5],
    [position.stemLeft, 38],
    [0.5, 38],
  ]);
  const maskId = `${id}-mask`;
  return createPortal(
    <div
      ref={prompt}
      id={id}
      role="tooltip"
      className="saved-delete-confirmation"
      style={{
        left: position.left,
        top: position.top,
        width: position.width,
        height: position.height,
        visibility: position.visible ? "visible" : "hidden",
      }}
    >
      <svg width={position.width} height={position.height} aria-hidden="true">
        <defs>
          <mask id={maskId}>
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={position.stemLeft + 4}
              y="42"
              width={position.iconWidth}
              height={position.iconHeight}
              rx="6"
              fill="black"
            />
          </mask>
        </defs>
        <path d={outline} fill="var(--panel-bg)" mask={`url(#${maskId})`} />
        <path
          d={outline}
          fill="none"
          stroke="var(--outline-active)"
          strokeWidth="1"
        />
      </svg>
      <span>{t("Click again to confirm", locale)}</span>
    </div>,
    document.body,
  );
}

let originalFire:
  | Promise<{ player: (typeof import("lottie-web"))["default"]; data: object }>
  | undefined;
function prepareOriginalFire() {
  if (!originalFire) {
    const base =
      (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env
        ?.BASE_URL || "/";
    originalFire = Promise.all([
      import("lottie-web/build/player/lottie_light_canvas"),
      fetch(`${base}animations/duckduckgo-fire.json`).then((response) => {
        if (!response.ok) throw new Error("Fire animation unavailable");
        return response.json() as Promise<object>;
      }),
    ])
      .then(([module, data]) => ({ player: module.default, data }))
      .catch((error: unknown) => {
        originalFire = undefined;
        throw error;
      });
  }
  return originalFire;
}

function CardBurn({
  onStart,
  onComplete,
}: {
  onStart: () => void;
  onComplete: () => void;
}) {
  const container = useRef<HTMLSpanElement>(null);
  const callbacks = useRef({ onStart, onComplete });
  callbacks.current = { onStart, onComplete };
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    let animation: import("lottie-web").AnimationItem | undefined;
    void prepareOriginalFire()
      .then(({ player, data }) => {
        if (cancelled || !container.current) return;
        animation = player.loadAnimation({
          container: container.current,
          renderer: "canvas",
          loop: false,
          autoplay: false,
          animationData: structuredClone(data),
          rendererSettings: {
            preserveAspectRatio: "none",
            clearCanvas: true,
            dpr: Math.min(devicePixelRatio || 1, 2),
          },
        });
        animation.setSubframe(false);
        let started = false;
        const start = () => {
          if (cancelled || started || !animation) return;
          started = true;
          callbacks.current.onStart();
          animation.goToAndPlay(0, true);
        };
        animation.addEventListener("DOMLoaded", start);
        animation.addEventListener("complete", () => {
          if (!cancelled) callbacks.current.onComplete();
        });
        animation.addEventListener("data_failed", () => {
          if (!cancelled) callbacks.current.onComplete();
        });
        animation.addEventListener("error", () => {
          if (!cancelled) callbacks.current.onComplete();
        });
        if (animation.isLoaded) start();
      })
      .catch(() => {
        if (!cancelled) callbacks.current.onComplete();
      });
    return () => {
      cancelled = true;
      animation?.destroy();
    };
  }, []);
  return (
    <span className="saved-character-burn" aria-hidden="true">
      <span className="card-burn-char" />
      <span className="card-burn-original" ref={container} />
    </span>
  );
}

export function WelcomeScreen({
  locale,
  onLocaleChange,
  onNew,
  onJSON,
  onPDF,
  savedCharacters,
  onOpenSaved,
  onDeleteSaved,
  initialView = "actions",
  leaving,
  loading,
  children,
  showHeader = true,
}: {
  locale: Locale;
  onLocaleChange: (language: Locale) => void;
  onNew: () => void;
  onJSON: () => void;
  onPDF: () => void;
  savedCharacters: SavedCharacterSummary[];
  onOpenSaved: (id: string) => void;
  onDeleteSaved: (id: string) => boolean;
  initialView?: "actions" | "saved";
  leaving: boolean;
  loading: boolean;
  children?: ReactNode;
  showHeader?: boolean;
}) {
  const title = useRef<HTMLHeadingElement>(null);
  const optionsTitle = useRef<HTMLHeadingElement>(null);
  const savedTitle = useRef<HTMLHeadingElement>(null);
  const savedList = useRef<HTMLDivElement>(null);
  const deleteButtons = useRef(new Map<string, HTMLButtonElement>());
  const burnLock = useRef(false);
  const finishBurn = useRef<(() => void) | null>(null);
  const reflow = useRef(new Map<string, DOMRect>());
  const reflowAnimations = useRef<Animation[]>([]);
  const focusAfterDelete = useRef<number | null>(null);
  const revision = useRef(0);
  const reflowing = useRef(false);
  const confirmationId = useId();
  const [armedId, setArmedId] = useState<string | null>(null);
  const [burn, setBurn] = useState<{
    character: SavedCharacterSummary;
    index: number;
    phase: "loading" | "playing" | "charred" | "fading";
  } | null>(null);
  const [deletionNotice, setDeletionNotice] = useState("");
  const [view, setView] = useState(initialView);
  const [scrollEdges, setScrollEdges] = useState({ top: false, bottom: false });
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    (initialView === "saved" ? savedTitle.current : title.current)?.focus({
      preventScroll: true,
    });
  }, []);
  useEffect(() => setView(initialView), [initialView]);
  useEffect(() => {
    if (view !== "saved") return;
    const list = savedList.current;
    if (!list) return;
    const updateEdges = () => {
      const top = list.scrollTop > 1;
      const bottom = list.scrollHeight - list.clientHeight - list.scrollTop > 1;
      setScrollEdges((current) =>
        current.top === top && current.bottom === bottom
          ? current
          : { top, bottom },
      );
    };
    updateEdges();
    list.addEventListener("scroll", updateEdges, { passive: true });
    window.addEventListener("resize", updateEdges);
    const resize =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(updateEdges);
    resize?.observe(list);
    if (list.firstElementChild) resize?.observe(list.firstElementChild);
    return () => {
      list.removeEventListener("scroll", updateEdges);
      window.removeEventListener("resize", updateEdges);
      resize?.disconnect();
    };
  }, [view, savedCharacters, burn]);
  useEffect(() => {
    if (view === "saved" && !leaving && !loading) return;
    setArmedId(null);
    setBurn(null);
    burnLock.current = false;
    reflow.current.clear();
    focusAfterDelete.current = null;
    revision.current++;
    reflowAnimations.current.forEach((animation) => animation.cancel());
    reflowing.current = false;
  }, [view, leaving, loading]);
  useEffect(() => {
    if (
      armedId &&
      !savedCharacters.some((character) => character.id === armedId)
    )
      setArmedId(null);
  }, [armedId, savedCharacters]);
  useEffect(
    () => () => {
      revision.current++;
      reflowAnimations.current.forEach((animation) => animation.cancel());
    },
    [],
  );
  useEffect(() => {
    if (!burn || view !== "saved" || leaving) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      reflow.current.clear();
      savedList.current
        ?.querySelectorAll<HTMLElement>("[data-character-id]")
        .forEach((card) => {
          if (card.dataset.characterId !== burn.character.id)
            reflow.current.set(
              card.dataset.characterId!,
              card.getBoundingClientRect(),
            );
        });
      focusAfterDelete.current = burn.index;
      setBurn(null);
      burnLock.current = false;
    };
    finishBurn.current = finish;
    // Player completion and the final fade own the normal sequence. These
    // bounded fallbacks also finish if a tab is hidden or an asset fails.
    const delay =
      burn.phase === "loading"
        ? 4000
        : burn.phase === "playing"
          ? 2600
          : burn.phase === "charred"
            ? 120
            : preference.matches
              ? 240
              : 360;
    const timer = window.setTimeout(() => {
      if (burn.phase === "fading") finish();
      else
        setBurn((current) =>
          current
            ? {
                ...current,
                phase: burn.phase === "charred" ? "fading" : "charred",
              }
            : current,
        );
    }, delay);
    const changed = () => {
      if (preference.matches)
        setBurn((current) =>
          current ? { ...current, phase: "fading" } : current,
        );
    };
    preference.addEventListener("change", changed);
    return () => {
      finishBurn.current = null;
      clearTimeout(timer);
      preference.removeEventListener("change", changed);
    };
  }, [burn, view, leaving]);
  useLayoutEffect(() => {
    if (burn || focusAfterDelete.current === null) return;
    const index = focusAfterDelete.current;
    focusAfterDelete.current = null;
    const previous = reflow.current;
    reflow.current = new Map();
    const cards = Array.from(
      savedList.current?.querySelectorAll<HTMLElement>("[data-character-id]") ||
        [],
    );
    const positions = cards.map((card) => ({
      card,
      old: previous.get(card.dataset.characterId!),
      next: card.getBoundingClientRect(),
    }));
    const ticket = ++revision.current;
    reflowing.current = true;
    reflowAnimations.current.forEach((animation) => animation.cancel());
    reflowAnimations.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
      ? []
      : positions.flatMap(({ card, old, next }) => {
          if (!old || typeof card.animate !== "function") return [];
          const x = old.left - next.left,
            y = old.top - next.top;
          if (Math.abs(x) < 0.5 && Math.abs(y) < 0.5) return [];
          return [
            card.animate(
              [
                { transform: `translate(${x}px, ${y}px)` },
                { transform: "translate(0, 0)" },
              ],
              { duration: 260, easing: "cubic-bezier(.2,.8,.2,1)" },
            ),
          ];
        });
    const focus = () => {
      if (revision.current !== ticket) return;
      const remaining = savedList.current?.querySelectorAll<HTMLButtonElement>(
        ".saved-character-open",
      );
      const target =
        remaining?.[Math.min(index, remaining.length - 1)] ||
        savedTitle.current;
      target?.focus({ preventScroll: true });
      reflowing.current = false;
      reflowAnimations.current = [];
    };
    if (reflowAnimations.current.length)
      void Promise.allSettled(
        reflowAnimations.current.map((animation) => animation.finished),
      ).then(focus);
    else focus();
  }, [burn, savedCharacters]);
  const changeView = (next: "actions" | "saved") => {
    setArmedId(null);
    setView(next);
    requestAnimationFrame(() =>
      (next === "saved" ? savedTitle.current : optionsTitle.current)?.focus({
        preventScroll: true,
      }),
    );
  };
  const keepFocusedCardVisible = (target: EventTarget) => {
    if (reflowing.current || burnLock.current) return;
    const list = savedList.current;
    const card =
      target instanceof Element
        ? target.closest<HTMLElement>(".saved-character-card")
        : null;
    if (!list || !card) return;
    const bounds = list.getBoundingClientRect();
    const item = card.getBoundingClientRect();
    const gutter = 20;
    if (item.top < bounds.top + gutter)
      list.scrollTop += item.top - bounds.top - gutter;
    else if (item.bottom > bounds.bottom - gutter)
      list.scrollTop += item.bottom - bounds.bottom + gutter;
  };
  const deleteCharacter = (character: SavedCharacterSummary, index: number) => {
    if (burnLock.current || loading || leaving) return;
    if (armedId !== character.id) {
      setArmedId(character.id);
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        void prepareOriginalFire().catch(() => {});
      return;
    }
    setArmedId(null);
    burnLock.current = true;
    if (!onDeleteSaved(character.id)) {
      burnLock.current = false;
      return;
    }
    setBurn({
      character,
      index,
      phase: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "fading"
        : "loading",
    });
    setDeletionNotice(
      `${t("Character deleted", locale)}: ${character.name || t("Unnamed character", locale)}`,
    );
  };
  const displayedCharacters = [...savedCharacters];
  if (
    burn &&
    !displayedCharacters.some((character) => character.id === burn.character.id)
  ) {
    displayedCharacters.splice(
      Math.min(burn.index, displayedCharacters.length),
      0,
      burn.character,
    );
  }
  const armedButton = armedId ? deleteButtons.current.get(armedId) : null;
  const dateLabel = (updatedAt: number | string) => {
    const date = new Date(updatedAt);
    return Number.isNaN(date.getTime())
      ? "—"
      : new Intl.DateTimeFormat(locale === "hr" ? "hr-HR" : "en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(date);
  };
  const welcome = locale === "hr" ? "Dobro došli." : "Welcome.";
  const actions = [
    {
      id: "saved" as const,
      title: "Saved characters",
      description: "Resume a character saved in this browser.",
      action: () => changeView("saved"),
      badge: "",
    },
    {
      id: "new" as const,
      title: "Create a new character",
      description:
        "Start fresh. We’ll guide you through ancestry, classes, abilities, equipment, and spells.",
      action: onNew,
      badge: "",
    },
    {
      id: "json" as const,
      title: "Import JSON",
      description:
        "Restore a character exported by this app, including its choices and level history.",
      action: onJSON,
      badge: "Recommended",
    },
    {
      id: "pdf" as const,
      title: "Import PDF",
      description:
        "Open a filled character sheet and review the recognized details before importing.",
      action: onPDF,
      badge: "May need review",
    },
  ];
  return (
    <div
      className={`welcome-screen ${leaving ? "is-leaving" : ""}`}
      aria-busy={leaving || loading || undefined}
    >
      <div className="welcome-atmosphere" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((bubble) => (
          <span className={`welcome-bubble bubble-${bubble}`} key={bubble} />
        ))}
      </div>
      {showHeader && (
        <header className="welcome-header">
          <Brand />
          <LanguageSwitch
            locale={locale}
            onChange={onLocaleChange}
            disabled={leaving || loading}
          />
        </header>
      )}
      {children}
      <div className="welcome-layout">
        <section className="welcome-copy" aria-labelledby="welcome-title">
          <p className="welcome-kicker">A new story starts here.</p>
          <h1
            id="welcome-title"
            className="welcome-title"
            aria-label={welcome}
            tabIndex={-1}
            ref={title}
          >
            <span
              className="welcome-title-visual"
              aria-hidden="true"
              key={locale}
            >
              {Array.from(welcome).map((letter, index) => (
                <span
                  className="welcome-letter-entry"
                  key={index}
                  style={{ "--letter-index": index } as CSSProperties}
                >
                  <span className="welcome-letter-wave">{letter}</span>
                </span>
              ))}
            </span>
          </h1>
          <p className="welcome-description">
            Build your D&D character one choice at a time. Explore the 2014
            Player’s Handbook rules with clear explanations, then bring your
            hero to the table with a complete character sheet.
          </p>
          <p className="welcome-privacy">
            <span aria-hidden="true">◇</span> No account. No server. Your
            adventure stays in your browser.
          </p>
        </section>
        <section
          className="welcome-start"
          aria-labelledby={
            view === "saved"
              ? "saved-characters-title"
              : "welcome-options-title"
          }
        >
          {view === "saved" ? (
            <div className="saved-character-panel">
              <header className="saved-character-heading">
                <div>
                  <p className="eyebrow">Saved characters</p>
                  <h2
                    id="saved-characters-title"
                    tabIndex={-1}
                    ref={savedTitle}
                  >
                    Choose a character to continue.
                  </h2>
                </div>
                <button
                  type="button"
                  className="quiet-button saved-character-back"
                  disabled={leaving || loading}
                  onClick={() => changeView("actions")}
                >
                  <span aria-hidden="true">←</span> Back
                </button>
              </header>
              <div
                className="saved-character-scroll"
                ref={savedList}
                data-fade-top={scrollEdges.top || undefined}
                data-fade-bottom={scrollEdges.bottom || undefined}
                onFocusCapture={(event) => keepFocusedCardVisible(event.target)}
              >
                {displayedCharacters.length ? (
                  <ul className="saved-character-grid">
                    {displayedCharacters.map((character, index) => (
                      <li
                        className={`saved-character-card${burn?.character.id === character.id ? " is-burning" : ""}`}
                        key={character.id}
                        data-character-id={character.id}
                        data-burn-phase={
                          burn?.character.id === character.id
                            ? burn.phase
                            : undefined
                        }
                        aria-busy={
                          burn?.character.id === character.id || undefined
                        }
                        onAnimationEnd={(event) => {
                          if (
                            event.target === event.currentTarget &&
                            (event.animationName === "saved-card-disappear" ||
                              event.animationName === "saved-card-reduced-fade")
                          )
                            finishBurn.current?.();
                        }}
                      >
                        <button
                          type="button"
                          className="saved-character-open"
                          disabled={
                            leaving ||
                            loading ||
                            burn?.character.id === character.id
                          }
                          onClick={() => onOpenSaved(character.id)}
                        >
                          <span
                            className="saved-character-name"
                            data-player-text={Boolean(character.name)}
                          >
                            {character.name || "Unnamed character"}
                          </span>
                          <span className="saved-character-lineage">
                            {[
                              character.race,
                              character.lineage !== character.race
                                ? character.lineage
                                : "",
                            ]
                              .filter(Boolean)
                              .join(" · ") || "Not chosen yet"}
                          </span>
                          <span className="saved-character-classes">
                            {character.classSummary || "Not chosen yet"}
                          </span>
                          <span className="saved-character-updated">
                            <span>Last saved</span>
                            <time
                              dateTime={
                                Number.isNaN(
                                  new Date(character.updatedAt).getTime(),
                                )
                                  ? undefined
                                  : new Date(character.updatedAt).toISOString()
                              }
                            >
                              {dateLabel(character.updatedAt)}
                            </time>
                          </span>
                          <span className="saved-character-tags">
                            {character.unfinished && (
                              <span className="saved-character-tag unfinished">
                                Unfinished
                              </span>
                            )}
                            {character.active && (
                              <span className="saved-character-tag">
                                Current character
                              </span>
                            )}
                          </span>
                          <OptionEffects />
                        </button>
                        <button
                          type="button"
                          className="saved-character-delete"
                          ref={(node) => {
                            if (node)
                              deleteButtons.current.set(character.id, node);
                            else deleteButtons.current.delete(character.id);
                          }}
                          disabled={leaving || loading || Boolean(burn)}
                          data-delete-armed={
                            armedId === character.id || undefined
                          }
                          aria-describedby={
                            armedId === character.id
                              ? confirmationId
                              : undefined
                          }
                          aria-pressed={armedId === character.id}
                          aria-label={
                            locale === "hr"
                              ? `Izbriši lika: ${character.name || "Neimenovani lik"}`
                              : `Delete character: ${character.name || "Unnamed character"}`
                          }
                          title={
                            armedId === character.id
                              ? undefined
                              : t("Delete character", locale)
                          }
                          onClick={() => deleteCharacter(character, index)}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            aria-hidden="true"
                          >
                            <path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6m4-6v6" />
                          </svg>
                        </button>
                        {burn?.character.id === character.id && (
                          <CardBurn
                            onStart={() =>
                              setBurn((current) =>
                                current?.phase === "loading"
                                  ? { ...current, phase: "playing" }
                                  : current,
                              )
                            }
                            onComplete={() =>
                              setBurn((current) =>
                                current &&
                                (current.phase === "loading" ||
                                  current.phase === "playing")
                                  ? { ...current, phase: "charred" }
                                  : current,
                              )
                            }
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="saved-character-empty">
                    <StartIcon kind="saved" />
                    <strong>No saved characters yet.</strong>
                    <p>
                      Create a character or import a file to start your library.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <p className="eyebrow">Choose your starting point</p>
              <h2 id="welcome-options-title" ref={optionsTitle} tabIndex={-1}>
                How would you like to begin?
              </h2>
              <div className="welcome-options">
                {actions.map((action, index) => (
                  <div
                    className="welcome-option-entry"
                    key={action.id}
                    style={{ "--option-index": index } as CSSProperties}
                  >
                    <button
                      type="button"
                      className={`welcome-option welcome-option-${action.id}`}
                      onClick={action.action}
                      disabled={leaving || loading}
                    >
                      <span className="welcome-option-icon">
                        <StartIcon kind={action.id} />
                      </span>
                      <span className="welcome-option-copy">
                        <strong>{action.title}</strong>
                        {action.badge && (
                          <span
                            className={`welcome-option-badge welcome-option-badge-${action.id}`}
                          >
                            {action.badge}
                          </span>
                        )}
                        <small>{action.description}</small>
                      </span>
                      <span className="welcome-option-arrow" aria-hidden="true">
                        ↗
                      </span>
                      <OptionEffects />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
          <p className="welcome-loading" role="status">
            {loading
              ? "Reading your character file…"
              : leaving
                ? "Opening your character builder…"
                : ""}
          </p>
        </section>
      </div>
      <span
        className="sr-only"
        role="status"
        aria-live="polite"
        data-player-text
      >
        {deletionNotice}
      </span>
      {view === "saved" && !leaving && !loading && armedButton && (
        <DeleteConfirmation
          key={armedId}
          anchor={armedButton}
          scroller={savedList.current}
          id={confirmationId}
          locale={locale}
          onDismiss={() => setArmedId(null)}
        />
      )}
    </div>
  );
}
