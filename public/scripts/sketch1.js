
function setup() {
    img = loadImage('workplace.jpg')
    createCanvas(720, 400);
    background(img);
    // noStroke();
    frameRate(1);
    // noLoop();
  }
  
  function draw() {
    background(img);
  }
  function mousePressed(){
      bg = random(0,255)
      background(bg);
  }
  
  function drawTarget(xloc, yloc, size, num) {
    const grayvalues = num;
    const steps = size / num;
    for (let i = 0; i < num; i++) {
      fill((i * grayvalues)%255);
      ellipse(xloc, yloc, size - i * steps, size - i * steps);
    }
  }
  