import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hoverTargets =
  ".choice-card, .skill-option, .language-choice, .spell-option, .spell-detail, .inventory-item, .equipment-option, .selected-spells .quiet-button, .check-row, .locale-switch button, .welcome-option, .saved-character-open";

function selectedOption(target: HTMLElement) {
  if (target.matches(".inventory-item, .equipment-option")) return false;
  return (
    target.matches(
      ".selected, .skill-selected, .is-selected, .spell-selected, [aria-pressed='true'], .locale-switch button.active, .selected-spells .quiet-button",
    ) || Boolean(target.querySelector<HTMLInputElement>("input:checked"))
  );
}

/** Pointer motion uses local CSS variables, never character state. */
export function useCursorSpotlight(
  root: RefObject<HTMLElement>,
  stage: number,
  surface?: string,
) {
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let active: HTMLElement | null = null;
    let held: HTMLElement | null = null;
    let frame = 0;
    let pointer: PointerEvent | null = null;
    let reflectionSize = 0;
    let x = 0,
      y = 0,
      tiltX = 0,
      tiltY = 0,
      normalizedX = 0.5,
      normalizedY = 0.5;
    const springs = new Map<HTMLElement, Animation>();
    const hoverHandoffs = new Map<HTMLElement, Animation>();
    const waves = new Map<HTMLElement, ReturnType<typeof setTimeout>>();
    const clicked = new WeakMap<HTMLElement, number>();
    const released = new WeakMap<HTMLElement, number>();
    const pendingFrames = new Set<number>();
    const targetFor = (event: Event) => {
      const target =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>(hoverTargets)
          : null;
      if (
        !target ||
        !node.contains(target) ||
        target.closest("[inert]") ||
        target.matches(":disabled, [aria-disabled='true'], .skill-disabled") ||
        target.querySelector<HTMLInputElement>("input")?.disabled
      )
        return null;
      return target;
    };
    const spotlight = (target: HTMLElement, enabled: boolean) => {
      const beforeStyle = getComputedStyle(target);
      const before = Number.parseFloat(beforeStyle.scale) || 1;
      const radius = beforeStyle.borderTopLeftRadius;
      hoverHandoffs.get(target)?.cancel();
      if (enabled) {
        target.removeAttribute("data-motion-returning");
        target.style.setProperty("--effect-radius", radius);
        target.setAttribute("data-spotlight", "active");
        target.toggleAttribute(
          "data-motion-expanded",
          target.matches("details[open]"),
        );
      } else {
        target.setAttribute("data-motion-returning", "");
        target.removeAttribute("data-spotlight");
      }
      // Removing a CSS breathing animation bypasses CSS transitions. Preserve
      // its visible scale, then blend to the new underlying hover state.
      const after = Number.parseFloat(getComputedStyle(target).scale) || 1;
      if (
        preference.matches ||
        !target.isConnected ||
        typeof target.animate !== "function"
      ) {
        target.removeAttribute("data-motion-returning");
        return;
      }
      const animation = target.animate(
        [{ scale: before / after }, { scale: 1 }],
        {
          duration: 280,
          easing: "cubic-bezier(.25,.1,.25,1)",
          composite: "add",
        },
      );
      hoverHandoffs.set(target, animation);
      void animation.finished
        .catch(() => {})
        .then(() => {
          if (hoverHandoffs.get(target) === animation) {
            hoverHandoffs.delete(target);
            target.removeAttribute("data-motion-returning");
          }
        });
    };
    const clear = () => {
      if (active) spotlight(active, false);
      active = null;
      pointer = null;
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const toggle = (event: Event) => {
      // Apply the expanded reading scale through the same handoff, after the
      // native accordion changes state, without replacing its click spring.
      if (event.target === active && active) spotlight(active, true);
    };
    const coordinates = (
      target: HTMLElement,
      clientX: number,
      clientY: number,
    ) => {
      const rect = target.getBoundingClientRect();
      const localX = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const localY = Math.max(0, Math.min(rect.height, clientY - rect.top));
      return { x: localX, y: localY, width: rect.width, height: rect.height };
    };
    const paint = () => {
      if (!active?.isConnected) return clear();
      active.style.setProperty("--cursor-x", `${x}px`);
      active.style.setProperty("--cursor-y", `${y}px`);
      // A width-based reflection plane keeps its facets stable as an
      // accordion changes height. Pointer movement can still move the glass.
      active.style.setProperty("--reflection-size", `${reflectionSize}px`);
      active.style.setProperty("--tilt-x", `${tiltX}deg`);
      active.style.setProperty("--tilt-y", `${tiltY}deg`);
      active.style.setProperty("--reflection-x", `${20 + normalizedX * 60}%`);
      active.style.setProperty("--reflection-y", `${20 + normalizedY * 60}%`);
      active.style.setProperty(
        "--reflection-angle",
        `${110 + (normalizedX - 0.5) * 12}deg`,
      );
      active.style.setProperty(
        "--reflection-secondary",
        `${Math.max(0, Math.min(1, (normalizedX + normalizedY - 1.1) / 0.55))}`,
      );
    };
    const track = (event: PointerEvent) => {
      if (event.pointerType === "touch" || preference.matches) return clear();
      pointer = event;
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          const event = pointer;
          if (!event) return;
          const target = targetFor(event);
          if (!target) return clear();
          // Batch geometry reads before style writes, once per rendered frame.
          const point = coordinates(target, event.clientX, event.clientY);
          reflectionSize = target.clientWidth * 2;
          x = point.x;
          y = point.y;
          normalizedX = x / Math.max(1, point.width);
          normalizedY = y / Math.max(1, point.height);
          tiltX = (normalizedY - 0.5) * 7;
          tiltY = -(normalizedX - 0.5) * 7;
          if (active !== target) {
            if (active) spotlight(active, false);
            active = target;
            spotlight(target, true);
          }
          paint();
        });
    };
    const playSpring = (target: HTMLElement, pressing: boolean) => {
      if (
        preference.matches ||
        !target.isConnected ||
        // Expanding a scrolling accordion must not enlarge its reading surface.
        target.matches(".spell-results .spell-detail") ||
        typeof target.animate !== "function"
      )
        return;
      // Transform the containing card rather than its summary: transforming
      // a summary temporarily changes the absolute lighting layer's bounds.
      const surface = target;
      const accordion = target.matches(".inventory-item, .equipment-option");
      const combinedScale =
        Number.parseFloat(getComputedStyle(surface).scale) || 1;
      springs.get(target)?.cancel();
      const hoverScale =
        Number.parseFloat(getComputedStyle(surface).scale) || 1;
      const current = combinedScale / hoverScale;
      // A separate multiplier lets hover/breathing continue throughout the pop.
      // Returning to 1 never takes over or drops the current hover scale.
      const animation = surface.animate(
        pressing
          ? [{ scale: current }, { scale: accordion ? 0.988 : 0.965 }]
          : [
              { scale: current, offset: 0 },
              { scale: accordion ? 1.012 : 1.027, offset: 0.44 },
              { scale: 0.994, offset: 0.76 },
              { scale: 1, offset: 1 },
            ],
        {
          duration: pressing ? 95 : 460,
          easing: pressing
            ? "cubic-bezier(.3,0,.6,1)"
            : "cubic-bezier(.22,.75,.35,1)",
          fill: pressing ? "forwards" : "none",
          composite: "add",
        },
      );
      springs.set(target, animation);
      void animation.finished
        .catch(() => {})
        .then(() => {
          if (!pressing && springs.get(target) === animation)
            springs.delete(target);
        });
    };
    const press = (event: PointerEvent) => {
      if (preference.matches || event.button !== 0) return;
      const target = targetFor(event);
      if (!target) return;
      if (
        target.matches(".inventory-item, .equipment-option") &&
        (event.target as Element).closest("input, select, textarea")
      )
        return;
      held = target;
      target.setAttribute("data-press-held", "");
      playSpring(target, true);
    };
    const release = () => {
      if (!held) return;
      const target = held;
      held = null;
      target.removeAttribute("data-press-held");
      released.set(target, performance.now());
      playSpring(target, false);
    };
    const click = (event: MouseEvent) => {
      if (preference.matches) return;
      const target = targetFor(event);
      if (!target) return;
      if (
        target.matches(".inventory-item, .equipment-option") &&
        !(event.target as Element).closest("button") &&
        !target
          .querySelector(":scope > summary")
          ?.contains(event.target as Node)
      )
        return;
      if (
        target.matches(".spell-detail") &&
        !(event.target as Element).closest("button")
      )
        return;
      const now = performance.now();
      if (now - (clicked.get(target) || -Infinity) < 100) return;
      clicked.set(target, now);
      if (now - (released.get(target) || -Infinity) > 100)
        playSpring(target, false);
      const point =
        event.detail === 0
          ? {
              x: target.clientWidth / 2,
              y: target.clientHeight / 2,
              width: target.clientWidth,
              height: target.clientHeight,
            }
          : coordinates(target, event.clientX, event.clientY);
      const pending = requestAnimationFrame(() => {
        pendingFrames.delete(pending);
        if (!target.isConnected) return;
        clearTimeout(waves.get(target));
        target.removeAttribute("data-click-wave");
        target.style.setProperty("--wave-x", `${point.x}px`);
        target.style.setProperty("--wave-y", `${point.y}px`);
        target.style.setProperty(
          "--wave-radius",
          `${Math.hypot(Math.max(point.x, point.width - point.x), Math.max(point.y, point.height - point.y)) + 12}px`,
        );
        const selected = selectedOption(target);
        const illustrated = target.matches(".choice-card--illustrated");
        target.style.setProperty(
          "--wave-white",
          illustrated
            ? "#ffffff26"
            : selected
              ? "var(--hover-selected)"
              : "#ffffff18",
        );
        target.style.setProperty(
          "--wave-yellow",
          illustrated
            ? "transparent"
            : selected
              ? "var(--fill-selected)"
              : "var(--panel-raised)",
        );
        // Restart a rapid second click without leaving stale wave layers behind.
        void target.offsetWidth;
        target.setAttribute("data-click-wave", "running");
        waves.set(
          target,
          setTimeout(() => {
            target.removeAttribute("data-click-wave");
            waves.delete(target);
          }, 780),
        );
      });
      pendingFrames.add(pending);
    };
    const reset = () => {
      clear();
      held?.removeAttribute("data-press-held");
      held = null;
      springs.forEach((animation) => animation.cancel());
      springs.clear();
      hoverHandoffs.forEach((animation) => animation.cancel());
      hoverHandoffs.clear();
      node
        .querySelectorAll("[data-motion-expanded], [data-motion-returning]")
        .forEach((target) => {
          target.removeAttribute("data-motion-expanded");
          target.removeAttribute("data-motion-returning");
        });
      waves.forEach((timer, target) => {
        clearTimeout(timer);
        target.removeAttribute("data-click-wave");
      });
      waves.clear();
      pendingFrames.forEach((id) => cancelAnimationFrame(id));
      pendingFrames.clear();
    };
    node.addEventListener("pointerover", track);
    node.addEventListener("pointermove", track);
    node.addEventListener("pointerleave", clear);
    node.addEventListener("pointerdown", press);
    node.addEventListener("click", click);
    node.addEventListener("toggle", toggle, true);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    preference.addEventListener("change", reset);
    return () => {
      reset();
      node.removeEventListener("pointerover", track);
      node.removeEventListener("pointermove", track);
      node.removeEventListener("pointerleave", clear);
      node.removeEventListener("pointerdown", press);
      node.removeEventListener("click", click);
      node.removeEventListener("toggle", toggle, true);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      preference.removeEventListener("change", reset);
    };
  }, [root, stage, surface]);
}

