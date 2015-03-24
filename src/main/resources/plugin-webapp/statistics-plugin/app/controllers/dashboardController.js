ngDefine('cockpit.plugin.statistics-plugin.controllers', ['require'], function(module) {

  module.controller('dashboardController',
		['$scope','DataFactory' , '$http', 'Uri', '$modal', '$templateCache', function($scope, DataFactory , $http, Uri, $modal,$templateCache) {	  
		  
		  $('head').append('<link rel="stylesheet" href="'+require.toUrl('../lib/nv.d3.min.css')+'" type="text/css" />');
		  
		  $scope.handleTabClick = function(chosenTab) {
		    DataFactory.prepForBroadcast(chosenTab);
	    };

		}]);

});


