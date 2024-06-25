//#region CLASSES
class Instances {
    constructor(startX, startY, identification, radius, imageBuffer) {
        this.x = (startX * modifier);
        this.y = (startY * modifier);
        this.radius = radius * modifier;
        this.id = identification;
        this.staticBuffer = imageBuffer * modifier;
    }//end constructor

    Update = function (oldMod) {
        if (oldMod > modifier) {
            this.x = this.x * 0.5;
            this.y = this.y * 0.5;
            this.radius = this.radius * 0.5;
            this.staticBuffer = this.staticBuffer * 0.5;
        } else if (oldMod < modifier) {
            this.x = this.x * 2;
            this.y = this.y * 2;
            this.radius = this.radius * 2;
            this.staticBuffer = this.staticBuffer * 2;
        }//end if
    }//end method

    KillCheck = function () {
        if (player.trail.length - 1 < 0) {
            return
        }//end if
    
        //GRAB PLAYER X/Y
        let px1 = player.tip().x
        let py1 = player.tip().y
    
        //ITERATE THROUGH ALL TRAIL PIECES FOR COLLISION DETECTION
        for (let i = 0; i < player.trail.length; i++) {
            let px2 = player.trail[i].x
            let py2 = player.trail[i].y
            
            let line = Distance(px1, py1, px2, py2)
            let d1 = Distance(px1, py1, this.x + this.staticBuffer, this.y + this.staticBuffer)
            let d2 = Distance(px2, py2, this.x + this.staticBuffer, this.y + this.staticBuffer)
                        
            if (player.velocity > 5 && (d1 + d2) >= line - (this.radius * .5) && (d1+d2) <= line + (this.radius * .5)) {
                return true;
            } //end if
        }//end for
        return false;
    }//end method

    Draw = function (image) {
        let x = this.x
        let y = this.y        

        //DrawImage(image,x,y,25,25)
        DrawImage(image, x, y, 25 * modifier, 25 * modifier);
    }//end method

}//end Instances class

class Actors extends Instances {
    constructor(startX, startY, identification, startAngle, radius) {
        super(startX, startY, identification, radius, 0);
        this.angle = startAngle;   
        this.x += (12.5 * modifier);
        this.y += (12.5 * modifier);
        this.isDying = false;
    }//end constructor

    Turn = function (direction, speed) {
        if (this.isDying) {return}
        this.angle += direction * speed;
    }//end turn

}//end Actors class

class Player extends Actors {
    constructor(startX, startY, startAngle) {
        super(startX, startY, 99, startAngle, 12.5);
        this.charge = 0;
        this.isCharging = false;
        this.velocity = 0;
        this.zipColor = "#F2DB66";
        this.fade = 250;
        this.tip = () => {            
            let x = (this.x) + (Math.cos(this.angle * Math.PI / 180) * this.radius);
            let y = (this.y) - (Math.sin(this.angle * Math.PI / 180) * this.radius);
            return {x : x, y : y};
        }//end function
        this.lFlare = () => {
            let x = (this.x) + (Math.cos((this.angle + 150 - this.charge) * Math.PI / 180) * this.radius);
            let y = (this.y) - (Math.sin((this.angle + 150 - this.charge) * Math.PI / 180) * this.radius);
            return {x : x, y : y};
        }//end function
        this.rFlare = () => {
            let x = this.x + (Math.cos((this.angle - 150 + this.charge) * Math.PI / 180) * this.radius);
            let y = this.y - (Math.sin((this.angle - 150 + this.charge) * Math.PI / 180) * this.radius);
            return {x : x, y : y}
        }//end function
        this.launchPoint = {x : NaN, y : NaN}
        this.trail = []
        this.keyHeld = {key : "", isHeld : false}
        this.offScreenTimer = 60
    }//end constructor

    Move = function () {
        let velX = Math.cos(this.angle * (Math.PI/180)) * this.velocity * modifier
        let velY = Math.sin(this.angle * (Math.PI/180)) * this.velocity * modifier

        this.x += velX
        this.y -= velY

        this.Decelerate()
    }//end method

