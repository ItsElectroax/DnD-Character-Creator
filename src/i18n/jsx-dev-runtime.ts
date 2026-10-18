import { jsxDEV as originalJsxDEV } from "react/jsx-dev-runtime";
import { prepare } from "./jsx-runtime";
export { Fragment } from "react/jsx-dev-runtime";
export type { JSX } from "react/jsx-runtime";
export const jsxDEV: typeof originalJsxDEV = (
  type,
  props,
  key,
  isStaticChildren,
  source,
  self,
) =>
  originalJsxDEV(
    type,
    prepare(type, props),
    key,
    isStaticChildren,
    source,
    self,
  );
