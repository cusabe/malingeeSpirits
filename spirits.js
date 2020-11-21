class Spirits {
    static firstSpiritFrames = 150;
    static nextSpiritFrames = 500;

  constructor () {
    // Keep track of which letters have spawned so far, with an array of Boolean
    this.letterShed = [];
    for(let i=0; i < 26; i++) {
      this.letterShed.push(false);
    }
    // Start an array to hold the spirits;
    this.spiritArray = [];

    // How many frames until next spirit spawns
    this.nextSpawn = random(Spirits.firstSpiritFrames*(2/3),Spirits.firstSpiritFrames*(4/3));
  }
  
  addSpirit(letterIndex) {
    // Spirit will only spawn if it did not already exist
    let spirit = new Spirit(letterIndex,random(0,width),random(0,height/2),random(100));
    this.spiritArray.push(spirit);
  }

  addRandomSpirit () {
    let letterIndex = floor(random(26));
    if (!this.letterShed[letterIndex]) {
        this.addSpirit(letterIndex);
    }
  }

  playSpirit(letterIndex) {
    // Create the spirit for that letter if it doesnt exist
    if (!this.letterShed[letterIndex]) {
        this.addSpirit(letterIndex);
    } else {
        let indexInArray;
    // but if it does exist already then "play" the spirit
        for (let i = 0; i < this.spiritArray.length; i++){
            if (this.spiritArray[i].letterIndex == letterIndex)
            indexInArray = i;
        }    
        this.spiritArray[indexInArray].spinning=true;
        this.spiritArray[indexInArray].stopSpin = 25;
        this.spiritArray[indexInArray].opacity = 100;
        growl[this.spiritArray[indexInArray].growl].play();
    }
    field.boatVel+=random(-0.5,0.5);
  }

  draw (ref) {
    for (let i=0; i < this.spiritArray.length; i++) {
      this.spiritArray[i].draw(ref);
    }
  }

  run () {
    for (let i=0; i < this.spiritArray.length; i++) {
        this.spiritArray[i].move();
        this.spiritArray[i].changeMood();
      }
    this.nextSpawn -= 1;
    if (this.nextSpawn <= 0) {
        this.addRandomSpirit();
        this.nextSpawn = random(Spirits.nextSpiritFrames*(2/3),Spirits.nextSpiritFrames*(4/3));
    }
  }
}


class Spirit {
    constructor(letterIndex,x,y,hue) {
      // Spirit identity (a letter of the alphabet)
      this.letterIndex = letterIndex;
      this.letter = String.fromCharCode(97 + letterIndex);

      // Spirit mood represented by colour
      this.hue = hue;
      this.sat = 10; 

      // Spirit becomes more transparent with time
      this.opacity = 100;

      // Spirit position and velocity if moving
      this.p = createVector(x,y);
      this.v = createVector(0,0);
      
      // Spirit movement and spin states
      this.moving = false;
      this.nextChange = 50;  // Frames until next change of behaviour
      
      this.spinning = true;
      this.stopSpin = 25;  // Frames until stop spinning

      // Select growl sound at random from 0 1 2, then sound it
      this.growl = floor(random(3));
      growl[this.growl].play();

      // Set array so only one of this letter can be created
      spirits.letterShed[letterIndex] = true;
    }

    draw (ref) {
        // Draw the spirit.  
      push();
        field.translateToField(this.p.x,this.p.y);
        noStroke();   
        if (ref==1) {
            fill(this.hue,this.sat*8,100,100); // double the saturation in the reflection
            if (this.p.y > height/2) { // If character is over water then move the reflection
                translate(0,(height/2) - this.p.y);
            }
        } else {
            fill(this.hue,this.sat,100,this.opacity); // draw as partly opaque
        }
        if (this.spinning) {
            scale(sin(millis()/15),1.0);
        }

        text(this.letter,0,0);
      pop();
    }

    changeMood () {
        if (this.moving) {
            this.sat -= 0.4;
            if (this.sat < 1) {this.sat = 1;}
            this.hue += 1;
            if (this.hue > 100) {this.hue -= 100;}
            else if (hue < 0) {hue +=100;};
        } else {
            this.sat += 0.4;
            if (this.sat > 30) {this.sat = 30;}
        }
    }

    move() {
        this.p.add(this.v); 

        // Stop spirit that has gone outside boundaries
        let ybound = 0.7*height
        if (field.twilight > 0) {
            ybound = 0.5*height;
        } 
        
        if (((this.p.x < 0)|| (this.p.x > width)
            || (this.p.y < 0)|| (this.p.y > ybound) 
            || (dist(this.p.x,this.p.y,field.fire.x,field.fire.y)<60))
            && !this.spinning)   {
            this.nextChange = 1;
        }

        // If spirit is due to change motion
        this.nextChange -= 1;
        if (this.nextChange <= 0) {
            if (this.moving) {
                // Moving spirit will now stop
                this.moving = false;
                this.v = createVector(0,0);
                this.nextChange = random(80,120);
            } else {
                // Stopped spirit will now move
                this.moving = true;
                this.v = p5.Vector.fromAngle(random(2*PI),this.sat/10);
                this.nextChange = random(40,120);
            }
        }

        // Spirit becomes more opaque with time
        if (this.opacity > 3) {
            this.opacity -= 0.04;
        }

        // Spirit eventually stops spinning
        if (this.spinning) {
            this.stopSpin -= 1;
            if (this.stopSpin <= 0) {
                this.spinning = false;
            }
        }
    }

}


function keyPressed() {

    // If the user types a letter key on the keyboard
    // "play" that spirit, by either creating it or sounding it
    if (keyCode >= 65 && keyCode <= 90) {
        spirits.playSpirit(keyCode-65);
    }
}