/**
 * Modular API Client for SIA-SA FST
 * Connects frontend client to Express REST API
 */
const ApiClient = {
  baseUrl: '/api',

  async request(endpoint, options = {}) {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {})
      }
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      const data = await response.json();
      return {
        ok: response.ok,
        status: response.status,
        data
      };
    } catch (err) {
      console.warn('Network or API Error, using fallback mode:', err);
      return {
        ok: false,
        status: 500,
        error: err.message
      };
    }
  },

  // Course Catalog
  async getCourses(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/courses${query ? '?' + query : ''}`);
  },

  async getRecommendations(nim = '1251420128') {
    return this.request(`/courses/recommendations/${nim}`);
  },

  // KRS Submission & Validation
  async validateKrs(nim, courseCodes) {
    return this.request('/krs/validate', {
      method: 'POST',
      body: JSON.stringify({ nim, courseCodes })
    });
  },

  async submitKrs(nim, courseCodes, agreementChecked = true) {
    return this.request('/krs/submit', {
      method: 'POST',
      body: JSON.stringify({ nim, courseCodes, agreementChecked })
    });
  },

  async getKrsStatus(nim = '1251420128') {
    return this.request(`/krs/status/${nim}`);
  },

  // DPA Review
  async getAdvisees() {
    return this.request('/dpa/advisees');
  },

  async approveDpa(requestId, notes) {
    return this.request('/dpa/approve', {
      method: 'POST',
      body: JSON.stringify({ requestId, notes })
    });
  },

  async rejectDpa(requestId, notes) {
    return this.request('/dpa/reject', {
      method: 'POST',
      body: JSON.stringify({ requestId, notes })
    });
  },

  // Prodi Quota & Class Management
  async getQuotaSummary() {
    return this.request('/prodi/quota-summary');
  },

  async confirmClasses() {
    return this.request('/prodi/confirm-classes', {
      method: 'POST'
    });
  },

  async openClass(courseCode) {
    return this.request(`/prodi/courses/${courseCode}/open`, {
      method: 'POST'
    });
  },

  async closeClass(courseCode, reason = '') {
    return this.request(`/prodi/courses/${courseCode}/close`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  },

  async updateCourse(courseCode, updates = {}) {
    return this.request(`/prodi/courses/${courseCode}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  // Payment & VA
  async getInvoice(nim = '1251420128') {
    return this.request(`/payments/invoice/${nim}`);
  },

  async selectBank(nim, bank) {
    return this.request('/payments/select-bank', {
      method: 'POST',
      body: JSON.stringify({ nim, bank })
    });
  },

  async simulatePayment(nim = '1251420128') {
    return this.request('/payments/simulate-pay', {
      method: 'POST',
      body: JSON.stringify({ nim })
    });
  },

  async checkMutation(nim = '1251420128') {
    return this.request(`/payments/check-mutation/${nim}`);
  },

  // System
  async resetSystem() {
    return this.request('/system/reset', { method: 'POST' });
  }
};

window.ApiClient = ApiClient;
