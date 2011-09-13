//test model
var 	redis = require('redis')
//	,	SiteModel = require('./site.js')
//	, 	PlayerModel = require('./player.js')
	,	rm = require('./RM.js')
	,	util = require('util')
	,	rzu = require('../lib/rz.util.js')
	;

/*	
var m = new rm({db: 1});
m.Site.getCount(function(err, res) {
	console.log(err + '  ' + res);
	this.client.quit();
});
*/
/*
var 	client = redis.createClient()
	, 	client2 = redis.createClient()
	, 	client3 = redis.createClient()
	, 	client4 = redis.createClient()
	;

client.select(2);
client2.select(2);
client3.select(2);
client4.select(2);
client.flushdb();

var models = new rm(client);
var models2 = new rm(client2);
var models3 = new rm(client3);
var models4 = new rm(client4);



var models = new rm({db: 2});
var models2 = new rm({db: 2});
var models3 = new rm({db: 2});
var models4 = new rm({db: 2});
models.client.flushdb();

var SiteModel = models.Site;
var SiteModel2 = models2.Site;
var SiteModel3 = models3.Site;
var SiteModel4 = models4.Site;

var 	site1 = SiteModel.create('www.google.ru')
	, 	site2 = SiteModel2.create('www.ya.ru')
//	,	site3 = SiteModel3.create('www.rambler.ru')
	;

setTimeout(function () {
	site1.save(function (err, res) {
		console.log('Site1 ' + this.href + ' save err: ' + err + '; isNew: ' + this.isNew + '; res: ' + res);
		this.client.quit();
	});

	site2.save(function (err, res) {
		console.log('Site2 ' + this.href + ' save err: ' + err + '; isNew: ' + this.isNew + '; res: ' + res);
		this.client.quit();
	});
}, 500);

setTimeout(function () {
	SiteModel3.findNew(['www.google.ru', 'www.ya.ru', 'www.rambler.ru'], function (err, res) {
		console.log('Find new sites err: ' + err + '; res: ' + util.inspect(res));
		this.client.quit();
	});

	SiteModel4.findByHref('www.google.ru', function (err, site) {
		if (site) console.log('Find site err: ' + err + '; href: ' + site.href);
		this.client.quit();
	});
}, 1000);
/*
var 	client5 = redis.createClient()
	, 	client6 = redis.createClient()
	, 	client7 = redis.createClient()
	, 	client8 = redis.createClient()
	, 	client9 = redis.createClient()
	;

client5.select(3);
client6.select(3);
client7.select(3);
client8.select(3);
client9.select(3);
client5.flushdb();

rm.setOption({db: 2});

var 	models5 = new rm()
	,	models6 = new rm()
	,	models7 = new rm()
	,	models8 = new rm()
	,	models9 = new rm()
	;

models9.client.flushdb();

var 	Player5 = models5.Player
	,	Player6 = models6.Player
	,	Player7 = models7.Player
	,	Player8 = models8.Player
	,	Player9 = models9.Player
	;

setTimeout(function () {
	var player5 = Player5.create('Dick');
	player5.save(function (err, res) {
		console.log('Save player ' + this.name + '; err: ' + err + '; res: ' + res);
		this.client.quit();
	});
	
	var player6 = Player6.create('Mick');
	player6.save(function (err, res) {
		console.log('Save player ' + this.name + '; err: ' + err + '; res: ' + res);
	});
	
	Player7.load('Trick' ,function (err, player) {
		console.log('Load player ' + player.name + '; err: ' + err);
	});
}, 1100);

setTimeout(function() {
	Player6.findById(1, function (err, player) {
		console.log('Find by id - err:' + err + '; player: ' + ((player)? player.name + ' ' + player.id: player));
		this.client.quit();
	});
	
	Player7.findByName('Trick', function (err, player) {
		console.log('Find by name - err:' + err + '; player: ' + ((player)? player.name + ' ' + player.id: player));
		player.remove(function (err, res) {
			console.log('Player remove: ' + this.name);
			this.client.quit();		
		});
	});
}, 1200);



var m1 =	{
			url: 'www.google.ru',
			pl1: 'dIck',
			sc1: 3,
			pl2: 'Mick',
			sc2: 1
		},
	m2 =	{
			url: 'www.ya.ru',
			pl1: 'DIck',
			sc1: 1,
			pl2: 'Sick',
			sc2: 2
		},
	m3 =	{
			url: 'www.rambler.ru',
			pl1: 'DIck',
			sc1: 2,
			pl2: 'Sick',
			sc2: 1
		};
	
Player8.load(m1.pl1, function(err, player) {
	player.addMatchScore(m1.url, m1.sc1, m1.sc1 + m1.sc2, onAdd.bind(player));
});	

Player9.load(m1.pl2, function(err, player) {
	player.addMatchScore(m1.url, m1.sc2, m1.sc1 + m1.sc2, onAdd.bind(player));

		//m2
	Player9.load(m2.pl1, function(err, player) {
		player.addMatchScore(m2.url, m2.sc1, m2.sc1 + m2.sc2, onAdd.bind(player));

		Player9.load(m2.pl2, function(err, player) {
			player.addMatchScore(m2.url, m2.sc2, m2.sc1 + m2.sc2, onAdd.bind(player));
				
			//m3
			Player9.load(m3.pl1, function(err, player) {
				player.addMatchScore(m3.url, m3.sc1, m3.sc1 + m3.sc2, onAdd.bind(player));
					
				Player9.load(m3.pl2, function(err, player) {
					player.addMatchScore(m3.url, m3.sc2, m3.sc1 + m3.sc2, onAdd.bind(player));
					//this.client.quit();
				});
			});
		});			
	});	
});


var onAdd = function (err, res) {
	console.log('Player: ' + this.name + '; add match err: ' + err + '; res: ' + res);
};

var onGet = function (err, res) {
	console.log('Player: ' + this.name + '; get match err: ' + err + '; res: ' + util.inspect(res));
};

setTimeout(function() {
	Player9.findByPattern('*', function (err, repl) {
		console.log('Player find by pattern: ' + util.inspect(repl));
		this.client.quit();
	});
	
	Player8.client.quit();
}, 1600);
*/
/*
var m2 = new rm({db:1});
m2.Player.getMatchInter('diwar.368', 'neovane.720', function (err, result) {
	console.log(err + ' -  ' + util.inspect(result));
	this.client.quit();
});

var m3 = new rm({db:1});
m3.Player.getCount(function(err, res) {
	console.log(err + ' - ' + res);
	this.client.quit();
});


//IndexModel

var model = new rm({db: 2});
var index = model.Index.create('Pl1Name', 'Pl1Name');
index.save(function(err, res, i) {
	console.log(err + ' ' + res);
	
	var index2 = model.Index.create('Pl2Name');
	index2.save(function(err, res, i) {
		console.log(err + ' ' + res);
	
		var index3 = model.Index.create('Pl3Name');
		index3.save(function(err, res, i) {
			console.log(err + ' ' + res);
			
			model.Index.incr('Pl1Name', function (err, res) {
				model.Index.findByIndex({index: 'name', sort: 'desc', by: 'count', get: ['value', 'count'], include: model.Match.pPlayerEnemies('Pl1Name')}, function (err, res, i) {
					console.log(err + ' ' + res);
					i.client.quit();
				});
			});
		});
	});
});
*/

