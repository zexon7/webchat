var express = require('express');
var app = express();
var serv = require('http').Server(app);//Express initializes app to be a function handler that you can supply to an HTTP server
var io = require('socket.io')(serv);
const port = process.env.PORT || 3000;

app.get('/', function(req,res){//client ask server for data( '/' gets called when client hit website home)
	res.sendFile(__dirname + '/index.html');//server send file to client
});
//app.use('/', express.static(__dirname + '/'));

serv.listen(port);//make http server listen on port 
console.log("Server started");//server reply

var users = [];//users in server

var checklist = function(data){//check if username is already used
	for(var i = 0;i<users.length;i++){
		if(users[i] == data){
			return true;
		}
	}
	return false;
}

io.on('connection', function(socket){//listen on the connection event for incoming sockets
	console.log('new user connected');

	var user = null;

	socket.on('new-user', function(data){
		user = data.username;
		if(checklist(user)){//if name already used return false
			socket.emit('check-list', {success:false});
		}
		else{// add new user into array
			socket.emit('check-list', {success:true});
			users.push(user);
			console.log(user + ' connected');
			console.log(users);
			socket.broadcast.emit('new-user', user + ' connected');
			updateList();
		}
	});

	socket.on('disconnect', function(){// show who left chat
		console.log(user + ' disconnected');
		socket.broadcast.emit('user-left', user + ' disconnected');
		console.log(users);
		users.splice(users.indexOf(user),1);
		updateList();
	});

	socket.on('new-msg', function(msg){
		io.emit('new-msg', '<b>' + user + '</b>'  + ': ' + msg);//send data to all client
  });

	function updateList(){//sent to client to display who's online
		io.emit('update-list', users);
	}

});
