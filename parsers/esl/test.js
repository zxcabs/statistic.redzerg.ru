//
var 	util = require('util')
	,	TurnamentParser = require('./TurnamentParser')
	,	TurnamentEventParser = require('./TurnamentEventParser')
	,	MatchParser = require('./MatchParser')
	,	setting = require('../../setting/setting')
	;
/*
//TurnamentParser = 
var tp = new TurnamentParser('http://www.esl.eu/eu/sc2/go4sc2/standings/');
tp.on('parserDone', function (events, tp) {
	console.log('Events from: ' + tp.href + '\n' + util.inspect(events));
});

setTimeout(function() {
	tp.run();
}, 0);
*/

/*
//TurnamenEventParser
var tep = new TurnamentEventParser('http://www.esl.eu/eu/sc2/sennheiser_cup/cup1/rankings/');
tep.on('parserDone', function (matchs, ev){
	console.log('Matchs from: ' + ev.href + ':' + matchs.length);
});

setTimeout(function() {
	tep.run();
}, 0);
*/

//MatchParser
var mp = new MatchParser('http://www.esl.eu/eu/sc2/sennheiser_cup/cup6/match/22015953/');
mp.on('done', function (match) {
	console.log('Match result: ' + util.inspect(match));
});

setTimeout(function() {
	mp.run();
}, 0);