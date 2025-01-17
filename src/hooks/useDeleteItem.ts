import { useState } from "react";
import api from "../api";
import useToast from "./useToast";

const useDeleteItem = (url: string, token: any, setItems: any) => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { notifySuccess, notifyError } = useToast();
  const deleteItem = async (id: number) => {
    setIsLoading(true);
    setError(null); // Reset error trước khi thực hiện request
    try {
      await api.delete(`${url}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Cập nhật lại state sau khi xóa
      setItems((prevItems: any) => prevItems.filter((item) => item.id !== id));
      notifySuccess("Delete Successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete item.");
      notifyError("Failed Delete ");
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteItem, error, isLoading };
};

export default useDeleteItem;
