ngDefine('cockpit.plugin.statistics-plugin.dashboard', function(module) {

  module.controller('dashboardCtrl',
		['$scope','DataFactory' , '$http', 'Uri', '$templateCache', '$modal', function($scope, DataFactory , $http, Uri, $templateCache, $modal) {	  
		  
		  $scope.handleTabClick = function(chosenTab) {
		    DataFactory.prepForBroadcast(chosenTab);
	    };
	    
	    
	    $scope.showPluginSettingsModal = function() {
	      
        var modalInstance = $modal.open({
          templateUrl: 'settingsModalView',
          controller: 'settingsModalCtrl',
          size: 'lg'
        });
        
        modalInstance.result.then(function (processKeysToFilter) {

        }, function () {
          
        });

	    };
	    

		}]);

});


