import { useNavigate } from "react-router-dom";
import Message from "../components/Message.jsx";
import useUsers from "../hooks/useUsers.js";

function UserSelectPage() {
  const { users, error, isLoading } = useUsers();
  const navigate = useNavigate();

  function selectUser(user) {
    localStorage.setItem("selectedUser", JSON.stringify(user));
    navigate("/promotions");
  }

  return (
    <main className="page page--narrow">
      <header className="page-header">
        <p className="eyebrow">Promociones internas</p>
        <h1>Bienvenido</h1>
        <p>Selecciona el usuario para continuar.</p>
      </header>

      {isLoading && <Message>Cargando usuarios...</Message>}
      {error && <Message type="error">{error}</Message>}

      {!isLoading && !error && (
        <section className="user-list" aria-label="Usuarios">
          {users.map((user) => (
            <button
              className="user-card"
              key={user._id}
              onClick={() => selectUser(user)}
              type="button"
            >
              <span className="user-card__name">{user.name}</span>
              <span className="user-card__role">{user.role}</span>
            </button>
          ))}
        </section>
      )}
    </main>
  );
}

export default UserSelectPage;