    Decelerate = function () {

        if (this.velocity > 0.05) {
            this.velocity *= .5
        } else {
            this.velocity = 0
            if (this.charge < 0) {
                this.charge = Math.abs(this.charge + 2) < 2 ? 0 : this.charge + 2
            }//end if
        }//end if
    }//end method

    Charge = function () {
        if (this.isDying) {return}
        this.charge += 0.2
        if (this.charge > 15) {
            this.charge = 15
        }//end method
    }//end method

    DrawZipLine = function () {
        ctx.strokeStyle = this.zipColor //yellow
        ctx.lineWidth = LINE_WIDTH * 2.5 * modifier

        for (let i = 0; i < this.trail.length; i++) {
            let x1 = this.trail[i].x
            let y1 = this.trail[i].y
            let x2 = i + 1 == this.trail.length ? this.x : this.trail[i + 1].x
            let y2 = i + 1 == this.trail.length ? this.y : this.trail[i + 1].y

            ctx.beginPath()
            ctx.moveTo(x1,y1)
            ctx.lineTo(x2,y2)
            ctx.closePath()
            ctx.stroke()
        }//end for

        ctx.lineWidth = LINE_WIDTH * modifier

    }//end method

    FadeZipLine = function () {
        let color = this.zipColor
        let fade = this.fade
        fade = fade.toString(16)
        fade += fade.length < 2 ? '0' : ""
        let fadedCol = `${color}${fade}`

        ctx.strokeStyle = fadedCol //yellow
        ctx.lineWidth = LINE_WIDTH * 2.5 * modifier * (this.fade / 255)

        for (let i = 0; i < this.trail.length; i++) {
            let x1 = this.trail[i].x
            let y1 = this.trail[i].y
            let x2 = i + 1 == this.trail.length ? this.x : this.trail[i + 1].x
            let y2 = i + 1 == this.trail.length ? this.y : this.trail[i + 1].y

            ctx.beginPath()
            ctx.moveTo(x1,y1)
            ctx.lineTo(x2,y2)
            ctx.closePath()
            ctx.stroke()
        }//end for

        ctx.lineWidth = LINE_WIDTH * modifier

        if (this.fade > 0) {
            this.fade -= 10
        } else if (this.fade == 0) {
            this.trail = []
        }//end method
    }//end method

    Bounce = function (isHorizontalReflection) {
        if (isHorizontalReflection) {
            this.angle = this.angle * -1            
        } else {
            let newAngle = 90 - this.angle
            newAngle *= 2
            newAngle += this.angle
            this.angle = newAngle
        }//end if
    }//end method

    Draw = function () {
        let x = this.x
        let y = this.y
        let angle = this.angle;
        let radius = this.radius;
        let charge = this.charge * 1.5;
        let tip = this.tip();
        let lFlare = this.lFlare();
        let rFlare = this.rFlare();

        if (this.charge != 0) {
            this.DrawZipLine()
        } else {
            this.FadeZipLine()
        }//end if

        ctx.strokeStyle = "#F2DB66"
        ctx.fillStyle = "#F28080"
        ctx.beginPath()
        ctx.moveTo(tip.x, tip.y)
        ctx.lineTo(lFlare.x, lFlare.y)
        ctx.moveTo(tip.x, tip.y)
        ctx.lineTo(rFlare.x, rFlare.y)
        ctx.lineTo(lFlare.x, lFlare.y)
        ctx.closePath()
        ctx.stroke()
        ctx.fill()
        ctx.beginPath()       
        ctx.moveTo(x,y)
        ctx.lineTo(tip.x,tip.y)
        ctx.closePath()
        ctx.stroke()

    }//end draw

}//end Player class

class Enemy extends Actors {
    constructor(startX, startY, startAngle, identification) {
        super(startX, startY, identification, startAngle, 12.5);
        this.velocity = 0.07;
        this.fill = "#03CEA4";
        this.stroke = "#223A59";
        this.fade = 255;
        this.fadeSpeed = 3;
        this.isAggro = false;
        this.atkTimer = 0;
    }//end constructor
    
