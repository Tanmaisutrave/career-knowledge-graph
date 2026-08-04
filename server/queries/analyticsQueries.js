// ============================================================
// Graph Analytics Cypher Queries
// ============================================================

// Degree centrality — most connected nodes (by total relationship count)
export const GET_MOST_CONNECTED_NODES = `
  MATCH (n)
  OPTIONAL MATCH (n)-[r]-()
  WITH n, count(r) AS degree, labels(n)[0] AS nodeLabel
  WHERE degree > 0
  RETURN coalesce(n.name, n.title, n.id) AS name,
         n.id AS nodeId, nodeLabel, degree
  ORDER BY degree DESC
  LIMIT 15
`;

// Average degree across all nodes
export const GET_AVERAGE_DEGREE = `
  MATCH (n)
  OPTIONAL MATCH (n)-[r]-()
  WITH n, count(r) AS degree
  RETURN
    avg(degree)   AS avgDegree,
    max(degree)   AS maxDegree,
    min(degree)   AS minDegree,
    count(n)      AS totalNodes
`;

// Relationship type distribution
// FIX: alias "type" and "count" are both reserved — renamed to relType / relCount
export const GET_RELATIONSHIP_DISTRIBUTION = `
  MATCH ()-[r]->()
  RETURN type(r) AS relType, count(r) AS relCount
  ORDER BY relCount DESC
`;

// Node label distribution
// FIX: alias "label" and "count" are both reserved — renamed to nodeLabel / nodeCount
export const GET_NODE_DISTRIBUTION = `
  MATCH (n)
  RETURN labels(n)[0] AS nodeLabel, count(n) AS nodeCount
  ORDER BY nodeCount DESC
`;

// Most connected skills — combined degree across users, projects, and jobs
export const GET_MOST_CONNECTED_SKILLS = `
  MATCH (s:Skill)
  OPTIONAL MATCH (u:User)-[:HAS_SKILL]->(s)
  WITH s, count(DISTINCT u) AS userCount
  OPTIONAL MATCH (p:Project)-[:USES]->(s)
  WITH s, userCount, count(DISTINCT p) AS projectCount
  OPTIONAL MATCH (j:Job)-[:REQUIRES]->(s)
  WITH s, userCount, projectCount, count(DISTINCT j) AS jobCount
  RETURN s.name AS skill, s.category AS category,
         userCount, projectCount, jobCount,
         (userCount + projectCount + jobCount) AS totalConnections
  ORDER BY totalConnections DESC
  LIMIT 10
`;

// Graph density: edges / (nodes * (nodes-1))
export const GET_GRAPH_DENSITY = `
  MATCH (n)
  WITH count(n) AS nodeCount
  MATCH ()-[r]->()
  WITH nodeCount, count(r) AS edgeCount
  RETURN nodeCount, edgeCount,
         toFloat(edgeCount) / (toFloat(nodeCount) * toFloat(nodeCount - 1)) AS density
`;

// Top hiring companies (by applicants via their jobs)
export const GET_TOP_HIRING_COMPANIES = `
  MATCH (c:Company)-[:POSTED]->(j:Job)<-[:APPLIED_TO]-(u:User)
  RETURN c.name AS company, c.industry AS industry,
         count(DISTINCT u) AS applicantCount,
         count(DISTINCT j) AS jobCount
  ORDER BY applicantCount DESC
  LIMIT 10
`;

// 1-hop neighbors of a node (by string id property)
export const GET_NEIGHBORS_1_HOP = `
  MATCH (n {id: $nodeId})-[r]-(neighbor)
  RETURN n, type(r) AS relType,
         neighbor, labels(neighbor)[0] AS neighborLabel
  LIMIT 50
`;

// 2-hop neighbors
export const GET_NEIGHBORS_2_HOP = `
  MATCH (n {id: $nodeId})-[r1]-(hop1)-[r2]-(hop2)
  WHERE hop2.id <> $nodeId
  RETURN DISTINCT hop1, labels(hop1)[0] AS hop1Label,
         hop2,   labels(hop2)[0] AS hop2Label,
         type(r1) AS rel1Type, type(r2) AS rel2Type
  LIMIT 80
`;

// 3-hop neighbors
export const GET_NEIGHBORS_3_HOP = `
  MATCH (start {id: $nodeId})
  MATCH (start)-[*1..3]-(neighbor)
  WHERE neighbor.id <> $nodeId
  RETURN DISTINCT neighbor, labels(neighbor)[0] AS neighborLabel
  LIMIT 100
`;

// Skill gap analysis: user skills vs job requirements
export const GET_SKILL_GAP = `
  MATCH (u:User {id: $userId})-[:HAS_SKILL]->(userSkill:Skill)
  WITH u, collect(DISTINCT userSkill.id) AS userSkillIds,
          collect(DISTINCT userSkill)    AS userSkills
  MATCH (j:Job {id: $jobId})-[:REQUIRES]->(requiredSkill:Skill)
  WITH u, userSkillIds, userSkills,
          collect(DISTINCT requiredSkill) AS requiredSkills
  WITH u, userSkills, requiredSkills,
       [s IN requiredSkills WHERE s.id IN userSkillIds]      AS matchingSkills,
       [s IN requiredSkills WHERE NOT s.id IN userSkillIds]  AS missingSkills
  RETURN u, userSkills, requiredSkills, matchingSkills, missingSkills,
         size(matchingSkills) AS matchCount,
         size(requiredSkills) AS totalRequired,
         toFloat(size(matchingSkills)) / toFloat(size(requiredSkills)) * 100 AS compatibilityPct
`;

// Related skills — co-occurring in the same projects or jobs
export const GET_RELATED_SKILLS = `
  MATCH (s:Skill {id: $skillId})<-[:USES|REQUIRES]-(ctx)
  MATCH (ctx)-[:USES|REQUIRES]->(related:Skill)
  WHERE related.id <> $skillId
  RETURN related, count(ctx) AS coOccurrenceCount
  ORDER BY coOccurrenceCount DESC
  LIMIT 10
`;
