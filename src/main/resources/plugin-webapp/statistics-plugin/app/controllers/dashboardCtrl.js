ngDefine('cockpit.plugin.statistics-plugin.controllers', ['require'], function(module) {

  module.controller('dashboardController',
		['$scope','DataFactory' , '$http', 'Uri', '$templateCache', '$modal', function($scope, DataFactory , $http, Uri, $templateCache,$modal) {	  
		  		  
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

        }, function () {
          
        });

	    };
	    

		}]);

});


