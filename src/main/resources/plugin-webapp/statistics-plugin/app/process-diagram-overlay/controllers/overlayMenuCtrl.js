'use strict'
ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {

	module.controller('overlayMenuCtrl', ['$scope', '$rootScope', '$modal', '$modalStack', 'DataFactory', function($scope, $rootScope, $modal, $modalStack, DataFactory){

		var menuInstance = null;

		$rootScope.$on("$routeChangeStart", function(args){
			if(menuInstance && menuInstance != null) {
				closeMenu();
  		}
		});
		
		$scope.toggleMenu = function() {
			if(!menuInstance) {
				// close other modals
				$modalStack.dismissAll('opened another modal');
				DataFactory.bpmnElementsToHighlight = {};
				DataFactory.bpmnElementsToHighlightAsWarning = {};
				DataFactory.activityDurations = {};
				
				menuInstance = $modal.open({
					templateUrl: 'processDiagramSettingsModal.html',
					controller: 'processDiagramSettingsCtrl',
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
		
		$scope.toggleVariableStatusModal = function() {
			
			$modal.open({
				templateUrl: 'variableStatusModal.html',
				controller: 'variableStatusModalCtrl',
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