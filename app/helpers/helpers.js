var 	csrf = require('express-csrf') // Cross-site request forgery protection
	;
module.exports.set = function (app) {
	//dynamicHelpers
	app.dynamicHelpers({
		csrf: csrf.token,
		pageTitle: function (req, res) {return 'www.redzerg.ru - ' + req.url.replace(/\//g, ' ')}
	});

	//helpers
	app.helpers({
			title: 	undefined
		,	src:	undefined //Массив скриптов
		,	stl:	undefined  //Массив стилей
		,	renderScript: function (src) {
				var res = '';
				if (src) for (var s in src) {
					res += "<script src='/javascripts/" + src[s] + "' type='text/javascript'></script>";
				};
				return res;
			}
	});
};