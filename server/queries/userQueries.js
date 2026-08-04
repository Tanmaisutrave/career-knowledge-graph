// ============================================================
// User Cypher Queries
// ============================================================

export const GET_ALL_USERS = `
  MATCH (u:User)
  OPTIONAL MATCH (u)-[:HAS_SKILL]->(s:Skill)
  OPTIONAL MATCH (u)-[:WORKED_ON]->(p:Project)
  RETURN u,
         collect(DISTINCT s) AS skills,
         collect(DISTINCT p) AS projects
  ORDER BY u.name
`;

export const GET_USER_BY_ID = `
  MATCH (u:User {id: $id})
  OPTIONAL MATCH (u)-[:HAS_SKILL]->(s:Skill)
  OPTIONAL MATCH (u)-[:WORKED_ON]->(p:Project)
  OPTIONAL MATCH (u)-[:APPLIED_TO]->(j:Job)<-[:POSTED]-(c:Company)
  RETURN u,
         collect(DISTINCT s) AS skills,
         collect(DISTINCT p) AS projects,
         collect(DISTINCT {job: j, company: c}) AS applications
`;

export const CREATE_USER = `
  CREATE (u:User {
    id: $id,
    name: $name,
    email: $email,
    experience: $experience,
    location: $location
  })
  RETURN u
`;

export const UPDATE_USER = `
  MATCH (u:User {id: $id})
  SET u.name = $name,
      u.email = $email,
      u.experience = $experience,
      u.location = $location
  RETURN u
`;

export const DELETE_USER = `
  MATCH (u:User {id: $id})
  DETACH DELETE u
`;

// Find all skills of a specific user
export const GET_USER_SKILLS = `
  MATCH (u:User {id: $id})-[:HAS_SKILL]->(s:Skill)
  RETURN s ORDER BY s.name
`;

// Find all projects of a specific user
export const GET_USER_PROJECTS = `
  MATCH (u:User {id: $id})-[:WORKED_ON]->(p:Project)
  OPTIONAL MATCH (p)-[:USES]->(s:Skill)
  RETURN p, collect(DISTINCT s) AS skills
`;

// Count total users — alias "total" is safe (not a reserved word)
export const COUNT_USERS = `
  MATCH (u:User)
  RETURN count(u) AS total
`;

// Find users skilled in a given technology
export const GET_USERS_BY_SKILL = `
  MATCH (u:User)-[:HAS_SKILL]->(s:Skill)
  WHERE toLower(s.name) CONTAINS toLower($skillName)
  OPTIONAL MATCH (u)-[:HAS_SKILL]->(allSkills:Skill)
  RETURN u, collect(DISTINCT allSkills) AS skills
  ORDER BY u.experience DESC
`;

// Users grouped by experience level
// FIX: alias "count" is a reserved function name — renamed to "userCount"
export const GET_USERS_BY_EXPERIENCE = `
  MATCH (u:User)
  WITH
    CASE
      WHEN u.experience <= 2 THEN 'Junior (0-2 yrs)'
      WHEN u.experience <= 5 THEN 'Mid-level (3-5 yrs)'
      WHEN u.experience <= 8 THEN 'Senior (6-8 yrs)'
      ELSE 'Principal (9+ yrs)'
    END AS level,
    u
  RETURN level, count(u) AS userCount
  ORDER BY userCount DESC
`;
