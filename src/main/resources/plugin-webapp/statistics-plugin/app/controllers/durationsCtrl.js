'use strict'; //camunda guys are using strict mode as well, might make sense for us, too

ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {

	module.controller('regCtrl',['$scope','DataFactory','Format', function($scope,DataFactory,Format){

		$scope.selected = [];
		DataFactory.keys().success(function(data){
			$scope.keys = data;
			if(typeof $scope.keys[0] != "undefined"){
				$scope.selected = [ $scope.keys[0].processDefinitionKey];
			}
			getDurations();
		});

		//maybe outsource all the formatting in an extra service
		function getDurations() {
			DataFactory.getDurations($scope.selected).then(function () {
				$scope.durations = DataFactory.durations;
				$scope.data = [];
				var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S").parse;
				$scope.data = Format.bringSortedDataInPlotFormat($scope.durations,"processDefinitionKey","startingTime","duration",parseDate,function(d){return d/1000/60;});
				$scope.options = {
						outerRegion:[5,95],
						scatter  : true,
						regression : false,
						spline : true
				};

			});

		};
		$scope.$watch('selected',function(){
			getDurations();
		});
	}]);
});