const motionTargets = [
  ".choice-card",
  ".skill-option",
  ".language-choice",
  ".check-row",
  ".field",
  ".section-title",
  ".detail-panel",
  ".sheet-card",
  ".ability-row",
  ".path-row",
  ".pick-summary",
  ".selected-summary",
  ".rules-strip",
  ".race-facts > div",
  ".race-trait-list > div",
  ".generated-feature-list > details",
  ".feature-group",
  ".story-fields > div",
  ".attack-list > div",
].join(",");

function visibleTargets(panel: HTMLElement) {
  const candidates = Array.from(
    panel.querySelectorAll<HTMLElement>(motionTargets),
  ).filter((element) => {
    const closed = element.closest("details:not([open])");
    if (closed && closed !== element) return false;
    const rect = element.getBoundingClientRect();
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      rect.bottom > 0 &&
      rect.top < innerHeight
    );
  });
  // Move each choice once, rather than moving both it and its parent panel.
  return candidates
    .filter(
      (parent) =>
        !candidates.some((child) => parent !== child && parent.contains(child)),
    )
    .sort((a, b) => {
      const first = a.getBoundingClientRect(),
        second = b.getBoundingClientRect();
      return Math.abs(first.top - second.top) > 12
        ? first.top - second.top
        : first.left - second.left;
    })
    .slice(0, 32);
}

