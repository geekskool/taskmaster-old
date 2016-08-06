var user = JSON.parse(localStorage.getItem('userData'));
console.log(user)

var welcome = document.getElementById('welcome')
var welcomeText = "Welcome " + user.name;
welcome.innerText = welcomeText;

var userList = [];
var taskList = [];

getUsers(printUsers);

function getUsers(callback) {
    var users = new XMLHttpRequest();
    users.open("GET", "/api/users/" + user.phone, true);
    users.setRequestHeader("content-type", "application/json");
    users.onreadystatechange = function() {
        if (users.readyState == 4 && users.status == 200) {
            console.log(users.responseText);
            userList = JSON.parse(users.responseText);
            console.log(userList);
            callback();
        }
    }
    users.send();
}

function printUsers() {
    console.log(userList);
    console.log(userList[0]);
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