    Move = function () {
        if (this.isDying) {return}
        
        //CALCULATE ROTATION
        //                       watchedY  - watcherY , watchedX - watcherX
        let angleRad = Math.atan2(-player.y + this.y, player.x - this.x)
        let degree = angleRad * 180 / Math.PI
        let theta = (this.angle - degree) % 360
        let reduction = 1

        //CALCULATE TURN
       if (theta > 180 - 3) {
            this.Turn(2, this.velocity)
       }//end if
       if (theta < 180 + 3) {
            this.Turn(-2, this.velocity)
        }//end if

       if (Math.abs(theta) > 90) {
           reduction = .3
        }//end if
        
        //CALCULATE DIST TO TARGET AND MOVE IF > 10 * MOD UNITS AWAY
        let distToPlayer = Distance(player.x, player.y, this.x, this.y)

       if (distToPlayer > 30 * modifier) {
           //MOVE CODE
            let velX = Math.cos(this.angle * (Math.PI/180)) * this.velocity * modifier * reduction
            let velY = Math.sin(this.angle * (Math.PI/180)) * this.velocity * modifier * reduction
            
            this.x += velX
            this.y -= velY
            this.atkTimer = 0

        } else {

            if (!this.isAggro) {return}

            //ATTACK CODE
            this.Attack()
       }//end if
    }//end method

    Attack = function () {
        this.atkTimer++       
        let x = this.x
        let y = this.y
        let rad = this.radius
        let angle = this.angle * (Math.PI / 180)  

        let exX = x + Math.cos(angle)*rad * 2
        let exY = y - Math.sin(angle)*rad * 2
        if (this.atkTimer == 35) {
            console.log(this.atkTimer)
            if (Math.abs(player.x - exX) < 15 * modifier && Math.abs(player.y - exY) < 15 * modifier) {
                console.log("player dead")
                player.isDying = true
                PlaySound(hit_water, 0.4)
            }//end if
        }
        if (this.atkTimer == 45) {
            console.log(this.atkTimer)
            this.atkTimer = 0                
        }
        //this.DrawAttack(this.atkTimer, x, y, rad, angle)
    }//end method
    
    DrawAttack = function (timer, x, y, rad, angle) {
        timer = timer > 34 ? 35 : timer;

        let extension = timer > 34 ? 2 : 1;
        let exX = x + Math.cos(angle)*rad * extension;
        let exY = y - Math.sin(angle)*rad * extension;
        let stroke = this.stroke;
        let tempRed = stroke[1] + stroke[2];
        let redVal = parseInt(tempRed) + (timer * 6);
        redVal = redVal.toString(16);
        let substring = stroke.substring(3);
        let newCol = `#${redVal}${substring}`;

        ctx.lineWidth = LINE_WIDTH * modifier * 2.5;
        ctx.strokeStyle = newCol;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        
        ctx.lineTo(exX, exY);
        ctx.stroke();
        ctx.lineWidth = LINE_WIDTH * modifier;

    }//end method
    
    HitCheck = function() {
        let hit = this.KillCheck();
        if (hit)  {
            PlaySound(hit_enemy, .7);
            player.velocity *= .7;
            
            this.isDying = true;
        }//end if
    }//end method

    Die = function () {
        enemyArray = enemyArray.filter(foe => foe.id !== this.id)
    }//end method
    
