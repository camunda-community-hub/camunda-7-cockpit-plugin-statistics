ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {
	module.controller('pieChartCtrl',['$scope', '$element', 'Uri', 'DataFactory', 'SettingsFactory', '$http', '$modal', '$interval', 
	                                  function($scope, element, Uri, DataFactory, SettingsFactory, $http,$modal, $interval){
	  
	  $scope.drilledInRunning = false;
	  $scope.drilledInEnded = false;
	  $scope.runningProcInstances = [];
	  $scope.endedProcInstances = [];
	  
	  $scope.processInstanceCounts = [];
	  
	  $scope.myPlotsPluginSettings = null;
	  $scope.showRefreshIcon = false;
	  $scope.showApplyChangesAlert = false;
	  $scope.showPlotDescriptions = false;
	  $scope.showReloadProcess = false;
	  $scope.widthClass = "span4";
	  
	  $scope.cacheKiller = null;
    
    $scope.showPlotSettings = false;
	  
	  $scope.runningPlotLabel = "Running Instances";
	  $scope.endedPlotLabel = "Ended Instances";
	  $scope.failedPlotLabel = "Failed Instances";
	  
    $scope.$on('chosenTabChangedBroadcast', function() {
      if(DataFactory.chosenTab=="overview") {
        $scope.applyDataToPlots();
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
        console.debug("stopping cache killer...");
        $scope.stopCacheKiller();
      }
    });
    
    $scope.stopCacheKiller = function() {
      
      /*
       * stop interval execution
       */
      
      $interval.cancel($scope.cacheKiller);
    }
     
		$scope.options = {
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
		     default:
		       break;
		  }

		  
		};
		
		function drillOut(event, plot) {
		  switch(plot) {
        case "running":
          $scope.running = $scope.runningProcInstances;
          $scope.options.chart.tooltipContent = function(key, y, e, graph){
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
        default:
          break;
		  }
		  
		}
		
		function refreshRunning(newDataArray) {
		  var newRunning = [];
		  for(i in newDataArray){
		    if(newDataArray[i].count) {
		      newRunning.push({"key":newDataArray[i].activityName,"y":newDataArray[i].count, "delegated":newDataArray[i].delegated, "assigned":newDataArray[i].assigned});
		    }
		  }
		  
		  $scope.running = newRunning;
		  $scope.options.chart.tooltipContent = function(key, y, e, graph){
        return '<h3>' + key + '</h3>' +
        '<p>count:<b>' +  y + '</b><br/>assigned:<b>'+
        e.point.assigned+
        '</b><br/>delegated:<b>'+
        e.point.delegated+
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
          (e.point.avg/1000).toFixed(2)+
          's</b><br/>minimal Duration:<b>'+
          (e.point.min/1000).toFixed(2)+
          's</b><br/>maximal Duration:<b>'+
          (e.point.max/1000).toFixed(2)+
          's</b></p>'
        }
		}

		$scope.endedOptions = {
	            chart: {
	                type: 'pieChart',
	                height: 500,
	                x: function(d){return d.key;},
	                y: function(d){return d.y;},
	                showLabels: true,
	                transitionDuration: 1500,
	                labelThreshold: 0.01,
	                tooltips: true,
	                pie: {   
	                  dispatch: {   
	                    elementClick: function(t, u) {
	                      if(!$scope.drilledInEnded) {
	                        $scope.$apply(function() {
	                          drillIn(t, "ended");
	                        });
	                      } else {
	                        $scope.$apply(function() {
	                          drillOut(t, "ended");
	                        });
	                      }
	                      
	                    }
	                  }
	                },
	                tooltipContent: function(key, y, e, graph){
      	    				return '<h3>' + key + '</h3>' +
      	    				'<p>count:<b>' +  y + '</b><br/>average Duration:<b>'+
      	    				(e.point.avg/1000/60).toFixed(2)+
      	    				' min</b><br/>minimal Duration:<b>'+
      	    				(e.point.min/1000/60).toFixed(2)+
      	    				' min</b><br/>maximal Duration:<b>'+
      	    				(e.point.max/1000/60).toFixed(2)+
      	    				' min</b></p>'
      	    				},
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
				
		function assingDataToPlot($scope, processInstanceCounts) {
		  
		  $scope.processInstanceCounts = processInstanceCounts;
		  
		  var countPlot = 0;
		  
		  if($scope.myPlotsPluginSettings.runningPI.toPlot) {
        countPlot++;
		  }
		  if($scope.myPlotsPluginSettings.endedPI.toPlot) {
        countPlot++;
      }
		  if($scope.myPlotsPluginSettings.failedPI.toPlot) {
        countPlot++;
      }

		  
			var r=[],e=[],f=[];
			
			for(i in processInstanceCounts){
			  if($scope.myPlotsPluginSettings.runningPI.toPlot) {
			    if(processInstanceCounts[i].runningInstanceCount) {
            if($scope.myPlotsPluginSettings.runningPI.keysToSkip.indexOf(processInstanceCounts[i].processDefinitionKey)==-1) {
              r.push({"key":processInstanceCounts[i].processDefinitionKey,"y":processInstanceCounts[i].runningInstanceCount});
            }
			    }
			  }
				if($scope.myPlotsPluginSettings.endedPI.toPlot) {
				  if(processInstanceCounts[i].endedInstanceCount) {
	          if($scope.myPlotsPluginSettings.endedPI.keysToSkip.indexOf(processInstanceCounts[i].processDefinitionKey)==-1) {
	            e.push({"key":processInstanceCounts[i].processDefinitionKey,
	              "y":processInstanceCounts[i].endedInstanceCount,
	              "avg":processInstanceCounts[i].duration,
	              "min":processInstanceCounts[i].minDuration,
	              "max":processInstanceCounts[i].maxDuration});
	          }
	        }
				}
				if($scope.myPlotsPluginSettings.failedPI.toPlot) {
			    if($scope.myPlotsPluginSettings.failedPI.keysToSkip.indexOf(processInstanceCounts[i].processDefinitionKey)==-1) {
			      f.push({"key":processInstanceCounts[i].processDefinitionKey,"y":processInstanceCounts[i].failedInstanceCount});
			    }
				}
			}
			
			$scope.runningProcInstances = r;
			$scope.running = r;
			
			$scope.endedProcInstances = e;
			$scope.ended = e;
			
			$scope.failed = f;

		}
		
		
		$scope.applyDataToPlots = function() {
		  
		  if($scope.showApplyChangesAlert) {
		    $scope.showApplyChangesAlert = false;
		  }
		  
		  if($scope.showInitialLoadButton) {
        $scope.showInitialLoadButton = false;
      }
		  
		  $scope.showReloadProcess = true;
		  
		  
		  
		  /*
		   * get data and apply to plots
		   */
		  
      DataFactory
      .getAllProcessInstanceCountsByState()
      .then(function() {
        
        $scope.showReloadProcess = false;
        $scope.showPlotDescriptions = true;
        assingDataToPlot($scope, DataFactory.allProcessInstanceCountsByState["data"]);
        
        
      });
		  
      if($scope.cacheKiller) {
        $scope.stopCacheKiller();
      }
		  
		  /*
		   * start interval function for cache deletion
		   */
		  
//		  $scope.cacheKiller = $interval(function() {
//		    console.log("killing cache...");
//		    console.log("before:");
//		    console.log(DataFactory.allProcessInstanceCountsByState["data"]);
//		    DataFactory.allProcessInstanceCountsByState["data"] = {};
//		    console.log("afterwards:");
//        console.log(DataFactory.allProcessInstanceCountsByState["data"]);
//        
//		  }, $scope.myPlotsPluginSettings.cacheExpirationInMillis);
		  
		}
		
    $(document).mouseup(function (e)
        {
            var container = $("#tooltipRunning");
            if (!container.is(e.target) // if the target of the click isn't the container...
                && container.has(e.target).length === 0) // ... nor a descendant of the container
            {
                container.hide();
            }
    });

	}])
});