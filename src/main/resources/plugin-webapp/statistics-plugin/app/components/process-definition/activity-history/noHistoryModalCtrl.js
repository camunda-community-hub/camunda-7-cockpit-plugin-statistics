'use strict'
ngDefine('cockpit.plugin.statistics-plugin.activity-history', function(module) {

	module.controller('noHistoryModalCtrl', ['$scope', '$modalInstance', '$rootScope', 'activityName', function($scope, $modalInstance, $rootScope, activityName){

		$scope.init = function() {
			$scope.activityName = activityName;
			$rootScope.$broadcast("init");
		}
		
		$scope.closeModal = function() {
			$modalInstance.close();
		}
	}]);
});