    Draw = function () {
        let x = this.x
        let y = this.y
        let radius = this.radius
        let angle = (this.angle * (Math.PI / 180))
        let fade = this.fade.toString(16)
        fade = fade.length < 2 ? `0${fade}` : fade        
        
        let fadedFill = `${this.fill}${fade}`
        let fadedStroke = `${this.stroke}${fade}`
        ctx.fillStyle = fadedFill
        ctx.strokeStyle = fadedStroke
        ctx.lineWidth = LINE_WIDTH * modifier            
        
        ctx.beginPath()
        ctx.arc(x, y, radius, angle, 2 * Math.PI + angle)
        ctx.fill()
        ctx.stroke()
        ctx.closePath()
        ctx.beginPath()
        ctx.moveTo(x + Math.cos(angle)*radius, y - Math.sin(angle)*radius)
        ctx.lineWidth = LINE_WIDTH * modifier * 2.5
        ctx.lineTo(x,y)
        ctx.stroke()
        ctx.closePath()
        
        ctx.lineWidth = LINE_WIDTH * modifier
        
        this.DrawAttack(this.atkTimer, x, y, radius, angle)
        
        if (this.isDying) {
            this.fade -= this.fadeSpeed
            if (this.fade <= 0) {
                this.isDying = false
                this.fade = 0
                this.Die()
            }//end if
        }//end if
    }//end method

}//end Enemy class

class Breaker extends Instances {
    constructor (startX, startY, identification) {
        super(startX, startY, identification, 10, 12.5);
    }//end constructor

    HitCheck = function() {
        let hit = this.KillCheck();
        if (hit)  {
            player.x = ((this.x + (12.5 * modifier)) + player.x) / 2            
            player.y = ((this.y + (12.5 * modifier)) + player.y) / 2
            PlaySound(hit_brick, .5)
            this.Die()
        }//end if
    }//end method

    Die = function () {
        breakerArray = breakerArray.filter(wall => wall.id !== this.id)
        player.velocity = 1
    }//end method

}//end Breaker class

class Water extends Instances {
    constructor (startX, startY, identification) {
        super(startX, startY, identification, 3, 12.5);
    }//end constructor

    HitCheck = function() {
        let hit = this.KillCheck();
        if (hit)  {
            player.velocity = 0;
            player.x = this.x + (12.5 * modifier);
            player.y = this.y + (12.5 * modifier);
            PlaySound(hit_water, 0.4);
            player.isDying = true;
        }//end if
    }//end method

}//end Water class

//#endregion

//STOPS SCREEN SCROLL FROM SPACEBAR PRESS
document.body.addEventListener("keydown", function (event) {
    if ((event.keyCode === 32 || event.key === "ArrowDown") && event.target === document.body) {
        event.preventDefault();
    }//end if
}, false);

//GRAB CANVAS ELEMENT FROM HTML DOC
const canvas = document.getElementById("cnvElem")
canvas.onload = UpdateAnimation
const gameDiv = document.getElementById("game-div")
const wrapper = document.getElementById("wrap")
const timeElement = document.getElementById("hTimer")
const attemptsElement = document.getElementById("hAttempts")

//GET CANVAS' 2D CONTEXT FOR X/Y INTERACTION
const ctx = canvas.getContext("2d")

//GET IMAGE OF WATER AND BRICK TILE AND PAUSED SCREEN
const water = new Image(25,25)
const brick = new Image(25,25)
const paused = new Image(100, 75)
const tooSmallImage = new Image()
const esc = new Image()
const restart = new Image()
const win = new Image()
const lose = new Image()
const intro_slides = [new Image(), new Image(), new Image(), new Image(), new Image()]
water.src = "resources/water_tile.svg"
brick.src = "resources/brick_tile.svg"
paused.src = "resources/paused.svg"
tooSmallImage.src = "resources/small.svg"
esc.src = "resources/esc.svg"
restart.src = "resources/restart.svg"
win.src = "resources/win.svg"
lose.src = "resources/lose.svg"
intro_slides[0].src = "resources/objects.png"
intro_slides[1].src = "resources/goals.png"
intro_slides[2].src = "resources/hazards.png"
intro_slides[3].src = "resources/controls.png"
intro_slides[4].src = "resources/counters.png"


//GET AUDIO FILES
const hit_brick = new Audio("./resources/audio/hit_brick.wav")
const hit_enemy = new Audio("./resources/audio/hit_enemy.wav")
const hit_water = new Audio("./resources/audio/hit_water.wav")
const shoot_sound = new Audio("./resources/audio/shoot.wav")
hit_brick.preload = 'auto'
hit_enemy.preload = 'auto'
hit_water.preload = 'auto'
shoot_sound.preload = 'auto'
hit_brick.load()
hit_enemy.load()
hit_water.load()
shoot_sound.load()

