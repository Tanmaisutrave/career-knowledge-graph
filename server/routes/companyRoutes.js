import express from "express";
import {
  getAllCompanies, getCompanyById, createCompany, deleteCompany,
  getCompanyCount, getTopCompanies, getCompaniesByIndustry
} from "../controllers/companyController.js";

const router = express.Router();

router.get("/", getAllCompanies);
router.get("/stats/count", getCompanyCount);
router.get("/stats/top", getTopCompanies);
router.get("/stats/industry", getCompaniesByIndustry);
router.get("/:id", getCompanyById);
router.post("/", createCompany);
router.delete("/:id", deleteCompany);

export default router;
