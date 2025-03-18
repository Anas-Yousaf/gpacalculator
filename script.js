document.addEventListener("DOMContentLoaded", function () {
    loadSubjects();
});

// Open Manage Marks Popup
function openPopup(courseName, creditHours) {
    document.getElementById("popup-title").innerText = courseName;
    document.getElementById("popup-credit").querySelector("span").innerText = creditHours;

    document.getElementById("marksPopup").style.visibility = "visible";
    document.getElementById("marksPopup").style.opacity = "1";

    loadMarks(courseName);
}

// Close Popup
function closePopup() {
    document.getElementById("marksPopup").style.opacity = "0";
    setTimeout(() => {
        document.getElementById("marksPopup").style.visibility = "hidden";
    }, 300);
}

// Add New Course
function addCourse() {
    let courseName = document.getElementById("course-name").value;
    let creditHours = document.getElementById("credit-hours").value;

    if (!courseName || !creditHours) {
        alert("Please enter Course Name and Credit Hours.");
        return;
    }

    let subjects = JSON.parse(localStorage.getItem("subjects")) || [];
    subjects.push({ name: courseName, credits: creditHours });
    localStorage.setItem("subjects", JSON.stringify(subjects));

    loadSubjects();
}

// Load Courses from Local Storage
function loadSubjects() {
    let table = document.getElementById("course-list");
    table.innerHTML = "";

    let subjects = JSON.parse(localStorage.getItem("subjects")) || [];

    subjects.forEach((subject, index) => {
        let row = table.insertRow();
        row.innerHTML = `
            <td>${subject.name}</td>
            <td>${subject.credits}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="openPopup('${subject.name}', '${subject.credits}')">Manage Marks</button>
                <button class="btn btn-danger btn-sm" onclick="deleteSubject(${index})">Delete</button>
            </td>
        `;
    });
}

// Delete Subject & Marks
function deleteSubject(index) {
    let subjects = JSON.parse(localStorage.getItem("subjects")) || [];
    let subjectName = subjects[index].name;

    subjects.splice(index, 1);
    localStorage.setItem("subjects", JSON.stringify(subjects));
    localStorage.removeItem(subjectName); // Remove marks

    loadSubjects();
}

// Add Marks Entry
function addMarks() {
    let courseName = document.getElementById("popup-title").innerText;
    let marksType = document.getElementById("marks-type").value;
    let totalMarks = document.getElementById("total-marks").value;
    let obtainedMarks = document.getElementById("obtained-marks").value;

    if (!totalMarks || !obtainedMarks) {
        alert("Please enter both total and obtained marks.");
        return;
    }

    let marksData = JSON.parse(localStorage.getItem(courseName)) || [];
    let typeCount = marksData.filter(mark => mark.type === marksType).length + 1;

    marksData.push({
        type: marksType,
        total: totalMarks,
        obtained: obtainedMarks,
        id: typeCount
    });

    localStorage.setItem(courseName, JSON.stringify(marksData));
    loadMarks(courseName);
}

// Load Marks for a Course
function loadMarks(courseName) {
    let marksData = JSON.parse(localStorage.getItem(courseName)) || [];

    let marksList = document.getElementById("marks-list");
    marksList.innerHTML = ""; // Clear previous data

    let categories = ["Quiz", "Assignment", "Class Participation", "Project Presentation", "Midterm", "Final","LabWork"];

    categories.forEach(category => {
        let categoryMarks = marksData.filter(mark => mark.type === category);
        if (categoryMarks.length > 0) {
            let section = document.createElement("div");
            section.classList.add("marks-section");

            let heading = document.createElement("h5");
            heading.innerText = category + "s";
            section.appendChild(heading);

            let listContainer = document.createElement("div");
            listContainer.classList.add("marks-list");

            categoryMarks.forEach((mark, index) => {
                let card = document.createElement("div");
                card.classList.add("card");
                card.innerHTML = `
                    <strong>${category} #${index + 1}</strong><br> 
                    ${mark.obtained} / ${mark.total}
                    <button class="delete-btn" onclick="deleteMark('${courseName}', '${mark.type}', ${mark.id})">X</button>
                `;
                listContainer.appendChild(card);
            });

            section.appendChild(listContainer);
            marksList.appendChild(section);
        }
    });
}

// Delete Marks Entry
function deleteMark(courseName, type, id) {
    let marksData = JSON.parse(localStorage.getItem(courseName)) || [];
    marksData = marksData.filter(mark => !(mark.type === type && mark.id === id));

    localStorage.setItem(courseName, JSON.stringify(marksData));
    loadMarks(courseName);
}

