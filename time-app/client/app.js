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

	// $scope.queryTime = function(){

	// 	var id = $scope.time_id;

	// 	appFactory.queryTime(id, function(data){
	// 		$scope.query_time = data;

	// 		if ($scope.query_time == "Could not locate time"){
	// 			console.log()
	// 			$("#error_query").show();
	// 		} else{
	// 			$("#error_query").hide();
	// 		}
	// 	});
	// }

	// $scope.recordTime = function(){

	// 	appFactory.recordTime($scope.time, function(data){
	// 		$scope.create_time = data;
	// 		$("#success_create").show();
	// 	});
	// }

	// $scope.changeHolder = function(){

	// 	appFactory.changeHolder($scope.holder, function(data){
	// 		$scope.change_holder = data;
	// 		if ($scope.change_holder == "Error: no time found"){
	// 			$("#error_holder").show();
	// 			$("#success_holder").hide();
	// 		} else{
	// 			$("#success_holder").show();
	// 			$("#error_holder").hide();
	// 		}
	// 	});
	// }

});

// Angular Factory
app.factory('appFactory', function($http){

	var factory = {};

    factory.queryAllTime = function(callback){

    	$http.get('/get_all_time/').success(function(output){
			callback(output)
		});
	}

	// factory.queryTime = function(id, callback){
 //    	$http.get('/get_time/'+id).success(function(output){
	// 		callback(output)
	// 	});
	// }

	// factory.recordTime = function(data, callback){

	// 	data.location = data.longitude + ", "+ data.latitude;

	// 	var time = data.id + "-" + data.location + "-" + data.timestamp + "-" + data.holder + "-" + data.manufacturer;

 //    	$http.get('/add_time/'+time).success(function(output){
	// 		callback(output)
	// 	});
	// }

	// factory.changeHolder = function(data, callback){

	// 	var holder = data.id + "-" + data.name;

 //    	$http.get('/change_holder/'+holder).success(function(output){
	// 		callback(output)
	// 	});
	// }

	return factory;
});
