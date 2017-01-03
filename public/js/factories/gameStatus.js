(function(){
	
	angular
		.module("jotto")
		.factory("gameStatus", gameStatus);

	gameStatus.$inject = ['$http', '$location', '$interval'];

	function gameStatus($http, $location, $interval){

		var allowNonUnique = false;
		var activeState = "settings";
		var notYourTurn = true;
		var firstPlayer = Math.floor((Math.random() * 2) + 1);
		var playerNumber = "";
		var playerWin = "";
		var onePlayerGuesses = [];
		var playerWinResponse = "";
		var playerLost = "";
		var alert = "";
		var alertGoHome = false;

		var twoPlayerSettings = {
			game: { playerOne: "", playerTwo: "", playerOneSecret: "", playerTwoSecret: "", firstPlayer: firstPlayer },
			guesses: {playerOne:[], playerTwo:[]},
			allowNonUnique: false
		};

		function updateGameStatus(){
			$http.put('/update', dataObj.twoPlayerSettings).then(function(response){
	    		setPlayersTurn();
	    	});
		}

		function setPlayersTurn(){
			if(dataObj.activeState == "started" && !dataObj.playerWin && !dataObj.playerLost){
				if((dataObj.playerNumber == dataObj.twoPlayerSettings.game.firstPlayer && dataObj.twoPlayerSettings.guesses.playerOne.length == dataObj.twoPlayerSettings.guesses.playerTwo.length) ||
				   (dataObj.playerNumber !== dataObj.twoPlayerSettings.game.firstPlayer && dataObj.twoPlayerSettings.guesses.playerOne.length !== dataObj.twoPlayerSettings.guesses.playerTwo.length)){
					dataObj.notYourTurn = false;
					setAlert("oppGuessed");
				}else{
					dataObj.notYourTurn = true;
					setAlert("oppGuessing");
				}
			}
		}

		function playerCheck(){
			var cookie = document.cookie;
			
			function formatLastCookie(){
				if(cookie.split("; ").length > 1){
					var getLastCookie = cookie.split("; ");
					cookie = getLastCookie[getLastCookie.length-1];
					if(isNaN(cookie.slice(-1))){
						cookie = cookie.slice(0, -1);
					}
				}
			}
			formatLastCookie();

			var cookieArray = cookie.split(" ");
			if(cookieArray[0] == dataObj.twoPlayerSettings._id){
				dataObj.playerNumber = parseInt(cookieArray[1]);
			}
		}

		//Checks if the last word is the winner
		function checkWinner(){
			if(dataObj.twoPlayerSettings.guesses.playerOne.length > 0){
				if(dataObj.twoPlayerSettings.guesses.playerOne[dataObj.twoPlayerSettings.guesses.playerOne.length-1].guess == dataObj.twoPlayerSettings.game.playerTwoSecret){
					if(dataObj.playerNumber == 1){
						playerWins(dataObj.twoPlayerSettings.game.playerTwoSecret);
					}else{
						playerLoses(dataObj.twoPlayerSettings.game.playerOneSecret);
					}
				}	
			}
			if(dataObj.twoPlayerSettings.guesses.playerTwo.length > 0){
				if(dataObj.twoPlayerSettings.guesses.playerTwo[dataObj.twoPlayerSettings.guesses.playerTwo.length-1].guess == dataObj.twoPlayerSettings.game.playerOneSecret){
					if(dataObj.playerNumber == 2){
						playerWins(dataObj.twoPlayerSettings.game.playerOneSecret);
					}else{
						playerLoses(dataObj.twoPlayerSettings.game.playerTwoSecret);
					}
				}
			}
		}

		function setActiveState(){
			if(dataObj.activeState !== 'started'){
				if(dataObj.playerNumber == 1){
					if(!dataObj.twoPlayerSettings.game.playerOneSecret){
						dataObj.activeState = 'secret';
					}else{
						if(dataObj.twoPlayerSettings.game.playerTwoSecret){
							dataObj.activeState = 'started';
							setPlayersTurn();
						}else{
							setAlert("waitingSecret");
						}
					}
				}

				if(dataObj.playerNumber == 2){
					if(!dataObj.twoPlayerSettings.game.playerTwoSecret){
						dataObj.activeState = 'secret';
					}else{
						if(dataObj.twoPlayerSettings.game.playerOneSecret){
							dataObj.activeState = 'started';
							setPlayersTurn();
						}else{
							setAlert("waitingSecret");
						}
					}
				}
			}
		}

		function restoreStatus(){
			playerCheck();
			setPlayersTurn();
			setActiveState();
			checkWinner();
		}

		function playerLoses(oppSecret){
			dataObj.playerLost = oppSecret;
			setAlert("playerLoses");
		}

		function playerWins(secret, guesses){
			var tries = 0;
			if(guesses){
	 			tries = guesses;
			}else{
				if(dataObj.playerNumber == 1){
					tries = dataObj.twoPlayerSettings.guesses.playerOne.length;
				}else{
					tries = dataObj.twoPlayerSettings.guesses.playerTwo.length;
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
			setAlert("playerWin");
		}

		function setAlert(message){
			var oppGuess = "";
			var count = 10;
			function countdown(){
				//when goHome() was called in this function the $location.search('id',null) does not work so had to set a seperate command to goHome.
				if (count>0) {
					document.getElementById("countdown").innerHTML = count+"...";
					setTimeout(countdown, 1000);
					count--;
				}
			}

			switch(message){
				case "playerWin":
					dataObj.alert = "Congratulations! "+dataObj.playerWin[0].toUpperCase()+" is the correct guess! It took you "+dataObj.playerWin[1]+" tries. "+dataObj.playerWinResponse;
					dataObj.alertGoHome = true;
					break;
				case "playerLoses":
					dataObj.alert = "Oh no, your opponent has guessed your secret! You almost had them. Their secret was "+dataObj.playerLost.toUpperCase()+".";
					dataObj.alertGoHome = true;
					break;
				case "waitingSecret":
					dataObj.alert = "Waiting on opponent to select a Secret";
					break;
				case "oppGuessing":
					dataObj.alert = "Your opponent is guessing.";
					break;
				case "oppGuessed":
					if(dataObj.playerNumber == 1 && dataObj.twoPlayerSettings.guesses.playerTwo.length > 0){
						oppGuess = dataObj.twoPlayerSettings.guesses.playerTwo[dataObj.twoPlayerSettings.guesses.playerTwo.length-1].guess.toUpperCase();
						dataObj.alert = "It's your turn! Your opponent guessed "+oppGuess+".";
					}else if(dataObj.playerNumber == 2 && dataObj.twoPlayerSettings.guesses.playerOne.length > 0){
						oppGuess = dataObj.twoPlayerSettings.guesses.playerOne[dataObj.twoPlayerSettings.guesses.playerOne.length-1].guess.toUpperCase();
						dataObj.alert = "It's your turn! Your opponent guessed "+oppGuess+".";
					}else{
						dataObj.alert = "It's your turn!";	
					}
					break;
				case "errorBadId":
					dataObj.alert = "Invalid Game ID. Redirecting home in ";
					countdown();
					$interval(goHome, 10250);
					dataObj.alertGoHome = true;
					dataObj.activeState = null;
					dataObj.gameSettingsActive = false;
					break;
				case "errorGameFull":
					dataObj.alert = "This game is full! Redirecting home in "
					countdown();
					$interval(goHome, 10000);
					dataObj.alertGoHome = true;
					dataObj.activeState = null;
					dataObj.gameSettingsActive = false;
					break;
				default:
					dataObj.alert = "";
			}


		}

		function goHome(){
			$location.search('id',null);
			location.reload();
		}

		if($location.search().id){
			$http.get('/gameStatus/'+$location.search().id)
				.then(function(response){
					dataObj.twoPlayerSettings = response.data;
					//Sets 2nd player cookie
					playerCheck();
					if(!dataObj.twoPlayerSettings.game.playerTwo && !dataObj.playerNumber){
						dataObj.twoPlayerSettings.game.playerTwo = dataObj.twoPlayerSettings._id+" "+2;
						document.cookie = dataObj.twoPlayerSettings._id+" "+2;
						dataObj.updateGameStatus();
					}
					restoreStatus();
					if(!dataObj.playerNumber){
						setAlert("errorGameFull");
					}
					$interval.cancel(window.refreshInterval);
					window.refreshInterval = $interval(refreshSettings, 2000);
				})
				.catch(function(data){
					setAlert("errorBadId");
			});
		}

		function refreshSettings(){
			$http.get('/gameStatus/'+$location.search().id).then(function(response){
				dataObj.twoPlayerSettings = response.data;
				restoreStatus();
				console.log("Refreshing");
			});
		}

		window.addEventListener('focus', function() {
			$interval.cancel(window.refreshInterval);
			if(dataObj.playerNumber){
				window.refreshInterval = $interval(refreshSettings, 2000);	
				refreshSettings();
			}
		},false);

		window.addEventListener('blur', function() {
		    $interval.cancel(window.refreshInterval);
		},false);

		dataObj = {
			twoPlayerSettings: twoPlayerSettings,
			activeState: activeState,
			allowNonUnique: allowNonUnique,
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
			setAlert: setAlert,
			alertGoHome: alertGoHome,
			goHome: goHome
		}

		return dataObj;
	}

})();

//TODO: convert the states into one variable.