//CONST VARIABLES
const LINE_WIDTH = 2
const MIN_W = 400
const MIN_H = 300
const MAX_W = MIN_W * 2
const MAX_H = MIN_H * 2
const FLASH_MAX_COLOR = "#F2DB66"
const FLASH_ALPHAS = ["CC", "99", "66", "33", "00"]

//STORAGE FOR VIEWPORT/WINDOW SIZE
let heldWinWidth
let heldWinHeight

// MODIFIER STORES THE MULTIPLIER FOR IF WINDOW IS BIG ENOUGH TO EXPAND SCREEN
let modifier
let WIDTH
let HEIGHT

//GAME CONTROLLING VARIABLES
let player
let enemyArray
let breakerArray
let waterArray
let attempts
let shotClock
let shotTimer
let flashIndex
let isFlashing
let isGamePaused
let gameOver
let crashedTime
let rulesState = 0

function InitLoad() {
    let hasW400 = wrapper.classList.contains("w-400")
    gameOver = false
    clearInterval(shotTimer)
    
    //GET VIEWPORT/WINDOW SIZE
    heldWinWidth = window.innerWidth
    heldWinHeight = window.innerHeight
    
    //SET VIEW LIMITS
    modifier = heldWinWidth > MAX_W && heldWinHeight > MAX_H ? 2 : 1
    WIDTH = MIN_W * modifier
    HEIGHT = MIN_H * modifier
    if (hasW400 && modifier === 2) {        /////REWORK THIS
        wrapper.classList.toggle("w-400")
        wrapper.classList.toggle("w-800")
    } else if (!hasW400 && modifier === 1) {
        wrapper.classList.toggle("w-400")
        wrapper.classList.toggle("w-800")
    }//end if
    
    canvas.width = WIDTH
    canvas.height = HEIGHT
    if (rulesState < intro_slides.length) {
        clearInterval(init)
        //CHECK FOR KEYPRESS TO ADVANCE THROUGH 2 SLIDES.
        DrawImage(intro_slides[rulesState], 0, 0, canvas.width, canvas.height);
        //DrawOptionsMenuItem(intro_slides[rulesState], 0, 0, canvas.width, canvas.height)
        console.log(rulesState)
    } else {
        LoadGame()
        
        //UPDATES ANIMATION
        UpdateAnimation();
    
        addEventListener("keydown", PlayerAction) 
        addEventListener("keyup", EndPlayerAction) 
        removeEventListener("keydown", Select)
    }//end if
    rulesState++
}//end method

function LoadGame() {
    let hasW400 = wrapper.classList.contains("w-400")
    gameOver = false
    clearInterval(shotTimer)
    
    //GET VIEWPORT/WINDOW SIZE
    heldWinWidth = window.innerWidth
    heldWinHeight = window.innerHeight
    
    //SET VIEW LIMITS
    modifier = heldWinWidth > MAX_W && heldWinHeight > MAX_H ? 2 : 1
    WIDTH = MIN_W * modifier
    HEIGHT = MIN_H * modifier
    if (hasW400 && modifier === 2) {        /////REWORK THIS
        wrapper.classList.toggle("w-400")
        wrapper.classList.toggle("w-800")
    } else if (!hasW400 && modifier === 1) {
        wrapper.classList.toggle("w-400")
        wrapper.classList.toggle("w-800")
    }//end if
    
    canvas.width = WIDTH
    canvas.height = HEIGHT
    
    //GAME HANDLING VARIABLES
    isGamePaused = WIDTH < MIN_W && HEIGHT < MIN_H
    flashIndex = 0
    isFlashing = false

    //CREATE GAMELOOP VARIABLES
    enemyArray = []
    breakerArray = []
    waterArray = []

    //INSTANTIATE PLAYER
    px = Math.floor(Math.random() * ((MIN_W - 25) / 25)) * 25
    py = Math.floor(Math.random() * ((MIN_H - 25) / 25)) * 25
    player = new Player(px, py, px+py)
    crashedTime = 90
    
    GenerateObjects()
    
    //SET GAME HANDLING VALUES
    attempts = enemyArray.length + 1
    attemptsElement.innerText = `ATTEMPTS: ${attempts}`
    shotClock = 10 //seconds
    shotTimer = setInterval(CountDown, 1000)
    timeElement.innerText = shotClock + "s"
}//end method

