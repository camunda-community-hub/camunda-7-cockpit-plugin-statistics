'use strict'; 

ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {

	module.controller('timingCtrl',['$scope','TimingFactory','DataFactory', 'UserInteractionFactory', '$location', function($scope,TimingFactory,DataFactory,UserInteractionFactory,$location){

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

				$scope.data = TimingFactory.data;

				$scope.timeFrames = TimingFactory.timeFrames;
				$scope.currentFrame = $scope.timeFrames[0];

				$scope.xValueSpecifiers = TimingFactory.xValueSpecifiers;
				$scope.currentXValue = $scope.xValueSpecifiers[0];

				$scope.levelSpecifiers = TimingFactory.levelSpecifiers;
				$scope.currentLevel = $scope.levelSpecifiers[0];

				$scope.kMeans = 5;

				$scope.processInstances = TimingFactory.processInstancesList;

				$scope.processInstance = TimingFactory.processInstance;	

				$scope.getDataAndDrawGraph= function(){
					TimingFactory.getData($scope.currentLevel,$scope.processInstance.processDefKey, $scope.currentFrame, $scope.currentXValue,$scope.width, $scope.kMeans)
					.then(function(){
						$scope.processInstances = TimingFactory.processInstancesList;
						$scope.options = TimingFactory.options;
						$scope.data = TimingFactory.data;
//						$scope.processInstance = TimingFactory.processInstance;	
					});
				};



				TimingFactory.getData($scope.currentLevel,"all", $scope.currentFrame, $scope.currentXValue,$scope.width, $scope.kMeans)
				.then(function(){
					$scope.processInstances = TimingFactory.processInstancesList;
					$scope.options = TimingFactory.options;
					$scope.data = TimingFactory.data;
					$scope.processInstance = TimingFactory.processInstance;	
				});

				$scope.shownPlot = true;
			}
		}
	}]);
});
