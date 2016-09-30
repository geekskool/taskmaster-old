var user = JSON.parse(localStorage.getItem('userData'))

var welcome = document.getElementById('welcome')
welcome.innerText = 'Welcome ' + user.name

var userList = []
var taskList = []
var assignName
var assignNum
var taskObj

var socket = io()
var chatModal = document.getElementById('chat') // chat modal
var chatBox = document.getElementById('chatbox') // chat bos
var closeChat = document.getElementsByClassName('close')[0] // close button

// var modal = document.getElementById('myModal')

// window.onload = function () {
closeChat.onclick = function () {
  chatModal.style.display = 'none'
}
// }

// Execution starts from here
/* IO to get other users who can be assigned tasks by the currently logged in
   user */
IO.getJSON('/api/users/' + user.phone)
  .then(function (users) {
    userList = users
    populateUserList(userList)
  })

// function to fetch the list of users and render it in the HTML list
function populateUserList () {
  var assign = document.getElementById('assignTo')
  for (var i = 0; i < userList.length; i++) {
    var option = document.createElement('option')
    option.setAttribute('value', userList[i].name)
    option.innerText = userList[i].name
    assign.appendChild(option)
  }
  getTasks()
}

function getTasks () {
  // IO to fetch the tasks object of a user
  IO.getJSON('/api/tasks/' + user.phone)
    .then(function (taskList) {
      addView(taskList)
    })
}

function addView (taskList) {
  for (var i = 0; i < taskList.length; i++) {
    if (taskList[i].data.status == true)
      addRow(taskList[i])
  }
}

function addRow (task) {
  var row = document.getElementById('tasks').insertRow()
  var taskname = row.insertCell(0)
  var owner = row.insertCell(1)
  var byDate = row.insertCell(2)
  var done = row.insertCell(3)
  var discuss = row.insertCell(4)

  taskname.innerText = task.data.title
  owner.innerText = task.data.assgnToName
  byDate.innerText = task.data.date.slice(0, 10)

  var iconDone = document.createElement('i')
  iconDone.setAttribute('class', 'small material-icons')
  iconDone.innerHTML = 'done'

  var donebutton = document.createElement('button')
  donebutton.setAttribute('class', 'button')
  done.appendChild(donebutton)
  donebutton.appendChild(iconDone)
  // event istener for do
  IO.click(donebutton)
    .then(function (e) {
      deleteTask(task)
    })

  var iconDiscuss = document.createElement('i')
  iconDiscuss.setAttribute('class', 'small material-icons')
  iconDiscuss.innerHTML = 'chat_bubble'

  var discussbutton = document.createElement('button')
  discussbutton.setAttribute('class', 'button')
  discussbutton.addEventListener('click', function () {
    chatModal.style.display = 'block' // display chat modal
    chatBox.innerHTML = null
    taskObj = task
  // getComment(task)
  })
  discuss.appendChild(discussbutton)
  discussbutton.appendChild(iconDiscuss)

  // code to get chat box
  IO.click(discussbutton)
    .bind(function (event) {
      return new IO.getJSON('/api/comment/' + task.id)
    })
    .then(function (event, comments) {
      chatModal.style.display = 'block' // display chat modal
      chatBox.innerHTML = null

      taskObj = task

      for ( var i = 0; i < comments.length; i++) // render previous comments
      {
        displayComment(comments[i])
      }
    })
}

function displayComment (comment) {
  var msg = document.createElement('div') // create a new div
  msg.innerHTML = comment.sentBy + ' ' + comment.time + ' ' + comment.message

  if (comment.sentBy === user.name) {
    msg.setAttribute('class', 'self')
  } else {
    msg.setAttribute('class', 'other')
  }
  chatBox.appendChild(msg) // creates new div for msg inside the chatbox
}

function deleteTask (task) {
  task.data.status = false

  var update = new XMLHttpRequest()
  update.open('PUT', '/api/tasks/', true)
  update.setRequestHeader('content-type', 'application/json')
  update.onreadystatechange = function () {
    if (update.readyState == 4 && update.status == 200) {
      getTasks()
      location.reload(true)
    }
  }
  update.send(JSON.stringify(task))
}

