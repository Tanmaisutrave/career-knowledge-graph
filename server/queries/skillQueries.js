// ============================================================
// Skill Cypher Queries
// ============================================================

export const GET_ALL_SKILLS = `
  MATCH (s:Skill)
  OPTIONAL MATCH (u:User)-[:HAS_SKILL]->(s)
  RETURN s, count(DISTINCT u) AS userCount
  ORDER BY userCount DESC
`;

export const GET_SKILL_BY_ID = `
  MATCH (s:Skill {id: $id})
  OPTIONAL MATCH (u:User)-[:HAS_SKILL]->(s)
  OPTIONAL MATCH (p:Project)-[:USES]->(s)
  OPTIONAL MATCH (j:Job)-[:REQUIRES]->(s)
  RETURN s,
         collect(DISTINCT u) AS users,
         collect(DISTINCT p) AS projects,
         collect(DISTINCT j) AS jobs
`;

export const CREATE_SKILL = `
  CREATE (s:Skill {
    id: $id,
    name: $name,
    category: $category
  })
  RETURN s
`;

export const DELETE_SKILL = `
  MATCH (s:Skill {id: $id})
  DETACH DELETE s
`;

// Count total skills
export const COUNT_SKILLS = `
  MATCH (s:Skill)
  RETURN count(s) AS total
`;

// Top 10 most used skills (by number of users who have them)
export const GET_TOP_SKILLS = `
  MATCH (u:User)-[:HAS_SKILL]->(s:Skill)
  RETURN s.name AS skill, s.category AS category, count(u) AS userCount
  ORDER BY userCount DESC
  LIMIT 10
`;

// Skills distribution by category
// FIX: alias "count" is reserved — renamed to "skillCount"
export const GET_SKILLS_DISTRIBUTION = `
  MATCH (s:Skill)
  RETURN s.category AS category, count(s) AS skillCount
  ORDER BY skillCount DESC
`;
