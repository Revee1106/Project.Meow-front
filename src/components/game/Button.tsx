import type { ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type ButtonProps = {
  children: ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  small?: boolean;
  type?: "button" | "submit";
  variant?: ButtonVariant;
  onClick?: () => void;
};

export function Button({
  children,
  disabled,
  fullWidth,
  small,
  type = "button",
  variant = "primary",
  onClick,
}: ButtonProps) {
  const className = [
    "tw-button",
    `tw-button--${variant}`,
    fullWidth ? "tw-button--full" : "",
    small ? "tw-button--small" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      aria-disabled={disabled ? "true" : undefined}
      className={className}
      disabled={disabled}
      type={type}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
