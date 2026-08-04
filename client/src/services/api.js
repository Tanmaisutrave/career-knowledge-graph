import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ── Users ─────────────────────────────────────────────────────
export const usersAPI = {
  getAll:           ()   => api.get("/users"),
  getById:          (id) => api.get(`/users/${id}`),
  create:           (d)  => api.post("/users", d),
  update:           (id, d) => api.put(`/users/${id}`, d),
  delete:           (id) => api.delete(`/users/${id}`),
  getSkills:        (id) => api.get(`/users/${id}/skills`),
  getProjects:      (id) => api.get(`/users/${id}/projects`),
  getCount:         ()   => api.get("/users/stats/count"),
  filterBySkill:    (name) => api.get(`/users/filter/skill?name=${name}`),
  getByExperience:  ()   => api.get("/users/stats/experience"),
};

// ── Skills ────────────────────────────────────────────────────
export const skillsAPI = {
  getAll:         ()   => api.get("/skills"),
  getById:        (id) => api.get(`/skills/${id}`),
  create:         (d)  => api.post("/skills", d),
  delete:         (id) => api.delete(`/skills/${id}`),
  getCount:       ()   => api.get("/skills/stats/count"),
  getTop:         ()   => api.get("/skills/stats/top"),
  getDistribution:()   => api.get("/skills/stats/distribution"),
};

// ── Projects ──────────────────────────────────────────────────
export const projectsAPI = {
  getAll:         ()   => api.get("/projects"),
  getById:        (id) => api.get(`/projects/${id}`),
  create:         (d)  => api.post("/projects", d),
  delete:         (id) => api.delete(`/projects/${id}`),
  getCount:       ()   => api.get("/projects/stats/count"),
  getTop:         ()   => api.get("/projects/stats/top"),
  filterBySkill:  (name) => api.get(`/projects/filter/skill?name=${name}`),
  getByTechnology:()   => api.get("/projects/stats/technology"),
};

// ── Companies ─────────────────────────────────────────────────
export const companiesAPI = {
  getAll:       ()   => api.get("/companies"),
  getById:      (id) => api.get(`/companies/${id}`),
  create:       (d)  => api.post("/companies", d),
  delete:       (id) => api.delete(`/companies/${id}`),
  getCount:     ()   => api.get("/companies/stats/count"),
  getTop:       ()   => api.get("/companies/stats/top"),
  getByIndustry:()   => api.get("/companies/stats/industry"),
};

// ── Jobs ──────────────────────────────────────────────────────
export const jobsAPI = {
  getAll:         ()   => api.get("/jobs"),
  getById:        (id) => api.get(`/jobs/${id}`),
  create:         (d)  => api.post("/jobs", d),
  delete:         (id) => api.delete(`/jobs/${id}`),
  getCount:       ()   => api.get("/jobs/stats/count"),
  getByLocation:  ()   => api.get("/jobs/stats/location"),
  getTop:         ()   => api.get("/jobs/stats/top"),
};

// ── Recommendations & Graph ───────────────────────────────────
export const recommendationsAPI = {
  getJobsForUser:     (userId)  => api.get(`/recommendations/jobs/${userId}`),
  getSimilarUsers:    (userId)  => api.get(`/recommendations/users/${userId}`),
  getConnections:     (userId)  => api.get(`/recommendations/connections/${userId}`),
  getShortestPath:    (userId, companyId) => api.get(`/recommendations/path?userId=${userId}&companyId=${companyId}`),
  getGraphStats:      ()        => api.get("/recommendations/graph/stats"),
  getGraphData:       ()        => api.get("/recommendations/graph/data"),
};

// ── Analytics ─────────────────────────────────────────────────
export const analyticsAPI = {
  getConnectedNodes:          ()           => api.get("/analytics/connected-nodes"),
  getAverageDegree:           ()           => api.get("/analytics/degree"),
  getRelationshipDistribution:()           => api.get("/analytics/relationship-distribution"),
  getNodeDistribution:        ()           => api.get("/analytics/node-distribution"),
  getConnectedSkills:         ()           => api.get("/analytics/connected-skills"),
  getGraphDensity:            ()           => api.get("/analytics/density"),
  getTopHiring:               ()           => api.get("/analytics/top-hiring"),
  getSkillGap:                (userId, jobId) => api.get(`/analytics/skill-gap?userId=${userId}&jobId=${jobId}`),
  getNeighbors:               (nodeId, hops) => api.get(`/analytics/neighbors/${nodeId}?hops=${hops}`),
  getRelatedSkills:           (skillId)    => api.get(`/analytics/related-skills/${skillId}`),
};

export default api;
