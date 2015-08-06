'use strict'

ngDefine('cockpit.plugin.statistics-plugin.directives',  function(module) {

	//in html activity-duration-chart!!!
	module.directive('activityDurationChart', function(){

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
		
		function link(scope,element,attrs){

//			var testdata = [];
//			testdata.push({data: [{x:1, y:2}, {x:2, y:5}, {x:3, y:6}, {x:4, y:2}, {x:5, y:1}], type: "line", color: "red"});
//			testdata.push({data: [{x:1, y:3}, {x:5, y:3}], type: "line", color: "blue"});
//			var testdata = [{key:"1", values:[{x:1, y:2}, {x:2, y:5}, {x:3, y:6}, {x:4, y:2}, {x:5, y:1}], type:"line", color:"red", yAxis:1},
//			{key:"2", values:[{x:1, y:4}, {x:2, y:2}, {x:3, y:1}, {x:4, y:4}, {x:5, y:6}], type:"sparkline", color:"blue", yAxis:1}];
			var testdata = [{x:new Date(), y:2}, {x:new Date(), y:5}, {x:new Date(), y:6}, {x:new Date(), y:2}, {x:new Date(), y:1}];

//			nv.addGraph(function() {
//			var chart = nv.models.multiChart()
//			.margin({top: 30, right: 60, bottom: 50, left: 70})
//			.color(d3.scale.category10().range());
//			chart.xAxis.tickFormat(d3.format(',f'));
//			chart.yAxis1.tickFormat(d3.format(',f'));
//			d3.select('#chart svg')
//			.datum(testdata)
//			.transition().duration(500).call(chart);
//			return chart;
//			});

			nv.addGraph(function() {
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
				.datum(scope.data)
				.attr("height", 450)
				.call(chart);
				
				/*START draggable duration limits*/

				var yScale = chart.yScale();
				var minmax = getMinMax(scope.data);
//				var yScale = d3.scale.linear().domain([minmax[0], minmax[1]]).range([450, 0]);
				var yValue = scope.lowerDurationLimit;
				var width = 900;
				var color = "#FF7F0E";
				
				var drag_low = d3.behavior.drag()
					.on("dragstart", function(){
				        line_low.style("stroke", "red");
				        text_low.style("fill", "red");
				    })
				    .on("drag", function(d, i){
				    	if(yScale.invert(d3.event.y-margin.top) > scope.upperDurationLimit) {
				    		line_low.attr("y1", yScale(scope.upperDurationLimit)+2+margin.top);
					    	line_low.attr("y2", yScale(scope.upperDurationLimit)+2+margin.top);
					        text_low.attr("y", yScale(scope.upperDurationLimit)+7+margin.top);
					        scope.lowerDurationLimit = scope.upperDurationLimit;
//					        scope.lowerDurationLimit = getY(d, 430, d3.event.y-margin.top);
					        text_low.text(formatTime(scope.lowerDurationLimit));
				    	} else {
					    	line_low.attr("y1", d3.event.y+2);
					    	line_low.attr("y2", d3.event.y+2);
					        text_low.attr("y", d3.event.y+7);
					        scope.lowerDurationLimit = yScale.invert(d3.event.y-margin.top);
	//				        scope.lowerDurationLimit = getY(d, 430, d3.event.y-margin.top);
					        text_low.text(formatTime(scope.lowerDurationLimit));
				    	}
				    })
				    .on("dragend", function(){
				    	line_low.style("stroke", color);
				    	text_low.style("fill", color);
				    });
				
				var drag_high = d3.behavior.drag()
					.on("dragstart", function(){
						line_high.style("stroke", "red");
				        text_high.style("fill", "red");
				    })
				    .on("drag", function(d, i){
				    	if(yScale.invert(d3.event.y-margin.top) < scope.lowerDurationLimit) {
				    		line_high.attr("y1", yScale(scope.lowerDurationLimit)+2+margin.top);
				    		line_high.attr("y2", yScale(scope.lowerDurationLimit)+2+margin.top);
					        text_high.attr("y", yScale(scope.lowerDurationLimit)+7+margin.top);
					        scope.upperDurationLimit = scope.lowerDurationLimit;
//					        scope.lowerDurationLimit = getY(d, 430, d3.event.y-margin.top);
					        text_high.text(formatTime(scope.upperDurationLimit));
				    	} else {
				    		line_high.attr("y1", d3.event.y+2);
				    		line_high.attr("y2", d3.event.y+2);
					        text_high.attr("y", d3.event.y+7);
					        scope.upperDurationLimit = yScale.invert(d3.event.y-margin.top);
	//				        scope.upperDurationLimit = getY(d, 430, d3.event.y-margin.top);
					        text_high.text(formatTime(scope.upperDurationLimit));
				    	}
				    })
				    .on("dragend", function(){
				    	line_high.style("stroke", color);
				    	text_high.style("fill", color);
				    });
				
				var area = d3.svg.area()
				    .x(function(d) { 
				    	return d.x;
				    })
				    .y0(function(d) {
				    	return d.y;
				    })
				    .y1(function(d) {
				    	return d.y0;
				    });
				
				var areaData = [ { "x": margin.left-10,   "y": yScale(scope.lowerDurationLimit)-margin.top, "y0": yScale(scope.lowerDurationLimit)-margin.top},  { "x": 730,  "y": yScale(scope.lowerDurationLimit)-margin.top, "y0": yScale(scope.lowerDurationLimit)-margin.top}];
				
				var svg = d3.select("#chart svg");
				
				svg.append("path")
				.datum(areaData)
		        .attr("class", "area")
		        .attr("d", area);
				
				svg.append("line")
				.style("stroke", color)
				.style("stroke-width", "2.5px")
				.attr("x1", margin.left-10)
				.attr("y1", yScale(minmax[1])+margin.top+2)
				.attr("x2", 730)
				.attr("y2", yScale(minmax[1])+margin.top+2)
				.attr("class", "draggable_high");
				scope.upperDurationLimit = minmax[1];
				
				svg.append("line")
				.style("stroke", color)
				.style("stroke-width", "2.5px")
				.attr("x1", margin.left-10)
				.attr("y1", yScale(minmax[0])+margin.top+2)
				.attr("x2", 730)
				.attr("y2", yScale(minmax[0])+margin.top+2)
				.attr("class", "draggable_low");
				scope.lowerDurationLimit = minmax[0];
				
				var line_high = d3.select(".draggable_high")
					.call(drag_high);
				
				var line_low = d3.select(".draggable_low")
					.call(drag_low);
				
				svg.append("text")
				.style("fill", color)
				.attr("x", 50)
				.attr("y", yScale(minmax[0])+7+margin.top)
				.attr("text-anchor", "middle")
				.text(formatTime(minmax[0]))
				.attr("class", "limitText_low");
				
				svg.append("text")
				.style("fill", color)
				.attr("x", 50)
				.attr("y", yScale(minmax[1])+7+margin.top)
				.attr("text-anchor", "middle")
				.text(formatTime(minmax[1]))
				.attr("class", "limitText_high");
				
				var text_low = d3.select(".limitText_low");
				
				var text_high = d3.select(".limitText_high");
				
				/*END draggable duration limits*/

				return chart;
			});
			
		}
		return {
			link: link,
			restrict: 'E',
			scope: { data: '=',
					 lowerDurationLimit: '=',
					 upperDurationLimit: '='
			},
			template: '<div id="chart"><svg/></div>'
		}
	}
	)
});