// function getComment (task) {
//   var id = task.id

//   httpGet('/api/comment/' + id, function (rt) {
//     appendComment(rt)
//   })
// }

function putComment (task) {
  var comment = new XMLHttpRequest()
  comment.open('PUT', '/api/comment/', true)
  comment.setRequestHeader('content-type', 'application/json')
  comment.onreadystatechange = function () {
    if (comment.readyState == 4 && comment.status == 200) {
      console.log('function executed')
    }
  }
  comment.send(JSON.stringify(task))
}
var $chatbox = $('#chatbox')

function appendComment (comment) {
  chatModal.style.display = 'block'
  console.log(comment)
  $chatbox.append(comment)
}

function assignTo () {
  selectName = document.getElementById('assignTo')
  assignName = selectName.options[selectName.selectedIndex].text
  for (var i = 0; i < userList.length; i++) {
    if (userList[i].name == assignName) {
      assignNum = userList[i].phone
      break
    }
  }
}

function createTask () {
  assignTo()
  var date = document.getElementById('date').value
  var today = new Date

  if (date == '') {
    date = new Date
    date = new Date(date.setTime(date.getTime() + 86400000))
    date = date.toJSON().slice(0, 10)
  }

  date = date + 'T00:00:00.000Z'

  var title = document.getElementById('name').value
  if (title === '' || title === '\s' || title === null) {
    window.alert('Task name cannot be empty')
    console.log('empty task')
  }

  var newTask = {
    title: document.getElementById('name').value,
    date: date,
    assgnByName: user.name,
    assgnByPhon: user.phone,
    assgnToName: assignName,
    assgnToPhon: assignNum
  }
  httpPost('/api/tasks/', newTask, function (rt) {
    window.location.reload()
    socket.emit('newTask', {
      assgnTo: assignName,
      from: user.name
    })
  })
}

jQuery(function ($) {
  var $chatbox = $('#chatbox')
  var $msg = $('#usermsg')
  var $form = $('#sendMsg')
  var userTo
  $form.submit(function (e) {
    e.preventDefault()
    if (user.name == taskObj.data.assgnToName) {
      userTo = taskObj.data.assgnByName
    } else {
      userTo = taskObj.data.assgnToName
    }

    $chatbox.append('<div class="self"><b>' + user.name + '</b>' + ': ' + $msg.val() + '</div>')

    taskObj.data.comments = '<b>' + user.name + '</b>' + ': ' + $msg.val() + '<br>'

    socket.emit('sendmessage', { msg: $msg.val(), to: userTo })
    putComment(taskObj)

    console.log(`${taskObj.data.assgnToName} <--name`)
    console.log(taskObj)

    $msg.val(' ')
  })

  socket.on('discuss', function (data) {
    console.log(`${data} <--discuss on event`)
    $chatbox.append('<div class="other"><b>' + data.name + '</b>' + ': ' + data.msg + '</div>')
  })
})

socket.on('connect', function () {
  console.log('connected to server')
  socket.emit('joinroom', user.name)
})

socket.on('notify', function (data) {
  alert('you have a new task from  ' + data)
})

function httpRequest (method, url, callback) {
  console.log('inside httpRequest')
  var request = new XMLHttpRequest()
  request.open(method, url, true)
  request.setRequestHeader('content-type', 'application/json')
  request.onreadystatechange = function () {
    if (request.readyState == 4 && request.status == 200) {
      console.log(request)
      callback(request)
    }
  }
  return request
}

function httpGet (url, callback) {
  var request = httpRequest('GET', url, function (request) {
    callback(request.responseText)
  })
  request.send()
}

function httpPost (url, body, callback) {
  var request = httpRequest('POST', url, function (request) {
    console.log('inside httpPost')
    callback(request)
  })
  console.log(request)
  request.send(JSON.stringify(body))
}

// function httpGetJSON (url, callback) {
//   httpGet(url, callback)
// }

// httpGetJSON('https://api.github.com/', function (responseText) {
//   console.log(JSON.parse(responseText))
// })
