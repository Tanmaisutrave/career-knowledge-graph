import express from "express";
import {
  recommendJobsForUser, recommendSimilarUsers,
  findShortestPath, getGraphStats, getGraphData,
  getUserCompanyConnections
} from "../controllers/recommendationController.js";

const router = express.Router();

router.get("/jobs/:userId", recommendJobsForUser);
router.get("/users/:userId", recommendSimilarUsers);
router.get("/connections/:userId", getUserCompanyConnections);
router.get("/path", findShortestPath);
router.get("/graph/stats", getGraphStats);
router.get("/graph/data", getGraphData);

export default router;
