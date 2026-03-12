import { create } from 'zustand';

export type ToastTone = 'success' | 'error' | 'info';

interface ToastState {
  id: number;
  message: string;
  tone: ToastTone;
}

interface UiState {
  toast: ToastState | null;
  showToast: (message: string, tone?: ToastTone) => void;
  hideToast: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  toast: null,
  showToast(message, tone = 'info') {
    set({
      toast: {
        id: Date.now(),
        message,
        tone,
      },
    });
  },
  hideToast() {
    set({ toast: null });
  },
}));
