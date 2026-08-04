# Cypher Query Reference — Career Knowledge Graph Platform

## Overview

All queries use parameterized syntax (`$param`) to prevent injection. The database is CognoDB (Neo4j-compatible). Node labels are: `User`, `Skill`, `Project`, `Job`, `Company`.

---

## 1. Find All Skills of a User
```cypher
MATCH (u:User {id: $id})-[:HAS_SKILL]->(s:Skill)
RETURN s ORDER BY s.name
```
**Traversal:** 1-hop outbound on `HAS_SKILL` from a `User` node.  
**Use case:** Profile page, skill tag display.

---

## 2. Find All Projects of a User
```cypher
MATCH (u:User {id: $id})-[:WORKED_ON]->(p:Project)
OPTIONAL MATCH (p)-[:USES]->(s:Skill)
RETURN p, collect(DISTINCT s) AS skills
```
**Traversal:** 1-hop on `WORKED_ON`, then 1 additional hop on `USES` to hydrate skills.  
**Use case:** User profile → project section.

---

## 3. Recommend Jobs Based on User Skills
```cypher
MATCH (u:User {id: $userId})-[:HAS_SKILL]->(s:Skill)<-[:REQUIRES]-(j:Job)
WITH j, count(s) AS matchedSkills
MATCH (c:Company)-[:POSTED]->(j)
OPTIONAL MATCH (j)-[:REQUIRES]->(requiredSkill:Skill)
RETURN j, c, collect(DISTINCT requiredSkill) AS skills, matchedSkills
ORDER BY matchedSkills DESC
LIMIT 10
```
**Traversal:** 3-hop path: `User → Skill ← Job ← Company`.  
**Logic:** Count how many of the user's skills overlap with job requirements and rank by that count.

---

## 4. Find Users with Similar Skills
```cypher
MATCH (u:User {id: $userId})-[:HAS_SKILL]->(s:Skill)<-[:HAS_SKILL]-(other:User)
WHERE other.id <> $userId
WITH other, count(s) AS sharedSkills
OPTIONAL MATCH (other)-[:HAS_SKILL]->(otherSkill:Skill)
RETURN other AS user, collect(DISTINCT otherSkill) AS skills, sharedSkills
ORDER BY sharedSkills DESC
LIMIT 10
```
**Traversal:** 3-hop pattern via shared `Skill` nodes.  
**Use case:** "People like you" recommendation feature.

---

## 5. Find Shortest Path Between User and Company
```cypher
MATCH (u:User {id: $userId}), (c:Company {id: $companyId}),
      path = shortestPath((u)-[*..6]-(c))
RETURN path
```
**Algorithm:** Breadth-first shortest path with max depth 6.  
**Example path:** `User -[HAS_SKILL]-> Skill <-[REQUIRES]- Job <-[POSTED]- Company`  
**Use case:** Show how a candidate is connected to a target employer.

---

## 6. Find Projects Using a Specific Technology
```cypher
MATCH (p:Project)-[:USES]->(s:Skill)
WHERE toLower(s.name) CONTAINS toLower($skillName)
OPTIONAL MATCH (p)-[:USES]->(allSkills:Skill)
RETURN p, collect(DISTINCT allSkills) AS skills
ORDER BY p.name
```
**Use case:** Filter `Projects` page by technology (e.g. "React").

---

## 7. Find Users Skilled in a Given Technology
```cypher
MATCH (u:User)-[:HAS_SKILL]->(s:Skill)
WHERE toLower(s.name) CONTAINS toLower($skillName)
OPTIONAL MATCH (u)-[:HAS_SKILL]->(allSkills:Skill)
RETURN u, collect(DISTINCT allSkills) AS skills
ORDER BY u.experience DESC
```
**Use case:** "Who knows Python?" — talent search.

---

## 8. Count Nodes by Type
```cypher
MATCH (u:User)        WITH count(u) AS users
MATCH (s:Skill)       WITH users, count(s) AS skills
MATCH (p:Project)     WITH users, skills, count(p) AS projects
MATCH (c:Company)     WITH users, skills, projects, count(c) AS companies
MATCH (j:Job)         WITH users, skills, projects, companies, count(j) AS jobs
MATCH ()-[r]->()      WITH users, skills, projects, companies, jobs, count(r) AS relationships
RETURN users, skills, projects, companies, jobs, relationships
```
**Use case:** Dashboard KPI cards.

---

## 9. Top 10 Skills by User Adoption
```cypher
MATCH (u:User)-[:HAS_SKILL]->(s:Skill)
RETURN s.name AS skill, s.category AS category, count(u) AS userCount
ORDER BY userCount DESC
LIMIT 10
```
**Use case:** Dashboard "Top Skills" leaderboard and bar chart.

---

## 10. Skills Distribution by Category
```cypher
MATCH (s:Skill)
RETURN s.category AS category, count(s) AS count
ORDER BY count DESC
```
**Use case:** Pie chart on Dashboard.

---

## 11. Jobs by Location
```cypher
MATCH (j:Job)
RETURN j.location AS location, count(j) AS count
ORDER BY count DESC
```
**Use case:** "Jobs by Location" bar chart.

---

## 12. Users by Experience Level
```cypher
MATCH (u:User)
RETURN
  CASE
    WHEN u.experience <= 2 THEN 'Junior (0-2 yrs)'
    WHEN u.experience <= 5 THEN 'Mid-level (3-5 yrs)'
    WHEN u.experience <= 8 THEN 'Senior (6-8 yrs)'
    ELSE 'Principal (9+ yrs)'
  END AS level,
  count(u) AS count
ORDER BY count DESC
```
**Use case:** Pie chart on Dashboard.

---

## 13. Top Companies by Job Count
```cypher
MATCH (c:Company)-[:POSTED]->(j:Job)
RETURN c.name AS company, c.industry AS industry, count(j) AS jobCount
ORDER BY jobCount DESC
LIMIT 10
```
**Use case:** Top Companies leaderboard.

---

## 14. Projects by Technology
```cypher
MATCH (p:Project)-[:USES]->(s:Skill)
RETURN s.name AS technology, count(p) AS projectCount
ORDER BY projectCount DESC
LIMIT 10
```
**Use case:** "Projects by Technology" bar chart.

---

## 15. Multi-Hop: Companies Reachable via Skills
```cypher
MATCH (u:User {id: $userId})-[:HAS_SKILL]->(s:Skill)<-[:REQUIRES]-(j:Job)<-[:POSTED]-(c:Company)
RETURN DISTINCT c, count(j) AS relevantJobs
ORDER BY relevantJobs DESC
```
**Traversal:** 4-hop: `User → Skill ← Job ← Company`  
**Use case:** "Companies interested in your profile" section.
