//Обрабатываем историю турниров, и получаем УРЛ на турниры для http://www.bitsperbeat.com
var		EventEmitter = require('events').EventEmitter
	,	util = require('util')
	,	htmlParser = require('htmlparser')
	,	URL = require('url')
	,	rzu = require('../../lib/rz.util.js')
	,	SiteClient = require('../../lib/siteClient.js')
	,	select = require('../../lib/node-soupselect').select
	;

var TurnamentParser = module.exports = function (href) {
	TurnamentParser.super_.apply(TurnamentParser, arguments);
	this._href = href;
	this._isRun = false;
	this._isDone = false;
	this._turnamentEvents = new Array();
};
util.inherits(TurnamentParser, EventEmitter);

TurnamentParser.prototype.__defineGetter__('isDone', function () {
	return this._isDone;
});

TurnamentParser.prototype.__defineGetter__('isRun', function () {
	return this._isRun;
});

TurnamentParser.prototype.__defineGetter__('href', function () {
	return this._href;
});

TurnamentParser.prototype.__defineGetter__('protocol', function () {
	return URL.parse(this.href, true).protocol;
});

TurnamentParser.prototype.__defineGetter__('host', function () {
	return URL.parse(this.href, true).host;
});

TurnamentParser.prototype.__defineGetter__('path', function () {
	return URL.parse(this.href, true).pathname;
});

TurnamentParser.prototype.__defineGetter__('search', function () {
	return URL.parse(this.href, true).search;
});

TurnamentParser.prototype._parserDone = function () {
	this.emit('parserDone', this._turnamentEvents, this);
};

TurnamentParser.prototype.next = function () {
	var t = this._turnamentEvents.pop();
	
	if(t) {
		this.emit('next', t, this);
	} else {
		this._done();
	};
};

TurnamentParser.prototype.setTurnamentEvents = function (events) {
	this._turnamentEvents = events;
};

TurnamentParser.prototype._done = function () {
	this._isDone = true;
	this.emit('done', this);
};

TurnamentParser.prototype._error = function (err) {
	//util.log('ERROR: TurnamentParser href: ' + this.href + '; err: ' + err);
	this._isDone = true;
	this.emit('err', err, this);
};

TurnamentParser.prototype.run = function () {
	if (this.isRun) {
		this._error('Already run');
	} else {
		this._isRun = true;
		
		var opt = {
				host: this.host,
				path: this.path + this.search
			};
		var site = new SiteClient(opt);
			
		site.on('load', function (page) {
			if (page.status != 200) {
				this._error('Page status: ' + page.status);
			} else {
				this.parse(page.body);
			};
		}.bind(this));
		
		site.run(function (err) {
			if (err) this._error(err);
		}.bind(this));
		
		this.emit('run')
	};
};

TurnamentParser.prototype.parse = function (body) {
	var handler = new htmlParser.DefaultHandler(function(err, dom) {
		if (err) {
			this._error('Parse error: ' + err);
		} else {
			var url = this.protocol + '//' + this.host + this.path;
			var elems = select(dom, 'a.brackets-symbol');
			
			if (elems && elems.length != 0) {
				for (var e in elems) {
					this._turnamentEvents.push(url + elems[e].attribs.href);
				};
				this._parserDone();
			} else {
				this._error('Parse error: no data');
			};
		};
	}.bind(this));

	var parser = new htmlParser.Parser(handler);
	parser.parseComplete(body);	
};