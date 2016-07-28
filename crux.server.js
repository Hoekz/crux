var http = require('http');
var path = require('path');
var fs = require('fs');
var mime = require('mime-types').contentType;
//crux requires
var wrap = require('./crux.wrap');

var routes = [];
var wrap = function(a){return a};

var server = module.exports = function(rq, res){
	var url = rq.url;
	var method = rq.method;
	var body = [];
	var res = wrap(res, {
		sendHTML: function(html){
			this.setHeader('Content-Type', mime('index.html'));
			this.statusCode = 200;
			this.end(HTML.stringify(html));
		},
		sendFile: function(filePath){
			this.setHeader('Content-Type', mime(filePath));
			this.pipe(fs.createReadStream(path));
		},
		sendJSON: function(data){
			this.setHeader('Content-Type', mime('data.json'));
			this.statusCode = 200;
			this.end(JSON.stringify(data));
		},
		sendCSS: function(css){
			this.setHeader('Content-Type', mime('style.css'));
			this.statusCode = 200;
			this.end(CSS.stringify(css));
		},
		sendJS: function(js){
			this.setHeader('Content-Type', mime('style.css'));
			this.statusCode = 200;
			this.end(JS.stringify(js));
		}
	});

	res.url = url;
	res.method = method;

	rq.on('error', function(err){
		log(err);
	}).on('data',  function(chunk){
		body.push(chunk);
	}).on('end',   function(){
		try{
			res.body = JSON.parse(Buffer.concat(body).toString());
		}catch(e){
			res.body = Buffer.concat(body);
		}

		var open = true;

		routes.forEach(function(route){
			if(open && url.match(route.pattern) && method == route.method){
				log(route.fire(res));
				open = true;
			}
		});

		if(open){
			res.statusCode = 404;
			res.end('404 - cannot find route ' + url);
		}
	});
};

var regexify = function(template){
	var regStr = '';
	template = template.split('/');
	
};

var parse = function(template, url){
	var params = {};
	var pattern = regexify(template);
	var template = template.split('/').filter(function(s){
		return s[0] === ':'
	});

	url.match(pattern).forEach(function(s, i){
		 params[template[i]] = s;
	});

	return params;
};

server.on = function(opts){
	var method = opts.method || 'GET';
	var url = opts.url || '/';
	var fire = opts.fire || function(res){res.sendHTML('unhandled')};

	routes.push({
		method: method,
		pattern: regexify(url),
		fire: function(res){
			res.params = parse(url, res.url);
			return fire.call({}, res);
		}
	});
};

server.on.get = function(url, handler){
	return server.on({method: 'GET', url: url, fire: handler});
};

server.on.put = function(url, handler){
	return server.on({method: 'PUT', url: url, fire: handler});
};

server.on.post = function(url, handler){
	return server.on({method: 'POST', url: url, fire: handler});
};

server.on.delete = function(url, handler){
	return server.on({method: 'DELETE', url: url, fire: handler});
};

server.start = function(port){
	http.createServer(server).listen(port);
};