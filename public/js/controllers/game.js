(function(){

	angular
		.module("jotto")
		.controller("gameCtrl", gameCtrl);

	gameCtrl.$inject = ['dictionary', 'gameStatus', '$http', '$location'];
		
	function gameCtrl(dictionary, gameStatus, $http, $location){
		var vm = this;
		vm.gameStatus = gameStatus;
		vm.dictionary = dictionary;
		vm.onePlayerStart = onePlayerStart;
		vm.twoPlayerStart = twoPlayerStart;
		vm.changeAllowNonUnique = changeAllowNonUnique;
		vm.formSecretSubmit = formSecretSubmit;
		vm.formSecret = "";
		vm.formSecretResponse = "";
		vm.docURL = document.URL;
		vm.clipBoard = clipBoard;

		function onePlayerStart(){
			gameStatus.activeState = "started";
			gameStatus.notYourTurn = false;
		};

		function twoPlayerStart(){
			$http.post('/newgame', gameStatus.twoPlayerSettings).then(function(response){
	    		gameStatus.twoPlayerSettings = response.data;
	    		document.cookie = gameStatus.twoPlayerSettings._id+" "+1;
	    		gameStatus.playerNumber = 1;
	    		gameStatus.twoPlayerSettings.game.playerOne = gameStatus.twoPlayerSettings._id+" "+1;
	    		$location.search('id', gameStatus.twoPlayerSettings._id);
	    		vm.docURL = vm.docURL.replace('#','');
	    		vm.docURL = vm.docURL+"#?id="+gameStatus.twoPlayerSettings._id;
	    		gameStatus.updateGameStatus();
	    		gameStatus.activeState = "secret";
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
			}else if(dictionary.checkForUnique(secret) == false){
				vm.formSecretResponse = notUnique;
			}else if(!dictionary.rawArray.includes(secret)){
				vm.formSecretResponse = notWord;
			}else{
				if(gameStatus.playerNumber == 1){
					gameStatus.twoPlayerSettings.game.playerOneSecret = secret;
				}else if(gameStatus.playerNumber == 2){
					gameStatus.twoPlayerSettings.game.playerTwoSecret = secret;
				}
				gameStatus.updateGameStatus();
				gameStatus.activeState = null;
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
			} catch(err) {  
			    console.log('Oops, unable to cut');  
			}  
		}
	}
})();


