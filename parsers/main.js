var		util = require('util')
	,	Bpb = require('./bitsperbeat-com/BitsPerBeat')
	,	Esl = require('./esl/Esl')
	,	setting = require('../setting/setting')
	,	redis = require('redis')
	, 	RM = require('../model/RM')
	;

RM.setOption(setting.db);
var models = new RM();

var parsers = [
				new Esl(),
				new Bpb()				
				];

function run () {
	var p = parsers.pop();
	if (p) {
		p.on('run', onParserRun);
		p.on('next', onParserNext);
		p.on('tenext', onTurnamentEventNext);
		p.on('tedone', onTurnamentEventDone);
		p.on('mpdone', onMatchParserDone);
		p.on('done', onParserDone);
		p.run();
	} else {
		util.log('All end');
		models.client.quit();
	};
};

var onParserRun = function (turnametParsers, self) {
	//Здесь мы получаем список турниров которые будут обработаны.
	//Мы можем обработать только нужные нам туриниры.
	util.log('Load parsers: ' + turnametParsers.length + '\n');
	self.next();
};

var onParserNext = function (turnamentEvents, turnament, self) {
	// Здесь мы вычисляем на каких турнирных событиях мы уже были
	
	// Подключаемся к БД если долго осутствовали
	models.client.select(RM.opt.db);
	models.Site.findNew(turnamentEvents, function (err, res) {
		turnament.setTurnamentEvents(res);
	
		util.log('Turnament: ' + turnament.href + '; parser find events: ' + turnamentEvents.length);	
		turnament.next();
	});
};

var onTurnamentEventNext = function (matchs, turnamentEvent, self) {
	// Здесь мы вычисляем на каких матчах уже были.
	
	// Подключаемся к БД если долго осутствовали
	models.client.select(RM.opt.db);
	models.Site.findNew(matchs, function (err, res) {
		turnamentEvent.setMatchs(res);
		util.log('Start turnament event find matchs: ' + matchs.length + '; href: ' + turnamentEvent.href);
	
		turnamentEvent.next();
	});
};

var onTurnamentEventDone = function (turnamentEvent, self) {
	//Если мы здесь, значит сбор результатов матчей завершен, вносим информацию о событии в БД
	//И переходим к следующему
	util.log('Done turnament event: ' + turnamentEvent.href + '; err: ' + turnamentEvent.isError);
	
	//Если флаг ошибки установлен, значит при разборе матчей возникли ошибки, переходим к следующему матчу, не сохраняю текущий
	if (turnamentEvent.isError) {
		turnamentEvent.turnament.next();
	} else {
		// Подключаемся к БД если долго осутствовали
		models.client.select(RM.opt.db);
		var site = models.Site.create(turnamentEvent.href);
		site.save(function (err, res) {
			turnamentEvent.turnament.next();
		});
	}
};

var onMatchParserDone = function (match, self) {
	//Здесь вносим результаты матча в БД
	
	// Подключаемся к БД если долго осутствовали
	models.client.select(RM.opt.db);
	var m = models.Match.create(match);
	m.save(function (err, res) {
		if (res) {
			util.log('Match saved: ' + match.href);
			
			var search = models.Search.create(match.pl1);
			search.save(function (err, res){
				var search2 = models.Search.create(match.pl2);
				search2.save(function (err, res) {
					var site = models.Site.create(match.href);
					site.save(function (err, res) {
						match.turnamentEvent.next();
					});
				});
			});
		} else {
			util.log('Somesing wrong on match save: ' + err);
			match.turnamentEvent.next();
		};
	});
};

var onParserDone = function (name) {
	util.log('Parser ' + name + ' done');
	run();
};

run();