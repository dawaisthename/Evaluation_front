import { useState } from "react";
import { api } from "../../api/client.js";
import { PageHeader } from "../../components/PageHeader.jsx";
import { useAsync } from "../../hooks/useAsync.js";

export function OrganizationPage() {
  const [deptRefreshKey, setDeptRefreshKey] = useState(0);
  const [roleRefreshKey, setRoleRefreshKey] = useState(0);

  // -------------------------
  // Department form state
  // -------------------------
  const [newDept, setNewDept] = useState("");
  const [newDeptDesc, setNewDeptDesc] = useState("");

  // -------------------------
  // Role form state
  // -------------------------
  const [newRole, setNewRole] = useState("");
  const [newRoleLevel, setNewRoleLevel] = useState("");

  // -------------------------
  // Fetch Departments
  // -------------------------
  const {
    status: deptStatus,
    data: departments,
    error: deptError,
  } = useAsync(async () => {
    const res = await api.getDepartments();
    return res; // make sure you return the array
  }, [deptRefreshKey]);

  async function onAddDept() {
    if (!newDept.trim()) return;

    await api.addDepartment({
      name: newDept,
      description: newDeptDesc,
    });

    setNewDept("");
    setNewDeptDesc("");
    setDeptRefreshKey((k) => k + 1);
  }
  console.log(departments);

  async function onRemoveDept(name) {
    if (!confirm(`Remove department "${name}"?`)) return;
    await api.removeDepartment(name);
    setDeptRefreshKey((k) => k + 1);
  }

  // -------------------------
  // Fetch Roles
  // -------------------------
  const {
    status: roleStatus,
    data: roles,
    error: roleError,
  } = useAsync(async () => {
    const { results } = await api.getRoles();
    return results;
  }, [roleRefreshKey]);

  async function onAddRole() {
    if (!newRole.trim() || !newRoleLevel) return;

    await api.addRole({
      name: newRole,
      level: Number(newRoleLevel),
    });

    setNewRole("");
    setNewRoleLevel("");
    setRoleRefreshKey((k) => k + 1);
  }

  async function onRemoveRole(id) {
    if (!confirm("Remove this role?")) return;
    await api.removeRole(id);
    setRoleRefreshKey((k) => k + 1);
  }

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="page">
      <PageHeader
        title="Organization"
        subtitle="Manage departments and roles."
      />

      <div className="grid grid2" style={{ gap: 20 }}>
        {/* -------------------------
            Departments
        -------------------------- */}
        <div className="card">
          <div className="cardTitle">Departments</div>

          <div className="formGrid" style={{ marginBottom: 12 }}>
            <input
              className="input"
              value={newDept}
              onChange={(e) => setNewDept(e.target.value)}
              placeholder="Department name"
            />
            <input
              className="input"
              value={newDeptDesc}
              onChange={(e) => setNewDeptDesc(e.target.value)}
              placeholder="Description"
            />

            <button className="btn btnPrimary" onClick={onAddDept}>
              Add
            </button>
          </div>

          {deptStatus === "loading" ? (
            <div className="card skeleton" style={{ minHeight: 120 }} />
          ) : deptStatus === "error" ? (
            <div className="muted">{String(deptError)}</div>
          ) : (
            <div className="table">
              <div className="tr th">
                <div>Name</div>
                <div>Description</div>
                <div>Leader</div>
                <div>Actions</div>
              </div>

              {departments?.map((d) => (
                <div key={d.id} className="tr">
                  <div>{d.name}</div>
                  <div className="muted">{d.description || "—"}</div>
                  <div>{d.leader ? d.leader : "No leader"}</div>
                  <div>
                    <button
                      className="btn btnGhost btnSmall"
                      onClick={() => onRemoveDept(d.name)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* -------------------------
            Roles
        -------------------------- */}
        <div className="card">
          <div className="cardTitle">Roles</div>

          <div className="formGrid" style={{ marginBottom: 12 }}>
            <input
              className="input"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              placeholder="Role name"
            />
            <input
              className="input"
              type="number"
              value={newRoleLevel}
              onChange={(e) => setNewRoleLevel(e.target.value)}
              placeholder="Level"
            />

            <button className="btn btnPrimary" onClick={onAddRole}>
              Add
            </button>
          </div>

          {roleStatus === "loading" ? (
            <div className="card skeleton" style={{ minHeight: 100 }} />
          ) : roleStatus === "error" ? (
            <div className="muted">{String(roleError)}</div>
          ) : (
            <div className="table">
              <div className="tr th">
                <div>Name</div>
                <div>Level</div>
                <div>Actions</div>
              </div>

              {roles?.map((r) => (
                <div key={r.id} className="tr">
                  <div>{r.name}</div>
                  <div className="muted">Level {r.level}</div>
                  <div>
                    <button
                      className="btn btnGhost btnSmall"
                      onClick={() => onRemoveRole(r.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