function animateChoices(panel: HTMLElement, entering: boolean) {
  const targets = visibleTargets(panel);
  if (!targets.length)
    targets.push(panel.querySelector<HTMLElement>(".stage-body") || panel);
  let row = -1,
    lastTop = -Infinity;
  return targets.map((target) => {
    const top = target.getBoundingClientRect().top;
    if (Math.abs(top - lastTop) > 16) {
      row++;
      lastTop = top;
    }
    const delay = Math.min(row, entering ? 6 : 5) * (entering ? 45 : 32);
    return target.animate(
      entering
        ? [
            { opacity: 0, transform: "translate3d(64px, 14px, 0)" },
            { opacity: 1, transform: "translate3d(0, 0, 0)" },
          ]
        : [
            { opacity: 1, transform: "translate3d(0, 0, 0)" },
            { opacity: 0, transform: "translate3d(-88px, -3px, 0)" },
          ],
      {
        duration: entering ? 360 : 210,
        delay,
        easing: entering
          ? "cubic-bezier(.16,1,.3,1)"
          : "cubic-bezier(.55,0,1,.45)",
        fill: entering ? "backwards" : "forwards",
      },
    );
  });
}

async function settle(animations: Animation[], timeout: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  await Promise.race([
    Promise.allSettled(animations.map((animation) => animation.finished)),
    new Promise<void>((resolve) => {
      timer = setTimeout(resolve, timeout);
    }),
  ]);
  clearTimeout(timer);
}

