ngDefine('cockpit.plugin.statistics-plugin.controllers', ['../lib/d3','../lib/nv.d3.own'],function(module) {
	module.controller('slaChartCtrl',['$scope', '$element', 'Uri', 'DataFactory', function($scope, element, Uri, DataFactory){


		$scope.options = {
				chart: {
					type: 'pieChart',
					height: 500,
					x: function(d){return d.key;},
					y: function(d){return d.y;},
					showLabels: true,
					transitionDuration: 500,
					labelThreshold: 0.01,
					tooltips: true,
					tooltipContent: function(key, y, e, graph){
						return '<h3>' + key + '</h3>' +
						'<p>count:<b>' +  y + '</b><br/>type:<b>'+
						e.point.type+	
						'</b><br/>average Duration:<b>'+
						(e.point.avg/1000/60).toFixed(2)+
						'min </b><br/>minimal Duration:<b>'+
						(e.point.min/1000/60).toFixed(2)+
						'min </b><br/>maximal Duration:<b>'+
						(e.point.max/1000/60).toFixed(2)+
						'min </b></p>'
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


		DataFactory
		.getHistoricActivityCountsDurationByProcDefKey($scope.processDefinition.key)
		.then(function() {

			activityCount = DataFactory.historicActivityCountsDurationByProcDefKey[$scope.processDefinition.key];
			activitiesToPlotForPieChart=[];
			for(i in activityCount){
				if(activityCount[i].count) {
					activitiesToPlotForPieChart.push({
						"key":activityCount[i].activityName,
						"y":activityCount[i].count,
						"type":activityCount[i].type,
						"avg":activityCount[i].avgDuration,
						"min":activityCount[i].minDuration,
						"max":activityCount[i].maxDuration
					});
				}
			}
			$scope.activitiesForProcDef = activitiesToPlotForPieChart;
		});


	}])
});