//Обрабатываем сетку турнира и возвращаем ссылки на матчи
var		EventEmitter = require('events').EventEmitter
	,	util = require('util')
	,	htmlParser = require('htmlparser')
	,	URL = require('url')
	,	rzu = require('../../lib/rz.util.js')
	,	SiteClient = require('../../lib/siteClient.js')
	,	select = require('../../lib/node-soupselect').select
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

TurnamentEventParser.prototype.__defineGetter__('search', function () {
	return URL.parse(this.href, true).search;
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
	var tID = URL.parse(this.href, true).query.tID;
	if (!tID) {
		this._error('Can\'t get tID');
	} else {
		
		var err = null;
		
		//load pregrid
		var pgopt = {
				host: this.host,
				path: '/wp-content/standalone/sa.php?get=pregrid&ID=' + tID + '&' + (new Date().getTime())
			};
		var pregrid = new SiteClient(pgopt);
		
		pregrid.on('load', function (page) {		
			if (page.status != 200) {
				err += 'pregrid status: ' + page.status + '; ';
			} else {
				this.parseXMLMatchs(page.body, function(err, matchs) { 
					if (err) {
						this._warn('parseXMLMatchs: ' + err);
					} else {
						this._matchs = this._matchs.concat(matchs);
						if(grid.isDone) {
							if (!err) {
								this._onParserDone();
							} else {
								this._error(err);
							};
						};
					};
				}.bind(this));
			};
		}.bind(this));
		
		//load grid
		var gopt = {
				host: this.host,
				path: '/wp-content/standalone/sa.php?get=grid&ID=' + tID + '&' + (new Date().getTime())
			};
			
		var grid = new SiteClient(gopt);
		grid.on('load', function (page) {
			if (page.status != 200) {
				err += 'grid status: ' + page.status + '; ';
			} else {
				this.parseGrid(page.body, function(err, matchs) {
					if (err) {
						this._warn('parseGrid: ' + err);
					} else {
						this._matchs = this._matchs.concat(matchs);
						if(pregrid.isDone) {
							if (!err) {
								this._onParserDone();
							} else {
								this._error(err);
							};
						};
					};
				}.bind(this));
			};
		}.bind(this));
		
		pregrid.run(function(err){
			if (err) {
				this._error('Load pregrid ' + err);
			} else {
				grid.run(function(err){
					if (err) this._error('Load grid ' + err);
				}.bind(this));
			};
		}.bind(this));
	};
};

TurnamentEventParser.prototype.parseXMLMatchs = function (body, callback) {
	var handler = new htmlParser.DefaultHandler(function(err, dom) {
		var matchs = new Array();
		if (!err) {
			var ms = select(dom, 'match');
			if (ms && ms.length > 0 && ms[0].attribs['matchid']) {
				for (var m in ms) {
					var href = this.protocol + '//' +this.host + this.path +'?site=match-details&ID=' + ms[m].attribs['matchid'] + '&action=placebet';
					matchs.push(href);
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

TurnamentEventParser.prototype.parseGrid = function (body, callback) {
	var handler = new htmlParser.DefaultHandler(function(err, dom) {
		var matchs = new Array();
		if (!err) {
			var ms = select(select(dom, 'div.grid'), 'a');
			if (ms && ms.length > 0 && ms[0].attribs['href']) {
				for(var m in ms) {
					var href = this.protocol + '//' + this.host + this.path + ms[m].attribs['href'] + '&action=placebet';
					matchs.push(href);
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