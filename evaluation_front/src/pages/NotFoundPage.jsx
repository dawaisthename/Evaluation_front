import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader.jsx'

export function NotFoundPage() {
  return (
    <div className="page">
      <PageHeader title="Not found" subtitle="That page doesn’t exist." />
      <div className="card">
        <Link className="btn btnPrimary" to="/dashboard">
          Go to dashboard
        </Link>
      </div>
    </div>
  )
}

