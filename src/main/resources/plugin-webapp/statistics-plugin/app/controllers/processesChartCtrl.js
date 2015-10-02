ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {
	module.controller('processesChartController',['$scope', '$element', 'Uri', 'DataFactory', 'SettingsFactory', 'UserInteractionFactory', '$http', '$modal', '$interval', '$window',
	                                  function($scope, element, Uri, DataFactory, SettingsFactory, UserInteractionFactory, $http,$modal, $interval, $window){
	  
	  $scope.drilledInRunning = false;
	  $scope.drilledInEnded = false;
	  $scope.drilledInIncidents = false;
	  
	  $scope.runningProcInstances = [];
	  $scope.endedProcInstances = [];
	  $scope.incidentsProcInstances = [];
	  $scope.processInstanceCounts = [];
	  
	  $scope.myPlotsPluginSettings = null;
	  $scope.showRefreshIcon = false;
	  $scope.showApplyChangesAlert = false;
	  $scope.showPlotDescriptions = false;
	  $scope.reload = {
	      showReloadProcessRunning:false,
	      showReloadProcessEnded:false,
	      showReloadProcessFailed:false
	  };
	  
	  $scope.widthClass = "col-lg-4 col-md-4 col-sm-4";
	  $scope.plotHeight = 500;
	  
	  $scope.cacheKiller = null;
    
    $scope.showPlotSettings = false;
	  
	  $scope.runningPlotLabel = "Running Instances";
	  $scope.endedPlotLabel = "Ended Instances";
	  $scope.failedPlotLabel = "Instances with Incidents";
	  
	  
	  $scope.$on('heightChanged', function() {
	    changePlotsHeight();
	  });
	  
    $scope.$on('chosenTabChangedBroadcast', function() {
      if(DataFactory.chosenTab=="processes") {
        if($scope.myPlotsPluginSettings) {
          if($scope.drilledInEnded) {
            drillOut("", "ended");
          }
          if($scope.drilledInIncidents) {
            drillOut("", "incidents");
          }
          if($scope.drilledInRunning) {
            drillOut("", "running");
          }
          $scope.applyDataToPlots();
        }
      }
    });
    
    $scope.$on('pluginSettingsChanged', function() {
      
      /*
       * gets called every time settings are changing, includes first time
       * By that, plots will be rendered with the right settings
       */
      
      
           
      if($scope.myPlotsPluginSettings!=SettingsFactory.pluginSettings.overview) {
        
       
        if( ($scope.myPlotsPluginSettings==null) && !SettingsFactory.pluginSettings.overview.loadOnTabLoad) {
          
          $scope.myPlotsPluginSettings = SettingsFactory.pluginSettings.overview;
          // first call after full reload // initial request
          $scope.showInitialLoadButton = true;
          
        } else {
          
          $scope.myPlotsPluginSettings = SettingsFactory.pluginSettings.overview;
          
          if($scope.myPlotsPluginSettings.loadOnTabLoad) {
            
            //just do the reload
            $scope.applyDataToPlots();
            $scope.showPlotDescriptions = true;
            
          } else {
            
            /*
             * settings have changed, show "apply changes / load data button"
             * TODO : switch if first or latter settings fresh
             */
            
             $scope.showApplyChangesAlert = true;
            
          }
        }

      }
      
    });
    
    $scope.$on('destroy', function(){
      if($scope.cacheKiller) {
        $scope.stopCacheKiller();
      }
    });
    
    $scope.stopCacheKiller = function() {
      
      /*
       * stop interval execution
       */
      
      $interval.cancel($scope.cacheKiller);
    }


    var changePlotsHeight = function() {
      $scope.runningOptions.chart.height = UserInteractionFactory.plotHeight;
      $scope.failedOptions.chart.height = UserInteractionFactory.plotHeight;
      $scope.endedOptions.chart.height = UserInteractionFactory.plotHeight;
    }
    

    /*
     * general pie charts options
     */
     
		var options = {
            chart: {
                type: 'pieChart',
                height: UserInteractionFactory.plotHeight,
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
                      if(!$scope.drilledInRunning) {
                        $scope.$apply(function() {
                          drillIn(t, "running");
                        });
                      } else {
                        $scope.$apply(function() {
                          drillOut(t, "running");
                        });
                      }
                      
                    }
                  }
                },
                tooltips: true,
                noData:"No process instances met the requirements",
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
		
		$scope.runningOptions = angular.copy(options);
		
    $scope.failedOptions = angular.copy(options);
    $scope.failedOptions.chart.pie.dispatch.elementClick = function(t, u) {
      if(!$scope.drilledInIncidents) {
        $scope.$apply(function() {
          drillIn(t, "incidents");
        });
      } else {
        $scope.$apply(function() {
          drillOut(t, "incidents");
        });
      }
    };
		
    $scope.endedOptions = angular.copy(options);
    $scope.endedOptions.chart.tooltipContent = function(key, y, e, graph){
      
      return '<h3>' + key + '</h3>' +
      '<p>count:<b>' +  y + '</b><br/>average Duration:<b>'+
      (e.point.avg/1000/60).toFixed(2)+
      ' min</b><br/>minimal Duration:<b>'+
      (e.point.min/1000/60).toFixed(2)+
      ' min</b><br/>maximal Duration:<b>'+
      (e.point.max/1000/60).toFixed(2)+
      ' min</b></p>'
      
    };
    
    $scope.endedOptions.chart.pie.dispatch.elementClick = function(t, u) {
      
      if(!$scope.drilledInEnded) {
        $scope.$apply(function() {
          drillIn(t, "ended");
        });
      } else {
        $scope.$apply(function() {
          drillOut(t, "ended");
        });
      }
      
    };
    
		function drillIn(event, plot) {
		  
		  switch(plot) {
		    case "running":
		      DataFactory
		      .getAggregatedUserTasksByProcDefinition(event.label)
		      .then(function() {
		        if(DataFactory.aggregatedUsertasksByProcDef[event.point.key].length>0) {
		          refreshRunning(DataFactory.aggregatedUsertasksByProcDef[event.point.key]);
	            $scope.runningPlotLabel="Running User Tasks of '"+event.point.key+"'";
	            $scope.drilledInRunning=true;
		        } else {
		          alert('No running user tasks available for process definition '+event.point.key+'.');
		        }
		      });
		      break;
		    case "ended":
		      DataFactory
		      .getHistoricActivityCountsDurationByProcDefKey(event.point.key)
		      .then(function() {
		        if(DataFactory.historicActivityCountsDurationByProcDefKey[event.point.key].length>0) {
		          refreshEnded(DataFactory.historicActivityCountsDurationByProcDefKey[event.point.key]);
	            $scope.endedPlotLabel= "Ended Activities of '"+event.point.key+"'";
	            $scope.drilledInEnded=true;
		        } else {
		          alert('No finished activities available for process definition '+event.point.key+'.');
		        }
		      });
		      break;
		    case "incidents":
		      $scope.drilledInIncidents = true;
		      setIncidentsDetailsByProcessDefinitionKey(event.point.key);
		      $scope.failedPlotLabel = "Incidents of '"+event.point.key+"'";
		      break;
		     default:
		       break;
		  }

		  
		};
		
		function drillOut(event, plot) {
		  switch(plot) {
        case "running":
          $scope.running = $scope.runningProcInstances;
          $scope.runningOptions.chart.tooltipContent = function(key, y, e, graph){
            return '<h3>' + key + '</h3>' +
            '<p>count:<b>' +  y + '</b></p>'
            };
          $scope.runningPlotLabel="Running Instances";
          $scope.drilledInRunning = false;
          break;
        case "ended":
          $scope.ended = $scope.endedProcInstances;
          $scope.endedOptions.chart.tooltipContent = function(key, y, e, graph){
            return '<h3>' + key + '</h3>' +
            '<p>count:<b>' +  y + '</b><br/>average Duration:<b>'+
            (e.point.avg/1000/60).toFixed(2)+
            ' min</b><br/>minimal Duration:<b>'+
            (e.point.min/1000/60).toFixed(2)+
            ' min</b><br/>maximal Duration:<b>'+
            (e.point.max/1000/60).toFixed(2)+
            ' min</b></p>'
            };
          $scope.endedPlotLabel = "Ended Instances";
          $scope.drilledInEnded=false;
          break;
        case "incidents":
          $scope.failedPlotLabel = "Instances with incidents";
          $scope.failed = $scope.incidentsProcInstances;
          $scope.drilledInIncidents=false;
          break;
        default:
          break;
		  }
		  
		}
		
		function refreshRunning(newDataArray) {
		  var newRunning = [];
		  for(i in newDataArray){
		    if(newDataArray[i].count) {
		      newRunning.push({"key":newDataArray[i].activityName,"y":newDataArray[i].count, "assigned":newDataArray[i].assigned});
		    }
		  }
		  
		  $scope.running = newRunning;
		  $scope.runningOptions.chart.tooltipContent = function(key, y, e, graph){
        return '<h3>' + key + '</h3>' +
        '<p>count:<b>' +  y + '</b><br/>assigned:<b>'+
        e.point.assigned+
        '</b></p>'
        };
      
		}
		
		function refreshEnded(newDataArray) {
		  var activitiesToPlotForPieChart=[];
      for(i in newDataArray){
        if(newDataArray[i].count) {
          activitiesToPlotForPieChart.push({
            "key":newDataArray[i].activityName,
            "y":newDataArray[i].count,
            "type":newDataArray[i].type,
            "avg":newDataArray[i].avgDuration,
            "min":newDataArray[i].minDuration,
            "max":newDataArray[i].maxDuration
            });               
         }
        }
      $scope.ended = activitiesToPlotForPieChart;
      $scope.endedOptions.chart.tooltipContent = function(key, y, e, graph){
          return '<h3>' + key + '</h3>' +
          '<p>count:<b>' +  y + '</b><br/>type:<b>'+
          e.point.type+ 
          '</b><br/>average Duration:<b>'+
          (e.point.avg/1000/60).toFixed(2)+
          'min</b><br/>minimal Duration:<b>'+
          (e.point.min/1000/60).toFixed(2)+
          'min</b><br/>maximal Duration:<b>'+
          (e.point.max/1000/60).toFixed(2)+
          'min</b></p>'
        }
		}
				
	
		var setEndedPlotData = function(endedData) {
		  
		  var e = [];
		  
      for(var i=0; i<endedData.length; i++){
        if($scope.myPlotsPluginSettings.endedPI.toPlot) {
          if(endedData[i].y) {
            if($scope.myPlotsPluginSettings.endedPI.keysToSkip.indexOf(endedData[i].key)==-1) {
              e.push({"key":endedData[i].key,
                "y":endedData[i].y,
                "avg":endedData[i].avg,
                "min":endedData[i].min,
                "max":endedData[i].max});
            }
          }
        }
      }
      
      $scope.endedProcInstances = e;
      $scope.ended = e;
      
		}
		
		var setRunningPlotData = function(runningData) {
		  
		  var r = [];
		  
		  for(key in runningData) {
		    if($scope.myPlotsPluginSettings.runningPI.toPlot) {
	        if(runningData.hasOwnProperty(key) && runningData[key]) {
	          if($scope.myPlotsPluginSettings.runningPI.keysToSkip.indexOf(key)==-1) {
	            r.push({"key":key,"y":runningData[key]});
	          }
	        }
	      }
		  }
		  
		  $scope.runningProcInstances = r;
      $scope.running = r;
      
		}
		
		var setIncidentPlotData = function(incidentData) {
		  
		  var f = [];
		  
		  for(key in incidentData) {
        if($scope.myPlotsPluginSettings.failedPI.toPlot) {
          if(incidentData.hasOwnProperty(key) && incidentData[key]) {
            if($scope.myPlotsPluginSettings.failedPI.keysToSkip.indexOf(key)==-1) {
              f.push({"key":key,"y":incidentData[key]});
            }
          }
        }
		  }
		  
		  $scope.incidentsProcInstances = f;
	    $scope.failed = f;  
	  
		  
		}
		
		var setIncidentsDetailsByProcessDefinitionKey = function(processDefinitionKey) {
		  
      DataFactory.getAllProcessInstanceRunningIncidentsCountOByProcDefRestApi()
      .then(function() {
        
        var data = DataFactory.processInstanceRunningIncidentsCountOByProcDefRestApi;

        var resultIncidentsByPDKey = {};
        
        for(i in data) {
          
          if(data[i].definition.key == processDefinitionKey) {
            
            /*
             * depends on version
             */
            if(data[i].incidents && data[i].incidents.length>0) {
              for(j in data[i].incidents) {
                
                if(!resultIncidentsByPDKey[data[i].incidents[j].incidentType]) {
                  resultIncidentsByPDKey[data[i].incidents[j].incidentType] = 0;
                }
                
                resultIncidentsByPDKey[data[i].incidents[j].incidentType]  = data[i].incidents[j].incidentCount;
              }
              
            }
           
          }
          
        }
        
        var f = [];
        
        for(key in resultIncidentsByPDKey) {
          if($scope.myPlotsPluginSettings.failedPI.toPlot) {
            if(resultIncidentsByPDKey.hasOwnProperty(key) && resultIncidentsByPDKey[key]) {
              if($scope.myPlotsPluginSettings.failedPI.keysToSkip.indexOf(key)==-1) {
                f.push({"key":key,"y":resultIncidentsByPDKey[key]});
              }
            }
          }
        }
        
        $scope.failed = f;
        
      })
		}
		
		
		
		$scope.applyDataToPlots = function() {
		  
		  
		  if($scope.showApplyChangesAlert) {
		    $scope.showApplyChangesAlert = false;
		  }
		  
		  if($scope.showInitialLoadButton) {
        $scope.showInitialLoadButton = false;
      }
		  
		  $scope.reload.showReloadProcessRunning = true;
		  $scope.reload.showReloadProcessEnded = true;
		  $scope.reload.showReloadProcessFailed = true;
		  
		  
		  
		  /*
		   * get data and apply to plots
		   */
		  
		  /*
		   * aggregated data for ended plot
		   */
		  
		  DataFactory
		  .getAggregatedEndedProcessInstanceInformationOrderedByProcessDefinitionKey()
		  .then(function(){
        $scope.reload.showReloadProcessEnded = false;
        $scope.showPlotDescriptions = true;
        setEndedPlotData(DataFactory.aggregatedEndedProcessInstanceInformationOrderedByProcessDefinitionKey["data"]);
		  });
      
      /*
       * data for running and incidents
       * TODO: failed jobs
       * 
       */
      
      DataFactory.getAllProcessInstanceRunningIncidentsCountOByProcDefRestApi()
      .then(function() {
        
        $scope.reload.showReloadProcessFailed = false;
        $scope.reload.showReloadProcessRunning = false;
        
        var data = DataFactory.processInstanceRunningIncidentsCountOByProcDefRestApi;
        
        var resultRunning = {};
        var resultIncidents = {};
        
        for(i in data) {
          
          if(!resultRunning[data[i].definition.key]) {
            resultRunning[data[i].definition.key]=0;
          }
          
          resultRunning[data[i].definition.key]+=data[i].instances;
          
          
          if(!resultIncidents[data[i].definition.key]) {
            resultIncidents[data[i].definition.key] = 0;
          }
            
          if(data[i].incidents && data[i].incidents.length>0) {
            for(j in data[i].incidents) {
              resultIncidents[data[i].definition.key]+=data[i].incidents[j].incidentCount;  
            }  
          }

          
        }
        
        setRunningPlotData(resultRunning);
        setIncidentPlotData(resultIncidents);
        
      });
		  
      if($scope.cacheKiller) {
        $scope.stopCacheKiller();
      }
		  		  
		}

	}])
});