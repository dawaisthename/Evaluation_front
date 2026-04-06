import { useMemo, useState } from 'react'
import { api } from '../api/client.js'
import { PageHeader } from '../components/PageHeader.jsx'
import { StatCard } from '../components/StatCard.jsx'
import { useAsync } from '../hooks/useAsync.js'

function Select({ value, onChange, options, placeholder }) {
  return (
    <select className="select" value={value ?? ''} onChange={(e) => onChange(e.target.value || null)}>
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

export function ReportsPage() {
  const [selectedCycleId, setSelectedCycleId] = useState(null)

  const { status: cycleStatus, data: cycles, error: cycleError } = useAsync(() => api.listCycles(), [])

  const cycleOptions = useMemo(() => {
    if (cycleStatus !== 'success') return []
    return cycles.map((c) => ({ value: c.id, label: `${c.name} (${c.status})` }))
  }, [cycleStatus, cycles])

  const effectiveCycleId = selectedCycleId || (cycleOptions[0]?.value ?? null)

  const {
    status,
    data: overview,
    error,
  } = useAsync(
    () => (effectiveCycleId ? api.getReportingOverview(effectiveCycleId) : Promise.resolve(null)),
    [effectiveCycleId],
  )

  const loading = status === 'loading' || status === 'idle' || cycleStatus === 'loading'
  const anyError = status === 'error' || cycleStatus === 'error'

  const depRows = useMemo(() => {
    if (!overview) return []
    return Object.values(overview.totals.byDepartment || {})
  }, [overview])

  const completionPct =
    overview && overview.totals.totalAssignments
      ? Math.round((overview.totals.completed / overview.totals.totalAssignments) * 100)
      : 0

  return (
    <div className="page">
      <PageHeader
        title="Reports"
        subtitle="High-level view of evaluation completion by cycle and department."
        actions={
          <button className="btn btnGhost" disabled>
            Export (later)
          </button>
        }
      />

      <div className="card">
        <div className="formGrid" style={{ alignItems: 'end' }}>
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
            This summary is computed from generated assignments and completed evaluations in the browser mock data.
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
      ) : overview ? (
        <>
          <div className="grid grid3">
            <StatCard
              label="Assignments"
              value={overview.totals.totalAssignments}
              hint={`Cycle: ${overview.cycleName}`}
            />
            <StatCard
              label="Completed"
              value={overview.totals.completed}
              hint={`${completionPct}% completion`}
            />
            <StatCard
              label="By type"
              value={`${overview.totals.byType.upward ?? 0} ↑ / ${overview.totals.byType.downward ?? 0} ↓ / ${
                overview.totals.byType.sideway ?? 0
              } ⇄`}
              hint="Upward / Downward / Sideway (Peer)"
            />
          </div>

          <div style={{ height: 14 }} />

          <div className="grid grid2">
            <div className="card">
              <div className="cardTitle">By department</div>
              <div className="table">
                <div className="tr th" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
                  <div>Department</div>
                  <div>Assignments</div>
                  <div>Completed</div>
                </div>
                {depRows.map((d) => {
                  const pct = d.assignments ? Math.round((d.completed / d.assignments) * 100) : 0
                  return (
                    <div key={d.department} className="tr" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
                      <div>{d.department}</div>
                      <div>{d.assignments}</div>
                      <div>
                        {d.completed}{' '}
                        <span className="muted" style={{ fontSize: 12 }}>
                          ({pct}%)
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="card">
              <div className="cardTitle">Notes</div>
              <div className="muted">
                This is a mock reporting view using frontend data only. When we hook up the backend, this page can show:
                per-question averages, distribution charts, and employee-level drill-downs.
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="card">
          <div className="muted">No cycles or assignments found yet.</div>
        </div>
      )}
    </div>
  )
}

