# 🚀 Career Knowledge Graph Platform

> A production-ready Full Stack Graph Database application built using **React**, **Express.js**, and **CognoDB (Neo4j Compatible)**. This project demonstrates graph-based data modeling, graph analytics, recommendation systems, shortest path traversal, and interactive visualization for career networking.

---

# 🌐 Live Demo

### 🔗 Frontend (Vercel)

https://career-knowledge-graph-ten.vercel.app

### 🔗 Backend API (Render)

https://career-knowledge-graph.onrender.com

### 💻 GitHub Repository

https://github.com/Tanmaisutrave/career-knowledge-graph

---

# 📌 Project Overview

Traditional relational databases struggle when dealing with highly connected data.

This project models an entire professional ecosystem as a **Knowledge Graph**, where Users, Skills, Projects, Jobs, and Companies are connected through graph relationships instead of foreign keys.

The application enables:

- Graph Traversals
- Job Recommendations
- Similar User Discovery
- Graph Analytics
- Interactive Graph Visualization
- Shortest Path Queries
- Relationship Analysis

using Cypher queries running on CognoDB.

---

# ✨ Features

## 📊 Dashboard

- KPI Cards
- Interactive Charts
- Graph Statistics
- Skills Analytics
- Job Analytics
- Company Analytics

---

## 👨 Users

- View all users
- Experience information
- Skills
- Projects

---

## 🧠 Skills

- Skills Catalog
- Skill Categories
- User Adoption Statistics

---

## 📂 Projects

- Technology Usage
- Contributors
- Skills Used

---

## 🏢 Companies

- Hiring Companies
- Industry Analysis
- Job Listings

---

## 💼 Jobs

- Job Listings
- Experience Level
- Location Analysis

---

## 🤖 Recommendation Engine

- Job Recommendations
- Similar Users
- Connection Suggestions

using multi-hop graph traversal.

---

## 🌐 Interactive Graph Explorer

Interactive Force Directed Graph built using

- Zoom
- Pan
- Hover
- Drag
- Node Search
- Node Filtering
- Relationship Highlighting

---

## 📈 Graph Analytics

Includes

- Graph Density
- Average Degree
- Relationship Distribution
- Node Distribution
- Top Hiring Companies
- Most Connected Nodes

---

# 🏗 Graph Schema

```
User
 │
 ├── HAS_SKILL ─────► Skill
 │
 ├── WORKED_ON ─────► Project
 │
 └── APPLIED_TO ────► Job

Project
 └── USES ─────────► Skill

Company
 └── POSTED ───────► Job

Job
 └── REQUIRES ─────► Skill
```

---

# 📊 Graph Statistics

| Metric | Value |
|---------|-------|
| Users | 20 |
| Skills | 20 |
| Projects | 15 |
| Companies | 10 |
| Jobs | 15 |
| Relationships | 407 |
| Total Nodes | 80 |

---

# 🛠 Tech Stack

## Frontend

- React 19
- Vite 8
- Tailwind CSS
- React Router DOM
- Axios
- Recharts
- React Force Graph 2D
- React Icons

---

## Backend

- Node.js
- Express.js
- Neo4j Driver
- CognoDB Cloud
- dotenv
- CORS

---

## Database

CognoDB Cloud

Neo4j Compatible Graph Database

---

# 📁 Folder Structure

```
career-knowledge-graph

├── client
│
├── server
│
├── seed
│
├── docs
│
└── README.md
```

---

# ⚙ Environment Variables

## Server

```
PORT=5000

COGNODB_URI=

COGNODB_USERNAME=

COGNODB_PASSWORD=
```

---

## Client

```
VITE_API_URL=https://career-knowledge-graph.onrender.com/api
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/Tanmaisutrave/career-knowledge-graph.git
```

---

## Backend

```bash
cd server

npm install

npm start
```

---

## Frontend

```bash
cd client

npm install

npm run dev
```

---

# 🌱 Seed Database

```
cd seed

node seed.js
```

Automatically creates

- Users
- Skills
- Projects
- Companies
- Jobs
- Relationships

---

# 📡 REST API

### Users

```
GET /api/users
```

### Skills

```
GET /api/skills
```

### Projects

```
GET /api/projects
```

### Companies

```
GET /api/companies
```

### Jobs

```
GET /api/jobs
```

### Recommendations

```
GET /api/recommendations/jobs/:id

GET /api/recommendations/users/:id

GET /api/recommendations/path
```

### Analytics

```
GET /api/analytics/*
```

---

# 📷 Screenshots

Add screenshots here.

Example:

```
docs/home.png

docs/dashboard.png

docs/graph-explorer.png

docs/analytics.png
```

---

# 🧠 Key Graph Queries

✔ Job Recommendation

✔ Similar Users

✔ Graph Density

✔ Shortest Path

✔ Related Skills

✔ Connected Nodes

✔ Top Hiring Companies

---

# 📈 Performance

- 35+ REST APIs
- Interactive Graph Visualization
- Responsive UI
- Graph Traversals
- Production Deployment
- Modular Architecture

---

# 🚀 Deployment

## Frontend

Vercel

https://career-knowledge-graph-ten.vercel.app

---

## Backend

Render

https://career-knowledge-graph.onrender.com

---

# 🔮 Future Improvements

- Authentication (JWT)
- Graph Machine Learning
- Resume Matching
- AI Chat Assistant
- Real-time Notifications
- Advanced Search
- Graph Export
- Admin Dashboard

---

# 👨‍💻 Author

**Tanmai Sutrave**

B.Tech Computer Science Engineering

MLR Institute of Technology

GitHub

https://github.com/Tanmaisutrave

---

# 🙏 Acknowledgements

- Wexa AI
- CognoDB
- Neo4j
- React
- Vercel
- Render

---

## ⭐ If you like this project, consider giving it a star!