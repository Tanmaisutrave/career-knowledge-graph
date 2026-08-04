import driver from "../config/db.js";
import { recordsToObjects, recordToObject, generateId } from "../utils/neo4jUtils.js";
import {
  GET_ALL_JOBS, GET_JOB_BY_ID, CREATE_JOB, DELETE_JOB,
  COUNT_JOBS, GET_JOBS_BY_LOCATION, GET_TOP_JOBS_BY_APPLICANTS
} from "../queries/jobQueries.js";

// GET /api/jobs
export async function getAllJobs(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(GET_ALL_JOBS);
    res.json({ success: true, data: recordsToObjects(result.records) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// GET /api/jobs/:id
export async function getJobById(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(GET_JOB_BY_ID, { id: req.params.id });
    if (!result.records.length) return res.status(404).json({ success: false, message: "Job not found" });
    res.json({ success: true, data: recordToObject(result.records[0]) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// POST /api/jobs
export async function createJob(req, res, next) {
  const session = driver.session();
  try {
    const { title, experience, location, salary } = req.body;
    const id = generateId("j");
    const result = await session.run(CREATE_JOB, { id, title, experience: parseInt(experience), location, salary });
    res.status(201).json({ success: true, data: recordToObject(result.records[0]) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// DELETE /api/jobs/:id
export async function deleteJob(req, res, next) {
  const session = driver.session();
  try {
    await session.run(DELETE_JOB, { id: req.params.id });
    res.json({ success: true, message: "Job deleted successfully" });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// GET /api/jobs/stats/count
export async function getJobCount(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(COUNT_JOBS);
    res.json({ success: true, data: recordToObject(result.records[0]) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// GET /api/jobs/stats/location
export async function getJobsByLocation(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(GET_JOBS_BY_LOCATION);
    res.json({ success: true, data: recordsToObjects(result.records) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// GET /api/jobs/stats/top
export async function getTopJobs(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(GET_TOP_JOBS_BY_APPLICANTS);
    res.json({ success: true, data: recordsToObjects(result.records) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}
