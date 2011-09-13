// Объект представляющий собой результат матча
// В качестве параметра конструктора получает результат MatchParser и передается в его emit('done);
var Match = module.exports = function (m) {
	this._turnamentEvent = m.turnamentEvent;
	this._href = m.href;
	this._pl1 = this.normalName(m.pl1);
	this._pl2 = this.normalName(m.pl2);
	this._scr1 = m.scr1;
	this._scr2 = m.scr2;
	
	this._isFreeWin = false;
	
	if (this.pl1.match(this.freeWinName) || this.pl2.match(this.freeWinName)) {
		this._isFreeWin = true;		
	};
};

Match.prototype.__defineGetter__('isFreeWin', function () {
	return this._isFreeWin;
});

Match.prototype.__defineGetter__('href', function () {
	return this._href;
});

Match.prototype.__defineGetter__('turnamentEvent', function () {
	return this._turnamentEvent;
});

Match.prototype.__defineGetter__('pl1', function () {
	return this._pl1;
});

Match.prototype.__defineGetter__('pl2', function () {
	return this._pl2;
});

Match.prototype.__defineGetter__('scr1', function () {
	if (this.isFreeWin) {
		return 0;
	} else {
		return parseInt(this._scr1);
	};
});

Match.prototype.__defineGetter__('scr2', function () {
	if (this.isFreeWin) {
		return 0;
	} else {
		return parseInt(this._scr2);
	};
});

Match.prototype.__defineGetter__('gameCount', function () {
	return this.scr1 + this.scr2;
});

//Убераем пробелы, и последний символ # заменяем на .
Match.prototype.normalName = function (name) {
	return name.replace(/\s/gi, '').replace(/#(\d+)$/, '.$1');
};

Match.prototype.freeWinName = /^freewin/i;

