
const RAINBOW = 'SHERDOG'; // Must be 7 letters
const RAINBOW_LENGTH = 7;
if(RAINBOW.length != RAINBOW_LENGTH)
	throw 'Error RAINBOW not well defined';

const PRIME = 31;
const SHIFTS = 3;

Game = {}
Game.carousel = RAINBOW.split("");
Game.carousel.push(null); //one of the nodes should be empty
Game.key = "";

Game.prototype.draw = function(){

};

//Key must be a String
Game.prototype.generate = function(decryptedKey){
	var N = this.carousel.length; 
	var carouselMapping = Array.apply(null, {length: N}).map(Number.call, Number); //generate [0,1,2,3,4,5,6,7] array (based on carousel length)
    if (arguments.length) {
    	//make sure the func arg is of String type.
    	if (Object.prototype.toString.call(decryptedKey) !== "[object String]")
    		throw 'Error generate() paramater must be of type: "String"';
    	
    	// Game.code = key;
        var tempArray = decryptedKey.split("");
        for(var i = 0; i< carouselMapping.length; i++){

        }
    } else {
        // argument not passed
    }
};
Game.prototype.encryptKey = function(key){

};
Game.prototype.decryptKey = function(key){

};
Game.prototype.isKeyValid = function(key){
	key = key.replace('#','');
	if (!isNumeric(key))
		return false;
	
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
console.log(Game.carousel);