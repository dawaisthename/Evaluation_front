import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { useAsync } from "../hooks/useAsync.js";

export function EvaluationQuestionsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { status, data, error } = useAsync(
    () => api.getEvaluationQuestions(id),
    [id],
  );
  const [responses, setResponses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track hover state per question ID
  const [hoveredScores, setHoveredScores] = useState({});

  useEffect(() => {
    if (data?.questions) {
      setResponses(
        data.questions.map((q) => ({
          question: q.id,
          question_type: q.question_type,
          score: q.question_type === "rating" ? 0 : null,
          comment: "",
        })),
      );
    }
  }, [data]);

  const updateResponse = (questionId, field, value) => {
    setResponses((prev) =>
      prev.map((r) =>
        r.question === questionId ? { ...r, [field]: value } : r,
      ),
    );
  };

  const handleHover = (qId, score) => {
    setHoveredScores((prev) => ({ ...prev, [qId]: score }));
  };

  const handleSubmit = async () => {
    if (responses.some((r) => r.question_type === "rating" && r.score === 0)) {
      alert("Please select a rating for all questions.");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.submitEvaluation(id, { responses });
      navigate("/my-evaluations");
    } catch (err) {
      alert("Error: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading" || status === "idle")
    return (
      <div className="page">
        <div className="card skeleton" style={{ height: 300 }} />
      </div>
    );

  return (
    <div className="page">
      <PageHeader
        title="Performance Review"
        subtitle={`Evaluation for ${data.reviewee}`}
        actions={
          <button
            className="btn btnPrimary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        }
      />

      <div className="pageContent mt-lg">
        <div
          className="questionStack"
          style={{ maxWidth: "700px", margin: "0 auto" }}
        >
          {data.questions.map((q) => {
            const currentResponse = responses.find((r) => r.question === q.id);
            const isRating = q.question_type === "rating";
            const currentScore = currentResponse?.score || 0;
            const hoverScore = hoveredScores[q.id] || 0;

            return (
              <div key={q.id} className="card evaluationCard mb-lg">
                <div className="mb-md">
                  <h3 className="displayQuestionText">{q.text}</h3>
                </div>

                {isRating && (
                  <div className="ratingWrapper">
                    <div className="ratingScale">
                      {[1, 2, 3, 4, 5].map((num) => {
                        // Logic: Is this button part of the "filled" selection or hover?
                        const isSelected = num <= currentScore;
                        const isHovered = num <= hoverScore;

                        return (
                          <button
                            key={num}
                            type="button"
                            onMouseEnter={() => handleHover(q.id, num)}
                            onMouseLeave={() => handleHover(q.id, 0)}
                            onClick={() => updateResponse(q.id, "score", num)}
                            className={`ratingBtn ${isSelected ? "active" : ""} ${isHovered ? "hover-fill" : ""}`}
                          >
                            {num}
                          </button>
                        );
                      })}
                    </div>
                    <div className="scoreIndicator">
                      {currentScore > 0
                        ? `Selected: ${currentScore}/5`
                        : "Select a score"}
                    </div>
                  </div>
                )}

                <div className="mt-md">
                  <textarea
                    placeholder="Provide additional details..."
                    className="modernCommentInput"
                    value={currentResponse?.comment || ""}
                    onChange={(e) =>
                      updateResponse(q.id, "comment", e.target.value)
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
