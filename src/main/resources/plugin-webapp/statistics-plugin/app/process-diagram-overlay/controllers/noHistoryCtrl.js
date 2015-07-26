'use strict'
ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {

	module.controller('noHistoryCtrl', ['$scope', '$modalInstance', function($scope, $modalInstance){

		$scope.closeModal = function() {
			$modalInstance.close();
		}
	}]);
});