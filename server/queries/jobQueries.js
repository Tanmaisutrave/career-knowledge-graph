// ============================================================
// Job Cypher Queries
// ============================================================

export const GET_ALL_JOBS = `
  MATCH (j:Job)
  OPTIONAL MATCH (c:Company)-[:POSTED]->(j)
  OPTIONAL MATCH (j)-[:REQUIRES]->(s:Skill)
  RETURN j, c, collect(DISTINCT s) AS skills
  ORDER BY j.title
`;

export const GET_JOB_BY_ID = `
  MATCH (j:Job {id: $id})
  OPTIONAL MATCH (c:Company)-[:POSTED]->(j)
  OPTIONAL MATCH (j)-[:REQUIRES]->(s:Skill)
  OPTIONAL MATCH (u:User)-[:APPLIED_TO]->(j)
  RETURN j, c,
         collect(DISTINCT s) AS skills,
         collect(DISTINCT u) AS applicants
`;

export const CREATE_JOB = `
  CREATE (j:Job {
    id: $id,
    title: $title,
    experience: $experience,
    location: $location,
    salary: $salary
  })
  RETURN j
`;

export const DELETE_JOB = `
  MATCH (j:Job {id: $id})
  DETACH DELETE j
`;

// Count total jobs
export const COUNT_JOBS = `
  MATCH (j:Job)
  RETURN count(j) AS total
`;

// Jobs grouped by location
// FIX: was referencing bare "location" variable instead of j.location,
//      and alias "count" is reserved — renamed to "jobCount"
export const GET_JOBS_BY_LOCATION = `
  MATCH (j:Job)
  RETURN j.location AS location, count(j) AS jobCount
  ORDER BY jobCount DESC
`;

// Jobs with the most applicants
export const GET_TOP_JOBS_BY_APPLICANTS = `
  MATCH (u:User)-[:APPLIED_TO]->(j:Job)<-[:POSTED]-(c:Company)
  RETURN j.title AS title, c.name AS company, count(u) AS applicantCount
  ORDER BY applicantCount DESC
  LIMIT 10
`;
