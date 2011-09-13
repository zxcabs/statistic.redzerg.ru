var		util = require('util')
	,	TurnamentParser = require('./TurnamentParser')
	,	TurnamentEventParser = require('./TurnamentEventParser')
	,	MatchParser = require('./MatchParser')
	, 	BitsPerBeat = require('./BitsPerBeat')
	;
/*
var tp = new TurnamentParser('http://www.bitsperbeat.com/sc2/?site=history');

tp.on('parserDone', function (turnamentEvents, turnament) {
	// Здесь мы вычисляем на каких турнирных событиях мы уже были
	// Для примера будем смотреть 2 события
	turnament.setTurnamentEvents(turnamentEvents.slice(0,2));
	
	console.log('Turnament parser find events: ' + turnamentEvents.length);
	turnament.next();
});

tp.on('next', function (turnamentEvent, turnament) {	
	var tep = new TurnamentEventParser(turnamentEvent, turnament);
	tep.on('parserDone', function (matchs, turnamentEvent) {
		// Здесь мы вычисляем на каких матчах уже были, и если надо обрезаем.
		// для тестов будем смотреть только 2 матча.
		turnamentEvent.setMatchs(matchs.slice(0,2));
		
		console.log('Turnament event parser find matchs: ' + matchs.length);
		turnamentEvent.next();
	});

	tep.on('next', function (matchHref, turnamentEvent) {
		var match = new MatchParser(matchHref, turnamentEvent);
		match.on('done', function (match) {
			//Здесь вносим результаты матча в БД
			util.log('MatchParser done: ' + match.href);
			match.turnamentEvent.next();
		});
		
		match.on('err', function (err, match) {
			//Критическая ошибка. Мф не можем быть уверены что данные внесены корректно, поэтому прекрачаем обработку для всего турнира
			// передавай ошибку вверх по цепочке
			match.turnamentEvent._error(err);
		});
		
		match.run();
	});
	
	tep.on('done', function (turnamentEvent) {
		//Если мы здесь, значит сбор результатов матчей завершен, вносим информацию о событии в БД
		//И переходим к следующему матчу
		console.log('Turnament event done: ' + turnamentEvent.href);
		turnamentEvent.turnament.next();
	});
	
	tep.on('err', function (err, turnamentEvent) {
		//Случилась какая то критическая ошибка, мы не уверены что се результаты внесены, поэтому 
		//Данные в БД не вносим, переходим к следуюущему турниру.
		turnamentEvent.turnament.next();
	});
	
	tep.run();
});

tp.on('done', function (turnament) {
	//парсинг турнира завершен. Моржем перейти к следующему или закруть соединение с бд.
	console.log('Turnament parser done: ' + turnament.href);
});

tp.run();
*/

var bpb = new BitsPerBeat();

bpb.on('run', function (turnametParsers, self) {
	//Здесь мы получаем список турниров которые будут обработаны.
	//Мы можем обработать только нужные нам туриниры.
	util.log('BitsPerBeat load parsers: ' + turnametParsers.length + '\n');
	self.next();
});

bpb.on('next', function (turnamentEvents, turnament, self) {
	// Здесь мы вычисляем на каких турнирных событиях мы уже были
	// Для примера будем смотреть 2 события
	turnament.setTurnamentEvents(turnamentEvents.slice(0,2));
	
	util.log('Turnament: ' + turnament.href + '; parser find events: ' + turnamentEvents.length);	
	turnament.next();
});

bpb.on('tenext', function (matchs, turnamentEvent, self) {
	// Здесь мы вычисляем на каких матчах уже были.
	// для тестов будем смотреть только 2 матча.
	turnamentEvent.setMatchs(matchs.slice(0,2));
	util.log('Start turnament event find matchs: ' + matchs.length + '; href: ' + turnamentEvent.href);
	
	turnamentEvent.next();
});

bpb.on('tedone', function (turnamentEvent, self) {
	//Если мы здесь, значит сбор результатов матчей завершен, вносим информацию о событии в БД
	//И переходим к следующему
	util.log('Done turnament event: ' + turnamentEvent.href);
	turnamentEvent.turnament.next();
});

bpb.on('mpdone', function (match, self) {
	//Здесь вносим результаты матча в БД
	util.log('MatchParser done: ' + match.href);
	match.turnamentEvent.next();
});

bpb.on('done', function (name) {
	util.log('Parser ' + name + ' done');
});


bpb.run();