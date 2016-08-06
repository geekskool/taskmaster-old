var user = JSON.parse(localStorage.getItem('userData'));
console.log(user)

var welcome = document.getElementById('welcome')
welcome.innerText = "Welcome " + user.name;

var userList = [];
var taskList = [];
var assignName;
var assignNum;

getUsers(populateUsers);

function getUsers(callback) {
    var users = new XMLHttpRequest();
    users.open("GET", "/api/users/" + user.phone, true);
    users.setRequestHeader("content-type", "application/json");
    users.onreadystatechange = function() {
        if (users.readyState == 4 && users.status == 200) {
            console.log(users.responseText);
            userList = JSON.parse(users.responseText);
            console.log(userList);
            //callback();
            if (callback()) {
                callback();
            } else
                console.log("no callback spotted");
        }
    }
    users.send();
}


function getTasks() {
    var tasks = new XMLHttpRequest();
    tasks.open("GET", "/api/tasks/" + "68799", true);
    tasks.setRequestHeader("content-type", "application/json");
    tasks.onreadystatechange = function() {
        if (tasks.readyState == 4 && tasks.status == 200) {
            console.log(tasks.responseText);
            taskList = JSON.parse(tasks.responseText);
            console.log(taskList);
            console.log(taskList[0].data.title);
            if (tasks.responseText.length === 0)
                console.log(user.name + " has no tasks for him")
        }
    }
    tasks.send();
}

getTasks();

function assignTo() {
    selectName = document.getElementById('assignTo');
    assignName = selectName.options[selectName.selectedIndex].text;
    for (var i = 0; i < userList.length; i++) {
        if (userList[i].name == assignName) {
            assignNum = userList[i].phone;
            break;
        }
    }
}

function createTask() {
    assignTo();
    var date = document.getElementById('date').value;
    console.log(date);
    var newTask = {
        title: document.getElementById('name').value,
        date: document.getElementById('date').value,
        assgnByName: user.name,
        assgnByPhon: user.phone,
        assgnToName: assignName,
        assgnToPhon: assignNum
    }
    console.log(newTask);
    var task = new XMLHttpRequest();
    task.open("POST", "/api/tasks/", true);
    task.setRequestHeader("content-type", "application/json");
    task.onreadystatechange = function() {
        if (task.readyState == 4 && task.status == 200) {
            window.location.reload();
        }
    }
    task.send(JSON.stringify(newTask));
}

function populateUsers() {
    var assign = document.getElementById('assignTo');
    for (var i = 0; i < userList.length; i++) {
        var option = document.createElement('option');
        option.setAttribute('value', userList[i].name);
        option.innerText = userList[i].name;
        assign.appendChild(option);
        console.log(userList[i].name);
    }
}

function updateTask(){
    
}