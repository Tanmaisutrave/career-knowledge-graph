import driver from "../config/db.js";
import { recordsToObjects, recordToObject, generateId } from "../utils/neo4jUtils.js";
import {
  GET_ALL_USERS, GET_USER_BY_ID, CREATE_USER, UPDATE_USER, DELETE_USER,
  GET_USER_SKILLS, GET_USER_PROJECTS, COUNT_USERS,
  GET_USERS_BY_SKILL, GET_USERS_BY_EXPERIENCE
} from "../queries/userQueries.js";

// GET /api/users
export async function getAllUsers(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(GET_ALL_USERS);
    res.json({ success: true, data: recordsToObjects(result.records) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// GET /api/users/:id
export async function getUserById(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(GET_USER_BY_ID, { id: req.params.id });
    if (!result.records.length) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: recordToObject(result.records[0]) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// POST /api/users
export async function createUser(req, res, next) {
  const session = driver.session();
  try {
    const { name, email, experience, location } = req.body;
    const id = generateId("u");
    const result = await session.run(CREATE_USER, { id, name, email, experience: parseInt(experience), location });
    res.status(201).json({ success: true, data: recordToObject(result.records[0]) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// PUT /api/users/:id
export async function updateUser(req, res, next) {
  const session = driver.session();
  try {
    const { name, email, experience, location } = req.body;
    const result = await session.run(UPDATE_USER, {
      id: req.params.id, name, email, experience: parseInt(experience), location
    });
    if (!result.records.length) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: recordToObject(result.records[0]) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// DELETE /api/users/:id
export async function deleteUser(req, res, next) {
  const session = driver.session();
  try {
    await session.run(DELETE_USER, { id: req.params.id });
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// GET /api/users/:id/skills
export async function getUserSkills(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(GET_USER_SKILLS, { id: req.params.id });
    res.json({ success: true, data: recordsToObjects(result.records) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// GET /api/users/:id/projects
export async function getUserProjects(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(GET_USER_PROJECTS, { id: req.params.id });
    res.json({ success: true, data: recordsToObjects(result.records) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// GET /api/users/stats/count
export async function getUserCount(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(COUNT_USERS);
    res.json({ success: true, data: recordToObject(result.records[0]) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// GET /api/users/filter/skill?name=Python
export async function getUsersBySkill(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(GET_USERS_BY_SKILL, { skillName: req.query.name || "" });
    res.json({ success: true, data: recordsToObjects(result.records) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// GET /api/users/stats/experience
export async function getUsersByExperience(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(GET_USERS_BY_EXPERIENCE);
    res.json({ success: true, data: recordsToObjects(result.records) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}
