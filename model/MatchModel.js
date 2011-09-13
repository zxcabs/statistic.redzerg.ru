// Модель для матча
var		util = require('util')
	,	rzu = require('../lib/rz.util')
	,	BaseModel = require('./BaseModel')
	;

/**
 * (hash)	match:<hash>:
 *				href:			href
 *				scr:<player>:	score
 *				gameCount:		gameCount
 *				addTime:		time
 *
 * (set)	match:set:				{hash}		//Все матчи
 * (set)	match:<player>:matchs:	{hash}   	//Список матчей для игрока
 * (set)	match:<player>:enemies:	{player}	//Список противников игрока
 * (set)	match:players:			{player}	//Список всех игроков
 *
 * //Это временный ключ статистики игрока время жизни определяется TTL
 * (hash)	match:tmp:stat:<player>: 
 *              name:			plName
 *				score:			score
 *              gameCount: 		gameCount
 *              matchCount: 	matchCount
 *              enemiesCount:	enemiesCount
 */
	
var MatchModel = module.exports = function (client) {
	MatchModel.super_.apply(this, arguments);
};
util.inherits(MatchModel, BaseModel);

// Constructor here!!!!!!!!!!!!!!!!!!!!!!!!!!!
MatchModel.prototype.create = function(match) {
	var m = new MatchModel(this.client);
	m._match = match;
	m._match.addTime = m._match.addTime || new Date().getTime();
	m._isCreate = true;
	
	return m;
};

MatchModel.prototype.__defineGetter__('match', function () {
	return this._match;
});

MatchModel.prototype.__defineGetter__('href', function () {
	return this.match.href;
});

MatchModel.prototype.__defineGetter__('hash', function () {
	return this.getHash(this.href);
});

MatchModel.prototype.__defineGetter__('pl1', function () {
	return this.match.pl1;
});

MatchModel.prototype.__defineGetter__('pl2', function () {
	return this.match.pl2;
});

MatchModel.prototype.__defineGetter__('scr1', function () {
	return this.match.scr1;
});

MatchModel.prototype.__defineGetter__('scr2', function () {
	return this.match.scr2;
});

MatchModel.prototype.__defineGetter__('gameCount', function () {
	return this.match.gameCount;
});

MatchModel.prototype.__defineGetter__('addTime', function () {
	return this.match.addTime;
});

//Prefixs and keys
MatchModel._prefix_ = 'match:';

MatchModel.prototype.pHash = function (hash) {
	return MatchModel._prefix_ + (hash || this.hash) + ':';
};

MatchModel.prototype.kHref = function () {
	return 'href:';
};

MatchModel.prototype.kScore = function (player) {
	return 'scr:' + rzu.normalS(player) + ':';
};

MatchModel.prototype.kGameCount = function () {
	return 'gameCount:';
};

MatchModel.prototype.kAddTime = function () {
	return 'addTime:';
};

MatchModel.prototype.pSet = function () {
	return MatchModel._prefix_ + 'set:';
};

MatchModel.prototype.pPlayerMatchs = function (player) {
	return MatchModel._prefix_ + rzu.normalS(player) + ':matchs:';
};

MatchModel.prototype.pPlayerEnemies = function (player) {
	return MatchModel._prefix_ + rzu.normalS(player) + ':enemies:';
};

MatchModel.prototype.pPlayers = function () {
	return MatchModel._prefix_ + 'players:';
};

// for PlayerStat
MatchModel.prototype.pPlayerStat = function (player) {
	return MatchModel._prefix_ + 'tmp:stat:' + rzu.normalS(player) + ':';
};

MatchModel.prototype.kStatName = function () {
	return 'n:';
};

MatchModel.prototype.kStatScore = function () {
	return 's:';
};

MatchModel.prototype.kStatGameCount = function () {
	return 'gc:';
};

MatchModel.prototype.kStatMatchCount = function () {
	return 'mc:';
};

MatchModel.prototype.kStatEnemyCount = function () {
	return 'ec:';
};
///////////

//Save 
MatchModel.prototype.save = function (callback) {
	if (this.isCreate) {
		if (this.isNew) {
			this._save(callback);
		// if (isNew)
		} else {
			if (callback) callback.call(this, new Error('MatchModel must bee new on save'), null, this);
		};
	// if (isCreate)
	} else {
		if (callback) callback.call(this, new Error('MacthModel must bee create before save'), null, this);
	};
};

MatchModel.prototype._save = function (callback) {
	var self = this;
	this.client.exists(this.pHash(), function (err, replis) {
		if (err) {
			if (callback) callback.call(self, err, null, self);
		} else if (replis == 1) {
			if (callback) callback.call(self, new Error('MatchModel already exists'), null, self);
		} else {
			self.client.watch(self.pHash());
			self.client.multi([
				['hmset', self.pHash(), self.kHref(), self.href, self.kScore(self.pl1), self.scr1,
						self.kScore(self.pl2), self.scr2, self.kGameCount(), self.gameCount,
						self.kAddTime(), self.addTime],
				['sadd', self.pSet(), self.hash],
				['sadd', self.pPlayerMatchs(self.pl1), self.hash],
				['sadd', self.pPlayerMatchs(self.pl2), self.hash],
				['sadd', self.pPlayerEnemies(self.pl1), rzu.normalS(self.pl2)],
				['sadd', self.pPlayerEnemies(self.pl2), rzu.normalS(self.pl1)],
				['sadd', self.pPlayers(), rzu.normalS(self.pl1)],
				['sadd', self.pPlayers(), rzu.normalS(self.pl2)]
			]).exec(function (err, res) {
				if (err) {
					if (callback) callback.call(self, err, null, self);
				} else if (res == null) {
					self._save(callback);
				} else {
					if (callback) callback.call(self, null, true, self);
				};
			});
		};
	});
};
///// Save

