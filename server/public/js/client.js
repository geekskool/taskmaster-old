var user = JSON.parse(localStorage.getItem('userData'))
var welcome = document.getElementById('welcome')
welcome.textContent = 'Welcome ' + user.name

var taskObj

var socket = io()
var addTaskButton = document.getElementById('addTaskButton')
var chatModal = document.getElementById('chat')
var chatBox = document.getElementById('chatbox')
var closeChat = document.getElementsByClassName('close')[0]
var chattingWith = document.getElementById('otherUser')
var assigneeList = document.getElementById('assignTo')

function populateUserList (users) {
  users.map(function (user) {
    var assigneeOption = document.createElement('option')
    assigneeOption.setAttribute('value', user.name)
    assigneeOption.textContent = user.name
    assigneeList.appendChild(assigneeOption)
  })
  return [users]
}

function populateTasks (userList, taskList) {
  taskList = taskList.filter(function (task) {
    return task.data.deleted === false && task.data.status === false
  }).map(addTaskRow)
  return [userList]
}

function createTask (userList, e) {
  e.preventDefault()
  e.stopPropagation()
  return {
    title: getTaskTitle(),
    date: getDeadline(),
    assgnByName: user.name,
    assgnByPhon: user.phone,
    assgnToName: document.getElementById('assignTo').value,
    assgnToPhon: userList.filter(function (user) { user.name === assignTo })[0]
  }
}

function getTaskTitle () {
  var title = document.getElementById('name').value
  if (title === '' || title === '\s' || title === null) {
    window.alert('Task name cannot be empty')
    console.log('empty task')
  }
  return title
}

function getDeadline () {
  var date = document.getElementById('date').value
  var today = new Date()
  if (date == '') {
    date = new Date()
    date = new Date(date.setTime(date.getTime() + 86400000))
    date = date.toJSON().slice(0, 10)
  }
  date = date + 'T00:00:00.000Z'
  return date
}

function createButtonFor (field, iconName) {
  var icon = document.createElement('i')
  icon.setAttribute('class', 'small material-icons')
  icon.textContent = iconName
  var button = document.createElement('button')
  button.setAttribute('class', 'btn-flat')
  field.appendChild(button)
  button.appendChild(icon)
  return button
}

function disableForAssignee (button, task) {
  if (!(task.data.assgnByName === task.data.assgnToName) && user.name === task.data.assgnToName) {
    button.disabled = true
    button.setAttribute('class', 'btn-flat disabled')
  }
}

function addTaskRow (task) {
  var row = document.getElementById('tasks').insertRow()
  row.setAttribute('id', task.id)
  row.insertCell(0).innerText = task.data.title
  row.insertCell(1).innerText = task.data.assgnToName === user.name ? 'Me' : task.data.assgnToName
  row.insertCell(2).innerText = task.data.assgnByName === user.name ? 'Me' : task.data.assgnByName
  row.insertCell(3).innerText = task.data.date.slice(0, 10)
  var status = row.insertCell(4)
  var discuss = row.insertCell(5)
  var trash = row.insertCell(6)

  var statusButton = createButtonFor(status, 'schedule')
  var discussButton = createButtonFor(discuss, 'chat_bubble')
  var trashButton = createButtonFor(trash, 'delete')

  disableForAssignee(trashButton, task)

  IO.click(statusButton)
    .bind(function (task) {
      task.data.status = false
      return new IO.postJSON('/api/tasks/', task) })
    .then(function (e, res) {
      console.log('I have been clicked') })

  IO.click(discussButton)
    .map(function (e) { return task }) // console.log(e.path[3].id) // stores the task id
    .bind(function (task) { return new IO.getJSON('/api/comment/' + task.id) })
    .then(function (task, comments) {
      openChatForThis(task)
      renderPrevious(comments)
      scrollToBottom()
    })

  IO.click(trashButton)
    .bind(function (e) {
      task.data.deleted = true
      return new IO.postJSON('/api/tasks/', task) })
    .then(function (data) {
      var taskToBeDeleted = document.getElementById(task.id)
      taskToBeDeleted.remove()
      socket.emit('deleteTask', task) })
}

function openChatForThis (task) {
  taskObj = task
  if (user.name === task.data.assgnByName && user.name === task.data.assgnToName) {
    chattingWith.innerText = 'You'
  } else if (user.name === task.data.assgnToName) {
    chattingWith.innerText = task.data.assgnByName
  } else {
    chattingWith.innerText = task.data.assgnToName
  }
  chatModal.style.display = 'block'
  chatBox.textContent = null
}

function renderPrevious (comments) {
  comments.map(displayComment)
}

IO.getJSON('/api/users/' + user.phone)
  .map(populateUserList)
  .bind(function (userList) { return new IO.getJSON('/api/tasks/' + user.phone) })
  .map(populateTasks)
  .bind(function (userList) { return new IO.click(addTaskButton) })
  .map(createTask)
  .bind(function (newTask) { return new IO.postJSON('/api/tasks', newTask) })
  .map(function (newTask, createdTask) { return createdTask })
  .then(function (createdTask) {
    addTaskRow(createdTask)
    socket.emit('newTask', createdTask) })

socket.on('connect', function () {
  socket.emit('joinroom', user.name)
})

socket.on('notify', function (newTask) {
  if (newTask.data.assgnByName !== newTask.data.assgnToName) {
    alert('You have a new task from : ' + newTask.data.assgnByName)
    addTaskRow(newTask)
  }
})

socket.on('discuss', function (incomingMsg) {
  if (incomingMsg.id === taskObj.id) {
    displayComment(incomingMsg)
    scrollToBottom()
  } })

socket.on('notifyDeletion', function (deletedTask) {
  if (chatModal.style.display === 'block' && deletedTask.id === taskObj.id) {
    chatModal.style.display = 'none'
  }
  alert('Taskmaster ' + deletedTask.taskmaster + ' has deleted the task')
  var deletedTaskRow = document.getElementById(deletedTask.id)
  deletedTaskRow.remove()
})

function createComment () {
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
      time: Date().toString().slice(15, 24),
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

function scrollToBottom () {
  chatBox.scrollTop = chatBox.scrollHeight
}

IO.click(sendButton)
  .map(createComment)
  .bind(function (outGoingMsg) {
    console.log(outGoingMsg)
    return new IO.postJSON('/api/comment/', outGoingMsg)
  })
  .then(function (outGoingMsg, serverResponse) {
    socket.emit('sendmessage', outGoingMsg)
    displayComment(outGoingMsg.comment)
    userMsg.value = '' // clear text area after sending message
    scrollToBottom()
  })

IO.click(closeChat)
  .then(function () {
    chatModal.style.display = 'none'
  })
