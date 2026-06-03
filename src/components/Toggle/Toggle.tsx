export interface ToggleProps {
  checked: boolean;
  ariaLabel: string;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ checked, ariaLabel, disabled, onChange }: ToggleProps) {
  return (
    <button
      aria-label={ariaLabel}
      aria-pressed={checked}
      className={checked ? "toggle is-on" : "toggle"}
      disabled={disabled}
      type="button"
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  );
}
