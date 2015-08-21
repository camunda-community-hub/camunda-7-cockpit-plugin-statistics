'use strict'; 

ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {

	module.controller('timingCtrl',['$scope','TimingFactory','DataFactory', 'UserInteractionFactory', '$location', 'Uri', '$modal', function($scope,TimingFactory,DataFactory,UserInteractionFactory,$location,Uri,$modal){

		$scope.$on('widthChanged', function() {
			$scope.width = UserInteractionFactory.currentWidth*0.66;
			$scope.data = TimingFactory.chosenData;
			$scope.options = TimingFactory.options;
		});

	}]);
});
