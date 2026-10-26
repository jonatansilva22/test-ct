import Promotion from "../models/Promotion.js";
import { PROMOTION_STATUS } from "../utils/const.js";

const statusLabels = {
  [PROMOTION_STATUS.PENDING]: "Pendiente",
  [PROMOTION_STATUS.APPROVED]: "Aprobada",
  [PROMOTION_STATUS.REJECTED]: "Rechazada",
};

function serializePromotion(promotion) {
  return {
    ...promotion.toObject(),
    statusLabel: statusLabels[promotion.status],
  };
}

export async function createPromotion(req, res) {
  if (req.user.role !== "solicitante") {
    return res.status(403).json({
      error: "Solo los solicitantes pueden registrar promociones",
    });
  }

  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({
      error: "El cuerpo de la solicitud debe ser un objeto JSON",
    });
  }

  const promotion = await Promotion.create({
    product: req.body.product,
    amount: req.body.amount,
    currency: req.body.currency,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    status: PROMOTION_STATUS.PENDING,
    userId: req.user._id,
  });

  res.status(201).json(serializePromotion(promotion));
}

export async function updatePromotion(req, res) {
  if (req.user.role !== "solicitante") {
    return res.status(403).json({
      error: "Solo los solicitantes pueden editar promociones",
    });
  }

  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({
      error: "El cuerpo de la solicitud debe ser un objeto JSON",
    });
  }

  const promotion = await Promotion.findById(req.params.id);

  if (!promotion) {
    return res.status(404).json({ error: "Promoción no encontrada" });
  }

  if (!promotion.userId.equals(req.user._id)) {
    return res.status(403).json({
      error: "Solo puedes editar tus propias promociones",
    });
  }

  if (promotion.status !== PROMOTION_STATUS.PENDING) {
    return res.status(409).json({
      error: "Solo se pueden editar promociones pendientes",
    });
  }

  promotion.set({
    product: req.body.product,
    amount: req.body.amount,
    currency: req.body.currency,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
  });

  await promotion.save();

  res.json(serializePromotion(promotion));
}

export async function changePromotionStatus(req, res) {
  if (req.user.role !== "administrador") {
    return res.status(403).json({
      error: "Solo los administradores pueden cambiar el estatus",
    });
  }

  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({
      error: "El cuerpo de la solicitud debe ser un objeto JSON",
    });
  }

  const { status, comment } = req.body;
  const allowedStatuses = [
    PROMOTION_STATUS.APPROVED,
    PROMOTION_STATUS.REJECTED,
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      error: "El estatus solo puede ser 2 (aprobada) o 3 (rechazada)",
    });
  }

  if (
    status === PROMOTION_STATUS.REJECTED &&
    (typeof comment !== "string" || !comment.trim())
  ) {
    return res.status(400).json({
      error: "El motivo de rechazo es obligatorio",
    });
  }

  const promotion = await Promotion.findOneAndUpdate(
    { _id: req.params.id, status: PROMOTION_STATUS.PENDING },
    {
      $set: {
        status,
        comment:
          status === PROMOTION_STATUS.REJECTED ? comment.trim() : "",
      },
    },
    { new: true, runValidators: true }
  );

  if (!promotion) {
    const exists = await Promotion.exists({ _id: req.params.id });

    if (!exists) {
      return res.status(404).json({ error: "Promoción no encontrada" });
    }

    return res.status(409).json({
      error: "Solo se pueden cambiar promociones pendientes",
    });
  }

  res.json(serializePromotion(promotion));
}

export async function getPromotions(req, res) {
  const filter = {};
  const { status } = req.query;

  if (status !== undefined && status !== "all") {
    const validStatuses = Object.values(PROMOTION_STATUS).map(String);

    if (typeof status !== "string" || !validStatuses.includes(status)) {
      return res.status(400).json({ error: "El filtro de estatus no es válido" });
    }

    filter.status = Number(status);
  }

  if (req.user.role === "solicitante") {
    filter.userId = req.user._id;
  } else if (req.user.role !== "administrador") {
    return res.status(403).json({ error: "No tienes permiso para ver promociones" });
  }

  const promotionsQuery = Promotion.find(filter)
    .select("product amount currency startDate endDate status comment userId")
    .sort({ _id: -1 });

  if (req.user.role === "administrador") {
    promotionsQuery.populate("userId", "name");
  }

  const promotions = await promotionsQuery;

  res.json(promotions.map(serializePromotion));
}
