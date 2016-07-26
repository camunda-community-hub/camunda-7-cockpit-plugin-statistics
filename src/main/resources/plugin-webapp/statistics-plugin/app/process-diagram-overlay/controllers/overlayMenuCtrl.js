'use strict'
ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {

	module.controller('overlayMenuCtrl', ['$scope', '$rootScope', '$modal', 'DataFactory', function($scope, $rootScope, $modal, DataFactory){

		var modalInstance = null;

		$rootScope.$on("$routeChangeStart", function(args){
			if(modalInstance) {
  			closeModal();
  		}
		});
		
		$scope.toggleMenu = function() {
			if(!modalInstance) {
				modalInstance = $modal.open({
					templateUrl: 'processDiagramSettingsModal.html',
					controller: 'processDiagramSettingsCtrl',
					size: 'sm',
					windowClass: 'modal-right',
					backdrop: false
				});
				modalInstance.result.then(function() {
					closeModal()
				}, function() {
					closeModal()
				});
			} else {
				closeModal();
			}
		};

		function closeModal() {
			modalInstance.close();
			modalInstance = null;
			DataFactory.bpmnElementsToHighlight = {};
			DataFactory.bpmnElementsToHighlightAsWarning = {};
			DataFactory.activityDurations = {};
		}
		
	}]);

});