/** Decorative layers share pointer variables without changing option semantics. */
export function OptionEffects() {
  return (
    <span className="option-effects" aria-hidden="true">
      <span className="option-glow" />
      <span className="option-reflection" />
      <span className="option-reflection-secondary" />
      <span className="option-wave-white" />
      <span className="option-wave-yellow" />
    </span>
  );
}
