import { useEffect, useState } from "react";
import { getPromotions } from "../services/promotionService.js";

function usePromotions(userId, status) {
  const [promotions, setPromotions] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    if (!userId) return undefined;

    let isActive = true;

    async function loadPromotions() {
      setIsLoading(true);
      setError("");

      try {
        const result = await getPromotions(userId, status);
        if (isActive) setPromotions(result);
      } catch (requestError) {
        if (isActive) {
          setError(
            requestError.response?.data?.error ||
              "No se pudieron cargar las promociones."
          );
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    loadPromotions();
    return () => {
      isActive = false;
    };
  }, [refreshCount, status, userId]);

  function refresh() {
    setRefreshCount((count) => count + 1);
  }

  return { promotions, error, isLoading, refresh };
}

export default usePromotions;
