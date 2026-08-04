import driver from "../config/db.js";
import { recordsToObjects, recordToObject, generateId } from "../utils/neo4jUtils.js";
import {
  GET_ALL_SKILLS, GET_SKILL_BY_ID, CREATE_SKILL, DELETE_SKILL,
  COUNT_SKILLS, GET_TOP_SKILLS, GET_SKILLS_DISTRIBUTION
} from "../queries/skillQueries.js";

// GET /api/skills
export async function getAllSkills(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(GET_ALL_SKILLS);
    res.json({ success: true, data: recordsToObjects(result.records) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// GET /api/skills/:id
export async function getSkillById(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(GET_SKILL_BY_ID, { id: req.params.id });
    if (!result.records.length) return res.status(404).json({ success: false, message: "Skill not found" });
    res.json({ success: true, data: recordToObject(result.records[0]) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// POST /api/skills
export async function createSkill(req, res, next) {
  const session = driver.session();
  try {
    const { name, category } = req.body;
    const id = generateId("s");
    const result = await session.run(CREATE_SKILL, { id, name, category });
    res.status(201).json({ success: true, data: recordToObject(result.records[0]) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// DELETE /api/skills/:id
export async function deleteSkill(req, res, next) {
  const session = driver.session();
  try {
    await session.run(DELETE_SKILL, { id: req.params.id });
    res.json({ success: true, message: "Skill deleted successfully" });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// GET /api/skills/stats/count
export async function getSkillCount(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(COUNT_SKILLS);
    res.json({ success: true, data: recordToObject(result.records[0]) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// GET /api/skills/stats/top
export async function getTopSkills(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(GET_TOP_SKILLS);
    res.json({ success: true, data: recordsToObjects(result.records) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// GET /api/skills/stats/distribution
export async function getSkillsDistribution(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(GET_SKILLS_DISTRIBUTION);
    res.json({ success: true, data: recordsToObjects(result.records) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}
