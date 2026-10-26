import { useEffect, useState } from "react";
import { getUsers } from "../services/userService.js";

function useUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadUsers() {
      try {
        const result = await getUsers();
        if (isActive) setUsers(result);
      } catch (requestError) {
        if (isActive) {
          setError(
            requestError.response?.data?.error ||
              "No se pudieron cargar los usuarios. Verifica que el backend esté iniciado."
          );
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    loadUsers();
    return () => {
      isActive = false;
    };
  }, []);

  return { users, error, isLoading };
}

export default useUsers;
