# API Documentation — Career Knowledge Graph Platform

**Base URL:** `http://localhost:5000/api`

All responses follow the shape:
```json
{ "success": true, "data": { ... } }
// or on error:
{ "success": false, "message": "..." }
```

---

## Users `/api/users`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/users` | Get all users with their skills and projects |
| GET    | `/api/users/:id` | Get a single user by ID (full profile) |
| POST   | `/api/users` | Create a new user |
| PUT    | `/api/users/:id` | Update an existing user |
| DELETE | `/api/users/:id` | Delete a user and all their relationships |
| GET    | `/api/users/:id/skills` | Get all skills belonging to a user |
| GET    | `/api/users/:id/projects` | Get all projects a user worked on |
| GET    | `/api/users/stats/count` | Get total count of users |
| GET    | `/api/users/stats/experience` | Get users grouped by experience level |
| GET    | `/api/users/filter/skill?name=Python` | Filter users by skill name |

### POST /api/users — Request Body
```json
{
  "name": "Alice Chen",
  "email": "alice@example.com",
  "experience": 5,
  "location": "San Francisco, CA"
}
```

### PUT /api/users/:id — Request Body
```json
{
  "name": "Alice Chen",
  "email": "alice@newdomain.com",
  "experience": 6,
  "location": "Seattle, WA"
}
```

---

## Skills `/api/skills`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/skills` | Get all skills with user count |
| GET    | `/api/skills/:id` | Get a single skill with related users, projects, jobs |
| POST   | `/api/skills` | Create a new skill |
| DELETE | `/api/skills/:id` | Delete a skill |
| GET    | `/api/skills/stats/count` | Total number of skills |
| GET    | `/api/skills/stats/top` | Top 10 most used skills |
| GET    | `/api/skills/stats/distribution` | Skills grouped by category |

### POST /api/skills — Request Body
```json
{
  "name": "Rust",
  "category": "Programming Language"
}
```

---

## Projects `/api/projects`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/projects` | Get all projects with skills and member count |
| GET    | `/api/projects/:id` | Get single project with full details |
| POST   | `/api/projects` | Create a new project |
| DELETE | `/api/projects/:id` | Delete a project |
| GET    | `/api/projects/stats/count` | Total project count |
| GET    | `/api/projects/stats/top` | Top projects by contributor count |
| GET    | `/api/projects/stats/technology` | Projects grouped by technology |
| GET    | `/api/projects/filter/skill?name=React` | Projects filtered by skill |

### POST /api/projects — Request Body
```json
{
  "name": "Graph Visualizer",
  "description": "An interactive graph visualization tool.",
  "github": "https://github.com/user/graph-viz"
}
```

---

## Companies `/api/companies`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/companies` | Get all companies with their jobs |
| GET    | `/api/companies/:id` | Get company detail with jobs and required skills |
| POST   | `/api/companies` | Create a new company |
| DELETE | `/api/companies/:id` | Delete a company |
| GET    | `/api/companies/stats/count` | Total company count |
| GET    | `/api/companies/stats/top` | Top companies by job count |
| GET    | `/api/companies/stats/industry` | Companies grouped by industry |

### POST /api/companies — Request Body
```json
{
  "name": "TechCorp",
  "industry": "Software Development",
  "website": "https://techcorp.io"
}
```

---

## Jobs `/api/jobs`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/jobs` | Get all jobs with company and required skills |
| GET    | `/api/jobs/:id` | Get job detail with applicants |
| POST   | `/api/jobs` | Create a new job listing |
| DELETE | `/api/jobs/:id` | Delete a job listing |
| GET    | `/api/jobs/stats/count` | Total job count |
| GET    | `/api/jobs/stats/location` | Jobs grouped by location |
| GET    | `/api/jobs/stats/top` | Top jobs by applicant count |

### POST /api/jobs — Request Body
```json
{
  "title": "Senior Backend Engineer",
  "experience": 4,
  "location": "Remote",
  "salary": "$130,000 - $165,000"
}
```

---

## Recommendations `/api/recommendations`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/recommendations/jobs/:userId` | Recommend jobs for a user based on skill match |
| GET    | `/api/recommendations/users/:userId` | Find users with similar skills |
| GET    | `/api/recommendations/connections/:userId` | Companies reachable from a user via skills |
| GET    | `/api/recommendations/path?userId=u1&companyId=c1` | Shortest path between user and company |
| GET    | `/api/recommendations/graph/stats` | Full graph statistics |
| GET    | `/api/recommendations/graph/data` | All nodes and links for graph visualization |

### GET /api/recommendations/path — Response
```json
{
  "success": true,
  "data": {
    "length": 3,
    "nodes": [
      { "id": 1, "labels": ["User"], "properties": { "name": "Alice Chen" } },
      { "id": 5, "labels": ["Skill"], "properties": { "name": "Python" } },
      { "id": 12, "labels": ["Job"], "properties": { "title": "ML Engineer" } },
      { "id": 3, "labels": ["Company"], "properties": { "name": "NeuralPath AI" } }
    ],
    "relationships": [
      { "type": "HAS_SKILL" },
      { "type": "REQUIRES" },
      { "type": "POSTED" }
    ]
  }
}
```
