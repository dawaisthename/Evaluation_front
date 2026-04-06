import { api } from "../../api/client.js";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader.jsx";
import { useAsync } from "../../hooks/useAsync.js";

export function QuestionBankPage() {
  const { status, data, error } = useAsync(() => api.listQuestions(), []);

  return (
    <div className="page">
      <PageHeader
        title="Question bank"
        subtitle="Create questions and target them to roles (e.g. Manager-only leadership questions)."
        actions={
          <>
            <Link className="btn btnGhost" to="/admin/templates">
              Configure role templates
            </Link>
            <button className="btn btnPrimary">New question (soon)</button>
          </>
        }
      />

      {status === "loading" || status === "idle" ? (
        <div className="card skeleton" style={{ minHeight: 200 }} />
      ) : status === "error" ? (
        <div className="card">
          <div className="muted">{String(error)}</div>
        </div>
      ) : (
        <div className="card">
          <div className="table">
            <div className="tr th" style={{ gridTemplateColumns: "1fr 1fr" }}>
              {/* <div>Category</div> */}
              <div>Question</div>
              <div>Type</div>
              {/* <div>Roles</div> */}
            </div>
            {data.map((q) => (
              <div
                key={q.id}
                className="tr"
                style={{ gridTemplateColumns: "1fr  1fr" }}
              >
                {/* <div>{q.category}</div> */}
                <div>{q.text}</div>
                <div className="muted">
                  {q.question_type === "text" ? "Text" : "Rating"}
                </div>
                {/* <div className="muted">{q.roles.join(', ')}</div> */}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
