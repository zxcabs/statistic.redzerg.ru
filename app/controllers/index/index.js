module.exports = function (req, res, next) {
	var q = req.query;
	
	if (q.pl1 && q.pl2) { 
		var m = new RM();
		
		m.Match.getResult(q.pl1, q.pl2, function (error, result) {
			if (error) {
				next(error);
			} else {
				send(req, res, result);			
			};
			
			m.Search.incr(q.pl1, function () {
				m.Search.incr(q.pl2, function () {
					this.client.quit();
				});
			});
		});
	} else {
		send(req, res, null);
	};
};

function send(req, res, data) {
	var q = req.query;
	
	if (!data && q.pl1 && q.pl2) {
		var data = {error: 'no data'};
	} else if (data) {
		// Вычисляем % побед
		data.per1 = (Math.floor((data.scr1 / data.gameCount) * 10000) / 100); 
		data.per2 = (Math.floor((data.scr2 / data.gameCount) * 10000) / 100);
		
		data.per1 = (isNaN(data.per1)? '0%': data.per1 + '%' );
		data.per2 = (isNaN(data.per2)? '0%': data.per2 + '%' );
	};
	
	
	if (req.xhr) {
		// ajax
		res.contentType('json');
		res.end(JSON.stringify(data));
	} else {
		res.render('index', {
				data: data,
				src: [	'jquery-ui.custom.min.js', 
						//'jquery.form.js', 
						'index_index.js']
			});
	};
};