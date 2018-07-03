// SPDX-License-Identifier: Apache-2.0

'use strict';

var app = angular.module('application', []);

// Angular Controller
app.controller('appController', function($scope, appFactory){

	$("#success_holder").hide();
	$("#success_create").hide();
	$("#error_holder").hide();
	$("#error_query").hide();

	$scope.queryAllTime = function(){

		appFactory.queryAllTime(function(data){
			var array = [];
			for (var i = 0; i < data.length; i++){
				parseInt(data[i].Key);
				data[i].Record.Key = parseInt(data[i].Key);
				array.push(data[i].Record);
			}
			array.sort(function(a, b) {
			    return parseFloat(a.Key) - parseFloat(b.Key);
			});
			$scope.all_time = array;
		});
	}

	$scope.queryTime = function(){

		var id = $scope.time_id;

		appFactory.queryTime(id, function(data){
			$scope.query_time = data;

			if ($scope.query_time == "Could not locate time"){
				console.log()
				$("#error_query").show();
			} else{
				$("#error_query").hide();
			}
		});
	}

});

// Angular Factory
app.factory('appFactory', function($http){

	var factory = {};

    factory.queryAllTime = function(callback){

    	$http.get('/get_all_time/').success(function(output){
			callback(output)
		});
	}

	factory.queryTime = function(id, callback){
    	$http.get('/get_time/'+id).success(function(output){
			callback(output)
		});
	}

	return factory;
});
