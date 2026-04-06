import { api } from "../api/client.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { StatCard } from "../components/StatCard.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { ProgressCard } from "../charts/Progresscard.jsx";
import { DashboardSkeleton } from "../layouts/DashboardSkeleton.jsx";

export function DashboardPage() {
  const { status, data, error } = useAsync(() => api.getDashboard(), []);

  if (status === "loading" || status === "idle") return <DashboardSkeleton />;
  if (status === "error") return <DashboardError error={error} />;

  const { me, stats, activeCycle } = data;

  // 1. Dynamic Calculations from the 'stats' object
  const total = stats.total || 0;
  const completionRate =
    total > 0 ? Math.round((stats.completed / total) * 100) : 0;

  // 2. Score Formatting Logic
  const hasScore =
    stats.averageScore !== null && stats.averageScore !== undefined;
  const displayScore = hasScore ? stats.averageScore : "—";
  const scoreHint = hasScore
    ? "Current performance rating"
    : "No ratings received yet";

  return (
    <div className="page">
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${me.name}. ${
          activeCycle
            ? `Active cycle: ${activeCycle.name}.`
            : "No active cycle."
        }`}
      />

      <div className="pageContent">
        {/* SECTION 1: PERSONAL PROGRESS & SCORE */}
        <section className="dashboardSection">
          <div className="grid grid-highlight">
            <ProgressCard
              title="My Completion"
              percentage={completionRate}
              subtitle={`${stats.completed} of ${total} finished`}
            />

            <div className="card scoreCard">
              <div className="statLabel">Average Rating</div>
              <div className="scoreContainer">
                <span className="scoreValue">{displayScore}</span>
                {hasScore && <span className="scoreMax">/ 5</span>}
              </div>
              <div className="statHint">{scoreHint}</div>
            </div>
          </div>
        </section>

        {/* SECTION 2: MANAGER INSIGHTS */}
        {me.is_manager && (
          <section className="dashboardSection">
            <h3 className="sectionTitle">Team Overview</h3>
            <div className="grid grid2">
              <StatCard
                label="Team Pending"
                value={stats.teamPending}
                trend="down"
                trendValue={stats.teamPending}
                hint="Assignments for your subordinates"
              />
              <StatCard
                label="Team Completed"
                value={stats.teamCompleted}
                trend="up"
                trendValue={stats.teamCompleted}
                hint="Finished by your team"
              />
            </div>
          </section>
        )}

        {/* SECTION 3: QUICK STATS */}
        <section className="dashboardSection">
          <div className="grid grid3">
            <StatCard
              label="Personal Pending"
              value={stats.pending}
              hint="Your own tasks"
            />
            {me.is_admin && (
              <StatCard
                label="Active Cycles"
                value={stats.cyclesActive}
                hint="System-wide"
              />
            )}
          </div>
        </section>

        {/* SECTION 4: PROFILE & ACTIONS */}
        <section className="dashboardSection">
          <div className="grid grid2">
            <div className="card">
              <div className="cardTitle">Quick Actions</div>
              <div className="buttonRow">
                <a className="btn btnPrimary" href="/my-evaluations">
                  Start Evaluating
                </a>
                <a className="btn btnGhost" href="/reports">
                  View Reports
                </a>
              </div>
            </div>

            <div className="card">
              <div className="cardTitle">Your Profile</div>
              <div className="kv">
                <div className="kvRow">
                  <span className="kvKey">Role</span>
                  <span className="KvVal">{me.role}</span>
                </div>
                <div className="kvRow">
                  <span className="kvKey">Is</span>
                  <span className="kvVal">
                    {" "}
                    {me.is_admin
                      ? "Admin"
                      : me.is_manager
                        ? "Manager"
                        : "Employee"}
                  </span>
                </div>
                <div className="kvRow">
                  <span className="kvKey">Department</span>
                  <span className="kvVal">{me.department}</span>
                </div>
                <div className="kvRow">
                  <span className="kvKey">Lead</span>
                  <span className="kvVal">{me.manager}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
