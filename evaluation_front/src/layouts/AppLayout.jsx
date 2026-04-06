import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import "../css/app-shell.css";

function NavItem({ to, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `navItem ${isActive ? "navItemActive" : ""}`}
    >
      {children}
    </NavLink>
  );
}

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.is_admin;
  const isManager = user?.is_manager;
  const actorLabel = isAdmin ? "Admin" : isManager ? "Manager" : "Employee";

  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandMark">E</div>
          <div className="brandText">
            <div className="brandTitle">EvalHub</div>
            <div className="brandSub">Performance reviews</div>
          </div>
        </div>

        <div className="navGroup">
          <div className="navGroupTitle">Main</div>
          <NavItem to="/dashboard" end>
            Dashboard
          </NavItem>
          <NavItem to="/my-evaluations">My evaluations</NavItem>

          {isManager && <NavItem to="/my-team">My team</NavItem>}

          <NavItem to="/my-results">My results</NavItem>
        </div>

        {isAdmin && (
          <div className="navGroup">
            <div className="navGroupTitle">Admin</div>
            <NavItem to="/admin/organization">Organization</NavItem>
            <NavItem to="/admin/employees">Employees</NavItem>
            <NavItem to="/admin/hierarchy">Hierarchy</NavItem>
            <NavItem to="/admin/evaluation-cycles">Evaluation cycles</NavItem>
            <NavItem to="/admin/question-bank">Question bank</NavItem>
            <NavItem to="/admin/templates">Role templates</NavItem>
            <NavItem to="/admin/assignments">Assignments</NavItem>
          </div>
        )}

        <div className="sidebarFooter">
          <div className="userChip">
            <div className="avatar">{user?.name?.slice?.(0, 1) ?? "?"}</div>
            <div className="userMeta">
              <div className="userName">{user?.name ?? "User"}</div>
              <div className="userRole">{actorLabel}</div>
            </div>
          </div>
          <div className="footerActions">
            <button
              className="btn btnGhost"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Log out
            </button>
          </div>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
