
'use strict';

var response;
var app = angular.module('application', []);
app.controller('appController', function($scope, $http) 
{  $http.get("Flights.php")
   .then(function(response){
    $scope.search = response.data;     
  });
});