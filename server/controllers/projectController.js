import driver from "../config/db.js";
import { recordsToObjects, recordToObject, generateId } from "../utils/neo4jUtils.js";
import {
  GET_ALL_PROJECTS, GET_PROJECT_BY_ID, CREATE_PROJECT, DELETE_PROJECT,
  COUNT_PROJECTS, GET_PROJECTS_BY_SKILL, GET_TOP_PROJECTS, GET_PROJECTS_BY_TECHNOLOGY
} from "../queries/projectQueries.js";

// GET /api/projects
export async function getAllProjects(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(GET_ALL_PROJECTS);
    res.json({ success: true, data: recordsToObjects(result.records) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// GET /api/projects/:id
export async function getProjectById(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(GET_PROJECT_BY_ID, { id: req.params.id });
    if (!result.records.length) return res.status(404).json({ success: false, message: "Project not found" });
    res.json({ success: true, data: recordToObject(result.records[0]) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// POST /api/projects
export async function createProject(req, res, next) {
  const session = driver.session();
  try {
    const { name, description, github } = req.body;
    const id = generateId("p");
    const result = await session.run(CREATE_PROJECT, { id, name, description, github });
    res.status(201).json({ success: true, data: recordToObject(result.records[0]) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// DELETE /api/projects/:id
export async function deleteProject(req, res, next) {
  const session = driver.session();
  try {
    await session.run(DELETE_PROJECT, { id: req.params.id });
    res.json({ success: true, message: "Project deleted successfully" });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// GET /api/projects/stats/count
export async function getProjectCount(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(COUNT_PROJECTS);
    res.json({ success: true, data: recordToObject(result.records[0]) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// GET /api/projects/filter/skill?name=React
export async function getProjectsBySkill(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(GET_PROJECTS_BY_SKILL, { skillName: req.query.name || "" });
    res.json({ success: true, data: recordsToObjects(result.records) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// GET /api/projects/stats/top
export async function getTopProjects(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(GET_TOP_PROJECTS);
    res.json({ success: true, data: recordsToObjects(result.records) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// GET /api/projects/stats/technology
export async function getProjectsByTechnology(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(GET_PROJECTS_BY_TECHNOLOGY);
    res.json({ success: true, data: recordsToObjects(result.records) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}
