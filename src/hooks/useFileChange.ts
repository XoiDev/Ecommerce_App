import { useState } from "react";
import api from "../api";

const useFileUpload = (uploadApiEndpoint: string) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<string | null> => {
    if (!file) return null;

    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    setError(null);

    try {
      const uploadResponse = await api.postForm(uploadApiEndpoint, formData);
      const imageUrl = uploadResponse.data.url.replace("htpp:", "http:");
      return imageUrl;
    } catch (err) {
      console.error("Error uploading file:", err);
      setError("Failed to upload file");
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadFile, uploading, error };
};

export default useFileUpload;
