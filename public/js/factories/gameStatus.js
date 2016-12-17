(function(){
	
	angular
		.module("jotto")
		.factory("gameStatus", gameStatus);

	gameStatus.$inject = ['$http', '$location', '$interval'];

	function gameStatus($http, $location, $interval){

		var allowNonUnique = false;
		var gameSettingsActive = true;
		var gameStartedActive = false;
		var selectSecretActive = false;
		var notYourTurn = true;
		var firstPlayer = Math.floor((Math.random() * 2) + 1);
		var playerNumber = "";
		var gameId = $location.search().id;
		var playerWin = "";
		var onePlayerGuesses = [];
		var playerWinResponse = "";
		var playerLost = "";
		var alert = "";

		var twoPlayerSettings = {
			game: { playerOne: "", playerTwo: "", playerOneSecret: "", playerTwoSecret: "", firstPlayer: firstPlayer },
			guesses: {playerOne:[], playerTwo:[]},
			allowNonUnique: false
		};

		function updateGameStatus(){
			$http.put('/update', dataObj.twoPlayerSettings).then(function(response){
				console.log("Game status updated.");
	    		console.log(response);
	    		setPlayersTurn();
	    		console.log(dataObj);
	    	});
		}

		function setPlayersTurn(){
			if((dataObj.playerNumber == dataObj.twoPlayerSettings.game.firstPlayer && dataObj.twoPlayerSettings.guesses.playerOne.length == dataObj.twoPlayerSettings.guesses.playerTwo.length) ||
			   (dataObj.playerNumber !== dataObj.twoPlayerSettings.game.firstPlayer && dataObj.twoPlayerSettings.guesses.playerOne.length !== dataObj.twoPlayerSettings.guesses.playerTwo.length)){
				dataObj.notYourTurn = false;
			}else{
				dataObj.notYourTurn = true;
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
			if(cookieArray[0] == dataObj.twoPlayerSettings._id){
				dataObj.playerNumber = parseInt(cookieArray[1]);
			}else{
				//TODO: Error handling for player not found.
				console.log("Player Not Found.");
			}
		}

		function restoreStatus(){
			playerCheck();
			setPlayersTurn();
			var playerNumber = dataObj.playerNumber;
			if(playerNumber == 1){
				if(!dataObj.twoPlayerSettings.game.playerOneSecret){
					dataObj.selectSecretActive = true;
				}else{
					if(dataObj.twoPlayerSettings.game.playerTwoSecret){
						dataObj.gameStartedActive = true;
						setAlert();
					
						//Checks if the last word is the winner
						if(dataObj.twoPlayerSettings.guesses.playerOne.length > 0){
							if(dataObj.twoPlayerSettings.guesses.playerOne[dataObj.twoPlayerSettings.guesses.playerOne.length-1].guess == dataObj.twoPlayerSettings.game.playerTwoSecret){
								playerWins(dataObj.twoPlayerSettings.game.playerTwoSecret);
							}	
						}
						if(dataObj.twoPlayerSettings.guesses.playerTwo.length > 0){
							if(dataObj.twoPlayerSettings.guesses.playerTwo[dataObj.twoPlayerSettings.guesses.playerTwo.length-1].guess == dataObj.twoPlayerSettings.game.playerOneSecret){
								playerLoses(dataObj.twoPlayerSettings.game.playerTwoSecret);
							}
						}
					}else{
						setAlert("waitingSecret");
					}
				}
				dataObj.gameSettingsActive = false;
			}

			if(playerNumber == 2){
				if(!dataObj.twoPlayerSettings.game.playerTwoSecret){
					dataObj.selectSecretActive = true;
				}else{
					if(dataObj.twoPlayerSettings.game.playerOneSecret){
						dataObj.gameStartedActive = true;
						setAlert();

						//Checks if the last word is the winner
						if(dataObj.twoPlayerSettings.guesses.playerTwo > 0){
							if(dataObj.twoPlayerSettings.guesses.playerTwo[dataObj.twoPlayerSettings.guesses.playerTwo.length-1].guess == dataObj.twoPlayerSettings.game.playerOneSecret){
								playerWins(dataObj.twoPlayerSettings.game.playerOneSecret);
							}	
						}
						if(dataObj.twoPlayerSettings.guesses.playerOne.length > 0){
							if(dataObj.twoPlayerSettings.guesses.playerOne[dataObj.twoPlayerSettings.guesses.playerOne.length-1].guess == dataObj.twoPlayerSettings.game.playerTwoSecret){
								playerLoses(dataObj.twoPlayerSettings.game.playerOneSecret);
							}
						}
					}else{
						setAlert("waitingSecret");
					}
				}
				dataObj.gameSettingsActive = false;
			}
		}

		function playerLoses(oppSecret){
			dataObj.playerLost = oppSecret;
		}

		function playerWins(secret, guesses){
			var tries = 0;
			if(guesses){
	 			tries = guesses;
			}else{
				if(dataObj.playerNumber == 1){
					tries = Math.floor(dataObj.twoPlayerSettings.guesses.playerOne.length/2);	
				}else{
					tries = Math.floor(dataObj.twoPlayerSettings.guesses.playerTwo.length/2);	
				}
				if(dataObj.playerNumber = dataObj.twoPlayerSettings.game.firstPlayer){
					tries++;
				}
			}

			var perfect = "Wow, go buy a lottery ticket right now!";
			var amazing = "Ok. You must have cheated. That's just too good.";
			var great = "You did great! That was no easy task.";
			var good = "Good Job! Bet you'll get it even faster next time.";
			var ok = "Nice! Let's go for a better score.";
			var bad = "You can do better! Keep trying.";
			var awful = "Oh boy, maybe you should try reading the dictionary more often.";
			var terrible = "Wow. Are there even any words left to guess?";

			if(tries == 1){
				dataObj.playerWinResponse = perfect;
			}else if(tries < 6){
				dataObj.playerWinResponse = amazing;
			}else if(tries < 10){
				dataObj.playerWinResponse = great;
			}else if(tries < 14){
				dataObj.playerWinResponse = good;
			}else if(tries < 18){
				dataObj.playerWinResponse = ok;
			}else if(tries < 22){
				dataObj.playerWinResponse = bad;
			}else if(tries < 26){
				dataObj.playerWinResponse = awful;
			}else{
				dataObj.playerWinResponse = terrible;
			}

			dataObj.playerWin = [secret, tries];
			console.log(dataObj.playerWin);
		}

		function setAlert(message){
			switch(message){
				case "waitingSecret":
					dataObj.alert = "Waiting on Opponent to select a Secret";
					break;
				default:
					dataObj.alert = "";
			}
		}

		if(gameId){
			$http.get('/gameStatus/'+gameId)
				.then(function(response){
					dataObj.twoPlayerSettings = response.data;
					restoreStatus();
					if(!dataObj.twoPlayerSettings.game.playerTwo && !dataObj.playerNumber){
						dataObj.twoPlayerSettings.game.playerTwo = dataObj.twoPlayerSettings._id+" "+2;
						document.cookie = dataObj.twoPlayerSettings._id+" "+2;
						dataObj.playerNumber = 2;
						dataObj.updateGameStatus();
						restoreStatus();
					}
					$interval(refreshSettings, 3000);
				})
				.catch(function(data){
					console.log(data);
					//TODO: make error handling
			});
			console.log("cookie is "+document.cookie);
		}

		function refreshSettings(){
			$http.get('/gameStatus/'+gameId).then(function(response){
				dataObj.twoPlayerSettings = response.data;
				restoreStatus();
				console.log(response);
			});
		}

		dataObj = {
			twoPlayerSettings: twoPlayerSettings,
			gameSettingsActive: gameSettingsActive,
			gameStartedActive: gameStartedActive,
			allowNonUnique: allowNonUnique,
			selectSecretActive: selectSecretActive,
			notYourTurn: notYourTurn,
			playerNumber: playerNumber,
			updateGameStatus: updateGameStatus,
			setPlayersTurn: setPlayersTurn,
			playerWin: playerWin,
			playerWins: playerWins,
			onePlayerGuesses: onePlayerGuesses,
			playerWinResponse: playerWinResponse,
			playerLost: playerLost,
			alert: alert,
			setAlert: setAlert
		}

		return dataObj;
	}

})();