ngDefine('cockpit.plugin.statistics-plugin.controllers',  function(module) {

  module.controller('dashboardController',
		['$scope','DataFactory' , '$http', 'Uri',function($scope, DataFactory , $http, Uri) {	  
//		  var head = angular.element(document.getElementsByTagName('head')[0]);
//		  head.append('<link rel="stylesheet" href="./lib/nv.d3.min.css" rel="stylesheet" />');
		  
		  $scope.handleTabClick = function(chosenTab) {
		    DataFactory.prepForBroadcast(chosenTab);
	    };
		}]);
});
