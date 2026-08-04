import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineArrowRight, HiOutlineChip, HiOutlineShare,
  HiOutlineLightBulb, HiOutlineGlobe, HiOutlineCode,
} from "react-icons/hi";
import { TbBrandGithub } from "react-icons/tb";
import { TbGraphFilled } from "react-icons/tb";
import { recommendationsAPI } from "../services/api";

/* ── Animated graph background canvas ──────────────────────── */
function GraphBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let frame;

    const nodes = Array.from({ length: 40 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 3 + 2,
      color: ["#3b82f6", "#a855f7", "#06b6d4", "#10b981", "#f59e0b"][Math.floor(Math.random() * 5)],
    }));

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw links between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(100,120,200,${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.color + "bb";
        ctx.fill();
        ctx.strokeStyle = n.color + "44";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Glow
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
        grad.addColorStop(0, n.color + "33");
        grad.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Move
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      frame = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
    />
  );
}

/* ── Stat pill ────────────────────────────────────────────── */
function StatPill({ value, label, color }) {
  return (
    <div className={`flex flex-col items-center px-6 py-3 rounded-2xl border ${color} backdrop-blur-sm`}>
      <span className="text-2xl font-bold font-mono text-gray-100">{value}</span>
      <span className="text-xs text-gray-400 mt-0.5">{label}</span>
    </div>
  );
}

