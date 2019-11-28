let express = require('express');
let app = express();
let host = 4000
let server = app.listen(host)
//Storing the latest image in img_cache
const img_cache = [];
const point_cache = [];
const links = [];
//storing the id of the person who added the image
var connect_id=undefined;
app.use(express.static('public'));
console.log("Socket server is running on localhost:" + host)

let socket = require('socket.io')
let io = socket(server);
io.sockets.on('connection', newConnection)
function newConnection(socket){
	socket.on('mouse', mouseMsg);
	socket.on('load_done',()=>{
	
		if(img_cache.length>0){
			socket.emit('main',img_cache[0]);
		}
	});
	socket.on('load_done1',()=>{
		if(point_cache.length>0){
			socket.emit('main_point',point_cache);
			socket.emit('main_links',links);
		}

	});
	socket.on('popit',()=>{
		if(point_cache.length>0){
			point_cache.pop();
			links.pop();
			socket.broadcast.emit('popit');
		}
	});

	socket.on('disconnect',()=>{
		if(socket.id===connect_id){
			socket.broadcast.emit('revamp');
			img_cache.pop();
			while(point_cache.length>0){
				point_cache.pop();
				links.pop();
			}
		}
	});
	function mouseMsg(data) {
		socket.broadcast.emit('mouse', data);
		point_cache.push(data);
	}
	socket.on('links',(data)=>{
		socket.broadcast.emit('links',data);
		links.push(data);
	});
	socket.on('main',mainimg);

	function mainimg(data){
		img_cache.pop();
		while(point_cache.length>0){
			point_cache.pop();
			links.pop();
		}
		img_cache.push(data);
		connect_id = socket.id;
		socket.broadcast.emit('main',img_cache[0]);
	}
}
