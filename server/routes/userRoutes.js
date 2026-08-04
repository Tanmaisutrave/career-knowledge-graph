import express from "express";
import {
  getAllUsers, getUserById, createUser, updateUser, deleteUser,
  getUserSkills, getUserProjects, getUserCount,
  getUsersBySkill, getUsersByExperience
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/stats/count", getUserCount);
router.get("/stats/experience", getUsersByExperience);
router.get("/filter/skill", getUsersBySkill);
router.get("/:id", getUserById);
router.get("/:id/skills", getUserSkills);
router.get("/:id/projects", getUserProjects);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
