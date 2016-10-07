var user = JSON.parse(localStorage.getItem('userData'))

var welcome = document.getElementById('welcome')
welcome.textContent = 'Welcome ' + user.name

var taskObj

var socket = io()
var chatModal = document.getElementById('chat')
var chatBox = document.getElementById('chatbox')
var closeChat = document.getElementsByClassName('close')[0]
var addTaskButton = document.getElementById('addTaskButton')

var chattingWith = document.getElementById('otherUser')

function populateUserList (users) {
  var assign = document.getElementById('assignTo')
  for (var i = 0; i < users.length; i++) {
    var option = document.createElement('option')
    option.setAttribute('value', users[i].name)
    option.textContent = users[i].name
    assign.appendChild(option)
  }
  return [users]
}

function populateTasks (userList, taskList) {
  for (var i = taskList.length - 1; i >= 0; i--) {
    if (taskList[i].data.status == true)
      addTaskRow(taskList[i])
  }
  return [userList]
}

function createTask (userList, e) {
  e.preventDefault()
  e.stopPropagation()
  var assignNum
  var selectedName = document.getElementById('assignTo')
  var assignTo = selectedName.options[selectedName.selectedIndex].text
  for (var i = 0; i < userList.length; i++) {
    if (userList[i].name == assignTo) {
      assignNum = userList[i].phone
      break
    }
  }

  var date = document.getElementById('date').value
  var today = new Date()

  if (date == '') {
    date = new Date()
    date = new Date(date.setTime(date.getTime() + 86400000))
    date = date.toJSON().slice(0, 10)
  }

  date = date + 'T00:00:00.000Z'

  var title = document.getElementById('name').value
  if (title === '' || title === '\s' || title === null) {
    window.alert('Task name cannot be empty')
    console.log('empty task')
  }

  return {
    title: document.getElementById('name').value,
    date: date,
    assgnByName: user.name,
    assgnByPhon: user.phone,
    assgnToName: assignTo,
    assgnToPhon: assignNum
  }
}

function addTaskRow (task) {
  var row = document.getElementById('tasks').insertRow()
  var taskname = row.insertCell(0)
  var owner = row.insertCell(1)
  var byDate = row.insertCell(2)
  var done = row.insertCell(3)
  var discuss = row.insertCell(4)
  var trash = row.insertCell(5)

  taskname.innerText = task.data.title
  owner.innerText = task.data.assgnToName
  byDate.innerText = task.data.date.slice(0, 10)

  var iconDone = document.createElement('i')
  iconDone.setAttribute('class', 'small material-icons')
  iconDone.textContent = 'done'

  var donebutton = document.createElement('button')
  donebutton.setAttribute('class', 'button')
  done.appendChild(donebutton)
  donebutton.appendChild(iconDone)

  var iconDiscuss = document.createElement('i')
  iconDiscuss.setAttribute('class', 'small material-icons')
  iconDiscuss.textContent = 'chat_bubble'

  var discussbutton = document.createElement('button')
  discussbutton.setAttribute('class', 'button')
  discuss.appendChild(discussbutton)
  discussbutton.appendChild(iconDiscuss)

  if (user.name === task.data.assgnToName) {
    chattingWith.textContent = task.data.assgnByName
  } else {
    chattingWith.textContent = task.data.assgnToName
  }

  var iconTrash = document.createElement('i')
  iconTrash.setAttribute('class', 'small material-icons')
  iconTrash.textContent = 'delete'

  var trashbutton = document.createElement('button')
  trashbutton.setAttribute('class', 'button')
  trash.appendChild(trashbutton)
  trashbutton.appendChild(iconTrash)

  // event listener for done button
  IO.click(donebutton)
    .bind(function (e) {
      task.data.status = false
      return new IO.postJSON('/api/tasks/', task)
    })
    .then(function (e, res) {
      window.location.reload()
    })
  // event listener for discuss button
  IO.click(discussbutton)
    .map(() => task)
    .bind(function (task) {
      return new IO.getJSON('/api/comment/' + task.id)
    })
    .then(function (task, comments) {
      taskObj = task
      chatModal.style.display = 'block'
      chatBox.textContent = null

      for (var i = 0; i < comments.length; i++) {
        displayComment(comments[i])
      }
    })
  // event listener for trash button
  IO.click(trashbutton)
    .bind(function (e) {
      task.data.deleted = true
      return new IO.postJSON('/api/tasks/', task)
    })
    .then(function (data) {
      window.location.reload()
    })
}

// IO object to handle getting users, tasks, and for adding tasks
IO.getJSON('/api/users/' + user.phone)
  .map(populateUserList)
  .bind(function (userList) { return new IO.getJSON('/api/tasks/' + user.phone) })
  .map(populateTasks)
  .bind(function (userList) { return new IO.click(addTaskButton) })
  .map(createTask)
  .bind(function (newTask) { return new IO.postJSON('/api/tasks', newTask) })
  .then(function (...args) {
    var createdTask = args[1] // createdTask (task object returned from the server)
    socket.emit('newTask', createdTask)
    addTaskRow(createdTask)
  })

// event listener for socket connection
socket.on('connect', function () {
  socket.emit('joinroom', user.name)
})

// sending new task notification
socket.on('notify', function (newTask) {
  alert('you have a new task from  ' + newTask.data.assgnByName)
  addTaskRow(newTask)
})

// recieving message
socket.on('discuss', function (incomingMsg) {
  displayComment(incomingMsg)
})

function createComment () {
  var timestamp = Date().toString().slice(15, 24)
  if (user.name == taskObj.data.assgnToName) {
    var to = taskObj.data.assgnByName
  } else {
    var to = taskObj.data.assgnToName
  }
  return {
    id: taskObj.id,
    comment: {
      sentBy: user.name,
      sentTo: to,
      time: timestamp,
      message: userMsg.value
    }
  }
}

function displayComment (comment) {
  var msgWrapper = document.createElement('div')
  msgWrapper.setAttribute('class', 'msgWrapper')

  var msg = document.createElement('div') // create a new div

  if (comment.sentBy === user.name) {
    msg.setAttribute('class', 'me')
    msg.innerHTML = '<div class="circle-wrapper animated bounceIn">' + comment.sentBy[0] + '</div>' + '<div class="msg-content animated fadeIn"><p class="sentBy">' + comment.message + '</p><p class="time">' + comment.time + '</p></div>'
  } else {
    msg.setAttribute('class', 'them')
    msg.innerHTML = '<div class="circle-wrapper animated bounceIn">' + comment.sentBy[0] + '</div>' + '<div class="msg-content animated fadeIn"><p class="sentBy">' + comment.message + '</p><p class="time">' + comment.time + '</p></div>'
  }
  msgWrapper.appendChild(msg)
  chatBox.appendChild(msgWrapper) // creates new div for msg inside the chatbox
}

// sending messages
var sendButton = document.querySelector('#submitmsg')
var userMsg = document.querySelector('#usermsg')

IO.click(sendButton)
  .map(createComment)
  .bind(function (outGoingMsg) {
    console.log(outGoingMsg)
    return new IO.postJSON('/api/comment/', outGoingMsg)
  })
  .then(function (outGoingMsg, serverResponse) {
    socket.emit('sendmessage', outGoingMsg.comment)
    displayComment(outGoingMsg.comment)
    scrollBottom()
  })

IO.click(closeChat)
  .then(function () {
    chatModal.style.display = 'none'
  })
