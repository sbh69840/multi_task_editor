var socket
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
			cnv.position(Math.max(x,0), Math.max(y,0));
			graph.position(Math.max(x,0), Math.max(y,0));
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
			cnv = p.createCanvas(img.width, img.height);
			p.pixelDensity(1);
			graph = p.createGraphics(img.width,img.height);
			p.centerCanvas();			
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
			p.background(img);
			graph.stroke(0);
			graph.strokeWeight(3);
			if(p.mouseIsPressed==true){
				let data = {
					x:p.mouseX,
					y:p.mouseY,
					x_:p.pmouseX,
					y_:p.pmouseY
				}
				window.socket.emit('mouse',data);
				console.log('sending: ',p.mouseX+',',p.mouseY+','+',',p.pmouseX+',',p.pmouseY);
				graph.line(p.mouseX,p.mouseY,p.pmouseX,p.pmouseY);

			}
			p.image(graph,0,0);
		}
		p.keyTyped = function(){
			if(p.key==='a'){
				console.log("Key pressed");
				graph.clear();
			}
		}
		p.newdrawing = function(data){
			graph.line(data.x,data.y,data.x_,data.y_);
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
