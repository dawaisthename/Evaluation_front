import { useMemo, useState } from 'react'
import { api } from '../api/client.js'
import { PageHeader } from '../components/PageHeader.jsx'
import { StatCard } from '../components/StatCard.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
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

export function MyTeamPage() {
  const { user } = useAuth()
  const email = user?.email ?? ''

  const { status: cycleStatus, data: cycles, error: cycleError } = useAsync(() => api.listCycles(), [])
  const [selectedCycleId, setSelectedCycleId] = useState(null)

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
    () => (email && effectiveCycleId ? api.getManagerOverview(email, effectiveCycleId) : Promise.resolve(null)),
    [email, effectiveCycleId],
  )

  const loading = status === 'loading' || status === 'idle' || cycleStatus === 'loading'
  const anyError = status === 'error' || cycleStatus === 'error'

  const teamRows = overview?.team ?? []
  const teamSize = teamRows.length
  const completionPct =
    overview && overview.totals.assignments
      ? Math.round((overview.totals.completed / overview.totals.assignments) * 100)
      : 0

  return (
    <div className="page">
      <PageHeader
        title="My team"
        subtitle="Track evaluation progress for your direct reports in the selected cycle."
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
            This view is based on direct reports only (people who list you as their manager in the org structure).
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
      ) : !overview || !teamSize ? (
        <div className="card">
          <div className="muted">No direct reports or no assignments for your team in this cycle yet.</div>
        </div>
      ) : (
        <>
          <div className="grid grid3">
            <StatCard label="Direct reports" value={teamSize} />
            <StatCard
              label="Team assignments"
              value={overview.totals.assignments}
              hint={`Cycle: ${overview.cycleName}`}
            />
            <StatCard label="Completed" value={`${overview.totals.completed} (${completionPct}%)`} />
          </div>

          <div style={{ height: 14 }} />

          <div className="card">
            <div className="cardTitle">Per person</div>
            <div className="table">
              <div className="tr th" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
                <div>Employee</div>
                <div>Role</div>
                <div>Assignments</div>
                <div>Completed</div>
              </div>
              {teamRows.map((m) => {
                const pct = m.assignments ? Math.round((m.completed / m.assignments) * 100) : 0
                return (
                  <div key={m.employeeId} className="tr" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
                    <div>
                      {m.name}
                      <span className="muted" style={{ marginLeft: 6 }}>
                        ({m.department})
                      </span>
                    </div>
                    <div>{m.role}</div>
                    <div>{m.assignments}</div>
                    <div>
                      {m.completed}{' '}
                      <span className="muted" style={{ fontSize: 12 }}>
                        ({pct}%)
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

