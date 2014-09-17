ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {
	module.controller('durationLineChartCtrl',['$scope', '$element', 'Uri', 'DataFactory', function($scope, element, Uri, DataFactory){

		
		
		$scope.options = {
            chart: {
                type: 'cumulativeLineChart',
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
		
		
		
	}])
	
});