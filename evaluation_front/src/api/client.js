import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/",
  headers: { "Content-Type": "application/json" },
});

// Attach auth token automatically
client.interceptors.request.use((config) => {
  const session = JSON.parse(localStorage.getItem("eval.auth.session.v1"));
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

export const api = {
  // -------------------------
  // DASHBOARD
  // -------------------------

  async getDashboard() {
    const { data } = await client.get("organization/dashboard/");
    return data;
  },

  async getReportingOverview(cycleId) {
    const { data } = await client.get("reports/overview/", {
      params: { cycle_id: cycleId },
    });
    return data;
  },

  // -------------------------
  // EMPLOYEES
  // -------------------------

  async listEmployees() {
    const { data } = await client.get("organization/employees/");
    return data;
  },

  async createEmployee(payload) {
    const { data } = await client.post("organization/employees/", payload);
    return data;
  },

  async updateEmployee(id, patch) {
    const { data } = await client.patch(`organization/employees/${id}/`, patch);
    return data;
  },

  // -------------------------
  // CYCLES
  // -------------------------

  async listCycles() {
    const { data } = await client.get("organization/cycles/");
    return data;
  },

  async createCycle(payload) {
    const { data } = await client.post("organization/cycles/", {
      name: payload.name,
      start_date: payload.startDate,
      end_date: payload.endDate,
      status: payload.status,
    });
    return data;
  },

  async activateCycle(cycleId) {
    const { data } = await client.post(
      `organization/cycles/${cycleId}/activate_cycle/`,
    );
    return data;
  },

  async closeCycle(cycleId) {
    const { data } = await client.post(
      `organization/cycles/${cycleId}/close_cycle/`,
    );
    return data;
  },

  async generateAssignments(cycleId) {
    const { data } = await client.post(
      `organization/cycles/${cycleId}/generate_assignment/`,
    );
    return data;
  },

  // -------------------------
  // ASSIGNMENTS
  // -------------------------

  async listAssignments(cycleId) {
    const { data } = await client.get("organization/assignments/", {
      params: { cycle_id: cycleId },
    });
    return data;
  },

  async myAssignments(id) {
    const { data } = await client.get(`organization/assignments/`);
    return data;
  },
  async getAssignment(id) {
    const { data } = await client.get(`organization/assignments/${id}/`);
    return data;
  },

  async saveEvaluation(assignmentId, responses) {
    const { data } = await client.post(
      `organization/assignments/${assignmentId}/submit/`,
      { responses },
    );
    return data;
  },

  // -------------------------
  // TEMPLATES
  // -------------------------

  async listTemplates() {
    const { data } = await client.get("organization/templates/");
    return data;
  },

  async updateTemplate(templateId, payload) {
    const { data } = await client.patch(
      `organization/templates/${templateId}/`,
      payload,
    );
    return data;
  },

  // -------------------------
  // QUESTIONS
  // -------------------------

  async listQuestions() {
    const { data } = await client.get("organization/questions/");
    return data.results ?? [];
  },

  // -------------------------
  // DEPARTMENTS
  // -------------------------

  async getDepartments() {
    const { data } = await client.get("organization/departments/");
    return (
      data.results?.map((d) => ({
        id: d.id,
        name: d.name,
        description: d.description,
        leader: d.leader_name || null,
        createdAt: d.created_at,
      })) || []
    );
  },

  async addDepartment(name, description) {
    const { data } = await client.post("organization/departments/", {
      name,
      description,
    });
    return data;
  },

  async removeDepartment(name) {
    const { data } = await client.delete("organization/departments/", {
      data: { name },
    });
    return data;
  },

  // -------------------------
  // ROLES
  // -------------------------

  async getRoles() {
    const { data } = await client.get("organization/roles/");
    return data;
  },

  async addRole(name) {
    const { data } = await client.post("organization/roles/", { name });
    return data;
  },

  async removeRole(name) {
    const { data } = await client.delete("organization/roles/", {
      data: { name },
    });
    return data;
  },
};
