
class Field {
    constructor() {
        // Set corners of trapezium shape that the field is mapped onto
        this.xtreeline = 0.25*width;
        this.ytreelineStart = 0.325*height;
        this.ytreeline = 0.98*this.ytreelineStart;
        this.ymountain = 0.25*height;
        
        // Set initial lightness factor of the twilight - adjusts brightness of all objects
        this.twilight = 60; // Initial brightness
        this.twiDarkTime = 90;  // Seconds until completely dark
        // Rate to dim brightness each frame - assume fr about 50, cannot call frameRate this early
        this.twispeed = this.twilight/(this.twiDarkTime*50);

        // Set boat rocking parameters
        this.boatAcc = 0;
        this.boatVel = 0;
        this.boatVelDamp = 0.995;
        this.boatRock = this.ytreeline - this.ytreelineStart;

        // Set numbers of objects
        let nClouds = 5;
        let nMountains = width/200;
        let nHills = width/120;
        let nTreesBack = 40;
        let nTreesSide = 10;

        // Create moon object
        this.moon = new Moon(this.twispeed/2);

        // Create cloud object array
        this.clouds = [];
        for (let i=0; i < nClouds; i++){
            let cloud = new Cloud(width*(i+2)/(nClouds+3),
                            height*(random(0.01,0.1)),
                            random(100,200));
            this.clouds.push(cloud);
        }
       
        // Create mountain object array relative to the sky
        this.mountains = [];
        for (let i=0; i < nMountains; i++){
            let mountain = new Mountain(width*i/(nMountains-1),this.ymountain);
            this.mountains.push(mountain);
        }

        // Create hill object array relative to the field
        this.hills = [];
        for (let i=0; i < nHills; i++){
            let hill = new Hill(-1.0*width+3*width*i/(nHills-1),(-1/6)*height);
            this.hills.push(hill);
        }

        // Create tree object array
        this.trees = [];

        // Trees behind the field
        for (let i=0; i < nTreesBack; i++){
            let tree = new Tree(random(-0.6*width,1.6*width),
                            (-height/6)+(i+1)/nTreesBack*(height/6));
            this.trees.push(tree);
        }

        // Trees at the sides of the field
        for (let i=0; i < nTreesSide; i++){
            let tree = new Tree(random(-0.15*width,0.15*width)+(width*(i%2)),
                            (i+1)/nTreesSide*(height/2));
            this.trees.push(tree);
        }

        // Create fire object
        this.fire = new Fire();

    }

    draw () {
        
        // Draw sky
        
        this.moon.draw();
        this.moon.move();

        push();
            noStroke();
            fill(55,100,100,this.twilight);
            rect(0,-0.1*height,width,0.1*height+this.ymountain+this.boatRock);
        pop();

        for (let i=0; i<this.clouds.length; i++) {
            this.clouds[i].draw();
        }

        // Draw mountains, hills, and ground

        push();
            noStroke();
            fill(10,30,this.twilight+10);
            rect(0,this.ymountain+this.boatRock,width,0.5*height-this.ymountain-this.boatRock);
        pop();

        for (let i=0; i<this.mountains.length; i++) {
            this.mountains[i].draw();
        }

        for (let i=0; i<this.hills.length; i++) {
            this.hills[i].draw();
        }

        for (let i=0; i<this.trees.length; i++) {
            this.trees[i].draw();
        }

        this.fire.draw();

    }

    darken() {
        this.twilight -= this.twispeed;
    }

    rock() {
        this.boatRock = this.ytreeline - this.ytreelineStart
        this.boatAcc = 0.0006*(this.boatRock);
        this.boatVel -= this.boatAcc;
        this.boatVel *= this.boatVelDamp;
        
        this.ytreeline += this.boatVel;
        //this.ytreeline = this.ytreelineStart *(1 + 0.03*sin(millis()/1000));
    }

    translateToField(xf,yf) {
        // Takes coordinates on the field (xf,yf) and scales the draw location
        //  on the screen (x,y,z) where z is the zoom factor to scale by
        // Field (xf,yf) is the size of the top half of the screen from top left (0,0)
        //  to bottom right (width,height/2)
        // but on the screen it is distorted to a trapezium (x,y) that matches
        //  along the height/2 horizontal line but shrinks to a top left coordinate
        //  of (xtreeline,ytreeline) and (width-xtreeline, ytreeline)
        let z = map(yf,0, height/2, (1-2*this.xtreeline/width),  1);
        let y = map(yf,0, height/2,  this.ytreeline,      height/2);
        let x = map(xf,0,    width,  (1-z)/2*width, (1+z)/2*width);
        translate(x,y);
        scale(z);
    }

    translateToSky(xs,ys) {
        // Takes coordinates in the sky (xs, ys) and maps
        //  much simpler - x stays the same but y can move up and down
        //  as the viewers "boat" rocks
        let x = xs;
        let y = ys - this.ytreelineStart + this.ytreeline;
        translate(x,y);
    }
    


}


