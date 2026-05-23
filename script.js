/* ============================================
   TeraByte Computer Academy - Student Management
   ============================================ */

const form = document.getElementById("studentForm");
const tableBody = document.querySelector("#studentTable tbody");
const certTableBody = document.querySelector("#certificateTable tbody");
const feesTableBody = document.querySelector("#feesTable tbody");
const recentTableBody = document.getElementById("recentStudentsTable");

let students = JSON.parse(localStorage.getItem("students")) || [];

/* ============================================
   SIDEBAR NAVIGATION
   ============================================ */
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const navItems = document.querySelectorAll('.nav-item');
const pageTitle = document.getElementById('pageTitle');

sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
});

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.dataset.section;
        showSection(section);

        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');
    });
});

function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(sectionId);
    if (target) {
        target.classList.add('active');
    }

    const titles = {
        dashboard: 'Dashboard',
        admission: 'New Admission',
        students: 'All Students',
        certificates: 'Certificate Management',
        fees: 'Fees Management'
    };
    pageTitle.textContent = titles[sectionId] || 'Dashboard';

    // Update nav active state
    navItems.forEach(n => {
        n.classList.toggle('active', n.dataset.section === sectionId);
    });

    // Refresh data when switching sections
    if (sectionId === 'dashboard') updateDashboard();
    if (sectionId === 'students') displayStudents();
    if (sectionId === 'certificates') displayCertificates();
    if (sectionId === 'fees') displayFees();
}

/* ============================================
   DATA MANAGEMENT
   ============================================ */
function saveData() {
    localStorage.setItem("students", JSON.stringify(students));
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMessage');
    const icon = toast.querySelector('i');

    toastMsg.textContent = message;

    if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle';
        icon.style.color = 'var(--danger)';
    } else if (type === 'info') {
        icon.className = 'fas fa-info-circle';
        icon.style.color = 'var(--primary)';
    } else {
        icon.className = 'fas fa-check-circle';
        icon.style.color = 'var(--success)';
    }

    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ============================================
   FORM HANDLING
   ============================================ */
// Auto-calculate due amount
const feesInput = document.getElementById('fees');
const paidInput = document.getElementById('paid');
const dueInput = document.getElementById('due');

function calculateDue() {
    const fees = parseFloat(feesInput.value) || 0;
    const paid = parseFloat(paidInput.value) || 0;
    dueInput.value = Math.max(0, fees - paid);
}

feesInput.addEventListener('input', calculateDue);
paidInput.addEventListener('input', calculateDue);

// Photo upload handling
const uploadArea = document.getElementById('uploadArea');
const photoInput = document.getElementById('photo');
const photoPreview = document.getElementById('photoPreview');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
const removePhotoBtn = document.getElementById('removePhoto');

uploadArea.addEventListener('click', () => photoInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--primary)';
    uploadArea.style.background = 'var(--primary-light)';
});

uploadArea.addEventListener('dragleave', () => {
    if (!uploadArea.classList.contains('has-image')) {
        uploadArea.style.borderColor = '#cbd5e1';
        uploadArea.style.background = 'var(--gray-light)';
    }
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        photoInput.files = e.dataTransfer.files;
        handlePhoto(file);
    }
});

photoInput.addEventListener('change', () => {
    if (photoInput.files[0]) {
        handlePhoto(photoInput.files[0]);
    }
});

function handlePhoto(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        photoPreview.src = e.target.result;
        photoPreview.style.display = 'block';
        uploadPlaceholder.style.display = 'none';
        uploadArea.classList.add('has-image');
        removePhotoBtn.style.display = 'flex';
    };
    reader.readAsDataURL(file);
}

removePhotoBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    photoInput.value = '';
    photoPreview.style.display = 'none';
    photoPreview.src = '';
    uploadPlaceholder.style.display = 'block';
    uploadArea.classList.remove('has-image');
    removePhotoBtn.style.display = 'none';
    uploadArea.style.borderColor = '#cbd5e1';
    uploadArea.style.background = 'var(--gray-light)';
});

/* ============================================
   ADD STUDENT
   ============================================ */
