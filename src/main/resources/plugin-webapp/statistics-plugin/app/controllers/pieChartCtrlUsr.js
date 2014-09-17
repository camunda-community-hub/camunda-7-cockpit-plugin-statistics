ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {
	module.controller('pieChartCtrlUsr',['$scope', '$http', 'Uri', 'DataFactory', function($scope, $http, Uri, DataFactory){
		
	  $scope.shownPlot=false;
	  
	  $scope.$on('chosenTabChangedBroadcast', function() {
	    if(DataFactory.chosenTab=="userTasks") {
	      $scope.showPlot();
	    }
	  });
	  
	  $scope.assingRunningDataToPlot = function($scope, runningUserTasks) {
	    
      var r=[];
      
      for(i in runningUserTasks){
        r.push({"key":runningUserTasks[i].procDefKey,"y":runningUserTasks[i].count});
      }
      
      $scope.tasksRunning = r;
      
    }
    
	  $scope.assingEndedDataToPlot= function($scope, endedUserTasks) {
	    
      var e=[];
      
      for(i in endedUserTasks){
        e.push({"key":endedUserTasks[i].procDefKey,
          "y":endedUserTasks[i].count,
          "avg":endedUserTasks[i].duration,
          "min":endedUserTasks[i].minDuration,
          "max":endedUserTasks[i].maxDuration});
      }
      $scope.tasksEnded = e;
    }
	  
	  $scope.showPlot = function() {
	    
	    if(!$scope.shownPlot) {
  	    $scope.runningTasksOptions = {
            chart: {
                type: 'pieChart',
                height: 500,
                x: function(d){return d.key;},
                y: function(d){return d.y;},
                showLabels: true,
                transitionDuration: 500,
                labelThreshold: 0.01,
                tooltips: true,
                noData:"No Tasks met the requirements",
                legend: {
                    margin: {
                        top: 5,
                        right: 5,
                        bottom: 5,
                        left: 5
                    }
                }
            }
        };
  
        $scope.endedTasksOptions = {
            chart: {
                type: 'pieChart',
                height: 500,
                x: function(d){return d.key;},
                y: function(d){return d.y;},
                showLabels: true,
                transitionDuration: 500,
                labelThreshold: 0.01,
                tooltips: true,
                tooltipContent: function(key, y, e, graph){
            return '<h3>' + key + '</h3>' +
            '<p>' +  y + '<br/><br/>average Duration:<b>'+
            (e.point.avg/1000/60).toFixed(2)+
            ' min</b><br/>minimal Duration:<b>'+
            (e.point.min/1000/60).toFixed(2)+
            ' min</b><br/>maximal Duration:<b>'+
            (e.point.max/1000/60).toFixed(2)+
            ' min</b></p>'
            },
                noData:"No Tasks met the requirements",
                legend: {
                    margin: {
                        top: 5,
                        right: 5,
                        bottom: 5,
                        left: 5
                    }
                }
            }
        };
      
        if(DataFactory.allRunningUserTasksCountOByProcDefKey.length>0) {
          $scope.assingRunningDataToPlot($scope, DataFactory.allRunningUserTasksCountOByProcDefKey);
        } else {
          DataFactory.getAllRunningUserTasksCountOByProcDefKey()
          .then(function(data){
            $scope.assingRunningDataToPlot($scope, DataFactory.allRunningUserTasksCountOByProcDefKey);
          });
        }
        
        if(DataFactory.allEndedUserTasksCountOByProcDefKey.length>0) {
          $scope.assingEndedDataToPlot($scope, DataFactory.allEndedUserTasksCountOByProcDefKey);
        } else {
          DataFactory.getAllEndedUserTasksCountOByProcDefKey()
          .then(function(data){
            $scope.assingEndedDataToPlot($scope, DataFactory.allEndedUserTasksCountOByProcDefKey);
          });
        }
 
        $scope.shownPlot=true;
  	  }
	  }
	  
		
	}]) 
});