import axios from 'axios';

const API_BASE = '/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('sifra_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  signup: async (data: { name: string; email: string; password: string; role: string; site_id?: string }) => {
    const res = await api.post('/auth/signup', data);
    return res.data;
  },
  me: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export const reportsApi = {
  create: async (data: { worker_id?: string; incident_text?: string; establishment_info?: any; site_id?: string; has_files?: boolean }) => {
    const res = await api.post('/reports', data);
    return res.data;
  },
  createBatch: async (entries: Array<{ worker_id: string; site_id?: string; incident_text?: string }>) => {
    const res = await api.post('/reports/batch', { entries });
    return res.data;
  },
  uploadAttachments: async (reportId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    const token = typeof window !== 'undefined' ? localStorage.getItem('sifra_token') : '';
    const res = await axios.post(`${API_BASE}/reports/${reportId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },
  getAttachments: async (reportId: string) => {
    const res = await api.get(`/reports/${reportId}/attachments`);
    return res.data;
  },
  list: async () => {
    const res = await api.get('/reports');
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/reports/${id}`);
    return res.data;
  },
  updateStatus: async (id: string, status: string) => {
    const res = await api.patch(`/reports/${id}/status`, { status });
    return res.data;
  },
  downloadPdf: async (id: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('sifra_token') : '';
    const res = await axios.get(`${API_BASE}/reports/${id}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Trust_Report_${id.slice(0, 8)}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};

export const quizApi = {
  generate: async (reportId: string) => {
    const res = await api.post(`/quiz/generate/${reportId}`);
    return res.data;
  },
  submit: async (reportId: string, quizTitle: string, score: number, totalQuestions: number) => {
    const res = await api.post('/quiz/submit', {
      report_id: reportId,
      quiz_title: quizTitle,
      score,
      total_questions: totalQuestions,
    });
    return res.data;
  },
  history: async () => {
    const res = await api.get('/quiz/history');
    return res.data;
  },
};

export const adminApi = {
  getStats: async () => {
    const res = await api.get('/admin/dashboard-stats');
    return res.data;
  },
  getWorkers: async () => {
    const res = await api.get('/admin/workers');
    return res.data;
  },
  getWorkerDetail: async (workerId: string) => {
    const res = await api.get(`/admin/workers/${workerId}`);
    return res.data;
  },
  getAlerts: async (channel = 'all', status = 'all') => {
    const res = await api.get(`/admin/alerts?channel=${channel}&status=${status}`);
    return res.data;
  },
  sendWarning: async (workerId: string, message: string, smsDispatch = true, emailDispatch = true) => {
    const res = await api.post('/admin/warnings/send', {
      worker_id: workerId,
      message,
      sms_dispatch: smsDispatch,
      email_dispatch: emailDispatch,
    });
    return res.data;
  },
  assignTraining: async (workerId: string, quizTitle: string, category = 'IOGP Life Saving Rules') => {
    const res = await api.post('/admin/training/assign', {
      worker_id: workerId,
      quiz_title: quizTitle,
      category,
    });
    return res.data;
  },
  assignTask: async (workerId: string, title: string, description: string, dueDate = '2026-09-20') => {
    const res = await api.post('/admin/tasks/assign', {
      worker_id: workerId,
      title,
      description,
      due_date: dueDate,
    });
    return res.data;
  },
  getHeatmapLocations: async () => {
    const res = await api.get('/admin/heatmap-data');
    return res.data;
  },
};

export const workerApi = {
  getWarnings: async () => {
    const res = await api.get('/worker/warnings');
    return res.data;
  },
  acknowledgeWarning: async (warningId: string) => {
    const res = await api.post(`/worker/warnings/${warningId}/acknowledge`);
    return res.data;
  },
  getTasks: async () => {
    const res = await api.get('/worker/tasks');
    return res.data;
  },
  updateTaskStatus: async (taskId: string, status: string) => {
    const res = await api.patch(`/worker/tasks/${taskId}/status`, { status });
    return res.data;
  },
  getAssignedTraining: async () => {
    const res = await api.get('/worker/training');
    return res.data;
  },
};
