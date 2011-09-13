// Разбо информации о матче с bitsperbeat.com
var		EventEmitter = require('events').EventEmitter
	,	util = require('util')
	,	htmlParser = require('htmlparser')
	,	URL = require('url')
	,	rzu = require('../../lib/rz.util.js')
	,	SiteClient = require('../../lib/siteClient.js')
	,	select = require('../../lib/node-soupselect').select
	, 	Match = require('./Match.js')
	;


var MatchParser = module.exports = function (matchHref, turnamentEvent) {
	MatchParser.super_.apply(this, arguments);
	this._turnamentEvent = turnamentEvent;
	this._href = matchHref;
	this._isDone = false;
	this._isRun = false;
};
util.inherits(MatchParser, EventEmitter);

MatchParser.prototype.__defineGetter__('isDone', function() {
	return this._isDone;
});

MatchParser.prototype.__defineGetter__('isRun', function() {
	return this._isRun;
});

MatchParser.prototype.__defineGetter__('href', function() {
	return this._href;
});

MatchParser.prototype.__defineGetter__('turnamentEvent', function() {
	return this._turnamentEvent;
});

MatchParser.prototype.__defineGetter__('protocol', function () {
	return URL.parse(this.href).protocol;
});

MatchParser.prototype.__defineGetter__('host', function () {
	return URL.parse(this.href).host;
});

MatchParser.prototype.__defineGetter__('path', function () {
	return URL.parse(this.href).pathname;
});

MatchParser.prototype.__defineGetter__('search', function () {
	return URL.parse(this.href, true).search;
});

MatchParser.prototype.run = function () {
	if (this.isRun) {
		this._error('Already run');
	} else {
		this._isRun = true;
		var opt = {
				host: this.host,
				path: this.path + this.search
			};
		var match = new SiteClient(opt);
		match.on('load', function(page) {
			if (page.status != 200) {
				this._error('Page status: ' + page.status);
			} else {
				this.parse(page.body);
			};
		}.bind(this));
	
		match.run(function(err) {
			if (err) this._error(err);
		}.bind(this));
		
		this.emit('run')
	};
};

MatchParser.prototype.done = function (res) {
	this._isDone = true;
	this.emit('done', res);
};

MatchParser.prototype._error = function (err) {
	this._isDone = true;
	util.log('ERROR: parse match href: ' + this.href + ((err)? '; err: ' + err: ''));
	this.emit('err', err, this);
};

MatchParser.prototype.parse = function (body) {
	var handler = new htmlParser.DefaultHandler(function(err, dom) {
		if (err) {
			this._error(err);
		} else {
			var p1 = select(select(dom, 'div.player1'), 'a');
			var p2 = select(select(dom, 'div.player2'), 'a');
			var s1 = select(select(dom, 'ul.pl1'), 'span');
			var s2 = select(select(dom, 'ul.pl2'), 'span');
			// !!!!!!!!!ОМГ  :D
			if (p1 && p1[0] && p1[0].children && p1[0].children[0] && p1[0].children[0].data &&
				p2 && p2[0] && p2[0].children && p2[0].children[0] && p2[0].children[0].data && 
				s1 && s1[0] && s1[0].children && s1[0].children[1] && s1[0].children[1].data &&
				s2 && s2[0] && s2[0].children && s2[0].children[1] && s2[0].children[1].data    ) {
				
				var match = new Match({
						turnamentEvent		:	this.turnamentEvent,
						href				:	this.href,
						pl1					:	p1[0].children[0].data,
						pl2					:	p2[0].children[0].data,
						scr1				:	s1[0].children[1].data.replace(/\D+/g, ''),
						scr2				:	s2[0].children[1].data.replace(/\D+/g, '')
					});
				this.done(match);
			} else {
				this._error('Data not found');
			};
		};
	}.bind(this));

	var parser = new htmlParser.Parser(handler);
	parser.parseComplete(body);			
};