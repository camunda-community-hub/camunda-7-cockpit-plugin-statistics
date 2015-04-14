ngDefine('cockpit.plugin.statistics-plugin.controllers', ['require'], function(module) {

  module.controller('dashboardController',
		['$scope','DataFactory' , '$http', 'Uri', '$templateCache', '$modal', function($scope, DataFactory , $http, Uri, $templateCache,$modal) {	  
		  
		  $('head').append('<link rel="stylesheet" href="'+require.toUrl('../lib/nv.d3.min.css')+'" type="text/css" />');

		  
		  $scope.showSettingsLink=false;
		  
		  var processKeysToFilter = [];
		  
		  $scope.handleTabClick = function(chosenTab) {
		    DataFactory.prepForBroadcast(chosenTab);
	    };
	    
	    
	    $scope.showPluginSettingsModal = function() {
	      
        var modalInstance = $modal.open({
          templateUrl: 'pluginSettingsModal.html',
          controller: 'pluginSettingsCtrl',
          size: 'lg'
        });
        
        modalInstance.result.then(function (processKeysToFilter) {
          //successfully closed ==> refresh selection of plotted processes by analyzing processSelection
          
          
          //hide settings link
          $scope.showSettingsLink=false;          
        }, function () {
           //hide settings link
          $scope.showSettingsLink=false;
        });

	    };
	    

		}]);

});


