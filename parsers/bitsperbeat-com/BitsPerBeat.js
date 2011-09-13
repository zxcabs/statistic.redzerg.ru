// Модуль собирающий статистику с bitsperbeat.com
var 	TurnamentParser = require('./TurnamentParser')
	,	TurnamentEventParser = require('./TurnamentEventParser')
	,	MatchParser = require('./MatchParser')
	, 	setting = require('../../setting/setting.js').parsers.bpb
	,	util = require('util')
	,	EventEmitter = require('events').EventEmitter
	;

var BitsPerBeat = module.exports = function () {
	BitsPerBeat.super_.apply(this, arguments);
	this._tps = new Array();
	
	for(var c in setting.cups) {
		this._tps.push(new TurnamentParser(setting.cups[c] + '?site=history'));
	};
	
	this._isDone = false;
	this._isRun = false;
	this._requestInterval = setting.requestInterval;
	this._lastL = 0;	
};
util.inherits(BitsPerBeat, EventEmitter);

BitsPerBeat.prototype.__defineGetter__('isDone', function() {
	return this._isDone;
});

BitsPerBeat.prototype.__defineGetter__('isRun', function() {
	return this._isRun;
});

BitsPerBeat.prototype._error = function (err) {
	this._isDone = true;
	util.log('BitsPerBeat error: ' + err);
	this.emit('err', err);
};

BitsPerBeat.prototype.run = function () {
	if (this.isRun) {
		this.error('Already run');
	} else {
		this._isRun = true;
		this.emit('run', this._tps, this);
	};
};


BitsPerBeat.prototype.next = function () {
	var t = this._tps.pop();
	if (t) {
		t.on('parserDone', this._onTurnamenParserDone.bind(this));
		t.on('next', this._onTurnamentParserNext.bind(this));
		t.on('done', this._onTurnamentDone.bind(this));
		t.on('err', this._onTurnamentParserError.bind(this));
		this._launch(t, 'run');
	} else {
		this._done();
	};
};

BitsPerBeat.prototype._done = function () {
	this._isDone = true;
	this.emit('done', 'BitsPerBeat');
};

//Обработчики событий для TurnamentParser
BitsPerBeat.prototype._onTurnamenParserDone = function (turnamentEvents, turnament) {
	//Получили список событий для турнира
	this.emit('next', turnamentEvents, turnament, this);
};

BitsPerBeat.prototype._onTurnamentParserNext = function (turnamentEvent, turnament) {	
	var tep = new TurnamentEventParser(turnamentEvent, turnament);

	tep.on('parserDone', this._onTurnamentEventParserDone.bind(this));
	tep.on('next', this._onTurnamentEventParserNext.bind(this));
	tep.on('err', this._onTurnamentEventParserError.bind(this));
	tep.on('done', this._onTurnamentEventDone.bind(this));
	
	this._launch(tep, 'run');
};

BitsPerBeat.prototype._onTurnamentDone = function (turnament, self) {
	util.log('Done turnament: ' + turnament.href + '\n');
	this.next();
};

BitsPerBeat.prototype._onTurnamentParserError = function (err, turnament) {
	util.log('ERROR: TurnamentParser href: ' + turnament.href + '; err: ' + err);
	this.emit('err', turnament, this);
	this.next();
};
/////////

//Обработчики событий для TurnamentEventParser
BitsPerBeat.prototype._onTurnamentEventParserDone = function (matchs, turnamentEvent) {
	this.emit('tenext', matchs, turnamentEvent, this);
};

BitsPerBeat.prototype._onTurnamentEventParserNext = function (matchHref, turnamentEvent) {
	var match = new MatchParser(matchHref, turnamentEvent);
	
	match.on('done', this._onMatchParserDone.bind(this));
	match.on('err', this._onMatchParserError.bind(this));
	
	this._launch(match, 'run');
};

BitsPerBeat.prototype._onTurnamentEventParserError = function (err, turnamentEvent) {
	//Случилась какая то критическая ошибка, мы не уверены что се результаты внесены, поэтому 
	//Данные в БД не вносим, переходим к следуюущему турниру.
	util.log('ERROR: TurnamentEventParserError: ' + err);
	turnamentEvent.turnament.next();
};

BitsPerBeat.prototype._onTurnamentEventDone = function (turnamentEvent) {
	//Если мы здесь, значит сбор результатов матчей завершен, вносим информацию о событии в БД
	//Сообщаем на верх о столь прекрасном событии
	this.emit('tedone', turnamentEvent, this);
};
////////

//Обработчики для MatchParser
BitsPerBeat.prototype._onMatchParserDone = function (match) {
	//Здесь вносим результаты матча в БД
	//Сообщаем на верх о этом событии
	this.emit('mpdone', match, this);
};

BitsPerBeat.prototype._onMatchParserError = function (err, match) {
	//Критическая ошибка. При разборе матча, мы пропускаем этот матч, и помечаем турнир как не сохроняемый что бы учесть остальные матчи, но не сохронять турнир!
	match.turnamentEvent.isError = true;
	match.turnamentEvent.next();
};
///////

//Запускает функцию церез установленный промежуток времени с момента предыдущего запуска
BitsPerBeat.prototype._launch = function (obj, func, args) {
	var now = new Date().getTime();
	var r = now - this._lastL;
	args = args || [];	
	var i = (r < this._requestInterval)? this._requestInterval - r: 0;
	setTimeout(function (obj, func, args) {
		//util.log('Launch: ' + func + '(' + args.join(', ') + ')');
		obj[func].apply(obj, args);
	}, i, obj, func, args);
	
	this._lastL = now + i;
};