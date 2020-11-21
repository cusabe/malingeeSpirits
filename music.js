 
function preloadMusicSFX() {
  didj = loadSound('assets/Didgeridoo-music-165kbps.mp3');

  growl[0] = loadSound('assets/growl1.mp3');
  growl[1] = loadSound('assets/growl2.mp3');
  growl[2] = loadSound('assets/growl3.mp3');
}


function setupMusic() {
  userStartAudio();
  didj.play();
  metronome = new Metronome();
  
}

function drawMusicControllers() {
  // music controllers
  metronome.update();
  metronome.display();

}

class Metronome {
  static startTime = 1000; //start after 1000 milliseconds
  static bpm = 120; //beats per minute
  static beatTime = 60000/Metronome.bpm;  //milliseconds per beat
  static tickTime = Metronome.beatTime/120; //milliseconds per tick

  constructor() {
    this.bar = 0;
    this.beat = 0;
    this.tick = 0;
    this.tx = 0;
  }
  
  update() {
    this.tx = floor((millis()-Metronome.startTime)/Metronome.beatTime*120);
    this.bar = floor(this.tx / (4*120)) + 1;
    this.beat = floor((this.tx / 120) % 4) + 1;
    this.tick = floor(this.tx % 120);
  }
  
  display() {
    push();
      textSize(10);
      noStroke();
      fill(0,0,100);
      translate(width*(1/8),height*(7/8));
      textAlign(LEFT);
      text('Seconds running:' + floor(millis())/1000, 0, 0);
      text('Ticks:' + this.tx, 0, 15);    
      text('Metronome:' + this.bar + ':' + this.beat + ':' + this.tick, 0, 30);
      text('FrameRate:' + floor(frameRate()),0,45);
      text('KeyCode:' + keyCode,0,60);
    pop();
  }
}

