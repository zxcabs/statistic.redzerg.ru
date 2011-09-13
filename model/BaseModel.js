// BaseModel класс, родитель для всех моделей.
var		util = require('util')
	,	rzu = require('../lib/rz.util')
	;

var BaseModel = module.exports = function (client) {
	this._isNew = true;
	this._callback = null;
	this._client = client;
	this._isCreate = false;
};

BaseModel.prototype.KEYTTL = 600;

BaseModel.prototype.__defineGetter__('isNew', function () {
	return this._isNew;
});

BaseModel.prototype.__defineGetter__('client', function () {
	return this._client;
});

BaseModel.prototype.__defineGetter__('isCreate', function () {
	return this._isCreate;
});

BaseModel.prototype.getHash = function (arg) {
	return rzu.md5(arg.toString());
};

// Завершающая функций, проверяет и запускает callback
BaseModel.prototype._end = function (err, res) {
	if (this._callback) {
		var cb = this._callback;
		this._callback = null;
		cb.call(this, err, res);
		cb = null;
	};
};

BaseModel.prototype.create = function () {
	return new Error('method create() is not implemented');
};

BaseModel.prototype.save = function (callback) {
	this._callback = callback;
	this._end(new Error('method save() is not implemented'));
};

BaseModel.prototype.update = function (callback) {
	this._callback = callback;
	this._end(new Error('method update() is not implemented'));
};

BaseModel.prototype.remove = function (callback) {
	this._callback = callback;
	this._end(new Error('method remove() is not implemented'));
};