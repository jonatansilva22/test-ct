import api from "./api.js";

export async function importPromotionsFromExcel(file, userId) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/promotions/import", formData, {
    params: { userId },
  });

  return response.data;
}
