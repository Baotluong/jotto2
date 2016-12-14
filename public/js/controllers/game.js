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
		var gameId = $location.search().id;
		vm.changeAllowNonUnique = changeAllowNonUnique;
		vm.formSecretSubmit = formSecretSubmit;
		vm.formSecret = "";
		vm.formSecretResponse = "";

		function onePlayerStart(){
			gameStatus.gameStartedActive = true;
			gameStatus.gameSettingsActive = false;
		};

		function twoPlayerStart(){
			$http.post('/newgame', gameStatus.twoPlayerSettings).then(function(response){
	    		gameStatus.twoPlayerSettings = response.data;
	    		document.cookie = gameStatus.twoPlayerSettings._id+" "+1;
	    		gameStatus.playerNumber = 1;
	    		gameStatus.twoPlayerSettings.game.playerOne = gameStatus.twoPlayerSettings._id+" "+1;
	    		$location.search('id', gameStatus.twoPlayerSettings._id);
	    		updateGameStatus();
    			gameStatus.gameSettingsActive = false;
		    	gameStatus.selectSecretActive = true;
		    	console.log(gameStatus);
	    	});
		};

		function updateGameStatus(){
			$http.put('/update', gameStatus.twoPlayerSettings).then(function(response){
				console.log("Game status updated.")
	    		console.log(response);
	    	});
		}

		function changeAllowNonUnique(){
			gameStatus.allowNonUnique = !gameStatus.allowNonUnique;
			gameStatus.twoPlayerSettings.allowNonUnique = !gameStatus.twoPlayerSettings.allowNonUnique;
		}

		function setPlayersTurn(){
			console.log(gameStatus.playerNumber == gameStatus.twoPlayerSettings.game.firstPlayer && gameStatus.twoPlayerSettings.guesses.length % 2 == 0);
			if(gameStatus.playerNumber == gameStatus.twoPlayerSettings.game.firstPlayer && gameStatus.twoPlayerSettings.guesses.length % 2 == 0){
				gameStatus.notYourTurn = false;
			}else{
				gameStatus.notYourTurn = true;
			}
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
				updateGameStatus();
				gameStatus.selectSecretActive = false;
				gameStatus.gameStartedActive = true;

				setPlayersTurn();		
			}
		}

		function playerCheck(){
			var cookie = document.cookie;
			
			function formatLastCookie(){
				if(cookie.split("; ").length > 1){
					var getLastCookie = cookie.split("; ");
					cookie = getLastCookie[getLastCookie.length-1];
					console.log(cookie);
					console.log(isNaN(cookie.slice(-1)));
					if(isNaN(cookie.slice(-1))){
						cookie = cookie.slice(0, -1);
						console.log(cookie);
					}
				}
			}
			formatLastCookie();

			var cookieArray = cookie.split(" ");
			console.log(cookieArray);	
			if(cookieArray[0] == gameStatus.twoPlayerSettings._id){
				gameStatus.playerNumber = parseInt(cookieArray[1]);
			}else{
				console.log("Player Not Found.");
			}
		}

		function restoreStatus(){
			playerCheck();
			setPlayersTurn();
			var playerNumber = gameStatus.playerNumber;
			if(playerNumber == 1){
				if(!gameStatus.twoPlayerSettings.game.playerOneSecret){
					gameStatus.selectSecretActive = true;
				}else{
					gameStatus.gameStartedActive = true;
				}
				gameStatus.gameSettingsActive = false;
			}

			if(playerNumber == 2){
				if(!gameStatus.twoPlayerSettings.game.playerTwoSecret){
					gameStatus.selectSecretActive = true;
				}else{
					gameStatus.gameStartedActive = true;
				}
				gameStatus.gameSettingsActive = false;
			}
		}

		if(gameId){
			$http.get('/gameStatus/'+gameId)
				.then(function(response){
					gameStatus.twoPlayerSettings = response.data;
					restoreStatus();
					console.log(gameStatus);
					if(!gameStatus.twoPlayerSettings.game.playerTwo && !gameStatus.playerNumber){
						gameStatus.twoPlayerSettings.game.playerTwo = gameStatus.twoPlayerSettings._id+" "+2;
						document.cookie = null;
						console.log(document.cookie);
						document.cookie = gameStatus.twoPlayerSettings._id+" "+2;
						gameStatus.playerNumber = 2;
						updateGameStatus();
						restoreStatus();
					}
				})
				.catch(function(data){
					console.log(data);
					//make error handling
			});
			console.log("cookie is "+document.cookie);
		}
	}

})();

//TODO: Just finished the setPlayersTurn function. Still need to complete the guess submission and database checking



