import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./auth/AuthContext.jsx";
import { ProtectedRoute } from "./auth/ProtectedRoute.jsx";

import { AppLayout } from "./layouts/AppLayout.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";

import { OrganizationPage } from "./pages/admin/OrganizationPage.jsx";
import { EmployeesPage } from "./pages/admin/EmployeesPage.jsx";
import { HierarchyPage } from "./pages/admin/HierarchyPage.jsx";
import { QuestionBankPage } from "./pages/admin/QuestionBankPage.jsx";
import { TemplatesPage } from "./pages/admin/TemplatesPage.jsx";
import { EvaluationCyclesPage } from "./pages/admin/EvaluationCyclesPage.jsx";
import { AssignmentsPage } from "./pages/admin/AssignmentsPage.jsx";

import { MyEvaluationsPage } from "./pages/MyEvaluationsPage.jsx";
import { EvaluationFormPage } from "./pages/EvaluationFormPage.jsx";
import { MyResultsPage } from "./pages/MyResultsPage.jsx";
import { MyTeamPage } from "./pages/MyTeamPage.jsx";
import { ReportsPage } from "./pages/ReportsPage.jsx";

import { NotFoundPage } from "./pages/NotFoundPage.jsx";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* General user routes */}
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="my-evaluations" element={<MyEvaluationsPage />} />
          <Route
            path="my-evaluations/:assignmentId"
            element={<EvaluationFormPage />}
          />
          <Route path="my-results" element={<MyResultsPage />} />
          <Route path="my-team" element={<MyTeamPage />} />
          <Route path="reports" element={<ReportsPage />} />

          {/* ✅ Admin-only routes */}
          <Route
            path="admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="organization" element={<OrganizationPage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="hierarchy" element={<HierarchyPage />} />
            <Route path="question-bank" element={<QuestionBankPage />} />
            <Route path="templates" element={<TemplatesPage />} />
            <Route
              path="evaluation-cycles"
              element={<EvaluationCyclesPage />}
            />
            <Route path="assignments" element={<AssignmentsPage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
