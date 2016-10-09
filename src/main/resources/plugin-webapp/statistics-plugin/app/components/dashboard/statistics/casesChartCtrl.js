ngDefine('cockpit.plugin.statistics-plugin.dashboard', function(module) {
	module.controller('casesChartCtrl',['$scope', '$element', 'Uri', 'DataFactory', 'SettingsFactory', '$http', '$modal', '$interval', 
	                                  function($scope, element, Uri, DataFactory, SettingsFactory, $http,$modal, $interval){
	  
	  /*
	   * drill levels
	   */
	  
	   var drillLevels = ["case", "activity", "activityDetails"];
	  
	  /*
	   * 2 drill levels 
	   */
	  
	   
    $scope.drillLevelCompleted = drillLevels[0];
	  $scope.drilledInCompleted = false;
	  
	  $scope.drilledInTerminated = false;
	  
	  /*
	   * 3 drill levels  (case, activity, activityDetails)
	   * TODO: provide manual drillout apart from clicking on non human tasks (what if no available?)
	   */

	  
	  $scope.drillLevelActive = drillLevels[0];
	  $scope.drilledInActive = false;

	  
	  /*
	   * level of detail: case instance level
	   */
	  $scope.availableCaseInstances = [];
	  $scope.enabledCaseInstances = [];
	  $scope.activeCaseInstances = [];
	  $scope.milestonesCaseInstances = [];
	  $scope.completedCaseInstances = [];
	  $scope.terminatedCaseInstances = [];
	  $scope.processInstanceCounts = [];
	  
	  /*
     * level of detail: case activity instance level
     */
	  $scope.availableCaseActivityInstances = [];
	  $scope.enabledCaseActivityInstances = [];
    $scope.activeCaseActivityInstances = [];
    $scope.milestonesCaseActivityInstances = [];
    $scope.completedCaseActivityInstances = [];
    $scope.terminatedCaseActivityInstances = [];
    $scope.processInstanceCounts = [];
    
    /*
     * level of detail: details of case activity (human task)
     */
    
    $scope.currentCaseActivityDetails = [];
    
    /*
     * currently showing in plot
     */
    
    $scope.availablePlot = [];
    $scope.enabledPlot = [];
    $scope.activePlot = [];
    $scope.milestonesPlot = [];
    $scope.completedPlot = [];
    $scope.terminatedPlot = [];
	  
	  $scope.myPlotsPluginSettings = null;
	  $scope.showRefreshIcon = false;
	  $scope.showApplyChangesAlert = false;
	  $scope.showPlotDescriptions = false;
	  $scope.reload = {
	      showReloadCasesAvailable:false,
	      showReloadCasesEnabled:false,
	      showReloadCasesActive:false,
	      showReloadCasesMilestones:false,
	      showReloadCasesCompleted:false,
	      showReloadCasesTerminated:false
	  };
	  $scope.widthClass = "col-lg-4";
	  
	  $scope.cacheKiller = null;
    
    $scope.showPlotSettings = false;
	  
	  $scope.availablePlotLabel = "Case instances with available Activities";
	  $scope.enabledPlotLabel = "Case instances with enabled Activities";
	  $scope.activePlotLabel = "Case instances with active Activities";
	  $scope.milestonesPlotLabel = "Case instances with reached Milestones";
	  $scope.completedPlotLabel = "Case instances with completed Activities";
	  $scope.terminatedPlotLabel = "Case instances with terminated Activities";
	  
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
                      if($scope.drillLevelActive==drillLevels[0]) {
                        $scope.$apply(function() {
                          drillIn(t.point.defId, t.point.shortDefId, "active");
                        });
                      } else if($scope.drillLevelActive==drillLevels[1] && t.point.type && t.point.type=="humanTask") {
                        
                        drillInHumanTask(t);
                        
                      } else  {
                        $scope.$apply(function() {
                          if($scope.drillLevelActive==drillLevels[1]) {
                            drillOutToCaseDetails();
                          } else if($scope.drillLevelActive==drillLevels[2]) {
                            drillOutToActivityDetails();
                          }
                        });
                      }
                      
                    }
                  }
                },
                tooltips: true,
                noData:"No Case Activities met the requirements",
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
    
    $scope.availableOptions = angular.copy(options);
    $scope.enabledOptions = angular.copy(options);
    $scope.activeOptions = angular.copy(options);
    $scope.milestonesOptions = angular.copy(options);
    
    $scope.terminatedOptions = angular.copy(options);
    $scope.terminatedOptions.chart.pie.dispatch.elementClick = function(t, u) {
      if(!$scope.drilledInTerminated) {
        $scope.$apply(function() {
          drillIn(t.point.defId, t.point.shortDefId,"terminated");
        });
      } else {
        $scope.$apply(function() {
          drillOut(t.point.defId, t.point.shortDefId,"terminated");
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
      
      if($scope.drillLevelCompleted==drillLevels[0]) {
        $scope.$apply(function() {
          drillIn(t.point.defId, t.point.shortDefId, "completed");
        });
      } else  {
        $scope.$apply(function() {
          if($scope.drillLevelCompleted==drillLevels[1]) {
            drillOutToCaseDetails("completed");
          } 
        });
      }
      
    };
    
   
    function drillOut(event, plot) {
      switch(plot) {
        case "active":
          $scope.drillOutActive();
          break;
        case "completed":
          $scope.drillOutCompleted();
          break;
        case "terminated":
        //TODO
          break;
        default:
          break;
      }
      
    }
    
    /*
     * although active query function that already delivers aggregated information (including historic)
     */
    var drillIn = function(caseDefinitionId, shortDefinitionId, typeOfPlot) {
    
      console.debug("drillIn called:");
      console.debug(caseDefinitionId);
      console.debug(typeOfPlot);
      
      DataFactory.getHistoricCaseActivityInstanceDetailsAggregatedByCasedDefinitionId(caseDefinitionId)
      .then(function() {
        
        var data = DataFactory.historicCaseActivityInstanceDetailsAggregatedByCasedDefinitionId[caseDefinitionId];

        if(data) {
          
          switch(typeOfPlot) {
            case "active":
              drillInActive(data, caseDefinitionId);
              break;
            case "completed":
              drillInCompleted(data, caseDefinitionId);
              break;
          }

        }
      });
    }
    
    var drillInActive = function(data, caseDefinitionId) {
      
      var newRunning = [];
      
      for(i in data) {
        switch (data[i].activityType) {
        case "humanTask":
          if(data[i].active && data[i].active>0) {
            newRunning.push({"key":data[i].activityName,"y":data[i].active, "type":data[i].activityType, "taskDefinitionKey":data[i].taskDefinitionKey});
          }
          break;
        case "processTask":
          if(data[i].active && data[i].active>0) {
            newRunning.push({"key":data[i].activityName,"y":data[i].active, "type":data[i].activityType});
          }
          break;
        case "caseTask":
          if(data[i].active && data[i].active>0) {
            newRunning.push({"key":data[i].activityName,"y":data[i].active, "type":data[i].activityType});
          }
          break;
        //TODO -> add for 
        default:
          break;
        }
        
      }
      
      $scope.activeCaseActivityInstances = newRunning;
      $scope.activePlot = newRunning;
      
      
      $scope.activeOptions.chart.tooltipContent = function(key, y, e, graph){
        return '<h3>' + key + '</h3>' +
        '<p>count:<b>' +  y + '</b><br/>type:<b>'+
        e.point.type+
        '</b></p>'
      };
      
      $scope.activePlotLabel="Active Activities in '"+caseDefinitionId+"...'";
      $scope.drillLevelActive = drillLevels[1];
      
    }
    
    var drillInCompleted = function(data,caseDefinitionId) {
      
      var newCompleted = [];
      
      for(i in data) {
          if(data[i].completed && data[i].completed>0) {
            newCompleted.push({"key":data[i].activityName,"y":data[i].completed, "type":data[i].activityType, "taskDefinitionKey":data[i].taskDefinitionKey,
              "avg":data[i].meanDuration, "min":data[i].minDuration, "max":data[i].maxDuration, "shortDefId":data[i].shortDefinitionId});
          }
      }
      
      $scope.completedCaseActivityInstances = newCompleted;
      $scope.completedPlot = newCompleted;
      
      
      $scope.completedOptions.chart.tooltipContent = function(key, y, e, graph){
        
        return '<h3>' + key + '</h3>' +
        '<p>count:<b>' +  y + '</b><br/>' +  e.point.type + '<br/>average Duration:<b>'+
        (e.point.avg/1000/60).toFixed(2)+
        ' min</b><br/>minimal Duration:<b>'+
        (e.point.min/1000/60).toFixed(2)+
        ' min</b><br/>maximal Duration:<b>'+
        (e.point.max/1000/60).toFixed(2)+
        ' min</b></p>'
        
      };
      
      $scope.completedPlotLabel="Completed Activities in '"+data[i].shortCaseDefinitionId+"...'";
      $scope.drillLevelCompleted = drillLevels[1];
      $scope.drilledInCompleted = true;
      
    }

    
    var drillInHumanTask = function(event) {
      $scope.drillLevelActive = drillLevels[2];
      DataFactory.getRunningTaskInstancesByTaskDefinitionKey(event.point.taskDefinitionKey)
      .then(function(){
        
        var data = DataFactory.runningTaskInstancesByTaskDefinitionKey[event.point.taskDefinitionKey];
        var result = [];
        var freeExisting = false;
        
        if(data.count-data.assigned>0) {
          freeExisting = true;
        }
        
        if(freeExisting) {
          result.push({"key":data.name,"y":data.count, "assigned":data.assigned, "free":data.count-data.assigned});
        } else {
          result.push({"key":data.name,"y":data.count, "assigned":data.assigned});
        }

        $scope.currentCaseActivityDetails = result;
        $scope.activePlot = result;
        $scope.activeOptions.chart.tooltipContent = function(key, y, e, graph){
          if(freeExisting) {
            return '<h3>' + key + '</h3>' +
            '<p>count:<b>' +  y + '</b><br/>assigned:<b>'+
            e.point.assigned+
            '</b><br/>free:<b>'+
            e.point.free+
            '</b></p>'
          } else {
            return '<h3>' + key + '</h3>' +
            '<p>count:<b>' +  y + '</b><br/>assigned:<b>'+
            e.point.assigned+
            '</b></p>'
          }
          
        };
        
        $scope.activePlotLabel="Details of '"+data.name+"'";
        
      });
    }
    
    var drillOutToCaseDetails = function(plotType) {
      
      switch (plotType) {
      case "active":
        $scope.activePlot = $scope.activeCaseInstances;
        $scope.activeOptions.chart.tooltipContent = function(key, y, e, graph){
          return '<h3>' + key + '</h3>' +
          '<p>count:<b>' +  y + '</b></p>'
          };
        $scope.activePlotLabel="Case instances with active Activities";
        $scope.drillLevelActive = drillLevels[0];
        break;
      case "completed":
        
        console.log("called completed drill out");
        $scope.completedPlot = $scope.completedCaseInstances;
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
        
        $scope.completedPlotLabel="Case instances with completed Activities";
        $scope.drillLevelCompleted = drillLevels[0];
        break;
        
      default:
        break;
      }

    }
    
    var drillOutToActivityDetails = function() {
      $scope.activePlot = $scope.activeCaseActivityInstances;
      $scope.activeOptions.chart.tooltipContent = function(key, y, e, graph){
        return '<h3>' + key + '</h3>' +
        '<p>count:<b>' +  y + '</b></p>'
        };
      $scope.activePlotLabel="Active Activities of Case Def..";
      $scope.drillLevelActive = drillLevels[1];
    }

    $scope.applyDataToPlots = function() {
      
      
      var availableCases = [];
      var enabledCases = [];
      var activeCases = [];
      var milestonesCases = [];
      var completedCases = [];
      var terminatedCases = [];
      
      
      if($scope.showApplyChangesAlert) {
        $scope.showApplyChangesAlert = false;
      }
      
      if($scope.showInitialLoadButton) {
        $scope.showInitialLoadButton = false;
      }

      $scope.reload.showReloadCasesAvailable = true;
      $scope.reload.showReloadCasesEnabled = true;
      $scope.reload.showReloadCasesActive = true;
      $scope.reload.showReloadCasesMilestones = true;      
      $scope.reload.showReloadCasesCompleted = true;
      $scope.reload.showReloadCasesTerminated = true;

      
      DataFactory.getHistoricCaseActivityInstanceDetailsAggregatedByCasedDefinitionId()
      .then(function() {
        
        var data = DataFactory.historicCaseActivityInstanceDetailsAggregatedByCasedDefinitionId["data"];
        for(i in data) {
          console.log(data[i]);
          if(data[i].available) {
            availableCases.push({"key":data[i].shortDefinitionId,"y":data[i].available, "defId":data[i].caseDefinitionId, "shortDefId":data[i].shortDefinitionId});
          }
          if(data[i].enabled) {
            enabledCases.push({"key":data[i].shortDefinitionId,"y":data[i].enabled, "defId":data[i].caseDefinitionId, "shortDefId":data[i].shortDefinitionId});
          }
          if(data[i].active) {
            activeCases.push({"key":data[i].shortDefinitionId,"y":data[i].active, "defId":data[i].caseDefinitionId, "shortDefId":data[i].shortDefinitionId});
          }
          if(data[i].milestones) {
            milestonesCases.push({"key":data[i].shortDefinitionId,"y":data[i].milestones, "defId":data[i].caseDefinitionId, "shortDefId":data[i].shortDefinitionId});
          }
          if(data[i].completed) {
            completedCases.push({"key":data[i].shortDefinitionId,"y":data[i].completed, "defId":data[i].caseDefinitionId,
                "avg":data[i].meanDuration, "min":data[i].minDuration, "max":data[i].maxDuration, "shortDefId":data[i].shortDefinitionId});
          }
          if(data[i].terminated) {
            terminatedCases.push({"key":data[i].shortDefinitionId,"y":data[i].terminated, "defId":data[i].caseDefinitionId, "shortDefId":data[i].shortDefinitionId});
          }
        }

        $scope.availableCaseInstances = availableCases;
        $scope.availablePlot = availableCases;
        
        $scope.enabledCaseInstances = enabledCases;
        $scope.enabledPlot = enabledCases;
        
        $scope.activeCaseInstances = activeCases;
        $scope.activePlot = activeCases;
        
        $scope.milestonesCaseInstances = milestonesCases;
        $scope.milestonesPlot = milestonesCases;
        
        $scope.completedCaseInstances = completedCases;
        $scope.completedPlot = completedCases;
        
        $scope.terminatedCaseInstances = terminatedCases;
        $scope.terminatedPlot = terminatedCases;
        
        
        $scope.reload.showReloadCasesAvailable = false;
        $scope.reload.showReloadCasesEnabled = false;
        $scope.reload.showReloadCasesActive = false;
        $scope.reload.showReloadCasesMilestones = false;
        $scope.reload.showReloadCasesCompleted = false;
        $scope.reload.showReloadCasesTerminated = false;
        
        
      });
      
//      DataFactory.getHistoricCaseInstanceDetailsAggregatedByCasedDefinitionId()
//        .then(function() {
//          var data = DataFactory.historicCaseInstanceDetailsAggregatedByCasedDefinitionId;
//          for(i in data) {
//            if(data[i].active) {
//              runningCases.push({"key":data[i].definitionId.substring(0,10)+"...","y":data[i].active, "defId":data[i].definitionId});
//            }
//            if(data[i].completed) {
//              completedCases.push({"key":data[i].definitionId.substring(0,10)+"...","y":data[i].completed, "defId":data[i].definitionId});
//            }
//            if(data[i].terminated) {
//              terminatedCases.push({"key":data[i].definitionId.substring(0,10)+"...","y":data[i].terminated, "defId":data[i].definitionId});
//            }
//          }
//          
//          $scope.activeCaseInstances = runningCases;
//          $scope.activePlot = runningCases;
//          $scope.completedCaseInstances = completedCases;
//          $scope.completedPlot = completedCases;
//          $scope.terminatedCaseInstances = terminatedCases;
//          $scope.terminatedPlot = terminatedCases;
//          
//          
//          $scope.reload.showReloadCasesAvailable = false;
//          $scope.reload.showReloadCasesEnabled = false;
//          $scope.reload.showReloadCasesActive = false;
//          $scope.reload.showReloadCasesMilestones = false;
//          $scope.reload.showReloadCasesCompleted = false;
//          $scope.reload.showReloadCasesTerminated = false;
//        });
    }
    
	}])
});