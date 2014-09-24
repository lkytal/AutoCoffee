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
		var options = { enable : true };
		input.split(",").forEach(function (item) {
			var key, value, i = item.indexOf(":");
			if (i < 0) {
				options[item] = 1;
				return options;
			}
			key = item.substr(0, i).trim();
			value = item.substr(i + 1).trim();
			if (value.match(/^(true|false|undefined|null|[0-9]+)$/)) {
				value = eval(value);
			}
			options[item] = value;
		});
		return options;
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
				match = /^#(\w+)/.exec(content); // /^\s*\/\/\s*(.+)/

			if (match)
			{
				console.log(match[1]);
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
			if (err)
			{
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
		readCoffeeFile(CoffeeFile, function (err, result) {
			if (err) {
				callback(err);
				return;
			}

			if (result.options.noCompile)
			{
				return;
			}

			var jsFile = CoffeeFile.replace(".coffee", ".js");
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
