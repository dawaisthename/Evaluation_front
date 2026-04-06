import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/client.js";
import { PageHeader } from "../../components/PageHeader.jsx";

function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      className="select"
      value={value ?? ""}
      onChange={(e) => onChange(Number(e.target.value) || null)}
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

export function AssignmentsPage() {
  const [cycles, setCycles] = useState([]);
  const [selectedCycleId, setSelectedCycleId] = useState(null);

  const [assignments, setAssignments] = useState([]);
  const [loadingCycles, setLoadingCycles] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  const [regenKey, setRegenKey] = useState(0);

  // -------------------------
  // Load cycles on page load
  // -------------------------
  useEffect(() => {
    async function loadCycles() {
      try {
        const data = await api.listCycles();
        setCycles(data.results || []);

        if (data.results?.length) {
          setSelectedCycleId(data.results[0].id);
        }
      } catch (err) {
        console.error("Failed to load cycles:", err);
      } finally {
        setLoadingCycles(false);
      }
    }

    loadCycles();
  }, []);

  // -------------------------
  // Fetch assignments
  // -------------------------
  useEffect(() => {
    if (!selectedCycleId) return;

    async function loadAssignments() {
      try {
        setLoadingAssignments(true);

        const data = await api.listAssignments(selectedCycleId);

        console.log("Assignments fetched:", data);

        setAssignments(data.results || []);
      } catch (err) {
        console.error("Failed to load assignments:", err);
      } finally {
        setLoadingAssignments(false);
      }
    }

    loadAssignments();
  }, [selectedCycleId, regenKey]);

  // -------------------------
  // Generate assignments
  // -------------------------
  async function onGenerate() {
    if (!selectedCycleId) return;

    await api.generateAssignments(selectedCycleId);
    setRegenKey((k) => k + 1);
  }

  // -------------------------
  // Cycle dropdown options
  // -------------------------
  const cycleOptions = useMemo(() => {
    return cycles.map((c) => ({
      value: c.id,
      label: `${c.name} (${c.status})`,
    }));
  }, [cycles]);

  // -------------------------
  // Assignment totals
  // -------------------------
  const totals = useMemo(() => {
    return assignments.reduce(
      (acc, a) => {
        acc[a.review_type] = (acc[a.review_type] || 0) + 1;
        return acc;
      },
      { upward: 0, downward: 0, sideway: 0 },
    );
  }, [assignments]);

  const isLoading = loadingCycles || loadingAssignments;

  return (
    <div className="page">
      <PageHeader
        title="Assignments"
        subtitle="Generate upward/downward/peer reviews automatically from your org structure."
        actions={
          <button
            className="btn btnPrimary"
            onClick={onGenerate}
            disabled={!selectedCycleId}
          >
            Generate assignments
          </button>
        }
      />

      {/* Cycle selector */}
      <div className="card">
        <div className="formGrid" style={{ alignItems: "end" }}>
          <label className="field">
            <div className="fieldLabel">Cycle</div>
            <Select
              value={selectedCycleId}
              onChange={setSelectedCycleId}
              options={cycleOptions}
              placeholder="Select cycle"
            />
          </label>

          <div className="muted">
            Make sure you have:
            <ul className="list">
              <li>Employees created</li>
              <li>Hierarchy configured</li>
              <li>Cycle created</li>
            </ul>
          </div>
        </div>
      </div>

      <div style={{ height: 14 }} />

      {isLoading ? (
        <div className="card">Loading assignments...</div>
      ) : (
        <div className="grid grid2">
          <div className="card">
            <div className="cardTitle">Auto-assignment rules</div>

            <ul className="list">
              <li>
                <b>Upward</b>: employees review their manager
              </li>
              <li>
                <b>Downward</b>: managers review direct reports
              </li>
              <li>
                <b>Peer</b>: colleagues review each other
              </li>
            </ul>

            <div className="muted">
              Assignments regenerate every time you click Generate.
            </div>
          </div>

          <div className="card">
            <div className="cardTitle">Assignment status</div>

            <div className="kv">
              <div className="kvRow">
                <div className="kvKey">Upward</div>
                <div className="kvVal">{totals.upward}</div>
              </div>

              <div className="kvRow">
                <div className="kvKey">Downward</div>
                <div className="kvVal">{totals.downward}</div>
              </div>

              <div className="kvRow">
                <div className="kvKey">Peer</div>
                <div className="kvVal">{totals.sideway}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ height: 14 }} />

      {/* Assignment table */}
      {assignments.length > 0 && (
        <div className="card">
          <div className="cardTitle">Assignments for selected cycle</div>

          <div className="table">
            <div
              className="tr th"
              style={{ gridTemplateColumns: "120px 1fr 1fr" }}
            >
              <div>Type</div>
              <div>Reviewer</div>
              <div>Reviewee</div>
            </div>

            {assignments.map((a) => (
              <div
                key={a.id}
                className="tr"
                style={{ gridTemplateColumns: "120px 1fr 1fr" }}
              >
                <div>
                  {a.review_type === "upward"
                    ? "Upward"
                    : a.review_type === "downward"
                      ? "Downward"
                      : "Peer"}
                </div>

                <div>{a.reviewer_name}</div>

                <div>{a.reviewee_name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
