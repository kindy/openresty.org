var fs = require('fs');

var page = require('webpage').create();
var url = 'cn/index.html';

function _proc(m0, m1, m2, m3) {
    if (m1 != m3) {
        if (m1 == '{{{' && m3 == '}}}') {
            return '`' + m2 + '`';
        }
        if (m1 == '[[' && m3 == ']]') {
            var parts = m2.split('|');
            if (parts.length == 1) {
                return '[' + m2 + '](' + m2 + ')';
            }
            return '[' + parts[0] + '](' + parts[1] + ')';
        }
        return m0;
    }
    switch (m1) {
    case "''":
        return '**' + m2 + '**';
    case '__':
        return '__' + m2 + '__';
    case '^^':
        return '<sup>' + m2 + '</sup>';
    case '~~':
        return '<sub>' + m2 + '</sub>';
    case '--':
        return '<strike>' + m2 + '</strike>';
    default:
        break;
    }

    return m0;
}
function tw2mdInline(txt) {
    return txt.replace(/(''|__|\^\^|~~|--|\[\[|\{\{\{)(.+?)(\1|\]\]|\}\}\})/ig,
            function(m0, m1, m2, m3) {
        return _proc(m0, m1, m2, m3);
    });
}

function tw2md(txt) {
    var hdtxt = '#######';
    return txt.replace(/(^\{\{\{\n[\s\S]*?\n\}\}\})|(^!{1,6}).+$|(^[\*#;:]+).+$|\[[<>]?img\[(.+?)\]\]|(''|__|\^\^|~~|--|\[\[|\{\{\{)(.+?)(\5|\]\]|\}\}\})/img,
           // m1 -> pre block
           // m2 -> head
           // m3 -> list
           // m4 -> img
           // -> text format
           //   m5 -> format start
           //   m6 -> text
           //   m7 -> format end
           function(m0, m1, m2, m3, m4, m5, m6, m7) {
        if (m1) {
            return '```' + m0.slice(3, m0.length - 3) + '```';
        }
        if (m2) {
            return hdtxt.slice(0, m2.length) + tw2mdInline(m0.slice(m2.length));
        }
        if (m3) {
            if (m3.match(/^[\*#]+$/)) {
                return tw2mdInline(m0);
            }
            if (m3.match(/^;+/)) {
                return '<dl class="level-' + m3.length + '"><dt>' + tw2mdInline(m0.slice(m3.length)) + '</dt></dl>';
            }
            if (m3.match(/^:+/)) {
                return '<dl class="level-' + m3.length + '"><dd>' + tw2mdInline(m0.slice(m3.length)) + '</dd></dl>';
            }
            return m0;
        }
        if (m4) {
            return '<img src="' + m4 + '">';
        }
        if (m5) {
            return _proc(m0, m5, m6, m7);
        }

        return m0;
    });
}

page.open(url, function (status) {

    var pages = page.evaluate(function() {
        var pages = [];

        store.forEachTiddler(function(title, t) {
            var page = {
                name: t.title,
                content: t.text,
                creator: t.creator,
                created: +t.created,
                modified: +t.modified,
                modifier: t.modifier,
                tags: (t.tags || []).slice()
            };
            pages.push(page);
        });

        return pages;
    });

    function slug(name) {
        return name;
    }

    /* path: {name, created, modified, modifier, tags} */
    var data = {};

    function build(wiki) {
        return tw2md(wiki.content.replace(/<<toolbar permalink>>\n\n?/, ''));

        var body = [];
        var TEXT = function(t) { return t; },
            LIST = function(t) { return t && t.join(',') || ''; };
        var keys = {
            name: TEXT,
            creator: TEXT,
            created: TEXT,
            modifier: TEXT,
            modified: TEXT,
            tags: LIST
        };

        var meta = {};
        var path,
            val;
        for (var key in keys) {
            path = key.replace(/^./, function(m) { return m.toUpperCase(); });
            val = keys[key](wiki[key]);
            if (!val) continue;

            body.push(path + ': ' + val);

            meta[key] = keys[key](wiki[key]);
        }
        data[path] = meta;

        body.push('');
        body.push(tw2md(wiki.content.replace(/<<toolbar permalink>>\n\n?/, '')));

        return body.join('\n');
    }

    var i = pages.length;
    while (--i >= 0) {
        console.log('writing: ', pages[i].name);
        if (slug(pages[i].name) == 'stylesheetlayout') continue;
        fs.write('cn/page/' + slug(pages[i].name), build(pages[i]), 'w');
    }

    console.log('all done.');

    phantom.exit();
});