form.addEventListener("submit", function(e) {
    e.preventDefault();

    const photoFile = document.getElementById("photo").files[0];

    const processStudent = (photoData) => {
        const student = {
            adno: document.getElementById("adno").value.trim(),
            studentName: document.getElementById("studentName").value.trim(),
            fatherName: document.getElementById("fatherName").value.trim(),
            contact: document.getElementById("contact").value.trim(),
            email: document.getElementById("email").value.trim(),
            className: document.getElementById("class").value.trim(),
            course: document.getElementById("course").value,
            batch: document.getElementById("batch").value,
            fees: parseFloat(document.getElementById("fees").value) || 0,
            paid: parseFloat(document.getElementById("paid").value) || 0,
            due: parseFloat(document.getElementById("due").value) || 0,
            certificate: document.getElementById("certificate").value,
            photo: photoData,
            dateAdded: new Date().toISOString()
        };

        // Check for duplicate admission number
        if (students.some(s => s.adno === student.adno)) {
            showToast('Admission number already exists!', 'error');
            return;
        }

        students.push(student);
        saveData();
        displayStudents();
        updateDashboard();
        form.reset();

        // Reset photo upload
        photoPreview.style.display = 'none';
        photoPreview.src = '';
        uploadPlaceholder.style.display = 'block';
        uploadArea.classList.remove('has-image');
        removePhotoBtn.style.display = 'none';

        showToast('Student added successfully!');

        // Switch to students section
        setTimeout(() => showSection('students'), 800);
    };

    if (photoFile) {
        const reader = new FileReader();
        reader.onload = (e) => processStudent(e.target.result);
        reader.readAsDataURL(photoFile);
    } else {
        processStudent('https://ui-avatars.com/api/?name=' + encodeURIComponent(document.getElementById("studentName").value) + '&background=0b4ec7&color=fff&size=128');
    }
});

/* ============================================
   DISPLAY STUDENTS
   ============================================ */
function displayStudents() {
    tableBody.innerHTML = "";

    if (students.length === 0) {
        tableBody.innerHTML = `
            <tr><td colspan="14">
                <div class="empty-state">
                    <i class="fas fa-user-graduate"></i>
                    <h4>No students found</h4>
                    <p>Add your first student using the New Admission form</p>
                </div>
            </td></tr>`;
        document.getElementById('studentCount').textContent = '0 students';
        document.getElementById('showingCount').textContent = '0';
        document.getElementById('totalCount').textContent = '0';
        return;
    }

    students.forEach((student, index) => {
        const certBadge = student.certificate === 'Issued' 
            ? '<span class="badge badge-issued"><i class="fas fa-check"></i> Issued</span>'
            : '<span class="badge badge-pending"><i class="fas fa-clock"></i> Pending</span>';

        const dueClass = student.due > 0 ? 'badge-due' : 'badge-paid';
        const dueText = student.due > 0 ? `₹${student.due}` : 'Paid';

        let row = `
        <tr>
            <td><img src="${student.photo}" class="student-photo" alt="${student.studentName}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(student.studentName)}&background=0b4ec7&color=fff&size=128'"></td>
            <td><strong>${student.adno}</strong></td>
            <td>
                <div class="student-info">
                    <div>
                        <strong>${student.studentName}</strong>
                        <small>${student.email || 'No email'}</small>
                    </div>
                </div>
            </td>
            <td>${student.fatherName}</td>
            <td><a href="tel:${student.contact}" style="color:var(--primary);text-decoration:none;"><i class="fas fa-phone" style="font-size:0.7rem;margin-right:4px;"></i>${student.contact}</a></td>
            <td>${student.email || '-'}</td>
            <td>${student.className || '-'}</td>
            <td><span class="badge" style="background:var(--primary-light);color:var(--primary);">${student.course || '-'}</span></td>
            <td>${student.batch || '-'}</td>
            <td><strong>₹${student.fees}</strong></td>
            <td style="color:var(--success);">₹${student.paid}</td>
            <td><span class="badge ${dueClass}">${dueText}</span></td>
            <td>${certBadge}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-action btn-edit" onclick="editStudent(${index})" title="Edit"><i class="fas fa-pen"></i></button>
                    <button class="btn-action btn-delete" onclick="deleteStudent(${index})" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>`;
        tableBody.innerHTML += row;
    });

    document.getElementById('studentCount').textContent = `${students.length} student${students.length !== 1 ? 's' : ''}`;
    document.getElementById('showingCount').textContent = students.length;
    document.getElementById('totalCount').textContent = students.length;
}

/* ============================================
   DISPLAY CERTIFICATES
   ============================================ */
function displayCertificates() {
    certTableBody.innerHTML = "";

    const certStudents = students.filter(s => s.certificate === 'Pending');

    if (certStudents.length === 0) {
        certTableBody.innerHTML = `
            <tr><td colspan="6">
                <div class="empty-state">
                    <i class="fas fa-certificate"></i>
                    <h4>No pending certificates</h4>
                    <p>All certificates have been issued</p>
                </div>
            </td></tr>`;
        return;
    }

    certStudents.forEach((student, index) => {
        const realIndex = students.indexOf(student);
        let row = `
        <tr>
            <td><img src="${student.photo}" class="student-photo-sm" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(student.studentName)}&background=0b4ec7&color=fff&size=128'"></td>
            <td><strong>${student.adno}</strong></td>
            <td>${student.studentName}</td>
            <td>${student.course || '-'}</td>
            <td><span class="badge badge-pending"><i class="fas fa-clock"></i> Pending</span></td>
            <td>
                <button class="btn-action btn-edit" onclick="issueCertificate(${realIndex})" title="Issue Certificate"><i class="fas fa-check"></i> Issue</button>
            </td>
        </tr>`;
        certTableBody.innerHTML += row;
    });
}

