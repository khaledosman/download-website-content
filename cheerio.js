var request = require('request'),
	cheerio = require('cheerio');

var url = 'http://www.visualization.deftech.ch/?client=deftech&industry=0&distance=0&order=0&card=tech10052';

request(url, function(err, resp, body) {
	$ = cheerio.load(body);
	// links = $('.sb_tlst h3 a'); //use your CSS selector here
	// $(links).each(function(i, link) {
	// 	console.log('dafaq', $(link).text() + ':\n  ' + $(link).attr('href'));
	// });
	$("img").each(function() {
		var link = $(this);
		var href = link.attr("href");
		var src = link.attr('src');

		console.log('Image ->', src);
	});

	$("p, h1, h2, h3, h4, h5, h6, h7, text").each(function() {
		var link = $(this);
		var text = link.text();

		console.log('Text ->', text);
	});

	$('a').each(function() {
		var link = $(this);
		var text = link.text().trim();
		var href = link.attr("href");
		console.log(text + " -> " + href);
	});
});