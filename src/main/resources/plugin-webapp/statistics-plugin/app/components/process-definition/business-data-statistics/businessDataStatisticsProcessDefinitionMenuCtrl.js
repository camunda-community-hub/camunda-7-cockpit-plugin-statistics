'use strict'
ngDefine('cockpit.plugin.statistics-plugin.business-data-statistics', function(module) {

	module.controller('businessDataStatisticsProcessDefinitionMenuCtrl', ['$scope', '$rootScope', '$modal', 'DataFactory', function($scope, $rootScope, $modal, DataFactory){

		var menuInstance = null;

		$rootScope.$on("$routeChangeStart", function(args){
			if(menuInstance && menuInstance != null) {
				closeMenu();
  		}
		});
		
		$scope.toggleBusinessDataStatisticsModal = function() {
			
			$modal.open({
				templateUrl: 'businessDataStatisticsModalView',
				controller: 'businessDataStatisticsModalCtrl',
				size: 'lm'
			});
		};

		function closeMenu() {
			menuInstance.close();
			menuInstance = null;
			DataFactory.bpmnElementsToHighlight = {};
			DataFactory.bpmnElementsToHighlightAsWarning = {};
			DataFactory.activityDurations = {};
		}
		
	}]);

});