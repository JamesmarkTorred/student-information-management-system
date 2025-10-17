const API_BASE_URL = '/api';

class StudentManager {
    constructor() {
        this.students = [];
        this.filteredStudents = [];
        this.currentFilters = {
            search: '',
            program: 'all',
            gender: 'all',
            yearLevel: 'all',
            university: 'all'
        };
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadStudents();
        this.updateStats();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('student-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Search and filter events
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.currentFilters.search = e.target.value;
            this.applyFilters();
        });

        document.getElementById('search-btn').addEventListener('click', () => {
            this.applyFilters();
        });

        document.getElementById('program-filter').addEventListener('change', (e) => {
            this.currentFilters.program = e.target.value;
            this.applyFilters();
        });

        document.getElementById('gender-filter').addEventListener('change', (e) => {
            this.currentFilters.gender = e.target.value;
            this.applyFilters();
        });

        document.getElementById('year-level-filter').addEventListener('change', (e) => {
            this.currentFilters.yearLevel = e.target.value;
            this.applyFilters();
        });

        document.getElementById('university-filter').addEventListener('change', (e) => {
            this.currentFilters.university = e.target.value;
            this.applyFilters();
        });

        document.getElementById('clear-filters').addEventListener('click', () => {
            this.clearFilters();
        });

        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.refreshData();
        });
    }

    async loadStudents() {
        try {
            const response = await fetch(`${API_BASE_URL}/students`);
            if (!response.ok) throw new Error('Failed to fetch students');
            
            this.students = await response.json();
            this.applyFilters();
        } catch (error) {
            this.showAlert('Error loading students: ' + error.message, 'error');
        }
    }

    async refreshData() {
        const refreshBtn = document.getElementById('refresh-btn');
        const originalHtml = refreshBtn.innerHTML;
        
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Refreshing';
        refreshBtn.disabled = true;

        await this.loadStudents();
        this.updateStats();

        refreshBtn.innerHTML = originalHtml;
        refreshBtn.disabled = false;
        
        this.showAlert('Data refreshed successfully', 'success');
    }

    applyFilters() {
        this.filteredStudents = this.students.filter(student => {
            const matchesSearch = !this.currentFilters.search || 
                Object.values(student).some(value => 
                    value.toString().toLowerCase().includes(this.currentFilters.search.toLowerCase())
                );
            
            const matchesProgram = this.currentFilters.program === 'all' || 
                student.program === this.currentFilters.program;
            
            const matchesGender = this.currentFilters.gender === 'all' || 
                student.gender === this.currentFilters.gender;
            
            const matchesYearLevel = this.currentFilters.yearLevel === 'all' || 
                student.yearLevel === this.currentFilters.yearLevel;
            
            const matchesUniversity = this.currentFilters.university === 'all' || 
                student.university === this.currentFilters.university;

            return matchesSearch && matchesProgram && matchesGender && matchesYearLevel && matchesUniversity;
        });

        this.renderStudentsTable();
        this.updateTableInfo();
    }

    clearFilters() {
        document.getElementById('search-input').value = '';
        document.getElementById('program-filter').value = 'all';
        document.getElementById('gender-filter').value = 'all';
        document.getElementById('year-level-filter').value = 'all';
        document.getElementById('university-filter').value = 'all';

        this.currentFilters = {
            search: '',
            program: 'all',
            gender: 'all',
            yearLevel: 'all',
            university: 'all'
        };

        this.applyFilters();
        this.showAlert('Filters cleared', 'success');
    }

    renderStudentsTable() {
        const tbody = document.getElementById('students-table-body');
        
        if (this.filteredStudents.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-4 text-muted">
                        <i class="fas fa-users fa-2x mb-2"></i><br>
                        No students found matching your criteria
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.filteredStudents.map(student => `
            <tr>
                <td><strong>${student.id}</strong></td>
                <td>${student.fullName}</td>
                <td>
                    <span class="badge ${student.gender === 'Male' ? 'bg-primary' : 'bg-danger'}">
                        <i class="fas ${student.gender === 'Male' ? 'fa-mars' : 'fa-venus'} me-1"></i>
                        ${student.gender}
                    </span>
                </td>
                <td>${student.email}</td>
                <td>${student.program}</td>
                <td>${student.yearLevel}</td>
                <td>${student.university}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="studentManager.deleteStudent('${student.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    updateTableInfo() {
        const displayCount = document.getElementById('display-count');
        const totalCount = document.getElementById('total-count');
        const tableInfo = document.getElementById('table-info');

        displayCount.textContent = this.filteredStudents.length;
        totalCount.textContent = this.students.length;

        if (this.filteredStudents.length < this.students.length) {
            tableInfo.textContent = `(Filtered: ${this.filteredStudents.length} of ${this.students.length})`;
        } else {
            tableInfo.textContent = '';
        }
    }

    async updateStats() {
        try {
            const response = await fetch(`${API_BASE_URL}/students/stats/summary`);
            if (!response.ok) throw new Error('Failed to fetch stats');
            
            const stats = await response.json();
            
            document.getElementById('total-students').textContent = stats.total;
            document.getElementById('male-students').textContent = stats.male;
            document.getElementById('female-students').textContent = stats.female;
            document.getElementById('programs-count').textContent = stats.programs;
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async handleFormSubmit() {
        const form = document.getElementById('student-form');
        
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        const studentData = {
            id: document.getElementById('student-id').value,
            fullName: document.getElementById('full-name').value,
            gender: document.querySelector('input[name="gender"]:checked').value,
            email: document.getElementById('email').value,
            program: document.getElementById('program').value,
            yearLevel: document.getElementById('year-level').value,
            university: document.getElementById('university').value
        };

        try {
            const response = await fetch(`${API_BASE_URL}/students`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(studentData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add student');
            }

            const newStudent = await response.json();
            this.students.push(newStudent);
            this.applyFilters();
            this.updateStats();
            this.resetForm();
            
            this.showAlert('Student added successfully!', 'success');
        } catch (error) {
            this.showAlert('Error adding student: ' + error.message, 'error');
        }
    }

    async deleteStudent(studentId) {
        if (!confirm('Are you sure you want to delete this student?')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete student');
            }

            this.students = this.students.filter(s => s.id !== studentId);
            this.applyFilters();
            this.updateStats();
            
            this.showAlert('Student deleted successfully!', 'success');
        } catch (error) {
            this.showAlert('Error deleting student: ' + error.message, 'error');
        }
    }

    resetForm() {
        const form = document.getElementById('student-form');
        form.reset();
        form.classList.remove('was-validated');
    }

    showAlert(message, type) {
        const alertId = type === 'success' ? 'success-alert' : 'error-alert';
        const messageId = type === 'success' ? 'success-message' : 'error-message';
        
        const alertElement = document.getElementById(alertId);
        const messageElement = document.getElementById(messageId);
        
        messageElement.textContent = message;
        alertElement.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            alertElement.style.display = 'none';
        }, 5000);
    }
}

// Initialize the application
const studentManager = new StudentManager();