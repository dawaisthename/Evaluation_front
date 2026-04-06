import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client.js'
import { PageHeader } from '../components/PageHeader.jsx'
import { useAsync } from '../hooks/useAsync.js'

const RATING_OPTIONS = [1, 2, 3, 4, 5]

export function EvaluationFormPage() {
  const { assignmentId } = useParams()
  const navigate = useNavigate()

  const {
    status,
    data: assignment,
    error,
  } = useAsync(
    async () => {
      if (!assignmentId) return null
      const a = await api.getAssignment(assignmentId)
      const questions = await api.listQuestions()
      const byId = new Map(questions.map((q) => [q.id, q]))
      const qList = (a.questionIds || []).map((id) => byId.get(id)).filter(Boolean)
      return { assignment: a, questions: qList }
    },
    [assignmentId],
  )

  const [answers, setAnswers] = useState({})
  const [overallComment, setOverallComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  if (!assignmentId) {
    return (
      <div className="page">
        <PageHeader title="Evaluation" subtitle="No assignment id provided." />
      </div>
    )
  }

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="page">
        <PageHeader title="Evaluation" subtitle="Loading assignment…" />
        <div className="card skeleton" style={{ minHeight: 260 }} />
      </div>
    )
  }

  if (status === 'error' || !assignment) {
    return (
      <div className="page">
        <PageHeader title="Evaluation" subtitle="Could not load this evaluation." />
        <div className="card">
          <div className="muted">{String(error ?? 'Unknown error')}</div>
        </div>
      </div>
    )
  }

  const a = assignment.assignment
  const qs = assignment.questions

  async function onSubmit() {
    if (saving) return
    setSaving(true)
    try {
      await api.saveEvaluation(a.id, answers, overallComment)
      setSaved(true)
      navigate('/my-evaluations')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <PageHeader
        title={`Evaluate ${a.subjectName}`}
        subtitle={`${
          a.type === 'upward' ? 'Upward' : a.type === 'downward' ? 'Downward' : a.type === 'sideway' ? 'Peer (sideway)' : a.type
        } review • ${a.cycleName}`}
        actions={
          <button className="btn btnGhost" onClick={() => navigate('/my-evaluations')}>
            Back to list
          </button>
        }
      />

      <div className="card">
        <div className="cardTitle">Questions</div>
        <div className="checkList">
          {qs.map((q) => (
            <div key={q.id} className="checkRow">
              <div className="checkText">
                <div>{q.text}</div>
                <div className="muted" style={{ fontSize: 12 }}>
                  Type: {q.question_type === 'text' ? 'Text' : 'Rating'}
                </div>
                {q.question_type === 'rating' && (
                  <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span className="muted" style={{ fontSize: 12 }}>
                      Rating:
                    </span>
                    {RATING_OPTIONS.map((n) => (
                      <button
                        key={n}
                        type="button"
                        className="btn btnGhost"
                        style={{
                          padding: '4px 10px',
                          borderRadius: 999,
                          borderColor: (answers[q.id]?.rating ?? null) === n ? 'rgba(110,168,254,0.70)' : undefined,
                          background:
                            (answers[q.id]?.rating ?? null) === n ? 'rgba(110,168,254,0.20)' : 'rgba(255,255,255,0.04)',
                        }}
                        onClick={() =>
                          setAnswers((prev) => ({
                            ...prev,
                            [q.id]: { ...(prev[q.id] || {}), rating: n },
                          }))
                        }
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                )}
                <div style={{ marginTop: 8 }}>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="Optional comment for this question"
                    value={answers[q.id]?.comment ?? ''}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        [q.id]: { ...(prev[q.id] || {}), comment: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 14 }} />

      <div className="card">
        <div className="cardTitle">Overall feedback</div>
        <textarea
          className="input"
          rows={4}
          placeholder="Summarize strengths, areas to improve, and any recommendations."
          value={overallComment}
          onChange={(e) => setOverallComment(e.target.value)}
        />
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="muted" style={{ fontSize: 12 }}>
            Your answers are stored only in this browser for now. Backend persistence comes later.
          </div>
          <button className="btn btnPrimary" type="button" onClick={onSubmit} disabled={saving}>
            {saving ? 'Submitting…' : saved ? 'Submitted' : 'Submit evaluation'}
          </button>
        </div>
      </div>
    </div>
  )
}

