'use strict'

ngDefine('cockpit.plugin.statistics-plugin.shared-directives', function(module) {

	module.directive('navigator', ['$rootScope', 'Format', function($rootScope, Format){

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

		// format data for Format.getKMeansClusterFromFormatedData
		var formatData = function(data) {
			var values = [];
			angular.forEach(data, function(item) {
				values.push({
					"durationInMillis": item.y,
					"endTime": item.datetime,
					"startTime": null,
					"processDefinitionId": item.processDefId,
					"processDefinitionKey": item.processKey
				});
			})
			return [{
				"key": data[0].processKey,
				"values": values
			}];
		}

		function updateNavigator(start, end, data, navYScale, navHeight, navWidth, $scope) {

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
				$scope.start.datetime = viewport.extent()[0];
				$scope.end.datetime = viewport.extent()[1];
				updateNavigator($scope.start.datetime, $scope.end.datetime, data, navYScale, navHeight, navWidth, $scope);
			});

			/*** START cluster data ***/

			var numberOfInstancesMap = {};
			numberOfInstancesMap[data[0].processKey] = {
					"endedInst": data.length,
					"numberOfClusters": 1000
			};

			// taken from TiminFactory
			var formatAndParser = {
					format: "%Y-%m-%dT%H", 
					parser: d3.time.format("%Y-%m-%dT%H:%M:%S").parse 
			}

//			var clusteredData = Format.getKMeansClusterFromFormatedData(formatData(data), formatAndParser, "endTime", numberOfInstancesMap);
			
//			 var clusteredData = clusterfck.kmeans(formatData(data)[0].values, 1000);

			/*** END cluster data ***/

			nv.addGraph(function() {

				// default: complete datetime range
				viewport.extent([minDate, maxDate]);

				var svg = d3.select("#navigator svg")
				.attr('width', navWidth+40)
				.attr('transform', 'translate(20,5)');

				svg.selectAll('*').remove();

				svg.append('g')
				.attr('class', 'x axis')
				.attr('transform', 'translate(0,' + navHeight + ')')
				.call(navXAxis);

				svg.selectAll("scatter-dots")
				.data(data)
//				.data(clusteredData)
				.enter().append("svg:circle")
				.attr("cx", function (d,i) { 
//					return navXScale(d.centroid.endTime); } )
					return navXScale(d.datetime); } )
//				.attr("cy", 10)
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

		function getMinMaxDatetime(data) {
			var times = [];
			for(var i in data) {
				if(times.indexOf(data[i].end)==-1) times.push(data[i].end);
			}
			//			times.sort().reverse();
			return [times[0], times[times.length-1]];
		}

		function init($scope, initData) {
			$scope.data = initData;

			var minMax = getMinMaxDatetime(initData);
			var min = minMax[0];
			var max = minMax[1];

			$scope.start = {
					datetime: min,
					dateOptions: {
						minDate: min,
						maxDate: max
					},
					timeOptions: {
						min: min,
						max: max
					},
					isOpen: false
			};

			$scope.end = {
					datetime: max,
					dateOptions: {
						minDate: min,
						maxDate: max
					},
					timeOptions: {
						min: min,
						max: max
					},
					isOpen: false
			};
		}

		function link($scope,element,attrs){

			var origData, navYScale;
			var navWidth = 750;
			var navHeight = 100;

			// store original data
			var initData = $scope.data;
			
			init($scope, initData);

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

			$scope.$watch('data', function() {

				origData = $scope.data;

				// draw navigation chart

				var minmaxY = getMinMaxY(origData);
				var yMin = minmaxY[0];
				var yMax = minmaxY[1];
				navYScale = d3.scale.linear()
				.domain([yMin, yMax])
				.range([navHeight, 0]);

				var minDate = $scope.start.datetime;
				var maxDate = $scope.end.datetime;

				updateNavigator(minDate, maxDate, $scope.data, navYScale, navHeight, navWidth, $scope);
			}, true);

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
			
			$scope.hideNavigatorChart = function($event) {
				$event.preventDefault();
				$event.stopPropagation();
				hideNavigatorChart = true;
			}
			
			$scope.showNavigatorChart = function($event) {
				$event.preventDefault();
				$event.stopPropagation();
				hideNavigatorChart = false;
			}
			
			$scope.shouldShowNavigatorChart = function() {
				return !hideNavigatorChart;
			}
			
			$scope.showHideButton = function() {
				return (initData.length > instanceThreshold) ? true : false;
			}

			$scope.resetMinMaxDatetime = function($event) {
				$event.preventDefault();
				$event.stopPropagation();

				init($scope, initData);
			}

			$scope.showResetButton = function() {
				if(initData.length == $scope.data.length) return false;
				else return true;
			}
			
			var instanceThreshold = 1000;
			var hideNavigatorChart = $scope.showHideButton();
		}

		return {
			link: link,
			restrict: 'E',
			scope: { 
				data: '='
			},
			template:
				'<table ng-init="updatePlot()" style="width: 850px;">' +
				'<tr style="position: relative;">' +
				'<td align="left">' +
				'<button title="Edit start date" type="button" class="round-button small-button" ng-click="openStart($event)">' +
				'<i class="glyphicon glyphicon-wrench"></i>' +
				'</button>' +
				'<input readonly type="text" class="div-like" datetime-picker="EEE, dd MMM yyyy, HH:mm" ng-model="start.datetime" ng-change="updatePlot()" is-open="start.isOpen" min-date="start.dateOptions.minDate" max-date="start.dateOptions.maxDate"/>' +
				'</td>' +
				'<td align="center">' +
				'<button title="Reset minimum and maximum date" type="button" class="round-button small-button" ng-show="showResetButton()" ng-click="resetMinMaxDatetime($event)" style="margin-left:30px;">' +
				'<i class="glyphicon glyphicon-zoom-out"></i>' +
				'</button>' +
				'<button title="Hide navigator chart" type="button" class="round-button small-button" ng-show="showHideButton() && shouldShowNavigatorChart()" ng-click="hideNavigatorChart($event)" style="margin-left:30px;">' +
				'<i class="glyphicon glyphicon-eye-close"></i>' +
				'</button>' +
				'</td>' +
				'<td align="right">' +
				'<input readonly type="text" class="div-like right-align" datetime-picker="EEE, dd MMM yyyy, HH:mm" ng-model="end.datetime" ng-change="updatePlot()" is-open="end.isOpen" min-date="end.dateOptions.minDate" max-date="end.dateOptions.maxDate"/>' +
				'<button title="Edit end date" type="button" class="round-button small-button" ng-click="openEnd($event)">' +
				'<i class="glyphicon glyphicon-wrench"></i>' +
				'</button>' +
				'</td>' +
				'</tr>' +
				'<tr>' +
				'<td colspan="3">' +
				'<div ng-show="shouldShowNavigatorChart()" id="navigator"><svg style="-webkit-logical-width:775px; -webkit-padding-start:20px;"/></div>' +
				'<div ng-show="!shouldShowNavigatorChart()">' +
				'<div style="margin-top: 10px">Navigator chart is hidden due to a large amount of activity instances. You can define the range by editing the start and end dates above directly using the "edit" buttons. Displaying the navigator chart can worsen the performance. Display anyway:' +
				'<button title="Show navigator chart" type="button" class="round-button small-button" ng-click="showNavigatorChart($event)">' +
				'<i class="glyphicon glyphicon-eye-open"></i>' +
				'</button>' +
				'</div>' +
				'</div>' +
				'</td>' +
				'</tr>' +
				'</table>'
		}
	}])
});
