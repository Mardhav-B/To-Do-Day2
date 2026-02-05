"use strict";
window.onload = () => {
    const modalAdd = document.getElementById("modalAdd");
    const modalEdit = document.getElementById("modalEdit");
    const addBtn = document.getElementById("addBtn");
    const saveBtn = document.getElementById("saveBtn");
    const cancelAddBtn = document.getElementById("cancelAddBtn");
    const updateBtn = document.getElementById("updateBtn");
    const deleteBtn = document.getElementById("deleteBtn");
    const cancelEditBtn = document.getElementById("cancelEditBtn");
    let currentEditId = null;
    addBtn.addEventListener("click", () => modalAdd.style.display = "flex");
    cancelAddBtn.addEventListener("click", () => modalAdd.style.display = "none");
    cancelEditBtn.addEventListener("click", () => modalEdit.style.display = "none");
    saveBtn.addEventListener("click", saveTask);
    updateBtn.addEventListener("click", updateTask);
    deleteBtn.addEventListener("click", deleteTask);
    loadTasks();
    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
        tasks.forEach(addTaskToDOM);
    }
    function saveTask() {
        const descInput = document.getElementById("descAdd");
        const endTimeInput = document.getElementById("endTimeAdd");
        const desc = descInput.value.trim();
        const endTime = endTimeInput.value;
        if (!desc || !endTime)
            return alert("Please fill all fields");
        const id = Date.now();
        const startTime = Date.now();
        const status = "todo";
        const task = { id, desc, startTime, endTime, status };
        const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
        tasks.push(task);
        localStorage.setItem("tasks", JSON.stringify(tasks));
        addTaskToDOM(task);
        modalAdd.style.display = "none";
        descInput.value = "";
        endTimeInput.value = "";
    }
    function getColumn(status) {
        return document.getElementById(status + "List");
    }
    function addTaskToDOM(task) {
        const taskDiv = document.createElement("div");
        taskDiv.className = "task green";
        taskDiv.dataset.id = task.id.toString();
        taskDiv.dataset.start = task.startTime.toString();
        taskDiv.dataset.end = new Date(task.endTime).getTime().toString();
        taskDiv.innerHTML = `
      <span>${task.desc}</span>
      <select>
        <option value="todo" ${task.status === "todo" ? "selected" : ""}>To Do</option>
        <option value="inprogress" ${task.status === "inprogress" ? "selected" : ""}>In Progress</option>
        <option value="done" ${task.status === "done" ? "selected" : ""}>Done</option>
        <option value="pending" ${task.status === "pending" ? "selected" : ""}>Pending</option>
      </select>
    `;
        const select = taskDiv.querySelector("select");
        select.addEventListener("change", () => moveTask(taskDiv, select.value));
        taskDiv.addEventListener("click", e => {
            if (e.target.tagName !== "SELECT")
                openEditModal(task.id);
        });
        getColumn(task.status).appendChild(taskDiv);
        setInterval(() => updateColor(taskDiv), 1000);
    }
    function moveTask(taskDiv, newStatus) {
        const id = parseInt(taskDiv.dataset.id);
        let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
        tasks = tasks.map(t => t.id === id ? { ...t, status: newStatus } : t);
        localStorage.setItem("tasks", JSON.stringify(tasks));
        getColumn(newStatus).appendChild(taskDiv);
    }
    function updateColor(taskDiv) {
        const now = Date.now();
        const start = parseInt(taskDiv.dataset.start);
        const end = parseInt(taskDiv.dataset.end);
        const total = end - start;
        const remaining = end - now;
        const percentLeft = remaining / total;
        const select = taskDiv.querySelector("select");
        const status = select.value;
        taskDiv.classList.remove("green", "yellow", "red");
        if (status === "done")
            taskDiv.classList.add("green");
        else {
            if (percentLeft <= 0) {
                taskDiv.classList.add("red");
                if (status !== "pending")
                    moveTask(taskDiv, "pending");
            }
            else if (percentLeft <= 0.25)
                taskDiv.classList.add("yellow");
            else
                taskDiv.classList.add("green");
        }
    }
    function openEditModal(id) {
        currentEditId = id;
        const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
        const task = tasks.find(t => t.id === id);
        document.getElementById("descEdit").value = task.desc;
        document.getElementById("endTimeEdit").value = task.endTime;
        document.getElementById("statusEdit").value = task.status;
        modalEdit.style.display = "flex";
    }
    function updateTask() {
        if (currentEditId === null)
            return;
        const desc = document.getElementById("descEdit").value.trim();
        const endTime = document.getElementById("endTimeEdit").value;
        const status = document.getElementById("statusEdit").value;
        let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
        tasks = tasks.map(t => t.id === currentEditId ? { ...t, desc, endTime, status } : t);
        localStorage.setItem("tasks", JSON.stringify(tasks));
        const taskDiv = document.querySelector(`.task[data-id='${currentEditId}']`);
        taskDiv.querySelector("span").textContent = desc;
        taskDiv.dataset.end = new Date(endTime).getTime().toString();
        taskDiv.querySelector("select").value = status;
        getColumn(status).appendChild(taskDiv);
        modalEdit.style.display = "none";
    }
    function deleteTask() {
        if (currentEditId === null)
            return;
        let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
        tasks = tasks.filter(t => t.id !== currentEditId);
        localStorage.setItem("tasks", JSON.stringify(tasks));
        const taskDiv = document.querySelector(`.task[data-id='${currentEditId}']`);
        taskDiv.remove();
        modalEdit.style.display = "none";
    }
};
