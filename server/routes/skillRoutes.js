import express from "express";
import {
  getAllSkills, getSkillById, createSkill, deleteSkill,
  getSkillCount, getTopSkills, getSkillsDistribution
} from "../controllers/skillController.js";

const router = express.Router();

router.get("/", getAllSkills);
router.get("/stats/count", getSkillCount);
router.get("/stats/top", getTopSkills);
router.get("/stats/distribution", getSkillsDistribution);
router.get("/:id", getSkillById);
router.post("/", createSkill);
router.delete("/:id", deleteSkill);

export default router;
