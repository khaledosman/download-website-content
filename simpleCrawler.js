var Crawler = require("simplecrawler");
cheerio = require('cheerio');

// var myCrawler = new Crawler(" http://www.moreinspiration.com/");
// myCrawler.on("fetchcomplete", function(queueItem, responseBuffer, response) {
// 	// console.log("I just received %s (%d bytes)", queueItem.url, responseBuffer.length);
// 	// console.log("It was a resource of type %s", response.headers['content-type']);
// 	console.log('queueItem', queueItem.url);
// 	// $ = cheerio.load(queueItem.url);
// 	// console.log('result', result.uri);
// });
// myCrawler.start();
// 
Crawler.crawl("http://www.visualization.deftech.ch/?client=deftech&industry=0&distance=0&order=0")
	.on("fetchcomplete", function(queueItem) {
		console.log("Completed fetching resource:", queueItem.url);
	});