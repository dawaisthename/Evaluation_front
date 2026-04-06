import { useMemo, useState } from 'react'
import { api } from '../../api/client.js'
import { PageHeader } from '../../components/PageHeader.jsx'
import { useAsync } from '../../hooks/useAsync.js'

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

export function HierarchyPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const { status, data, error } = useAsync(() => api.listEmployees(), [refreshKey])

  const employees = status === 'success' ? data : []
  const byId = useMemo(() => new Map(employees.map((e) => [e.id, e])), [employees])

  const managerOptions = useMemo(() => {
    return employees.map((e) => ({ value: e.id, label: `${e.name} (${e.role}) — ${e.department}` }))
  }, [employees])

  async function setManager(employeeId, managerId) {
    await api.setManager(employeeId, managerId)
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="page">
      <PageHeader
        title="Hierarchy"
        subtitle="Set who reports to whom. This powers automatic upward/downward assignment."
      />

      {status === 'loading' || status === 'idle' ? (
        <div className="card skeleton" style={{ minHeight: 260 }} />
      ) : status === 'error' ? (
        <div className="card">
          <div className="muted">{String(error)}</div>
        </div>
      ) : (
        <div className="card">
          <div className="table">
            <div className="tr th" style={{ gridTemplateColumns: '1fr 160px 160px 1fr' }}>
              <div>Employee</div>
              <div>Role</div>
              <div>Department</div>
              <div>Manager</div>
            </div>

            {employees.map((e) => (
              <div key={e.id} className="tr" style={{ gridTemplateColumns: '1fr 160px 160px 1fr' }}>
                <div>
                  {e.name} <span className="muted">({e.email})</span>
                </div>
                <div>{e.role}</div>
                <div>{e.department}</div>
                <div>
                  <Select
                    value={e.managerId}
                    onChange={(managerId) => setManager(e.id, managerId)}
                    options={managerOptions.filter((m) => m.value !== e.id)}
                    placeholder="No manager (top-level)"
                  />
                  <div className="muted" style={{ marginTop: 6 }}>
                    Current: {e.managerId ? byId.get(e.managerId)?.name ?? e.managerId : '—'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

