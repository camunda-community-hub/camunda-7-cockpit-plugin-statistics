'use strict'; //camunda guys are using strict mode as well, might make sense for us, too

ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {

	module.controller('userTasks24Ctrl',['$scope','DataFactory','Format','GraphFactory', function($scope,DataFactory,Format,GraphFactory){
	  
	  $scope.shownPlot = false;
	    
    $scope.$on('chosenTabChangedBroadcast', function() {
      if(DataFactory.chosenTab=="startEnd") {
        $scope.showPlot();
      }
    });
	  
    $scope.showPlot = function() {
      if(!$scope.shownPlot) {
    		$scope.info = "user tasks";
    		$scope.width = 1000;
    		$scope.allUserTasksIG = DataFactory.allUserTasksIG;
    		$scope.data = [];
    		
    		$scope.times = [{distribution:"weekly"},{distribution: "dayly"}];
    		$scope.time = $scope.times[0];
    
    		$scope.views = [{parameter: "startTime"}, {parameter: "endTime"}];
    		$scope.view = $scope.views[0];
    		
    		$scope.processOrUserTask = [{choice:"process instances"}, {choice: "user tasks"}];
    		$scope.choice = $scope.processOrUserTask[0];
    		
    		$scope.processInstances = [];	//modifizierte key query hier
    		$scope.processInstances.push({processDefKey: "all"});
    		
    		var i = $scope.processInstances.length;
    		$scope.processInstance = $scope.processInstances[i-1];
    		
    		//maybe later give getAll.. an argument and execute when view changes
    		DataFactory.getAllUserTasksIG()
    		.then(function () {
    			$scope.allUserTasksIG = DataFactory.allUserTasksIG;
    			var timeString = ($scope.time.distribution =="dayly")?"24h":"Week";
    			$scope.data=Format.bringNotSortedDataInPlotFormat($scope.allUserTasksIG,"processDefinitionId",$scope.view.parameter,"",eval("Format.breakDateDownTo"+timeString),"");
    		});
    
    		$scope.drawStartEndTimeGraph  = function(){
    			//maybe all that stuff belongs in the then method from above
    //			and DataFactory.getAll.. has to be called from inside this method
    			var timeString = ($scope.time.distribution =="dayly")?"24h":"Week";
    			$scope.data=Format.bringNotSortedDataInPlotFormat($scope.allUserTasksIG,"processDefinitionId",$scope.view.parameter,"",eval("Format.breakDateDownTo"+timeString),"");
    			var timeFormat = ($scope.time.distribution =="dayly")? '%H:%M' : '%a %H:%M';
    			$scope.options = GraphFactory.getOptionsForStartEndTimeGraph(timeFormat,$scope.width);
    		};
    		
    		var timeFormat = ($scope.time.distribution =="dayly")? '%H:%M' : '%a %H:%M';
    		$scope.options = GraphFactory.getOptionsForStartEndTimeGraph(timeFormat,$scope.width);
        $scope.shownPlot = true;
      }
    }
	}]);
});
