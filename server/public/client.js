var userdata = localStorage.getItem('userData');
var assignTo;


function getTasks() {
    var http = new XMLHttpRequest();
    http.open("GET", "/api/tasks/"+phone, true);
    
    http.onreadystatechange = function() {
        if (http.readyState == 4 && http.status == 200) {
            console.log(http.responseText)
            response = JSON.parse(http.responseText);
            for (var i = 0; i < response.length; i++) {

                addRow("tasks", response[i].data.title, response[i].data.assgnToName, response[i].data.date, response[i].data.status)
                console.log(response[i].data.title);
                console.log(response[i].data.assgnToName);
            }
        } else {
            console.log("readyState is " + http.readyState);
            console.log("status is " + http.status);
        }
    }
    http.send();
}

function addRow(id, tname, towner, dat, taskid) {
    var row = document.getElementById(id).insertRow();
    var taskname = row.insertCell(0);
    var owner = row.insertCell(1);
    var byDate = row.insertCell(2);
    
    taskname.innerText = tname;
    owner.innerText = towner;
    byDate.innerText = dat;
}


function getUsers() {
    var http = new XMLHttpRequest();
    http.open("GET", "/api/users/" + phone, true);
    http.onreadystatechange = function() {
        if (http.readyState == 4 && http.status == 200) {
            var users = responseText;
            for(var i = 0; i < users.length; i++){
                var list = getElementById('assignTo');
                var option = createElement('option');
                option.setAttribute('value', users[i].name);
                option.innerText = users[i].name;
                list.appendChild(option);
            }
        }
    }
    http.send();
}

function createTask() {
    var task = {
        title: getElementById('name'),
        date: getElementById('date'),
        assgnByName: userdata.name,
        assgnByPhon: userdata.phone,
        assgnToName: getElementById('assignTo').value,
        assgnToPhon: string
    }
}