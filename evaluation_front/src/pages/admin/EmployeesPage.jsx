import { useMemo, useState } from "react";
import { api } from "../../api/client.js";
import { PageHeader } from "../../components/PageHeader.jsx";
import { useAsync } from "../../hooks/useAsync.js";

function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      className="select"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function EmployeesPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: null,
    department: null,
    managerId: null,
  });

  // --- Fetch employees list (includes roles, departments, managers) ---
  const {
    status: listStatus,
    data: employees,
    error: listError,
  } = useAsync(() => api.listEmployees(), [refreshKey]);

  const rows = listStatus === "success" ? employees.results : [];
  const byId = useMemo(() => new Map(rows.map((e) => [e.id, e])), [rows]);

  // --- Build select options from API data ---
  const roleOptions = useMemo(() => {
    const roles = rows.map((e) => ({ id: e.role, name: e.role_name }));
    const unique = Array.from(new Map(roles.map((r) => [r.id, r])).values());
    return unique.map((r) => ({ value: r.id, label: r.name }));
  }, [rows]);

  const deptOptions = useMemo(() => {
    const depts = rows.map((e) => ({
      id: e.department,
      name: e.department_name,
    }));
    const unique = Array.from(new Map(depts.map((d) => [d.id, d])).values());
    return unique.map((d) => ({ value: d.id, label: d.name }));
  }, [rows]);

  const managerOptions = useMemo(() => {
    const managers = rows
      .filter((e) => e.manager)
      .map((e) => ({ id: e.manager, name: e.manager_name }));
    const unique = Array.from(new Map(managers.map((m) => [m.id, m])).values());
    return unique.map((m) => ({ value: m.id, label: m.name }));
  }, [rows]);

  // --- Add Employee ---
  async function onCreate() {
    if (!form.name?.trim() || !form.email?.trim()) return;

    await api.createEmployee({
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      department: form.department,
      managerId: form.managerId,
    });

    setForm({
      name: "",
      email: "",
      role: null,
      department: null,
      managerId: null,
    });
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="page">
      <PageHeader
        title="Employees"
        subtitle="Create employees and assign department/role. Manager relationships are set in Hierarchy."
      />

      <div className="grid grid2">
        {/* Add Employee Form */}
        <div className="card">
          <div className="cardTitle">Add employee</div>
          <div className="formGrid">
            <label className="field">
              <div className="fieldLabel">Name</div>
              <input
                className="input"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Alex Johnson"
              />
            </label>

            <label className="field">
              <div className="fieldLabel">Email</div>
              <input
                className="input"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="alex@company.com"
              />
            </label>

            <label className="field">
              <div className="fieldLabel">Role</div>
              <Select
                value={form.role}
                onChange={(v) => setForm((f) => ({ ...f, role: v }))}
                options={roleOptions}
                placeholder="Select role"
              />
            </label>

            <label className="field">
              <div className="fieldLabel">Department</div>
              <Select
                value={form.department}
                onChange={(v) => setForm((f) => ({ ...f, department: v }))}
                options={deptOptions}
                placeholder="Select department"
              />
            </label>

            <label className="field">
              <div className="fieldLabel">Manager (optional)</div>
              <Select
                value={form.managerId}
                onChange={(v) => setForm((f) => ({ ...f, managerId: v }))}
                options={managerOptions}
                placeholder="No manager"
              />
            </label>
          </div>

          <div style={{ marginTop: 12 }}>
            <button className="btn btnPrimary" onClick={onCreate}>
              Create employee
            </button>
          </div>
        </div>

        {/* Notes */}
        <div className="card">
          <div className="cardTitle">Notes</div>
          <div className="muted">
            For auto-assignments, the system needs:
            <ul className="list">
              <li>Department</li>
              <li>Role</li>
              <li>Manager relationship (Hierarchy page)</li>
            </ul>
          </div>
        </div>
      </div>

      <div style={{ height: 14 }} />

      {/* Employees Table */}
      {listStatus === "loading" ? (
        <div className="card skeleton" style={{ minHeight: 220 }} />
      ) : listStatus === "error" ? (
        <div className="card">
          <div className="muted">{String(listError)}</div>
        </div>
      ) : (
        <div className="card">
          <div className="table">
            <div
              className="tr th"
              style={{
                gridTemplateColumns: "1fr 220px 120px 120px 140px 120px",
              }}
            >
              <div>Name</div>
              <div>Email</div>
              <div>Role</div>
              <div>Department</div>
              <div>Manager</div>
              <div>Date Hired</div>
            </div>

            {rows.map((e) => (
              <div
                key={e.id}
                className="tr"
                style={{
                  gridTemplateColumns: "1fr 220px 120px 120px 140px 120px",
                }}
              >
                <div>{`${e.user.first_name} ${e.user.last_name}`}</div>
                <div className="muted">{e.user.email}</div>
                <div>{e.role_name}</div>
                <div>{e.department_name}</div>
                <div className="muted">{e.manager_name || "—"}</div>
                <div className="muted">{e.date_hired || "—"}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
