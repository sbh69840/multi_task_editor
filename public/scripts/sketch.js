var socket
var cnv;
var cnv1;
socket = io();
function set(file){
	var sketch = function(p){
		let img;
		var start_draw=false;
		p.preload = function(){
			img = p.loadImage(file.data);
		}

		p.centerCanvas = function(){
			var x = (p.windowWidth - p.width) / 2;
			var y = (p.windowHeight - p.height) / 2;
			window.cnv.position(Math.max(x,0), Math.max(y,0));
		}
		p.myinput = function(){
			console.log("Entering: ",this.value());
		}
		p.createInp = function(){
			var input = p.createInput('');
			input.position()
			var button = p.createButton('link');
			button.position(input.x + input.width);
			button.mousePressed();
		}
		p.setup = function(){
			window.socket.on('mouse',p.newdrawing);
			window.cnv = p.createCanvas(img.width, img.height);
			p.centerCanvas();
			p.background(img);
			socket.on('main_point',(data)=>{
				var i;
				for(i=0;i<data.length;i++){
					p.newdrawing(data[i]);
				}
			});
			socket.emit("load_done1");
		}
		p.windowResized = function(){
			p.centerCanvas();
		}
		p.draw = function(){
			p.stroke(0);
			p.strokeWeight(3);
			if(p.mouseIsPressed==true){
				let data = {
					x:p.mouseX,
					y:p.mouseY,
					x_:p.pmouseX,
					y_:p.pmouseY
				}
				window.socket.emit('mouse',data);
				console.log('sending: ',p.mouseX+',',p.mouseY+','+',',p.pmouseX+',',p.pmouseY);
				p.line(p.mouseX,p.mouseY,p.pmouseX,p.pmouseY);
			}
		}
		p.keyTyped = function(){
			console.log("Key pressed");
			if(p.key==='a'){
				p.clear();
			}
		}
		p.newdrawing = function(data){
			p.line(data.x,data.y,data.x_,data.y_);
		}

	}
	var myp5 = new p5(sketch);
			
}

window.onload = function(){

	var sketch = function(p){
		p.gotFile = function(file){
			if (file.type === 'image') {
				var load_ = document.getElementById("page-wrapper");
				load_.style.display="none";
				let data = {
					file_sub:file
				}
				window.socket.emit('main',data);
				set(file);
			}else if(file.type==='text') {
				console.log("It's not a image");
			}
		}
		p.setup = function(){
			console.log("Inside setup");
			var fileSelect = p.createFileInput(p.gotFile);
			fileSelect.parent("ini");
			socket.on('main',(data)=>{
				console.log("About to revamp your experience");
				var load_ = document.getElementById("page-wrapper");
				console.log("Inside load image");
				load_.style.display="none";
				var canva =document.getElementById("defaultCanvas0");
				if(canva){
					canva.remove();
				} 
				set(data.file_sub);
			});

			socket.on('revamp',()=>{
				var load_ = document.getElementById("page-wrapper");
				load_.style.display="block";
				document.getElementById("defaultCanvas0").remove();
			});
			socket.emit("load_done");
		}
	}
	var sk = new p5(sketch);
}
