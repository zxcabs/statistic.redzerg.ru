module.exports = function (req, res, next) {
	var m = new RM();
	m.Site.getCount(function(error, siteCount) {
		if (error) {
			next(error);
		} else {
			m.client.scard(m.Match.pPlayers(), function (err, playerCount) {
				m.client.quit();
				if (err) {
					next(err);
				} else {
					res.render('index/statistic', {siteCount: siteCount, playerCount: playerCount});
				};
			});
		};
	});
};