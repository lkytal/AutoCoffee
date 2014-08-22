gulp = require 'gulp'
coffee = require 'gulp-coffee'
watch = require 'gulp-watch'

gulp.task 'coffee', ->
	gulp
	.src './test/*.coffee'
	.pipe (coffee bare: true)
	.on 'error', console.log
	.pipe (gulp.dest './/test/')

	gulp
	.src './*.coffee'
	.pipe (coffee bare: true)
	.on 'error', console.log
	.pipe (gulp.dest './/')

gulp.task 'watch', ->
	gulp
	.src './*.coffee'
	.pipe watch (files) ->
		files.pipe(coffee bare: true)
		.pipe (gulp.dest './')

	gulp
	.src './test/tests.coffee'
	.pipe watch (files) ->
		files.pipe(coffee bare: true)
		.pipe (gulp.dest './test/')

gulp.task 'default', ->
	gulp.run 'watch'
	gulp.run 'coffee'
