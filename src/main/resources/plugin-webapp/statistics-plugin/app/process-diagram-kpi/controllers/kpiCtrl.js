'use strict'
ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {

	module.controller('kpiCtrl', ['$scope', '$modal','StateService', function($scope, $modal, StateService){

		var modalInstance = null;
		
		$scope.toggleMenu = function() {
			
			if(!modalInstance) {
				StateService.setMenuState(true);
				modalInstance = $modal.open({
					templateUrl: 'kpiSettings.html',
					controller: 'kpiSettingsCtrl',
					size: 'sm', //lg/sm/md
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
	}]);
});