class Moon {
    constructor (speed) {
        this.p = createVector(0.06*width,0.01*height);
        this.angle=5*PI/16; // Angle facing from horizontal to right
        this.v = p5.Vector.fromAngle(this.angle,speed);
    }
    draw() {
      push();
        field.translateToSky(this.p.x,this.p.y);
        rotate(this.angle+(PI/2));
        fill(0,0,0);
        ellipse(0,0,60);
        
        for(let i=60; i>0; i--) {
          noFill();
          stroke(i*100/60);
          arc(0,0,60,i,PI,2*PI);
        }
      pop();
    }
    move() {
        this.p.add(this.v);
        if (this.p.y > 0.46*height) {
            this.v = createVector(0,0);
        }
    }
}

  
class Cloud {
    static skew=0.3;

    constructor (x,y,size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.cloudArray = [];
        for (let i = 0; i < 20; i++) {
            this.cloudArray[i] = [];
            this.cloudArray[i][0] = random(this.size); // x coordinate of cloud circle
            this.cloudArray[i][1] = random(this.size*Cloud.skew); // y coordinate of cloud circle
        }
    }

    draw() {
      push();
        fill(0,0,field.twilight+20); // mid grey
        noStroke();
        field.translateToSky(this.x,this.y);
        scale(1.0,Cloud.skew);
        for (let i = 0; i < 20; i++) {
            ellipse(this.cloudArray[i][0], this.cloudArray[i][1], this.size/2);
        }
      pop();
    }

}


class Mountain {
    constructor (x,y) {
        this.x=x;
        this.y=y;
    }
    draw () {
        push();
            field.translateToSky(this.x,this.y);
            noStroke();
            fill(70,30,field.twilight+10);
            arc(0,0,400,200,PI,2*PI)
        pop();
    }
}


class Hill {
    constructor (x,y) {
        this.x=x;
        this.y=y;
    }
    draw () {
        push();
            field.translateToField(this.x,this.y)
            noStroke();
            fill(5,60,field.twilight+10);
            arc(0,0,600,300,PI,2*PI)
        pop();
    }
}
  
  
class Tree {
    constructor (x,y) {
        this.x = x;
        this.y = y;
        this.flip = random([true,false]);
    }

    draw() {
        push();
            
            field.translateToField(this.x,this.y)
            if (this.flip) {scale(-1.0,1.0);}

            // Ghost Gum trunk and branches
            noStroke();
            fill(0,0,50+field.twilight);
            rect(-6,-70,12,70);
            noFill();
            stroke(0,0,50+field.twilight);
            strokeWeight(7);
            line(0,-20,20,-80);
            strokeWeight(6);
            line(0,-50,-20,-80);
            strokeWeight(9);
            line(0,-60,-10,-85);
            strokeWeight(9);
            line(0,-65,10,-85);
           
            // Namatjira-esque grey stripes for texture
            stroke(0,0,40+field.twilight/2);
            strokeWeight(2);
            line(0,-2,5,-2);
            line(0,-5,5,-5);
            line(0,-32,5,-32);
            line(0,-35,5,-35);
            line(0,-42,5,-42);
            line(0,-45,5,-45);
            line(0,-64,5,-64);
            line(0,-67,5,-67);

            // A few billowy pouffes of leaves
            noStroke();
            fill(30,40,20+field.twilight);
            ellipse( 20,-80,30,20);
            fill(25,45,20+field.twilight);
            ellipse(-20,-80,25,18);
            fill(30,42,20+field.twilight);
            ellipse( 10,-85,35,20);
            fill(35,30,20+field.twilight);
            ellipse(-10,-85,35,20);
        pop();
    }
}


class Fire {
    constructor () {
        this.x=0.5*width;
        this.y=0.35*height;
        this.burning = true;
    }
    draw () {
        push();
            field.translateToField(this.x,this.y);
            let flicker=random(-1,1);
            if (this.burning) {
                noStroke();
                // Light glow on sand
                fill(10+flicker*2,30,60,50);
                ellipse(0,-4,60+flicker*2,20+flicker);
                fill(10+flicker*2,30,60,25);
                ellipse(0,-4,90+flicker*2,30+flicker);
                noFill();
                stroke(10,40,30);
                } else {
                noFill();
                stroke(10,40,0.65*field.twilight);
            }
            // Wood pile
            strokeWeight(9);
            line(-20,0,10,-10);
            strokeWeight(8);
            line(20,0,-10,-12);
            strokeWeight(7);
            line(-8,0,6,-20);
            strokeWeight(7);
            line(9,0,-6,-18);
            if (this.burning) {
                // Flames
                noStroke();
                fill(10+flicker*5,80,100);
                arc(2,-15,7,10,PI/2,3*PI/2);
                arc(0,-20,7,10,3*PI/2,5*PI/2);
                fill(random(5,15),80,100);
                arc(5,-17,7,10,PI/2,3*PI/2);
                fill(random(5,15),80,100);
                arc(-4,-18,7,10,3*PI/2,5*PI/2);
            }
        pop();
    }
}

