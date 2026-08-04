import express from "express";
import {
  getAllJobs, getJobById, createJob, deleteJob,
  getJobCount, getJobsByLocation, getTopJobs
} from "../controllers/jobController.js";

const router = express.Router();

router.get("/", getAllJobs);
router.get("/stats/count", getJobCount);
router.get("/stats/location", getJobsByLocation);
router.get("/stats/top", getTopJobs);
router.get("/:id", getJobById);
router.post("/", createJob);
router.delete("/:id", deleteJob);

export default router;
