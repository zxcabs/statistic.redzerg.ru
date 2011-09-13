//Разбираем результат матча ESL
var		EventEmitter = require('events').EventEmitter
	,	util = require('util')
	,	htmlParser = require('htmlparser')
	,	URL = require('url')
	,	rzu = require('../../lib/rz.util.js')
	,	SiteClient = require('../../lib/siteClient.js')
	,	select = require('../../lib/node-soupselect').select
	, 	Match = require('../../lib/Match.js')
	,	setting = require('../../setting/setting')
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

MatchParser.prototype.run = function () {
	if (this.isRun) {
		this._error('Already run');
	} else {
		this._isRun = true;
		var opt = {
				host: this.host,
				path: this.path,
				headers: setting.parsers.esl.headers
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
			var trs = select(dom, 'tr');
			
			var pl1 = {};
			var pl2 = {};
			
			for (var t in trs) {
				var tr = trs[t];
				//Ищем игроков
				if (tr && tr.children && tr.children.length == 7 && tr.children[1].children && tr.children[1].children.length == 5) {
				//	console.log('\n\n' + util.inspect(tr, true, 10));
					pl1.label = tr.children[1].children[1].children[3].data.replace(/\s+/, '');
					pl1.name = (tr.children[1].children[3].children)? tr.children[1].children[3].children[0].data: (!pl1.label)? 'freewin': pl1.label;
					
					pl2.label = tr.children[5].children[1].children[3].data.replace(/\s+/, '');
					pl2.name = (tr.children[5].children[3].children)? tr.children[5].children[3].children[0].data: (!pl2.label)? 'freewin': pl2.label;					
				};
				
				//Ищем результат
				if (tr && tr.children && tr.children.length == 11 && !tr.children[1].children) {
					//console.log('\n\n' + util.inspect(tr, true, 10));
					if (tr.children[3].children && tr.children[3].children[0].children && tr.children[3].children[0].children[0].data
					    && tr.children[7].children && tr.children[7].children[0].children && tr.children[7].children[0].children[0].data) {
						
						pl1.scr = tr.children[3].children[0].children[0].data;
						pl2.scr = tr.children[7].children[0].children[0].data;
					};
				};
			};
			
			//console.log('pl1: ' + util.inspect(pl1));
			//console.log('pl2: ' + util.inspect(pl2));
			if (pl1.name && pl2.name && pl1.scr && pl2.scr) {
				var match = new Match({
						turnamentEvent		:	this.turnamentEvent,
						href				:	this.href,
						pl1					:	pl1.name,
						pl2					:	pl2.name,
						scr1				:	pl1.scr,
						scr2				:	pl2.scr
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