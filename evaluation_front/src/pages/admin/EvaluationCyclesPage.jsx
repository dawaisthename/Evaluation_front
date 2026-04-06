import { useState } from "react";
import { api } from "../../api/client.js";
import { PageHeader } from "../../components/PageHeader.jsx";
import { useAsync } from "../../hooks/useAsync.js";

export function EvaluationCyclesPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { status, data, error } = useAsync(
    () => api.listCycles(),
    [refreshKey],
  );

  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    status: "draft",
  });

  const [actionLoading, setActionLoading] = useState({}); // track loading per cycle

  async function onCreate() {
    if (!form.name.trim()) return;
    try {
      await api.createCycle({
        name: form.name.trim(),
        startDate: form.startDate || "2026-01-01",
        endDate: form.endDate || "2026-03-31",
        status: form.status,
      });
      setForm({ name: "", startDate: "", endDate: "", status: "draft" });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      alert("Error creating cycle: " + err);
    }
  }

  // Handle status change from dropdown
  async function onStatusChange(cycleId, newStatus) {
    setActionLoading((l) => ({ ...l, [cycleId]: true }));

    try {
      if (newStatus === "active") {
        await api.activateCycle(cycleId);
      } else if (newStatus === "closed") {
        await api.closeCycle(cycleId);
      } else {
        // draft, no action required
      }
      setRefreshKey((k) => k + 1);
    } catch (err) {
      alert("Failed to update status: " + err);
    } finally {
      setActionLoading((l) => ({ ...l, [cycleId]: false }));
    }
  }

  return (
    <div className="page">
      <PageHeader
        title="Evaluation cycles"
        subtitle="Set start/end dates and manage cycle status. Actions depend on the current status."
      />

      {/* Create cycle form */}
      <div className="card">
        <div className="cardTitle">Create cycle</div>
        <div className="formGrid">
          <label className="field">
            <div className="fieldLabel">Name</div>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Q1 2026"
            />
          </label>

          <label className="field">
            <div className="fieldLabel">Start date</div>
            <input
              className="input"
              type="date"
              value={form.startDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, startDate: e.target.value }))
              }
            />
          </label>

          <label className="field">
            <div className="fieldLabel">End date</div>
            <input
              className="input"
              type="date"
              value={form.endDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, endDate: e.target.value }))
              }
            />
          </label>

          <label className="field">
            <div className="fieldLabel">Status</div>
            <select
              className="select"
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value }))
              }
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
            </select>
          </label>
        </div>

        <div style={{ marginTop: 12 }}>
          <button className="btn btnPrimary" onClick={onCreate}>
            Create cycle
          </button>
        </div>
      </div>

      <div style={{ height: 14 }} />

      {/* List cycles */}
      {status === "loading" || status === "idle" ? (
        <div className="card skeleton" style={{ minHeight: 180 }} />
      ) : status === "error" ? (
        <div className="card">
          <div className="muted">{String(error)}</div>
        </div>
      ) : (
        <div className="card">
          <div className="table">
            <div className="tr th">
              <div>Name</div>
              <div>Start</div>
              <div>End</div>
              <div>Status</div>
              <div>Actions</div>
            </div>

            {data.results?.map((c) => (
              <div key={c.id} className="tr">
                <div>{c.name}</div>
                <div>{c.start_date}</div>
                <div>{c.end_date}</div>

                {/* Status dropdown */}
                <div>
                  <select
                    className="select"
                    value={c.status}
                    disabled={actionLoading[c.id]}
                    onChange={(e) => onStatusChange(c.id, e.target.value)}
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                {/* Actions based on current status */}
                <div className="trActions" style={{ display: "flex", gap: 4 }}>
                  {c.status === "active" && (
                    <button
                      className="btn btnSecondary"
                      disabled={actionLoading[c.id]}
                      onClick={() =>
                        handleAction(c.id, api.generateAssignments)
                      }
                    >
                      {actionLoading[c.id] ? "..." : "Generate"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
