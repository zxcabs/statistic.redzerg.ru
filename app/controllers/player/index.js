module.exports = function (req, res, next) {
	var q = req.query;
	
	if (q.pl) {
		var m = new RM();
		m.Match.getPlayerStat(q.pl, function (error, plStat) {
			m.client.quit();
			if (error) {
				next(error);
			} else if (plStat) {
				console.log(plStat);
				plStat.winper = (Math.floor((plStat.scr / plStat.gameCount) * 10000) / 100) + '%'; 
				plStat.lose = plStat.gameCount - plStat.scr;
				plStat.loseper = (Math.floor((plStat.lose / plStat.gameCount) * 10000) / 100) + '%'; 
			};
			
			res.render('player/index', {pl: plStat, src:['jquery-ui.custom.min.js', 'jquery.form.js', 'player_index.js']});
		});
	} else {
		res.render('player/index', {pl: null, src:['jquery-ui.custom.min.js', 'jquery.form.js', 'player_index.js']});
	}
};