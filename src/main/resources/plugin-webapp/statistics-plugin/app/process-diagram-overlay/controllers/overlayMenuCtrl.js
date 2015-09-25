'use strict'
ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {

	module.controller('overlayMenuCtrl', ['$scope', '$modal', function($scope, $modal){

		var modalInstance = null;

		$scope.toggleMenu = function() {

			if(!modalInstance) {
				modalInstance = $modal.open({
					templateUrl: 'processDiagramSettingsModal.html',
					controller: 'processDiagramSettingsCtrl',
					size: 'sm',
					windowClass: 'modal-right'
				});
			} else {
				modalInstance.close();
				modalInstance = null;
			}


		};

	}]);

});