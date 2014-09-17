ngDefine('cockpit.plugin.statistics-plugin.controllers', ['require'], function(module) {

  module.controller('dashboardController',
		['$scope','DataFactory' , '$http', 'Uri',function($scope, DataFactory , $http, Uri) {	  
//		  var head = angular.element(document.getElementsByTagName('head')[0]);
//		  head.append('<link rel="stylesheet" href="./lib/nv.d3.min.css" rel="stylesheet" />');
		  
		  $('head').append('<link rel="stylesheet" href="'+require.toUrl('../lib/nv.d3.min.css')+'" type="text/css" />');
		  
		  $scope.handleTabClick = function(chosenTab) {
		    DataFactory.prepForBroadcast(chosenTab);
	    };
		}]);
});
