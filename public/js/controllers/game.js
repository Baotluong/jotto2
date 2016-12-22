(function(){

	angular
		.module("jotto")
		.controller("gameCtrl", gameCtrl);

	gameCtrl.$inject = ['fiveWords', 'gameStatus', '$http', '$location'];
		
	function gameCtrl(fiveWords, gameStatus, $http, $location){
		var vm = this;
		vm.gameStatus = gameStatus;
		vm.fiveWords = fiveWords;
		vm.onePlayerStart = onePlayerStart;
		vm.twoPlayerStart = twoPlayerStart;
		vm.changeAllowNonUnique = changeAllowNonUnique;
		vm.formSecretSubmit = formSecretSubmit;
		vm.formSecret = "";
		vm.formSecretResponse = "";
		vm.docURL = document.URL;
		vm.clipBoard = clipBoard;

		function onePlayerStart(){
			gameStatus.gameStartedActive = true;
			gameStatus.gameSettingsActive = false;
			gameStatus.notYourTurn = false;
		};

		function twoPlayerStart(){
			$http.post('/newgame', gameStatus.twoPlayerSettings).then(function(response){
	    		gameStatus.twoPlayerSettings = response.data;
	    		document.cookie = gameStatus.twoPlayerSettings._id+" "+1;
	    		gameStatus.playerNumber = 1;
	    		gameStatus.twoPlayerSettings.game.playerOne = gameStatus.twoPlayerSettings._id+" "+1;
	    		$location.search('id', gameStatus.twoPlayerSettings._id);
	    		vm.docURL = document.URL+"#?id="+gameStatus.twoPlayerSettings._id;
	    		gameStatus.updateGameStatus();
    			gameStatus.gameSettingsActive = false;
		    	gameStatus.selectSecretActive = true;
	    	});
		};

		function changeAllowNonUnique(){
			gameStatus.allowNonUnique = !gameStatus.allowNonUnique;
			gameStatus.twoPlayerSettings.allowNonUnique = !gameStatus.twoPlayerSettings.allowNonUnique;
		}

		function formSecretSubmit(){
			var secret = vm.formSecret.toLowerCase();
			var mustBeFive = "Your guess must be a 5 letter word.";
			var notUnique = "Your guess cannot have duplicate letters.";
			var lettersOnly = "Your guess can only contain letters.";
			var notWord = "Your guess is not a word.";

			if(/[^a-z]/i.test(secret)){
				vm.formSecretResponse = lettersOnly;
			}else if(secret.length !== 5){
				vm.formSecretResponse = mustBeFive;
			}else if(fiveWords.checkForUnique(secret) == false){
				vm.formSecretResponse = notUnique;
			}else if(!fiveWords.rawArray.includes(secret)){
				vm.formSecretResponse = notWord;
			}else{
				if(gameStatus.playerNumber == 1){
					gameStatus.twoPlayerSettings.game.playerOneSecret = secret;
				}else if(gameStatus.playerNumber == 2){
					gameStatus.twoPlayerSettings.game.playerTwoSecret = secret;
				}
				gameStatus.updateGameStatus();
				gameStatus.selectSecretActive = false;
				gameStatus.setPlayersTurn();
				gameStatus.setAlert("waitingSecret");
			}
		}

		function clipBoard(){
			var copyTextarea = document.querySelector('.js-copytextarea');  
			copyTextarea.select();

			try {  
				var successful = document.execCommand('copy');  
				var msg = successful ? 'successful' : 'unsuccessful';  
			    console.log('copying text command was ' + msg);  
			} catch(err) {  
			    console.log('Oops, unable to cut');  
			}  
		}
	}
})();


