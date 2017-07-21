"use strict";

//document constants
const RESIZABLE = true;
const CANVAS_PADDING = 5; //in Percent
const RAINBOW_GAME_FRAME = "rainbow-game";
const RAINBOW_IMAGE = "rainbow-wheel-img";
const RAINBOW_CANVAS = "rainbow-canvas";

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
        var tempArray = decryptedKey.split("");
        for(var i = 0; i< this.carouselMapping.length; i++){

        }
    } else {
        // argument not passed
    }
};
Game.prototype.encryptKey = function(key){
    return ((parseInt(key) * this.prime) + this.prime).toString();
};
Game.prototype.decryptKey = function(key){
    var result = ((parseInt(key) - this.prime) / this.prime).toString();
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

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
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
    // this.drawLetter("S");
}
Canvas.prototype.drawLetter = function(letter){
    // var text = letter;

    // this.canvasContext.fillStyle = "red";
    // this.canvasContext.beginPath();
    // var radius = 100; // for example
    // this.canvasContext.arc(200, 200, radius, 0, Math.PI * 2);
    // this.canvasContext.closePath();
    // this.canvasContext.fill();
    // this.canvasContext.fillStyle = "black"; // font color to write the text with
    // var font = "bold " + radius +"px serif";
    // this.canvasContext.font = font;
    // // Move it down by half the text height and left by half the text width
    // var width = this.canvasContext.measureText(text).width;
    // var height = this.canvasContext.measureText("w").width; // this is a GUESS of height
    // this.canvasContext.fillText(text, 200 - (width/2) ,200 + (height/2));

    // // To show where the exact center is:
    // this.canvasContext.fillRect(200,200,5,5)
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
    console.log(game.isKeyValid(game.encryptKey("76543210")));
};
