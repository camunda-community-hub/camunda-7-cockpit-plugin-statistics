'use strict'
ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {

	module.controller('noHistoryCtrl', ['$scope', '$modalInstance', function($scope, $modalInstance){

		$scope.init = function() {
			$rootScope.$broadcast("init");
		}
		
		$scope.closeModal = function() {
			$modalInstance.close();
		}
	}]);
});