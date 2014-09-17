'use strict'; //camunda guys are using strict mode as well, might make sense for us, too

ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {

	module.controller('timingCtrl',['$scope','DataFactory','Format','GraphFactory', function($scope,DataFactory,Format,GraphFactory){
	  
	  $scope.shownPlot = false;
	    
    $scope.$on('chosenTabChangedBroadcast', function() {
      if(DataFactory.chosenTab=="startEnd") {
        $scope.showPlot();
      }
    });
	  
    $scope.showPlot = function() {
      if(!$scope.shownPlot) {
    		$scope.info = "activities";
    		$scope.width = 1000;
    		$scope.allUserTasksIG = DataFactory.allUserTasksIG;
    		$scope.data = [];
    		
    		$scope.times = [{distribution:"weekly", format: "%a %H:%M"},{distribution: "dayly", format: "%H:%M" }];
    		$scope.time = $scope.times[0];
    
    		$scope.views = [{parameter: "startTime",xProperty:"startDate"}, {parameter: "endTime", xProperty:"endDate"}];
    		$scope.view = $scope.views[0];
    		
    		$scope.processOrUserTask = [{choice:"process instances"}, {choice: "activities"}];
    		$scope.choice = $scope.processOrUserTask[0];
    		$scope.disabled = ($scope.choice.choice == "process instances")?true : false;
    		
    		$scope.processInstances = [];	//modifizierte key query hier
    		$scope.processInstances.push({processDefKey: "all"});
    		
    		var i = $scope.processInstances.length;
    		$scope.processInstance = $scope.processInstances[i-1];
    		
    		
    		$scope.getDataAndDrawGraph= function(){
    			$scope.disabled = ($scope.choice.choice == "process instances")?true : false;
    			getData($scope.disabled,$scope.processInstance.processDefKey, $scope.time.distribution, $scope.view.parameter);
    		};
    		
    		var getData = function(process, userTaskProcessSpecifier, distribution, viewParameter){
    			//TODO: früher gesuchtes rauschlöschen!!! aus DataFactory
    			var xProperty = (viewParameter == "startTime")? "startDate" : "endDate";
    			var data = [];
    			var timeString = (distribution =="dayly")?"24h":"Week";
    			if(process){
    				DataFactory.getProcessesStartEnd()
    		        .then(function () {
    		            $scope.data=Format.bringNotSortedDataInPlotFormat(DataFactory.processesStartEnd,"procDefKey",xProperty,"",eval("Format.breakDateDownTo"+timeString),""); 
    	    			$scope.options = GraphFactory.getOptionsForStartEndTimeGraph($scope.time.format,$scope.width);
    	    			if($scope.processInstances[0].processDefKey == "all"){
    	    				$scope.processInstances = [];
    	    				for(var i =0; i < $scope.data.length; i++){
    	    					$scope.processInstances.push({processDefKey: $scope.data[i].key});
    	    				};
    	    				$scope.processInstances.push({processDefKey: "all"});
    	    				var i = $scope.processInstances.length;
    	    	    		$scope.processInstance = $scope.processInstances[i-1];
    	    			};
    		        })
    			}
    			else if(userTaskProcessSpecifier == "all"){
    				var key = DataFactory.generateKeyAllUserTasksByProcDefKeyAndDateSpecification(undefined, viewParameter);
    				DataFactory.getAllUserTasksByProcDefKeyAndDateSpecification(undefined,viewParameter)
    				.then(function(){
    					$scope.data=Format.bringNotSortedDataInPlotFormat
    							(DataFactory.allUserTasksByProcDefKeyAndDateSpecification[key],"procDefKey",xProperty,"",eval("Format.breakDateDownTo"+timeString),""); 
     	    			$scope.options = GraphFactory.getOptionsForStartEndTimeGraph($scope.time.format,$scope.width);
    				});
    				
    			}	
    			else{
    				var key = DataFactory.generateKeyAllUserTasksByProcDefKeyAndDateSpecification(userTaskProcessSpecifier, viewParameter);
    				DataFactory.getAllUserTasksByProcDefKeyAndDateSpecification(userTaskProcessSpecifier,viewParameter)
    				.then(function(){
    					$scope.data=Format.bringNotSortedDataInPlotFormat
    							(DataFactory.allUserTasksByProcDefKeyAndDateSpecification[key],"userTaskName",xProperty,"",eval("Format.breakDateDownTo"+timeString),""); 
     	    			$scope.options = GraphFactory.getOptionsForStartEndTimeGraph($scope.time.format,$scope.width);
    				});
    			};	
    		};
    		
    		
    		var processView = ($scope.choice.choice == "process instances")?true : false;
			getData(processView,$scope.processInstance.processDefKey, $scope.time.distribution, $scope.view.parameter);
    		
    		
        $scope.shownPlot = true;
      }
    }
	}]);
});