//Get result
MatchModel.prototype.getResult = function (pl1Name, pl2Name, callback) {
	var self = this;
	var tmpKey = MatchModel._prefix_ + 'tmp:' + Math.random() + ':';
	
	//Вычисляем общие матчи
	this.client.sinterstore(tmpKey, this.pPlayerMatchs(pl1Name), this.pPlayerMatchs(pl2Name), function (err, replis) {
		if (err) {
			if (callback) callback.call(self, err, null, self);
		} else {
			self.client.sort(tmpKey, 'get', self.pHash('*') + '->' + self.kScore(pl1Name), 
									 'get', self.pHash('*') + '->' + self.kScore(pl2Name), 
									 'get', self.pHash('*') + '->' + self.kGameCount(), 
									 'get', self.pHash('*') + '->' + self.kHref(),function (err, replis) {
				self.client.del(tmpKey);
				if (err) {
					if (callback) callback.call(self, err, null, self);
				} else if (replis.length == 0) {
					if (callback) callback.call(self, null, null, self);
				} else {
					self._calcResult.call(self, pl1Name, pl2Name, replis, callback);
				}				
			});
		};
	});
};

MatchModel.prototype._calcResult = function (pl1, pl2, replis, callback) {
	var o = {
			pl1			: pl1,
			pl2			: pl2,
			scr1		: 0,
			scr2		: 0,
			gameCount	: 0,
			matchsUrl	: []
		};
	
	for(var r = 0; r < replis.length; r += 4) {
		o.scr1 += parseInt(replis[r]);
		o.scr2 += parseInt(replis[r + 1]);
		o.gameCount += parseInt(replis[r + 2]);
		o.matchsUrl.push(replis[r + 3]);
	};
	
	if (callback) callback.call(this, null, o, this);
	
};

//getPlayerStat
MatchModel.prototype.getPlayerStat = function (plName, callback) {
	var self = this;
	
	//Проверяем смотрели ли мы статистику ранее
	this.client.exists(this.pPlayerStat(plName), function (err, repl) {
		if (err) {
			if (callback) callback.call(self, err, null, repl);
		} else if (repl == 0) {
			//Ключ ранее не найден приедтся все перещитывать
			self._getPlayerStat.call(self, plName, callback);
		} else {
			//Ключ найден, загружаем результат 
			var q = [self.pPlayerStat(plName), self.kStatName(), self.kStatScore(), self.kStatGameCount(), self.kStatMatchCount()
					, self.kStatEnemyCount()];
			self.client.hmget(q, function (err, repl) {
				if (err) {
					if (callback) callback.call(self, err, null, self);
				} else if (repl.length != 0) {
					//return value
					var r = {
							name		: repl[0],
							scr			: repl[1],
							gameCount	: repl[2],
							matchCount	: repl[3],
							enemiesCount: repl[4]
						};
					if (callback) callback.call(self, null, r, self);
				} else {
					//что то случилось с ключем, надо бы пересчитать
					self._getPlayerStat.call(self, plName, callback);
				}
			});
		};
	});
};

MatchModel.prototype._getPlayerStat = function (plName, callback) {
	var self = this;
	
	this.client.sismember(this.pPlayers(), rzu.normalS(plName), function(err, repl) {
		if (err) {
			if (callback) callback.call(self, err, null, self);
		} else if (repl == 0) {
			if (callback) callback.call(self, null, null, self);
		} else {
			self._getPlayerStatResult.call(self, plName, callback);
		};
	});
};

MatchModel.prototype._getPlayerStatResult = function (plName, callback) {
	var self = this;
	//return value
	var r = {
		name		: plName,
		scr			:	0,
		gameCount	:	0,
		matchCount	:	0,
		enemiesCount:	0
	};
	
	var m = this.client.multi();
	m.scard(this.pPlayerMatchs(plName), function (err, repl) {
			r.matchCount = repl;
		});
	m.scard(this.pPlayerEnemies(plName), function (err, repl) {
			r.enemiesCount = repl;
		});
	m.sort(this.pPlayerMatchs(plName), 'get', this.pHash('*') + '->' + this.kScore(plName),
									   'get', this.pHash('*') + '->' + this.kGameCount(), function (err, repl) {
			if (repl.length != 0) {
				for (var i = 0; i < repl.length; i += 2) {
					r.scr += (isNaN(parseInt(repl[i])))? 0: parseInt(repl[i]);
					r.gameCount += (isNaN(parseInt(repl[i+1])))? 0: parseInt(repl[i+1]);
				};
			};
		});
	m.exec(function (err, repl) {
		if (err) {
			if (callback) callback.call(self, err, null, self);
		} else {
			//Результат получен, запоминаем результат в хешь, устанавливаем TTL и возвращаем результат
			var q = [
					self.pPlayerStat(plName), 
					self.kStatName(), r.name,
					self.kStatScore(), r.scr,
					self.kStatGameCount(), r.gameCount,
					self.kStatMatchCount(), r.matchCount,
					self.kStatEnemyCount(), r.enemiesCount
				];
			self.client.hmset(q, function (err, res) {
				self.client.expire(self.pPlayerStat(plName), self.KEYTTL, function (err, res) {
					if (callback) callback.call(self, null, r, self);
				});
			});
		};
	});
};
///// getPlayerStat