export interface ProgressBarProps {
  value: number;
  variant?: "default" | "urgent" | "full";
}

export function ProgressBar({ value, variant = "default" }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={pct}
      className={`progress-bar progress-bar--${variant}`}
      role="progressbar"
    >
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}
