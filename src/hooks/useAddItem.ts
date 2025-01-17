import { useState } from "react";
import api from "../api";
import useToast from "./useToast";
interface UseAddItemProps<T> {
  url: string;
  token: string;
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
}
const useAddItem = <T>({ url, token, setItems }: UseAddItemProps<T>) => {
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const { notifySuccess, notifyError } = useToast();
  const addItem = async (newItem: object) => {
    try {
      const response = await api.post(url, newItem, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setItems((prevItems: any) => [...prevItems, response.data]);
      setShowAddModal(false);
      notifySuccess("Delete Successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to add item.");
      notifyError("Failed Delete ");
    }
  };

  return { addItem, error };
};

export default useAddItem;
