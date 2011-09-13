var 	util = require('util');

//test.lib.js

var 	rzu = require('./rz.util.js');

/*
console.log('a a:' + rzu.compareS('a', 'a'));
console.log('a b:' + rzu.compareS('a', 'b'));
console.log('b a:' + rzu.compareS('b', 'a'));
console.log('aa a:' + rzu.compareS('aa', 'a'));
console.log('a aa:' + rzu.compareS('a', 'aa'));
console.log('aaa a:' + rzu.compareS('aaa', 'a'));
console.log('a aaa:' + rzu.compareS('a', 'aaa'));
console.log('a ab:' + rzu.compareS('a', 'ab'));
console.log('ab a:' + rzu.compareS('ab', 'a'));
console.log('aa ab:' + rzu.compareS('aa', 'ab'));
console.log('ab aa:' + rzu.compareS('ab', 'aa'));
*/

var words = [ 'yognaut.123'
    ,'Bee.123'
    ,'sUnray.123'
    ,'Simka.123'
    ,'pesco.123'
    ,'Benzor.123'
    ,'xFlord.123'
    ,'TheNewGuy.123'
    ,'alkemist.123'
    ,'Ace.123'
    ,'Rasilu.123'
    ,'gTnCman.123'
    ,'bmJulietLove.123'
    ,'manucrusher.123'
    ,'spartan.123'
    ,'petikex.123'
    ,'LordProtoss.123'
    ,'Haggis.123'
    ,'Yorik.123'];
var arr = [];
var o = {};

console.log('words: ' + util.inspect(words));
console.log('compareS: ' + util.inspect(words.sort(rzu.compareS)));

for(var w in words) {
	var we = rzu.wordWeigth(words[w]);
	console.log(words[w] + ' - ' + we);
	arr.push(we);
	o['a' + we] = words[w];
};

arr.sort(function(a,b){return a - b});

for(var a in arr) {
	console.log(o['a' + arr[a]]);
};

//TasksManager
/*
var TasksManager = require('./TasksManager.js');
var tm = new TasksManager('test1');
tm.on('end', function (name) {
	util.log('All end tm: ' + name);
});

for(var i = 0; i < 20; i++) {
	tm.create('task:' + i, function (name) {
		util.log('Name end: ' + name);
	});
	
	tm.start('task:' + i);
	if (i % 2 == 0) {
		tm.start('task:' + i);
		setTimeout(function (name) {
			tm.end(name);
		}, parseInt(Math.random() * 2000), 'task:' + i);
	};
	
	setTimeout(function (name) {
		tm.end(name);
	}, parseInt(Math.random() * 4000), 'task:' + i);
};

var tm2 = new TasksManager('test2');
tm2.on('end', function (name) {
	util.log('All end tm: ' + name);
});

for(var i = 0; i < 20; i++) {
	var foo = {
		name: 'foo' + i,
		bar: function () {
			util.log('Bar: ' + this.name);
		}
	};
	
	tm2.create('task: foo' + i, foo, 'bar');
	tm2.start('task: foo' + i);
	
	setTimeout(function (name) {
		tm2.end(name);
	}, parseInt(Math.random() * 4000), 'task: foo' + i);
};
*/