ngDefine('cockpit.plugin.statistics-plugin.services', function(module) {
	module.factory('DataFactory', ['$http', 'Uri', '$rootScope', function($http, Uri, $rootScope) {

		var DataFactory = {};
		
		//TODO: DataFactory for process/case data, create ProcessDetailsFactory and CaseDetailsFactory

		/*
		 * process related data
		 */
		
		DataFactory.allProcessInstanceCountsByState = [];
		DataFactory.processesStartEnd = [];
		DataFactory.allRunningUserTasksCountOByProcDefKey = [];
		DataFactory.allEndedUserTasksCountOByProcDefKey = [];
		DataFactory.durations = [];
		DataFactory.historicActivityCountsDurationByProcDefKey = [];
		DataFactory.allUserTasksByProcDefKeyAndDateSpecification =[];
		DataFactory.allHistoricActivitiesInformationByProcDefKey = [];
		DataFactory.processDefWithFinishedInstances = [];
		DataFactory.aggregatedUsertasksByProcDef = [];
		DataFactory.processDefinitions = [];
		DataFactory.processInstanceRunningIncidentsCountOByProcDefRestApi = [];
		DataFactory.aggregatedEndedProcessInstanceInformationOrderedByProcessDefinitionKey = [];
		
		/*
		 * case related data
		 */
		
		/*
		 * includes counts on running and ended case definitions
		 */
		
		DataFactory.historicCaseInstanceDetailsAggregatedByCasedsDefinitionId = {};
		DataFactory.historicCaseActivityInstanceDetailsAggregatedByCasedDefinitionId = {};

		/*
		 * plugin related data
		 */
		
		DataFactory.chosenTab = "";

		DataFactory.prepForBroadcast = function(chosenTab) {
			this.chosenTab = chosenTab;
			this.broadcastItem();
		};
		
		DataFactory.broadcastItem = function() {
			$rootScope.$broadcast('chosenTabChangedBroadcast');
		};

		DataFactory.getAllProcessDefinitions = function() {
			return $http.get(Uri.appUri("plugin://statistics-plugin/:engine/process-definitions"))
			.success(function(data) {
				DataFactory.allProcessDefinitions = data;
			})
			.error(function(){
				console.debug("error in fetching process definitions");
			});
		};
		
		DataFactory.test = function(procDefKey) {
      console.debug("do http get..."+procDefKey);
      $http.get(Uri.appUri("plugin://statistics-plugin/:engine/process-instance-start-end"))
      .success(function (data){
        console.debug(data);
      })
      .error(function(){        
        console.debug("error in getting processes with start and end time");
      });
		}

		DataFactory.getAllRunningUserTasksCountOByProcDefKey = function() {
			return $http.get(Uri.appUri("plugin://statistics-plugin/:engine/running-user-tasks"))
			.success(function(data) {
				DataFactory.allRunningUserTasksCountOByProcDefKey = data;
			})
			.error(function(){
				console.debug("error in fetching running user tasks count ordered by proc def key");
			});
		}
		DataFactory.getAllEndedUserTasksCountOByProcDefKey = function() {
			return $http.get(Uri.appUri("plugin://statistics-plugin/:engine/ended-user-tasks"))
			.success(function(data) {
				DataFactory.allEndedUserTasksCountOByProcDefKey = data;
			})
			.error(function(){
				console.debug("error in fetching ended user tasks count ordered by proc def key");
			});
		}

		DataFactory.getAllHistoricActivitiesInformationByProcDefKey = function(procDefKey, activityName, activityType) {
			return $http.get(Uri.appUri("plugin://statistics-plugin/:engine/historic-activity-information?procDefKey="+procDefKey+"&activityName="+activityName+"&activityType="+activityType))
			.success(function(data) {
				if(procDefKey!=undefined) {
					DataFactory.allHistoricActivitiesInformationByProcDefKey[procDefKey] = data;
				} else {
					DataFactory.allHistoricActivitiesInformationByProcDefKey["data"] = data;
				}
			})
			.error(function(){
				console.debug("error in fetching historic activity information");
			});
		}


		DataFactory.activityInstanceCounts = function() {
			return $http.get(Uri.appUri("plugin://statistics-plugin/:engine/activity-instance"));
		};


		DataFactory.getAllProcessInstanceCountsByState = function(procDefKeyProc) {

			return $http.get(Uri.appUri("plugin://statistics-plugin/:engine/process-instance?procDefKey="+procDefKeyProc))
			.success(function(data) {
				if(procDefKeyProc!=undefined) {
					DataFactory.allProcessInstanceCountsByState[procDefKeyProc] = data;
				} else {
					DataFactory.allProcessInstanceCountsByState["data"] = data;
				}

			})
			.error(function(){
				console.debug("error in fetching process instance counts by state");
			});	


		};

		DataFactory.getHistoricActivityCountsDurationByProcDefKey = function(procDefKeyAct) {

			return $http.get(Uri.appUri("plugin://statistics-plugin/:engine/activity-instance?procDefKey="+procDefKeyAct))
			.success(function(data) {
				if(procDefKeyAct!=undefined) {
					DataFactory.historicActivityCountsDurationByProcDefKey[procDefKeyAct] = data;
				} else {
					DataFactory.historicActivityCountsDurationByProcDefKey["data"] = data;
				}
			})
			.error(function(){
				console.debug("error in fetching process instance counts by state and proc Def Key");
			});	


		};

		DataFactory.generateKeyAllUserTasksByProcDefKeyAndDateSpecification = function(procDefKey, dateSpec){
			var key = "";

			if(procDefKey!=undefined && dateSpec!=undefined) {
				key = ""+procDefKey+dateSpec;
			}
			if(procDefKey!=undefined && dateSpec==undefined) {
				key = ""+procDefKey;
			}
			if(procDefKey==undefined && dateSpec!=undefined) {
				key = ""+dateSpec;
			}
			if(procDefKey==undefined && dateSpec==undefined) {
				key = "data";
			}

			return key;
		};

		DataFactory.getAllUserTasksByProcDefKeyAndDateSpecification = function(procDefKey, dateSpec) {
			console.debug(procDefKey + dateSpec);
			return $http.get(Uri.appUri("plugin://statistics-plugin/:engine/all-user-tasks?procDefKey="+procDefKey+"&dateSpecifier="+dateSpec))
			.success(function(data) {
			  console.debug(data);
				var key = DataFactory.generateKeyAllUserTasksByProcDefKeyAndDateSpecification(procDefKey, dateSpec);
				console.debug("key where stored: "+key);
				DataFactory.allUserTasksByProcDefKeyAndDateSpecification[key] = data;
			})
			.error(function(){
				console.debug("error in fetching user task time spec by proc def");
			});
		};


		DataFactory.getAllUserTasksIG = function() {
			return $http.get(Uri.appUri("plugin://statistics-plugin/:engine/all-user-tasks-ig?time=start"))
			.success(function (data){
				DataFactory.allUserTasksIG = data;
			})
			.error(function(){				
				console.debug("error in fetching user tasks by start time");
			});
		};

		DataFactory.variablesSizeCounts = function() {
			return $http.get(Uri.appUri("plugin://statistics-plugin/:engine/variables-size"));
		};

		DataFactory.incidentsCounts = function() {
			return $http.get(Uri.appUri("plugin://statistics-plugin/:engine/incidents"));
		};

		DataFactory.opLogCounts = function() {
			return $http.get(Uri.appUri("plugin://statistics-plugin/:engine/oplog?startdate=2014-08-30T00:00:00&enddate=2015-01-01T00:00:00"));
		};

		DataFactory.jobDefinitionsCount = function() {
			return $http.get(Uri.appUri("plugin://statistics-plugin/:engine/job-definitions?jobtype=timer&firstresult=0&maxresults=5"));
		};

		DataFactory.businessData = function() {
			return $http.get(Uri.appUri("plugin://statistics-plugin/:engine/businessdata?firstresult=0&maxresults=10000"));
		};

		DataFactory.getDurations = function(processDefKeys) {
			var String = "";
			if(processDefKeys){
				for (var i = 0; i < processDefKeys.length; i++) {
					if (i == 0) {
						String = String + "?processdefkey=" + processDefKeys[i].processDefinitionKey;
					}
					else
						String = String + "&processdefkey=" + processDefKeys[i].processDefinitionKey;
				}
			};
			return $http.get(Uri.appUri("plugin://statistics-plugin/:engine/durations" + String))
			.success(function (data){
				DataFactory.durations = data;
			})
			.error(function(){				
				console.debug("error in getting durations");
			});
		};

		DataFactory.getProcessDefWithFinishedInstances = function() {
			return $http.get(Uri.appUri("plugin://statistics-plugin/:engine/pdkeysfinishedinst"))
			.success(function (data){
				DataFactory.processDefWithFinishedInstances = data;
			})
			.error(function(){
				console.debug("error in getting process definitions with finished instances")
			})
		};

		DataFactory.getProcessesStartEnd = function(){
			return $http.get(Uri.appUri("plugin://statistics-plugin/:engine/process-instance-start-end"))
			.success(function (data){
				DataFactory.processesStartEnd = data;
			})
			.error(function(){				
				console.debug("error in getting processes with start and end time");
			});
		};
		
		DataFactory.getAggregatedUserTasksByProcDefinition = function(procDefKey) {
      return $http.get(Uri.appUri("plugin://statistics-plugin/:engine/aggregated-user-tasks?procDefKey="+procDefKey))
      .success(function (data){
        if(procDefKey!=undefined) {
          DataFactory.aggregatedUsertasksByProcDef[procDefKey] = data;
        } else {
          DataFactory.aggregatedUsertasksByProcDef["data"] = data;
        }
      })
      .error(function(){        
        console.debug("error in getting processes with start and end time");
      });
		}
		
		DataFactory.getProcessDefinitions = function() {
		  return $http.get(Uri.appUri("/engine-rest/engine/default/process-definition"))
		   .success(function(data) {
		    DataFactory.processDefinitions = data;
		  })
		  .error(function() {
		    console.debug("error in getting process definitions");
	    });
		}
		
    DataFactory.getAllProcessInstanceRunningIncidentsCountOByProcDefRestApi = function() {
      return $http.get(Uri.appUri("/engine-rest/engine/default/process-definition/statistics?failedJobs=true&incidents=true"))
      .success(function(data) {
        DataFactory.processInstanceRunningIncidentsCountOByProcDefRestApi = data;
      })
      .error(function() {
        console.debug("error in getting processInstanceRunningIncidentsCountOByProcDefRestApi");
      });
    }
    
    
    DataFactory.getHistoricCaseInstanceDetailsAggregatedByCasedDefinitionId = function() {
      return $http.get(Uri.appUri("/engine-rest/engine/default/history/case-instance"))
      .success(function(data){
        var caseDefinitionDetails = {};
        
        for(i in data) {
          
           /*
            * iterate through instances
            */
          
          var caseDefId = data[i].caseDefinitionId;
          
          if(!(caseDefId in caseDefinitionDetails)) {
           caseDefinitionDetails[caseDefId] = {}; 
           caseDefinitionDetails[caseDefId].definitionId = caseDefId;
          }
          

          
          if(!caseDefinitionDetails[caseDefId].active) {
            caseDefinitionDetails[caseDefId].active = 0;
          }
          
          if(data[i].active) {
            caseDefinitionDetails[caseDefId].active+=1;
          }
          
          if(!caseDefinitionDetails[caseDefId].completed) {
            caseDefinitionDetails[caseDefId].completed = 0;
          }
          
          if(data[i].completed) {
            caseDefinitionDetails[caseDefId].completed+=1;
          }
          
          if(!caseDefinitionDetails[caseDefId].terminated) {
            caseDefinitionDetails[caseDefId].terminated = 0;
          }
          
          if(data[i].terminated) {
            caseDefinitionDetails[caseDefId].terminated+=1;
          }
          
          if(!caseDefinitionDetails[caseDefId].durations) {
            caseDefinitionDetails[caseDefId].durations = [];
          }
          
          if(data[i].durationsInMillis && data[i].durationsInMillis>0) {
            caseDefinitionDetails[caseDefId].durations.push(data[i].durationsInMillis);
          }
          
        }
        
        DataFactory.historicCaseInstanceDetailsAggregatedByCasedDefinitionId = caseDefinitionDetails;
        
      })
      .error(function() {
        console.debug("error in getting caseDefinitionDetails");
      });
    }
    
    
    //TODO ==> param in query aufnehmen
    DataFactory.getHistoricCaseActivityInstanceDetailsAggregatedByCasedDefinitionId = function(caseDefinitionId) {
      return $http.get(Uri.appUri("/engine-rest/engine/default/history/case-activity-instance"))
      .success(function(data){
        var historicCaseActivityInstanceDetails = {};
        
        for(i in data) {
          
           /*
            * iterate through instances
            */
          
          if(data[i].caseDefinitionId==caseDefinitionId) {
            
            activityId = data[i].caseActivityType+"_"+data[i].caseActivityName;
            
            
            if(!(activityId in historicCaseActivityInstanceDetails)) {
              historicCaseActivityInstanceDetails[activityId] = {}; 
              historicCaseActivityInstanceDetails[activityId].activityId = activityId;
              historicCaseActivityInstanceDetails[activityId].activityType = data[i].caseActivityType;
              historicCaseActivityInstanceDetails[activityId].activityName = data[i].caseActivityName;
            }
            
            
            
            if(!historicCaseActivityInstanceDetails[activityId].required) {
              historicCaseActivityInstanceDetails[activityId].required = 0;
            }
            
            if(data[i].required) {
              historicCaseActivityInstanceDetails[activityId].required+=1;
            }
            
            if(!historicCaseActivityInstanceDetails[activityId].enabled) {
              historicCaseActivityInstanceDetails[activityId].enabled = 0;
            }
            
            if(data[i].enabled) {
              historicCaseActivityInstanceDetails[activityId].enabled+=1;
            }
            
            if(!historicCaseActivityInstanceDetails[activityId].disabled) {
              historicCaseActivityInstanceDetails[activityId].disabled = 0;
            }
            
            if(data[i].disabled) {
              historicCaseActivityInstanceDetails[activityId].disabled+=1;
            }
            
            if(!historicCaseActivityInstanceDetails[activityId].available) {
              historicCaseActivityInstanceDetails[activityId].available = 0;
            }
            
            if(data[i].available) {
              historicCaseActivityInstanceDetails[activityId].available+=1;
            }
            
            if(!historicCaseActivityInstanceDetails[activityId].active) {
              historicCaseActivityInstanceDetails[activityId].active = 0;
            }
            
            if(data[i].active) {
              historicCaseActivityInstanceDetails[activityId].active+=1;
            }
            
            if(!historicCaseActivityInstanceDetails[activityId].completed) {
              historicCaseActivityInstanceDetails[activityId].completed = 0;
            }
            
            if(data[i].completed) {
              historicCaseActivityInstanceDetails[activityId].completed+=1;
            }
            
            if(!historicCaseActivityInstanceDetails[activityId].terminated) {
              historicCaseActivityInstanceDetails[activityId].terminated = 0;
            }
            
            if(data[i].terminated) {
              historicCaseActivityInstanceDetails[activityId].terminated+=1;
            }
            
            if(!historicCaseActivityInstanceDetails[activityId].durations) {
              historicCaseActivityInstanceDetails[activityId].durations = [];
            }
            
            if(data[i].durationsInMillis && data[i].durationsInMillis>0) {
              historicCaseActivityInstanceDetails[activityId].durations.push(data[i].durationsInMillis);
            }
            
          }

        }
        
        DataFactory.historicCaseActivityInstanceDetailsAggregatedByCasedDefinitionId[caseDefinitionId] = historicCaseActivityInstanceDetails;
        
      })
      .error(function() {
        console.debug("error in getting caseDefinitionDetails");
      });
    }

    DataFactory.getAggregatedEndedProcessInstanceInformationOrderedByProcessDefinitionKey = function() {
      return $http.get(Uri.appUri("/engine-rest/engine/default/history/process-instance"))
      .success(function(data){
        
        var preResults = {};
        var results = [];
        
        for(i in data) {
          if(data[i].processDefinitionKey in preResults) {
            if(data[i].durationInMillis) {
              preResults[data[i].processDefinitionKey].finished++;
              preResults[data[i].processDefinitionKey].durations.push(data[i].durationInMillis);
            }
          } else {
            if(data[i].durationInMillis) {
              preResults[data[i].processDefinitionKey] = {
                  finished:1,
                  durations:[data[i].durationInMillis]
              }
            }
          }
        }

        
        for(j in preResults) {
          results.push({
            "key":j,
            "y":preResults[j].finished,
            "avg":preResults[j].durations.reduce(function(x, y) { return x + y; })/preResults[j].durations.length,
            "min":Math.min.apply(Math,preResults[j].durations),
            "max":Math.max.apply(Math,preResults[j].durations)
          });
        }
        
        DataFactory.aggregatedEndedProcessInstanceInformationOrderedByProcessDefinitionKey = results;
        
      })
      .error(function(data) {
        console.debug("error in getting EndedProcessInstancesOrderedByProcessDefinitionKey");
      });
    }
    
    
		return DataFactory;

	}]);
});
