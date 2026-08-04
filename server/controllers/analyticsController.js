import driver from "../config/db.js";
import { recordsToObjects, recordToObject } from "../utils/neo4jUtils.js";
import {
  GET_MOST_CONNECTED_NODES, GET_AVERAGE_DEGREE, GET_RELATIONSHIP_DISTRIBUTION,
  GET_NODE_DISTRIBUTION, GET_MOST_CONNECTED_SKILLS, GET_GRAPH_DENSITY,
  GET_TOP_HIRING_COMPANIES, GET_NEIGHBORS_1_HOP, GET_NEIGHBORS_2_HOP,
  GET_NEIGHBORS_3_HOP, GET_SKILL_GAP, GET_RELATED_SKILLS
} from "../queries/analyticsQueries.js";

// GET /api/analytics/connected-nodes
export async function getMostConnectedNodes(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(GET_MOST_CONNECTED_NODES);
    res.json({ success: true, data: recordsToObjects(result.records) });
  } catch (err) { next(err); } finally { await session.close(); }
}

// GET /api/analytics/degree
export async function getAverageDegree(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(GET_AVERAGE_DEGREE);
    res.json({ success: true, data: recordToObject(result.records[0]) });
  } catch (err) { next(err); } finally { await session.close(); }
}

// GET /api/analytics/relationship-distribution
export async function getRelationshipDistribution(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(GET_RELATIONSHIP_DISTRIBUTION);
    res.json({ success: true, data: recordsToObjects(result.records) });
  } catch (err) { next(err); } finally { await session.close(); }
}

// GET /api/analytics/node-distribution
export async function getNodeDistribution(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(GET_NODE_DISTRIBUTION);
    res.json({ success: true, data: recordsToObjects(result.records) });
  } catch (err) { next(err); } finally { await session.close(); }
}

// GET /api/analytics/connected-skills
export async function getMostConnectedSkills(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(GET_MOST_CONNECTED_SKILLS);
    res.json({ success: true, data: recordsToObjects(result.records) });
  } catch (err) { next(err); } finally { await session.close(); }
}

// GET /api/analytics/density
export async function getGraphDensity(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(GET_GRAPH_DENSITY);
    res.json({ success: true, data: recordToObject(result.records[0]) });
  } catch (err) { next(err); } finally { await session.close(); }
}

// GET /api/analytics/top-hiring
export async function getTopHiringCompanies(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(GET_TOP_HIRING_COMPANIES);
    res.json({ success: true, data: recordsToObjects(result.records) });
  } catch (err) { next(err); } finally { await session.close(); }
}

// GET /api/analytics/neighbors/:nodeId?hops=1|2|3
export async function getNeighbors(req, res, next) {
  const session = driver.session();
  try {
    const { nodeId } = req.params;
    const hops = parseInt(req.query.hops) || 1;
    let query;
    if (hops === 3) query = GET_NEIGHBORS_3_HOP;
    else if (hops === 2) query = GET_NEIGHBORS_2_HOP;
    else query = GET_NEIGHBORS_1_HOP;

    const result = await session.run(query, { nodeId });
    res.json({ success: true, data: recordsToObjects(result.records), hops });
  } catch (err) { next(err); } finally { await session.close(); }
}

// GET /api/analytics/skill-gap?userId=u1&jobId=j1
export async function getSkillGap(req, res, next) {
  const session = driver.session();
  try {
    const { userId, jobId } = req.query;
    if (!userId || !jobId) {
      return res.status(400).json({ success: false, message: "userId and jobId are required" });
    }
    const result = await session.run(GET_SKILL_GAP, { userId, jobId });
    if (!result.records.length) {
      return res.json({ success: true, data: null, message: "User or Job not found" });
    }
    res.json({ success: true, data: recordToObject(result.records[0]) });
  } catch (err) { next(err); } finally { await session.close(); }
}

// GET /api/analytics/related-skills/:skillId
export async function getRelatedSkills(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(GET_RELATED_SKILLS, { skillId: req.params.skillId });
    res.json({ success: true, data: recordsToObjects(result.records) });
  } catch (err) { next(err); } finally { await session.close(); }
}
