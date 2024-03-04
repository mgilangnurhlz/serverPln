import express from "express";
import {
  getBarangs,
  getBarangById,
  saveBarang,
  updateBarang,
  deleteBarang,
} from "../controllers/Barang.js";

const router = express.Router();
import { verifyUser, adminOnly } from "../middleware/AuthUser.js";

router.get("/barangs", verifyUser, getBarangs);
router.get("/barangs/:id", verifyUser, getBarangById);
router.post("/barangs", verifyUser, saveBarang);
router.patch("/barangs/:id", verifyUser, updateBarang);
router.delete("/barangs/:id", verifyUser, deleteBarang);

export default router;
