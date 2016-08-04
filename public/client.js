

var http = new XMLHttpRequest();
http.open("GET", "/tasks", true);
http.onreadystatechange = function() {

	if (http.readyState == 4 && http.status == 200) {
        

        console.log(http.responseText)
        response = JSON.parse(http.responseText);           
        for (var i = 0; i < response.length; i++) {

            addRow("tasks", response[i].name, response[i].owner, response[i].byDate, response[i].id)             
            console.log(response[i].name);
            console.log(response[i].owner);
        }
    }else{
        console.log("readyState is "+http.readyState);
        console.log("status is "+http.status);
    }
}
http.send();

function addRow(id, tname, towner, dat, taskid) {
        var row = document.getElementById(id).insertRow();
        var taskname = row.insertCell(0);
        var owner = row.insertCell(1);
        var byDate = row.insertCell(2);
        var done = row.insertCell(3);
        
        taskname.innerText = tname;
        owner.innerText = towner;
        byDate.innerText = dat;

        var donebutton = document.createElement('button');
        donebutton.innerHTML= 'Done';
        donebutton.setAttribute('class', 'btn btn-info' )
        donebutton.setAttribute('onclick', 'destroyTask('+taskid+')')
        done.appendChild(donebutton)

      }

function destroyTask(id){
    console.log('function called ' + id)
    //var data  = JSON.parse(id);
    var http = new XMLHttpRequest();
    http.open("GET", "/destroy/"+id, true);
    http.onreadystatechange = function() {
        if (http.readyState == 4 && http.status == 200) {
            window.location.reload();
        }
    }
    http.send();
}