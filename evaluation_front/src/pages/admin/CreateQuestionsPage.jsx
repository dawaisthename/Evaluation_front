import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api/client.js";
import { PageHeader } from "../../components/PageHeader.jsx";

export function CreateQuestionPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    text: "",
    question_type: "rating",
    category: "General",
    is_active: true,
  });

  const [loading, setLoading] = useState(isEdit); // Start loading if editing
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch Question Data if isEdit
  useEffect(() => {
    if (isEdit) {
      async function fetchQuestion() {
        try {
          // It's better to have a specific getQuestion(id) call
          // but if you only have listQuestions, we filter it:
          const questions = await api.listQuestions();
          const q =
            questions.results?.find((item) => item.id === parseInt(id)) ||
            questions.find((item) => item.id === parseInt(id));

          if (q) {
            setFormData({
              text: q.text,
              question_type: q.question_type,
              category: q.category || "General",
              is_active: q.is_active,
            });
          } else {
            setError("Question not found.");
          }
        } catch (err) {
          setError("Failed to load question details.");
        } finally {
          setLoading(false);
        }
      }
      fetchQuestion();
    }
  }, [id, isEdit]);

  // 2. Handle Input Changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 3. Submit Handler
  async function onSubmit(e) {
    e.preventDefault();
    if (!formData.text.trim()) return setError("Question text is required");

    try {
      setSaving(true);
      setError(null);

      if (isEdit) {
        await api.updateQuestion(id, formData);
      } else {
        await api.createQuestion(formData);
      }
      navigate("/admin/questions");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to save question. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className="page textCenter muted">Loading question details...</div>
    );

  return (
    <div className="page">
      <PageHeader
        title={isEdit ? "Edit Question" : "Create New Question"}
        subtitle="This question will be available to add to evaluation templates."
      />

      <div className="card shadow-sm">
        <form className="formGrid" onSubmit={onSubmit}>
          {/* Question Text */}
          <label className="field">
            <div className="fieldLabel">Question Text</div>
            <textarea
              name="text"
              className="input"
              value={formData.text}
              onChange={handleChange}
              placeholder="e.g. Rate the employee's technical proficiency in React."
              rows={4}
              required
            />
          </label>

          <div className="grid grid2" style={{ gap: "20px" }}>
            {/* Category */}
            <label className="field">
              <div className="fieldLabel">Category</div>
              <input
                name="category"
                className="input"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g. Technical, Soft Skills"
              />
            </label>

            {/* Type Selection */}
            <label className="field">
              <div className="fieldLabel">Response Type</div>
              <select
                name="question_type"
                className="select"
                value={formData.question_type}
                onChange={handleChange}
              >
                <option value="rating">Rating (1–5 Stars)</option>
                <option value="text">Open Text Response</option>
              </select>
            </label>
          </div>

          {/* Active Status */}
          <label className="field checkboxRow" style={{ cursor: "pointer" }}>
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
            />
            <span>Active (Visible in template builder)</span>
          </label>

          {/* Error Message */}
          {error && (
            <div
              className="alert alert-danger"
              style={{ color: "red", fontSize: "0.9em" }}
            >
              {error}
            </div>
          )}

          <hr className="divider" />

          {/* Actions */}
          <div className="footerActions">
            <button className="btn btnPrimary" type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : isEdit
                  ? "Update Question"
                  : "Create Question"}
            </button>
            <button
              type="button"
              className="btn btnGhost"
              onClick={() => navigate("/admin/questions")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