function CountDown() {
    if (isGamePaused) {return}

    if (shotClock <= 1) {
        clearInterval(shotTimer)
        enemyArray.forEach((foe) => {
            foe.isAggro = true
            foe.velocity = 1.5
        })//end for
        attempts = 0
        attemptsElement.innerText = `ATTEMPTS: ${attempts}`        
    }//end if
    shotClock--
    timeElement.innerText = shotClock + "s"
}//end method

function GenerateObjects() {
    let hit = 0
    for (let y = 0; y < MIN_H; y += 25) {
        for(let x = 0; x < MIN_W; x += 25) {
            let createChance = Math.random()
            if (createChance < .02 && (x !== px || y !== py)) {
                breakerArray.push(new Breaker(x,y, `${x}${y}`))
                hit++
            } else if (createChance < .05 && (x !== px || y !== py)) {
                enemyArray.push(new Enemy(x,y,(x * y) * (Math.PI / 180), `${x}${y}`))
                hit++
            } else if (createChance < .12 && (x !== px || y !== py)) {
                waterArray.push(new Water(x, y,))
                hit++
            }//end if
        }//end for
    }//end for
}//end method

function DrawImage(image, x, y, w, h) {
    ctx.drawImage(image, x, y, w, h);
}//end method

function PlaySound(sfx, volume) {
    let click = sfx.cloneNode()
    click.volume = volume
    click.play()
}//end method
    

function DrawGrid() {
    ctx.strokeStyle = "#111"

    for (let i = 0; i < WIDTH; i+= 25 * modifier) {
        ctx.beginPath()
        ctx.moveTo(i,0)
        ctx.lineTo(i,HEIGHT)
        ctx.closePath()
        ctx.stroke()
    }//end for
    for (let i = 0; i < HEIGHT; i += 25 * modifier) {
        ctx.beginPath()
        ctx.moveTo(0,i)
        ctx.lineTo(WIDTH,i)
        ctx.closePath()
        ctx.stroke()
    }//end for
}//end method

