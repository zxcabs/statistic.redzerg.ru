//var 	rzu = require('../lib/rz.util.js');
var		BaseModel = require('./BaseModel')
	,	util = require('util')
	;

/**
 * Стурктура представленна в бд в виде:
 * (hash) sites:hash {
 *						href:<hash> <url>
 *					 }
 * (set) sites:set <timeAdd> <hash>
 */

// Модель для Сайтов
var	SiteModel = module.exports =  function (client) {
	SiteModel.super_.apply(this, arguments);
};
util.inherits(SiteModel, BaseModel);

SiteModel.prototype.create = function (href) {
	var site = new SiteModel(this.client);
	site._href = href;
	site._isCreate = true;
	return site;
};
	
SiteModel.prototype.__defineGetter__('hash', function () {
	return this.getHash(this._href);
});
	
SiteModel.prototype.__defineGetter__('href', function () {
	return this._href;
});
	
SiteModel.prototype.__defineSetter__('href', function (href) {
	this._href = href;
});

SiteModel._prefix_ = 'sites:';

SiteModel.prototype.pHash = function () {
	return SiteModel._prefix_ + 'hash';
};

SiteModel.pSet = function () {
	return SiteModel._prefix_ + 'set';
};

SiteModel.prototype.kHref = function (hash) {
	return 'href:' + (hash || this.hash);
};

//SiteModel.save();
SiteModel.prototype._save = function () {
	this.client.watch(this.pHash());
	this.client.multi([
		['hset', this.pHash(), this.kHref(), this.href],
		['sadd', SiteModel.pSet(), this.hash]
	]).exec(this._onSave.bind(this));
};

SiteModel.prototype._onSaveExists = function (err, res) {
	if (err) {
		this._end(err, res);
	} else if (res) {
		this._isNew = false;
		this._end(new Error('Already exists href: ' + this.href));
	} else {
		this._save();
	};
};

SiteModel.prototype._onSave = function (err, res) {
	if (res) {
		this._isNew = false;
		this._end(err, res);
	} else {
		//транзакция не прошла, начинаем по новой
		this.save(this._callback);
	};
};

SiteModel.prototype.save = function (callback) {
	this._callback = callback;
	if (this.isCreate) {
		if (this.isNew) {
			this.client.hexists(this.pHash(), this.kHref(), this._onSaveExists.bind(this));
		} else {
			this._end(new Error('Isn\'t new.'));
		};
	} else {
		this._end(new Error('Model must bee create'));
	};
};
////

//SiteModel.update()
SiteModel.prototype.update = function (callback) {
	this._callback = callback;
	if (this.isCreate) {
		if (this.isNew) {
			this._end(new Error('Isn\'t new.'));
		} else {
			this._save();
		};
	} else {
		this._end(new Error('Model must bee create'));
	};
};
////

// SiteModel.remove()
SiteModel.prototype._onRemove = function (err, res) {
	this._isNew = true;
	this._end(err, res);
};

SiteModel.prototype.remove = function (callback) {
	this._callback = callback;
	
	if (!this.isNew) {
		this.client.multi([
			['hdel', this.pHash(), this.kHref()],
			['srem', SiteModel.pZset(), this.hash]
		]).exec(this._onRemove.bind(this));
	} else {
		this._end(new Error('Record is new.'));
	};
};
////

// SiteModel.findBy
SiteModel.prototype.findByHash = function (hash, callback) {
	this.client.hget(this.pHash(), SiteModel.prototype.kHref(hash), function(err, val) {
		var res = null;
		if (!err && val) {
			res = this.create(val);
			res._isNew = false;
			res._callback = callback;
			res._end(null, res);
		} else {
			if (callback) callback(err, res);
		};
	}.bind(this));
};

SiteModel.prototype.findByHref = function (href, callback) {
	this.findByHash(SiteModel.prototype.getHash(href), callback);
};

//Получает список URL, возврщаете список отсутствующих в базе
//Очень медленный метод! не использовать без надобности!
SiteModel.prototype.findNew = function (hrefs, callback) {
	var hash = SiteModel.prototype.getHash(Math.random());
	var tmpKeyIn = 'site_in:' + hash;
	var obj = new Object();
	
	var multi = this.client.multi();
	for (var h in hrefs) {
		var k = SiteModel.prototype.getHash(hrefs[h]);
		multi.sadd(tmpKeyIn, k);
		obj[k] = hrefs[h];
	};
	
	multi.sdiff(tmpKeyIn, SiteModel.pSet(), function (err, res) {
		var n = new Array();
		if (!err) {
			for (var r in res) {
				n.push(obj[res[r]]);
			};
		};
		
		if (callback) callback.call(this, err, n);
	}.bind(this));
	multi.del(tmpKeyIn);
	multi.exec(function (err, res) {
		obj = null;
		delete(obj);
		multi = null;
		delete(multi);
	});
};
//////

//возвращаем общее кол-во матчей
SiteModel.prototype.getCount = function (callback) {
	this._callback = callback;
	this.client.scard(SiteModel.pSet(), function (err, res) {
		this._end(err,res);
	}.bind(this));
};