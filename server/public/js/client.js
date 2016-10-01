var user = JSON.parse(localStorage.getItem('userData'))

var welcome = document.getElementById('welcome')
welcome.innerText = 'Welcome ' + user.name

var userList = []
var taskList = []
var assignName
var assignNum
var taskObj

var socket = io()
var chatModal = document.getElementById('chat')
var chatBox = document.getElementById('chatbox')
var closeChat = document.getElementsByClassName('close')[0]

closeChat.onclick = function () {
  chatModal.style.display = 'none'
}

IO.getJSON('/api/users/' + user.phone)
  .then(function (users) {
    userList = users
    populateUserList(userList)
  })

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
  IO.getJSON('/api/tasks/' + user.phone)
    .then(function (taskList) {
      addView(taskList)
    })
// 
}

function addView (taskList) {
  for (var i = taskList.length - 1; i >= 0;i--) {
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
  var trash = row.insertCell(5)

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
    .bind(function (e) {
      task.data.status = false
      return new IO.postJSON('/api/tasks/', task)
    })
    .then(function (e, res) {
      window.location.reload()
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
  })
  discuss.appendChild(discussbutton)
  discussbutton.appendChild(iconDiscuss)

  IO.click(discussbutton)
    .bind(function (event) {
      return new IO.getJSON('/api/comment/' + task.id)
    })
    .then(function (event, comments) {
      taskObj = task
      chatModal.style.display = 'block'
      chatBox.innerHTML = null

      for ( var i = 0; i < comments.length; i++) {
        displayComment(comments[i])
      }
    })

  IO.click(sendButton)
    .map(function () {
      var timestamp = Date()
      return {
        'sentBy': user.name,
        'time': timestamp,
        'message': userMsg.value
      }
    })
    .bind(function (outGoingMsg) {
      socket.emit('sendmessage', outGoingMsg)
      displayComment(outGoingMsg)
      return new IO.postJSON('/api/comment/', { 'id': task.id, 'comment': outGoingMsg})
    })
    .then(function (e) { console.log('msg sent')} // add function to post comment
  )

  var iconTrash = document.createElement('i')
  iconTrash.setAttribute('class', 'small material-icons')
  iconTrash.innerHTML = 'delete'

  var trashbutton = document.createElement('button')
  trashbutton.setAttribute('class', 'button')
  trash.appendChild(trashbutton)
  trashbutton.appendChild(iconTrash)

  // event listener for do
  IO.click(trashbutton)
    .bind(function (e) {
      task.data.deleted = true
      return new IO.postJSON('/api/tasks/', task)
    })
    .then(function (data) {
      window.location.reload()
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

// Event Listener to Close Chat Box
closeChat.onclick = function () {
  chatModal.style.display = 'none'
}

// event listener for socket connection
socket.on('connect', function () {
  console.log('connected to server')
  socket.emit('joinroom', user.name)
})

// recieving message

socket.on('discuss', function (incomingMsg) {
  displayComment(incomingMsg)
})

// sending messages
var sendButton = document.querySelector('#submitmsg')
var userMsg = document.querySelector('#usermsg')

// function putComment (task) {
//   var comment = new XMLHttpRequest()
//   comment.open('PUT', '/api/comment/', true)
//   comment.setRequestHeader('content-type', 'application/json')
//   comment.onreadystatechange = function () {
//     if (comment.readyState == 4 && comment.status == 200) {
//       console.log('function executed')
//     }
//   }
//   comment.send(JSON.stringify(task))
// }

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

  IO.postJSON('/api/tasks/', newTask)
    .then(function (e) {
      // window.location.reload()
      // include socket emit
      //   socket.emit('newTask', {
      //     assgnTo: assignName,
      //     from: user.name
      //   })
    })
  window.location.reload()
}
