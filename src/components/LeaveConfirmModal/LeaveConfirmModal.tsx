import { Button } from "../game/Button";

export interface LeaveConfirmModalProps {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  pending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function LeaveConfirmModal({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel,
  pending,
  onCancel,
  onConfirm,
}: LeaveConfirmModalProps) {
  if (!open) {
    return null;
  }

  return (
    <>
      <button className="sheet-scrim leave-modal__scrim" type="button" onClick={onCancel} />
      <section aria-modal="true" className="leave-modal" role="dialog">
        <div className="node-sheet__grabber" aria-hidden="true" />
        <div className="leave-modal__mark" aria-hidden="true">
          !
        </div>
        <h2 className="tw-display">{title}</h2>
        <p>{body}</p>
        <div className="leave-modal__actions">
          <Button disabled={pending} fullWidth variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
          <Button disabled={pending} fullWidth variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
        </div>
      </section>
    </>
  );
}
