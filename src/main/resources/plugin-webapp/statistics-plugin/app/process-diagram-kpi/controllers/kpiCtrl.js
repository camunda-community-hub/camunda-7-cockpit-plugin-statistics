'use strict'
ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {

	module.controller('kpiCtrl', ['$scope', '$modal','StateService', function($scope, $modal, StateService){

		var modalInstance = null;
		
		$scope.$on("$routeChangeStart", function(args){

			if(modalInstance) {

				closeModal();
			}
		});
		
		$scope.toggleMenu = function() {
			
			if(!modalInstance) {
				StateService.setMenuState(true);
				modalInstance = $modal.open({
					templateUrl: 'kpiSettings.html',
					controller: 'kpiSettingsCtrl',
					size: 'md', //lg/sm/md
					windowClass: 'modal-right',
					animation: false,
					backdrop: false
				});
												
			} else {
				StateService.setMenuState(false);
				modalInstance.close();
				modalInstance = null;				
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