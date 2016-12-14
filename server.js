var express = require('express');
var app = express();
var mongojs = require('mongojs');
var db = mongojs('jotto2', ['jotto2']);
var bodyParser = require('body-parser');

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

app.listen(3000);
console.log("server running from port 3000");

app.post('/newgame', function (req, res) {
		
	db.jotto2.insert(req.body, function (err, doc) {
		res.json(doc);
	});

});

app.get('/gameStatus/:id', function (req, res) {
	var id = req.params.id;
	console.log(id);

	db.jotto2.findOne({_id: mongojs.ObjectId(id)}, function(err, docs){
		res.json(docs);
	});
});

app.put('/update', function (req, res) {
	var id = req.body._id;
	db.jotto2.findAndModify({
	query: {_id: mongojs.ObjectId(id)},
	update: {$set: {game: { playerOne: req.body.game.playerOne, playerTwo: req.body.game.playerTwo, firstPlayer: req.body.game.firstPlayer,
							playerOneSecret: req.body.game.playerOneSecret, playerTwoSecret: req.body.game.playerTwoSecret },
							guesses: req.body.guesses}},
	new: true}, function (err, doc) {
			res.json(doc);
		}
	);
});