ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {
	module.controller('slaChartCtrl',['$scope', '$element', 'Uri', 'DataFactory', function($scope, element, Uri, DataFactory){

	  $scope.activities = [];
	  $scope.selectedActivity = [];
		
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
    				(e.point.avg/1000).toFixed(2)+
    				's</b><br/>minimal Duration:<b>'+
    				(e.point.min/1000).toFixed(2)+
    				's</b><br/>maximal Duration:<b>'+
    				(e.point.max/1000).toFixed(2)+
    				's</b></p>'
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
		
    $scope.optionsLineChart = {
        chart: {
            type: 'lineChart',
            height: 450,
            x: function(d){return d.x;},
            y: function(d){return d.y/1000;},
            showLabels: true,
            yAxis: { 
              tickFormat:function(d) {
                return d+" s";
              },
              showMaxMin:false,
              axisLabel: function(d){ return "duration (s)";}
            },
            xAxis: { 
              axisLabel: "top 100 longest instances"
            },
            transitionDuration: 500,
            labelThreshold: 0.01,
            tooltips: true,
            tooltipContent: function(key, x, y, e, graph){
              return '<h3>'+y+'</h3>'+
              '<br><p>id: <b>'+
              e.point.id+'</b>'+
              '<br>start Date: <b>'+
              e.point.start +'</b>'+
              '</p>';
            },
            noData:"No durations available requirements",
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
				  $scope.activities.push({
				    "name":activityCount[i].activityName,
				    "type":activityCount[i].type
				  });
				 }
				}
			$scope.activitiesForProcDef = activitiesToPlotForPieChart;
		});
		
		
		$scope.selectionChanged = function(){
		  $scope.showLinePlot();
		}
		
		$scope.showLinePlot = function() {
      DataFactory.getAllHistoricActivitiesInformationByProcDefKey($scope.processDefinition.key,$scope.selectedActivity.name, $scope.selectedActivity.type).then(function() {
        var historicActivityInformation = DataFactory.allHistoricActivitiesInformationByProcDefKey[$scope.processDefinition.key];
        var filteredData = [];
        for(i in historicActivityInformation) {
          if(historicActivityInformation[i].duration) {
            filteredData.push({
              "x":i,
              "y":(historicActivityInformation[i].duration/1000).toFixed(2),
              "id":historicActivityInformation[i].id,
              "start":historicActivityInformation[i].startTime,
              "end":historicActivityInformation[i].endTime
              });
          }
        }
        $scope.historicActivityPlotData =  [{
                            values : filteredData,
                            key:"durations"}];
      });
		}
		
	}])
});