/* ── Feature card ────────────────────────────────────────── */
function FeatureCard({ icon: Icon, color, title, description }) {
  return (
    <div className="glass-card p-6 group hover:border-white/[0.12] transition-all duration-300 hover:scale-[1.02]">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-semibold text-gray-100 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

/* ── Main Landing Page ───────────────────────────────────── */
export default function Home() {
  const [stats, setStats] = useState({ users: "–", skills: "–", relationships: "–" });

  useEffect(() => {
    recommendationsAPI.getGraphStats().then(res => {
      const d = res.data.data;
      if (d) setStats({ users: d.users, skills: d.skills, relationships: d.relationships });
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-dark-950 text-gray-100 overflow-x-hidden">

      {/* ── Navigation bar ─────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 h-16 px-6 flex items-center justify-between border-b border-white/[0.05] bg-dark-950/80 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center">
            <TbGraphFilled className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-sm text-gray-100">Career Graph</span>
          <span className="hidden sm:block text-xs text-gray-600 ml-1">by Wexa AI</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com"
            target="_blank" rel="noopener noreferrer"
            className="p-2 rounded-xl text-gray-400 hover:text-gray-100 hover:bg-white/[0.06] transition-colors"
          >
            <TbBrandGithub className="w-5 h-5" />
          </a>
          <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400 font-medium">CognoDB Live</span>
          </div>
          <Link
            to="/dashboard"
            className="btn-primary text-xs py-2"
          >
            Open App <HiOutlineArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
        <GraphBackground />

        {/* Radial glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-accent-purple/5 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-1.5 mb-8 text-xs font-medium text-primary-300">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
            Built for Wexa AI Technical Interview · CognoDB Graph Database
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.08]">
            <span className="text-gray-100">Career Knowledge</span>
            <br />
            <span className="gradient-text">Graph Platform</span>
          </h1>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            A production-grade graph database application demonstrating why connected data
            problems require a graph database. Powered by{" "}
            <span className="text-primary-400 font-medium">CognoDB</span> — the Neo4j-compatible
            cloud graph database.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <Link
              to="/dashboard"
              className="btn-primary px-6 py-3 text-sm font-semibold group"
            >
              Launch Dashboard
              <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/graph-explorer"
              className="btn-ghost px-6 py-3 text-sm font-semibold"
            >
              <HiOutlineGlobe className="w-4 h-4" />
              Explore Graph
            </Link>
            <a
              href="https://github.com"
              target="_blank" rel="noopener noreferrer"
              className="btn-ghost px-6 py-3 text-sm font-semibold"
            >
              <TbBrandGithub className="w-4 h-4" />
              GitHub
            </a>
          </div>

          {/* Live stats */}
          <div className="flex flex-wrap justify-center gap-4">
            <StatPill value={stats.users}         label="Users"         color="bg-primary-500/5 border-primary-500/20" />
            <StatPill value={stats.skills}        label="Skills"        color="bg-purple-500/5 border-purple-500/20" />
            <StatPill value={stats.relationships} label="Relationships" color="bg-cyan-500/5 border-cyan-500/20" />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-600 animate-bounce">
          <span className="text-xs font-medium">Scroll to explore</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── Why Graph Database? ───────────────────── */}
      <section className="py-24 px-6 bg-gradient-to-b from-dark-950 to-dark-900/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-accent-purple uppercase tracking-widest">Why Graph?</span>
            <h2 className="text-3xl font-bold text-gray-100 mt-3 mb-4">
              Relational Databases Can't Do This
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm leading-relaxed">
              Career networks are inherently connected data. SQL requires expensive multi-table JOINs
              to traverse relationships. A graph database makes multi-hop traversal a first-class
              operation — executed in milliseconds.
            </p>
          </div>

          {/* SQL vs Graph comparison */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <div className="glass-card p-6 border-red-500/10">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <h3 className="text-sm font-semibold text-gray-300">SQL: "Find jobs matching my skills"</h3>
              </div>
              <pre className="text-xs text-red-300/80 font-mono bg-dark-700/40 rounded-xl p-4 overflow-x-auto leading-relaxed">
{`SELECT j.*
FROM jobs j
JOIN job_skills js ON j.id = js.job_id
JOIN user_skills us ON js.skill_id = us.skill_id
WHERE us.user_id = ?
GROUP BY j.id
ORDER BY COUNT(*) DESC
LIMIT 10
-- 4 tables, 3 JOINs, scales poorly`}</pre>
            </div>

            <div className="glass-card p-6 border-green-500/10">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                <h3 className="text-sm font-semibold text-gray-300">Cypher: Same query</h3>
              </div>
              <pre className="text-xs text-green-300/80 font-mono bg-dark-700/40 rounded-xl p-4 overflow-x-auto leading-relaxed">
{`MATCH (u:User {id: $userId})
      -[:HAS_SKILL]->(s:Skill)
      <-[:REQUIRES]-(j:Job)
WITH j, count(s) AS match
MATCH (c:Company)-[:POSTED]->(j)
RETURN j, c, match
ORDER BY match DESC
LIMIT 10
-- Reads the graph, no JOINs needed`}</pre>
            </div>
          </div>

          {/* Feature cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              icon={HiOutlineShare}
              color="bg-primary-500/10 text-primary-400"
              title="Multi-hop Traversal"
              description="Traverse any number of relationship hops — find a user's career path to a company through 4+ connected nodes in a single query."
            />
            <FeatureCard
              icon={HiOutlineLightBulb}
              color="bg-accent-purple/10 text-purple-400"
              title="Graph Recommendations"
              description="Recommend jobs, skills, and users by counting shared graph neighbors — no ML model required, pure graph logic."
            />
            <FeatureCard
              icon={HiOutlineChip}
              color="bg-cyan-500/10 text-cyan-400"
              title="Shortest Path"
              description="Find the shortest connection between any user and company using Neo4j's built-in BFS shortestPath() algorithm."
            />
            <FeatureCard
              icon={HiOutlineGlobe}
              color="bg-green-500/10 text-green-400"
              title="Force-Directed Visualization"
              description="Interactive graph explorer powered by react-force-graph with drag, zoom, pan, neighbor highlighting, and node inspection."
            />
            <FeatureCard
              icon={HiOutlineCode}
              color="bg-orange-500/10 text-orange-400"
              title="Skill Gap Analysis"
              description="Compare a user's skills against any job's requirements. Identify missing skills and calculate compatibility percentage."
            />
            <FeatureCard
              icon={HiOutlineShare}
              color="bg-pink-500/10 text-pink-400"
              title="Degree Centrality"
              description="Identify the most influential nodes in the graph — which skills, users, or companies are most connected to everything else."
            />
          </div>
        </div>
      </section>

      {/* ── What is Career Knowledge Graph ───────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-semibold text-accent-cyan uppercase tracking-widest">About</span>
          <h2 className="text-3xl font-bold text-gray-100 mt-3 mb-6">What is Career Knowledge Graph?</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            A Career Knowledge Graph models professionals, their skills, projects, employers, and
            job opportunities as a connected property graph. Instead of isolated records in separate
            tables, every entity is a node and every relationship is a named, typed edge. This makes
            questions like <em className="text-gray-300">"how is Alice connected to Google?"</em> or{" "}
            <em className="text-gray-300">"which skills does Bob need to qualify for this role?"</em>{" "}
            trivial to answer — they are simply graph traversals.
          </p>

          {/* Graph model visualization */}
          <div className="glass-card p-8 text-left">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-5 font-semibold">Graph Model</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {[
                { label: "User", color: "#3b82f6", desc: "id · name · email · experience · location" },
                { label: "Skill", color: "#a855f7", desc: "id · name · category" },
                { label: "Project", color: "#06b6d4", desc: "id · name · description · github" },
                { label: "Company", color: "#f59e0b", desc: "id · name · industry · website" },
                { label: "Job", color: "#10b981", desc: "id · title · experience · salary · location" },
              ].map(({ label, color, desc }) => (
                <div key={label} className="flex items-start gap-2.5 bg-dark-700/40 rounded-xl p-3">
                  <div className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0" style={{ backgroundColor: color }} />
                  <div>
                    <p className="text-xs font-semibold text-gray-200">{label}</p>
                    <p className="text-[10px] text-gray-600 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                "User -[HAS_SKILL]→ Skill",
                "User -[WORKED_ON]→ Project",
                "User -[APPLIED_TO]→ Job",
                "Project -[USES]→ Skill",
                "Job -[REQUIRES]→ Skill",
                "Company -[POSTED]→ Job",
              ].map(rel => (
                <span key={rel} className="text-[10px] font-mono bg-dark-600/40 text-primary-300 border border-primary-500/10 rounded-lg px-2.5 py-1">
                  {rel}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────── */}
      <section className="py-24 px-6 bg-gradient-to-b from-dark-900/40 to-dark-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-100 mb-4">Ready to explore?</h2>
          <p className="text-gray-400 text-sm mb-10">
            The database is live. The graph is seeded. Every query is real.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/dashboard" className="btn-primary px-8 py-3">
              Open Dashboard <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/graph-explorer" className="btn-ghost px-8 py-3">
              <HiOutlineGlobe className="w-4 h-4" /> Graph Explorer
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────── */}
      <footer className="border-t border-white/[0.05] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <TbGraphFilled className="w-4 h-4 text-gray-600" />
            <span>Career Knowledge Graph Platform — Wexa AI Assignment</span>
          </div>
          <div className="flex items-center gap-4">
            <span>CognoDB (Neo4j compatible)</span>
            <span>·</span>
            <span>React + Express</span>
            <span>·</span>
            <span>Graph Database Demo</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
