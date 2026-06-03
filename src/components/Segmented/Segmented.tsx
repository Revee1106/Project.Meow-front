import { t } from "../../i18n/strings";

export interface SegmentOption<T extends string> {
  value: T;
  labelKey?: string;
  label?: string;
}

export interface SegmentedProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  ariaLabel: string;
  onChange: (value: T) => void;
}

export function Segmented<T extends string>({
  options,
  value,
  ariaLabel,
  onChange,
}: SegmentedProps<T>) {
  return (
    <div aria-label={ariaLabel} className="segmented" role="group">
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            aria-pressed={active}
            className={active ? "segmented__item is-active" : "segmented__item"}
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
          >
            {option.labelKey ? t(option.labelKey) : option.label}
          </button>
        );
      })}
    </div>
  );
}
