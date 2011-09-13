//Обрабатывает сетку турнира и возвращает ссылки на матчи
var		EventEmitter = require('events').EventEmitter
	,	util = require('util')
	,	htmlParser = require('htmlparser')
	,	URL = require('url')
	,	rzu = require('../../lib/rz.util.js')
	,	SiteClient = require('../../lib/siteClient.js')
	,	select = require('../../lib/node-soupselect').select
	,	setting = require('../../setting/setting')
	;

	
var TurnamentEventParser = module.exports = function (href, turnament) {
	TurnamentEventParser.super_.apply(this, arguments);
	
	this._turnament = turnament;
	this._href = href;	
	this._isDone = false;
	this._isRun = false;
	this._matchs = new Array();
	
	this.isError = false;
};
util.inherits(TurnamentEventParser, EventEmitter);

TurnamentEventParser.prototype.__defineGetter__('turnament', function () {
	return this._turnament;
});

TurnamentEventParser.prototype.__defineGetter__('isDone', function () {
	return this._isDone;
});

TurnamentEventParser.prototype.__defineGetter__('isRun', function () {
	return this._isRun;
});

TurnamentEventParser.prototype.__defineGetter__('href', function () {
	return this._href;
});

TurnamentEventParser.prototype.__defineGetter__('protocol', function () {
	return URL.parse(this.href, true).protocol;
});

TurnamentEventParser.prototype.__defineGetter__('host', function () {
	return URL.parse(this.href, true).host;
});

TurnamentEventParser.prototype.__defineGetter__('path', function () {
	return URL.parse(this.href, true).pathname;
});

TurnamentEventParser.prototype._onParserDone = function () {
	if (this._matchs.length > 0 ) {
		this.emit('parserDone', this._matchs, this);
	} else {
		this._error('Matchs not found');
	};
};

TurnamentEventParser.prototype._Done = function () {
	this._isDone = true;
	this.emit('done', this);
};

TurnamentEventParser.prototype._error = function (err) {
	util.log('ERROR: TurnamentEventParser url: ' + this.href + '; err: '  + err);
	this._isDone = true;
	this.emit('err', err, this);
};

TurnamentEventParser.prototype._warn = function (warn) {
	util.log('WARNING TurnamentEventParser url: ' + this.href + '; warn: '  + warn);
	this._isDone = true;
	this.emit('warn', warn, this);
};

TurnamentEventParser.prototype.run = function () {
	if (this.isRun) {
		this._error('Already run');
	} else {
		this._isRun = true;
		this.getTList();
		this.emit('run')
	};
};

TurnamentEventParser.prototype.setMatchs = function (matchs) {
	this._matchs = matchs;
};

TurnamentEventParser.prototype.next = function () {
	var m = this._matchs.pop();

	if (m) {
		this.emit('next', m, this);
	} else {
		this._Done();
	};
};

//
TurnamentEventParser.prototype.getTList = function () {
	var err = null;
	//load grid
	var opt = {
			host: this.host,
			path: this.path,
			headers: setting.parsers.esl.headers
		};
			
	var grid = new SiteClient(opt);
	grid.on('load', function (page) {
		if (page.status != 200) {
			err += 'grid status: ' + page.status + '; ';
		} else {
			this.parseGrid(page.body, function(err, matchs) {
				if (err) {
					this._warn('parseGrid: ' + err);
				} else {
					this._matchs = matchs;
					if (!err) {
						this._onParserDone();
					} else {
						this._error(err);
					};
				};
			}.bind(this));
		};
	}.bind(this));
		
	grid.run(function(err){
		if (err) this._error('Load grid ' + err);
	}.bind(this));
};

TurnamentEventParser.prototype.parseGrid = function (body, callback) {
	var handler = new htmlParser.DefaultHandler(function(err, dom) {
		var matchs = new Array();
		if (!err) {
			var ms = select(dom, 'a');
			if (ms && ms.length > 0) {
				for(var m in ms) {
					if (ms[m] && ms[m].attribs && ms[m].attribs['href'] && ms[m].attribs['href'].match(/match\/\d+\/$/gi)) {
						var href = this.protocol + '//' + this.host + ms[m].attribs['href'];
						matchs.push(href);
					};
				};
			} else {
				err = 'No data';
			};
		};
		callback.call(this, err, matchs);
	}.bind(this));

	var parser = new htmlParser.Parser(handler);
	parser.parseComplete(body);		
};