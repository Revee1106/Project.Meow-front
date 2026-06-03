import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  body?: string;
  action?: ReactNode;
};

export function EmptyState({ title, body, action }: EmptyStateProps) {
  return (
    <section className="empty-state">
      <div className="empty-state__mark" aria-hidden="true" />
      <h2>{title}</h2>
      {body ? <p>{body}</p> : null}
      {action ? <div className="empty-state__action">{action}</div> : null}
    </section>
  );
}
