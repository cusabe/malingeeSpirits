class Rain {
    constructor () {
        this.raining = false;
        this.rainArray = [];
        this.nextDropDue = 0;
        this.dropInterval = 1;
    }

    run() {
        // If its time then create a new drop
        this.nextDropDue -= 1;
        if (this.nextDropDue <= 0) {
//            let drop = new Raindrop(random(width),height/2+10);
            let drop = new Raindrop(random(width),random(0,height*2));
            this.rainArray.push(drop);
            this.nextDropDue = this.dropInterval;
            //print("Push"+this.rainArray.length);
        }

        // Drop each drop further, or spread out each splash
        for (let i=0;i < this.rainArray.length; i++) {
            this.rainArray[i].drop();
            //print("Falling "+this.rainArray[i].falling+" splashing "+this.rainArray[i].splashing + " falldist "+this.rainArray[i].falldist);
        }

        // If the oldest raindrop has finished splashing then delete it
        if (!this.rainArray[0].falling && !this.rainArray[0].splashing) {
            this.rainArray.shift();
            //print("Pop"+this.rainArray.length);
        }

    }

    draw() {
        for (let i=0;i < this.rainArray.length; i++) {
            this.rainArray[i].draw();
        }
    }
}

class Raindrop {
    static initFalldist = 800;
    static fallSpeed = 20;
    static fallAngle = 0.9;
    static splashSpeed = 1;
    static finalSplashdist = 20;
   
    constructor(x,y) {
      this.x = x; // Location where it will splash
      this.y = y;
      this.falling = true;
      this.falldist = Raindrop.initFalldist;
      this.splashing = false;
      this.splashdist = 0;
      this.rainLine = p5.Vector.fromAngle(Raindrop.fallAngle*PI/2,Raindrop.fallSpeed);
    }
  
    draw() {
      push();
        field.translateToField(this.x,this.y);
        noFill();
        strokeWeight(1);

        if (this.falling) {
          let rainVect = p5.Vector.fromAngle(PI+(Raindrop.fallAngle*PI/2),this.falldist);

          stroke(0,0,100,50);
          line(rainVect.x,rainVect.y,rainVect.sub(this.rainLine).x,rainVect.sub(this.rainLine).y);
        } else if (this.splashing) {
          stroke(0,0,100,50*(1-this.splashdist/Raindrop.finalSplashdist));
          ellipse(0,0,this.splashdist,this.splashdist*0.35);
        }
      pop();
    }
  
    drop() {
      if (this.falling) {
        this.falldist -= Raindrop.fallSpeed;
        if (this.falldist <= 0) {
          this.falling = false;
          if (this.y > height/2+20){
            this.splashing = true; // Splash over water only
          }
        }
      } else if (this.splashing) {
        this.splashdist += Raindrop.splashSpeed;
        if (this.splashdist > Raindrop.finalSplashdist) {
          this.splashing = false;
        }
      }
    }
  
  }