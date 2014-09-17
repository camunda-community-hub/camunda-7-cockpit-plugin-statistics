ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {
	module.controller('slaPieChartCtrl',['$scope', '$element', 'Uri', 'DataFactory', function($scope, element, Uri, DataFactory){

		
		
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
		
		$scope.procDefKey = document.URL.substring(document.URL.indexOf("process-definition")+19, document.URL.indexOf(":", document.URL.indexOf("process-definition")+19));
		
		DataFactory
		.getHistoricActivityCountsDurationByProcDefKey($scope.procDefKey)
		.then(function() {
			
			activityCount = DataFactory.historicActivityCountsDurationByProcDefKey[$scope.procDefKey];
			activities=[];
			for(i in activityCount){
				if(activityCount[i].count)activities.push({
					"key":activityCount[i].activityName,
					"y":activityCount[i].count,
					"type":activityCount[i].type,
					"avg":activityCount[i].avgDuration,
					"min":activityCount[i].minDuration,
					"max":activityCount[i].maxDuration
					});
			}
			
			$scope.activitiesForProcDef = activities;

		});
		
	}])
});