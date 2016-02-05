'use strict'
ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {

	module.controller('loadingModalCtrl', ['$scope', '$modalInstance', function($scope, $modalInstance){

		$scope.$on('init', function() {
			$modalInstance.close();
		});
	}]);
});