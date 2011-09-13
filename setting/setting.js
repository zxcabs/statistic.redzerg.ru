module.exports = {
	db: {
		host: '127.0.0.1',
		port: 6379,
		db: 1
	},
	
	parsers: {
			//Настройки для BitsPerBeat.com
			bpb : {
				//Интервал между запросами, мы же не хотим повесить сервис запросами
				requestInterval	: 2500,
				//Какие кубки анализировать
				cups	:	{
							craftcup: 'http://www.bitsperbeat.com/sc2/'
						,	sc2vision: 'http://www.bitsperbeat.com/sc2vision/'
				}
			},
			//Настройки для esl.eu
			esl	: {
				//Интервал между запросами, мы же не хотим повесить сервис запросами
				requestInterval	: 2500,
				//Маскируемся под юзера
				headers	: {
					'Host'			: 'www.esl.eu',
					'User-Agent'	: 'Mozilla/5.0 (Windows NT 5.2; WOW64; rv:2.0) Gecko/20100101 Firefox/4.0',
					'Accept'		: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
					'Accept-Language': 'ru,en;q=0.5',
					'Accept-Encoding': 'deflate',
					'Accept-Charset': 'utf-8;q=0.7,*;q=0.7',
					'Keep-Alive': 115,
					'DNT': 1,
					'Referer': 'http://www.esl.eu/eu/sc2',
					'Cookie': 'ESL_SESSION=sessionmarker; ESL_USER_VISIT=6ca78e45bd689288804a54ae21c21c64; COOKIE=a%3A2%3A%7Bs%3A2%3A%22id%22%3Bs%3A7%3A%225757764%22%3Bs%3A2%3A%22pw%22%3Bs%3A32%3A%22a7810412f24a951228df21936edd598b%22%3B%7D'
				},
				cups	: {
						go4sc2: 'http://www.esl.eu/eu/sc2/go4sc2/standings/',
						sennheisercup: 'http://www.esl.eu/eu/sc2/sennheiser_cup/'
				}
			}
	},
	
	app:	{
		sessionDB: 9, //session.store connect-redis,
		staticCache: 2592000000, //chache for statick file 30 days
		port:	4000,
		inter:	'127.0.0.1'
	}
}