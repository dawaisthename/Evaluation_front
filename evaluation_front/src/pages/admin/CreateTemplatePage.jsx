import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api/client.js";
import { PageHeader } from "../../components/PageHeader.jsx";
import { useAsync } from "../../hooks/useAsync.js";

export function CreateTemplatePage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: roles } = useAsync(() => api.getRoles(), []);
  const { data: departments } = useAsync(() => api.getDepartments(), []);
  const { data: questions } = useAsync(() => api.listQuestions(), []);

  const [form, setForm] = useState({
    name: "",
    review_type: "upward",
    role: "",
    department: "",
    questions: [],
  });

  useEffect(() => {
    if (isEdit) {
      api.listTemplates().then((res) => {
        const template = res.results?.find((t) => t.id === parseInt(id));
        if (template) {
          setForm({
            name: template.name,
            review_type: template.review_type,
            role: template.role || "",
            department: template.department || "",
            questions: template.questions || [],
          });
        }
      });
    }
  }, [id, isEdit]);

  // Filter questions based on search input
  const filteredQuestions = useMemo(() => {
    const allQs = questions ?? [];
    if (!searchQuery) return allQs;
    return allQs.filter(
      (q) =>
        q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.category?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [questions, searchQuery]);

  const toggleQuestion = (questionId) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.includes(questionId)
        ? prev.questions.filter((qId) => qId !== questionId)
        : [...prev.questions, questionId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.questions.length === 0)
      return alert("Select at least one question.");

    setSaving(true);
    try {
      const payload = {
        ...form,
        role: form.role || null,
        department: form.department || null,
      };

      if (isEdit) {
        await api.updateTemplate(id, payload);
      } else {
        await api.createTemplate(payload);
      }
      navigate("/admin/templates");
    } catch (err) {
      alert("Save failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <PageHeader
        title={isEdit ? "Edit Template" : "New Template"}
        subtitle={
          isEdit
            ? `Modifying ${form.name}`
            : "Create a rule-set for evaluations."
        }
      />

      <form onSubmit={handleSubmit} className="card mt-lg">
        <div className="formGrid">
          <label className="field">
            <div className="fieldLabel">Template Name</div>
            <input
              className="formInput"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>

          <label className="field">
            <div className="fieldLabel">Review Type</div>
            <select
              className="formInput"
              value={form.review_type}
              onChange={(e) =>
                setForm({ ...form, review_type: e.target.value })
              }
            >
              <option value="upward">Upward</option>
              <option value="sideway">Sideway (Peer)</option>
              <option value="downward">Downward</option>
            </select>
          </label>

          <label className="field">
            <div className="fieldLabel">Target Role (Optional)</div>
            <select
              className="formInput"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="">All Roles</option>
              {roles?.results?.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <div className="fieldLabel">Target Department (Optional)</div>
            <select
              className="formInput"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            >
              <option value="">All Departments</option>
              {departments?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-xl">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "12px",
            }}
          >
            <div>
              <div className="fieldLabel">
                Questions ({form.questions.length} selected)
              </div>
            </div>
            <div style={{ width: "300px" }}>
              <input
                className="formInput"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div
            className="checkList card"
            style={{ maxHeight: "400px", overflowY: "auto", padding: "0" }}
          >
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((q) => {
                const isSelected = form.questions.includes(q.id);
                return (
                  <label
                    key={q.id}
                    className={`checkRow ${isSelected ? "checkRowOn" : ""}`}
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleQuestion(q.id)}
                    />
                    <div className="checkText">
                      {q.text}{" "}
                      <small className="muted">
                        ({q.category || "General"})
                      </small>
                    </div>
                  </label>
                );
              })
            ) : (
              <div className="textCenter muted" style={{ padding: "40px" }}>
                No questions match your search.
              </div>
            )}
          </div>
        </div>

        <div className="footerActions mt-lg">
          <button
            type="button"
            className="btn btnGhost"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button type="submit" className="btn btnPrimary" disabled={saving}>
            {saving
              ? "Saving..."
              : isEdit
                ? "Update Template"
                : "Create Template"}
          </button>
        </div>
      </form>
    </div>
  );
}