function UpdateAnimation() {

    //WINDOW RESIZE CHECK
    if (heldWinWidth != window.innerWidth || heldWinHeight != window.innerHeight) {        
        heldWinHeight = window.innerHeight;
        heldWinWidth = window.innerWidth;
        let hasW400 = wrapper.classList.contains("w-400")

        if (heldWinWidth > MAX_W + 30 && heldWinHeight > MAX_H + 10) {
            let prevMod = modifier
            modifier = 2
            UpdateStep(prevMod)
            if (hasW400) {
                wrapper.classList.toggle("w-400")
                wrapper.classList.toggle("w-800")
            }//end if
        } else {
            if (!hasW400) {
                wrapper.classList.toggle("w-400")
                wrapper.classList.toggle("w-800")
            }//end if
            let prevMod = modifier
            modifier = 1        
            UpdateStep(prevMod)
        }//end if
    
        WIDTH = MIN_W * modifier
        HEIGHT = MIN_H * modifier
        canvas.style.maxWidth = `${WIDTH.toString()}px`    
        canvas.style.maxHeight = `${HEIGHT.toString()}px`
        gameDiv.style.height = `${HEIGHT.toString()}px`
        canvas.width = WIDTH
        canvas.height = HEIGHT
    }//end if


    if (!gameOver) {
    
        ctx.clearRect(0,0,canvas.width, canvas.height)
        let tooSmall = heldWinHeight < HEIGHT || heldWinWidth < WIDTH
        if (tooSmall) {
            //PAUSE GAME (STOP DRAWING)
            isGamePaused = true        
            console.log("VIEWPORT TOO SMALL!!")
        }//end if
    
        if (!isGamePaused) {

            Step();
            DrawStep();

        } else {
            //GAME IS PAUSED
            ctx.fillStyle = "#5C3447"
            ctx.rect(0,0,canvas.width, canvas.height)
            ctx.fill()        
            DrawImage(paused, 0, HEIGHT * .25, WIDTH, HEIGHT * .75);
            DrawImage(restart, 0, 0, WIDTH, HEIGHT * .25);
            if (tooSmall) {
                DrawImage(tooSmallImage, 0, HEIGHT * .75, WIDTH, HEIGHT * .25);
            } else {
                DrawImage(esc, 0, HEIGHT * .75, WIDTH, HEIGHT * .25);
            }//end if
        }//end else
        if (attempts !== 0 && !isGamePaused) {
            console.log("Not Yet")
            ctx.fillStyle = "#6C9BD944"
            ctx.rect(0, 0, canvas.width, canvas.height)
            ctx.fill()
        }//end if
    } // end gameOver check

    if (crashedTime <= 0) {
        ctx.fillStyle = "#5C3447"
        ctx.rect(0,0,canvas.width, canvas.height)
        ctx.fill()
        DrawImage(lose, 0, HEIGHT * .25, canvas.width, HEIGHT * .75);
        DrawImage(restart, 0, 0, canvas.width, HEIGHT * .25);
        attempts = 0
        attemptsElement.innerText = `ATTEMPTS: ${attempts}`
        shotClock = 0
        timeElement.innerText = shotClock + "s"
        gameOver = true
    } else if (enemyArray.length === 0) {
        ctx.fillStyle = "#5C3447"
        ctx.rect(0,0,canvas.width, canvas.height)
        ctx.fill()
        DrawImage(win, 0, HEIGHT * .25, canvas.width, HEIGHT * .75);
        DrawImage(restart, 0, 0, canvas.width, HEIGHT * .25);
        attempts = 0
        attemptsElement.innerText = `ATTEMPTS: ${attempts}`
        shotClock = 0
        timeElement.innerText = shotClock + "s"
        gameOver = true
    }//end if

    requestAnimationFrame(UpdateAnimation);
}//END FUNCTION

function PauseGame() {
    if (heldWinWidth < MIN_W || heldWinHeight < MIN_H) {
        return
    }
    isGamePaused = !isGamePaused
}//end method

function EdgeCheck() {
    let isHorizontalReflection = true
    let playerX = player.tip().x
    let playerY = player.tip().y
    if (playerX > WIDTH || playerX < 0) {
        player.trail.push({x : playerX, y : playerY})
        player.Bounce(!isHorizontalReflection)
    }//end if
    if (playerY > HEIGHT || playerY < 0) {
        player.trail.push({x : playerX, y : playerY})
        player.Bounce(isHorizontalReflection)
    }//end if
}//end method

function OffScreenCheck() {
    let playerX = player.tip().x
    let playerY = player.tip().y
    if (playerX < 0 || playerX > WIDTH || playerY > HEIGHT || playerY < 0) {
        player.offScreenTimer -= 1
        if (player.offScreenTimer <= 0) {
            player.x = player.launchPoint.x
            player.y = player.launchPoint.y
            player.offScreenTimer = 60
        }//end if
    }//end if
}//end method

function UpdateStep(oldMod) {
    player.Update(oldMod)
    enemyArray.forEach((foe) => {
        foe.Update(oldMod)
    })
    breakerArray.forEach((wall) => {
        wall.Update(oldMod)
    })
    waterArray.forEach((pool) => {
        pool.Update(oldMod)
    })
}//end method

function Distance(x1, y1, x2, y2) {
    let distSq = Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)
    return Math.sqrt(distSq)
}//END METHOD

