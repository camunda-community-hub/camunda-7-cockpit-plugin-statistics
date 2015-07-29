+'use strict'; 

ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {

	module.controller('timingCtrl',['$scope','TimingFactory','DataFactory', 'UserInteractionFactory', '$location', 'Uri', '$modal', function($scope,TimingFactory,DataFactory,UserInteractionFactory,$location,Uri,$modal){

		$scope.shownPlot = false;

		$scope.$on('chosenTabChangedBroadcast', function() {
			if(DataFactory.chosenTab=="startEnd") {
				$scope.showPlot();
			}
		});

		$scope.$on('widthChanged', function() {
			$scope.width = UserInteractionFactory.currentWidth*0.66;
			$scope.getDataAndDrawGraph();
		});

		$scope.showPlot = function() {
			if(!$scope.shownPlot) {

				$scope.$on('plotData:updated', function(event,data) {
					$scope.data = TimingFactory.chosenData;
					$scope.options = TimingFactory.options;
				});

				$scope.openDeleteDeploymentDialog = function () {
					$modal.open({
						templateUrl: require.toUrl(Uri.appUri('plugin://statistics-plugin/static/app/partials/startEndPlotConfigDialog.html')),
						controller: 'startEndConfigController',
						size: 'lg'
					});
				}; 
				$scope.shownPlot = true;

			}
		}
	}]);
});
