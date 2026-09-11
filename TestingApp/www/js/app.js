document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    const status = document.getElementById("cordovaStatus");
    status.textContent = "Cordova is ready app.js is running";
    status.classList.add("ready")
} 
function greetStudent(){
    const nameInput = document.getElementById("nameInput");
    const output = document.getElementById("greetingOutput");
    const name = nameInput.value.trim();
    const message = "Today we are building with cordova."
    if(name === ""){
        output.textContent = "please enter your name first.";
        return;
    }
    output.textContent = "Hello, " + name + "! Welcome to Bincom. " + message;
}

let count = 0;
function changeCount(amount){
    count = count + amount;
    document.getElementById("countOutput").textContent = count;
}
function resetCounter(){
    count = 0;
    document.getElementById("countOutput").textContent = count;
}

let tasks = [];

function addTask(){
    const taskInput = document.getElementById("taskInput");
    const text = taskInput.value.trim();

    if(text === ""){
        return;
    }
    const task = {
        id:Date.now(),
        text:text
    };
    tasks.push(task);
    saveTasks();
    taskInput.value = "";
    renderTasks();
}

function renderTasks(){
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    tasks.forEach(task =>{
        const item = document.createElement("li");
        const text = document.createElement("span");
        const button = document.createElement("button");
        button.classList.add("task-button");

        text.textContent = task.text;
        button.textContent = "Delete";
        button.onclick= function(){
            deleteTask(task.id);
        };

        item.appendChild(text);
        item.appendChild(button);
        taskList.appendChild(item);
    });
}

function deleteTask(id){
    tasks = tasks.filter(task=>{
        return task.id !== id;
    });
    saveTasks();
    renderTasks();
}

function saveTasks(){
    localStorage.setItem("bincomTasks", JSON.stringify(tasks));
}

function loadTasks(){
    const savedTasks = localStorage.getItem("bincomTasks");

    if(savedTasks){
        tasks = JSON.parse(savedTasks);
        renderTasks();
    }
}

document.addEventListener("DOMContentLoaded", loadTasks);

function toggleTheme(){
    document.body.classList.toggle("dark-mode");
}