"use strict";

//document constants
const RAINBOW_GAME_FRAME = "rainbow-game";
const RAINBOW_GAME_SHELL = "rainbow-game-shell"
const RAINBOW_IMAGE = "rainbow-wheel-img";
const RAINBOW_CANVAS = "rainbow-canvas";
const RESIZABLE = true;

//Canvas constants
const CANVAS_BACKGROUND_COLOR="black";
const CANVAS_PADDING = 0; //in Percent
const CANVAS_FONT = "arial";
const CANVAS_ANIMATION_SPEED = 300 //in milliseconds
const CANVAS_FRAME_RATE = 20;
//Canvas - letter constants
const CANVAS_LETTER_PADDING = 16; //in Percent
const CANVAS_LETTER_RADIUS = 14;
const CANVAS_LETTER_BACKGROUND_COLOR = "rgb(255, 162, 0)";
const CANVAS_PLAYABLE_LETTER_RADIUS_RATIO = 1.05;
const CANVAS_SELECTED_LETTER_BACKGROUND_COLOR = "gold";
const CANVAS_PLAYABLE_LETTER_BACKGROUND_COLOR = "white";
const CANVAS_LETTER_COLOR = "rgb(20,20,20)";
//Canvas - key constants
const CANVAS_KEY_FONT_RATIO = 25; //less is bigger
const CANVAS_KEY_FONT_COLOR ="rgb(255, 162, 0)";
//Canvas - moves constants
const CANVAS_MOVES_FONT_COLOR = "rgb(255, 162, 0)";
const CANVAS_MOVES_FONT_RATIO = 25

//game constants
const RAINBOW = 'SHERDOG'; // Must be 7 letters
const RAINBOW_LENGTH = 7;
if( RAINBOW.length != RAINBOW_LENGTH ){ throw 'Error RAINBOW not well defined'; };
const DIFFICULTIES = ["LW","WW","MW","HW"];
const VERY_EASY = 0;
const EASY = 1;
const MEDIUM =2;
const HARD =3;
const STARTING_DIFFICULTY = EASY;
const PRIME = 31;


////////////////////
///////GAME////////
///////////////////

//Game Constructor
function Game(name,prime,difficulty){
    this.carousel = name.split("");
    this.carousel.push(null); //one of the nodes should be empty
    this.startingCarousel = this.carousel;
    this.carouselMapping = Array.apply(null, {length: this.carousel.length}).map(Number.call, Number); //generate [0,1,2,3,4,5,6,7] array (based on carousel length)
    this.prime = prime;
    this.key = "";
    this.movesCounter = 0;
    this.difficulty = difficulty;
}

//Key must be a String
Game.prototype.generate = function(decryptedKey){
    if (arguments.length === 1) {
        //make sure the func arg is of String type.
        if (Object.prototype.toString.call(decryptedKey) !== "[object String]"){
            throw 'Error generate() paramater must be of type: "String"';
        }
        // Game.code = key;
        this.key = decryptedKey;
        var keyArr = decryptedKey.split("");
    } else {
        // argument not passed
        var keyArr = shuffle(this.carouselMapping);
        this.key = keyArr.join("");
    }
        var tempArray = [];
        for (var i = 0; i < keyArr.length; i++) {
            tempArray[i] = this.carousel[keyArr[i]];
        }
        this.carousel = tempArray;
};
Game.prototype.encryptKey = function(){
    return convertBase(((parseInt(this.key) * this.prime) + this.prime).toString(), 10, 32);;
};
Game.prototype.decryptKey = function(key){
    var baseTenKey = convertBase(key, 32, 10);
    var result = ((parseInt(baseTenKey) - this.prime) / this.prime).toString();
    if (!result.includes("0"))
        result = "0" + result;

    return result;
};
Game.prototype.isKeyValid = function(key){
    key = key.replace('#','');
    if (!isNumeric(key))
        return false;
    var decryptedKey = this.decryptKey(key);
    if(this.encryptKey(decryptedKey) !== key || decryptedKey.length !== this.carouselMapping.length)
        return false;
    for (var i = 0; i < this.carouselMapping.length; i++) {
        var occurences = (decryptedKey.match(new RegExp(this.carouselMapping[i],"g")) || []).length; // check how many of the mapped chars are in the decrypted key.
        if(occurences != 1){
            return false;
        }
    }
    return true;
}
Game.prototype.isGameFinished = function(){
    var carouselPointer = this.carousel.indexOf(null)+1;
    for (var i = 0; i < RAINBOW.length; i++) {
        if(carouselPointer === this.carousel.length){
            carouselPointer = 0;
        }
        if ( RAINBOW[i] !== this.carousel[carouselPointer] ){
            return false;
        }
        carouselPointer++;
    }
    return true;
}
Game.prototype.playMove = function(index){
    this.movesCounter++;
    var oppositeCell = index + this.carousel.length/2;
    if(oppositeCell >= this.carousel.length){
        oppositeCell = index - this.carousel.length/2;
    }
    if(this.carousel[oppositeCell] === null){
        this.carousel[oppositeCell] = this.carousel[index];
        this.carousel[index] = null;
        return [{"value": this.carousel[oppositeCell],"from": index,"to": oppositeCell}]
    }
    var emptyCellIndex = this.carousel.indexOf(null);
    var playedMovesLog = [];

    playedMovesLog.push({"value": this.carousel[index],"from": index,"to": emptyCellIndex});
    this.carousel[emptyCellIndex] = this.carousel[index];
    playedMovesLog.push({"value": this.carousel[oppositeCell],"from": oppositeCell,"to": index});
    this.carousel[index] = this.carousel[oppositeCell];
    this.carousel[oppositeCell] = null;

    return playedMovesLog;
}

