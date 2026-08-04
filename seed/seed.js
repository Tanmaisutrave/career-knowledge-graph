import neo4j from "neo4j-driver";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../server/.env") });

// Read JSON files
const users = JSON.parse(fs.readFileSync(path.join(__dirname, "users.json"), "utf-8"));
const skills = JSON.parse(fs.readFileSync(path.join(__dirname, "skills.json"), "utf-8"));
const projects = JSON.parse(fs.readFileSync(path.join(__dirname, "projects.json"), "utf-8"));
const companies = JSON.parse(fs.readFileSync(path.join(__dirname, "companies.json"), "utf-8"));
const jobs = JSON.parse(fs.readFileSync(path.join(__dirname, "jobs.json"), "utf-8"));

const driver = neo4j.driver(
  process.env.COGNODB_URI,
  neo4j.auth.basic(process.env.COGNODB_USERNAME, process.env.COGNODB_PASSWORD)
);

// Utility to get random items from array
function getRandomItems(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function seedDatabase() {
  const session = driver.session();

  try {
    console.log("🚀 Starting database seeding...\n");

    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await session.run("MATCH (n) DETACH DELETE n");
    console.log("✅ Database cleared\n");

    // Create Users
    console.log("👤 Creating Users...");
    for (const user of users) {
      await session.run(
        `MERGE (u:User {id: $id})
         SET u.name = $name, u.email = $email, u.experience = $experience, u.location = $location`,
        user
      );
    }
    console.log(`✅ Created ${users.length} users\n`);

    // Create Skills
    console.log("🛠️  Creating Skills...");
    for (const skill of skills) {
      await session.run(
        `MERGE (s:Skill {id: $id})
         SET s.name = $name, s.category = $category`,
        skill
      );
    }
    console.log(`✅ Created ${skills.length} skills\n`);

    // Create Projects
    console.log("📁 Creating Projects...");
    for (const project of projects) {
      await session.run(
        `MERGE (p:Project {id: $id})
         SET p.name = $name, p.description = $description, p.github = $github`,
        project
      );
    }
    console.log(`✅ Created ${projects.length} projects\n`);

    // Create Companies
    console.log("🏢 Creating Companies...");
    for (const company of companies) {
      await session.run(
        `MERGE (c:Company {id: $id})
         SET c.name = $name, c.industry = $industry, c.website = $website`,
        company
      );
    }
    console.log(`✅ Created ${companies.length} companies\n`);

    // Create Jobs
    console.log("💼 Creating Jobs...");
    for (const job of jobs) {
      await session.run(
        `MERGE (j:Job {id: $id})
         SET j.title = $title, j.experience = $experience, j.location = $location, j.salary = $salary`,
        job
      );
    }
    console.log(`✅ Created ${jobs.length} jobs\n`);

    // Create relationships: User -> Skills (3-6 skills per user)
    console.log("🔗 Creating User->Skill relationships...");
    let userSkillCount = 0;
    for (const user of users) {
      const userSkills = getRandomItems(skills, Math.floor(Math.random() * 4) + 3); // 3-6 skills
      for (const skill of userSkills) {
        await session.run(
          `MATCH (u:User {id: $userId}), (s:Skill {id: $skillId})
           MERGE (u)-[:HAS_SKILL]->(s)`,
          { userId: user.id, skillId: skill.id }
        );
        userSkillCount++;
      }
    }
    console.log(`✅ Created ${userSkillCount} User->Skill relationships\n`);

    // Create relationships: User -> Projects (2-4 projects per user)
    console.log("🔗 Creating User->Project relationships...");
    let userProjectCount = 0;
    for (const user of users) {
      const userProjects = getRandomItems(projects, Math.floor(Math.random() * 3) + 2); // 2-4 projects
      for (const project of userProjects) {
        await session.run(
          `MATCH (u:User {id: $userId}), (p:Project {id: $projectId})
           MERGE (u)-[:WORKED_ON]->(p)`,
          { userId: user.id, projectId: project.id }
        );
        userProjectCount++;
      }
    }
    console.log(`✅ Created ${userProjectCount} User->Project relationships\n`);

    // Create relationships: Project -> Skills (3-7 skills per project)
    console.log("🔗 Creating Project->Skill relationships...");
    let projectSkillCount = 0;
    for (const project of projects) {
      const projectSkills = getRandomItems(skills, Math.floor(Math.random() * 5) + 3); // 3-7 skills
      for (const skill of projectSkills) {
        await session.run(
          `MATCH (p:Project {id: $projectId}), (s:Skill {id: $skillId})
           MERGE (p)-[:USES]->(s)`,
          { projectId: project.id, skillId: skill.id }
        );
        projectSkillCount++;
      }
    }
    console.log(`✅ Created ${projectSkillCount} Project->Skill relationships\n`);

    // Create relationships: Company -> Jobs
    console.log("🔗 Creating Company->Job relationships...");
    for (const job of jobs) {
      await session.run(
        `MATCH (c:Company {id: $companyId}), (j:Job {id: $jobId})
         MERGE (c)-[:POSTED]->(j)`,
        { companyId: job.companyId, jobId: job.id }
      );
    }
    console.log(`✅ Created ${jobs.length} Company->Job relationships\n`);

    // Create relationships: Job -> Skills (2-5 skills per job)
    console.log("🔗 Creating Job->Skill relationships...");
    let jobSkillCount = 0;
    for (const job of jobs) {
      const jobSkills = getRandomItems(skills, Math.floor(Math.random() * 4) + 2); // 2-5 skills
      for (const skill of jobSkills) {
        await session.run(
          `MATCH (j:Job {id: $jobId}), (s:Skill {id: $skillId})
           MERGE (j)-[:REQUIRES]->(s)`,
          { jobId: job.id, skillId: skill.id }
        );
        jobSkillCount++;
      }
    }
    console.log(`✅ Created ${jobSkillCount} Job->Skill relationships\n`);

    // Create relationships: User -> Jobs (applied to 1-3 jobs)
    console.log("🔗 Creating User->Job (APPLIED_TO) relationships...");
    let userJobCount = 0;
    for (const user of users) {
      const appliedJobs = getRandomItems(jobs, Math.floor(Math.random() * 3) + 1); // 1-3 jobs
      for (const job of appliedJobs) {
        await session.run(
          `MATCH (u:User {id: $userId}), (j:Job {id: $jobId})
           MERGE (u)-[:APPLIED_TO]->(j)`,
          { userId: user.id, jobId: job.id }
        );
        userJobCount++;
      }
    }
    console.log(`✅ Created ${userJobCount} User->Job relationships\n`);

    // Database stats
    console.log("📊 Database Statistics:");
    const stats = await session.run(`
      MATCH (u:User) WITH count(u) as users
      MATCH (s:Skill) WITH users, count(s) as skills
      MATCH (p:Project) WITH users, skills, count(p) as projects
      MATCH (c:Company) WITH users, skills, projects, count(c) as companies
      MATCH (j:Job) WITH users, skills, projects, companies, count(j) as jobs
      RETURN users, skills, projects, companies, jobs
    `);
    
    const counts = stats.records[0].toObject();
    console.log(`   Users: ${counts.users}`);
    console.log(`   Skills: ${counts.skills}`);
    console.log(`   Projects: ${counts.projects}`);
    console.log(`   Companies: ${counts.companies}`);
    console.log(`   Jobs: ${counts.jobs}`);

    console.log("\n🎉 Database seeding completed successfully!");

  } catch (error) {
    console.error("❌ Error during seeding:", error);
  } finally {
    await session.close();
    await driver.close();
  }
}

seedDatabase();
