ngDefine('cockpit.plugin.statistics-plugin.statistics', function(module) {
	module.controller('statisticsProcessDefinitionTabCtrl',['$filter','$scope','DataFactory','UserInteractionFactory','Uri','$q',function($filter, $scope, DataFactory, UserInteractionFactory, Uri, $q) {

		$scope.options = {
				chart : {
					type : 'multiBarChart',
					height : UserInteractionFactory.currentHeight/6,
					x : function(d) {
						return d.x;
					},
					y : function(d) {
						return d.y;
					},
					showLabels : true,
					transitionDuration : 500,
					labelThreshold : 0.01,
					showControls : false,
					tooltip: {
						contentGenerator: function(d) {
							'use strict';
							if (d.series[0].key.indexOf("finished")>-1
									||d.data.x.indexOf("finished")>-1) {
								return '<h3>' + d.data.key + '</h3>' + '<p>count:<b>' + d.data.y + '</b>'
								+ (d.data.type ? '<br/>type: <b>'+d.data.type+'</b>': '')
								+ '<br/>avg:<b>'
								+ $filter('formatTime')(d.data.avg)
								+ ' </b><br/>min:<b>'
								+ $filter('formatTime')(d.data.min)
								+ ' </b><br/>max:<b>'
								+ $filter('formatTime')(d.data.max)
								+ ' </b></p>'
							} else {
								return '<h3>' + d.data.key + '</h3>' + '<p>count:<b>' + d.data.y + '</b></p>'
							}	
						}
					},
					noData : "No Processes met the requirements",
					legend : {
						margin : {
							top : 5,
							right : 5,
							bottom : 5,
							left : 5
						}
					}
				}
		};

		$q.all([DataFactory.getAllProcessInstanceRunningIncidentsCountOByProcDefRestApi(),
		        DataFactory.getHistoricActivityCountsDurationByProcDefKey($scope.processDefinition.key),
		        DataFactory.getAggregatedEndedProcessInstanceInformationOrderedByProcessDefinitionKey($scope.processDefinition.key)]).then(function(){

		        	var resultRunning = {};
		        	var resultIncidents = {};
		        	var resultFinished = {};
		        	var runningPlotData = [];
		        	var finishedPlotData = [];
		        	var incidentPlotData = [];
		        	$scope.overallStatesOfDefinition = [];
		        	$scope.activityStatesOfDefinition = [];

		        	var finishedInstancesData = DataFactory.endedProcessInstanceInformationOrderedByProcessDefinitionKey[$scope.processDefinition.key];

		        	resultFinished = {
		        			x : "overall",
		        			y:0,
		        			avg:0,
		        			min:0,
		        			max:0
		        	}

		        	for(var i in finishedInstancesData) {

		        		var version = finishedInstancesData[i].processDefinitionId.split(":")[1];
		        		if(version == $scope.processDefinition.version) {
		        			resultFinished.y++;
		        			resultFinished.avg = (resultFinished.avg+finishedInstancesData[i].durationInMillis)/2
		        			resultFinished.min = ((finishedInstancesData[i].durationInMillis < resultFinished.min || i==0) ? finishedInstancesData[i].durationInMillis : resultFinished.min)
		        			resultFinished.max = ((finishedInstancesData[i].durationInMillis > resultFinished.max || i==0) ? finishedInstancesData[i].durationInMillis : resultFinished.max)
		        		}

		        	}

		        	finishedPlotData.push(resultFinished);

		        	var data = DataFactory.processInstanceRunningIncidentsCountOByProcDefRestApi;

		        	for(i in data) {

		        		if(data[i].definition.key==$scope.processDefinition.key
		        				&& data[i].definition.version == $scope.processDefinition.version) {
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


		        	}

		        	if(resultRunning[$scope.processDefinition.key] &&
		        			resultRunning[$scope.processDefinition.key] > 0) {

		        		runningPlotData.push({
		        			"x" : "overall",
		        			"y" : resultRunning[$scope.processDefinition.key]
		        		});

		        	}

		        	if(resultIncidents[$scope.processDefinition.key] &&
		        			resultIncidents[$scope.processDefinition.key] > 0) {

		        		incidentPlotData.push({
		        			"x" : $scope.processDefinition.key,
		        			"y" : resultIncidents[$scope.processDefinition.key]
		        		});

		        	}

		        	//activity details

		        	var activityStatistics = DataFactory.historicActivityCountsDurationByProcDefKey[$scope.processDefinition.key];

		        	for(i in activityStatistics){
		        		var version = activityStatistics[i].procDefId.split(":")[1];
		        		if(activityStatistics[i].count && version == $scope.processDefinition.version) {
		        			$scope.activityStatesOfDefinition.push({
		        				key: activityStatistics[i].activityName,
		        				values : [{
		        					"x":"finished activities",
		        					"y":activityStatistics[i].count,
		        					"name":activityStatistics[i].activityName,                						
		        					"type":activityStatistics[i].type,
		        					"avg":activityStatistics[i].avgDuration,
		        					"min":activityStatistics[i].minDuration,
		        					"max":activityStatistics[i].maxDuration
		        				}]
		        			});
		        		}
		        	}

		        	//final format for plots


		        	if(runningPlotData.length>0) {

		        		$scope.overallStatesOfDefinition.push({
		        			key: "running",
		        			values : runningPlotData
		        		});

		        	}

		        	if(finishedPlotData.length>0) {

		        		$scope.overallStatesOfDefinition.push({
		        			key: "finished",
		        			values : finishedPlotData
		        		});

		        	}

		        	if(incidentPlotData.length>0) {

		        		$scope.overallStatesOfDefinition.push({
		        			key: "failed",
		        			values : incidentPlotData
		        		});

		        	}


		        });



	} ]);
});