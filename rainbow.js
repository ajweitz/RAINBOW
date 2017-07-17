
const RAINBOW = 'SHERDOG'; // Must be 7 letters
const RAINBOW_LENGTH = 7;
if(RAINBOW.length != RAINBOW_LENGTH)
	throw 'Error RAINBOW not well defined';

const PRIME = 31;


//Game Constructor
function Game(name,prime){
	this.carousel = name.split("");
	this.carousel.push(null); //one of the nodes should be empty
	this.carouselMapping = Array.apply(null, {length: this.carousel.length}).map(Number.call, Number); //generate [0,1,2,3,4,5,6,7] array (based on carousel length)
	this.prime = prime;
	this.key = "";
}

Game.prototype.draw = function(){

};

//Key must be a String
Game.prototype.generate = function(decryptedKey){
    if (arguments.length) {
    	//make sure the func arg is of String type.
    	if (Object.prototype.toString.call(decryptedKey) !== "[object String]")
    		throw 'Error generate() paramater must be of type: "String"';
    	
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

var game = new Game(RAINBOW,PRIME);

console.log(game.isKeyValid(game.encryptKey("76543210")));