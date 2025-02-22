document.addEventListener("DOMContentLoaded", function () {
    const loginPage = document.getElementById("login-page");
    const app = document.getElementById("app");
    const loginForm = document.getElementById("login-form");
    const usernameDisplay = document.getElementById("username");

    // بيانات وهمية (يمكن استبدالها بـ localStorage)
    let data = {
        users: [
            { id: 1, name: "المدير", username: "admin", password: "admin", role: "مدير" },
            { id: 2, name: "معلم 1", username: "teacher1", password: "pass123", role: "معلم" },
            { id: 3, name: "طالب 1", username: "student1", password: "pass123", role: "طالب" },
            { id: 4, name: "ولي أمر 1", username: "parent1", password: "pass123", role: "ولي أمر" }
        ],
        courses: [],
        grades: [],
        assignments: [],
        notifications: [],
        gradesClosed: false
    };

    // توليد كلمة مرور عشوائية
    function generatePassword() {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let password = "";
        for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }

    // التحقق من جلسة المستخدم
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser) {
        loginPage.style.display = "none";
        app.style.display = "block";
        usernameDisplay.textContent = currentUser.name;
        loadUserDashboard(currentUser.role);
    } else {
        loginPage.style.display = "flex";
        app.style.display = "none";
    }

    // تسجيل الدخول
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;

        const user = data.users.find(u => u.username === username && u.password === password);
        if (user) {
            localStorage.setItem("currentUser", JSON.stringify(user));
            loginPage.style.display = "none";
            app.style.display = "block";
            usernameDisplay.textContent = user.name;
            loadUserDashboard(user.role);
        } else {
            alert("اسم المستخدم أو كلمة المرور غير صحيحة");
        }
    });

    // تسجيل الخروج
    document.getElementById("logout").addEventListener("click", function () {
        localStorage.removeItem("currentUser");
        window.location.reload();
    });

    // تحميل لوحة التحكم بناءً على دور المستخدم
    function loadUserDashboard(role) {
        const content = document.getElementById("content");
        content.innerHTML = "";

        switch (role) {
            case "مدير":
                loadAdminDashboard();
                break;
            case "معلم":
                loadTeacherDashboard();
                break;
            case "طالب":
                loadStudentDashboard();
                break;
            case "ولي أمر":
                loadParentDashboard();
                break;
            default:
                content.innerHTML = "<p>دور المستخدم غير معروف!</p>";
        }
    }

    // لوحة تحكم المدير
    function loadAdminDashboard() {
        const content = document.getElementById("content");
        content.innerHTML = `
            <h2>لوحة تحكم المدير</h2>
            <button id="manage-users">إدارة المستخدمين</button>
            <button id="manage-courses">إدارة المقررات</button>
            <button id="manage-grades">إدارة الدرجات</button>
            <button id="send-notification">إرسال إشعار</button>
        `;

        document.getElementById("manage-users").addEventListener("click", manageUsers);
        document.getElementById("manage-courses").addEventListener("click", manageCourses);
        document.getElementById("manage-grades").addEventListener("click", manageGrades);
        document.getElementById("send-notification").addEventListener("click", sendNotification);
    }

    // لوحة تحكم المعلم
    function loadTeacherDashboard() {
        const content = document.getElementById("content");
        content.innerHTML = `
            <h2>لوحة تحكم المعلم</h2>
            <button id="add-grades">إضافة درجات</button>
            <button id="add-assignments">إضافة واجبات</button>
            <button id="send-notification">إرسال إشعار</button>
        `;

        document.getElementById("add-grades").addEventListener("click", addGrades);
        document.getElementById("add-assignments").addEventListener("click", addAssignments);
        document.getElementById("send-notification").addEventListener("click", sendNotification);
    }

    // لوحة تحكم الطالب
    function loadStudentDashboard() {
        const content = document.getElementById("content");
        content.innerHTML = `
            <h2>لوحة تحكم الطالب</h2>
            <button id="view-grades">عرض الدرجات</button>
            <button id="view-assignments">عرض الواجبات</button>
        `;

        document.getElementById("view-grades").addEventListener("click", viewGrades);
        document.getElementById("view-assignments").addEventListener("click", viewAssignments);
    }

    // لوحة تحكم ولي الأمر
    function loadParentDashboard() {
        const content = document.getElementById("content");
        content.innerHTML = `
            <h2>لوحة تحكم ولي الأمر</h2>
            <button id="view-child-grades">عرض درجات الابن</button>
            <button id="view-child-reports">عرض تقارير الابن</button>
        `;

        document.getElementById("view-child-grades").addEventListener("click", viewChildGrades);
        document.getElementById("view-child-reports").addEventListener("click", viewChildReports);
    }

    // إدارة المستخدمين (للمدير)
    function manageUsers() {
        const content = document.getElementById("content");
        content.innerHTML = `
            <h2>إدارة المستخدمين</h2>
            <form id="add-user-form">
                <input type="text" id="user-name" placeholder="الاسم" required>
                <input type="text" id="user-id" placeholder="رقم الهوية" required>
                <input type="text" id="user-phone" placeholder="رقم الهاتف" required>
                <select id="user-role">
                    <option value="مدير">مدير</option>
                    <option value="معلم">معلم</option>
                    <option value="طالب">طالب</option>
                    <option value="ولي أمر">ولي أمر</option>
                </select>
                <button type="submit">إضافة مستخدم</button>
            </form>
            <ul id="users-list"></ul>
        `;

        // عرض المستخدمين
        displayUsers();

        // إضافة مستخدم
        document.getElementById("add-user-form").addEventListener("submit", function (e) {
            e.preventDefault();
            const name = document.getElementById("user-name").value;
            const id = document.getElementById("user-id").value;
            const phone = document.getElementById("user-phone").value;
            const role = document.getElementById("user-role").value;

            const newUser = {
                id: data.users.length + 1,
                name: name,
                username: id, // اسم المستخدم هو رقم الهوية
                password: generatePassword(), // كلمة مرور عشوائية
                role: role,
                phone: phone
            };

            data.users.push(newUser);
            displayUsers();
            alert(`تم إضافة المستخدم بنجاح! كلمة المرور: ${newUser.password}`);
        });
    }

    // عرض المستخدمين
    function displayUsers() {
        const usersList = document.getElementById("users-list");
        usersList.innerHTML = "";
        data.users.forEach(user => {
            const li = document.createElement("li");
            li.textContent = `${user.name} - ${user.role} (اسم المستخدم: ${user.username}, كلمة المرور: ${user.password})`;
            usersList.appendChild(li);
        });
    }

    // إدارة المقررات (للمدير)
    function manageCourses() {
        const content = document.getElementById("content");
        content.innerHTML = `
            <h2>إدارة المقررات الدراسية</h2>
            <form id="add-course-form">
                <input type="text" id="course-name" placeholder="اسم المقرر" required>
                <button type="submit">إضافة مقرر</button>
            </form>
            <ul id="courses-list"></ul>
        `;

        // عرض المقررات
        displayCourses();

        // إضافة مقرر
        document.getElementById("add-course-form").addEventListener("submit", function (e) {
            e.preventDefault();
            const courseName = document.getElementById("course-name").value;

            const newCourse = {
                id: data.courses.length + 1,
                name: courseName
            };

            data.courses.push(newCourse);
            displayCourses();
        });
    }

    // عرض المقررات
    function displayCourses() {
        const coursesList = document.getElementById("courses-list");
        coursesList.innerHTML = "";
        data.courses.forEach(course => {
            const li = document.createElement("li");
            li.textContent = course.name;
            coursesList.appendChild(li);
        });
    }

    // إدارة الدرجات (للمدير)
    function manageGrades() {
        const content = document.getElementById("content");
        content.innerHTML = `
            <h2>إدارة الدرجات</h2>
            <form id="add-grade-form">
                <select id="student-select"></select>
                <select id="course-select"></select>
                <input type="number" id="grade" placeholder="الدرجة" required>
                <button type="submit">إضافة درجة</button>
            </form>
            <ul id="grades-list"></ul>
        `;

        // تعبئة قائمة الطلاب
        const studentSelect = document.getElementById("student-select");
        data.users.forEach(user => {
            if (user.role === "طالب") {
                const option = document.createElement("option");
                option.value = user.id;
                option.textContent = user.name;
                studentSelect.appendChild(option);
            }
        });

        // تعبئة قائمة المقررات
        const courseSelect = document.getElementById("course-select");
        data.courses.forEach(course => {
            const option = document.createElement("option");
            option.value = course.id;
            option.textContent = course.name;
            courseSelect.appendChild(option);
        });

        // عرض الدرجات
        displayGrades();

        // إضافة درجة
        document.getElementById("add-grade-form").addEventListener("submit", function (e) {
            e.preventDefault();
            const studentId = document.getElementById("student-select").value;
            const courseId = document.getElementById("course-select").value;
            const grade = document.getElementById("grade").value;

            const newGrade = {
                studentId: studentId,
                courseId: courseId,
                grade: grade
            };

            data.grades.push(newGrade);
            displayGrades();
        });
    }

    // عرض الدرجات
    function displayGrades() {
        const gradesList = document.getElementById("grades-list");
        gradesList.innerHTML = "";
        data.grades.forEach(grade => {
            const student = data.users.find(user => user.id == grade.studentId);
            const course = data.courses.find(course => course.id == grade.courseId);
            const li = document.createElement("li");
            li.textContent = `${student.name} - ${course.name}: ${grade.grade}`;
            gradesList.appendChild(li);
        });
    }

    // إرسال الإشعارات (للمدير والمعلم)
    function sendNotification() {
        const content = document.getElementById("content");
        content.innerHTML = `
            <h2>إرسال إشعار</h2>
            <form id="send-notification-form">
                <textarea id="notification-message" placeholder="نص الإشعار" required></textarea>
                <button type="submit">إرسال</button>
            </form>
        `;

        document.getElementById("send-notification-form").addEventListener("submit", function (e) {
            e.preventDefault();
            const message = document.getElementById("notification-message").value;

            const newNotification = {
                id: data.notifications.length + 1,
                message: message,
                date: new Date().toLocaleString()
            };

            data.notifications.push(newNotification);
            alert("تم إرسال الإشعار بنجاح");
        });
    }

    // إضافة درجات (للمعلم)
    function addGrades() {
        const content = document.getElementById("content");
        content.innerHTML = `
            <h2>إضافة درجات</h2>
            <form id="add-grade-form">
                <select id="student-select"></select>
                <select id="course-select"></select>
                <input type="number" id="grade" placeholder="الدرجة" required>
                <button type="submit">إضافة درجة</button>
            </form>
            <ul id="grades-list"></ul>
        `;

        // تعبئة قائمة الطلاب
        const studentSelect = document.getElementById("student-select");
        data.users.forEach(user => {
            if (user.role === "طالب") {
                const option = document.createElement("option");
                option.value = user.id;
                option.textContent = user.name;
                studentSelect.appendChild(option);
            }
        });

        // تعبئة قائمة المقررات
        const courseSelect = document.getElementById("course-select");
        data.courses.forEach(course => {
            const option = document.createElement("option");
            option.value = course.id;
            option.textContent = course.name;
            courseSelect.appendChild(option);
        });

        // عرض الدرجات
        displayGrades();

        // إضافة درجة
        document.getElementById("add-grade-form").addEventListener("submit", function (e) {
            e.preventDefault();
            const studentId = document.getElementById("student-select").value;
            const courseId = document.getElementById("course-select").value;
            const grade = document.getElementById("grade").value;

            const newGrade = {
                studentId: studentId,
                courseId: courseId,
                grade: grade
            };

            data.grades.push(newGrade);
            displayGrades();
        });
    }

    // إضافة واجبات (للمعلم)
    function addAssignments() {
        const content = document.getElementById("content");
        content.innerHTML = `
            <h2>إضافة واجبات</h2>
            <form id="add-assignment-form">
                <input type="text" id="assignment-title" placeholder="عنوان الواجب" required>
                <textarea id="assignment-questions" placeholder="أسئلة الواجب" required></textarea>
                <button type="submit">إضافة واجب</button>
            </form>
            <ul id="assignments-list"></ul>
        `;

        // عرض الواجبات
        displayAssignments();

        // إضافة واجب
        document.getElementById("add-assignment-form").addEventListener("submit", function (e) {
            e.preventDefault();
            const title = document.getElementById("assignment-title").value;
            const questions = document.getElementById("assignment-questions").value;

            const newAssignment = {
                id: data.assignments.length + 1,
                title: title,
                questions: questions
            };

            data.assignments.push(newAssignment);
            displayAssignments();
        });
    }

    // عرض الواجبات
    function displayAssignments() {
        const assignmentsList = document.getElementById("assignments-list");
        assignmentsList.innerHTML = "";
        data.assignments.forEach(assignment => {
            const li = document.createElement("li");
            li.textContent = assignment.title;
            assignmentsList.appendChild(li);
        });
    }

    // عرض الدرجات (للطالب)
    function viewGrades() {
        const content = document.getElementById("content");
        content.innerHTML = `
            <h2>عرض الدرجات</h2>
            <ul id="student-grades-list"></ul>
            <p>المعدل: <span id="student-average"></span></p>
        `;

        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        const studentId = currentUser.id;

        // عرض درجات الطالب
        const gradesList = document.getElementById("student-grades-list");
        gradesList.innerHTML = "";

        data.grades.forEach(grade => {
            if (grade.studentId == studentId) {
                const course = data.courses.find(course => course.id == grade.courseId);
                const li = document.createElement("li");
                li.textContent = `المادة: ${course.name}, الدرجة: ${grade.grade}`;
                gradesList.appendChild(li);
            }
        });

        // عرض المعدل
        const average = calculateAverage(studentId);
        document.getElementById("student-average").textContent = average;
    }

    // عرض الواجبات (للطالب)
    function viewAssignments() {
        const content = document.getElementById("content");
        content.innerHTML = `
            <h2>عرض الواجبات</h2>
            <ul id="student-assignments-list"></ul>
        `;

        const assignmentsList = document.getElementById("student-assignments-list");
        assignmentsList.innerHTML = "";

        data.assignments.forEach(assignment => {
            const li = document.createElement("li");
            li.textContent = assignment.title;
            assignmentsList.appendChild(li);
        });
    }

    // عرض درجات الابن (لولي الأمر)
    function viewChildGrades() {
        const content = document.getElementById("content");
        content.innerHTML = `
            <h2>عرض درجات الابن</h2>
            <ul id="child-grades-list"></ul>
            <p>المعدل: <span id="child-average"></span></p>
        `;

        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        const child = data.users.find(user => user.parentId == currentUser.id);

        if (child) {
            const gradesList = document.getElementById("child-grades-list");
            gradesList.innerHTML = "";

            data.grades.forEach(grade => {
                if (grade.studentId == child.id) {
                    const course = data.courses.find(course => course.id == grade.courseId);
                    const li = document.createElement("li");
                    li.textContent = `المادة: ${course.name}, الدرجة: ${grade.grade}`;
                    gradesList.appendChild(li);
                }
            });

            // عرض المعدل
            const average = calculateAverage(child.id);
            document.getElementById("child-average").textContent = average;
        } else {
            content.innerHTML += "<p>لا يوجد طالب مرتبط بهذا الحساب.</p>";
        }
    }

    // عرض تقارير الابن (لولي الأمر)
    function viewChildReports() {
        const content = document.getElementById("content");
        content.innerHTML = `
            <h2>عرض تقارير الابن</h2>
            <p>هنا يمكنك رؤية تقارير الابن.</p>
        `;
    }

    // حساب المعدل التلقائي
    function calculateAverage(studentId) {
        const studentGrades = data.grades.filter(grade => grade.studentId == studentId);
        if (studentGrades.length === 0) return 0;

        const total = studentGrades.reduce((sum, grade) => sum + parseFloat(grade.grade), 0);
        return (total / studentGrades.length).toFixed(2);
    }
});