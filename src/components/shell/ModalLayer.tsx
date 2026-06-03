import { ConfirmModal } from "../game/ConfirmModal";
import { Toast } from "../game/Toast";
import { useUiStore } from "../../stores/uiStore";

export function ModalLayer() {
  const confirm = useUiStore((store) => store.confirm);
  const toast = useUiStore((store) => store.toast);
  const closeConfirm = useUiStore((store) => store.closeConfirm);
  const closeToast = useUiStore((store) => store.closeToast);

  return (
    <div id="modal-layer" className="modal-layer">
      {confirm ? (
        <ConfirmModal
          body={confirm.body}
          cancelLabel={confirm.cancelLabel}
          confirmLabel={confirm.confirmLabel}
          danger={confirm.danger}
          title={confirm.title}
          onCancel={closeConfirm}
          onConfirm={() => {
            confirm.onConfirm();
            closeConfirm();
          }}
        />
      ) : null}
      {toast ? (
        <Toast
          actionLabel={toast.actionLabel}
          message={toast.message}
          onAction={toast.onAction}
          onClose={closeToast}
        />
      ) : null}
    </div>
  );
}
