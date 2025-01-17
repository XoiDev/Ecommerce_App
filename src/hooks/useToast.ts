import { toast } from "react-toastify";

const useToast = () => {
  const notifySuccess = (message: string) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const notifyError = (message: string) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const notifyInfo = (message: string) => {
    toast.info(message, {
      position: "top-right",
      autoClose: 3000,
    });
  };

  return { notifySuccess, notifyError, notifyInfo };
};

export default useToast;
