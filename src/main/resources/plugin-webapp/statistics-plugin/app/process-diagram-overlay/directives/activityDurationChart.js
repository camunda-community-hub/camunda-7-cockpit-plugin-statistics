'use strict'

ngDefine('cockpit.plugin.statistics-plugin.directives',  function(module) {

	//in html activity-duration-chart!!!
	module.directive('activityDurationChart', ['SettingsFactory', '$rootScope', function(SettingsFactory, $rootScope){

		function formatTime(input) {
			var milliseconds = parseInt((input%1000));
			var seconds = parseInt((input/1000)%60);
			var minutes = parseInt((input/(1000*60))%60);
			var hours = parseInt((input/(1000*60*60)));

			if(hours < 0) hours = "00";
			else hours = (hours < 10) ? "0" + hours : hours;
			if(minutes < 0) minutes = "00";
			else minutes = (minutes < 10) ? "0" + minutes : minutes;
			if(seconds < 0) seconds = "00";
			else seconds = (seconds < 10) ? "0" + seconds : seconds;
			if(milliseconds < 0) milliseconds = "000";

			return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
		}

		function getY(data, height, y) {
			var minmax = getMinMax(data);
			var value = height-y;
			var diff = minmax[1]-minmax[0];
			return (diff/height)*value;
		}

		function getMinMax(data) {
			var min = Number.MAX_VALUE, max = 0;
			angular.forEach(data, function(value, index) {
				if(value.y < min) min = value.y;
				if(value.y > max) max = value.y;
			});
			return [min, max];
		}
		
		function updateArea(svg, yScale, margin) {
			var area = d3.svg.area()
			.x(function(d) { 
				return d.x;
			})
			.y0(function(d) {
				return d.y1;
			})
			.y1(function(d) {
				return d.y2;
			});

			var areaData = [
			    {
			    	"x": margin.left-10,
			    	"y1": yScale(SettingsFactory.lowerDurationLimitInMs)+margin.top+2,
			    	"y2": yScale(SettingsFactory.upperDurationLimitInMs)+margin.top+2
			    },
				{ 
			    	"x": 730,
			    	"y1": yScale(SettingsFactory.lowerDurationLimitInMs)+margin.top+2,
					"y2": yScale(SettingsFactory.upperDurationLimitInMs)+margin.top+2
			    }];
			
			var path = svg.selectAll('.area').data([areaData]);
			path.attr("d", area).attr("class", "area");
			path.enter().append('svg:path').attr("d", area).attr("class", "area");
			path.exit().remove();
		}

		function link(scope,element,attrs){

			scope.$watch('data', function() {
				nv.addGraph(function() {
					// clear svg
					d3.selectAll("svg > *").remove();
					
					var margin = { top: 30, right: 80, bottom: 60, left: 110 };
	
					var chart = nv.models.sparklinePlus();
					chart.margin(margin)
					.x(function(d,i) { return i })
					.xTickFormat(function(d) {
						return d3.time.format('%b %d, %I:%M %p')(new Date(scope.data[d].end.getTime()));
					})
					.yTickFormat(function(d) {
						return formatTime(d);
					})
					.width(800);
					var svg = d3.select('#chart svg')
					.data([scope.data])
					.attr("height", 450)
					.call(chart);
	
					/*START draggable duration limits*/
	
					// default at beginning: duration limits are minimum and maximum durations for activity
					var minmax = getMinMax(scope.data);
					SettingsFactory.lowerDurationLimitInMs = minmax[0];
					SettingsFactory.upperDurationLimitInMs = minmax[1];
	
					var yScale = chart.yScale();
	//				var yScale = d3.scale.linear().domain([minmax[0], minmax[1]]).range([450, 0]);
					var yValue = SettingsFactory.lowerDurationLimitInMs;
					var width = 900;
					var color = "#B5152B";
					var dragColor = "#08C";
	
	
					// define drag and drop behavior for both limits
					var drag_low = d3.behavior.drag()
					.on("dragstart", function(){
						line_low.style("stroke", dragColor);
						text_low.style("fill", dragColor);
					})
					.on("drag", function(d, i){
						if(yScale.invert(d3.event.y-margin.top) > SettingsFactory.upperDurationLimitInMs) {
							line_low.attr("y1", yScale(SettingsFactory.upperDurationLimitInMs)+2+margin.top);
							line_low.attr("y2", yScale(SettingsFactory.upperDurationLimitInMs)+2+margin.top);
							text_low.attr("y", yScale(SettingsFactory.upperDurationLimitInMs)+7+margin.top);
							SettingsFactory.lowerDurationLimitInMs = SettingsFactory.upperDurationLimitInMs;
	//						SettingsFactory.lowerDurationLimitInMs = getY(d, 430, d3.event.y-margin.top);
							text_low.text(formatTime(SettingsFactory.lowerDurationLimitInMs));
						} else {
							line_low.attr("y1", d3.event.y+2);
							line_low.attr("y2", d3.event.y+2);
							text_low.attr("y", d3.event.y+7);
							SettingsFactory.lowerDurationLimitInMs = yScale.invert(d3.event.y-margin.top);
	//						SettingsFactory.lowerDurationLimitInMs = getY(d, 430, d3.event.y-margin.top);
							text_low.text(formatTime(SettingsFactory.lowerDurationLimitInMs));
							updateArea(svg, yScale, margin);
							// broadcast "duration limit changed" event to controller for updating number of instances
							$rootScope.$broadcast('durationLimitChanged');
						}
					})
					.on("dragend", function(){
						line_low.style("stroke", color);
						text_low.style("fill", color);
					});
	
					var drag_high = d3.behavior.drag()
					.on("dragstart", function(){
						line_high.style("stroke", dragColor);
						text_high.style("fill", dragColor);
					})
					.on("drag", function(d, i){
						if(yScale.invert(d3.event.y-margin.top) < SettingsFactory.lowerDurationLimitInMs) {
							line_high.attr("y1", yScale(SettingsFactory.lowerDurationLimitInMs)+2+margin.top);
							line_high.attr("y2", yScale(SettingsFactory.lowerDurationLimitInMs)+2+margin.top);
							text_high.attr("y", yScale(SettingsFactory.lowerDurationLimitInMs)+7+margin.top);
							SettingsFactory.upperDurationLimitInMs = SettingsFactory.lowerDurationLimitInMs;
	//						SettingsFactory.upperDurationLimitInMs = getY(d, 430, d3.event.y-margin.top);
							text_high.text(formatTime(SettingsFactory.upperDurationLimitInMs));
						} else {
							line_high.attr("y1", d3.event.y+2);
							line_high.attr("y2", d3.event.y+2);
							text_high.attr("y", d3.event.y+7);
							SettingsFactory.upperDurationLimitInMs = yScale.invert(d3.event.y-margin.top);
	//						SettingsFactory.upperDurationLimitInMs = getY(d, 430, d3.event.y-margin.top);
							text_high.text(formatTime(SettingsFactory.upperDurationLimitInMs));
							updateArea(svg, yScale, margin);
							// broadcast "duration limit changed" event to controller for updating number of instances
							$rootScope.$broadcast('durationLimitChanged');
						}
					})
					.on("dragend", function(){
						line_high.style("stroke", color);
						text_high.style("fill", color);
					});
	
					var svg = d3.select("#chart svg");
	
					// draw duration limit area (between both limit lines)
					updateArea(svg, yScale, margin);
	
					// draw upper duration limit
					svg.append("line")
					.style("stroke", color)
					.style("stroke-width", "2.5px")
					.attr("x1", margin.left-10)
					.attr("y1", yScale(SettingsFactory.upperDurationLimitInMs)+margin.top+2)
					.attr("x2", 730)
					.attr("y2", yScale(SettingsFactory.upperDurationLimitInMs)+margin.top+2)
					.attr("class", "draggable_high");
	
					// draw lower duration limit
					svg.append("line")
					.style("stroke", color)
					.style("stroke-width", "2.5px")
					.attr("x1", margin.left-10)
					.attr("y1", yScale(SettingsFactory.lowerDurationLimitInMs)+margin.top+2)
					.attr("x2", 730)
					.attr("y2", yScale(SettingsFactory.lowerDurationLimitInMs)+margin.top+2)
					.attr("class", "draggable_low");
	
					var line_high = d3.select(".draggable_high")
					.call(drag_high);
	
					var line_low = d3.select(".draggable_low")
					.call(drag_low);
	
					// draw label for lower duration limit
					svg.append("text")
					.style("fill", color)
					.attr("x", 50)
					.attr("y", yScale(SettingsFactory.lowerDurationLimitInMs)+7+margin.top)
					.attr("text-anchor", "middle")
					.text(formatTime(SettingsFactory.lowerDurationLimitInMs))
					.attr("class", "limitText_low");
	
					// draw label for upper duration limit
					svg.append("text")
					.style("fill", color)
					.attr("x", 50)
					.attr("y", yScale(SettingsFactory.upperDurationLimitInMs)+7+margin.top)
					.attr("text-anchor", "middle")
					.text(formatTime(SettingsFactory.upperDurationLimitInMs))
					.attr("class", "limitText_high");
	
					var text_low = d3.select(".limitText_low");
	
					var text_high = d3.select(".limitText_high");
					
					/*END draggable duration limits*/
	
					return chart;
				});
			});
		}
		
		return {
			link: link,
			restrict: 'E',
			scope: { data: '=' },
			template: '<div id="chart"><svg/></div>'
		}
	}])
});
