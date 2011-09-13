/**
 * Module dependencies.
 */
var 	express = require('express')
	,	csrf = require('express-csrf') // Cross-site request forgery protection
	,	stylus = require('stylus')
	,	RedisStore = require('connect-redis')
	,	setting = require('../setting/setting')
	,	util = require('util')
	;

var app = module.exports = express.createServer();

//helpers
require('./helpers/helpers').set(app);

// completely optional, however
// the compile function allows you to
// define additional functions exposed to Stylus,
// alter settings, etc
function compile(str, path) {
	return stylus(str).set('filename', path).set('compress', true);
};


// Configuration
app.configure(function(){
	app.use(express.responseTime());
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.session({ secret: 'AD*k^jn]}#fd!mk@lz_=+', store: new RedisStore({port: setting.db.port, host: setting.db.host, db: setting.app.sessionBD})}));
	app.use(csrf.check());
	app.use(stylus.middleware({src: __dirname + '/views', dest: __dirname + '/public', compile: compile}));
	app.use(express.limit('256kb'));
	app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
});

app.configure('development', function(){
	require("v8-profiler");
	app.use(express.profiler());
	app.use(app.router);
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
	app.use(express.static(__dirname + '/public'));
	
	//
	app.set('inter', '192.168.56.102');
	app.set('port', setting.app.port);
});

app.configure('production', function(){
	app.use(app.router);
	app.use(express.errorHandler());
	app.use(express.static(__dirname + '/public', {maxAge: setting.app.staticCache}));
	
	//
	app.set('inter', setting.app.inter);
	app.set('port', setting.app.port);
});

// Routes
require('./controllers/routes').set(app);

// include RedisModels
app.RM = RM = require('../model/RM');

//launch
if (!module.parent) {
	app.listen(app.set('port'), app.set('inter'));
	util.log('Express server listening on ' + app.address().address + ':' + app.address().port);
};

//caught exception
process.on('uncaughtException',function(err){
	util.log(err);
});