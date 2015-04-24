ngDefine('cockpit.plugin.statistics-plugin.services', function(module) {
	module.factory('DataFactory', ['$http', 'Uri', '$rootScope', function($http, Uri, $rootScope) {

		var DataFactory = {};

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

		DataFactory.chosenTab = "";

		DataFactory.prepForBroadcast = function(chosenTab) {
			console.debug("changing currently opened tab to: "+chosenTab);
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
			if(typeof(processDefKeys)!=undefined){
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



		return DataFactory;

	}]);
});
