"use strict";



(function (){


/////////////

// REQUEST ANIM FOR ANY BRO
    var requestAnimFrame = (function () {
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function (callback, element){
                    window.setTimeout(callback, 1000 / 60);
            };
      }());

// GLOBAL VARS

var screen2 = document.getElementById("screen2").getContext('2d'),
    gameSize = { width : document.getElementById("screen2").width, 
                 height : document.getElementById("screen2").height},
    gameStates = {
      current : 0,
      titles : 0,
      main : 1,
      over : 2
    },
    cntfade = 0,
    touchedCount = 0,
    coolDown = 0,
    tick = 0,
    titleAnimTick = 0,
    sceneAnimTick = 0,
    overAnimTick = 0,
    fadeOutTick = 0,
    firstLiveTick = 60,
    secondLiveTick = 60,
    thirdLiveTick = 60,
    spawnVert = 40,
    spawnHor = 60,
    spawnParGround = 2,
    spawnParGround2 = 2,
    spawnParSmoke = 17,
    spawnParTrack = 5,
    spawnParHole = 5,
    groundShaking = false,
    settingScene = false,
    hasLost = false,
    shakingTime = 20,
 
    score = 0,
    scrolling = 6 ,
   
    KEYS = { 
      LEFT: 37,
      UP : 38,
      RIGHT: 39,
      DOWN : 40,
      SPACE: 32 
    },

    COLORS = {
       purpleS0 : "rgba( 80, 48,122,1)",
       purpleS1 : "rgba(183,159,216,1)",
       purpleS2 : "rgba(137,102,184,1)",
       purpleS3 : "rgba( 57, 19,107,1)",
       purpleS4 : "rgba( 35,  5, 74,1)",
       brownS0  : "rgba(180,122, 61,1)",
       brownS1  : "rgba(255,219,181,1)",
       brownS2  : "rgba(255,195,131,1)",
       brownS3  : "rgba(158, 89, 17,1)",
       brownS4  : "rgba(109, 56,  0,1)",
       blueS0   : "rgba( 41, 95,113,1)",
       blueS1   : "rgba(151,195,209,1)",
       blueS2   : "rgba( 92,152,172,1)",
       blueS3   : "rgba( 14, 77, 99,1)",
       blueS4   : "rgba(  2, 52, 68,1)",
       greenS0  : "rgba(180,169, 61,1)",
       greenS1  : "rgba(255,248,181,1)",
       greenS2  : "rgba(255,244,131,1)",
       greenS3  : "rgba(158,145, 17,1)",
       greenS4  : "rgba(109, 99,  0,1)"
    };
   


//EVENT HANDLING

var keyState = {};
document.onkeydown = function (e){
	keyState[e.keyCode] = true };
document.onkeyup = function (e){
	keyState[e.keyCode] = false };
function isDown(keyCode) {
  return keyState[keyCode] === true;
}



////////////////// CONSTRUCTIONS

// PLAYER CONSTRUCTION

function Player(x, y, width, height){
 this.x = x;
 this.y = y;
 this.width = width;
 this.height = height;
 this.dy = 0;
 this.dyIni = -8;
 this.grav = 0.8;
 this.accy = 5;
 this.doubleJump = false;
 this.rotateSpeed = 0;
 this.states = { 
                current : 0,
                normal : 0,
                jump : 1,
               };


}

Player.prototype = {

    setState : function(state){ this.states.current = this.states[state];

  },
  
  updatePos : function (){

  switch (this.states.current){

    case this.states.normal :

      this.y = (gameStates.current === gameStates.main)? gameSize.height - 110 - 2 * Math.sin(tick) : gameSize.height - 110 - 2 * Math.sin(tick/5); 
      this.dy = this.dyIni;
      this.accy = 2;
      this.jumpCount = 5;
      this.doubleJump = false;


    if (isDown(KEYS.SPACE)&& !(gameStates.current === gameStates.over)){ 
       for ( i = 0; i < jumpSounds.length; i ++){
        if (jumpSounds[i].currentTime === 0 || jumpSounds[i].ended){
          jumpSounds[i].play();
          break;
        }
      }

        this.setState("jump");
        this.dy = this.dyIni;
    }

    break;

    case this.states.jump :

      if (isDown(KEYS.SPACE) && this.jumpCount === 0 && !this.doubleJump){

         for ( i = 0; i < jumpSounds.length; i ++){
        if (jumpSounds[i].currentTime === 0 || jumpSounds[i].ended){
          jumpSounds[i].play();
          break;
        }
      }

        this.doubleJump = true;
        this.rotateSpeed =  Math.max(5, Math.floor(Math.random() * 20));
        this.dy = this.dyIni;
        this.accy = 1.7;
      }

      if (this.dy >= 0) {    
        this.y -= this.dy * this.accy;
        this.dy += this.grav;
        this.accy -= 0.1 ; 
        keyState[KEYS.SPACE] = false;
        if (this.y + this.height > gameSize.height - 100){ this.setState("normal");} ; 

      }

      else if(this.dy < 0) {
               
        if (this.jumpCount > 0){
          this.y += this.dy;
          this.jumpCount -= 1;
        }
        if (this.jumpCount <= 0 || !isDown(KEYS.SPACE)) {
          this.y += this.dy * this.accy;
          this.dy += this.grav;
          keyState[KEYS.SPACE] = false;
          this.accy -= 0.1;
        }
      }

    break;
          
          
  }
	

  },
  
  draw : function (){

    cntfade += 0.07;
    screen2.save();
    screen2.shadowColor = "rgba(10, 10, 10, 0.3)";
    screen2.shadowOffsetX  = -4;
    screen2.shadowOffsetY = -1;
    screen2.shadowBlur = 6;
    if(!hasLost){
    screen2.globalAlpha = (sceneAnimTick < 30)? sceneAnimTick/30  : 1;
    }
    

    switch( this.states.current){

      case this.states.normal :

     if ( !(gameStates.current === gameStates.over) ){
      if (!(coolDown === 0)){
   
      screen2.fillStyle = "rgba(183, 159, 216," + Math.abs(Math.sin(cntfade * (Math.PI / 2))) + ")";
      screen2.fillRect(this.x - Math.random() * 4, this.y - Math.floor(Math.random()) * 3  + 3 ,this.width + 3 ,this.height - 3); 
      } 
      else {
      screen2.fillStyle = COLORS.blueS3;
      screen2.fillRect(this.x, this.y  + 3,this.width + 3 ,this.height - 3 );
      }
    
    if (!(Math.random()>0.9923) && this.closedEyes === false){
      
      screen2.fillStyle = "rgba( 255, 255, 255, 0.99)"
      screen2.beginPath();
      screen2.arc(this.x +18 ,this.y + 10 ,4 ,-(2/6) * ((Math.PI)*2), (1/100) * ((Math.PI)*2), true);
      screen2.fill();
      screen2.beginPath();
      screen2.arc(this.x + this.width - 4,this.y + 10 ,3, -(1/6) * ((Math.PI)*2), (49/100) * ((Math.PI)*2));
      screen2.fill();
      this.closeCount = 10;

    }
    else  if (this.closeCount > 0){
      this.closedEyes = true;
      screen2.beginPath();
      screen2.moveTo( this.x + 7 , this.y + 10);
      screen2.lineTo( this.x + 17, this.y +10);
      screen2.strokeStyle = "rgba(10,10,10,1)";
      screen2.stroke();
      screen2.beginPath();
      screen2.moveTo( this.x +this.width - 5 , this.y + 10);
      screen2.lineTo( this.x +this.width -  15, this.y +10);
      screen2.strokeStyle = "rgba(10,10,10,1)";
      screen2.stroke();
      this.closeCount -=1;
    }
    else {
      this.closedEyes = false;
    }
  }
    else{

      screen2.fillStyle = COLORS.blueS0;
      screen2.fillRect(this.x, this.y - 3,this.width - 3 ,this.height + 3);
      
    
      if (!(Math.random()>0.9923) && this.closedEyes === false){
      
        screen2.fillStyle = "rgba( 255, 255, 255, 0.99)"
        screen2.beginPath();
        screen2.arc(this.x + 11 , this.y + 6 ,4 , -(1/6) * ((Math.PI)*2), -(2/3) * ((Math.PI)*2));
        screen2.fill();
        screen2.beginPath();
        screen2.arc(this.x + this.width - 8, this.y + 6,3 ,-(2/6) * ((Math.PI)*2), (1/6) * ((Math.PI)*2), true);
        screen2.fill();
        this.closeCount = 10;

      }
      else  if (this.closeCount > 0){
        this.closedEyes = true;
        screen2.beginPath();
        screen2.moveTo( this.x + 7 , this.y + 10);
        screen2.lineTo( this.x + 17, this.y +10);
        screen2.strokeStyle = "rgba(10,10,10,1)";
        screen2.stroke();
        screen2.beginPath();
        screen2.moveTo( this.x +this.width - 5 , this.y + 10);
        screen2.lineTo( this.x +this.width -  15, this.y +10);
        screen2.strokeStyle = "rgba(10,10,10,1)";
        screen2.stroke();
        this.closeCount -=1;
      }
      else {
      this.closedEyes = false;
      }
    }
  
  break;

 case  this.states.jump :

      screen2.save();
      screen2.fillStyle = "rgba(10, 10, 10, 0.1)";
      screen2.fillRect( this.x - 15 + (player.y/10) , gameSize.height - 82,50 - player.y/5, 10);
      screen2.fillRect( this.x - 18 + (player.y/10), gameSize.height - 82, 50 - player.y/5 + 5, 5);
      screen2.fillRect( this.x - 15 + (player.y/10), gameSize.height - 82, 50 - player.y/5, 10);
      screen2.restore();

      if(this.doubleJump){
        screen2.translate( this.x + this.width/2, this.y + this.height/2);
        screen2.rotate( Math.PI*(tick/this.rotateSpeed));
        screen2.translate(-(this.x + this.width/2), -(this.y + this.height/2));
      }
      else{
        screen2.translate(this.x + this.width/2, this.y + this.height/2);
        screen2.rotate(Math.sin(tick/10)/2);
        screen2.translate(-(this.x + this.width/2), -(this.y + this.height/2));
      }
      


      if (!(coolDown === 0)){
   
      screen2.fillStyle = "rgba(183, 159, 216," + Math.abs(Math.sin(cntfade * (Math.PI / 2))) + ")";
      screen2.fillRect(this.x - Math.random() * 4, this.y - Math.floor(Math.random()) * 3  - 3,this.width - 3 ,this.height + 3);
      } 
      else {
      screen2.fillStyle = COLORS.blueS3;
      screen2.fillRect(this.x, this.y - 3,this.width - 3 ,this.height + 3);
      }
    
    if (!(Math.random()>0.9923) && this.closedEyes === false){
      
      screen2.fillStyle = "rgba( 255, 255, 255, 0.99)"
      screen2.beginPath();
      screen2.arc(this.x + 11 , this.y + 6 ,4 ,0,((Math.PI)*2));
      screen2.fill();
      screen2.beginPath();
      screen2.arc(this.x + this.width - 8, this.y + 6,3,0,((Math.PI)*2));
      screen2.fill();
      this.closeCount = 10;

    }
    else  if (this.closeCount > 0){
      this.closedEyes = true;
      screen2.beginPath();
      screen2.moveTo( this.x + 7 , this.y + 10);
      screen2.lineTo( this.x + 17, this.y +10);
      screen2.strokeStyle = "rgba(10,10,10,1)";
      screen2.stroke();
      screen2.beginPath();
      screen2.moveTo( this.x +this.width - 5 , this.y + 10);
      screen2.lineTo( this.x +this.width -  15, this.y +10);
      screen2.strokeStyle = "rgba(10,10,10,1)";
      screen2.stroke();
      this.closeCount -=1;
    }
    else {
      this.closedEyes = false;
    }
    
    
break;
}

screen2.restore();

}


  
 
};

function Enemy(xIni,yIni,width,height,color){

 this.x = -30;
 this.y = -30;
 this.xIni = xIni;
 this.yIni = yIni;
 this.width = width;
 this.height = height;
 this.color = color || "black";
 this.moving = false;
 this.splashed = false;
 this.animTick = 1;
 this.anim1Length = 60;
 this.collided =  false;

}

Enemy.prototype = {

    init : function(){

      this.x = - 30
      this.y = - 30
      this.moving = false;
      this.splashed = false;
      this.animTick = 1;
      this.anim1Length = 60;
      this.collided =  false;
    }

    ,

    update : function() {


      if (ennemies.bodies.indexOf(this) < 3){
        this.x -= scrolling;
      }
      else{
      this.x -= scrolling + 3 ;
      this.y -= 0.9 * Math.sin(tick/2);
          }


      if ((this.x + this.width + 10) < 0 ) {
          this.moving = false;
          this.splashed = false;
          this.collided = false;
          this.animTick = 1;
          this.x  = this.xIni ;
      
        if (ennemies.bodies.indexOf(this) < 3){
            ennemies.readyVer.splice(ennemies.bodies.indexOf(this), 0, ennemies.bodies.indexOf(this));
            this.y = this.yIni;
        }
        else {
            ennemies.readyHor.splice(ennemies.bodies.indexOf(this) - 3,0,ennemies.bodies.indexOf(this));
            this.y = this.yIni;
          }
      }
      this.animTick += 2 ;
      this.animTick = Math.min(this.animTick,this.anim1Length);
      if (collisionBetween(this, player)){this.collided = true;}
    }
     

    
  ,

     draw : function() {
      
      screen2.save();
      screen2.shadowColor = "rgba(0, 0, 0, 0.4)";
      screen2.shadowOffsetX  = -2;
      screen2.shadowOffsetY = -1;
      screen2.shadowBlur = 6;
      screen2.fillStyle = this.color;


      if(ennemies.bodies.indexOf(this) < 3){
            screen2.save();
            screen2.shadowColor = "rgba(0, 0, 0, 0)";

            screen2.fillStyle = COLORS.brownS0;
            screen2.fillRect( this.x - 5, gameSize.height - 85, player.width, 10);
            screen2.fillRect( this.x - 8, gameSize.height - 83, player.width + 5, 5);
            screen2.fillRect( this.x - 5, gameSize.height - 85, player.width, 10);
            screen2.restore();

       if( this.splashed && this.animTick === 60 ){
          screen2.globalAlpha = 0;}

        if(this.animTick < 31 ){

          screen2.beginPath();
          screen2.moveTo(this.x,this.y + this.height);
          screen2.bezierCurveTo(this.x + Math.pow(this.animTick/17,3),this.y + this.height,
                                this.x + Math.pow(this.animTick/17,3), this.y + this.height -(this.height+40) * Math.pow((this.animTick/(this.anim1Length - 30)),3),
                                this.x, this.y + this.height  -(this.height+40) * Math.pow((this.animTick/(this.anim1Length - 30)),3));
          screen2.lineTo(this.x +this.width, this.y +this.height -(this.height+40) * Math.pow((this.animTick/(this.anim1Length - 30)),3));
          screen2.bezierCurveTo(this.x + this.width - Math.pow(this.animTick/17,3),this.y + this.height -(this.height+40) * Math.pow((this.animTick/(this.anim1Length - 30)),3),
                                this.x +this.width - Math.pow(this.animTick/17,3), this.y + this.height,
                                this.x + this.width, this.y + this.height);
          screen2.fill();
          screen2.drawImage(back1,0,193,48,48,this.x+ this.width/2 - 24,this.y + this.height -(this.height+40) * Math.pow((this.animTick/(this.anim1Length - 30)),3) - 24,48,48);
          //screen2.fillRect(this.x , this.y, this.width, -(this.height+40) * Math.pow((this.animTick/(this.anim1Length - 30)),3));
        }
        else if (this.animTick > 30 && this.animTick < 46) {

          screen2.beginPath();
          screen2.moveTo(this.x,this.y +this.height);
          screen2.bezierCurveTo(this.x - (this.animTick - 30)/2,this.y +this.height,
                                this.x - (this.animTick - 30)/2, this.y +this.height -(this.height +40) + 50 * (1 - Math.pow( (45 - this.animTick) / 15, 3)),
                                this.x, this.y +this.height -(this.height +40) + 50 * (1 - Math.pow( (45 - this.animTick) / 15, 3)));
          screen2.lineTo(this.x +this.width, this.y +this.height -(this.height +40) + 50 * (1 - Math.pow( (45 - this.animTick) / 15, 3)));
          screen2.bezierCurveTo(this.x + this.width + (this.animTick - 30)/2,this.y +this.height -(this.height +40) + 50 * (1 - Math.pow( (45 - this.animTick) / 15, 3)),
                                this.x +this.width + (this.animTick - 30)/2, this.y +this.height,
                                this.x + this.width, this.y +this.height);
          screen2.fill();
          screen2.drawImage(back1,0,193,48,48,this.x+ this.width/2 - 24,this.y + this.height -(this.height +40) + 50 * (1 - Math.pow( (45 - this.animTick) / 15, 3)) - 24,48,48);
         // screen2.fillRect(this.x , this.y, this.width, -(this.height + 40) + 60 * (1 - Math.pow( (45 - this.animTick) / 15, 3)));
         }
        else {

          screen2.beginPath();
          screen2.moveTo(this.x,this.y + this.height);
          screen2.bezierCurveTo(this.x - (15/2) + (this.animTick - 45)/2, this.y + this.height,
                                this.x - (15/2) + (this.animTick - 45)/2, this.y + this.height -(this.height -10) - 20 * Math.pow((this.animTick - 45)/(this.anim1Length - 45),3),
                                this.x, this.y + this.height -(this.height -10) - 20 * Math.pow((this.animTick - 45)/(this.anim1Length - 45),3));
          screen2.lineTo(this.x + this.width, this.y + this.height - (this.height -10) - 20 * Math.pow((this.animTick - 45)/(this.anim1Length - 45),3));
          screen2.bezierCurveTo(this.x + this.width + (15/2) - (this.animTick - 45)/2, this.y + this.height -(this.height -10) - 20 * Math.pow((this.animTick - 45)/(this.anim1Length - 45),3),
                                this.x +this.width + (15/2) - (this.animTick - 45)/2, this.y + this.height,
                                this.x + this.width, this.y + this.height);
          screen2.fill();
          screen2.drawImage(back1,0,193,48,48,this.x+ this.width/2 - 24,this.y + this.height -(this.height -10) - 20 * Math.pow((this.animTick - 45)/(this.anim1Length - 45),3) - 24,48,48);
         // screen2.fillRect(this.x , this.y, this.width, -(this.height -10) - 20 * Math.pow((this.animTick - 45)/(this.anim1Length - 45),3));
        }
       }
      
      else{
        screen2.fillRect(this.x, this.y, 10, 10);
        screen2.fillStyle = "rgba(255,248,181,"+  ((this.x/gameSize.width)*1.2 - 0.4) +")";
        screen2.fillRect ( this.x + this.width + 5, this.y + this.height/2 - 2 , gameSize.width/10 + (gameSize.width - this.x)/2, this.height/4);
        screen2.fillRect ( this.x + this.width + 5, this.y + this.height/2 - 2 + Math.random() * 5, 20 + this.x/1, this.height/4);
      }
      screen2.restore();
    }

    
};

    



function GroundParticle() {

 this.x = player.x + player.width - 10;
 this.y = player.y + player.height - 10;
 this.grav =  0.8;
 this.moving = true;
 this.life =  60 - Math.floor(Math.random() * 50);
 this.dx =  0;
 this.dy = 0;
}


GroundParticle.prototype = {


  update : function(){

    if (partGround.indexOf(this) < 100 ){
      if( !this.moving  && player.states.current === player.states.normal && (sceneAnimTick >30 || hasLost) && !(gameStates.current === gameStates.over) ){

        if (sceneAnimTick < 30 && !hasLost) {return;}

        this.moving = true;
   
        this.life =  60 -  Math.floor(Math.random() * 50) ;
        this.x = player.x + player.width - 10;
        this.y = player.y + player.height;

        this.dy =   - Math.random() * 12 ;
        this.dx =    Math.random() * 12;
      }
      if (this.moving === true && this.life > 0) {
        this.x -= this.dx;
        this.y += this.dy ;
        this.dy += this.grav;
        this.life --;
          if(this.y > gameSize.height - 80) {
             this.dy *= -0.4;
          }
      }
      else {
        this.moving = false;
      }
    }     
    
    else if( partGround.indexOf(this) > 99){
      for ( var i = 0; i < 3 ; i ++){
       if( !this.moving && spawnParGround2 === 1  && ennemies.bodies[i].moving && ennemies.bodies[i].animTick < 60){
        this.moving = true;
        spawnParGround2 = 0;
        this.life = 60 -  Math.floor(Math.random() * 50);
        this.x = ennemies.bodies[i].x + ennemies.bodies[i].width/2;
        this.y = ennemies.bodies[i].y + ennemies.bodies[i].height;
        this.dx = scrolling + Math.pow(-1,Math.floor(Math.random()*2)) * Math.random() * 6;
        this.dy = - Math.random() * 10;
       }
       
      }
       if (this.moving === true && this.life > 0) {
        this.x -= this.dx;
        this.y += this.dy;
        this.dy += this.grav;
        this.life --;
          if(this.y > gameSize.height - 80) {
             this.dy *= -0.4;
          }
       }
      else {
        this.moving = false;
      }
    }
}
,
  draw : function() {
        
          if(this.life > 0  && this.moving === true){
            screen2.save()
            screen2.fillStyle = COLORS.brownS4;
            screen2.fillRect ( this.x , this.y, this.life/6, this.life/6);
            screen2.restore();
          }
  }
}; 

function SmokeParticle() {
 this.x = -40;
 this.y = 0;
 this.grav = - 0.2;
 this.moving = true;
 this.life = Math.floor(Math.random() * 50);
 this.dx = 0;
 this.dy = 0;
}


SmokeParticle.prototype = {


  update : function(){

    if(this.moving === false && spawnParSmoke === 0  &&  (player.states.current === player.states.jump) ){
      spawnParSmoke = (player.doubleJump) ?  5 : 17;
      this.moving = true;
    }

    if (this.moving === true && this.life > 0) {
      this.x -= this.dx + Math.random() * 4;
      this.y += this.dy ;
      //this.dy-= this.grav;
      this.life --;
    }
    else {
           this.moving = false;
           this.life =  40 + Math.floor(Math.random() * 10);
           this.x = player.x + player.width / 2;
           this.y = player.y + player.height ;
           this.dy = 0;
    }
          
  }
,
  draw : function() {
        
          if(this.life > 0  && this.moving === true){
            screen2.save();
            screen2.fillStyle = "rgba(255, 255, 255," + this.life/100  +")";
            screen2.beginPath();
            screen2.arc ( this.x - Math.random() * 10, this.y, this.life / 6 , Math.random()*50, (2 * Math.PI *( this.life / 100)) * 2, false );
            screen2.fill();
            screen2.restore();
          }
  }
}; 

function TrackParticle() {
 this.x = -50;
 this.y = player.y + player.height + Math.random() * 4;
 this.moving = false;
}


TrackParticle.prototype = {


  update : function(){

    if(this.moving === false &&  spawnParTrack === 5 && player.states.current === player.states.normal && sceneAnimTick > 30){
      this.moving = true;
      spawnParTrack = 0;
      this.x = player.x + player.width/2;
      this.y = player.y + player.height;
      this.y = Math.max(this.y, gameSize.height - 85  );
    }

    this.x -= scrolling;
 

    if (this.x + 40 < 0){
      this.moving = false; 
    } 
  }
,
  draw : function() {
        
          if(this.moving === true ){
            screen2.save();
            screen2.fillStyle = COLORS.brownS0;
            screen2.fillRect( this.x, this.y, 9, 3);
            screen2.restore();
          }
  }
}; 
function HoleParticle(){
 this.x = -50;
 this.y = gameSize.height - 85;
 this.moving = false;
}


HoleParticle.prototype = {


  update : function(){

    if( player.states.current === player.states.jump  && player.dy >14 && player.y > 130 && spawnParHole === 20){
      this.moving = true;
      spawnParHole = 0;
      shakingTime = 20;
      this.x = player.x + player.width/2;
      this.y = gameSize.height - 85;
    }

    this.x -= scrolling;
    if (this.x + 40 < 0){
      this.moving = false;
    }
  }
,
  draw : function() {
        
          if(this.moving === true){
            screen2.save();
            screen2.fillStyle = COLORS.brownS4;
            screen2.fillRect( this.x + 5, gameSize.height - 85, player.width + 5, 10);
            screen2.fillRect( this.x + 5 - 3, gameSize.height - 83, player.width + 10, 5);
            screen2.fillRect( this.x + 5, gameSize.height - 85, player.width + 5, 10);
            screen2.restore();
          }
  }
}; 

function WoodPieces(){
 this.x = -50;
 this.y = -50;
 this.dy = - Math.max(Math.random() * 10, 5 );
 this.dx = Math.min(Math.random() * 20, 10 ) ;
 this.grav = 0.2;
 this.moving = false;
 this.life = 50;
 this.width = 10;
 this.height = 10;
}


WoodPieces.prototype = {


  update : function(){

    if (this.moving){
      this.x -= this.dx;
      this.y += this.dy;
      this.dy += this.grav;
    }
    if (this.x + 50 < 0 || this.y + 20 < 0 ){
      this.moving = false;
      this.dy = - Math.max(Math.random() * 10, 5 );
      this.life = 50;
    }
  }
,
  draw : function() {

      if (this.moving && this.life > 0 && sceneAnimTick > 30){
        screen2.save(); 
        screen2.fillStyle =  (1 + Math.floor(Math.random()*2) === 1) ? ((1 + Math.floor(Math.random()*2) === 1) ? COLORS.brownS4 : COLORS.brownS3) : COLORS.greenS3;
        screen2.translate( this.x + (this.width/2), this.y + (this.height/2) );

        screen2.rotate( Math.PI*(tick/5));
        screen2.fillRect(0,0, 5 + this.life/5,5 + this.life/5);
        screen2.translate(-this.x - (this.width/2) , - this.y - (this.height/2));
        screen2.restore();
        this.life --
       
      }
         
  }
}; 




//////////// FUNCTIONS

function intoPieces(){

  for (var i = 0; i < 3 ; i++){

    if( !ennemies.bodies[i].splashed && ennemies.bodies[i].moving && ennemies.bodies[i].x < player.x  && ennemies.bodies[i].y > player.y &&  !ennemies.bodies[i].collided ){
       ennemies.bodies[i].splashed = true;
      ennemies.bodies[i].animTick = 46;



       for ( var j = 0; j < boomSounds.length;j ++){
        if (boomSounds[j].currentTime === 0 || boomSounds[j].ended){
          boomSounds[j].play();
          break;
        }
      }
      screen2.fillStyle =  "rgba( 255, 255, 255, 0.5)";
      screen2.beginPath();
      screen2.arc(ennemies.bodies[i].x + ennemies.bodies[i].width /2 ,gameSize.height - 80, 70,0, Math.PI , true);
      screen2.fill();

      score += 1;
      for( var k = 0; k < 10; k ++){
      for (var j = 0; j < (ennemies.bodies[i].height / 10) * (ennemies.bodies[i].width / 10) ; j++){
          if( !woodPieces[j].moving ){
            woodPieces[j].moving = true;
            woodPieces[j].x =  ennemies.bodies[i].x +  10 * Math.floor(j/(ennemies.bodies[i].height / 10)) ;
            woodPieces[j].y =  ennemies.bodies[i].y + ennemies.bodies[i].height - ( j - (ennemies.bodies[i].height / 10) * Math.floor(j/(ennemies.bodies[i].height / 10))) * 10 ;
          }
      }

    }
  }

  }

}


  function makeItShake(){
  
    if(shakingTime > 0){
      screen2.save();
      screen2.translate( -Math.random() * (shakingTime/10) , -Math.random() * (shakingTime) * 2);

    }
    else {
      screen2.save();
      screen2.translate( -Math.random() * 2, -Math.random() * 5 );
  
    }
  } 


  function renderPieces(){
   for (var i = 0; i < woodPieces.length ; i++){
    woodPieces[i].draw();
    woodPieces[i].update();
  }
}

  function collisionBetween(b1, b2){
      if (b1.x <= b2.x + b2.width && 
          b1.x + b1.width >= b2.x &&
          b1.y <= b2.y + b2.height && 
          b1.y + b1.height >= b2.y && coolDown === 0) {
        coolDown = 100;
      touchedCount ++;
        return true;
      }
  }
  

function renderParticles(){

  for (var i = 0; i < partGround.length  ; i++){
    partGround[i].draw();
    partGround[i].update();
  }
  for (var i = 0; i < partSmoke.length ; i++){
    partSmoke[i].draw();
    partSmoke[i].update();
  }
  for (var i = 0; i < partTrack.length ; i++){
    partTrack[i].draw();
    partTrack[i].update();
  }
}

function renderEnnemies(){

  var cst1 = Math.floor(Math.random()*3),
      cst2 = Math.floor(Math.random()*3);

  if (spawnVert === 70) {

    if ( cst1 === 2 && ennemies.bodies[ennemies.readyVer[cst1]] !== undefined && Math.random() > 0.999){
          ennemies.bodies[ennemies.readyVer[cst1]].moving = true ;
          ennemies.readyVer.splice(cst1,1);
          spawnVert = 0;    
    }  
    else if ( cst1 !== 2 && ennemies.bodies[ennemies.readyVer[cst1]] !== undefined && Math.random() > 0.9){
       ennemies.bodies[ennemies.readyVer[cst1]].moving = true ;
          ennemies.readyVer.splice(cst1,1);
          spawnVert = 0;    
    }
  }
  
  if (Math.random() > 0.97 && spawnHor === 40) {
      if (ennemies.bodies[ennemies.readyHor[cst2]] !== undefined){
           ennemies.bodies[ennemies.readyHor[cst2]].moving = true ;
             for ( i = 0; i < gunSounds.length; i ++){
        if (gunSounds[i].currentTime === 0 || gunSounds[i].ended){
          gunSounds[i].play();
          break;
        }
      }
           ennemies.readyHor.splice(cst2,1);
           spawnHor = 0;
      } 
  }
       //  CLEAR  & DRAW ENNEMIES
  for (var i = 0; i < ennemies.bodies.length ; i++){
      if (ennemies.bodies[i].moving){
      ennemies.bodies[i].draw();
     // screen2.fillRect(ennemies.bodies[i].x,ennemies.bodies[i].y,ennemies.bodies[i].width,  ennemies.bodies[i].height );
      ennemies.bodies[i].update();
      }
  }

}

function renderHoles(){

 for (var i = 0; i < partHole.length ; i++){
    partHole[i].draw();
    partHole[i].update();
  }

}

function renderPlayer(){

  player.draw();
  player.updatePos();
 
}

function renderHud(){

      var newScore = false;

      for (var j = 0; j < 3; j ++){ 
       if(ennemies.bodies[j].splashed){
        newScore = true;
       }
      }
      screen2.save();
      screen2.globalAlpha = (sceneAnimTick < 30)? sceneAnimTick/30  : 1,


      screen2.fillStyle = COLORS.blueS0;

      for(var i = 0; i < 3 - touchedCount; i++ ){
      screen2.fillRect(gameSize.width * 0.03 + i*30,  gameSize.height * 0.06 ,(sceneAnimTick < 30)? sceneAnimTick/30 * 20 : 20,(sceneAnimTick < 30)? sceneAnimTick/30 * 20 : 20);
      }

      if (touchedCount === 1 && firstLiveTick > 0 ) { 

        screen2.save();
        screen2.fillStyle = "red";
        screen2.fillRect(gameSize.width * 0.03 + 2 * 30, gameSize.height * 0.06 + ( 200*( Math.pow(5*(60 - firstLiveTick)/60,3))), 20 , 20 );
        firstLiveTick --;
        screen2.restore();  
      }
      
           

      if (touchedCount === 2 && secondLiveTick > 0){
        screen2.save();
        screen2.fillStyle = "red";
        screen2.fillRect(gameSize.width * 0.03 + 1 * 30, gameSize.height * 0.06 + ( 200*( Math.pow(5*(60 - secondLiveTick)/60,3))), 20 , 20 );
        secondLiveTick --;
        screen2.restore();

      }

   
      if (touchedCount === 3 && thirdLiveTick > 0){
        screen2.save();
        screen2.fillStyle = "red";
        screen2.fillRect(gameSize.width * 0.03 + 0 * 30, gameSize.height * 0.06 + ( 200*( Math.pow(5*(60 - thirdLiveTick)/60,3))), 20 , 20 );
        thirdLiveTick --;
        screen2.restore();

      }
     
      
    if(gameStates.current === gameStates.main){
      if (newScore  ){
      screen2.font = ( 60 + (tick) % 10) +"px score" 
      screen2.fillStyle = (1 + Math.floor(Math.random()*2) === 1) ? ((1 + Math.floor(Math.random()*2) === 1) ? COLORS.greenS1 : COLORS.purpleS2) : COLORS.purpleS0;

       screen2.translate(gameSize.width - 80, 60);
        screen2.rotate(Math.sin(tick/2)/2);
        screen2.translate(-(gameSize.width - 80), -(60));
      screen2.fillText(score, gameSize.width - 100, 60 - Math.random() * 10);
      }
      else {
         screen2.font =  "48px score";
         screen2.fillText(score, gameSize.width - 100, 50);
      }      
    }
      screen2.restore();
}


function renderBacks(){


  back2xPos -= 1;
  back22xPos -= 0.6;  
  if (back2xPos  + 640 <= 0){back2xPos = 0;}
  if (back22xPos  + 640 <= 0){back22xPos = 0;}
  screen2.save()
  screen2.fillStyle = COLORS.blueS1;
  screen2.fillRect(-20, -20,gameSize.width + 40 ,gameSize.height + 40);
  screen2.globalAlpha = 0.1;
 
     

  if(sceneAnimTick < 30 && !hasLost){
  screen2.save();
  screen2.globalAlpha = sceneAnimTick/30 * 0.1;
  screen2.drawImage(back2,0,0,640,96,back2xPos , gameSize.height - 160 +100 * (1 - Math.pow( sceneAnimTick  /30,3)) *2 , 640, 96);
  screen2.drawImage(back2,0,0,640,96,back2xPos  + 640,gameSize.height - 160 + 100 * (1 - Math.pow( sceneAnimTick  /30,3)) *2, 640, 96);
  screen2.drawImage(back2,0,96,640,100,back22xPos , 0 + 100 * (1 - Math.pow( sceneAnimTick  /30,3)) *2, 640, 100);
  screen2.drawImage(back2,0,96,640,100,back22xPos  + 640,0 + 100 * (1 - Math.pow( sceneAnimTick  /30,3)) *2 , 640, 100);
  screen2.restore();
 }
  else{

  screen2.drawImage(back2,0,0,640,96,back2xPos , gameSize.height - 160 , 640, 96);
  screen2.drawImage(back2,0,0,640,96,back2xPos  + 640,gameSize.height - 160 , 640, 96);
  screen2.drawImage(back2,0,96,640,100,back22xPos , 0, 640, 100);
  screen2.drawImage(back2,0,96,640,100,back22xPos  + 640,0  , 640, 100);


 }
  screen2.restore();
}

function renderGrass(){

  back1xPos -= scrolling ;
  back12xPos -= scrolling - 1 ;
  front1xPos -= scrolling ;
  if (back1xPos  + 640 <= 0){back1xPos = 0;}
  if (back12xPos + 640 <= 0){back12xPos = 0;}
  if (front1xPos + 640 <= 0){front1xPos = 0;}


  switch (gameStates.current) {

  case gameStates.main : 



  if(sceneAnimTick < 30 && !hasLost){
          
          screen2.drawImage( back1,0,0,640,48 ,back12xPos  + 640, (gameSize.height - 115) + 100 * (1 - Math.pow( sceneAnimTick  /30,3)) *2, 640,48);
          screen2.drawImage( back1,0,0,640,48 ,back12xPos, gameSize.height - 115 + 100 * (1 - Math.pow( sceneAnimTick  / 30,3))*2, 640,48);

          screen2.fillStyle = COLORS.greenS4; 
          screen2.fillRect(-20, gameSize.height - 90 + 100 * (1 - Math.pow( sceneAnimTick  /30,3)) *2 ,gameSize.width + 40,110 + 20  );
        
          screen2.fillStyle = COLORS.greenS0;
          screen2.fillRect(-20, gameSize.height - 90 + 100 * (1 - Math.pow( sceneAnimTick  /30,3)) *2 ,gameSize.width + 40 ,20 ); 
   
          screen2.drawImage(back1,0,0,640,48,front1xPos + 640,gameSize.height - 87 + 100 * (1 - Math.pow( sceneAnimTick  /30,3)) *2, 640, 48);
          screen2.drawImage(back1,0,0,640,48,front1xPos, gameSize.height - 87 + 100 * (1 - Math.pow( sceneAnimTick  /30,3)) *2, 640, 48);
        
          screen2.save();
          screen2.shadowColor = "rgba(10, 10, 10, 0.3)";
          screen2.shadowOffsetX  = -4;
          screen2.shadowOffsetY = -1;
          screen2.shadowBlur = 6;
          screen2.drawImage(back1,0,48,640,48,back1xPos  + 640,gameSize.height - 110 + 100 * (1 - Math.pow( sceneAnimTick  /30,3)) *2, 640, 48);
          screen2.drawImage(back1,0,48,640,48,back1xPos , gameSize.height - 110 + 100 * (1 - Math.pow( sceneAnimTick  /30,3)) *2  , 640, 48);
          screen2.restore();

         
  } 
  else{



  screen2.save();

  screen2.drawImage(back1,0,0,640,48,back12xPos  + 640,gameSize.height - 115 , 640, 48);
  screen2.drawImage(back1,0,0,640,48,back12xPos , gameSize.height - 115 , 640, 48);

  screen2.fillStyle = COLORS.greenS4; 
  screen2.fillRect(-20, gameSize.height - 90 ,gameSize.width + 40,110 + 20);

  screen2.fillStyle = COLORS.greenS0;
  screen2.fillRect(-20, gameSize.height - 90 ,gameSize.width + 40 ,20); 

  screen2.drawImage(back1,0,0,640,48,front1xPos + 640,gameSize.height - 87 , 640, 48);
  screen2.drawImage(back1,0,0,640,48,front1xPos, gameSize.height - 87 , 640, 48);

  screen2.save();
  screen2.shadowColor = "rgba(10, 10, 10, 0.3)";
  screen2.shadowOffsetX  = -4;
  screen2.shadowOffsetY = -1;
  screen2.shadowBlur = 6;
  screen2.drawImage(back1,0,48,640,48,back1xPos  + 640,gameSize.height - 110 , 640, 48);
  screen2.drawImage(back1,0,48,640,48,back1xPos , gameSize.height - 110  , 640, 48);
  screen2.restore();

  screen2.restore(); 
}
 sceneAnimTick ++;
  break;

  case gameStates.over :
  screen2.save();

  screen2.drawImage(back1,0,0,640,48,back12xPos  + 640,gameSize.height - 115 , 640, 48);
  screen2.drawImage(back1,0,0,640,48,back12xPos , gameSize.height - 115 , 640, 48);

  screen2.fillStyle = COLORS.greenS4; 
  screen2.fillRect(-20, gameSize.height - 90 ,gameSize.width + 40,110 + 20);

  screen2.fillStyle = COLORS.greenS0;
  screen2.fillRect(-20, gameSize.height - 90 ,gameSize.width + 40 ,20); 

  screen2.drawImage(back1,0,0,640,48,front1xPos + 640,gameSize.height - 87 , 640, 48);
  screen2.drawImage(back1,0,0,640,48,front1xPos, gameSize.height - 87 , 640, 48);

  screen2.save();
  screen2.shadowColor = "rgba(10, 10, 10, 0.3)";
  screen2.shadowOffsetX  = -4;
  screen2.shadowOffsetY = -1;
  screen2.shadowBlur = 6;
  screen2.drawImage(back1,0,48,640,48,back1xPos  + 640,gameSize.height - 110 , 640, 48);
  screen2.drawImage(back1,0,48,640,48,back1xPos , gameSize.height - 110  , 640, 48);
  screen2.restore();

  screen2.restore(); 
  break;
}
  
}
function renderTitle(){

        screen2.fillStyle = COLORS.blueS1;
        screen2.fillRect(-20, -20,gameSize.width + 40 ,gameSize.height + 40);

    if(!settingScene){
         if(titleAnimTick <= 30){
          screen2.drawImage( titleScreen,0,  -40 + 300 * (1 - Math.pow( titleAnimTick / 30,3)), 640,300);
         titleAnimTick++;
        } 
        else if (titleAnimTick > 30 && titleAnimTick <= 45){

          screen2.drawImage( titleScreen,0 , -40 + 50 * ( 1 - Math.pow( (45 - titleAnimTick)/15,3)), 640,300);
          titleAnimTick ++;
        }
        else if (titleAnimTick > 45 && titleAnimTick < 60){
          screen2.drawImage( titleScreen,0 , -40  + 50 * ( 1 - Math.pow( (titleAnimTick - 46)/15,3)), 640,300);
           titleAnimTick ++ ;

        }
        


        if(titleAnimTick === 60){

          screen2.save();
          screen2.drawImage( titleScreen,0 + Math.random() * 5 , - 40 + Math.random() * 5, 640,300);
          screen2.font = "30px score";
          screen2.fillStyle = "white";
          screen2.globalAlpha = (tick % 40 < 20) ? 0 : 1;
          screen2.fillText("Click to start", gameSize.width / 2 - 128, gameSize.height * 0.95 );
          screen2.restore();
        }
    }
        if(settingScene){

          if  (titleAnimTick >= 60 && titleAnimTick <= 63){
            screen2.fillStyle = "white";
            screen2.fillRect( 0,0,gameSize.width, gameSize.height);
            titleAnimTick ++;
          }
          else if (titleAnimTick > 63 && titleAnimTick <=93 ){
            screen2.drawImage( titleScreen,0,0,640,300 ,0,-30 + 100 * (Math.pow( (titleAnimTick - 63)  /30,3)) *2, 640,300);
            titleAnimTick ++;
          }
          else{
            settingScene = false;
            gameStates.current = gameStates.main;
          }
        }
      
}


function updateCounters(){

  coolDown -- ;
  coolDown = Math.max(0, coolDown);
  spawnVert ++;
  spawnVert = Math.min( 70 , spawnVert);
  spawnHor ++;
  spawnHor = Math.min( 40 , spawnHor);
  spawnParGround2 ++;
  spawnParGround2 = Math.min( 1 , spawnParGround2);
  spawnParSmoke --;
  spawnParSmoke = Math.max( 0 , spawnParSmoke);
  spawnParTrack ++;
  spawnParTrack = Math.min( 5 , spawnParTrack);
  spawnParHole ++;
  spawnParHole = Math.min( 20 , spawnParHole);
  shakingTime --;
  shakingTime = Math.max( 0 , shakingTime);
  tick ++;


}

/////////// INSTANTIATIONS

var titleScreen = new Image();
    titleScreen.src = "titleScreen.png";
var back1 = new Image();
    back1.src = "back1.png";
var back2 = new Image();
    back2.src = "back2.png";

var jumpSounds =[];
for ( var i = 0; i < 6; i ++ ){
  jumpSounds.push(new Audio());
  jumpSounds[i].src = "jump.mp3";
  jumpSounds[i].volume = 0.1;
}; 

var boomSounds =[];
for ( var i = 0; i < 6; i ++ ){
  boomSounds.push(new Audio());
  boomSounds[i].src = "boom.mp3";
  boomSounds[i].volume = 0.1;
}; 

var gunSounds =[];
for ( var i = 0; i < 6; i ++ ){
  gunSounds.push(new Audio());
  gunSounds[i].src = "gun.mp3";
  gunSounds[i].volume = 0.1;
}; 

var backMusic = new Audio();
backMusic.src = "back1.mp3";
backMusic.play();
backMusic.volume = 0.15;
backMusic.loop = true;

var back1xPos = 0,
    back12xPos = 0,
    back2xPos = 0,
    back22xPos = 0,
    front1xPos = 0,
    front2xPos = 0;

var player = new Player(80, gameSize.height, 30, 30);



var ennemies = { bodies : [  new Enemy(gameSize.width + 80, gameSize.height - 80 - 40, 20, 40, COLORS.brownS3 ),
                             new Enemy(gameSize.width + 80, gameSize.height - 80 - 80, 20, 80, COLORS.brownS3 ),
                             new Enemy(gameSize.width + 80, gameSize.height - 80 - 140, 20, 140,COLORS.brownS3 ),

                             new Enemy(gameSize.width + 20, 120, 30, 10, COLORS.greenS1 ),
                             new Enemy(gameSize.width + 20, 180, 30, 10, COLORS.greenS1 ),
                             new Enemy(gameSize.width + 20, 40,  30, 10, COLORS.greenS1 ) ]
              ,
              readyVer : [0, 1, 2]
              ,
              readyHor : [3, 4, 5]
              };




var partGround =[];
for ( var i = 0; i < 200; i ++ ){
  partGround.push(new GroundParticle());
}; 


 
var partSmoke =[];
for ( var i = 0; i < 25; i ++ ){
  partSmoke.push(new SmokeParticle());
}; 



 
var partTrack =[];
for ( var i = 0; i < 25; i ++ ){
  partTrack.push(new TrackParticle());
};



var partHole =[];
for ( var i = 0; i < 25; i ++ ){
  partHole.push( new HoleParticle());
}; 

var woodPieces =[];
for ( var i = 0; i < 50; i ++ ){
  woodPieces.push( new WoodPieces());
}; 




///////// GAME LOGIC

(function loop(){

  screen2.clearRect(-20, -20, gameSize.width + 40, gameSize.height + 40);


  switch(gameStates.current){

    case gameStates.titles :

          renderTitle();
           if (titleAnimTick === 60){ 
            document.onclick = function(){ settingScene = true;}
         }


         break;
    
    case gameStates.main :


    if (touchedCount === 3){gameStates.current = gameStates.over;} // death condition

      //scrolling = (score < 5) ? 6 : (score < 10) ? 8 : 10;
      scrolling = 9 + score/5;

     
      if (coolDown >92){break;} // freeze if hurt
      
      else{

      renderBacks();
      renderHud();    
  
      makeItShake();
    
      renderGrass();
      renderPlayer();
      renderHoles();
      renderEnnemies();
      intoPieces();
      renderPieces();
      renderParticles();
      screen2.restore();
      }

  
      break;
  
    case gameStates.over :

    
    scrolling = (overAnimTick >= 30  && overAnimTick < 60) ? 3 +  4 * (overAnimTick / 30) :  3;

     for ( var i = 0; i < partGround.length; i ++){
        partGround[i].x = -50;
      }
      for ( var i = 0; i < partSmoke.length; i ++){
        partSmoke[i].x = -50;
      }
      for ( var i = 0; i < partHole.length; i ++){
        partHole[i].x = -50;
      }
      for ( var i = 0; i < ennemies.bodies.length; i ++){
        ennemies.bodies[i].x = -50;
      }

    if ( localStorage.getItem ( "myPb") < score){localStorage.setItem ( "myPb" , score.toString());}
    for(var i = 0; i < ennemies.bodies.length; i++){ ennemies.bodies[i].init();}
    

      renderBacks();
    
      renderGrass();
      renderPlayer();
      renderParticles();
      renderPieces();
    
      screen2.restore();
    

     screen2.save();

    if(overAnimTick < 20){
    screen2.fillStyle = "rgba(255,255,255," + overAnimTick/20 + ")";
    overAnimTick ++;
    }
   if( overAnimTick >= 30  && overAnimTick < 60){
    screen2.fillStyle = "rgba(255,255,255," +(1 - (overAnimTick - 30)/30)+")";
    
    overAnimTick ++;

    }
    else{
    screen2.fillStyle = "white";
    }


    screen2.font = " 48px score ";
    screen2.fillText(  "Score : "+ score , gameSize.width * 0.3, gameSize.height * 0.3 );
    screen2.fillText(  "BEST : " + localStorage.getItem("myPb") , gameSize.width * 0.315, gameSize.height * 0.5 );
  
    if(tick % 40 < 20){
    screen2.fillText("Click to restart", gameSize.width * 0.15, gameSize.height * 0.7 );


 

    }
    screen2.restore();

    if(overAnimTick === 60){
      
      tick = 0;
      score = 0;
      sceneAnimTick = 0;
      touchedCount = 0;

      coolDown = 0;
      ennemies.readyVer = [0,1,2];
      ennemies.readyHor = [3,4,5];
     
  

      firstLiveTick = 60;
      secondLiveTick = 60;
      thirdLiveTick = 60;
      overAnimTick = 0;

      gameStates.current = gameStates.main;
    }
    

   if (gameStates.current === gameStates.over){ document.onclick = function(){
       overAnimTick = 30;
       hasLost = true;
   }
  

  }
    break;
  
  }
      updateCounters();   
      requestAnimFrame(loop);
      screen2.restore();
      //console.log(ennemies.bodies[1].x);
      //console.log(ennemies.bodies[2].x);
     console.log(spawnParGround);
      
}());



/////////////////

}()); // FINE



















