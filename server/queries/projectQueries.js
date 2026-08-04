// ============================================================
// Project Cypher Queries
// ============================================================

export const GET_ALL_PROJECTS = `
  MATCH (p:Project)
  OPTIONAL MATCH (p)-[:USES]->(s:Skill)
  OPTIONAL MATCH (u:User)-[:WORKED_ON]->(p)
  RETURN p,
         collect(DISTINCT s) AS skills,
         count(DISTINCT u) AS memberCount
  ORDER BY p.name
`;

export const GET_PROJECT_BY_ID = `
  MATCH (p:Project {id: $id})
  OPTIONAL MATCH (p)-[:USES]->(s:Skill)
  OPTIONAL MATCH (u:User)-[:WORKED_ON]->(p)
  RETURN p,
         collect(DISTINCT s) AS skills,
         collect(DISTINCT u) AS members
`;

export const CREATE_PROJECT = `
  CREATE (pr:Project {
    id: $id,
    name: $name,
    description: $description,
    github: $github
  })
  RETURN pr
`;

export const DELETE_PROJECT = `
  MATCH (p:Project {id: $id})
  DETACH DELETE p
`;

// Count total projects
export const COUNT_PROJECTS = `
  MATCH (p:Project)
  RETURN count(p) AS total
`;

// Find projects that use a specific technology
export const GET_PROJECTS_BY_SKILL = `
  MATCH (p:Project)-[:USES]->(s:Skill)
  WHERE toLower(s.name) CONTAINS toLower($skillName)
  OPTIONAL MATCH (p)-[:USES]->(allSkills:Skill)
  RETURN p, collect(DISTINCT allSkills) AS skills
  ORDER BY p.name
`;

// Top projects by number of contributors
export const GET_TOP_PROJECTS = `
  MATCH (u:User)-[:WORKED_ON]->(p:Project)
  RETURN p.name AS project, count(u) AS contributorCount
  ORDER BY contributorCount DESC
  LIMIT 10
`;

// Projects by technology usage (for charts)
export const GET_PROJECTS_BY_TECHNOLOGY = `
  MATCH (p:Project)-[:USES]->(s:Skill)
  RETURN s.name AS technology, count(p) AS projectCount
  ORDER BY projectCount DESC
  LIMIT 10
`;