function issueCertificate(index) {
    students[index].certificate = 'Issued';
    saveData();
    displayCertificates();
    updateDashboard();
    showToast('Certificate issued successfully!');
}

/* ============================================
   DISPLAY FEES
   ============================================ */
function displayFees() {
    feesTableBody.innerHTML = "";

    if (students.length === 0) {
        feesTableBody.innerHTML = `
            <tr><td colspan="8">
                <div class="empty-state">
                    <i class="fas fa-rupee-sign"></i>
                    <h4>No fee records</h4>
                    <p>Add students to see fee details</p>
                </div>
            </td></tr>`;
        return;
    }

    students.forEach((student, index) => {
        const percent = student.fees > 0 ? Math.round((student.paid / student.fees) * 100) : 0;
        const progressColor = percent >= 100 ? 'var(--success)' : percent >= 50 ? 'var(--warning)' : 'var(--danger)';

        let row = `
        <tr>
            <td><strong>${student.adno}</strong></td>
            <td>${student.studentName}</td>
            <td>${student.course || '-'}</td>
            <td>₹${student.fees}</td>
            <td style="color:var(--success);">₹${student.paid}</td>
            <td><span class="badge ${student.due > 0 ? 'badge-due' : 'badge-paid'}">₹${student.due}</span></td>
            <td>
                <div style="display:flex;align-items:center;gap:8px;">
                    <div class="progress-bar" style="width:80px;">
                        <div class="progress-fill" style="width:${percent}%;background:${progressColor};"></div>
                    </div>
                    <span style="font-size:0.75rem;font-weight:600;color:var(--gray);">${percent}%</span>
                </div>
            </td>
            <td>
                <div class="action-btns">
                    <button class="btn-action btn-edit" onclick="editStudent(${index})" title="Update Payment"><i class="fas fa-pen"></i></button>
                </div>
            </td>
        </tr>`;
        feesTableBody.innerHTML += row;
    });
}

/* ============================================
   DASHBOARD
   ============================================ */
function updateDashboard() {
    const totalStudents = students.length;
    const totalFees = students.reduce((sum, s) => sum + (parseFloat(s.fees) || 0), 0);
    const totalPaid = students.reduce((sum, s) => sum + (parseFloat(s.paid) || 0), 0);
    const totalDue = students.reduce((sum, s) => sum + (parseFloat(s.due) || 0), 0);
    const certPending = students.filter(s => s.certificate === 'Pending').length;

    document.getElementById('totalStudents').textContent = totalStudents;
    document.getElementById('totalFees').textContent = '₹' + totalPaid.toLocaleString('en-IN');
    document.getElementById('totalDue').textContent = '₹' + totalDue.toLocaleString('en-IN');
    document.getElementById('certPending').textContent = certPending;

    // Fee ring
    const feePercent = totalFees > 0 ? Math.round((totalPaid / totalFees) * 100) : 0;
    document.getElementById('feePercent').textContent = feePercent + '%';
    document.getElementById('legendPaid').textContent = '₹' + totalPaid.toLocaleString('en-IN');
    document.getElementById('legendDue').textContent = '₹' + totalDue.toLocaleString('en-IN');

    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (feePercent / 100) * circumference;
    const ring = document.getElementById('feeRing');
    if (ring) {
        ring.style.strokeDashoffset = offset;
        ring.style.stroke = feePercent >= 80 ? 'var(--success)' : feePercent >= 50 ? 'var(--warning)' : 'var(--danger)';
    }

    // Recent students
    if (recentTableBody) {
        recentTableBody.innerHTML = "";
        const recent = [...students].reverse().slice(0, 5);

        if (recent.length === 0) {
            recentTableBody.innerHTML = `
                <tr><td colspan="4">
                    <div class="empty-state" style="padding:30px;">
                        <p>No recent admissions</p>
                    </div>
                </td></tr>`;
            return;
        }

        recent.forEach(student => {
            const date = student.dateAdded ? new Date(student.dateAdded).toLocaleDateString('en-IN') : 'N/A';
            const certBadge = student.certificate === 'Issued' 
                ? '<span class="badge badge-issued">Issued</span>'
                : '<span class="badge badge-pending">Pending</span>';

            let row = `
            <tr>
                <td>
                    <div class="student-info">
                        <img src="${student.photo}" class="student-photo-sm" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(student.studentName)}&background=0b4ec7&color=fff&size=128'">
                        <div>
                            <strong>${student.studentName}</strong>
                            <small>${student.adno}</small>
                        </div>
                    </div>
                </td>
                <td>${student.course || '-'}</td>
                <td>${date}</td>
                <td>${certBadge}</td>
            </tr>`;
            recentTableBody.innerHTML += row;
        });
    }
}

