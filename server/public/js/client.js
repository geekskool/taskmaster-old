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
    if (taskList[i].data.deleted == false)
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
  var status = row.insertCell(3)
  var discuss = row.insertCell(4)
  var trash = row.insertCell(5)

  row.setAttribute('id', task.id)

  taskname.innerText = task.data.title
  owner.innerText = task.data.assgnToName
  byDate.innerText = task.data.date.slice(0, 10)

  var statusIcon = document.createElement('i')
  statusIcon.setAttribute('class', 'small material-icons')
  statusIcon.textContent = 'schedule'

  var statusButton = document.createElement('button')
  statusButton.setAttribute('class', 'button')
  status.appendChild(statusButton)
  statusButton.appendChild(statusIcon)

  var iconDiscuss = document.createElement('i')
  iconDiscuss.setAttribute('class', 'small material-icons')
  iconDiscuss.textContent = 'chat_bubble'

  var discussbutton = document.createElement('button')
  discussbutton.setAttribute('class', 'button')
  discuss.appendChild(discussbutton)
  discussbutton.appendChild(iconDiscuss)

  var iconTrash = document.createElement('i')
  iconTrash.setAttribute('class', 'small material-icons')
  iconTrash.textContent = 'delete'

  var trashbutton = document.createElement('button')
  trashbutton.setAttribute('class', 'button')
  trash.appendChild(trashbutton)
  trashbutton.appendChild(iconTrash)

  if (user.name === task.data.assgnByName && user.name === task.data.assgnToName) {
    trashbutton.disabled = false
  } else if (user.name === task.data.assgnToName) {
    trashbutton.disabled = true
  } else {
    trashbutton.disabled = false
  }

  // event listener for done button
  IO.click(statusButton)
    .bind(function (e) {
      task.data.status = false
      return new IO.postJSON('/api/tasks/', task)
    })
    .then(function (e, res) {
      // statusButton.appendChild(statusIcon)
      // statusIcon.textContent = 'schedule'
      // statusButton.appendChild(statusIcon)
    })
  // event listener for discuss button
  IO.click(discussbutton)
    .map(function (e) { console.log(e.path[3].id) // stores the task id
      return task })
    .bind(function (task) {
      return new IO.getJSON('/api/comment/' + task.id)
    })
    .then(function (task, comments) {
      openChatForThis(task)
      renderPrevious(comments)
      scrollToBottom()
    })
    // event listener for trash button
  IO.click(trashbutton)
    .bind(function (e) {
      task.data.deleted = true
      return new IO.postJSON('/api/tasks/', task)
    })
    .then(function (data) {
      var taskToBeDeleted = document.getElementById(task.id)
      taskToBeDeleted.remove()
      socket.emit('deleteTask', task)
    })
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
  for (var i = 0; i < comments.length; i++) {
    displayComment(comments[i])
  }
}
// IO object to handle getting users, tasks, and for adding tasks
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
    socket.emit('newTask', createdTask)
  }
  )

// event listener for socket connection
socket.on('connect', function () {
  socket.emit('joinroom', user.name)
})

// sending new task notification
socket.on('notify', function (newTask) {
  if (newTask.data.assgnByName !== newTask.data.assgnToName) {
    alert('You have a new task from : ' + newTask.data.assgnByName)
  }
  addTaskRow(newTask)
})

// recieving message
socket.on('discuss', function (incomingMsg) {
  if (incomingMsg.id === taskObj.id) {
    displayComment(incomingMsg)
    scrollToBottom()
  } })
// deleting task

socket.on('notifyDeletion', function (deletedTask) {
  if (deletedTask.id === taskObj.id) {
    chatModal.style.display = 'none'
  }
  alert('Taskmaster ' + deletedTask.taskmaster + ' has deleted the task')
  var deletedTaskRow = document.getElementById(deletedTask.id)
  deletedTaskRow.remove()
})

function createComment (e) {
  console.log(e)
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
