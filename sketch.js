// Define screen objects
var field, spirits, rain;

// Define sounds
var didj;
var growl = [];

// Define timing measures
var metronome;


function preload() {
  // load any assets (images, sounds, etc.) here
  preloadMusicSFX();
}

function setup() {
  createCanvas(windowWidth,windowHeight);
  colorMode(HSB, 100);
  textFont('Syne Mono');  // a google font
  textSize(50);
  textAlign(CENTER);
  frameRate(50);

  // Start didjeridu, metronome and instruments
  setupMusic();

  // Set up field objects
  field = new Field();
  spirits = new Spirits();
  rain = new Rain();

}

function draw() {
  // add your draw code here
  

  push();
    // rock the boat (rock the field from the boat point of view)
    field.rock();
    translate(0,-0.8*(field.boatRock));
    background(0);

    // draw reflection of field and characters in the bottom half first
    push();
      translate(0,height);
      scale(1.0,-1,0);
      field.draw();
      spirits.draw(1); // intensify colour in reflection

      // darken the reflection with a half-transparent black box
      noStroke();
      fill(62,50,20,50);
      rect(0,-0.1*height,width,0.6*height);
    
    pop();


    // draw field and characters in the top half
    field.draw();
    spirits.draw(0);
    rain.draw();
    
    // run animations for objects that have them
    spirits.run();
    if (field.twilight > 0) {
      field.darken();
    }
    rain.run();

  pop();


  //drawMusicControllers();

}

