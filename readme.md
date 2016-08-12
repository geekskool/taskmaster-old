# ToDo app

This is a ToDo app with basic functionality of adding and deleting tasks.
The api is a basic REST api and can be used by AJAX calls. [Click here for a concise version of API.](https://docs.google.com/spreadsheets/d/15pkfvS9Nc6Sg1x8vCqNCdvwCvts95EDI3ZHvJL12r4Q/view#gid=0)

For the app to work initially, clone it from [github repository](https://github.com/sankalp0o/todo-app-backend) and do an `npm install` in the main directory and another `npm install` inside graphology directory as well.

This documentation is divided into following parts:

1. Authentication
2. Validation
3. Creating new user
4. Getting lists of users
5. Getting lists of tasks for a specified user
6. Creating new task
7. Updating tasks


Authentication
---

The user is Authenticated by using passwordless from auth0. Once the user logs in to the site he is presented with the authentication dialogue box from auth0. The dialogue box takes a phone number and send an OTP to user. Once the users enters the OTP, an access token is send to the application which sends the userdata back to the client.

To implement the dialogue box, please go through the tutorial given on the auth0 website.


Validation
---

Once the client gets the data from the auth0 website, it sends the phone number and access token to the server for the validation. The client will create an object with phone number and access token and make a `POST` request to server on `/api/validate` url.

```
{
 	phone: string,
 	accessToken: string
}
```
**IMPORTANT - For all the requests made from a web client, the `content-type` should be explicitly set to `application/json`.**


Upon receiving the request, the server will send a response object in the following format.
```
{
	name: string,
	phone: string
}
```


Creating a new user
---

The client will verify if a user exists with the given name (the client can verify this by checking is the user.name string is an empty string or null). In case a user does not exist, the client will create a user and send the user object to server. The client will make a `POST` request on the `/api/users` url. The request will contain a user object in the following format. 
```
{
	name: string,
	phonenm: string
}
```
After a user has been created the client will proceed to the tasks page for further operations.


Getting a list of users
---

In case a user already exists in the database, the client will proceed to tasks page for further operations. 
One of the first operations we need to do on the task page is to build the contact list. To build the contact list we need to fetch all the users from our database. To accomplish this, the client will make a `GET` request at `/api/users/:phone` url. (`:phone` is the phone number of the user who is logged in).

Upon receiveing the `GET` request, the server will respond with an array of objects containing the user data.
Here is responseText received by the client - 
```
[{
 	name: string,
 	phone: string
 }, …]
```
It is upto the client, how he wants to display the contact list.


Getting a list of tasks for the user
---

Once we have the list of users. Our next job is to get all the tasks assigned to/by the user. 
To get a list of tasks we need to send a `GET` request at `/api/tasks/:phone` url. Upon receiving the request the server will send an array of objects as response. The format of the response object is given below -

```
[{ id: string, 
	data: {
        title: string,
        date: string,
        status: boolean,
        assgnByName: string,
        assgnByPhon: string,
        assgnToName: string,
        assgnToPhon: string,
        comments: string
    }
 }, …]
```

The client can choose how to display the tasks.


Creating a new task
---

To create a new task we need to make a `POST` request to the `/api/tasks` url. For this we need to send a new task object to the server with the details of the task. The format of the task object will be - 
```
{
	title: string,
	date: string,
	assgnByName: string,
	assgnByPhon: string,
	assgnToName: string,
	assgnToPhon: string
 }
```
Once the object is sent to the server the server, server will create a new database entry and respod with status 200.


Updating tasks
---

Once a task is completed we need to mark the status as done. For this purpose client will set the status value of the task obejct to false and send the task to server.  To update the task the client will make a `PUT` request to the `/api/tasks` url. The format of the task object will be - 
```
{ id: string, 
	data: {
        title: string,
        date: string,
        status: boolean,
        assgnByName: string,
        assgnByPhon: string,
        assgnToName: string,
        assgnToPhon: string,
        comments: string
    }
}
```
Once the task is updated you can chose to remove it fromt he client view.

# That's all folks
