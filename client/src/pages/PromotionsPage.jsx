import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Message from "../components/Message.jsx";
import PromotionExcelImport from "../components/PromotionExcelImport.jsx";
import PromotionForm from "../components/PromotionForm.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import usePromotions from "../hooks/usePromotions.js";
import {
  changePromotionStatus,
  createPromotion,
  updatePromotion,
} from "../services/promotionService.js";

function formatAmount(amount) {
  if (amount && typeof amount === "object" && "$numberDecimal" in amount) {
    return amount.$numberDecimal;
  }

  return amount;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("es-MX", { timeZone: "UTC" });
}

function getRequestErrorMessage(requestError, fallback) {
  const responseData = requestError.response?.data;
  const details = responseData?.details;

  if (details) {
    return Object.values(details).join(" ");
  }

  return responseData?.error || fallback;
}

function PromotionsPage() {
  const user = useMemo(() => {
    const storedUser = localStorage.getItem("selectedUser");
    return storedUser ? JSON.parse(storedUser) : null;
  }, []);
  const [status, setStatus] = useState("all");
  const { promotions, error, isLoading, refresh } = usePromotions(
    user?._id,
    status
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [workingPromotionId, setWorkingPromotionId] = useState("");
  const [rejectingPromotionId, setRejectingPromotionId] = useState("");
  const [rejectComment, setRejectComment] = useState("");
  const isRequester = user?.role === "solicitante";
  const isAdministrator = user?.role === "administrador";

  if (!user) {
    return <Navigate to="/" replace />;
  }

  function openCreateForm() {
    setEditingPromotion(null);
    setActionError("");
    setSuccessMessage("");
    setIsFormOpen(true);
  }

  function openEditForm(promotion) {
    setEditingPromotion(promotion);
    setActionError("");
    setSuccessMessage("");
    setIsFormOpen(true);
  }

  async function savePromotion(values) {
    setIsSaving(true);
    setActionError("");
    setSuccessMessage("");

    try {
      if (editingPromotion) {
        await updatePromotion(user._id, editingPromotion._id, values);
        setSuccessMessage("La promoción se actualizó correctamente.");
      } else {
        await createPromotion(user._id, values);
        setSuccessMessage("La promoción se registró correctamente.");
      }

      setIsFormOpen(false);
      setEditingPromotion(null);
      refresh();
    } catch (requestError) {
      setActionError(
        getRequestErrorMessage(requestError, "No se pudo guardar la promoción.")
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function approvePromotion(promotionId) {
    setWorkingPromotionId(promotionId);
    setActionError("");
    setSuccessMessage("");

    try {
      await changePromotionStatus(user._id, promotionId, { status: 2 });
      setSuccessMessage("La promoción se aprobó correctamente.");
      refresh();
    } catch (requestError) {
      setActionError(
        getRequestErrorMessage(requestError, "No se pudo aprobar la promoción.")
      );
    } finally {
      setWorkingPromotionId("");
    }
  }

  async function rejectPromotion(promotionId) {
    if (!rejectComment.trim()) {
      setActionError("Escribe el motivo del rechazo.");
      return;
    }

    setWorkingPromotionId(promotionId);
    setActionError("");
    setSuccessMessage("");

    try {
      await changePromotionStatus(user._id, promotionId, {
        status: 3,
        comment: rejectComment,
      });
      setSuccessMessage("La promoción se rechazó correctamente.");
      setRejectingPromotionId("");
      setRejectComment("");
      refresh();
    } catch (requestError) {
      setActionError(
        getRequestErrorMessage(requestError, "No se pudo rechazar la promoción.")
      );
    } finally {
      setWorkingPromotionId("");
    }
  }

  return (
    <main className="page page--wide">
      <header className="page-header page-header--row">
        <div>
          <p className="eyebrow">Promociones internas</p>
          <h1>Solicitudes</h1>
          <p>
            Usuario: <strong>{user.name}</strong> ({user.role})
          </p>
        </div>
        <Link className="text-link" to="/">
          Cambiar usuario
        </Link>
      </header>

      {isRequester && (
        <section className="requester-tools">
          <button
            className="button button--primary"
            onClick={openCreateForm}
            type="button"
          >
            Registrar promoción
          </button>
          <PromotionExcelImport
            onImportComplete={refresh}
            userId={user._id}
          />
        </section>
      )}

      {actionError && <Message type="error">{actionError}</Message>}
      {successMessage && <Message type="success">{successMessage}</Message>}

      {isFormOpen && (
        <PromotionForm
          isSaving={isSaving}
          key={editingPromotion?._id || "new"}
          onCancel={() => setIsFormOpen(false)}
          onFieldChange={() => setActionError("")}
          onSubmit={savePromotion}
          promotion={editingPromotion}
        />
      )}

      <section className="toolbar">
        <label htmlFor="status-filter">Filtrar por estado</label>
        <select
          id="status-filter"
          onChange={(event) => setStatus(event.target.value)}
          value={status}
        >
          <option value="all">Todos</option>
          <option value="1">Pendiente</option>
          <option value="2">Aprobada</option>
          <option value="3">Rechazada</option>
        </select>
      </section>

      {isLoading && <Message>Cargando promociones...</Message>}
      {error && <Message type="error">{error}</Message>}
      {!isLoading && !error && promotions.length === 0 && (
        <p className="empty-state">No hay promociones para mostrar.</p>
      )}

      {!isLoading && !error && promotions.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {isAdministrator && <th>Solicitante</th>}
                <th>Producto</th>
                <th>Importe</th>
                <th>Fechas</th>
                <th>Estado</th>
                <th>Comentario</th>
                {(isRequester || isAdministrator) && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {promotions.map((promotion) => (
                <tr key={promotion._id}>
                  {isAdministrator && (
                    <td>{promotion.userId?.name || "Usuario no disponible"}</td>
                  )}
                  <td>{promotion.product}</td>
                  <td>
                    {formatAmount(promotion.amount)} {promotion.currency}
                  </td>
                  <td>
                    {formatDate(promotion.startDate)} –{" "}
                    {formatDate(promotion.endDate)}
                  </td>
                  <td>
                    <StatusBadge
                      status={promotion.status}
                      label={promotion.statusLabel}
                    />
                  </td>
                  <td className="comment-cell">{promotion.comment || "—"}</td>
                  {(isRequester || isAdministrator) && (
                    <td className="actions-cell">
                      {promotion.status === 1 &&
                        isRequester &&
                        user._id === promotion.userId && (
                          <button
                            className="button button--secondary"
                            onClick={() => openEditForm(promotion)}
                            type="button"
                          >
                            Editar
                          </button>
                        )}

                      {promotion.status === 1 && isAdministrator && (
                        <div className="review-actions">
                          <button
                            className="button button--primary"
                            disabled={workingPromotionId === promotion._id}
                            onClick={() => approvePromotion(promotion._id)}
                            type="button"
                          >
                            Aprobar
                          </button>
                          {rejectingPromotionId !== promotion._id ? (
                            <button
                              className="button button--danger"
                              onClick={() => {
                                setRejectingPromotionId(promotion._id);
                                setRejectComment("");
                                setActionError("");
                                setSuccessMessage("");
                              }}
                              type="button"
                            >
                              Rechazar
                            </button>
                          ) : (
                            <div className="reject-form">
                              <textarea
                                aria-label="Motivo del rechazo"
                                maxLength={255}
                                onChange={(event) =>
                                  setRejectComment(event.target.value)
                                }
                                placeholder="Motivo del rechazo"
                                required
                                rows={2}
                                value={rejectComment}
                              />
                              <button
                                className="button button--danger"
                                disabled={
                                  workingPromotionId === promotion._id ||
                                  !rejectComment.trim()
                                }
                                onClick={() =>
                                  rejectPromotion(promotion._id)
                                }
                                type="button"
                              >
                                Confirmar rechazo
                              </button>
                              <button
                                className="button button--secondary"
                                onClick={() => {
                                  setRejectingPromotionId("");
                                  setRejectComment("");
                                }}
                                type="button"
                              >
                                Cancelar
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

export default PromotionsPage;
