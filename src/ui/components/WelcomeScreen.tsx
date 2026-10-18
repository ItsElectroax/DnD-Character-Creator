/** @jsxImportSource ../../i18n */
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { type Locale } from "../../i18n/engine";
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
  onDeleteSaved: (id: string) => void;
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
  const pendingDelete = useRef<{ id: string; index: number } | null>(null);
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
  }, [view, savedCharacters]);
  useEffect(() => {
    const deleted = pendingDelete.current;
    if (
      !deleted ||
      savedCharacters.some((character) => character.id === deleted.id)
    )
      return;
    pendingDelete.current = null;
    const remaining = savedList.current?.querySelectorAll<HTMLButtonElement>(
      ".saved-character-open",
    );
    (
      remaining?.[Math.min(deleted.index, remaining.length - 1)] ||
      savedTitle.current
    )?.focus();
  }, [savedCharacters]);
  const changeView = (next: "actions" | "saved") => {
    setView(next);
    requestAnimationFrame(() =>
      (next === "saved" ? savedTitle.current : optionsTitle.current)?.focus({
        preventScroll: true,
      }),
    );
  };
  const keepFocusedCardVisible = (target: EventTarget) => {
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
                {savedCharacters.length ? (
                  <ul className="saved-character-grid">
                    {savedCharacters.map((character, index) => (
                      <li className="saved-character-card" key={character.id}>
                        <button
                          type="button"
                          className="saved-character-open"
                          disabled={leaving || loading}
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
                          disabled={leaving || loading}
                          aria-label={
                            locale === "hr"
                              ? `Izbriši lika: ${character.name || "Neimenovani lik"}`
                              : `Delete character: ${character.name || "Unnamed character"}`
                          }
                          title="Delete character"
                          onClick={() => {
                            pendingDelete.current = { id: character.id, index };
                            onDeleteSaved(character.id);
                          }}
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
    </div>
  );
}
