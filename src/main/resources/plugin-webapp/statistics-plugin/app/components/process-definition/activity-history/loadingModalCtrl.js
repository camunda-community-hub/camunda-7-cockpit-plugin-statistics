'use strict'
ngDefine('cockpit.plugin.statistics-plugin.activity-history', function(module) {

	module.controller('loadingModalCtrl', ['$scope', '$modalInstance', function($scope, $modalInstance){

		$scope.$on('init', function() {
			$modalInstance.close();
		});
	}]);
});