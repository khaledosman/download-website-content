var phantom = require('node-phantom');
var fs = require('fs');
var request = require('request');

var dir = './downloads/';

var download = function(uri, filename, callback) {

    request.head(uri, function(err, res, body) {

        console.log('downloading', 'content-type:', res.headers['content-type']);
        // console.log('content-length:', res.headers['content-length']);

        var r = request(uri).pipe(fs.createWriteStream(dir + filename));
        r.on('close', callback);
    });
};

phantom.create(function(err, ph) {
    return ph.createPage(function(err, page) {
        return page.open("http://www.visualization.deftech.ch/?client=deftech&industry=0&distance=0&order=0", function(err, status) {
            console.log("opened site? ", status);
            // page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function(err) {
            //jQuery Loaded. 
            //Wait for a bit for AJAX content to load on the page. Here, we are waiting 5 seconds. 
            setTimeout(function() {
                return page.evaluate(function() {
                    //Get what you want from the page using jQuery. A good way is to populate an object with all the jQuery commands that you need and then return the object. 
                    var headings = [],
                        pTags = [],
                        textTags = [],
                        imageTags = [],
                        hyperLinks = [],
                        backgroundImages = [];

                    $('h1, h2, h3, h4, h5, h6, tr, td, li, b, em, i, label, ol, option').each(function() {
                        var link = $(this);
                        var text = link.text().trim();
                        headings.push(text);
                        // console.log('found heading ->', text);
                    });

                    $('p').each(function() {
                        var link = $(this);
                        var text = link.text().trim();
                        pTags.push(text);
                        // console.log('found p ->', p);
                    });

                    $('text').each(function() {
                        var link = $(this);
                        var text = link.text().trim();
                        textTags.push(text);
                        // console.log('found text ->', text);
                    });

                    $("img").each(function() {
                        var link = $(this);
                        var src = link.attr('src');
                        imageTags.push(src);
                        // console.log('found Image ->', src);
                    });

                    $('a').each(function() {
                        var link = $(this);
                        var text = link.text().trim();
                        var href = link.attr("href");
                        hyperLinks.push(href);
                        // console.log('hyperlink:', text + " -> " + href);
                    });

                    $('*').each(function() {
                        var link = $(this);
                        var style = link.css('backgroundImage');
                        if (style !== 'none') {
                            backgroundImages.push(style.substring(4, style.length - 1));
                            // console.log('found backgroundImage', style.substring(4, style.length - 1));
                        }
                    });


                    return {
                        headings: headings,
                        p: pTags,
                        text: textTags,
                        images: imageTags,
                        hyperLinks: hyperLinks,
                        backgroundImages: backgroundImages
                    };
                }, function(err, result) {
                    //create downlaods directory if it doesnt exist
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir);
                    }
                    console.log(result);
                    //download images and save them in downloads folder
                    result.backgroundImages.forEach(function(imageUrl) {
                        // console.log('imageUrl', imageUrl);
                        var splits = imageUrl.split('/');
                        var imageName = splits[splits.length - 1];

                        download(imageUrl, imageName, function() {
                            console.log('downloaded', imageName);
                        });
                    });

                });
            }, 1000);
            // });
        });
    });
});