import {
  Fragment,
  jsx as originalJsx,
  jsxs as originalJsxs,
} from "react/jsx-runtime";
import { t } from "./engine";
export type { JSX } from "react/jsx-runtime";
export { Fragment };
export function prepare(type: unknown, input: unknown) {
  const props = input as Record<string, unknown> | null;
  if (typeof type !== "string" || !props) return props;
  const next = { ...props };
  const skip = Boolean(next["data-player-text"]);
  if (
    type === "option" &&
    next.value === undefined &&
    (typeof props.children === "string" || typeof props.children === "number")
  )
    next.value = props.children;
  if (!skip) {
    const translate = (child: unknown): unknown =>
      typeof child === "string"
        ? t(child)
        : Array.isArray(child)
          ? child.map(translate)
          : child;
    next.children = translate(next.children);
    for (const key of ["title", "placeholder", "aria-label", "alt"])
      if (typeof next[key] === "string") next[key] = t(next[key] as string);
  }
  return next;
}
export const jsx: typeof originalJsx = (type, props, key) =>
  originalJsx(type, prepare(type, props), key);
export const jsxs: typeof originalJsxs = (type, props, key) =>
  originalJsxs(type, prepare(type, props), key);
