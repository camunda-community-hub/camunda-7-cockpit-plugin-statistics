'use strict'
ngDefine('cockpit.plugin.statistics-plugin.duration', function(module) {

	module.controller('durationProcessDefinitionMenuCtrl', ['$scope', '$modal', '$modalStack', 'ElementStateService', 'DataFactory', function($scope, $modal, $modalStack, ElementStateService, DataFactory){

		var modalInstance = null;

		$scope.$on("$routeChangeStart", function(args){

			if(modalInstance) {

				closeModal();
			}
		});

		$scope.toggleMenu = function() {

			if(!modalInstance) {
				// close other modals
				$modalStack.dismissAll('opened another modal');
				DataFactory.bpmnElementsToHighlight = {};
				DataFactory.bpmnElementsToHighlightAsWarning = {};
				DataFactory.activityDurations = {};

				ElementStateService.setMenuState(true);
				modalInstance = $modal.open({
					templateUrl: 'durationSettingsModalView',
					controller: 'durationSettingsModalCtrl',
					size: 'md', //lg/sm/md
					windowClass: 'modal-right',
					animation: false,
					backdrop: false
				});

				ElementStateService.resetSelectedElement();

			} else {
				ElementStateService.setMenuState(false);
				closeModal();
			}
		};

		function closeModal() {

			ElementStateService.setDisabledElements(true);
			ElementStateService.resetSelectedElement();
			modalInstance.close();
			modalInstance = null;
			DataFactory.bpmnElementsToHighlight = {};
			DataFactory.bpmnElementsToHighlightAsWarning = {};
			DataFactory.activityDurations = {};
			DataFactory.highlighting = false;
			DataFactory.resetHighlighting = true;
		}
	}]);
});