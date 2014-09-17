'use strict'; //camunda guys are using strict mode as well, might make sense for us, too

ngDefine('cockpit.plugin.statistics-plugin.controllers',  function(module) {

	module.controller('process24Ctrl',['$scope','DataFactory','Format','GraphFactory', function($scope,DataFactory,Format,GraphFactory){
	  
	  $scope.shownPlot = false;
	  
	  $scope.$on('chosenTabChangedBroadcast', function() {
      if(DataFactory.chosenTab=="startEnd") {
        $scope.showPlot();
      }
    });
	   
    $scope.showPlot = function() {
      if(!$scope.shownPlot) {
        $scope.info = "process(es)";
        $scope.width = 1000;
        $scope.processesStartEnd = DataFactory.processesStartEnd;
        $scope.times = [{distribution:"weekly"},{distribution: "dayly"}];
        $scope.time = $scope.times[0];

        $scope.views = [{parameter: "startingTime"}, {parameter: "endingTime"}];
        $scope.view = $scope.views[0];
        
        DataFactory.getProcessesStartEnd()
        .then(function () {
          $scope.processesStartEnd = DataFactory.processesStartEnd;
          var timeString = ($scope.time.distribution =="dayly")?"24h":"Week";
          $scope.data=Format.bringSortedDataInPlotFormat($scope.processesStartEnd,"key",$scope.view.parameter,"",eval("Format.breakDateDownTo"+timeString),"");   
        });

        //maybe outsource all the formatting in an extra service
        $scope.drawStartEndTimeGraph = function() {
          var timeString = ($scope.time.distribution=="dayly")?"24h":"Week";
          $scope.data=Format.bringSortedDataInPlotFormat($scope.processesStartEnd,"key",$scope.view.parameter,"",eval("Format.breakDateDownTo"+timeString),"");

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



