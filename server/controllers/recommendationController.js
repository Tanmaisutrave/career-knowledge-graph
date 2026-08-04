import driver from "../config/db.js";
import neo4j from "neo4j-driver";
import { recordsToObjects, recordToObject } from "../utils/neo4jUtils.js";
import {
  RECOMMEND_JOBS_FOR_USER, RECOMMEND_SIMILAR_USERS,
  FIND_SHORTEST_PATH, GET_GRAPH_STATS, GET_GRAPH_DATA,
  GET_USER_COMPANY_CONNECTIONS
} from "../queries/recommendationQueries.js";

// ── Safe helpers ──────────────────────────────────────────────

/**
 * Safely convert any neo4j Integer / BigInt / plain number to a JS number string.
 * Used only for internal identity integers — NOT for application IDs.
 */
function toSafeId(value) {
  if (value === null || value === undefined) return null;
  if (neo4j.isInt(value)) return value.toNumber().toString();
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "number") return value.toString();
  // neo4j-driver v5 may return an object with low/high properties
  if (typeof value === "object" && "low" in value) {
    return neo4j.int(value.low, value.high).toNumber().toString();
  }
  return String(value);
}

/**
 * Extract a stable string ID from a neo4j Node object.
 * Prefers the application-level `id` property (set by our seed).
 * Falls back to the internal identity integer.
 */
function nodeStableId(node) {
  if (!node) return null;
  // Use application-level id if present (always present in our data model)
  if (node.properties && node.properties.id) return String(node.properties.id);
  // Fall back to internal identity
  return toSafeId(node.identity);
}

/**
 * Safely read a node's display name.
 */
function nodeName(node) {
  if (!node || !node.properties) return "unknown";
  return node.properties.name || node.properties.title || node.properties.id || "unknown";
}

/**
 * Recursively sanitize neo4j property values for JSON serialization.
 * Handles Integer, BigInt, nested objects, and arrays.
 */
function sanitizeProps(obj) {
  if (obj === null || obj === undefined) return obj;
  if (neo4j.isInt(obj)) return obj.toNumber();
  if (typeof obj === "bigint") return Number(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeProps);
  if (typeof obj === "object") {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = sanitizeProps(v);
    }
    return out;
  }
  return obj;
}

// ── Controllers ───────────────────────────────────────────────

// GET /api/recommendations/jobs/:userId
export async function recommendJobsForUser(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(RECOMMEND_JOBS_FOR_USER, { userId: req.params.userId });
    res.json({ success: true, data: recordsToObjects(result.records) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// GET /api/recommendations/users/:userId
export async function recommendSimilarUsers(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(RECOMMEND_SIMILAR_USERS, { userId: req.params.userId });
    res.json({ success: true, data: recordsToObjects(result.records) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// GET /api/recommendations/path?userId=u1&companyId=c1
export async function findShortestPath(req, res, next) {
  const session = driver.session();
  try {
    const { userId, companyId } = req.query;
    if (!userId || !companyId) {
      return res.status(400).json({ success: false, message: "userId and companyId are required" });
    }

    const result = await session.run(FIND_SHORTEST_PATH, { userId, companyId });
    if (!result.records.length) {
      return res.json({ success: true, data: null, message: "No path found" });
    }

    const path = result.records[0].get("path");
    if (!path || !path.segments) {
      return res.json({ success: true, data: null, message: "No path found" });
    }

    // Collect all nodes (start + end of every segment) de-duplicated by stable id
    const nodeMap = new Map();
    path.segments.forEach(seg => {
      [seg.start, seg.end].forEach(node => {
        if (!node) return;
        const stableId = nodeStableId(node);
        if (stableId && !nodeMap.has(stableId)) {
          nodeMap.set(stableId, {
            id: stableId,
            labels: node.labels || [],
            properties: sanitizeProps(node.properties || {})
          });
        }
      });
    });

    const relationships = path.segments
      .filter(seg => seg.relationship)
      .map(seg => ({
        type: seg.relationship.type,
        startId: nodeStableId(seg.start),
        endId: nodeStableId(seg.end)
      }));

    res.json({
      success: true,
      data: {
        nodes: Array.from(nodeMap.values()),
        relationships,
        length: path.length ?? path.segments.length
      }
    });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// GET /api/recommendations/graph/stats
export async function getGraphStats(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(GET_GRAPH_STATS);
    if (!result.records.length) {
      return res.json({ success: true, data: { users: 0, skills: 0, projects: 0, companies: 0, jobs: 0, relationships: 0 } });
    }
    res.json({ success: true, data: recordToObject(result.records[0]) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// GET /api/recommendations/graph/data
export async function getGraphData(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(GET_GRAPH_DATA);

    const nodeMap = new Map();   // stableId → node object
    const linkSet = new Set();   // deduplicate links by "src→tgt→type"
    const links = [];

    for (const record of result.records) {
      // ── Node n (always present) ──────────────────────────────
      let n = null;
      try { n = record.get("n"); } catch (_) { /* field missing */ }

      if (n && n.properties !== undefined) {
        const id = nodeStableId(n);
        if (id && !nodeMap.has(id)) {
          nodeMap.set(id, {
            id,
            label: (n.labels && n.labels[0]) || "Node",
            name: nodeName(n),
            properties: sanitizeProps(n.properties || {})
          });
        }
      }

      // ── Node m (may be null — OPTIONAL MATCH) ────────────────
      let m = null;
      try { m = record.get("m"); } catch (_) { /* field missing */ }

      if (m && m.properties !== undefined) {
        const id = nodeStableId(m);
        if (id && !nodeMap.has(id)) {
          nodeMap.set(id, {
            id,
            label: (m.labels && m.labels[0]) || "Node",
            name: nodeName(m),
            properties: sanitizeProps(m.properties || {})
          });
        }
      }

      // ── Relationship r (may be null — OPTIONAL MATCH) ────────
      let r = null;
      try { r = record.get("r"); } catch (_) { /* field missing */ }

      if (r && r.type) {
        // Use application-level node ids for source/target — avoids toNumber() entirely
        const sourceNode = n;
        const targetNode = m;

        if (sourceNode && targetNode) {
          const sourceId = nodeStableId(sourceNode);
          const targetId = nodeStableId(targetNode);

          if (sourceId && targetId) {
            const linkKey = `${sourceId}→${targetId}→${r.type}`;
            if (!linkSet.has(linkKey)) {
              linkSet.add(linkKey);
              links.push({ source: sourceId, target: targetId, type: r.type });
            }
          }
        }
      }
    }

    res.json({
      success: true,
      data: {
        nodes: Array.from(nodeMap.values()),
        links
      }
    });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// GET /api/recommendations/connections/:userId
export async function getUserCompanyConnections(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(GET_USER_COMPANY_CONNECTIONS, { userId: req.params.userId });
    res.json({ success: true, data: recordsToObjects(result.records) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}
