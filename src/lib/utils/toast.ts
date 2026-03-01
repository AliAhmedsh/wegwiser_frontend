import { toast } from 'react-toastify';

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  },

  error: (message: string) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  },

  warning: (message: string) => {
    toast.warning(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  },

  info: (message: string) => {
    toast.info(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  },

  loading: (message: string) => {
    return toast.loading(message, {
      position: "top-right",
      closeOnClick: false,
      pauseOnHover: false,
      draggable: false,
    });
  },

  updateSuccess: (toastId: string | number, message: string) => {
    toast.update(toastId, {
      render: message,
      type: 'success',
      isLoading: false,
      autoClose: 3000,
      closeOnClick: true,
      draggable: true,
    });
  },

  updateError: (toastId: string | number, message: string) => {
    toast.update(toastId, {
      render: message,
      type: 'error',
      isLoading: false,
      autoClose: 5000,
      closeOnClick: true,
      draggable: true,
    });
  }
};
