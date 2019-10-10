var socket
socket = io();
function set(file){
	var sketch = function(p){
		let img;
		var graph;
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
			rects = [];
			links = [];
			flag = false;
			flag1 = false;
			changed = true;
			window.socket.on('mouse',p.newdrawing);
			cnv = p.createCanvas(img.width, img.height);
			graph = p.createGraphics(img.width,img.height);
			cnv.mousePressed(p.mousepres);
			cnv.mouseReleased(p.mouseRel);
			p.centerCanvas();			
			socket.on('main_point',(data)=>{
				var i;
				for(i=0;i<data.length;i++){
					p.newdrawing(data[i]);
				}
				changed=true;
			});
			socket.on('main_links',(data)=>{
				links = data;
				console.log(links);
			});
			socket.on('links',(data)=>{
				links.push(data);
				console.log(data);
			});
			socket.on('popit',()=>{
				if(rects.length>0){
					rects.pop();
					links.pop();
					graph.clear();
					changed=true;
				}
			});
			socket.emit("load_done1");
		}
		p.windowResized = function(){
			p.centerCanvas();
		}
		p.draw = function(){
			if(changed){
				p.background(img);
				graph.strokeWeight(3);
				graph.noFill();
				for(var i=0;i<rects.length;i++){
					let c = p.get(rects[i][0],rects[i][1]);
					graph.stroke(255-c[0]);
					graph.rect(rects[i][0],rects[i][1],rects[i][2],rects[i][3]);
				}
				p.image(graph,0,0);
				changed=false;
			}
		}
		p.mousepres = function(){
			if(flag==false){
				rects.push([p.mouseX,p.mouseY,0,0]);
				flag=true;
			}
		}
		p.mouseDragged = function(){
			if(flag==true){
				graph.clear();
				var ind = rects.length-1;
				rects[ind][2]=p.mouseX-rects[ind][0];
				rects[ind][3]=p.mouseY-rects[ind][1];
				changed=true;
			}
		}
		p.mouseRel = function(){
			console.log("lengths",rects.length,links.length);
			if(flag1==false && rects.length>links.length){
				flag1=true;
				p.modal();
			}
		}
		p.modal = function(){
			$("#myModal").modal();
			document.getElementById('save_modal').onclick = function(){
				var valu = document.getElementById("input_modal").value;
				flag=false;
				var ind = rects.length-1;
				console.log(valu);
				links.push(valu);
				$("#input_modal").val("");
				socket.emit('mouse',rects[ind]);
				socket.emit('links',valu);
				flag1=false;
				$("#myModal").modal("hide");
				changed=true;
			}
			document.getElementById('close_modal').onclick = function(){
				$("#myModal").modal("hide");
				rects.pop();
				graph.clear();
				flag1=false;
			}
		}
		p.keyTyped = function(){
			if(document.getElementById("myModal").style.display=="block"){
				$('#input_modal').val($('#input_modal').val()+p.key);
			}
			const k = p.keyCode;
			if(k==26){
				rects.pop();
				links.pop();
				graph.clear();
				socket.emit('popit');
				changed=true;
			}
			if(k==32){
				var preview = '<div id="imgdiv" style="position:absolute;">\n\t<img id="img1">\n'
				for(var i=0;i<rects.length;i++){
					var sub_map = '\t\t<a href="'+links[i]+'" target="_blank"><div class="maps" id="map'+i+'" style="position:absolute;left:'+rects[i][0]+'px;top:'+rects[i][1]+'px;height:'+rects[i][3]+'px;width:'+rects[i][2]+'px;"'+' id=mapdiv"'+i+'"'+'></div></a>\n';
					preview = preview.concat(sub_map);
				}
				preview = preview.concat("\t</div>\n");
				console.log(preview);
				$('#imgdiv').remove();
				$('#myModal1').prepend(preview);
				$('#img1').prop('src',file.data);
				$('#img1').prop('height',img.height);
				$('#img1').prop('width',img.width);
				$('.maps').hover(function(e){
					$(this).css("border","1px solid red");
				},function(e){
					$(this).css("border","0px");
				});
				$('#myModal1').modal('show');
				$('#close1').on('click',()=>{
					$('#myModal1').modal('hide');
				});
				var x = ($(document).width() - img.width) / 2;
				var y = ($(document).height() - img.height) / 2;
				$('#imgdiv').css("left",Math.max(x,0)+"px");
				$('#imgdiv').css("top",Math.max(y,0)+"px");
				$(window).resize(function(){
					var x = ($(document).width() - img.width) / 2;
					var y = ($(document).height() - img.height) / 2;
					$('#imgdiv').css("left",Math.max(x,0)+"px");
					$('#imgdiv').css("top",Math.max(y,0)+"px");
				});

			}
			return false;
		}
		p.newdrawing = function(data){
			graph.rect(data[0],data[1],data[2],data[3]);
			rects.push(data);
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
			var fileSelect = p.createFileInput(p.gotFile);
			fileSelect.parent("ini");
			socket.on('main',(data)=>{
				var load_ = document.getElementById("page-wrapper");
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
