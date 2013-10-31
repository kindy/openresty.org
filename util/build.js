#!/usr/bin/env node

var marked = require('marked'),
    fs = require('fs');

[['page', 'build'], ['cn/page', 'cn/build']].forEach(function(item) {
    var src = item[0],
        dst = item[1];

    fs.readdirSync(src).forEach(function(file) {
        var text = '' + fs.readFileSync(src + '/' + file);
        var html = marked(text);
        console.log('writing ', file);
        fs.writeFileSync(dst + '/' + file + '.html', html);
    });
});

/*
fs.writeFileSync('pages.js',
    'angular.module("pages", []).value("PAGES", ' + JSON.stringify(meta) + ');'
);
*/

console.log('all done!');

