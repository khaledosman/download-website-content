var phantom = require('node-phantom');
var fs = require('fs');
var request = require('request');
var json2xls = require('json2xls');
var _ = require('lodash');
var dir = './downloads/';
var excelbuilder = require('msexcel-builder');

var urls = generateUrls();
var technologies = [];

function download(uri, filename, callback) {
    request.head(uri, function(err, res, body) {
        console.log('downloading', 'content-type:', res.headers['content-type']);
        // console.log('content-length:', res.headers['content-length']);
        var r = request(uri).pipe(fs.createWriteStream(dir + filename));
        r.on('close', callback);
    });
}

function generateUrls() {
    var urls = [];
    var baseUrl = 'http://www.visualization.deftech.ch/?client=deftech&industry=0&distance=0&order=0&card=tech';
    // card=tech10001 ~ 10203
    for (var i = 10001; i <= 10203; i++) {
        urls.push(baseUrl + i);
    }
    return urls;
}

// urls = [urls[0], urls[1], urls[2], urls[3]];

function next_page() {
    var url = urls.shift();
    if (!url) {
        // phantom.exit(0);
        console.log('DONE!');
    }
    setTimeout(function() {
        handle_page(url);
        if (url) {
            setTimeout(next_page, 100);
        }
    }, 1000);
}

next_page();

// urls.forEach(function(url) {
//     handle_page(url);
// });

function handle_page(url) {
    if (!url) {
        return;
    }
    phantom.create(function(err, ph) {
        return ph.createPage(function(err, page) {
            return page.open(url, function(err, status) {
                console.log("opened site? ", status);
                setTimeout(function() {
                    return page.evaluate(function() {
                        //Get what you want from the page using jQuery. A good way is to populate an object with all the jQuery commands that you need and then return the object. 
                        var image = [],
                            title = [],
                            segment = [],
                            description = [],
                            type = [],
                            relatedTechnologies = [];

                        $('div#card_name').each(function() {
                            var link = $(this);
                            var text = link.text().trim();
                            title.push(text);
                            // console.log('found heading ->', text);
                        });

                        $('div#card_pos').each(function() {
                            var link = $(this);
                            var text = link.text().trim();
                            type.push(text);
                            // console.log('found heading ->', text);
                        });

                        $('div#card_description p').each(function() {
                            var link = $(this);
                            var text = link.text().trim();
                            description.push(text);
                            // console.log('found heading ->', text);
                        });

                        $('div.nav_itm.pointer').each(function() {
                            var link = $(this);
                            var text = link.text().trim();
                            segment.push(text);
                            // console.log('found heading ->', text);
                        });

                        $('#card_related').children('.itm').each(function() {
                            var link = $(this);
                            var text = link.text().trim();
                            relatedTechnologies.push(text);
                            // console.log('found heading ->', text);
                        });

                        $('div#card_img.tech_img').each(function() {
                            var link = $(this);
                            var style = link.css('backgroundImage');
                            if (style !== 'none') {
                                image.push(style.substring(4, style.length - 1));
                                // console.log('found backgroundImage', style.substring(4, style.length - 1));
                            }
                        });

                        return {
                            image: image,
                            title: title,
                            segment: segment,
                            description: description,
                            type: type,
                            relatedTechnologies: relatedTechnologies
                        };
                    }, function(err, result) {
                        //create downlaods directory if it doesnt exist
                        console.log(url, result);
                        if (!fs.existsSync(dir)) {
                            fs.mkdirSync(dir);
                        }
                        //download images and save them in downloads folder
                        result.image.forEach(function(imageUrl) {
                            // console.log('imageUrl', imageUrl);
                            // var splits = imageUrl.split('/');
                            // var imageName = splits[splits.length - 1];
                            var imageName = result.title[0];
                            var splits = imageUrl.split('.');
                            var fileExtension = splits[splits.length - 1];
                            var commonFileExtensions = ["png", "jpg", "jpeg", "gif"];
                            var fileName = imageName + '.' + fileExtension;
                            download(imageUrl, imageName, function() {
                                console.log('downloaded', fileName);
                            });
                            // if (commonFileExtensions.indexOf(fileExtension > -1) && fileExtension.length > 0) {
                            //     download(imageUrl, fileName, function() {
                            //         console.log('downloaded', fileName);
                            //     });
                            // } else {
                            //     console.warn('no file extension', imageUrl);
                            //     download(imageUrl, imageName, function() {
                            //         console.log('downloaded', fileName);
                            //     });
                            // }
                        });
                        technologies.push(result);
                        setTimeout(function() {
                            if (urls.length === 0) {
                                console.log('writing excel sheet...');

                                // var stream = fs.createWriteStream("my_file.txt");
                                // stream.once('open', function(fd) {
                                //     technologies.forEach(function(technology) {
                                //         var row = technology.title + "\t" + technology.type + "\t" + technology.segment + "\t" + technology.image[0] + "\t" + technology.description[0] + "\t" + technology.relatedTechnologies + "\n";
                                //         stream.write(row);
                                //     });
                                //     stream.end();
                                // });

                                var writeStream = fs.createWriteStream("file.xls");
                                var header = "Title" + "\t" + " Type" + "\t" + "Segments" + "\t" + "Image" + "\t" + "Description" + "\t" + "RelatedTechnologies" + "\n";

                                writeStream.write(header);
                                technologies.sort(function(tech1, tech2) {
                                    return tech1.title[0] > tech2.title[0];
                                });

                                technologies.forEach(function(technology) {
                                    var row = ToString(technology.title) + "\t" + ToString(technology.type) + "\t" + ToString(technology.segment) + "\t" + ToString(technology.image) + "\t" + ToString(technology.description) + "\t" + RelatedToString(technology.relatedTechnologies) + "\n";
                                    writeStream.write(row);
                                });
                                writeStream.end();

                            }
                        }, 3000);
                    });
                }, 3000);
            });
        });
    });
}

function ToString(arr) {
    var s = "";
    if (arr.length === 0) {
        return "EMPTY";
    }
    arr.forEach(function(item, index, array) {
        if (index < array.length - 1) {
            s += item + ' | ';
        } else {
            s += item;
        }
    });
    return s;
}

function RelatedToString(arr) {
    var s = "";
    if (arr.length === 0) {
        return "EMPTY";
    }
    arr.forEach(function(item, index, array) {
        if (index < array.length - 1) {
            s += item + '\t';
        } else {
            s += item;
        }
    });
    return s;
}