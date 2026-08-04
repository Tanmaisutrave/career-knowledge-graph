import driver from "../config/db.js";
import { recordsToObjects, recordToObject, generateId } from "../utils/neo4jUtils.js";
import {
  GET_ALL_COMPANIES, GET_COMPANY_BY_ID, CREATE_COMPANY, DELETE_COMPANY,
  COUNT_COMPANIES, GET_TOP_COMPANIES, GET_COMPANIES_BY_INDUSTRY
} from "../queries/companyQueries.js";

// GET /api/companies
export async function getAllCompanies(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(GET_ALL_COMPANIES);
    res.json({ success: true, data: recordsToObjects(result.records) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// GET /api/companies/:id
export async function getCompanyById(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(GET_COMPANY_BY_ID, { id: req.params.id });
    if (!result.records.length) return res.status(404).json({ success: false, message: "Company not found" });
    res.json({ success: true, data: recordToObject(result.records[0]) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// POST /api/companies
export async function createCompany(req, res, next) {
  const session = driver.session();
  try {
    const { name, industry, website } = req.body;
    const id = generateId("c");
    const result = await session.run(CREATE_COMPANY, { id, name, industry, website });
    res.status(201).json({ success: true, data: recordToObject(result.records[0]) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// DELETE /api/companies/:id
export async function deleteCompany(req, res, next) {
  const session = driver.session();
  try {
    await session.run(DELETE_COMPANY, { id: req.params.id });
    res.json({ success: true, message: "Company deleted successfully" });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// GET /api/companies/stats/count
export async function getCompanyCount(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(COUNT_COMPANIES);
    res.json({ success: true, data: recordToObject(result.records[0]) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// GET /api/companies/stats/top
export async function getTopCompanies(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(GET_TOP_COMPANIES);
    res.json({ success: true, data: recordsToObjects(result.records) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}

// GET /api/companies/stats/industry
export async function getCompaniesByIndustry(req, res, next) {
  const session = driver.session();
  try {
    const result = await session.run(GET_COMPANIES_BY_INDUSTRY);
    res.json({ success: true, data: recordsToObjects(result.records) });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
}