/* ============================================
   SEARCH
   ============================================ */
function searchStudent() {
    const input = document.getElementById("searchBox").value.toLowerCase().trim();
    const rows = tableBody.getElementsByTagName("tr");
    let visibleCount = 0;

    for (let i = 0; i < rows.length; i++) {
        const text = rows[i].innerText.toLowerCase();
        const shouldShow = text.includes(input);
        rows[i].style.display = shouldShow ? "" : "none";
        if (shouldShow) visibleCount++;
    }

    document.getElementById('showingCount').textContent = visibleCount;
}

/* ============================================
   DELETE
   ============================================ */
function deleteStudent(index) {
    if (confirm(`Are you sure you want to delete ${students[index].studentName}?`)) {
        students.splice(index, 1);
        saveData();
        displayStudents();
        updateDashboard();
        showToast('Student deleted successfully');
    }
}

/* ============================================
   EDIT
   ============================================ */
function editStudent(index) {
    const student = students[index];
    document.getElementById('editIndex').value = index;
    document.getElementById('editAdno').value = student.adno;
    document.getElementById('editStudentName').value = student.studentName;
    document.getElementById('editFatherName').value = student.fatherName;
    document.getElementById('editContact').value = student.contact;
    document.getElementById('editEmail').value = student.email;
    document.getElementById('editClass').value = student.className;
    document.getElementById('editCourse').value = student.course || 'Other';
    document.getElementById('editBatch').value = student.batch || '8:00 AM - 10:00 AM';
    document.getElementById('editFees').value = student.fees;
    document.getElementById('editPaid').value = student.paid;
    document.getElementById('editDue').value = student.due;
    document.getElementById('editCertificate').value = student.certificate;

    document.getElementById('editModal').classList.add('active');
}

function closeModal() {
    document.getElementById('editModal').classList.remove('active');
}

// Edit form due calculation
const editFees = document.getElementById('editFees');
const editPaid = document.getElementById('editPaid');
const editDue = document.getElementById('editDue');

function calculateEditDue() {
    const fees = parseFloat(editFees.value) || 0;
    const paid = parseFloat(editPaid.value) || 0;
    editDue.value = Math.max(0, fees - paid);
}

editFees.addEventListener('input', calculateEditDue);
editPaid.addEventListener('input', calculateEditDue);

document.getElementById('editForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const index = parseInt(document.getElementById('editIndex').value);

    students[index].studentName = document.getElementById('editStudentName').value.trim();
    students[index].fatherName = document.getElementById('editFatherName').value.trim();
    students[index].contact = document.getElementById('editContact').value.trim();
    students[index].email = document.getElementById('editEmail').value.trim();
    students[index].className = document.getElementById('editClass').value.trim();
    students[index].course = document.getElementById('editCourse').value;
    students[index].batch = document.getElementById('editBatch').value;
    students[index].fees = parseFloat(document.getElementById('editFees').value) || 0;
    students[index].paid = parseFloat(document.getElementById('editPaid').value) || 0;
    students[index].due = parseFloat(document.getElementById('editDue').value) || 0;
    students[index].certificate = document.getElementById('editCertificate').value;

    saveData();
    displayStudents();
    updateDashboard();
    closeModal();
    showToast('Student updated successfully!');
});

// Close modal on outside click
document.getElementById('editModal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

/* ============================================
   EXPORT
   ============================================ */
function exportData() {
    if (students.length === 0) {
        showToast('No data to export', 'error');
        return;
    }

    let csv = 'Admission No,Student Name,Father Name,Contact,Email,Class,Course,Batch,Total Fees,Paid,Due,Certificate\n';
    students.forEach(s => {
        csv += `"${s.adno}","${s.studentName}","${s.fatherName}","${s.contact}","${s.email}","${s.className}","${s.course}","${s.batch}",${s.fees},${s.paid},${s.due},"${s.certificate}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'terabyte_students_' + new Date().toISOString().split('T')[0] + '.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    showToast('Data exported successfully!');
}

/* ============================================
   INITIALIZATION
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    displayStudents();
    updateDashboard();
});
