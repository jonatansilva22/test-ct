import api from "./api.js";

export async function getPromotions(userId, status) {
  const response = await api.get("/promotions", {
    params: { userId, status },
  });

  return response.data;
}

export async function createPromotion(userId, promotion) {
  const response = await api.post("/promotions", promotion, {
    params: { userId },
  });

  return response.data;
}

export async function updatePromotion(userId, promotionId, promotion) {
  const response = await api.put(`/promotions/${promotionId}`, promotion, {
    params: { userId },
  });

  return response.data;
}

export async function changePromotionStatus(userId, promotionId, data) {
  const response = await api.patch(
    `/promotions/${promotionId}/status`,
    data,
    { params: { userId } }
  );

  return response.data;
}