/** Exit first, commit the next stage once, then stagger its visible choices. */
export function useStageMotion(
  stage: number,
  panel: RefObject<HTMLElement>,
  heading: RefObject<HTMLElement>,
) {
  const [phase, setPhase] = useState<"idle" | "exiting" | "entering">("idle");
  const previous = useRef(stage);
  const busy = useRef(false);
  const alive = useRef(true);
  const revision = useRef(0);
  const animations = useRef<Animation[]>([]);
  const after = useRef<(() => void) | undefined>();
  const cancel = () => {
    revision.current++;
    animations.current.forEach((animation) => animation.cancel());
    animations.current = [];
    busy.current = false;
    after.current = undefined;
    if (panel.current) panel.current.inert = false;
    if (alive.current) setPhase("idle");
  };
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      cancel();
    };
  }, []);

  useLayoutEffect(() => {
    if (previous.current === stage) return;
    previous.current = stage;
    animations.current.forEach((animation) => animation.cancel());
    animations.current = [];
    const node = panel.current;
    if (!node) return cancel();
    node
      .querySelectorAll("[data-spotlight]")
      .forEach((element) => element.removeAttribute("data-spotlight"));
    // Finish the scroll before measuring the incoming rows; CSS smooth scroll
    // would otherwise select and animate the wrong part of a long stage.
    const scrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ block: "start", behavior: "instant" });
    document.documentElement.style.scrollBehavior = scrollBehavior;
    const ticket = revision.current;
    const finish = () => {
      if (!alive.current || revision.current !== ticket) return;
      animations.current.forEach((animation) => animation.cancel());
      animations.current = [];
      node.inert = false;
      busy.current = false;
      setPhase("idle");
      const callback = after.current;
      after.current = undefined;
      callback?.();
    };
    if (reducedMotion() || typeof node.animate !== "function") return finish();
    busy.current = true;
    node.inert = true;
    setPhase("entering");
    animations.current = animateChoices(node, true);
    void settle(animations.current, 800).then(finish);
  }, [stage, panel, heading]);

  const navigate = async (commit: () => void, onComplete?: () => void) => {
    if (busy.current) return;
    busy.current = true;
    const ticket = ++revision.current;
    after.current = onComplete;
    const node = panel.current;
    if (node && !reducedMotion() && typeof node.animate === "function") {
      node
        .querySelectorAll<HTMLElement>("[data-spotlight], [data-click-wave]")
        .forEach((element) => {
          element.removeAttribute("data-spotlight");
          element.removeAttribute("data-click-wave");
        });
      node.inert = true;
      setPhase("exiting");
      animations.current = animateChoices(node, false);
      await settle(animations.current, 500);
    }
    if (alive.current && revision.current === ticket) commit();
  };
  return { phase, busy: phase !== "idle", navigate, cancel };
}
