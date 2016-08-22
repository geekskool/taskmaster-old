var user = JSON.parse(localStorage.getItem('userData'));

var welcome = document.getElementById('welcome')
welcome.innerText = "Welcome " + user.name;

var userList = [];
var taskList = [];
var assignName;
var assignNum;
var taskObj;

var modal = document.getElementById('myModal');
var span = document.getElementsByClassName("close")[0];

window.onload = function() {
    span.onclick = function() {
        modal.style.display = "none";
    }
};


jQuery(function($) {


    var $chatbox = $('#chatbox');
    var $msg = $('#usermsg');
    var $form = $('#sendMsg');
    var userTo;
    $form.submit(function(e) {
        e.preventDefault();
        if (user.name == taskObj.data.assgnToName) {
            userTo = taskObj.data.assgnByName;
        } else {
            userTo = taskObj.data.assgnToName;
        }

        $chatbox.append('<b>' + user.name + '</b>' + ": " + $msg.val() + '<br>');

        taskObj.data.comments = '<b>' + user.name + '</b>' + ": " + $msg.val() + '<br>';

        socket.emit('sendmessage', { msg: $msg.val(), to: userTo });
        putComment(taskObj);

        console.log(`${taskObj.data.assgnToName} <--name`);
        console.log(taskObj);


        $msg.val(' ');

    });

    // socket.on("new message", function(data) {
    //     $chatbox.append('<b>' + data.name + '</b>' + ": " + data.msg + '<br>');

    // });

    // socket.on("private", function(data) {
    //     $chatbox.append('<b>' + data.name + '</b>' + ": " + data.msg + '<br>');

    // });

    socket.on("discuss", function(data) {
        console.log(`${data} <--discuss on event`)
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
    var discuss = row.insertCell(4);

    taskname.innerText = task.data.title;
    owner.innerText = task.data.assgnToName;
    byDate.innerText = task.data.date.slice(0, 10);

    var donebutton = document.createElement('button');
    donebutton.innerHTML = 'X';
    donebutton.setAttribute('class', 'button')
    donebutton.addEventListener('click', function() {
        updateTask(task);
    })
    done.appendChild(donebutton)

    var discussbutton = document.createElement('button');


    discussbutton.innerHTML = 'Discuss';
    discussbutton.setAttribute('class', 'button')
    discussbutton.addEventListener('click', function() {
        $chatbox.empty();
        taskObj = task;
        getComment(task)
        console.log("Inside Discuss")
    })
    discuss.appendChild(discussbutton)
}



function getComment(task) {
    var id = task.id;

    var comment = new XMLHttpRequest();
    comment.open("GET", "/api/comment/" + id, true);
    comment.setRequestHeader("content-type", "application/json");
    comment.onreadystatechange = function() {
        if (comment.readyState == 4 && comment.status == 200) {
            appendComment(comment.responseText);
        }
    }
    comment.send();
}

function putComment(task) {

    var comment = new XMLHttpRequest();
    comment.open("PUT", "/api/comment/", true);
    comment.setRequestHeader("content-type", "application/json");
    comment.onreadystatechange = function() {
        if (comment.readyState == 4 && comment.status == 200) {
            console.log("function executed");
        }
    }
    comment.send(JSON.stringify(task));
}
    var $chatbox = $("#chatbox");

function appendComment(comment) {
    modal.style.display = "block";
    console.log(comment);
    $chatbox.append(comment);
}