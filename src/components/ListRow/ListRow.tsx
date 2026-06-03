import type { ReactNode } from "react";

export interface ListRowProps {
  icon?: ReactNode;
  title: string;
  subtitle?: ReactNode;
  right?: ReactNode;
  unread?: boolean;
  danger?: boolean;
  onClick?: () => void;
}

export function ListRow({
  icon,
  title,
  subtitle,
  right,
  unread,
  danger,
  onClick,
}: ListRowProps) {
  const Element = onClick ? "button" : "div";

  return (
    <Element
      className={[
        "list-row",
        unread ? "list-row--unread" : "",
        danger ? "list-row--danger" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      type={onClick ? "button" : undefined}
      onClick={onClick}
    >
      {icon ? <span className="list-row__icon">{icon}</span> : null}
      <span className="list-row__main">
        <span className="list-row__title">
          {title}
          {unread ? <em aria-hidden="true" /> : null}
        </span>
        {subtitle ? <span className="list-row__subtitle">{subtitle}</span> : null}
      </span>
      {right ? <span className="list-row__right">{right}</span> : null}
    </Element>
  );
}
