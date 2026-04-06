import { api } from "../api/client.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

function Pill({ children, tone = "neutral" }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

function toneForStatus(status) {
  if (status === "COMPLETED") return "good";
  if (status === "PENDING") return "warn";
  return "neutral";
}

export function MyEvaluationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { status, data, error } = useAsync(() => api.listAssignments(), []);

  return (
    <div className="page">
      <PageHeader
        title="My Evaluations"
        subtitle="These are the reviews assigned to you (upward, downward, and peer)."
        actions={<button className="btn btnGhost">Export (soon)</button>}
      />

      {status === "loading" || status === "idle" ? (
        <div className="card skeleton" style={{ minHeight: 180 }} />
      ) : status === "error" ? (
        <div className="card">
          <div className="muted">{String(error)}</div>
        </div>
      ) : (
        <div className="card">
          <div className="table">
            <div
              className="tr th"
              style={{ gridTemplateColumns: "120px 1fr 1fr 120px 140px" }}
            >
              <div>Type</div>
              <div>Reviewee</div>
              <div>Cycle</div>
              <div>Status</div>
              <div />
            </div>

            {data.results?.map((e) => {
              const statusText = e.completed ? "COMPLETED" : "PENDING";

              return (
                <div
                  key={e.id}
                  className="tr"
                  style={{ gridTemplateColumns: "120px 1fr 1fr 120px 140px" }}
                >
                  <div>
                    {e.review_type === "upward"
                      ? "Upward"
                      : e.review_type === "downward"
                        ? "Downward"
                        : e.review_type === "sideway"
                          ? "Peer (sideway)"
                          : e.review_type}
                  </div>

                  <div>{e.reviewee_name}</div>

                  <div className="muted">{e.cycle_name}</div>

                  <div>
                    <Pill tone={toneForStatus(statusText)}>{statusText}</Pill>
                  </div>

                  <div className="trActions">
                    <button
                      className="btn btnPrimary"
                      disabled={e.completed}
                      onClick={() => navigate(`/my-evaluations/${e.id}`)}
                    >
                      {e.completed ? "Submitted" : "Continue"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
