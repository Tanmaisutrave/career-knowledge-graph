// ============================================================
// Company Cypher Queries
// ============================================================

export const GET_ALL_COMPANIES = `
  MATCH (c:Company)
  OPTIONAL MATCH (c)-[:POSTED]->(j:Job)
  RETURN c, collect(DISTINCT j) AS jobs, count(DISTINCT j) AS jobCount
  ORDER BY c.name
`;

export const GET_COMPANY_BY_ID = `
  MATCH (c:Company {id: $id})
  OPTIONAL MATCH (c)-[:POSTED]->(j:Job)
  OPTIONAL MATCH (j)-[:REQUIRES]->(s:Skill)
  RETURN c,
         collect(DISTINCT j) AS jobs,
         collect(DISTINCT s) AS requiredSkills
`;

export const CREATE_COMPANY = `
  CREATE (c:Company {
    id: $id,
    name: $name,
    industry: $industry,
    website: $website
  })
  RETURN c
`;

export const DELETE_COMPANY = `
  MATCH (c:Company {id: $id})
  DETACH DELETE c
`;

// Count total companies
export const COUNT_COMPANIES = `
  MATCH (c:Company)
  RETURN count(c) AS total
`;

// Top companies by number of posted jobs
export const GET_TOP_COMPANIES = `
  MATCH (c:Company)-[:POSTED]->(j:Job)
  RETURN c.name AS company, c.industry AS industry, count(j) AS jobCount
  ORDER BY jobCount DESC
  LIMIT 10
`;

// Companies by industry
// FIX: alias "count" is reserved — renamed to "companyCount"
export const GET_COMPANIES_BY_INDUSTRY = `
  MATCH (c:Company)
  RETURN c.industry AS industry, count(c) AS companyCount
  ORDER BY companyCount DESC
`;
