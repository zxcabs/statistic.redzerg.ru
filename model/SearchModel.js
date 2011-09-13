// SearchModel
var 	BaseModel = require('./BaseModel')
	,	rzu = require('../lib/rz.util')
	,	util = require('util')
	;
	
/**
 * (set)	s:<index>:	{val}
 * (string)	s:c:<key>:	0
 * (string)	s:v:<key>:	val	
 */
var	SearchModel = module.exports = function (client) {
	SearchModel.super_.apply(this, arguments);
	
	this._indexRes = null;
	this._matchInd = null;
};
util.inherits(SearchModel, BaseModel);

SearchModel.prototype.create = function (key, val) {
	var index = new SearchModel(this.client);
	
	index._key = rzu.normalS(key);
	index._val = val || key;
	index._isCreate = true;
	return index;
};

SearchModel.prototype.__defineGetter__('key', function () {
	return this._key;
});

SearchModel.prototype.__defineGetter__('val', function () {
	return this._val;
});

SearchModel._prefix_ = 's:';

SearchModel.prototype.pSet = function (index) {
	return SearchModel._prefix_ + 'i:' + index + ':';
};

SearchModel.prototype.pCount = function (key) {
	return 's:c:' + (key || this.key) + ':';
};

SearchModel.prototype.pVal = function (key) {
	return 's:v:' + (key || this.key) + ':';
};

SearchModel.prototype.getIndexs = function (key) {
	key = key || this.key;
	var indexs = {};

	for (var i in key) {
		indexs['k' + key[i]] = this.pSet(key[i]);
	};

	return indexs;
};

//Save
SearchModel.prototype.save = function (callback) {
	if (this.isCreate) {
		if (this.isNew) {
			var indexs = this.getIndexs();
			var m = this.client.multi();
			var self = this;
		
			for(var i in indexs) {
				m.sadd(indexs[i], this.key);
			};
		
			m.setnx(this.pCount(), 0);
			m.setnx(this.pVal(), this.val);
		
			m.exec(function(err, replis) {
				if (err) {
					if (callback) callback.call(self, err, null, self);
				} else {
					self._isNew = false;
					if (callback) callback.call(self, null, true, self);
				};
			});
		// if (isNew)
		} else {
			if (callback) callback.call(this, new Error('SearchModel not new, can\'t save'), null, this);
		};
		//if (isCreate)
	} else {
		if (callback) callback.call(this, new Error('SearchModel must be created before save'), null, this);
	};
};

//findBy*
SearchModel.prototype.findByIndex = function (o, callback) {
	o.index = rzu.normalS(o.index);
	var self = this;
	//Проверяем существует ли искомый ключ
	this.client.exists(this.pSet(o.index), function (err, res) {
		if (err) {
			if (callback) callback.call(self, err, null, self);
		} else if (res == 1) {
			//Ключ существует, делаем выборку из него.
			self._doQuery(o, callback);
		} else {
			//Ключ не существует, необходимо создать.
			var indexs = self.getIndexs(o.index);
			var query = [];
			
			for(var i in indexs) {
				query.push(indexs[i]);
			};
			
			self.client.sunion(query, function (err, repl) {
				if (err) {
					if (callback) callback.call(self, err, null, self);
				} else if (repl.length == 0) {
					//Записей по ключам не существует
					if (callback) callback.call(self, null, null, self);
				} else {
					//Записи найдены, ищем совпадения
					self._indexRes = repl;
					self._findMatch.call(self, o, callback);
				};
			});
		};
	});
};

SearchModel.prototype._findMatch = function (o, callback) {
	var o = o, callback = callback;
	var count = 0;
	var reg = new RegExp(o.index, 'ig');
	
	var i = this._indexRes.pop();
	
	if (!this._matchInd) {
		this._matchInd = [];
	};
	
	while(i && count < 100) {
		if (i.match(reg)) {
//			console.log(this._matchInd);
			this._matchInd.push(i);
		};
		count++;
		i = this._indexRes.pop();
	};
	
	if (this._indexRes.length > 0) {
		process.nextTick(function () {
			this._findMatch.call(this, o, callback);
		}.bind(this));
	} else {
		// Поиск завершен
		// Сохраняем
		var self = this;
		var m = this.client.multi();
		for(var i in this._matchInd) {
			m.sadd(this.pSet(o.index), this._matchInd[i]);
		};
		m.exec(function (err, res) {
			if (err) {
				if (callback) callback.call(self, err, null, self);
			} else {
				self.client.expire(self.pSet(o.index), self.KEYTTL, function (err, res) {
					if (err) util.log('Error to set TTL for key: ' + self.pSet(o.index) + '; error: ' + err);
					self._doQuery.call(self, o, callback);
				});
				
				delete(self._indexRes);
				delete(self._matchInd);
				
				self._indexRes = null;
				self._matchInd = null;
				
			};
		});
	};
	
};

SearchModel.prototype._doQuery = function (o, callback) {
	var self = this;
	var query = [
					self.pSet(o.index),
					'limit', (o.start || 0), (o.stop || 20)
				];
	
	if (o.by || o.by == 'count') {
		query.push('by');
		query.push(self.pCount('*'));
	};
	
	if (o.get) {
		for(var g in o.get) {
			if (o.get[g] == 'value') {
				query.push('get');
				query.push(self.pVal('*'));
			};
			
			if (o.get[g] == 'count') {
				query.push('get');
				query.push(self.pCount('*'));
			};
		};
	};
	
	if (o.sort) {
		if (o.sort.match(/alpha/i)) {
			query.push('alpha');
		};

		if (o.sort.match(/asc/i)) {
			query.push('asc');
		} else {
			query.push('desc');
		};
	};
	
	if (o.include) {
		//Будет найдено пересечение
		query.shift();
		var key = SearchModel._prefix_ + 'tmp:' + o.index + o.include + ':';
		query.unshift(key);
		self.client.sinterstore(key, self.pSet(o.index), o.include, function (err, res) {
			if (err) {
				self.client.del(key);
				if (callback) callback.call(self, err, null, self);
			} else {
				self._findBy(query, function (err, replis) {
					self.client.del(key);
					if (err) {
						if (callback) callback.call(self, err, null, self);
					} else {
						if (callback) callback.call(self, null, replis, self);
					};					
				});
			};
		});
	} else {
		self._findBy(query, callback);
	};
};

SearchModel.prototype._findBy = function (query, callback) {
	var self = this;
	this.client.sort(query, function (err, replis) {
		if (err) {
			if (callback) callback.call(self, err, null, self);
		} else {
			if (callback) callback.call(self, null, replis, self);
		};
	});
};
///// findBy

//incr 
SearchModel.prototype.incr = function (key, callback) {
	var self = this;
	key = rzu.normalS(key);
	this.client.exists(this.pCount(key), function (err, res) {
		if (err) {
			if (callback) callback.call(self, err, null, self);
		} else if (res == 0){
			if (callback) callback.call(self, null, false, self);
		} else {
			self.client.incr(self.pCount(key), function (err, res) {
				if (err) {
					if (callback) callback.call(self, err, null, self);
				} else {
					if (callback) callback.call(self, err, res, self);
				};
			});
		};			
	});
};
//////
