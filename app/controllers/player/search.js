module.exports = function(req, res, next) {
	res.contentType('application/json');
	var q = req.query.include;
	var w = req.query.with;
	var patt = q.replace(/[\?\*]/g, '');
	
	var m = new RM();
	
	var o = {index: patt, sort: 'desc', by: 'count', get: ['value', 'count']};
	if (w && w !== '') o.include = m.Match.pPlayerEnemies(w);
	
	m.Search.findByIndex(o, function (error, players) {
		this.client.quit();
		
		if (error) {
			next(error);
		} else {
			res.end(JSON.stringify(players));
		};
	});
};