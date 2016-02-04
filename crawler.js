var Crawler = require("crawler");
var url = require('url');

var c = new Crawler({
    maxConnections: 10,
    // This will be called for each crawled page
    callback: function(error, result, $) {
        // $ is Cheerio by default
        //a lean implementation of core jQuery designed specifically for the server
        // $('a').each(function(index, a) {
        //     var toQueueUrl = $(a).attr('href');
        //     c.queue(toQueueUrl);
        // });
        console.log('result', result.uri);

        //images
        $("img").each(function() {
            var link = $(this);
            var href = link.attr("href");
            var src = link.attr('src');
            console.log('Image ->', src);
        });

        //text
        $("p, h1, h2, h3, h4, h5, h6, h7, tr, td, li, b, em, i, label, ol, option, text").each(function() {
            var link = $(this);
            var text = link.text().trim();

            console.log('Text ->', text);
        });

        $('text').each(function() {
            var link = $(this);
            var text = link.text().trim();
            // textTags.push(text);
            console.log('found text ->', text);
        });

        //links
        $('a').each(function() {
            var link = $(this);
            var text = link.text().trim();
            var href = link.attr("href");
            console.log(text + " -> " + href);
        });
    }
});

// Queue just one URL, with default callback
// c.queue('http://www.visualization.deftech.ch/?client=deftech&industry=0&distance=0&order=0&card=tech10052');

// Queue a list of URLs with default callback
c.queue(['http://www.visualization.deftech.ch/?client=deftech&industry=0&distance=0&order=0'
    // ,' http://www.moreinspiration.com/'
]);

// // Queue URLs with custom callbacks & parameters
// c.queue([{
//     uri: 'http://www.visualization.deftech.ch/?client=deftech&industry=0&distance=0&order=0&card=tech10052',
//     jQuery: true,

//     // The global callback won't be called
//     callback: function(error, result) {
//         console.log('Grabbed', result.body.length, 'bytes');
//     }
// }]);

// // Queue using a function
// var googleSearch = function(search) {
//     return 'http://www.google.fr/search?q=' + search;
// };
// c.queue({
//     uri: googleSearch('cheese')
// });

// // Queue some HTML code directly without grabbing (mostly for tests)
// c.queue([{
//     html: '<p>This is a <strong>test</strong></p>'
// }]);