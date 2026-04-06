import { useMemo, useState } from "react";
import { api } from "../api/client.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { StatCard } from "../components/StatCard.jsx";
import { useAsync } from "../hooks/useAsync.js";

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

export function MyResultsPage() {
  const {
    status: cycleStatus,
    data: cycles,
    error: cycleError,
  } = useAsync(() => api.listCycles(), []);

  const [selectedCycleId, setSelectedCycleId] = useState(null);

  const cycleOptions = useMemo(() => {
    if (cycleStatus !== "Closed") return [];

    return cycles.results.map((c) => ({
      value: c.id,
      label: `${c.name} (${c.status})`,
    }));
  }, [cycleStatus, cycles]);

  const effectiveCycleId = selectedCycleId || cycleOptions[0]?.value;

  const {
    status,
    data: results,
    error,
  } = useAsync(
    () => (effectiveCycleId ? api.getMySummary(effectiveCycleId) : null),
    [effectiveCycleId],
  );

  const loading =
    status === "loading" || status === "idle" || cycleStatus === "loading";

  const anyError = status === "error" || cycleStatus === "error";

  return (
    <div className="page">
      <PageHeader
        title="My Results"
        subtitle="Summary of feedback others have given you."
      />

      {/* cycle selector */}
      <div className="card">
        <div className="formGrid" style={{ alignItems: "end" }}>
          <label className="field">
            <div className="fieldLabel">Cycle</div>

            <Select
              value={effectiveCycleId}
              onChange={(v) => setSelectedCycleId(v)}
              options={cycleOptions}
              placeholder="Select cycle"
            />
          </label>

          <div className="muted">
            Shows your overall evaluation score for this cycle.
          </div>
        </div>
      </div>

      <div style={{ height: 14 }} />

      {loading ? (
        <div className="card skeleton" style={{ minHeight: 200 }} />
      ) : anyError ? (
        <div className="card">
          <div className="muted">{String(error ?? cycleError)}</div>
        </div>
      ) : !results ? (
        <div className="card">
          <div className="muted">
            No evaluation results available for this cycle.
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid3">
            <StatCard label="Employee" value={results.employee} />

            <StatCard label="Cycle" value={results.cycle} />

            <StatCard
              label="Average Score"
              value={results.average_score ?? "—"}
              hint="Overall evaluation score"
            />
          </div>

          <div style={{ height: 14 }} />

          <div className="card">
            <div className="cardTitle">Cycle Information</div>

            <div className="kv">
              <div className="kvRow">
                <div className="kvKey">Start Date</div>
                <div className="kvVal">{results.start_date}</div>
              </div>

              <div className="kvRow">
                <div className="kvKey">End Date</div>
                <div className="kvVal">{results.end_date}</div>
              </div>

              <div className="kvRow">
                <div className="kvKey">Status</div>
                <div className="kvVal">{results.status}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
