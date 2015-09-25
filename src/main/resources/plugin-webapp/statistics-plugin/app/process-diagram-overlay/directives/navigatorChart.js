'use strict'

ngDefine('cockpit.plugin.statistics-plugin.directives',  function(module) {

	//in html navigator-chart!!!
	module.directive('navigatorChart', ['$rootScope', function($rootScope){

		function formatTime(input) {
			var milliseconds = parseInt((Math.floor(input)%1000));
			var seconds = parseInt(Math.floor(input/1000)%60);
			var minutes = parseInt(Math.floor(input/(1000*60))%60);
			var hours = parseInt(Math.floor(input/(1000*60*60))%24);
			var days = parseInt(Math.floor(input/(1000*60*60*24)));


			if(hours < 0) hours = "00";
			else hours = (hours < 10) ? "0" + hours : hours;
			if(minutes < 0) minutes = "00";
			else minutes = (minutes < 10) ? "0" + minutes : minutes;
			if(seconds < 0) seconds = "00";
			else seconds = (seconds < 10) ? "0" + seconds : seconds;
			if(milliseconds < 0) milliseconds = "000";

			return days + ":" + hours + ":" + minutes + ":" + seconds + "." + milliseconds;
		}
		
		function getY(data, height, y) {
			var minmax = getMinMax(data);
			var value = height-y;
			var diff = minmax[1]-minmax[0];
			return (diff/height)*value;
		}

		function getMinMaxY(data) {
			var min = Number.MAX_VALUE, max = 0;
			angular.forEach(data, function(value, index) {
				if(value.y < min) min = value.y;
				if(value.y > max) max = value.y;
			});
			return [min, max];
		}
		
		function updateNavigator(start, end, data, navYScale, navHeight, navWidth) {
			
			var minDate = new Date(start);
			var maxDate = new Date(end);
//			minDate.setDate(minDate.getDate()-1);
//			maxDate.setDate(maxDate.getDate()+1);
			
			var navXScale = d3.time.scale()
				.domain([minDate, maxDate])
				.nice(d3.time.minute)
				.range([0, navWidth]);

			
			var navXAxis = d3.svg.axis()
				.scale(navXScale)
				.orient('bottom')
				.ticks(5);
			
			var viewport = d3.svg.brush()
				.x(navXScale)
				.on("brushend", function() {
					// update data for main chart -> send notification to controller
					$rootScope.$broadcast('datetimeRangeChanged', viewport.extent()[0], viewport.extent()[1]);
				});
			
			nv.addGraph(function() {
				
				// default: complete datetime range
				viewport.extent([minDate, maxDate]);
				
				var svg = d3.select("#navigator svg")
					.attr('width', navWidth+25)
					.attr('transform', 'translate(20,5)');
				
				svg.selectAll('*').remove();
				
				svg.append('g')
					.attr('class', 'x axis')
					.attr('transform', 'translate(0,' + navHeight + ')')
					.call(navXAxis);
				
				svg.selectAll("scatter-dots")
			      .data(data)
			      .enter().append("svg:circle")
			          .attr("cx", function (d,i) { 
			        	  return navXScale(d.datetime); } )
			          .attr("cy", function (d) { 
			        	  return navYScale(d.y); } )
			          .attr("r", 4);
				
				svg.append('g')
					.attr('class', 'viewport')
					.call(viewport)
					.selectAll('rect')
						.attr('height', navHeight);
				
				// draw left and right border of brush (styling with border-left/right is not possible for rect)
				d3.select('.resize.e rect').remove();
				d3.select('.resize.e')
					.append('rect')
					.attr('x', 0)
					.attr('y', 0)
					.attr('width', 3)
					.attr('height', 105);				
				d3.select('.resize.w rect').remove();
				d3.select('.resize.w')
					.append('rect')
					.attr('x', 0)
					.attr('y', 0)
					.attr('width', 3)
					.attr('height', 105);
			});
		}
		
		
		d3.selection.prototype.moveToBack = function() { 
		    return this.each(function() { 
		        var firstChild = this.parentNode.firstChild; 
		        if (firstChild) { 
		            this.parentNode.insertBefore(this, firstChild); 
		        } 
		    }); 
		};
		
		function updateData(origData, start, end) {
			var endTime;
			var data = [];
			for(var i=0; i<origData.length; i++) {
				endTime = Date.parse(origData[i].end);
				if(endTime >= start && endTime <= end)
					data.push(origData[i]);
			}
			return data;
		}

		function datetimeToMs(datetime) {
			return Date.parse(datetime);
		}

		function stringToDatestring(string) {
			var splitted = string.split('T');
			var date = splitted[0];
			var datesplitted = date.split('-');
			return "'" + datesplitted[0] + "-" + datesplitted[1] + "-" + datesplitted[2] + "'";
		}
		
		function dateToDatestring(date) {
			return "'" + date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + "'";
		}
		
		function msToDatetimeString(time) {
			var datetime = (new Date(time)).toString().split(' ');
			return datetime[0] + ", " + datetime[2] + " " + datetime[1] + " " + datetime[3] + ", " + datetime[4];
		}

		function stringToDate(string) {
			var splitted = string.split('T');
			var date = splitted[0];
			var datesplitted = date.split('-');
			var time = splitted[1];
			var timesplitted = time.split(':');
			return new Date(datesplitted[0], datesplitted[1]-1, datesplitted[2], timesplitted[0], timesplitted[1], timesplitted[2]);
		}
		
		function link($scope,element,attrs){
			
			var origData, navYScale;
			var navWidth = 550;
			var navHeight = 100;
			
//			$scope.$watch('data', function() {
				
				origData = $scope.data;
				
				var times = [];
				for(var i in origData) {
					if(times.indexOf(origData[i].end)==-1) times.push(origData[i].end);
				}
	//			times.sort().reverse();
				
				$scope.start = {
						datetime: times[0],
						dateOptions: {
							minDate: times[0],
							maxDate: times[times.length-1]
						},
						timeOptions: {
							min: times[0],
							max: times[times.length-1]
						},
						isOpen: false
				};
	
				$scope.end = {
						datetime: times[times.length-1],
						dateOptions: {
							minDate: times[0],
							maxDate: times[times.length-1]
						},
						timeOptions: {
							min: times[0],
							max: times[times.length-1]
						},
						isOpen: false
				};
				
				$scope.openStart = function($event) {
					$event.preventDefault();
					$event.stopPropagation();
	
					$scope.end.isOpen = false;
					$scope.start.isOpen = true;
				};
	
				$scope.openEnd = function($event) {
					$event.preventDefault();
					$event.stopPropagation();
	
					$scope.start.isOpen = false;
					$scope.end.isOpen = true;
				};
	
				
				// draw navigation chart
				
				var minmaxY = getMinMaxY(origData);
				var yMin = minmaxY[0];
				var yMax = minmaxY[1];
				navYScale = d3.scale.linear()
				.domain([yMin, yMax])
				.range([navHeight, 0]);
				
				var minDate = $scope.start.dateOptions.minDate;
				var maxDate = $scope.end.dateOptions.maxDate;
				
				updateNavigator(minDate, maxDate, $scope.data, navYScale, navHeight, navWidth);
//			}, true);
			
			$scope.updatePlot = function() {
				// check time (does not work in ui.bootstrap...)
				if($scope.start.datetime < $scope.start.dateOptions.minDate) $scope.start.datetime = $scope.start.dateOptions.minDate;
				if($scope.end.datetime > $scope.end.dateOptions.maxDate) $scope.end.datetime = $scope.end.dateOptions.maxDate;
				if($scope.start.datetime > $scope.end.datetime) $scope.start.datetime = $scope.end.datetime;
				
				// update min and max datetimes
				$scope.start.dateOptions.maxDate = $scope.end.datetime;
				$scope.end.dateOptions.minDate = $scope.start.datetime;
				
				var updatedData = updateData(origData, $scope.start.datetime, $scope.end.datetime);
				updateNavigator($scope.start.datetime.getTime(), $scope.end.datetime.getTime(), updatedData, navYScale, navHeight, navWidth);
				$rootScope.$broadcast('datetimeRangeChanged', datetimeToMs($scope.start.datetime), datetimeToMs($scope.end.datetime));
			}
		}
		
		return {
			link: link,
			restrict: 'E',
			scope: { 
						data: '='
					},
			template:
				'<table ng-init="updatePlot()">' +
					'<tr>' +
						'<td>' +
							'<label class="control-label">Start of considerated time period:</label>' +
							'<p class="input-group" style="width: 250px; position: relative; z-index: 1000000 !important;">' +
								'<input type="text" class="form-control" datetime-picker="EEE, dd MMM yyyy, HH:mm" ng-model="start.datetime" ng-change="updatePlot()" is-open="start.isOpen" min-date="start.dateOptions.minDate" max-date="start.dateOptions.maxDate"/>' +
								'<span class="input-group-btn">' +
									'<button type="button" class="btn btn-default" ng-click="openStart($event)">' +
										'<i class="glyphicon glyphicon-calendar"></i>' +
										'</button>' +
								'</span>' +
							'</p>' +
							'<label class="control-label">End of considerated time period:</label>' +
							'<p class="input-group" style="width: 250px; position: relative; z-index: 100000 !important;">' +
								'<input type="text" class="form-control" datetime-picker="EEE, dd MMM yyyy, HH:mm" ng-model="end.datetime" ng-change="updatePlot()" is-open="end.isOpen" min-date="end.dateOptions.minDate" max-date="end.dateOptions.maxDate"/>' +
								'<span class="input-group-btn">' +
									'<button type="button" class="btn btn-default" ng-click="openEnd($event)">' +
										'<i class="glyphicon glyphicon-calendar"></i>' +
									'</button>' +
								'</span>' +
							'</p>' +
						'</td>' +
						'<td>' +
							'<div id="navigator"><svg /></div>' +
						'</td>' +
					'</tr>' +
				'</table>'
		}
	}])
});
