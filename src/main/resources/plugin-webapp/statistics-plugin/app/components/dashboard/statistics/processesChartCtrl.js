ngDefine('cockpit.plugin.statistics-plugin.dashboard', function(module) {
	module.controller('processesChartCtrl',['$q', '$filter', '$scope', '$templateCache', '$element', 'Uri', 'DataFactory', 'SettingsFactory', 'UserInteractionFactory', '$http', '$modal', '$interval', '$window',
	                                        function($q, $filter, $scope, $templateCache, $element, Uri, DataFactory, SettingsFactory, UserInteractionFactory, $http,$modal, $interval, $window){

		$scope.myPlotsPluginSettings = null;


		$scope.drilledInRunning = false;
		$scope.drilledInEnded = false;
		$scope.drilledInIncidents = false;

		$scope.runningProcInstances = [];
		$scope.endedProcInstances = [];
		$scope.incidentsProcInstances = [];
		$scope.processInstanceCounts = [];	  
		$scope.startedEndedRunningPlotData = [];

		var formattedDataIncidents = [];
		var formattedDataEnded = [];
		var formattedDataRunning = [];



		$scope.showRefreshIcon = false;
		$scope.showApplyChangesAlert = false;
		$scope.showPlotDescriptions = false;
		$scope.reload = {
				showReloadProcessRunning:false,
				showReloadProcessEnded:false,
				showReloadProcessFailed:false,
				showReloadMultibarChartRunning:false
		};

		$scope.widthClass = "col-lg-4 col-md-4 col-sm-4";
		$scope.plotHeight = 500;

		$scope.cacheKiller = null;

		$scope.showPlotSettings = false;

		$scope.runningPlotLabel = "Running Instances";
		$scope.endedPlotLabel = "Ended Instances";
		$scope.failedPlotLabel = "Instances with Incidents";

		var resetPieChartData = function() {
			$scope.runningProcInstances = [];
			$scope.endedProcInstances = [];
			$scope.incidentsProcInstances = [];
			$scope.processInstanceCounts = [];
			$scope.startedEndedRunningPlotData = [];		  
		}

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
					resetPieChartData();
					$scope.getDataForPlots();
				}
			}
		});

		$scope.$on('pluginSettingsChanged', function(event, change) {

			/*
			 * gets called every time settings are changing, includes first time
			 * By that, plots will be rendered with the right settings
			 */

			console.debug("settings changed ("+change.changeId+")");


			if($scope.myPlotsPluginSettings!=SettingsFactory.pluginSettings.overview) {


				if( ($scope.myPlotsPluginSettings==null) && !SettingsFactory.pluginSettings.overview.loadOnTabLoad) {

					$scope.myPlotsPluginSettings = SettingsFactory.pluginSettings.overview;
					// first call after full reload // initial request
					$scope.showInitialLoadButton = true;

				} else {

					$scope.myPlotsPluginSettings = SettingsFactory.pluginSettings.overview;

					if($scope.myPlotsPluginSettings.loadOnTabLoad) {

						//just do the reload

						resetPieChartData();
						$scope.getDataForPlots();

						//refresh plots

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

		var getDetailData = function(processDefinitionKey) {

			//get data for plot

			var result = [];
			processDefinitionDetails = {
					"name": processDefinitionKey,
					"children": [],
					size: 0
			};      

			DataFactory.getAllProcessInstanceRunningIncidentsCountOByProcDefRestApi()
			.then(function() {

				var data = DataFactory.processInstanceRunningIncidentsCountOByProcDefRestApi;

				for(var i in data) {

					/*
					 * look only for information for respective process definition and directly push running, failed jobs and incidents information as they are
					 * already ordered by version and require no aggregation
					 */

					if(data[i].definition.key==processDefinitionKey) {
						var versionDetails = {
								"name": "Version "+data[i].definition.version,
								"size": 0,
								"children": []
						};

						if(data[i].instances && data[i].instances>0) {
							versionDetails.children.push({
								"name":"running",
								"size":data[i].instances
							});

							versionDetails.size+=data[i].instances;
							processDefinitionDetails.size+=data[i].instances;
						}

						if(data[i].failedJobs && data[i].failedJobs>0) {
							versionDetails.children.push({
								"name":"failedJobs",
								"size":data[i].failedJobs
							});

							versionDetails.size+=data[i].failedJobs;
							processDefinitionDetails.size+=data[i].failedJobs;

						}


						if(data[i].incidents.length && data[i].incidents.length>0) {

							versionDetails.children.push({
								"name":"incidents",
								"children":[]
							});

							for(var j=0; j<data[i].incidents.length; j++) {

								versionDetails.children[versionDetails.children.length-1].children.push({
									"name":data[i].incidents[j].incidentType,
									"size":data[i].incidents[j].incidentCount
								});

							}              
						}


						processDefinitionDetails.children.push(versionDetails);

					}

				}

			}).then(function(){
				return DataFactory.getAggregatedEndedProcessInstanceInformationOrderedByProcessDefinitionKey(processDefinitionKey); 
			}).then(function(){

				/*
				 * now..add missing information for finished instances
				 */
				var data = DataFactory.endedProcessInstanceInformationOrderedByProcessDefinitionKey[processDefinitionKey];

				for(var i in data) {

					var version = data[i].processDefinitionId.split(":")[1];
					//check if information for respective version of process definition already exists
					var versionFound = false;
					var versionIndex = -1;

					for(var j=0; j<processDefinitionDetails.children.length; j++) {
						//version found
						if(processDefinitionDetails.children[j].name
								&& processDefinitionDetails.children[j].name==="Version "+version) {
							versionFound = true;
							versionIndex = j;

							//check if finished already exists
							var finishedFound = false;

							for(var k=0; k<processDefinitionDetails.children[versionIndex].children.length; k++) {
								if(processDefinitionDetails.children[versionIndex].children[k].name==="finished") {
									//finished found
									finishedFound = true;
								}
							}

							if(!finishedFound) {
								processDefinitionDetails.children[j].children.push({
									"name":"finished",
									"size":0
								});
							}

						}
					}

					//if version not found create initial information for version
					if(!versionFound) {
						processDefinitionDetails.children.push({
							"name": "Version "+data[i].definition.version,
							"children": [{
								"name":"finished",
								"size":0
							}]
						});

						versionIndex = processDefinitionDetails.children.length-1;

					}


					/*
					 * basic information for version exist, either they got created or the already existed
					 * Now add count information for finished instances
					 */


					for(var j=0; j<processDefinitionDetails.children[versionIndex].children.length;j++) {
						if(processDefinitionDetails.children[versionIndex].children[j].name==="finished") {
							processDefinitionDetails.children[versionIndex].children[j].size+=1;
							processDefinitionDetails.children[versionIndex].size+=1;
							processDefinitionDetails.size+=1;
						}
					}          
				}

				result.push(processDefinitionDetails);

			}).then(function() {
				//Get running user task instances
				return DataFactory.getRunningTaskInstancesByProcessDefinitionKey(processDefinitionKey);
			}).then(function() {
				//Get finished activity instances
				return DataFactory.getHistoricActivityCountsDurationByProcDefKey(processDefinitionKey);
			}).then(function(){


				//analyze running user tasks and add to data

				var runningTaskInstances = DataFactory.runningTaskInstancesByProcessDefinitionKey[processDefinitionKey];
				var finishedActivityInstances = DataFactory.historicActivityCountsDurationByProcDefKey[processDefinitionKey];

				for(var i in runningTaskInstances) {
					//get relevant user task information
					var version = runningTaskInstances[i].processDefinitionId.split(":")[1];
					var assigned = (runningTaskInstances[i].assignee != null);

					//add to children of respective version's running details
					for(var j in result[0].children) {

						if(result[0].children[j].name=="Version "+version) {

							//direct access to running structure (which has to exist, otherwise no usertasks would exist)	
							if(!result[0].children[j].children[0].children) {
								result[0].children[j].children[0].children = [];
							}

							//check if information for task exist
							var userTaskInformationFound  = false;
							var userTaskIndex = -1;

							if(!result[0].children[j].children[0].children) {
								result[0].children[j].children[0].children = [];
							}

							for(var k in result[0].children[j].children[0].children) {
								if(result[0].children[j].children[0].children[k].taskDefinitionKey==runningTaskInstances[i].taskDefinitionKey) {
									userTaskInformationFound = true;
									userTaskIndex = k;
								}
							}

							//if information exist, increase counter
							//if not, create base information
							if(userTaskInformationFound) {
								result[0].children[j].children[0].children[userTaskIndex].size++;
							} else {
								result[0].children[j].children[0].children.push({
									name:runningTaskInstances[i].name,
									taskDefinitionKey:runningTaskInstances[i].taskDefinitionKey,
									size:1
								});
								userTaskIndex = result[0].children[j].children[0].children.length-1;
							}

							//check if assigned children exist
							if(!result[0].children[j].children[0].children[userTaskIndex].children) {
								result[0].children[j].children[0].children[userTaskIndex].children = [
								                                                                      {name: "assigned",
								                                                                      	size: 0},
								                                                                      	{name: "not assigned",
								                                                                      		size: 0}
								                                                                      	];
							}

							//add assigned information
							if(assigned) {
								result[0].children[j].children[0].children[userTaskIndex].children[0].size++;
							} else {
								result[0].children[j].children[0].children[userTaskIndex].children[1].size++;
							} 

						}
					}
				}

				//analyze finished user tasks and activities and add to data
				for(var i in finishedActivityInstances) {
					var version = finishedActivityInstances[i].procDefId.split(":")[1];
					var activityName = finishedActivityInstances[i].activityName;
					var type = finishedActivityInstances[i].type;

					//add to children of respective version's ended details
					for(var j in result[0].children) {

						if(result[0].children[j].name=="Version "+version) {

							//determine finished index
							var finishedInstancesIndex = -1;

							for(var m in result[0].children[j].children) {
								if(result[0].children[j].children[m].name=="finished") {
									finishedInstancesIndex = m;
									break;
								}
							}

							//only add information on finished instances if any exist for a version
							if(finishedInstancesIndex>-1) {

								
								//access finished information	
								if(!result[0].children[j].children[finishedInstancesIndex].children) {
									result[0].children[j].children[finishedInstancesIndex].children = [];
								}
	
								//check if information for task exist
								var activityInformationFound  = false;
								var activityIndex = -1;
	
								if(!result[0].children[j].children[finishedInstancesIndex].children) {
									result[0].children[j].children[finishedInstancesIndex].children = [];
								}
	
								for(var k in result[0].children[j].children[finishedInstancesIndex].children) {
									if(result[0].children[j].children[finishedInstancesIndex].children[k].activityName==activityName) {
										activityInformationFound = true;
										activityIndex = k;
									}
								}
	
								//if information exist, increase counter
								//if not, create base information
								if(activityInformationFound) {
									result[0].children[j].children[finishedInstancesIndex].children[activityIndex].size+=finishedActivityInstances[i].count;
									result[0].children[j].children[finishedInstancesIndex].children[activityIndex].max
									=(result[0].children[j].children[finishedInstancesIndex].children[activityIndex].max+finishedActivityInstances[i].maxDuration)/2;
									result[0].children[j].children[finishedInstancesIndex].children[activityIndex].min
									=(result[0].children[j].children[finishedInstancesIndex].children[activityIndex].max+finishedActivityInstances[i].minDuration)/2;
									result[0].children[j].children[finishedInstancesIndex].children[activityIndex].avg
									=(result[0].children[j].children[finishedInstancesIndex].children[activityIndex].max+finishedActivityInstances[i].avgDuration)/2;      					
								} else {
									result[0].children[j].children[finishedInstancesIndex].children.push({
										name:activityName,
										size:finishedActivityInstances[i].count,
										avg:finishedActivityInstances[i].avgDuration,
										min:finishedActivityInstances[i].minDuration,
										max:finishedActivityInstances[i].maxDuration,
										actType:finishedActivityInstances[i].type
									});
									activityIndex = result[0].children[j].children[0].children.length-1;
								}
								
							}
						}
					}
				}
								
				//prepare data for accordion showing detail container per version
				var dataForStatisticalInformation = angular.copy(result);
				
				var versionsDetails = [];
				
				for(var i in dataForStatisticalInformation[0].children) {

					var versionDetails = {
							name:dataForStatisticalInformation[0].children[i].name,
							overall:dataForStatisticalInformation[0].children[i].size,
							running:0,
							runningDetails: {},
							finished:0,
							finishedDetails: {},
							withIncidents:0,
							withIncidentsDetails: {}
					};

					for(var j in dataForStatisticalInformation[0].children[i].children) {
						if(dataForStatisticalInformation[0].children[i].children[j].name=="running") {
							versionDetails.running = dataForStatisticalInformation[0].children[i].children[j].size;
							versionDetails.runningDetails = dataForStatisticalInformation[0].children[i].children[j].children;
						}
						if(dataForStatisticalInformation[0].children[i].children[j].name=="finished") {
							versionDetails.finished = dataForStatisticalInformation[0].children[i].children[j].size;
							versionDetails.finishedDetails = dataForStatisticalInformation[0].children[i].children[j].children;
						}
						if(dataForStatisticalInformation[0].children[i].children[j].name=="incidents") {
							versionDetails.withIncidents = dataForStatisticalInformation[0].children[i].children[j].size;
							versionDetails.withIncidentsDetails = dataForStatisticalInformation[0].children[i].children[j].children;
						}
					}

					versionsDetails.push(
							versionDetails
					);
					
				};

				//finally, remove assigned/unassigned for sunburst representation
				for(var i in result[0].children) {
					if(result[0].children[i].children[0].children) {
						for(var j in result[0].children[i].children[0].children) {
							//remove assigned/unassigned if size == 0
							var removeUnassigned = false;
							var removeAssigned = false;

							if(result[0].children[i].children[0].children[j].children[0].size==0) {
								removeAssigned = true;
							}
							if(result[0].children[i].children[0].children[j].children[1].size==0) {
								removeUnassigned = true;
							}

							if(removeAssigned) {
								result[0].children[i].children[0].children[j].children = [result[0].children[i].children[0].children[j].children[1]];
							}
							if(removeUnassigned) {
								result[0].children[i].children[0].children[j].children = [result[0].children[i].children[0].children[j].children[0]];
							}
						}
					}
				}

				var modalInstance = $modal.open({
					templateUrl: 'statisticsDetailsModalView',
					controller: 'statisticsDetailsModalCtrl',
					size: 'lg',
					resolve: {
						processDefinitionKey : function() {
							return processDefinitionKey;
						}, 
						data : function() {
							return result;
						},
						versionsDetails : function() {
							return versionsDetails;
						}
					}
				});

				modalInstance.result.then(function () {

				}, function () {

				});

			});


		}

		var showInstancesDetailsModal = function(processDefinitionKey) {

			getDetailData(processDefinitionKey);

		}

		var changePlotsHeight = function() {
			$scope.runningOptions.chart.height = UserInteractionFactory.plotHeight;
			$scope.failedOptions.chart.height = UserInteractionFactory.plotHeight;
			$scope.finishedInstancesOptions.chart.height = UserInteractionFactory.plotHeight;

			if(UserInteractionFactory.currentHeight/6>100) {
				$scope.overviewMultibarChartOptions.chart.height = UserInteractionFactory.currentHeight/6;
			} else {
				$scope.overviewMultibarChartOptions.chart.height = 100;
			}

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
					tooltip: {
						contentGenerator: function(click) {
							return '<div id="tooltipRunning"><h3>' + click.data.key + '</h3>' +
							'<p>count:<b>' +  click.data.y + '</b>'+
							(click.data.assigned ? "<br/>assigned: <b>"+click.data.assigned+"</b>" : "") +
							'</p></div>';
						}
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

		/*
		 * pie chart showing running instances is a copy
		 */

		$scope.runningOptions = angular.copy(options);


		/*
		 * overwrite options for pie chart showing instances with incidents
		 */    

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
		$scope.endedOptions.chart.tooltip.contentGenerator = function(click) {
			return '<h3>' + click.data.key + '</h3>' +
			'<p>count:<b>' +  click.data.y + '</b><br/>stats (dd:hh:MM:ss.mmm)<br/>avg:<b>'+
			$filter('formatTime')(click.data.avg)+
			'</b><br/>min:<b>'+
			$filter('formatTime')(click.data.min)+
			'</b><br/>max:<b>'+
			$filter('formatTime')(click.data.max)+
			'</b></p>'

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

		/*
		 * overwrite options for different type of chart - multibarchart
		 */

		$scope.overviewMultibarChartOptions = angular.copy(options);
		$scope.overviewMultibarChartOptions.chart.type="multiBarChart";
		$scope.overviewMultibarChartOptions.chart.x = function (d) {
			"use strict";
			return d.x };
			$scope.overviewMultibarChartOptions.chart.y = function (d) {
				"use strict";
				return d.y };
				$scope.overviewMultibarChartOptions.chart.height = UserInteractionFactory.currentHeight/6;   
				$scope.overviewMultibarChartOptions.chart.showControls = false;

				$scope.overviewMultibarChartOptions.chart.tooltip.contentGenerator = function(d) {
					var tooltip = '<h3>' + d.data.x + '</h3>';
					if(d.data.avg) {
						tooltip += '<p>finished instances:<b>' +  d.data.y + '</b><br/>avg:<b>'+
						$filter('formatTime')(d.data.avg)+
						'</b><br/>min: Duration:<b>'+
						$filter('formatTime')(d.data.min)+
						'</b><br/>max: Duration:<b>'+
						$filter('formatTime')(d.data.max)+
						'</b></p>'
					} else {
						tooltip+="<p>";
						if(d.data.key=="running instances") {
							tooltip+="running";
						} else {
							tooltip+="failed";
						}
						tooltip+=" instances: "+d.data.y+"</p>";
					}

					return tooltip;

				};

				$scope.overviewMultibarChartOptions.chart.multibar = {
						dispatch: {
							elementClick : function(t,u) {
								showInstancesDetailsModal(t.data.x);
							}
						}
				}

				/*
				 * drill in / out for pie charts
				 */


				function drillIn(event, plot, originatorIsMultiBarChart) {

					var keyForDataQuery = "";
					if(originatorIsMultiBarChart && originatorIsMultiBarChart==true) {
						keyForDataQuery = event.point.x;
					} else {
						keyForDataQuery = event.data.key;
					}

					switch(plot) {
					case "running":
						DataFactory
						.getAggregatedUserTasksByProcDefinition(keyForDataQuery)
						.then(function() {
							if(DataFactory.aggregatedUsertasksByProcDef[keyForDataQuery].length>0) {
								drillInRunning(DataFactory.aggregatedUsertasksByProcDef[keyForDataQuery]);
								$scope.runningPlotLabel="Running User Tasks of '"+keyForDataQuery+"'";
								$scope.drilledInRunning=true;
							} else {
								alert('No running user tasks available for process definition '+event.point.key+'.');
							}
						});
						break;
					case "ended":
						DataFactory
						.getHistoricActivityCountsDurationByProcDefKey(keyForDataQuery)
						.then(function() {
							if(DataFactory.historicActivityCountsDurationByProcDefKey[keyForDataQuery].length>0) {
								drillInEnded(DataFactory.historicActivityCountsDurationByProcDefKey[keyForDataQuery]);
								$scope.endedPlotLabel= "Ended Activities of '"+keyForDataQuery+"'";
								$scope.drilledInEnded=true;
							} else {
								alert('No finished activities available for process definition '+event.point.key+'.');
							}
						});
						break;
					case "incidents":
						$scope.drilledInIncidents = true;
						setIncidentsDetailsByProcessDefinitionKey(keyForDataQuery);
						$scope.failedPlotLabel = "Incidents of '"+keyForDataQuery+"'";
						break;
					default:
						break;
					}


				};

				function drillOut(event, plot) {
					switch(plot) {
					case "running":
						$scope.running = $scope.runningProcInstances;
						$scope.runningPlotLabel="Running Instances";
						$scope.drilledInRunning = false;
						break;
					case "ended":
						$scope.ended = $scope.endedProcInstances;
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

				function drillInRunning(newDataArray) {

					var newPieChartRunning = [];

					for(i in newDataArray){
						if(newDataArray[i].count) {
							newPieChartRunning.push({"key":newDataArray[i].activityName,"y":newDataArray[i].count, "assigned":newDataArray[i].assigned});
						}
					}

					$scope.running = newPieChartRunning;

				}

				function drillInEnded(newDataArray) {
					var activitiesToPlotForPieChart=[];
					for(i in newDataArray){
						if(newDataArray[i].count) {
							//check if information for version do exist
							var versionInformationExist = false;
							var versionInformationIndex = -1;

							for(var j in activitiesToPlotForPieChart) {
								if(activitiesToPlotForPieChart[j].key==newDataArray[i].activityName) {
									versionInformationExist = true;
									versionInformationIndex = j;
								}
							}

							if(versionInformationExist) {
								activitiesToPlotForPieChart[j].y+=newDataArray[i].count;
								activitiesToPlotForPieChart[j].avg=(activitiesToPlotForPieChart[j].avg+newDataArray[i].avgDuration)/2
								activitiesToPlotForPieChart[j].min=(activitiesToPlotForPieChart[j].min+newDataArray[i].maxDuration)/2
								activitiesToPlotForPieChart[j].max=(activitiesToPlotForPieChart[j].max+newDataArray[i].maxDuration)/2
							} else {
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
					}
					$scope.ended = activitiesToPlotForPieChart;
				}


				var setFinishedInstancesPlotData = function(endedData) {

					formattedDataEnded = [];
					var e = [];

					for(var i=0; i<endedData.length; i++){
						if($scope.myPlotsPluginSettings.endedPI.toPlot) {
							if(endedData[i].y) {
								if($scope.myPlotsPluginSettings.endedPI.keysToSkip.indexOf(endedData[i].key)==-1) {
									formattedDataEnded.push({"x":endedData[i].key,
										"y":endedData[i].y,
										"avg":endedData[i].avg,
										"min":endedData[i].min,
										"max":endedData[i].max}
									);
									e.push({"key":endedData[i].key,
										"y":endedData[i].y,
										"avg":endedData[i].avg,
										"min":endedData[i].min,
										"max":endedData[i].max});
								}
							}
						}
					}


					$scope.ended = e;      
					$scope.endedProcInstances = e;
					$scope.finishedInstances = e;

				}

				var setRunningPlotData = function(runningData) {

					formattedDataRunning = [];
					var r = [];

					for(key in runningData) {
						if($scope.myPlotsPluginSettings.runningPI.toPlot) {
							if(runningData.hasOwnProperty(key) && runningData[key]) {
								if($scope.myPlotsPluginSettings.runningPI.keysToSkip.indexOf(key)==-1) {
									formattedDataRunning.push({"x":key, "y":runningData[key]});
									r.push({"key":key,"y":runningData[key]});
								}
							}
						}
					}

					$scope.runningProcInstances = r;
					$scope.running = r;

				}

				var setIncidentPlotData = function(incidentData) {

					formattedDataIncidents = [];
					var f = [];

					for(key in incidentData) {
						if($scope.myPlotsPluginSettings.failedPI.toPlot) {
							if(incidentData.hasOwnProperty(key) && incidentData[key]) {
								if($scope.myPlotsPluginSettings.failedPI.keysToSkip.indexOf(key)==-1) {
									formattedDataIncidents.push({"x":key, "y":incidentData[key]});
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



				$scope.getDataForPlots = function() {


					if($scope.showApplyChangesAlert) {
						$scope.showApplyChangesAlert = false;
					}

					if($scope.showInitialLoadButton) {
						$scope.showInitialLoadButton = false;
					}

					$scope.reload.showReloadProcessRunning = true;
					$scope.reload.showReloadProcessEnded = true;
					$scope.reload.showReloadProcessFailed = true;
					$scope.reload.showReloadMultibarChartRunning = true;


					/*
					 * get data and apply to plots
					 */

					/*
					 * aggregated data for ended plot
					 */

					$q.all([
					        DataFactory
					        .getAggregatedEndedProcessInstanceInformationOrderedByProcessDefinitionKey()
					        .then(function(){
					        	$scope.reload.showReloadProcessEnded = false;
					        	$scope.showPlotDescriptions = true;

					        	setFinishedInstancesPlotData(DataFactory.aggregatedEndedProcessInstanceInformationOrderedByProcessDefinitionKey["data"]);

					        }),
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

					        })	          		          
					        ]).then(function() {
					        	console.debug("got running, finished and incident data! - prepare multibarchart");

					        	$scope.startedEndedRunningPlotData = [];

					        	if(formattedDataRunning.length
					        			&& formattedDataRunning.length>0) {

					        		$scope.startedEndedRunningPlotData.push({
					        			values : formattedDataRunning,
					        			key:"running instances"
					        		});

					        	}

					        	if(formattedDataEnded.length
					        			&& formattedDataEnded.length>0) {

					        		$scope.startedEndedRunningPlotData.push({
					        			values : formattedDataEnded,
					        			key:"finished instances"
					        		});

					        	}

					        	if(formattedDataIncidents.length
					        			&& formattedDataIncidents.length>0) {

					        		$scope.startedEndedRunningPlotData.push({
					        			values : formattedDataIncidents,
					        			key:"instances with incidents"
					        		});

					        	}

					        	$scope.reload.showReloadProcessFailed=false;
					        	$scope.reload.showReloadMultibarChartRunning=false;

					        });

				}

	}])
});