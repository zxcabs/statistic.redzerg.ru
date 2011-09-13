//Библиотека вспомогателььных функий
var 	crypto = require('crypto');

//Сравниваем две строки, результат 0 если равны, 1 если str1 > str2, -1 если str1 < str2
exports.compareS = function (str1, str2) {
	if (str1 === str2) return 0;
	
	str1 = normalS(str1);
	str2 = normalS(str2);
	
	for(var i = 0; i < str1.length; i++) {
		if (isNaN(str2.charCodeAt(i))) {
			return 1;
		} else {
			if (str1.charCodeAt(i) > str2.charCodeAt(i)) return 1;
			if (str1.charCodeAt(i) < str2.charCodeAt(i)) return -1;
		};
	};
	
	return -1;
};

// Возвращает md5 hash от key
exports.md5 = function (key) {
	return crypto.createHash('md5').update(key).digest('hex');
};

// Возвращает вес слова.
exports.wordWeigth = function (word) {
	var w = 0;
	var k = 1000000000000000;
	word = normalS(word);
	
	for (var c = 0; c < word.length; c++) {
		w += word.charCodeAt(c) * k;
		k /= 10;
	};
	
	return w;
};

// Нормализует строку
var normalS = exports.normalS = function (str) {
	return str.toLowerCase();
};