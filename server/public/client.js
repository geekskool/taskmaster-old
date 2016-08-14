var user = JSON.parse(localStorage.getItem('userData'));
// console.log(user)

var welcome = document.getElementById('welcome')
welcome.innerText = "Welcome " + user.name;

var userList = [];
var taskList = [];
var assignName;
var assignNum;


window.onload = function() {
    document.getElementById("chat").onclick = function() {
        var overlay = document.getElementById("overlay");
        var popup = document.getElementById("popup");
        overlay.style.display = "block";
        popup.style.display = "block";
    };

    document.getElementById("Close").onclick = function() {
        var overlay = document.getElementById("overlay");
        var popup = document.getElementById("popup");
        overlay.style.display = "none";
        popup.style.display = "none";
    }
};


jQuery(function($) {


    var $chatbox = $('#chatbox');
    var $msg = $('#usermsg');
    var $form = $('#sendMsg');

    $form.submit(function(e) {
        e.preventDefault();
        socket.emit('sendmessage', $msg.val());
        // $chatbox.append('<b>' + user.name + '</b>' + ": " + $msg.val() + '<br>');
        $msg.val(' ');

    });

    socket.on("new message", function(data) {
        $chatbox.append('<b>' + data.name + '</b>' + ": " + data.msg + '<br>');

    });



});




var socket = io();

socket.on('connect', function() {
    console.log("connected to server");
    socket.emit('joinroom', user.name);
});


socket.on("notify", function(data) {
    alert("you have a new task from  " + data);
});


getUsers(populateUsers);




function getUsers(callback) {
    var users = new XMLHttpRequest();
    users.open("GET", "/api/users/" + user.phone, true);
    users.setRequestHeader("content-type", "application/json");
    users.onreadystatechange = function() {
        if (users.readyState == 4 && users.status == 200) {
            userList = JSON.parse(users.responseText);
            console.log(userList);
            if (callback()) {
                callback();
            } else {
                console.log("no callback spotted");
            }
        }
    }
    users.send();
}


function getTasks() {
    var tasks = new XMLHttpRequest();
    tasks.open("GET", "/api/tasks/" + user.phone, true);
    tasks.setRequestHeader("content-type", "application/json");
    tasks.onreadystatechange = function() {
        if (tasks.readyState == 4 && tasks.status == 200) {
            taskList = JSON.parse(tasks.responseText);
            //console.log(taskList);
            if (tasks.responseText.length === 0)
                console.log(user.name + " has no tasks for him")
            addView();
        }
    }
    tasks.send();

}

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
    var today = new Date;

    if (date == "") {
        date = new Date;
        date = new Date(date.setTime(date.getTime() + 86400000));
        date = date.toJSON().slice(0, 10)
    }

    date = date + "T00:00:00.000Z";

    var title = document.getElementById('name').value
    if (title === "" || title === "\s" || title === null) {
        window.alert("Task name cannot be empty")
    }

    var newTask = {
        title: document.getElementById('name').value,
        date: date,
        assgnByName: user.name,
        assgnByPhon: user.phone,
        assgnToName: assignName,
        assgnToPhon: assignNum
    }

    var task = new XMLHttpRequest();
    task.open("POST", "/api/tasks/", true);
    task.setRequestHeader("content-type", "application/json");
    task.onreadystatechange = function() {
        if (task.readyState == 4 && task.status == 200) {
            window.location.reload();
            socket.emit('newTask', {
                assgnTo: assignName,
                from: user.name
            });


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
    }
    getTasks();
}

function updateTask(task) {
    task.data.status = false;

    var update = new XMLHttpRequest();
    update.open("PUT", "/api/tasks/", true);
    update.setRequestHeader("content-type", "application/json");
    update.onreadystatechange = function() {
        if (update.readyState == 4 && update.status == 200) {
            getTasks();
            location.reload(true);
        }
    }
    update.send(JSON.stringify(task));
}

function addView() {
    for (var i = 0; i < taskList.length; i++) {
        if (taskList[i].data.status == true)
            addRow(taskList[i]);
    }
}

function addRow(task) {
    var row = document.getElementById('tasks').insertRow();
    var taskname = row.insertCell(0);
    var owner = row.insertCell(1);
    var byDate = row.insertCell(2);
    var done = row.insertCell(3);

    taskname.innerText = task.data.title;
    owner.innerText = task.data.assgnToName;
    byDate.innerText = task.data.date.slice(0, 10);

    var donebutton = document.createElement('button');
    donebutton.innerHTML = 'Done';
    donebutton.setAttribute('class', 'button')
    donebutton.addEventListener('click', function() {
        updateTask(task);
    })
    done.appendChild(donebutton)
}
