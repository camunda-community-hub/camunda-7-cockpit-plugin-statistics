'use strict'
ngDefine('cockpit.plugin.statistics-plugin.highlighting', function(module) {

	module.controller('highlightingProcessDefinitionMenuCtrl', ['$scope', '$rootScope', '$modal', '$modalStack', 'DataFactory', function($scope, $rootScope, $modal, $modalStack, DataFactory){

		var menuInstance = null;

		$rootScope.$on("$routeChangeStart", function(args){
			if(menuInstance && menuInstance != null) {
				closeMenu();
  		}
		});
		
		$scope.toggleHighlightingMenu = function() {
			if(!menuInstance) {
				// close other modals
				$modalStack.dismissAll('opened another modal');
				DataFactory.bpmnElementsToHighlight = {};
				DataFactory.bpmnElementsToHighlightAsWarning = {};
				DataFactory.activityDurations = {};
				
				menuInstance = $modal.open({
					templateUrl: 'highlightingSettingsModalView',
					controller: 'highlightingSettingsModalCtrl',
					size: 'sm',
					windowClass: 'modal-right',
					backdrop: false
				});
				menuInstance.result.then(function() {
					closeMenu()
				}, function() {
					closeMenu()
				});
			} else {
				closeMenu();
			}
		};

		function closeMenu() {
			menuInstance.close();
			menuInstance = null;
			DataFactory.bpmnElementsToHighlight = {};
			DataFactory.bpmnElementsToHighlightAsWarning = {};
			DataFactory.activityDurations = {};
			DataFactory.highlighting = false;
			DataFactory.resetHighlighting = true;
		}
		
	}]);

});