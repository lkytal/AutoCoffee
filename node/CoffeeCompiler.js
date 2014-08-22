/*jshint evil: true */
(function () {
	"use strict";

	var CoffeeScript = require("coffee-script"),
		path = require("path"),
		fs = require("fs"),
		mkpath = require("mkpath"),
		CoffeeOptionKeys;

	CoffeeOptionKeys = { bare: true };

	function readOptions(input) {
		var options = {};
		input.split(",").forEach(function (item) {
			var key, value, i = item.indexOf(":");
			if (i < 0) {
				return;
			}
			key = item.substr(0, i).trim();
			value = item.substr(i + 1).trim();
			if (value.match(/^(true|false|undefined|null|[0-9]+)$/)) {
				value = eval(value);
			}
			options[key] = value;
		});
		return options;
	}

	function pick(options, keys) {
		var out = {};
		keys.forEach(function (key) {
			if (options[key]) {
				out[key] = options[key];
			}
		});
		return out;
	}

	// read Coffee input
	function readCoffeeFile(CoffeeFile, callback) {
		fs.readFile(CoffeeFile, function (err, data) {
			if (err) {
				callback(err);
				return;
			}

			var content = data.toString(),
				result = { "content": content },
				match = /^\s*\/\/\s*(.+)/.exec(content);

			if (match) {
				result.options = readOptions(match[1]);
			}
			else
			{
				result.options = {};
			}
			callback(null, result);
		});
	}

	// makes a file in a path where directories may or may not have existed before
	function mkfile(filepath, content, callback) {
		mkpath(path.dirname(filepath), function (err) {
			if (err) {
				callback(err);
			}
			else
			{
				fs.writeFile(filepath, content, callback);
			}
		});
	}

	// compile the given Coffee file
	function compile(CoffeeFile, callback) {

		// read the Coffee file, returns object with the following keys:
		// - content: content of the file
		// - out: override output filename (optional)
		// - main: override compile file (optional)
		// - options: compiler options (optional)
		readCoffeeFile(CoffeeFile, function (err, result) {
			if (err) {
				callback(err);
				return;
			}

			/*/ compile a different file instead
			if (result.options.main) {
				compile(path.join(path.dirname(CoffeeFile), result.options.main), callback);
				return;
			}

			// determine output filename
			var parser, parserOptions, jsFile, sourceMapFilename, CoffeePath = path.dirname(CoffeeFile);
			if (result.options.out) {
				jsFile = path.resolve(CoffeePath, result.options.out);
				if (path.extname(jsFile) === "") {
					jsFile += ".js";
				}
			}
			else {
				jsFile = CoffeeFile.substr(0, CoffeeFile.length - 7) + ".js";
			}

			// source map file
			if (result.options.sourceMapFilename) {
				sourceMapFilename = path.resolve(CoffeePath, result.options.sourceMapFilename);
				if (sourceMapFilename === jsFile) {
					sourceMapFilename += ".map";
				}
			}
			else {
				sourceMapFilename = jsFile + ".map";
			}

			// create Coffee parser
			parserOptions = pick(result.options, CoffeeOptionKeys.parser);
			parserOptions.paths = [CoffeePath];
			parserOptions.filename = path.basename(CoffeeFile);
			*/

			var jsFile = CoffeeFile.substr(0, CoffeeFile.length - 7) + ".js";
			var output = CoffeeScript.compile(result.content, {bare: true});

			mkfile(jsFile, output, function (err) {
				if (err) {
					callback(err);
				}
				else {
					callback(null, { filepath: jsFile, output: output });
				}
			});
		});
	}

	// set up service for brackets
	function init(DomainManager) {
		if (!DomainManager.hasDomain("CoffeeCompiler")) {
			DomainManager.registerDomain("CoffeeCompiler", {
				major: 1,
				minor: 0
			});
		}
		DomainManager.registerCommand(
			"CoffeeCompiler", // domain name
			"compile", // command name
			compile, // command handler function
			true, // this command is asynchronous
			"Compiles a Coffee file", ["CoffeePath"], // path parameters
			null);
	}

	exports.init = init;

}());
