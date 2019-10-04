let express = require('express');
let app = express();
let host = 4000
let server = app.listen(host)
//Storing the latest image in img_cache
const img_cache = [];
const point_cache = [];
//storing the id of the person who added the image
var connect_id=undefined;
app.use(express.static('public'));

console.log("Socket server is running on localhost:" + host)

let socket = require('socket.io')
let io = socket(server);
io.sockets.on('connection', newConnection)

function newConnection(socket){
	console.log("conn: ",socket.id);
	socket.on('mouse', mouseMsg);
	socket.on('load_done',()=>{
		
		if(img_cache.length>0){
			socket.emit('main',img_cache[0]);
			
			console.log("sent");
		}
	});
	socket.on('load_done1',()=>{
		if(point_cache.length>0){
			console.log("sending points");
			socket.emit('main_point',point_cache);
		}
	});
	socket.on('disconnect',()=>{
		console.log(socket.id,"got disconnected");
		if(socket.id===connect_id){
			socket.broadcast.emit('revamp');
			img_cache.pop();
			while(point_cache.length>0){
				point_cache.pop();
			}
			console.log(socket.id,"disconnected");
		}
	});
	function mouseMsg(data) {
		socket.broadcast.emit('mouse', data);
		point_cache.push(data);
		console.log(data);
	}
	socket.on('main',mainimg);

	function mainimg(data){
		console.log("In server");
		img_cache.pop();
		while(point_cache.length>0){
			point_cache.pop();
		}
		img_cache.push(data);
		connect_id = socket.id;
		console.log(connect_id,"the person who changed the image");
		socket.broadcast.emit('main',img_cache[0]);
	}
}
