ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {
	module.controller('pieChartCtrl',['$scope', '$element', 'Uri', 'DataFactory', function($scope, element, Uri, DataFactory){

		
		
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
		

		$scope.endedOptions = {
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
	    				'<p>' +  y + '<br/><br/>average Duration:<b>'+
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
		
		if(DataFactory.allProcessInstanceCountsByState["data"]!=undefined && DataFactory.allProcessInstanceCountsByState["data"].length>0) {
			console.log("no need to query data!");
			assingDataToPlot($scope, DataFactory.allProcessInstanceCountsByState["data"]);
		} else {
			DataFactory
			.getAllProcessInstanceCountsByState()
			.then(function() {
		
				assingDataToPlot($scope, DataFactory.allProcessInstanceCountsByState["data"]);

			});
		}
		
		
		function assingDataToPlot($scope, processInstanceCounts) {
			var r=[],e=[],f=[];
			
			for(i in processInstanceCounts){
				if(processInstanceCounts[i].runningInstanceCount)r.push({"key":processInstanceCounts[i].processDefinitionKey,"y":processInstanceCounts[i].runningInstanceCount});
				if(processInstanceCounts[i].endedInstanceCount)e.push({"key":processInstanceCounts[i].processDefinitionKey,
																		"y":processInstanceCounts[i].endedInstanceCount,
																		"avg":processInstanceCounts[i].duration,
																		"min":processInstanceCounts[i].minDuration,
																		"max":processInstanceCounts[i].maxDuration});
				if(processInstanceCounts[i].failedInstanceCount)f.push({"key":processInstanceCounts[i].processDefinitionKey,"y":processInstanceCounts[i].failedInstanceCount});
			}
			
			$scope.running = r;
			$scope.ended = e;
			$scope.failed = f;

		}

	}])
});