Game.prototype.playable = function(){
    if(this.difficulty === VERY_EASY){
        var tempArray = [];
        for (var i = 0; i < this.carousel.length; i++) {
            if(this.carousel[i] != null){
                tempArray.push(i);
            }
        }
        return tempArray;
    }
    var nullLocation = this.carousel.indexOf(null);
    var left = leftIndex(this.carousel,nullLocation);
    var right = rightIndex(this.carousel,nullLocation);
    if(this.difficulty === HARD){
        return [left,right];
    }
    var doubleLeft = leftIndex(this.carousel,left);
    var doubleRight = rightIndex(this.carousel,right);
    if(this.difficulty === MEDIUM){
        return [left,right,doubleLeft,doubleRight];
    }
    // in case it's EASY
    return [left,right,doubleLeft,doubleRight,rightIndex(this.carousel,doubleRight),leftIndex(this.carousel,doubleLeft)];
}
Game.prototype.reset = function(){
    this.carousel = this.startingCarousel;
    this.generate(this.key);
    this.movesCounter = 0;
}

/////////////////////
///////CANVAS////////
/////////////////////
//Rainbow canvas constructor
function Canvas(canvasElement, paddingPercent, imageID, frameID, game){

    this.paddingPercent = paddingPercent;
    this.frame = document.getElementById(frameID);
    // this.size = Math.min( this.frame.clientWidth,  this.frame.clientHeight);
    this.size = this.frame.clientWidth;
    this.padding = (paddingPercent / 100) * this.size;;

    this.canvasElement = document.getElementById(canvasElement);
    this.canvasContext = this.canvasElement.getContext("2d");


    this.image = document.getElementById(imageID);
    this.game = game;  

    this.movingLetters = {};
    for (var i = 0; i < this.game.carousel.length; i++) {
        this.movingLetters[this.game.carousel[i]] = null;
    }
    this.animationInAction = false;
}
Canvas.prototype.resetSize = function(){
    // this.size = Math.min( this.frame.clientWidth,  this.frame.clientHeight);
    this.size = this.frame.clientWidth;
    this.padding = (this.paddingPercent / 100) * this.size;
    this.canvasElement.setAttribute("height",this.size);
    this.canvasElement.setAttribute("width",this.size);

}
Canvas.prototype.reDraw = function(){
    this.canvasContext.fillStyle = CANVAS_BACKGROUND_COLOR;
    this.canvasContext.fillRect(0, 0, this.size, this.size);
    this.canvasContext.drawImage(this.image, this.padding, this.padding, this.size-this.padding*2, this.size-this.padding*2);

    this.drawKey();
    this.drawMoves();
    for (var i = 0; i < this.game.carousel.length; i++) {
        if(this.game.carousel[i] != null){
            if(this.movingLetters[this.game.carousel[i]] == null){
                var playable = false;
                if(this.game.playable().includes(i)){
                    playable = true;
                }
                this.drawLetterInCorner(this.game.carousel[i],i,CANVAS_LETTER_BACKGROUND_COLOR,playable);
            }else{
                var position = this.movingLetters[this.game.carousel[i]];
                this.drawLetter(this.game.carousel[i],position.x,position.y,CANVAS_LETTER_BACKGROUND_COLOR,false);
            }
        }
    }
}
Canvas.prototype.drawKey = function(){
    var text = "#" + this.game.encryptKey();
    var fontSize = this.size/CANVAS_KEY_FONT_RATIO;
    var fontStyle = CANVAS_FONT;
    var font = "bold " + fontSize +"px "+fontStyle;
    this.canvasContext.fillStyle = CANVAS_KEY_FONT_COLOR; // font color to write the text with
    this.canvasContext.font = font;
    this.canvasContext.fillText(text, (this.size - (this.size *(30/100)))/CANVAS_KEY_FONT_RATIO ,this.size/CANVAS_KEY_FONT_RATIO);
}
Canvas.prototype.drawMoves = function(){
    var text = DIFFICULTIES[this.game.difficulty]+" "+this.game.movesCounter;
    var fontSize = this.size/CANVAS_MOVES_FONT_RATIO;
    var fontStyle = CANVAS_FONT;
    var font = "bold " + fontSize +"px "+fontStyle;
    this.canvasContext.fillStyle = CANVAS_MOVES_FONT_COLOR; // font color to write the text with
    this.canvasContext.font = font;
    this.canvasContext.fillText(text, this.size-fontSize-fontSize/2*text.toString().length ,this.size/CANVAS_MOVES_FONT_RATIO);
}
Canvas.prototype.drawLetterInCorner = function(letter, position,backgroundColor,playable){

    var pos = this.positionLetter(position);
    this.drawLetter(letter,pos.x,pos.y,backgroundColor,playable);
}
Canvas.prototype.drawLetter = function(letter, xPosition, yPosition, backgroundColor, playable){
    //Styling
    var text = letter;
    // var backgroundColor = CANVAS_LETTER_BACKGROUND_COLOR;
    var textColor = CANVAS_LETTER_COLOR;
    var letterRadius = this.size/CANVAS_LETTER_RADIUS; 
    var bold = true;

    if(bold){
        bold = "bold ";
    }
    else{
        bold = "";
    }

    if(playable){
        this.canvasContext.fillStyle = CANVAS_PLAYABLE_LETTER_BACKGROUND_COLOR;
        this.canvasContext.beginPath();
        this.canvasContext.arc(xPosition, yPosition, letterRadius*CANVAS_PLAYABLE_LETTER_RADIUS_RATIO, 0, Math.PI * 2);
        this.canvasContext.closePath();
        this.canvasContext.fill();
    }
    this.canvasContext.fillStyle = backgroundColor;
    this.canvasContext.beginPath();
    this.canvasContext.arc(xPosition, yPosition, letterRadius, 0, Math.PI * 2);
    this.canvasContext.closePath();
    this.canvasContext.fill();
    this.canvasContext.fillStyle = textColor; // font color to write the text with
    var fontStyle = CANVAS_FONT;
    var font = bold + letterRadius +"px " + fontStyle;
    this.canvasContext.font = font;
    // Move it down by half the text height and left by half the text width
    var width = this.canvasContext.measureText(text).width;
    var height = this.canvasContext.measureText("w").width; // this is a GUESS of height
    this.canvasContext.fillText(text, xPosition - (width/2) ,yPosition + (height/2));

    // To show where the exact center is:
    // this.canvasContext.fillRect(pos,pos,5,5);
}
Canvas.prototype.positionLetter = function(index){
    var letterPadding = (CANVAS_LETTER_PADDING / 100) * this.size;
    var x = this.size/2 + (this.size/2-this.padding-letterPadding) * Math.cos((2*Math.PI)/16*((index+1)*2-1));
    var y = this.size/2 + (this.size/2-this.padding-letterPadding) * Math.sin((2*Math.PI)/16*((index+1)*2-1));
    return {"x":x,"y":y};
}
Canvas.prototype.positionResetButton = function(){
    var letterPadding = (CANVAS_LETTER_PADDING / 100) * this.size;
    var x = this.size/2 + (this.size/2-this.padding-letterPadding) * Math.cos((2*Math.PI)/16*((index+1)*2-1));
    var y = this.size/2 + (this.size/2-this.padding-letterPadding) * Math.sin((2*Math.PI)/16*((index+1)*2-1));
    return {"x":x,"y":y};
}
Canvas.prototype.animateLetterMovement = async function(letter, startPosition, endPosition, milliseconds){

    var frameRate = CANVAS_FRAME_RATE; //in milliseconds
    var frames = milliseconds / frameRate;
    var startPos = this.positionLetter(startPosition);
    var endPos = this.positionLetter(endPosition);
    this.movingLetters[letter] = {"x":startPos.x , "y":startPos.y };
    var xAxisMovementRate = (endPos.x - startPos.x )/frames;
    var yAxisMovementRate = (endPos.y - startPos.y)/frames;
    this.animationInAction = true;
    for (var i = 0; i < frames; i++) {
        await sleep(frameRate);
        startPos.x += xAxisMovementRate;
        startPos.y += yAxisMovementRate;
        // console.log(this.movingLetters);
        this.movingLetters[letter] = {"x":startPos.x , "y":startPos.y };
        this.reDraw();
    }
    
    this.animationInAction = false;
    this.movingLetters[letter] = null;
    this.reDraw();

}
Canvas.prototype.getMousePos = function(event){
    var rect = this.canvasElement.getBoundingClientRect();
    return {
        x: Math.round((event.clientX-rect.left)/(rect.right-rect.left)*this.size),
        y: Math.round((event.clientY-rect.top)/(rect.bottom-rect.top)*this.size)
    };
}

