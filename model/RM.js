var		redis = require('redis');

//Собираем все модели и подключаем
var models = {
			Site 	: 	require('./SiteModel'),
			Search	: 	require('./SearchModel'),
			Match	:	require('./MatchModel')
		};

// opt - опции для клиента, применяются для создания нового клиента
// (arg1 [, arg2])
var RM = module.exports = function (arg1, arg2) {
	var client = null, opt = null;
	if (arg1 && arg1 instanceof redis.RedisClient) {
		client = arg1;
		opt = arg2;
	} else {
		opt = arg1;
	};

	this._client = client;
	this._opt 		= opt || RM.opt;
	this._opt.host 	= this._opt.host || RM.opt.host;
	this._opt.port	= this._opt.port || RM.opt.port;
	this._opt.db	= this._opt.db   || RM.opt.db;
	this._opt.ropt	= this._opt.ropt ||	RM.opt.ropt; //redis options
	
	if (!this._client) {
		this._client = this._createClient();
	
		if (this._opt.db) {
			var self = this;
			
			self.client.select(self._opt.db);
		};
	};
	
	this._init();
	
	client = null;
	opt = null;
	delete(client);
	delete(opt);
};

RM.prototype.__defineGetter__('client', function () {
	return this._client;
});

//Создает новое соединение с редисом
RM.prototype._createClient = function () {
	return redis.createClient(this._opt.port, this._opt.host, this._opt.ropt);
};

RM.prototype._init = function () {
	for(var m in models) {
		this[m] = new models[m](this.client);
	};	
};

//Опции по умолчанию.
RM.opt = {
		host	:	'127.0.0.1'
	,	port	:	6379
	,	db		:	1
	,	ropt	:	{} //redis options
};

RM.setOption = function (opt) {
	RM.opt.host = opt.host || RM.opt.host;
	RM.opt.port = opt.port || RM.opt.port;
	RM.opt.db	= opt.db   || RM.opt.db;
	RM.opt.ropt = opt.ropt || RM.opt.ropt;
};