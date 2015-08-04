'use strict'; //camunda guys are using strict mode as well, might make sense for us, too

ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {

	module.controller('durationsCtrl',['$scope','DataFactory','Format','GraphFactory', function($scope,DataFactory,Format,GraphFactory){

		var shownPlot = false;

		$scope.$on('chosenTabChangedBroadcast', function() {
			if(DataFactory.chosenTab=="durations") {
				showPlot();
			}
		});

		var showPlot = function() {
			if(!shownPlot) {
				
				$scope.showInfo = true;
				$scope.views = GraphFactory.timeDistViews;
				$scope.selectedView = $scope.views[1]; 
				//we do that so that can adress this variable from inside the ng-if
				//elsewise we would have to adress it with $parent.numberOfBins
				//bcz ng-if produces a childscope
				$scope.numberOfBins = {"number": 10};

//				$scope.selected = [];
				DataFactory.getProcessDefWithFinishedInstances().then(function(){
					$scope.processDefWithFinishedInstances = DataFactory.processDefWithFinishedInstances;
					if(typeof $scope.processDefWithFinishedInstances[0] != "undefined"){
						$scope.selected = [{processDefinitionKey: $scope.processDefWithFinishedInstances[0].processDefinitionKey}];
					}
					$scope.getDurations();
				});

				$scope.getDurations = function() {
					DataFactory.getDurations($scope.selected).then(function () {
						var durations = DataFactory.durations;
						if($scope.selectedView.name=='chronological development'){
							var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S").parse;
							$scope.data = Format.bringSortedDataInPlotFormat(durations,"processDefinitionKey","startTime","duration",parseDate,function(d){return d/1000/60;});
							$scope.options = {
									outerRegion:[5,95],
									scatter  : true,
									regression : false,
									spline : true
							};
						}
						//no string here!
						else if ($scope.selectedView.name=='distribution'){
							var result = Format.bringDataIntoBarPlotFormat(durations,"processDefinitionKey","duration",function(d){return d/1000/60;},$scope.numberOfBins.number);
							$scope.data = result[0].data;
							var thresholds = result[0].thresholds;
							$scope.options = GraphFactory.getOptionsForTimeDistributionGraph($scope.numberOfBins.number,thresholds);

						}
					});

				};
				
				$scope.showInfo = function(){
					if($scope.showInfo) $scope.showInfo = false;
					else $scope.showInfo = true;
					console.log($scope.showInfo);
				};
				shownPlot = true;
			}
		}
	}]);
});
