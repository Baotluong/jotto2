(function(){

	angular
		.module("jotto")
		.controller("guessCtrl", guessCtrl);

	guessCtrl.$inject = ['fiveWords', 'gameStatus', '$http'];

	function guessCtrl(fiveWords, gameStatus, $http){
		var vm = this;
		vm.alphabet = [];
		vm.changeAlphabetClass = changeAlphabetClass;
		vm.fiveWords = fiveWords;
		vm.gameStatus = gameStatus;
		vm.playerGuess = [];
		vm.formGuess = "";
		vm.formGuessResponse = "";
		vm.formGuessSubmit = formGuessSubmit;
		vm.playerWin = false;
		vm.playerWinResponse = "";

		var defaultAlphabetStatus = "btn-info";

		console.log("One Player Secret Word is "+vm.fiveWords.secretWord);

		function fillAlphabetArray(){
			for(var i = 0; i < 26; i++){
				var letter = String.fromCharCode('A'.charCodeAt() + i);
				vm.alphabet[i] = {"letter": letter, "status": defaultAlphabetStatus};
			}
		}
		fillAlphabetArray();

		function changeAlphabetClass(index){
			var clear = "btn-info";
			var potential = "btn-success";
			var eliminated = "btn-danger";

			if(vm.alphabet[index].status == clear){
				vm.alphabet[index].status = potential;
			}else if(vm.alphabet[index].status == potential){
				vm.alphabet[index].status = eliminated;
			}else if(vm.alphabet[index].status == eliminated){
				vm.alphabet[index].status = clear;
			}
		}

		function formGuessSubmit(){
			var guess = vm.formGuess.toLowerCase();
			var mustBeFive = "Your guess must be a 5 letter word.";
			var notUnique = "Your guess cannot have duplicate letters.";
			var lettersOnly = "Your guess can only contain letters.";
			var notWord = "Your guess is not a word.";
			var alreadyGuess = "You already guessed this word.";

			if(/[^a-z]/i.test(guess)){
				vm.formGuessResponse = lettersOnly;
			}else if(guess.length !== 5){
				vm.formGuessResponse = mustBeFive;
			}else if(fiveWords.checkForUnique(guess) == false && gameStatus.allowNonUnique == false){
				vm.formGuessResponse = notUnique;
			}else if(!fiveWords.rawArray.includes(guess)){
				vm.formGuessResponse = notWord;
			}else if(alreadyGuessed(guess)){
				vm.formGuessResponse = alreadyGuess;
			}else{
				checkAgainstSecret(guess);
				vm.formGuessResponse = "";
				vm.formGuess = "";
			}

			function alreadyGuessed(guess){
				for(var i=0; i<vm.playerGuess.length; i++){
					if(vm.playerGuess[i].guess == guess){
						return true;
					}
				}
				return false;
			}			
		}

		function checkAgainstSecret(guess){
			var secret = fiveWords.secretWord;
			var numCorrect = 0;

			for(var i=0; i<guess.length; i++){
				for(var j=0; j<secret.length; j++){
					if(guess[i] == secret[j]){
						numCorrect++;
					}
				}
			}
			vm.playerGuess.push({"guess": guess, "numCorrect":numCorrect});

			if(guess == secret){
				playerWins();
			}
		}

		function playerWins(){
			var tries = vm.playerGuess.length;
			var perfect = "Wow, go buy a lottery ticket right now!";
			var amazing = "Ok. You must have cheated. That's just too good.";
			var great = "You did great! That was no easy task.";
			var good = "Good Job! Bet you'll get it even faster next time.";
			var ok = "Nice! Let's go for a better score.";
			var bad = "You can do better! Keep trying.";
			var awful = "Oh boy, maybe you should try reading the dictionary more often.";
			var terrible = "Wow. Are there even any words left to guess?";

			if(tries == 1){
				vm.playerWinResponse = perfect;
			}else if(tries < 6){
				vm.playerWinResponse = amazing;
			}else if(tries < 10){
				vm.playerWinResponse = great;
			}else if(tries < 14){
				vm.playerWinResponse = good;
			}else if(tries < 18){
				vm.playerWinResponse = ok;
			}else if(tries < 22){
				vm.playerWinResponse = bad;
			}else if(tries < 26){
				vm.playerWinResponse = awful;
			}else{
				vm.playerWinResponse = terrible;
			}

			vm.playerWin = true;
		}

	};

})();