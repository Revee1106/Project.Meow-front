import { Button } from "./Button";

type ConfirmModalProps = {
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmModal({
  title,
  body,
  confirmLabel,
  cancelLabel,
  danger,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <>
      <button
        className="modal-scrim"
        type="button"
        aria-label={cancelLabel}
        onClick={onCancel}
      />
      <section className="confirm-modal" role="dialog" aria-modal="true">
        <h2>{title}</h2>
        <p>{body}</p>
        <div className="confirm-modal__actions">
          <Button fullWidth variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button fullWidth variant={danger ? "danger" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </section>
    </>
  );
}