//SearchModel
/*
var model = new rm({db: 2});
var search = model.Search.create('Pl1Name', 'Pl1Name');
search.save(function(err, res, i) {
	console.log(err + ' ' + res);
	
	var search2 = model.Search.create('Pl2Name');
	search2.save(function(err, res, i) {
		console.log(err + ' ' + res);
	
		var search3 = model.Search.create('Pl3Name');
		search3.save(function(err, res, i) {
			console.log(err + ' ' + res);
			
			model.Search.incr('Pl1Name', function (err, res) {
				search3.findByIndex({index: 'p', sort: 'desc', by: 'count', get: ['value', 'count']}, function (err, res, i) {
					console.log(err + ' ' + res);
					i.client.quit();
				});
			});
		});
	});
});
*/
/*
//MatchModel
var model = new rm({db: 2});
var match1 = {
	href:	'matchUrl1',
	pl1:	'Pl1Name',
	pl2:	'Pl2Name',
	scr1:	1,
	scr2:	2,
	gameCount:	3
};

var match2 = {
	href:	'matchUrl2',
	pl1:	'Pl3Name',
	pl2:	'Pl2Name',
	scr1:	1,
	scr2:	2,
	gameCount:	3
};

var match3 = {
	href:	'matchUrl3',
	pl1:	'Pl1Name',
	pl2:	'Pl3Name',
	scr1:	1,
	scr2:	0,
	gameCount:	1
};

var match4 = {
	href:	'matchUrl4',
	pl1:	'Pl3Name',
	pl2:	'Pl2Name',
	scr1:	0,
	scr2:	2,
	gameCount:	2
};

var match5 = {
	href:	'matchUrl5',
	pl1:	'Pl3Name',
	pl2:	'Pl1Name',
	scr1:	1,
	scr2:	0,
	gameCount:	1
};


var m1 = model.Match.create(match1);
m1.save(function(err, res) {console.log(err + ' ' + res);});
var m2 = model.Match.create(match2);
m2.save(function(err, res) {console.log(err + ' ' + res);});
var m3 = model.Match.create(match3);
m3.save(function(err, res) {console.log(err + ' ' + res);});
var m4 = model.Match.create(match4);
m4.save(function(err, res) {console.log(err + ' ' + res);});
var m5 = model.Match.create(match5);
m5.save(function(err, res) {console.log(err + ' ' + res);});

setTimeout(function () {
	model.Match.getResult('Pl2Name', 'Pl3Name', function (err, res) {
			console.log('Get Result: ' + err + ' ' + util.inspect(res));
			model.client.quit();
	});
}, 500);
*/

var m = new rm({db: 1});
m.Match.getPlayerStat('mTwDIMAGA.539', function (err, res) {
	console.log(err + '\n' + util.inspect(res));
	this.client.quit();
});