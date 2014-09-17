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
            
            DataFactory.chosenTab = "";
            
            DataFactory.prepForBroadcast = function(chosenTab) {
              console.log("changing currently opened tab to: "+chosenTab);
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
                  	console.log("error in fetching process definitions");
              });
            };
            
            DataFactory.getAllRunningUserTasksCountOByProcDefKey = function() {
            	return $http.get(Uri.appUri("plugin://statistics-plugin/:engine/running-user-tasks"))
                .success(function(data) {
                	DataFactory.allRunningUserTasksCountOByProcDefKey = data;
                })
                    .error(function(){
                    	console.log("error in fetching running user tasks count ordered by proc def key");
                });
            }
            DataFactory.getAllEndedUserTasksCountOByProcDefKey = function() {
            	return $http.get(Uri.appUri("plugin://statistics-plugin/:engine/ended-user-tasks"))
              .success(function(data) {
              	DataFactory.allEndedUserTasksCountOByProcDefKey = data;
              })
                  .error(function(){
                  	console.log("error in fetching ended user tasks count ordered by proc def key");
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
                    console.log("error in fetching historic activity information");
              });
            }


            DataFactory.activityInstanceCounts = function() {
                return $http.get(Uri.appUri("plugin://statistics-plugin/:engine/activity-instance"));
            };

            DataFactory.allActivityInstances = function() {
                return $http.get(Uri.appUri("plugin://statistics-plugin/:engine/all-activity-instance?startdate=2014-08-30T00:00:00&enddate=2015-01-01T00:00:00"));
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
            	console.log("error in fetching process instance counts by state");
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
                	console.log("error in fetching process instance counts by state and proc Def Key");
                });	


            };

            DataFactory.allProcessInstances = function() {
                return $http.get(Uri.appUri("plugin://statistics-plugin/:engine/all-process-instance?startdate=2014-08-30T00:00:00&enddate=2015-01-01T00:00:00"));
            };

            DataFactory.userTaskCounts = function() {
                return $http.get(Uri.appUri("plugin://statistics-plugin/:engine/historic-user-tasks"));
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
                return $http.get(Uri.appUri("plugin://statistics-plugin/:engine/all-user-tasks?procDefKey="+procDefKey+"&dateSpecifier="+dateSpec))
                .success(function(data) {
                	
                	var key = DataFactory.generateKeyAllUserTasksByProcDefKeyAndDateSpecification(procDefKey, dateSpec);
                	DataFactory.allUserTasksByProcDefKeyAndDateSpecification[key] = data;
        		})
                .error(function(){
                	console.log("error in fetching user task time spec by proc def");
                });
            };
            
           
            DataFactory.getAllUserTasksIG = function() {
                return $http.get(Uri.appUri("plugin://statistics-plugin/:engine/all-user-tasks-ig?time=start"))
                .success(function (data){
                	DataFactory.allUserTasksIG = data;
                })
                .error(function(){				
                	console.log("error in fetching user tasks by start time");
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
                for (var i = 0; i < processDefKeys.length; i++) {
                    if (i == 0) {
                        String = String + "?processdefkey=" + processDefKeys[i];
                    }
                    else
                        String = String + "&processdefkey=" + processDefKeys[i];
                };
                return $http.get(Uri.appUri("plugin://statistics-plugin/:engine/durations" + String))
                .success(function (data){
                	DataFactory.durations = data;
                })
                .error(function(){				
                	console.log("error in getting durations");
                });
            };

            DataFactory.keys = function() {
                return $http.get(Uri.appUri("plugin://statistics-plugin/:engine/keys"));
            };

            DataFactory.getProcessesStartEnd = function(){
            	return $http.get(Uri.appUri("plugin://statistics-plugin/:engine/process-instance-start-end"))
            	.success(function (data){
                	DataFactory.processesStartEnd = data;
                })
                .error(function(){				
                	console.log("error in getting processes with start and end time");
                });
            };
            
            
            
            return DataFactory;

        }]);
});
