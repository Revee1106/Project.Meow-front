export interface HPBarProps {
  value: number;
  side: "me" | "enemy";
}

export function HPBar({ value, side }: HPBarProps) {
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={pct}
      className={`hp-bar hp-bar--${side}`}
      role="progressbar"
    >
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}
