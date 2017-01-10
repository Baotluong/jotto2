(function(){

	angular
		.module("jotto")
		.controller("guessCtrl", guessCtrl);

	guessCtrl.$inject = ['dictionary', 'gameStatus', '$http'];

	function guessCtrl(dictionary, gameStatus, $http){
		var vm = this;
		vm.alphabet = [];
		vm.changeAlphabetClass = changeAlphabetClass;
		vm.dictionary = dictionary;
		vm.gameStatus = gameStatus;
		vm.formGuess = "";
		vm.formGuessResponse = "";
		vm.formGuessSubmit = formGuessSubmit;
		vm.shuffleLetters = [];
		vm.shuffleLettersClick = shuffleLettersClick;

		var defaultAlphabetStatus = "btn-info";

		console.log("One Player Secret Word is "+vm.dictionary.secretWord);

		function convertLetter(index){
			var letter = String.fromCharCode('A'.charCodeAt() + index);
			return letter;
		}

		// handles letter tracking
		function fillAlphabetArray(){
			for(var i = 0; i < 26; i++){
				var letter = convertLetter(i);
				vm.alphabet[i] = {"letter": letter, "status": defaultAlphabetStatus};
			}
		}
		fillAlphabetArray();

		function changeAlphabetClass(index){
			var clear = "btn-info";
			var potential = "btn-warning";
			var success = "btn-success";
			var eliminated = "btn-danger";

			if(vm.alphabet[index].status == clear){
				vm.alphabet[index].status = potential;
			}else if(vm.alphabet[index].status == potential){
				vm.alphabet[index].status = success;
				vm.shuffleLetters.push(convertLetter(index));
			}else if(vm.alphabet[index].status == success){
				vm.alphabet[index].status = eliminated;
				vm.shuffleLetters.splice(vm.shuffleLetters.indexOf(convertLetter(index)), 1);
			}else if(vm.alphabet[index].status == eliminated){
				vm.alphabet[index].status = clear;
			}
		}

		function shuffleLettersClick() {
		    for (var i = vm.shuffleLetters.length - 1; i > 0; i--) {
		        var j = Math.floor(Math.random() * (i + 1));
		        var temp = vm.shuffleLetters[i];
		        vm.shuffleLetters[i] = vm.shuffleLetters[j];
		        vm.shuffleLetters[j] = temp;
		    }
		}

		// handles guesses
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
			}else if(dictionary.checkForUnique(guess) == false && gameStatus.twoPlayerSettings.allowNonUnique == false){
				vm.formGuessResponse = notUnique;
			}else if(!dictionary.rawArray.includes(guess)){
				vm.formGuessResponse = notWord;
			}else if(alreadyGuessed(guess)){
				vm.formGuessResponse = alreadyGuess;
			}else{
				if(gameStatus.twoPlayerSettings.game.playerOne){
					checkAgainstSecretTwoPlayers(guess);
				}else{
					checkAgainstSecret(guess);	
				}
				vm.formGuessResponse = "";
				vm.formGuess = "";
			}

			function alreadyGuessed(guess){
				//single player check
				if(!gameStatus.playerNumber){
					for(var i=0; i<gameStatus.onePlayerGuesses.length; i++){
						if(gameStatus.onePlayerGuesses[i].guess == guess){
							return true;
						}
					}	
				}
				//two player check
				if(gameStatus.playerNumber == 1){
					for(var i=0; i<gameStatus.twoPlayerSettings.guesses.playerOne.length; i++){
						if(gameStatus.twoPlayerSettings.guesses.playerOne[i].guess == guess){
							return true;
						}	
					}	
				}else{
					for(var i=0; i<gameStatus.twoPlayerSettings.guesses.playerTwo.length; i++){
						if(gameStatus.twoPlayerSettings.guesses.playerTwo[i].guess == guess){
							return true;
						}	
					}	
				}
				return false;
			}			
		}

		function checkNumCorrect(guess, secret){
			var numCorrect = 0;

			for(var i=0; i<guess.length; i++){
				for(var j=0; j<secret.length; j++){
					if(guess[i] == secret[j]){
						numCorrect++;
					}
				}
			}
			return numCorrect;
		}

		function checkAgainstSecret(guess){
			var secret = dictionary.secretWord;
			var numCorrect = 0;

			numCorrect = checkNumCorrect(guess, secret);

			gameStatus.onePlayerGuesses.push({"guess": guess, "numCorrect":numCorrect});

			if(guess == secret){
				gameStatus.playerWins(secret, gameStatus.onePlayerGuesses.length);
			}
		}

		function checkAgainstSecretTwoPlayers(guess){
			var secret = "";
			var numCorrect = 0;

			if(gameStatus.playerNumber == 1){
				secret = gameStatus.twoPlayerSettings.game.playerTwoSecret;
				numCorrect = checkNumCorrect(guess, secret);
				gameStatus.twoPlayerSettings.guesses.playerOne.push({"guess": guess, "numCorrect":numCorrect});
			}else{
				secret = gameStatus.twoPlayerSettings.game.playerOneSecret;
				numCorrect = checkNumCorrect(guess, secret);
				gameStatus.twoPlayerSettings.guesses.playerTwo.push({"guess": guess, "numCorrect":numCorrect});
			}
			//turns off input form immediately in case of server lag
			gameStatus.notYourTurn = true;
			gameStatus.setAlert("oppGuessing");
			gameStatus.updateGameStatus();

			if(guess == secret){
				gameStatus.playerWins(secret);
			}
		}
	};
})();