function Flash() {
    let color = FLASH_MAX_COLOR.toString() + FLASH_ALPHAS[flashIndex].toString()
    ctx.fillStyle = color
    ctx.rect(0,0,canvas.width,canvas.height)
    ctx.fill()
    flashIndex++
}//end method

function DrawStep() {
    DrawGrid()      
    breakerArray.forEach((wall) => {
        wall.Draw(brick)        
    })
    waterArray.forEach((pool) => {
        pool.Draw(water)
    })
    enemyArray.forEach((foe) => {
        foe.Draw()
    })//end for
    player.Draw()
}//end method

function Step() {
    player.Move()     

    breakerArray.forEach((wall) => {    
        wall.HitCheck()
    })

    waterArray.forEach((pool) => {
        pool.HitCheck()
    })

    enemyArray.forEach((foe) => {
        foe.Move()
        foe.HitCheck()
    })//end for

    EdgeCheck()
    OffScreenCheck()

    if (player.keyHeld.isHeld === true) {
        let rotate = false

        if (player.keyHeld.key === "a") {
            rotate = +2
        } else if (player.keyHeld.key === "d") {
            rotate = -2
        }//end if
        if (rotate) {
            player.Turn(rotate, 1)                        
        }//end if
    }//end if

    if (player.isCharging) {
        player.Charge()
    }//end if

    if (isFlashing) {
        Flash()
        if (flashIndex == FLASH_ALPHAS.length) {
            isFlashing = false
            flashIndex = 0
        }//end if
    }//end if
    if (player.isDying) {
        crashedTime--
    }//end if
}//end method

function PlayerAction(e) {

    let key = e.key.toLowerCase()

    if (key === "k" && (isGamePaused || gameOver)) {
        LoadGame()
    }//end if

    //COOLDOWN AFTER ATTACK AND CHECK FOR DEAD PLAYER
    if (player.charge < 0 || player.isDying) { return }

    switch(key) {
        case "escape":
            PauseGame();
            break;

        case "a":
        case "arrowleft":
            console.log("LEFT hit")
            player.keyHeld.key = "a";
            player.keyHeld.isHeld = true;
            break;

        case "d":
        case "arrowright":
            player.keyHeld.key = "d";
            player.keyHeld.isHeld = true;
            break;

        case " ":
        case "arrowdown":
        case "s":
            player.launchPoint = {x : player.x, y : player.y};
            player.isCharging = true;
            player.trail = [];
            break;
    }//end switch

}//end method


function EndPlayerAction(e) {

    if (rulesState === intro_slides.length + 1) {
        rulesState = 0
        return
    }
    //COOLDOWN AFTER ATTACK AND CHECK FOR DEAD PLAYER
    if (player.charge < 0 || player.isDying) { return }
    
    let key = e.key.toLowerCase()

    switch (key) {
        case " ":
        case "arrowdown":
        case "s":
            player.velocity = 10 * player.charge
            player.charge = -15
            player.isCharging = false
            player.fade = 250
            player.trail = [{x: player.x , y : player.y}]
            isFlashing = true
            PlaySound(shoot_sound, .1)
            attempts--

            if (attempts <= 0) {
                enemyArray.forEach((foe) => {
                    foe.isAggro = true
                    foe.velocity = 1.5
                    attempts = 0   
                    clearInterval(shotTimer)         
                })//end for
            }//end if
            attemptsElement.innerText = `ATTEMPTS: ${attempts}`

            if (shotClock < 5 && shotClock > 0) {
                shotClock = 5
                clearInterval(shotTimer)
                shotTimer = setInterval(CountDown, 1000)
                timeElement.innerText = shotClock + "s"
            }//end if
            break;
    }//end switch
    
    player.keyHeld.isHeld = false
    player.keyHeld.key = ""
}//end method

//addEventListener("keydown", InitLoad)
let init = setInterval(InitLoad, 250)
addEventListener("keydown", Select)

function Select(e) {
    if (e.key === " ") {
        InitLoad()
    }//end if
}//end method