import { useMemo, useState } from "react";
import { api } from "../../api/client.js";
import { PageHeader } from "../../components/PageHeader.jsx";
import { useAsync } from "../../hooks/useAsync.js";

function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      className="select"
      value={value ?? ""}
      onChange={(e) => onChange(Number(e.target.value) || null)}
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

export function TemplatesPage() {
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const { status: qStatus, data: questions } = useAsync(
    () => api.listQuestions(),
    [],
  );
  const { status: tStatus, data: templates } = useAsync(
    () => api.listTemplates(),
    [],
  );

  const templateList = tStatus === "success" ? (templates.results ?? []) : [];

  // Select first template automatically
  const selectedTemplate =
    templateList.find((t) => t.id === selectedTemplateId) || templateList[0];

  const selectedIds = useMemo(() => {
    return new Set(selectedTemplate?.questions ?? []);
  }, [selectedTemplate]);

  const groupedQuestions = useMemo(() => {
    const qs = qStatus === "success" ? questions : [];
    const groups = new Map();

    for (const q of qs) {
      const key = q.category ?? "General";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(q);
    }

    return Array.from(groups.entries());
  }, [qStatus, questions]);

  async function toggleQuestion(id) {
    if (!selectedTemplate) return;

    const current = new Set(selectedTemplate.questions ?? []);

    if (current.has(id)) current.delete(id);
    else current.add(id);

    try {
      setSaving(true);
      setSaveMsg("");

      await api.updateTemplate(selectedTemplate.id, {
        questions: Array.from(current),
      });

      setSaveMsg("Saved");
      setTimeout(() => setSaveMsg(""), 1200);
    } finally {
      setSaving(false);
    }
  }

  const templateOptions = templateList.map((t) => ({
    value: t.id,
    label: `${t.name} (${t.review_type})`,
  }));

  const isLoading = qStatus === "loading" || tStatus === "loading";

  return (
    <div className="page">
      <PageHeader
        title="Evaluation Templates"
        subtitle="Choose which questions belong to each evaluation template."
        actions={
          <div className="muted" style={{ alignSelf: "center" }}>
            {saving ? "Saving…" : saveMsg}
          </div>
        }
      />

      <div className="card">
        <div className="formGrid" style={{ alignItems: "end" }}>
          <label className="field">
            <div className="fieldLabel">Template</div>

            <Select
              value={selectedTemplate?.id}
              onChange={(v) => setSelectedTemplateId(v)}
              options={templateOptions}
              placeholder="Select template"
            />
          </label>

          <div className="muted">
            Review Type: <b>{selectedTemplate?.review_type}</b>
          </div>
        </div>
      </div>

      <div style={{ height: 14 }} />

      {isLoading ? (
        <div className="card skeleton" style={{ minHeight: 280 }} />
      ) : (
        <div className="grid">
          {groupedQuestions.map(([category, qs]) => (
            <div key={category} className="card">
              <div className="cardTitle">{category}</div>

              <div className="checkList">
                {qs.map((q) => {
                  const checked = selectedIds.has(q.id);

                  return (
                    <label
                      key={q.id}
                      className={`checkRow ${checked ? "checkRowOn" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleQuestion(q.id)}
                        disabled={saving}
                      />

                      <div className="checkText">
                        <div>{q.text}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
