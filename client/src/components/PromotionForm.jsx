import { useState } from "react";

const AMOUNT_PATTERN = /^\d{1,16}(?:\.\d{1,2})?$/;

function getInitialValues(promotion) {
  const amount =
    typeof promotion?.amount === "object"
      ? promotion.amount.$numberDecimal
      : promotion?.amount;

  return {
    product: promotion?.product || "",
    amount: amount || "",
    currency: promotion?.currency || "MXN",
    startDate: promotion?.startDate?.slice(0, 10) || "",
    endDate: promotion?.endDate?.slice(0, 10) || "",
  };
}

function PromotionForm({
  promotion,
  isSaving,
  onCancel,
  onFieldChange,
  onSubmit,
}) {
  const [values, setValues] = useState(() => getInitialValues(promotion));
  const [errors, setErrors] = useState({});

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((currentValues) => ({ ...currentValues, [name]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: "" }));
    onFieldChange?.();
  }

  function validate() {
    const nextErrors = {};

    if (!values.product.trim()) {
      nextErrors.product = "El nombre del producto es obligatorio.";
    } else if (values.product.trim().length > 50) {
      nextErrors.product = "El nombre no puede tener más de 50 caracteres.";
    }

    if (!values.amount) {
      nextErrors.amount = "El importe es obligatorio.";
    } else if (
      !AMOUNT_PATTERN.test(values.amount) ||
      Number(values.amount) <= 0
    ) {
      nextErrors.amount =
        "Debe ser mayor que 0 y tener máximo 16 dígitos enteros y 2 decimales.";
    }

    if (!values.startDate) {
      nextErrors.startDate = "La fecha de inicio es obligatoria.";
    }

    if (!values.endDate) {
      nextErrors.endDate = "La fecha de fin es obligatoria.";
    } else if (values.startDate && values.endDate < values.startDate) {
      nextErrors.endDate =
        "La fecha de fin no puede ser anterior a la fecha de inicio.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (validate()) {
      onSubmit({ ...values, product: values.product.trim() });
    }
  }

  return (
    <form className="promotion-form" noValidate onSubmit={handleSubmit}>
      <h2>{promotion ? "Editar promoción" : "Nueva promoción"}</h2>

      <div className="form-field">
        <label htmlFor="product">Producto</label>
        <input
          aria-describedby={errors.product ? "product-error" : undefined}
          aria-invalid={Boolean(errors.product)}
          autoComplete="off"
          id="product"
          maxLength={50}
          name="product"
          onChange={handleChange}
          value={values.product}
        />
        <span className="field-hint">Máximo 50 caracteres.</span>
        {errors.product && (
          <span className="field-error" id="product-error">
            {errors.product}
          </span>
        )}
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="amount">Importe</label>
          <input
            aria-describedby={errors.amount ? "amount-error" : undefined}
            aria-invalid={Boolean(errors.amount)}
            autoComplete="off"
            id="amount"
            inputMode="decimal"
            maxLength={19}
            name="amount"
            onChange={handleChange}
            placeholder="Ej. 1250.50"
            value={values.amount}
          />
          <span className="field-hint">
            Máximo 16 dígitos enteros y 2 decimales.
          </span>
          {errors.amount && (
            <span className="field-error" id="amount-error">
              {errors.amount}
            </span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="currency">Moneda</label>
          <select
            id="currency"
            name="currency"
            onChange={handleChange}
            value={values.currency}
          >
            <option value="MXN">MXN</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="startDate">Fecha de inicio</label>
          <input
            aria-describedby={
              errors.startDate ? "start-date-error" : undefined
            }
            aria-invalid={Boolean(errors.startDate)}
            id="startDate"
            name="startDate"
            onChange={handleChange}
            type="date"
            value={values.startDate}
          />
          {errors.startDate && (
            <span className="field-error" id="start-date-error">
              {errors.startDate}
            </span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="endDate">Fecha de fin</label>
          <input
            aria-describedby={errors.endDate ? "end-date-error" : undefined}
            aria-invalid={Boolean(errors.endDate)}
            id="endDate"
            min={values.startDate || undefined}
            name="endDate"
            onChange={handleChange}
            type="date"
            value={values.endDate}
          />
          {errors.endDate && (
            <span className="field-error" id="end-date-error">
              {errors.endDate}
            </span>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button className="button button--primary" disabled={isSaving}>
          {isSaving ? "Guardando..." : "Guardar"}
        </button>
        <button
          className="button button--secondary"
          disabled={isSaving}
          onClick={onCancel}
          type="button"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default PromotionForm;
