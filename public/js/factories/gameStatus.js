(function(){
	
	angular
		.module("jotto")
		.factory("gameStatus", gameStatus);

	function gameStatus(){

		dataObj = {
			twoPlayerSettings: twoPlayerSettings,
			gameSettingsActive: gameSettingsActive,
			gameStartedActive: gameStartedActive,
			allowNonUnique: allowNonUnique,
			selectSecretActive: selectSecretActive,
			notYourTurn: notYourTurn,
			playerNumber: playerNumber
		}

		return dataObj;
	};

	var allowNonUnique = false;
	var gameSettingsActive = true;
	var gameStartedActive = false;
	var selectSecretActive = false;
	var notYourTurn = true;
	var firstPlayer = Math.floor((Math.random() * 2) + 1);
	var playerNumber = "";

	var twoPlayerSettings = {
		game: { playerOne: "", playerTwo: "", playerOneSecret: "", playerTwoSecret: "", firstPlayer: firstPlayer },
		guesses: [],
		allowNonUnique: false
	};
})();