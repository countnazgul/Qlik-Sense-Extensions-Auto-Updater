var fs 			= require('fs');
var glob		= require('glob');
var asynbc		= require('async');
var request		= require('request');
var config 		= require('./config');
var express 	= require('express');
var app 		= express();

var edition = config.edition;
var extensiosPath = config.extensionspath;
var globOptions = {};

glob(extensiosPath + "/**/*.qext",  function (er, files) {
	for( var i = 0; i < files.length; i++) {
		var file = files[i];
		
		fs.readFile(file, 'utf8', function (err, data) {
			
			var qext = JSON.parse(data);
			var version = qext.version;
			
			var repository = qext.repository;
			repository = repository.split('/');
			
			var repoOwner = repository[3];
			var repoName = repository[4];
			
			if( repoOwner) {
				
				var requestOptions = { url: 'https://api.github.com/repos/' + repoOwner  + '/' + repoName + '/commits', headers: {'User-Agent': 'request' } };								
				request(requestOptions, function (error, response, commits) {
					commits = JSON.parse(commits);
				
					var requestOptionsFiles = { url: 'https://api.github.com/repos/' + repoOwner  + '/' + repoName + '/commits/' + commits[0].sha, headers: {'User-Agent': 'request'}};						
					request(requestOptionsFiles, function (error, response, commitFiles) {
				
						commitFiles = JSON.parse(commitFiles);
						for(var i = 0; i < commitFiles.files.length; i++) {
							if( commitFiles.files[i].filename.indexOf('.qext') > -1 ) {								

								var requestOptionsQext = { url: commitFiles.files[i].raw_url, headers: {'User-Agent': 'request'} };									
								request(requestOptionsQext, function (error, response, qextContent) {
									qextContent = JSON.parse(qextContent);
									console.log(qextContent.version)									
								});
							}	
						}						
					});
				});
			};
		});				
	};
});
