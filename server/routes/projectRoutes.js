import express from "express";
import {
  getAllProjects, getProjectById, createProject, deleteProject,
  getProjectCount, getProjectsBySkill, getTopProjects, getProjectsByTechnology
} from "../controllers/projectController.js";

const router = express.Router();

router.get("/", getAllProjects);
router.get("/stats/count", getProjectCount);
router.get("/stats/top", getTopProjects);
router.get("/stats/technology", getProjectsByTechnology);
router.get("/filter/skill", getProjectsBySkill);
router.get("/:id", getProjectById);
router.post("/", createProject);
router.delete("/:id", deleteProject);

export default router;
