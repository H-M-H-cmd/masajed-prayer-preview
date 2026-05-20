import { toast } from "sonner";

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 3000,
    });
  },
  error: (message: string) => {
    toast.error(message, {
      duration: 4000,
    });
  },
  warning: (message: string) => {
    toast.warning(message, {
      duration: 4000,
    });
  },
  info: (message: string) => {
    toast.info(message, {
      duration: 3000,
    });
  },
  loading: (message: string) => {
    return toast.loading(message);
  },
  promise: async <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });
  },
}; 