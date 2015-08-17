ngDefine('cockpit.plugin.statistics-plugin.services', function(module) {
	module.factory('GraphFactory', function() {
		var GraphFactory = [];

		//if clustered we add a size function displaying the cluster sizes
		GraphFactory.getOptionsForStartEndTimeGraph = function(formatAndParser, clustered, width, x, colorScale){
			var options = {
					chart: {
						type: 'scatterChart',
						height: 400,
						width: width,
						color: colorScale,
						x: function(d) { return formatAndParser.parser(d[x]); },
						y: function(d) { return d.series +1; },
						//color function is set in the Controller for the plot
						//if nothing is specified nvd3 will choose d3 color20 as default
//						sizeDomain: [1,10],	//see https://github.com/krispo/angular-nvd3/issues/49 for more info

						//TODO: no idea why tooltips and size function dont work if d.size is not defined as in the no clustering case
						//the above remark seems to be old, i dont think tooltip works with size function, it seems to be related to an 
						//issue also mentioned here: https://github.com/novus/nvd3/issues/873 it might work better with a newer version!
						showLabels: true,
						transitionDuration: 500,
						labelThreshold: 0.01,
//						useInteractiveGuideline: true,
						interactive: true,

						tooltips: true,
						tooltipContent : function(key, x, y, e, graph) {
							return '<h3>' + key + '</h3>';
						},
						tooltipYContent : function(key, x, y) { return '<strong>' + key + '</strong>' },
						tooltipXContent : function(key, x, y, e) {
							return '<strong>' + x + '</strong>' 
						},
						xAxis: {
							tickFormat : function(d) {
								return d3.time.format(formatAndParser.format)(new Date(d))
							}
						},

						yAxis: {
							tickFormat : function() {
								return ""
							}
						},
						showLegend: false,
						noData:"sorry data not yet available",
					}
			};
			if(clustered) {
				options.chart.size = function(d){ return d.size; };
				options.chart.tooltipContent = function(key, x, y, e, graph) {
					var d = e.series.values[e.pointIndex];
					return '<h3>' + key + '</h3>' +
					'<p>instances started/ended around that time: <b>' + d.clusterSize;
				};
			}
//			if(formatAndParser.format == "%a %H:%M")
//			options.chart.height = 401;
//			else if ()
			return options;

		};

		GraphFactory.getOptionsForTimeDistributionGraph = function(bins, thresholds, parseX, colorScale){
			var options = {
					chart: {
						type: 'multiBarChart',
						height: 400,
						width: 1000,
						color: colorScale,
						showLabels: true,
						transitionDuration: 500,
						labelThreshold: 0.01,
						reduceXTicks : false, //we want all ticks to be displayed!
						// e is the mouse event
						tooltip : function(key, x, y, e, graph) {
							var String = (parseX(thresholds[e.point.x])).toFixed(2) + ' min - ' + (parseX(thresholds[e.point.x+1])).toFixed(2)+" min";
							return '<h3>' + key + '</h3>' +
							'<p>' + y + ' on ' +  String + '</p>'
						},
						xAxis: {
//							tickFormat: function(d) {return d3.time.format("%Y-%m-%dT%H:%M:%S")(new Date(d))}
//							tickFormat: function(d) {return d.toPrecision()}
							tickFormat: function(d) {return (d * (100/bins)).toFixed(0) + '-' + ((d+1)*(100/bins)).toFixed(0) + '%'},
							axisLabel : "% of range",
						},

						yAxis: {
							tickFormat: function(d){return d.toPrecision()}
						},
						noData:"sorry data not yet available",
					}
			};
			return options;

		}

		return GraphFactory;
	});
});