//Клиент для сайтов
var 	EventEmitter = require('events').EventEmitter
	,	util = require('util')
	,	http = require('http')
	;

var SiteClient = module.exports = function (opt) {
	SiteClient.super_.apply(this, arguments);
	
	this._opt = opt || {};
	this._opt.prot = this._opt.prot || 'http';
	this._opt.host = this._opt.host || null;
	this._opt.path = this._opt.path || '';
	this._opt.port = this._opt.port || 80;
	this._opt.method = this._opt.method || 'GET';
	this._opt.encode = this._opt.encode || 'utf8';
	this._opt.headers = this._opt.headers || null;
	this._isDone = false;
	this._req = null;
	
	this.__defineGetter__('host', function () {
		return this._opt.host;
	});
	
	this.__defineGetter__('path', function() {
		return this._opt.path;
	});
	
	this.__defineGetter__('port', function () {
		return this._opt.port;
	});
	
	this.__defineGetter__('url', function() {
		return this._opt.prot + '://' + this._opt.host + this._opt.path;
	});

	this.__defineGetter__('prot', function() {
		return this._opt.prot;
	});
	
	this.__defineGetter__('isDone', function() {
		return this._isDone;
	});
};

util.inherits(SiteClient, EventEmitter);

//callback(err)
SiteClient.prototype.run = function(callback) {
	var err = null;
	var self = this;
	
	if (this.host == null) {
		err = 'host is null';
	} else {
		if (this.prot == 'http') {
			var opt = {
					host: 	this.host,
					path: 	this.path,
					port: 	this.port,
					method:	this.method
				};
			if (this._opt.headers) {
				opt.headers = this._opt.headers;
			};
			
			var self = this;
			
			this._req = http.request(opt, function (res) {
				var result = {
					status: res.statusCode,
					header: res.headers,
					body:	''
				}; 
				
				res.setEncoding(self._opt.encode);				
				res.on('data', function (chunk) {
					result.body += chunk;
				});
				
				res.on('end', function () {
					self._isDone = true;
					self.emit('load', result);
				});
			});
			
			this._req.end();
			
		} else if (this.prot == 'https') {
			err = 'prot https dos\'t';
		} else {
			err = 'unknow protocol: ' + this.prot;
		};
	}	
	
	process.nextTick(function() {
		callback.call(self, err, self);
	});
};