// Calculate GPA
function calculateGPA() {
    let subjects = JSON.parse(localStorage.getItem("subjects")) || [];
    let totalCreditHours = 0;
    let totalGradePoints = 0;
    let gpaDetails = [];

    subjects.forEach(subject => {
        let marksData = JSON.parse(localStorage.getItem(subject.name)) || [];
        let creditHours = parseInt(subject.credits);
        totalCreditHours += creditHours;

        let totalMarks = calculateTotalMarks(marksData, creditHours);
        let grade = calculateGrade(totalMarks);
        let gradePoints = calculateGradePoints(grade);

        totalGradePoints += gradePoints * creditHours;
        gpaDetails.push({
            name: subject.name,
            credits: creditHours,
            totalMarks: totalMarks,
            grade: grade
        });
    });

    let gpa = (totalGradePoints / totalCreditHours).toFixed(2);
    displayGPA(gpa, gpaDetails);
}

// Calculate Total Marks for a Subject
function calculateTotalMarks(marksData, creditHours) {
    let total = 0;

    if (creditHours === 3) {
        let quizzes = marksData.filter(mark => mark.type === "Quiz");
        let assignments = marksData.filter(mark => mark.type === "Assignment");
        let participation = marksData.filter(mark => mark.type === "Class Participation");
        let project = marksData.filter(mark => mark.type === "Project Presentation");
        let midterm = marksData.filter(mark => mark.type === "Midterm");
        let final = marksData.filter(mark => mark.type === "Final");

        total += calculatePercentage(quizzes, 10);
        total += calculatePercentage(assignments, 5);
        total += calculatePercentage(participation, 5);
        total += calculatePercentage(project, 10);
        total += calculatePercentage(midterm, 30);
        total += calculatePercentage(final, 40);
    } else if (creditHours === 1) {
        let quizzes = marksData.filter(mark => mark.type === "Quiz");
        let midterm = marksData.filter(mark => mark.type === "Midterm");
        let final = marksData.filter(mark => mark.type === "Final");
        let labWork = marksData.filter(mark => mark.type === "Lab Work");

        total += calculatePercentage(quizzes, 20);
        total += calculatePercentage(midterm, 10);
        total += calculatePercentage(final, 50);
        total += calculatePercentage(labWork, 20);
    }

    return total;
}

// Calculate Percentage of Marks
function calculatePercentage(marks, percentage) {
    if (marks.length === 0) return 0;
    let totalObtained = marks.reduce((sum, mark) => sum + parseFloat(mark.obtained), 0);
    let totalPossible = marks.reduce((sum, mark) => sum + parseFloat(mark.total), 0);
    return (totalObtained / totalPossible) * percentage;
}

// Calculate Grade Based on Total Marks
function calculateGrade(totalMarks) {
    if (totalMarks >= 86) return "A";
    if (totalMarks >= 82) return "A-";
    if (totalMarks >= 78) return "B+";
    if (totalMarks >= 74) return "B";
    if (totalMarks >= 70) return "B-";
    if (totalMarks >= 66) return "C+";
    if (totalMarks >= 62) return "C";
    if (totalMarks >= 58) return "C-";
    if (totalMarks >= 54) return "D+";
    if (totalMarks >= 50) return "D";
    return "F";
}

// Calculate Grade Points
function calculateGradePoints(grade) {
    switch (grade) {
        case "A": return 4.0;
        case "A-": return 3.67;
        case "B+": return 3.33;
        case "B": return 3.0;
        case "B-": return 2.67;
        case "C+": return 2.33;
        case "C": return 2.0;
        case "C-": return 1.67;
        case "D+": return 1.33;
        case "D": return 1.0;
        case "F": return 0.0;
        default: return 0.0;
    }
}

// Display GPA Result
function displayGPA(gpa, gpaDetails) {
    let gpaDetailsTable = document.getElementById("gpa-details");
    gpaDetailsTable.innerHTML = "";

    gpaDetails.forEach(detail => {
        let row = gpaDetailsTable.insertRow();
        row.innerHTML = `
            <td>${detail.name}</td>
            <td>${detail.credits}</td>
            <td>${detail.totalMarks.toFixed(2)}</td>
            <td>${detail.grade}</td>
        `;
    });

    document.getElementById("final-gpa").innerText = gpa;
    document.getElementById("gpa-result").style.display = "block";
}