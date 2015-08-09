ngDefine('cockpit.plugin.statistics-plugin.services', function(module) {
	module.factory('GraphFactory', function() {
		var GraphFactory = [];
		
		 //if clustered we add a size function displaying the cluster sizes
		GraphFactory.getOptionsForStartEndTimeGraph = function(timeFormat, clustered, width){
			var options = {
					 chart: {
			                type: 'scatterChart',
			                height: 400,
			                width: width,
			                //color function is set in the Controller for the plot
			                //if nothing is specified nvd3 will choose d3 color20 as default
//			                color: d3.scal.category10().range(),
//						sizeDomain: [1,10],	//see https://github.com/krispo/angular-nvd3/issues/49 for more info

//						size : function(d){
//							return d.size;
//						},
			                showLabels: true,
			                transitionDuration: 500,
			                labelThreshold: 0.01,
//						useInteractiveGuideline: true,
						interactive: true,

			                tooltips: true,
						tooltipContent : function(key, x, y, e, graph) {
							var d = e.series.values[e.pointIndex];
			                				return '<h3>' + key + '</h3>' +
							'<p>instances started/ended around that time: <b>' + d.clusterSize;
						},
						tooltipYContent : function(key, x, y) { return '<strong>' + key + '</strong>' },
						tooltipXContent : function(key, x, y, e) { 
							var time = d3.time.format(timeFormat)(new Date(e.point.x[0]));
							return '<strong>' + time + '</strong>' 
			                				},
			                xAxis: {
							tickFormat : function(d) {
								return d3.time.format(timeFormat)(new Date(d))
							}
			                },
			                
			                yAxis: {
							tickFormat : function() {
								return ""
							}
			                },
			                noData:"sorry data not yet available",
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
			if(clustered)
				options.chart.size = function(d){ return d.size; };
			return options;
			
		};
		
		GraphFactory.getOptionsForTimeDistributionGraph = function(bins,thresholds){
			var options = {
					 chart: {
			                type: 'multiBarChart',
			                height: 400,
			                width: 1000,
			                color: d3.scale.category10().range(),
			                x: function(d){return d.x;},
			                y: function(d){return d.y;},
			                showLabels: true,
			                transitionDuration: 500,
			                labelThreshold: 0.01,
			                reduceXTicks : false, //we want all ticks to be displayed!
			                // e is the mouse event
			                tooltip : function(key, x, y, e, graph) {
			                	var String = (thresholds[e.point.x]).toFixed(2) + ' min - ' + (thresholds[e.point.x+1]).toFixed(2)+" min";
			                	return '<h3>' + key + '</h3>' +
			                	'<p>' + y + ' on ' +  String + '</p>'
			                	},
			                xAxis: {
//			                	tickFormat: function(d) {return d3.time.format("%Y-%m-%dT%H:%M:%S")(new Date(d))}
//			                	tickFormat: function(d) {return d.toPrecision()}
			                	tickFormat: function(d) {return (d * (100/bins)).toFixed(0) + '-' + ((d+1)*(100/bins)).toFixed(0) + '%'},
			                	axisLabel : "% of range",
			                },
			                
			                yAxis: {
			                	tickFormat: function(d){return d.toPrecision()}
			                },
			                noData:"sorry data not yet available",
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
			return options;
			
		}
		return GraphFactory;
	});
});