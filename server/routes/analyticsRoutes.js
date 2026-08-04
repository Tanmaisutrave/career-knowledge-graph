import express from "express";
import {
  getMostConnectedNodes, getAverageDegree, getRelationshipDistribution,
  getNodeDistribution, getMostConnectedSkills, getGraphDensity,
  getTopHiringCompanies, getNeighbors, getSkillGap, getRelatedSkills
} from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/connected-nodes",          getMostConnectedNodes);
router.get("/degree",                   getAverageDegree);
router.get("/relationship-distribution",getRelationshipDistribution);
router.get("/node-distribution",        getNodeDistribution);
router.get("/connected-skills",         getMostConnectedSkills);
router.get("/density",                  getGraphDensity);
router.get("/top-hiring",               getTopHiringCompanies);
router.get("/skill-gap",                getSkillGap);
router.get("/neighbors/:nodeId",        getNeighbors);
router.get("/related-skills/:skillId",  getRelatedSkills);

export default router;
