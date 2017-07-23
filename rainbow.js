"use strict";

//document constants
const RAINBOW_GAME_FRAME = "rainbow-game";
const RAINBOW_IMAGE = "rainbow-wheel-img";
const RAINBOW_CANVAS = "rainbow-canvas";
const RESIZABLE = true;

//Canvas constants
const CANVAS_PADDING = 5; //in Percent
const CANVAS_FONT = "serif";
const CANVAS_KEY_FONT_RATIO = 25; //less is bigger
//Canvas - letter constants
const CANVAS_LETTER_PADDING = 8; //in Percent
const CANVAS_LETTER_RADIUS = 20;
const CANVAS_LETTER_BACKGROUND_COLOR = "orange";
const CANVAS_LETTER_COLOR = "black";

//game constants
const RAINBOW = 'SHERDOG'; // Must be 7 letters
const RAINBOW_LENGTH = 7;
if(RAINBOW.length != RAINBOW_LENGTH){
    throw 'Error RAINBOW not well defined';
}

const PRIME = 31;


//Game Constructor
function Game(name,prime){
    this.carousel = name.split("");
    this.carousel.push(null); //one of the nodes should be empty
    this.carouselMapping = Array.apply(null, {length: this.carousel.length}).map(Number.call, Number); //generate [0,1,2,3,4,5,6,7] array (based on carousel length)
    this.prime = prime;
    this.key = "";
}

//Key must be a String
Game.prototype.generate = function(decryptedKey){
    if (arguments.length) {
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
    var plusOne = index+1;
    if(plusOne == this.carousel.length){
        plusOne = 0;
    }
    var minusOne = index-1;
    if(minusOne == -1){
        minusOne = this.carousel.length-1;
    }
    var oppositeCell = index + this.carousel.length/2;
    if(oppositeCell > this.carousel.length){
        oppositeCell = index - this.carousel.length/2;
    }

    if(carousel[plusOne] == null){
        var emptyCellIndex = plusOne;
    }
    else {
        var emptyCellIndex = minusOne;
    }

    this.carousel[emptyCellIndex] = this.carousel[index];
    this.carousel[index] = this.carousel[oppositeCell];
    this.carousel[oppositeCell] = null;
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
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
}
Canvas.prototype.resetSize = function(){
    // this.size = Math.min( this.frame.clientWidth,  this.frame.clientHeight);
    this.size = this.frame.clientWidth;
    this.padding = (this.paddingPercent / 100) * this.size;

}
Canvas.prototype.reDraw = function(){
    this.resetSize();
    this.canvasElement.setAttribute("height",this.size);
    this.canvasElement.setAttribute("width",this.size);
    this.canvasContext.drawImage(this.image, this.padding, this.padding, this.size-this.padding*2, this.size-this.padding*2);

    this.drawKey();
    for (var i = 0; i < this.game.carousel.length; i++) {
        if(this.game.carousel[i] != null){
            this.drawLetter(this.game.carousel[i],i);
        }
    }
}
Canvas.prototype.drawKey = function(){
    var text = "#" + this.game.encryptKey();
    var fontSize = this.size/CANVAS_KEY_FONT_RATIO;
    var fontStyle = CANVAS_FONT;
    var font = "bold " + fontSize +"px "+fontStyle;
    this.canvasContext.fillStyle = "black"; // font color to write the text with
    this.canvasContext.font = font;
    this.canvasContext.fillText(text, (this.size - (this.size *(30/100)))/CANVAS_KEY_FONT_RATIO ,this.size/CANVAS_KEY_FONT_RATIO);
}
Canvas.prototype.drawLetter = function(letter, position){
    //Styling
    var text = letter;
    var backgroundColor = CANVAS_LETTER_BACKGROUND_COLOR;
    var textColor = CANVAS_LETTER_COLOR;
    var letterRadius = this.size/CANVAS_LETTER_RADIUS; 
    var bold = true;

    if(bold){
        bold = "bold ";
    }
    else{
        bold = "";
    }

    var pos = this.positionLetter(position);

    this.canvasContext.fillStyle = backgroundColor;
    this.canvasContext.beginPath();
    this.canvasContext.arc(pos.x, pos.y, letterRadius, 0, Math.PI * 2);
    this.canvasContext.closePath();
    this.canvasContext.fill();
    this.canvasContext.fillStyle = textColor; // font color to write the text with
    var fontStyle = CANVAS_FONT;
    var font = bold + letterRadius +"px " + fontStyle;
    this.canvasContext.font = font;
    // Move it down by half the text height and left by half the text width
    var width = this.canvasContext.measureText(text).width;
    var height = this.canvasContext.measureText("w").width; // this is a GUESS of height
    this.canvasContext.fillText(text, pos.x - (width/2) ,pos.y + (height/2));

    // To show where the exact center is:
    // this.canvasContext.fillRect(pos,pos,5,5);
}
Canvas.prototype.positionLetter = function(index){
    var letterPadding = (CANVAS_LETTER_PADDING / 100) * this.size;
    var x = this.size/2 + (this.size/2-this.padding-letterPadding) * Math.cos((2*Math.PI)/16*((index+1)*2-1));
    var y = this.size/2 + (this.size/2-this.padding-letterPadding) * Math.sin((2*Math.PI)/16*((index+1)*2-1));
    return {"x":x,"y":y};
}
Canvas.prototype.getMousePos = function(event){
    var rect = this.canvasElement.getBoundingClientRect();
    return {
        x: Math.round((event.clientX-rect.left)/(rect.right-rect.left)*this.size),
        y: Math.round((event.clientY-rect.top)/(rect.bottom-rect.top)*this.size)
    };
}

//MAIN
window.onload = function() {
    var gameFrame = document.getElementById(RAINBOW_GAME_FRAME);
    // var canvasSize = Math.min( gameFrame.clientWidth,  gameFrame.clientHeight);

    var game = new Game(RAINBOW, PRIME);
    // game.generate("56701234");
    game.generate();

    var canvas = new Canvas(RAINBOW_CANVAS, CANVAS_PADDING, RAINBOW_IMAGE, RAINBOW_GAME_FRAME, game);
    canvas.reDraw();
    window.onresize = function(event) {
        if(RESIZABLE){
            canvas.reDraw();
        }
    };

    canvas.canvasElement.addEventListener('click', function(event){
        var mousePos = canvas.getMousePos(event);
        var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
        console.log(message);
    },false);
    console.log(game.isGameFinished());
    console.log(game.carousel);
    // console.log(game.isKeyValid(game.encryptKey("76543210")));
};
