// ============================================================
// Recommendation & Graph Traversal Cypher Queries
// ============================================================

// Recommend jobs for a user based on matching skills
export const RECOMMEND_JOBS_FOR_USER = `
  MATCH (u:User {id: $userId})-[:HAS_SKILL]->(s:Skill)<-[:REQUIRES]-(j:Job)
  WITH j, count(s) AS matchedSkills
  MATCH (c:Company)-[:POSTED]->(j)
  OPTIONAL MATCH (j)-[:REQUIRES]->(requiredSkill:Skill)
  RETURN j, c, collect(DISTINCT requiredSkill) AS skills, matchedSkills
  ORDER BY matchedSkills DESC
  LIMIT 10
`;

// Recommend users with similar skills to a given user
export const RECOMMEND_SIMILAR_USERS = `
  MATCH (u:User {id: $userId})-[:HAS_SKILL]->(s:Skill)<-[:HAS_SKILL]-(other:User)
  WHERE other.id <> $userId
  WITH other, count(s) AS sharedSkills
  OPTIONAL MATCH (other)-[:HAS_SKILL]->(otherSkill:Skill)
  RETURN other AS user, collect(DISTINCT otherSkill) AS skills, sharedSkills
  ORDER BY sharedSkills DESC
  LIMIT 10
`;

// Find the shortest path between a user and a company (via jobs/skills)
export const FIND_SHORTEST_PATH = `
  MATCH (u:User {id: $userId}), (c:Company {id: $companyId}),
        path = shortestPath((u)-[*..6]-(c))
  RETURN path
`;

// Graph statistics summary
// FIX: chain WITH clauses one at a time to avoid scope issues
export const GET_GRAPH_STATS = `
  MATCH (u:User)
  WITH count(u) AS users
  MATCH (s:Skill)
  WITH users, count(s) AS skills
  MATCH (p:Project)
  WITH users, skills, count(p) AS projects
  MATCH (c:Company)
  WITH users, skills, projects, count(c) AS companies
  MATCH (j:Job)
  WITH users, skills, projects, companies, count(j) AS jobs
  MATCH ()-[r]->()
  WITH users, skills, projects, companies, jobs, count(r) AS relationships
  RETURN users, skills, projects, companies, jobs, relationships
`;

// Find all graph nodes and relationships for the Graph Explorer
export const GET_GRAPH_DATA = `
  MATCH (n)
  OPTIONAL MATCH (n)-[r]->(m)
  RETURN n, r, m
  LIMIT 200
`;

// Multi-hop: Find companies reachable from a user through shared skills and jobs
export const GET_USER_COMPANY_CONNECTIONS = `
  MATCH (u:User {id: $userId})-[:HAS_SKILL]->(s:Skill)<-[:REQUIRES]-(j:Job)<-[:POSTED]-(c:Company)
  RETURN DISTINCT c, count(j) AS relevantJobs
  ORDER BY relevantJobs DESC
`;
