//Регестрирует задания, и выбрасывает евент по завершению.
var 	util = require('util')
	,	EventEmitter =	require('events').EventEmitter
	,	rzu = require('./rz.util.js')
	;
	
var TasksManager = module.exports = function (name) {
	TasksManager.super_.apply(this, arguments);
	this._name = name;
	
	this._tasks = {};
	this._obj = {};
	this._callback = {};
	this._args = {};
	this._counts = {};
	
	this._taskCount = 0;
};

util.inherits(TasksManager, EventEmitter);

TasksManager.key = function (name) {
	return rzu.md5(name);
};

// create (name, [obj,] callback [, args]);
TasksManager.prototype.create = function (name) {
	var key = TasksManager.key(name);
	if (!this._tasks[key]) {
		this._tasks[key] = name;
		this._counts[key] = 0;
		this._taskCount++;
		
		switch (arguments.length) {
			case 2: 
				this._callback[key] = arguments[1];
				break;
			case 3:
				this._obj[key] = arguments[1];
				this._callback[key] = this._obj[key][arguments[2]];
				break;
			case 4:
				this._obj[key] = arguments[1];
				this._callback[key] = arguments[2];
				this._args[key] = arguments[3];
				break;
		};
	} else {
		util.log('Task already exists task: ' + name);
	}
};

TasksManager.prototype.start = function (name) {
	var key = TasksManager.key(name);
	if (this._tasks[key]) {
		this._counts[key]++;
	} else {
		util.log('Task no exists task: ' + name);
	};
};

TasksManager.prototype.end = function (name) {
	var key = TasksManager.key(name);
	if (this._tasks[key]) {
		this._counts[key]--;
		if (this._counts[key] == 0) this._launch(key);
	} else {
		util.log('Task no exists task: ' + name);
	};
};

TasksManager.prototype._launch = function (key) {
	if (this._obj[key]) {
		this._callback[key].apply(this._obj[key], this._args[key]);
	} else if (this._callback[key]) { 
		this._callback[key](this._tasks[key]);
	};
	
	this._tasks[key] = null;
	this._counts[key] = null;
	this._callback[key] = null;
	this._obj[key] = null;
	this._args[key] = null;
	
	delete(this._tasks[key]);
	delete(this._counts[key]);
	delete(this._callback[key]);
	delete(this._obj[key]);
	delete(this._args[key]);
	
	this._taskCount--;
	if (this._taskCount == 0) this.emit('end', this._name);
};