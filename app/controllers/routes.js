module.exports.set = function (app) {
	//index controller
	app.get(/^\/?$/, require('./index/index'));
	app.get(/^\/about\/?$/, require('./index/about'));
	app.get(/^\/statistic\/?$/, require('./index/statistic'));
	
	//player controller
	app.get(/^\/player\/?$/, require('./player/index'));
	app.get(/^\/player\/index\/?$/, require('./player/index'));
	app.get(/^\/player\/search\/?$/, require('./player/search'));
//	app.get(/^\/player\/info\/?/, require('./player/info'));
	
	//error
	app.use(require('./error/index'));
};