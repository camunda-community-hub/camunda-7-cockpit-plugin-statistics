ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {
	module.controller('casesChartCtrl',['$scope', '$element', 'Uri', 'DataFactory', 'SettingsFactory', '$http', '$modal', '$interval', 
	                                  function($scope, element, Uri, DataFactory, SettingsFactory, $http,$modal, $interval){
	  
	  $scope.drilledInActive = false;
	  $scope.drilledInCompleted = false;
	  $scope.drilledInTerminated = false;
	  
	  /*
	   * level of detail: case instance level
	   */
	  $scope.runningCaseInstances = [];
	  $scope.completedCaseInstances = [];
	  $scope.terminatedCaseInstances = [];
	  $scope.processInstanceCounts = [];
	  
	  /*
     * level of detail: case activity instance level
     */
    $scope.runningCaseActivityInstances = [];
    $scope.completedCaseActivityInstances = [];
    $scope.terminatedCaseActivityInstances = [];
    $scope.processInstanceCounts = [];
    
    /*
     * currently showing in plot
     */
    
    $scope.runningPlot = [];
    $scope.completedPlot = [];
    $scope.terminatedPlot = [];
	  
	  $scope.myPlotsPluginSettings = null;
	  $scope.showRefreshIcon = false;
	  $scope.showApplyChangesAlert = false;
	  $scope.showPlotDescriptions = false;
	  $scope.reload = {
	      showReloadCasesRunning:false,
	      showReloadCasesCompleted:false,
	      showReloadCasesTerminated:false
	  };
	  $scope.widthClass = "col-lg-4";
	  
	  $scope.cacheKiller = null;
    
    $scope.showPlotSettings = false;
	  
	  $scope.activePlotLabel = "Active Instances";
	  $scope.completedPlotLabel = "Completed Instances";
	  $scope.terminatedPlotLabel = "Terminated Instances";
	  
    $scope.$on('chosenTabChangedBroadcast', function() {
      if(DataFactory.chosenTab=="cases") {
        $scope.applyDataToPlots();
      }
    });
    
    $scope.$on('pluginSettingsChanged', function() {
        //TODO!
    });
    
    /*
     * general pie charts options
     */
     
    var options = {
            chart: {
                type: 'pieChart',
                height: 500,
                x: function(d){return d.key;},
                y: function(d){return d.y;},
                showLabels: true,
                tooltipContent: function(key, y, e, graph){
                  return '<div id="tooltipRunning"><h3>' + key + '</h3>' +
                  '<p>count:<b>' +  y + '</b></p></div>';
                  },
                transitionDuration: 1500.0,
                labelThreshold: 0.01,
                pie: {   
                  dispatch: {   
                    elementClick: function(t, u) {
                      if(!$scope.drilledInActive) {
                        $scope.$apply(function() {
                          drillIn(t, "active");
                        });
                      } else {
                        $scope.$apply(function() {
                          drillOut(t, "active");
                        });
                      }
                      
                    }
                  }
                },
                tooltips: true,
                noData:"No Processes met the requirements",
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
    
    /*
     * overwrite respective attributes per plot
     */
    
    $scope.activeOptions = angular.copy(options);
    
    $scope.terminatedOptions = angular.copy(options);
    $scope.terminatedOptions.chart.pie.dispatch.elementClick = function(t, u) {
      if(!$scope.drilledInTerminated) {
        $scope.$apply(function() {
          drillIn(t, "terminated");
        });
      } else {
        $scope.$apply(function() {
          drillOut(t, "terminated");
        });
      }
    };
    
    $scope.completedOptions = angular.copy(options);
    $scope.completedOptions.chart.tooltipContent = function(key, y, e, graph){
      
      return '<h3>' + key + '</h3>' +
      '<p>count:<b>' +  y + '</b><br/>average Duration:<b>'+
      (e.point.avg/1000/60).toFixed(2)+
      ' min</b><br/>minimal Duration:<b>'+
      (e.point.min/1000/60).toFixed(2)+
      ' min</b><br/>maximal Duration:<b>'+
      (e.point.max/1000/60).toFixed(2)+
      ' min</b></p>'
      
    };
    
    $scope.completedOptions.chart.pie.dispatch.elementClick = function(t, u) {
      
      if(!$scope.drilledInCompleted) {
        $scope.$apply(function() {
          drillIn(t, "completed");
        });
      } else {
        $scope.$apply(function() {
          drillOut(t, "completed");
        });
      }
      
    };
    
    function drillIn(event, plot) {
      
      switch(plot) {
        case "active":
          $scope.drillInActive(event.point.defId);
          break;
        case "completed":
          $scope.drillInCompleted(event.point.defId);
          //TODO
          break;
        case "terminated":
          //TODO
          break;
         default:
          break;
      }

      
    };
    
    function drillOut(event, plot) {
      switch(plot) {
        case "active":
          $scope.drillOutActive();
          break;
        case "completed":
        //TODO
          break;
        case "terminated":
        //TODO
          break;
        default:
          break;
      }
      
    }
    
    
    $scope.drillInActive = function(caseDefinitionId) {
      DataFactory.getHistoricCaseActivityInstanceDetailsAggregatedByCasedDefinitionId(caseDefinitionId)
      .then(function() {
        var data = DataFactory.historicCaseActivityInstanceDetailsAggregatedByCasedDefinitionId[caseDefinitionId];
        if(data) {
          
          var newRunning = [];
          
          for(i in data) {
            switch (data[i].activityType) {
            case "milestone":
              newRunning.push({"key":data[i].activityName,"y":data[i].available, "type":data[i].activityType});
              break;
            case "humanTask":
              newRunning.push({"key":data[i].activityName,"y":data[i].active, "type":data[i].activityType});
              break;
            default:
              break;
            }
            
          }
          
          $scope.runningCaseActivityInstances = newRunning;
          $scope.runningPlot = newRunning;
          
          
          $scope.activeOptions.chart.tooltipContent = function(key, y, e, graph){
            return '<h3>' + key + '</h3>' +
            '<p>count:<b>' +  y + '</b><br/>type:<b>'+
            e.point.type+
            '</b></p>'
          };
          
          $scope.activePlotLabel="Active Activities in '"+caseDefinitionId.substring(0,10)+"...'";
          $scope.drilledInActive = true;
        }
      });
    }
    
    $scope.drillOutActive = function() {
      $scope.runningPlot = $scope.runningCaseInstances;
      $scope.activeOptions.chart.tooltipContent = function(key, y, e, graph){
        return '<h3>' + key + '</h3>' +
        '<p>count:<b>' +  y + '</b></p>'
        };
      $scope.activePlotLabel="Active Instances";
      $scope.drilledInActive = false;
    }
    
    $scope.drillInCompleted = function(caseDefinitionId) {
      DataFactory.getHistoricCaseActivityInstanceDetailsAggregatedByCasedDefinitionId(caseDefinitionId)
        .then(function() {
          var data = DataFactory.historicCaseActivityInstanceDetailsAggregatedByCasedDefinitionId[caseDefinitionId];
          if(data) {
            for(i in data) {
              console.log(data[i]);
            }
          }
        });
    }
    
    $scope.applyDataToPlots = function() {
      
      var runningCases = [];
      var completedCases = [];
      var terminatedCases = [];
      
      
      if($scope.showApplyChangesAlert) {
        $scope.showApplyChangesAlert = false;
      }
      
      if($scope.showInitialLoadButton) {
        $scope.showInitialLoadButton = false;
      }
      
      $scope.reload.showReloadCasesRunning = true;
      $scope.reload.showReloadCasesCompleted = true;
      $scope.reload.showReloadCasesTerminated = true;
      
      DataFactory.getHistoricCaseInstanceDetailsAggregatedByCasedDefinitionId()
        .then(function() {
          var data = DataFactory.historicCaseInstanceDetailsAggregatedByCasedDefinitionId;
          for(i in data) {
            if(data[i].active) {
              runningCases.push({"key":data[i].definitionId.substring(0,10)+"...","y":data[i].active, "defId":data[i].definitionId});
            }
            if(data[i].completed) {
              completedCases.push({"key":data[i].definitionId.substring(0,10)+"...","y":data[i].completed, "defId":data[i].definitionId});
            }
            if(data[i].terminated) {
              terminatedCases.push({"key":data[i].definitionId.substring(0,10)+"...","y":data[i].terminated, "defId":data[i].definitionId});
            }
          }
          
          $scope.runningCaseInstances = runningCases;
          $scope.runningPlot = runningCases;
          $scope.completedCaseInstances = completedCases;
          $scope.completedPlot = completedCases;
          $scope.terminatedCaseInstances = terminatedCases;
          $scope.terminatedPlot = terminatedCases;
          
          
          $scope.reload.showReloadCasesRunning = false;
          $scope.reload.showReloadCasesCompleted = false;
          $scope.reload.showReloadCasesTerminated = false;
        });
    }
    
	}])
});