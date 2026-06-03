import { Button } from "./Button";

type ToastProps = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onClose: () => void;
};

export function Toast({ message, actionLabel, onAction, onClose }: ToastProps) {
  return (
    <section className="toast" role="status">
      <p>{message}</p>
      {actionLabel && onAction ? (
        <Button small variant="ghost" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
      <button className="toast__close" type="button" aria-label={message} onClick={onClose}>
        X
      </button>
    </section>
  );
}
