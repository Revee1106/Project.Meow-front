import { create } from "zustand";

type ConfirmOptions = {
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
  onConfirm: () => void;
};

type ToastOptions = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

type UiStore = {
  confirm: ConfirmOptions | null;
  toast: ToastOptions | null;
  openConfirm: (confirm: ConfirmOptions) => void;
  closeConfirm: () => void;
  showToast: (toast: ToastOptions) => void;
  closeToast: () => void;
};

export const useUiStore = create<UiStore>((set) => ({
  confirm: null,
  toast: null,
  openConfirm: (confirm) => set({ confirm }),
  closeConfirm: () => set({ confirm: null }),
  showToast: (toast) => set({ toast }),
  closeToast: () => set({ toast: null }),
}));