//////////////////////////
////UTILITY FUNCTIONS////
////////////////////////
function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
function rightIndex(array, i){
    var index = i+1;
    if(index == array.length){
        index = 0;
    }
    return index;
}
function leftIndex(array, i){
    var index = i-1;
    if(index < 0){
        index = array.length-1;
    }
    return index;
}
Array.prototype.contains = function(element){
    return this.indexOf(element) > -1;
};

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function convertBase(value, from_base, to_base) {
    var range = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/'.split('');
    var from_range = range.slice(0, from_base);
    var to_range = range.slice(0, to_base);

    var dec_value = value.split('').reverse().reduce(function (carry, digit, index) {
    if (from_range.indexOf(digit) === -1) throw new Error('Invalid digit `'+digit+'` for base '+from_base+'.');
    return carry += from_range.indexOf(digit) * (Math.pow(from_base, index));
    }, 0);

    var new_value = '';
    while (dec_value > 0) {
        new_value = to_range[dec_value % to_base] + new_value;
        dec_value = (dec_value - (dec_value % to_base)) / to_base;
    }
    return new_value || '0';
}

/////////////////////
////////MAIN/////////
/////////////////////
window.onload = function() {
    var gameFrame = document.getElementById(RAINBOW_GAME_FRAME);
    // var canvasSize = Math.min( gameFrame.clientWidth,  gameFrame.clientHeight);
    var outerShell = document.getElementById(RAINBOW_GAME_SHELL);
    var newWidth = gameFrame.offsetWidth;
    var newHeight = gameFrame.offsetWidth;
    outerShell.style.cssText = "height: "+newHeight+"px; width: "+newWidth+"px; font-size: "+newHeight/50+"px;";

    var game = new Game(RAINBOW, PRIME, STARTING_DIFFICULTY);
    // game.generate("56701234");
    game.generate();

    var canvas = new Canvas(RAINBOW_CANVAS, CANVAS_PADDING, RAINBOW_IMAGE, RAINBOW_GAME_FRAME, game);
    canvas.resetSize();
    canvas.reDraw();

    //on Resize
    window.onresize = function(event) {
        newWidth = gameFrame.offsetWidth;
        newHeight = gameFrame.offsetWidth;
        outerShell.style.cssText = "height: "+newHeight+"px; width: "+newWidth+"px; font-size: "+newHeight/50+"px;";
        if(RESIZABLE){
            canvas.resetSize();
            canvas.reDraw();
        }
    };

    //Click Listener
    canvas.canvasElement.addEventListener('click', function(event){
        var mousePos = canvas.getMousePos(event);
        var letterRadius = canvas.size/CANVAS_LETTER_RADIUS;
        var playableLetters = game.playable();
        var playedMoves = [];


        for (var i = 0; i < playableLetters.length; i++) {
            var letterCoordinates = canvas.positionLetter(playableLetters[i]);
            if(Math.abs(letterCoordinates.x - mousePos.x) <= letterRadius && Math.abs(letterCoordinates.y - mousePos.y) <= letterRadius ){
                playedMoves = game.playMove( playableLetters[i] );
            }
        }

        if(playedMoves.length > 0){
            for (var i = 0; i < playedMoves.length; i++) {    
                canvas.animateLetterMovement(playedMoves[i].value,playedMoves[i].from, playedMoves[i].to, CANVAS_ANIMATION_SPEED);
            }
        }
        if(game.isGameFinished()){
            
        }
    },false);
    //Mouse Movement Listener
    canvas.canvasElement.addEventListener('mousemove', function(event) {
        if(!canvas.animationInAction){
            var mousePos = canvas.getMousePos(event);
            var letterRadius = canvas.size/CANVAS_LETTER_RADIUS;
            var playableLetters = game.playable();
            canvas.reDraw();
            for (var i = 0; i < playableLetters.length; i++) {
                var letterCoordinates = canvas.positionLetter(playableLetters[i]);
                if(Math.abs(letterCoordinates.x - mousePos.x) <= letterRadius && Math.abs(letterCoordinates.y - mousePos.y) <= letterRadius ){
                    canvas.drawLetterInCorner(game.carousel[playableLetters[i]],playableLetters[i],CANVAS_SELECTED_LETTER_BACKGROUND_COLOR);
                }
            }
        }
    },false);

};

