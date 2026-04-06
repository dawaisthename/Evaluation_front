import { PageHeader } from "../components/PageHeader.jsx";
export function DashboardSkeleton() {
  return (
    <div className="page">
      <PageHeader title="Dashboard" subtitle="Loading..." />
      <div className="pageContent">
        <section className="dashboardSection">
          <div className="grid grid-highlight">
            <div className="card skeleton" style={{ height: "180px" }} />
            <div className="card skeleton" style={{ height: "180px" }} />
          </div>
        </section>

        <section className="dashboardSection">
          <div className="grid grid3">
            <div className="card skeleton" style={{ height: "120px" }} />
            <div className="card skeleton" style={{ height: "120px" }} />
            <div className="card skeleton" style={{ height: "120px" }} />
          </div>
        </section>
      </div>

      <div className="pageContent">
        <section className="dashboardSection">
          <div className="grid grid-highlight">
            <div className="card skeleton" style={{ height: "180px" }} />
            <div className="card skeleton" style={{ height: "180px" }} />
          </div>
        </section>

        <section className="dashboardSection">
          <div className="grid grid3">
            <div className="card skeleton" style={{ height: "120px" }} />
            <div className="card skeleton" style={{ height: "120px" }} />
            <div className="card skeleton" style={{ height: "120px" }} />
          </div>
        </section>
      </div>
    </div>
  );
}

export function DashboardError({ error }) {
  return (
    <div className="page">
      <PageHeader title="Error" subtitle="We couldn't load your dashboard." />
      <div className="card" style={{ border: "1px solid #f87171" }}>
        <div className="muted">{String(error)}</div>
        <button
          className="btn btnPrimary"
          style={{ marginTop: "16px" }}
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
