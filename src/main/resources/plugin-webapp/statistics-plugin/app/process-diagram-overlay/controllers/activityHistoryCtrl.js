/*
 * TODO:
 * - duration-Felder an durationRange anbinden
 * - range updaten beim draggen
 * - min/max beim draggen updaten (lower sollte nicht über upper gezogen werden)
 * - x-achse: nur min und max anzeigen
 * - label an duration upper and lower (oder an y-achse?)
 * - Einstellungen schöner machen
 * - batch zum Öffnen des Modals
 */


'use strict'
ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {

	module.filter('formatTime', function() {
		return function(input) {
			var milliseconds = parseInt((input%1000))
			, seconds = parseInt((input/1000)%60)
			, minutes = parseInt((input/(1000*60))%60)
			, hours = parseInt((input/(1000*60*60)));

			hours = (hours < 10) ? "0" + hours : hours;
			minutes = (minutes < 10) ? "0" + minutes : minutes;
			seconds = (seconds < 10) ? "0" + seconds : seconds;

			return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
		}
	});

	module.controller('activityHistoryCtrl', ['$scope', '$modalInstance', 'DataFactory', 'SettingsFactory', 'activityId', '$filter', function($scope, $modalInstance, DataFactory, SettingsFactory, activityId, $filter){
		
		$scope.$on('durationLimitChanged', function() {
			getInstanceCount(SettingsFactory.lowerDurationLimitInMs, SettingsFactory.upperDurationLimitInMs);
			$scope.$apply();
		});
		
		var durations = {
				name: "durations",
				type: "spline",
				data: [],
				marker: {
					enabled: true
				},
				draggableY: false
		};
		
		$scope.lowerLimit = {
				inMs: 180000,
				hours: 0,
				minutes: 3,
				seconds: 0,
				milliseconds: 0
		};
		
		$scope.upperLimit = {
				inMs: 72000000,
				hours: 1,
				minutes: 0,
				seconds: 0,
				milliseconds: 0
		};
		
		$scope.calcDurationUpperLimit = function() {
			$scope.upperLimit.inMs = (($scope.upperLimit.hours*60+$scope.upperLimit.minutes)*60+$scope.upperLimit.seconds)*1000+$scope.upperLimit.milliseconds;
			getInstanceCount($scope.lowerLimit.inMs, $scope.upperLimit.inMs);
			updateDurationRange();
		};
		
		$scope.calcDurationLowerLimit = function() {
			$scope.lowerLimit.inMs = (($scope.lowerLimit.hours*60+$scope.lowerLimit.minutes)*60+$scope.lowerLimit.seconds)*1000+$scope.lowerLimit.milliseconds;
			getInstanceCount($scope.lowerLimit.inMs, $scope.upperLimit.inMs);
			updateDurationRange();
		}

		var durationLowerLimit = {
				name: "durationLowerLimit",
				type: "line",
				color: "rgb(181, 21, 43)",
				data: [],
				marker: {
					enabled: false
				},
//				states: {
//				hover: {
//				lineWidth: 0
//				}
//				},
//				enableMouseTracking: true,
				draggable: true,
				draggableY: true,
				draggableSeries: true,
				cursor: "ns-resize",
				point: {
					events: {
						drag: function(e) {
							$scope.lowerLimit.inMs = e.y;
						},
						drop: function() {
							if(this.y < 0) this.y = 0;
							else if(this.y > $scope.upperLimit.inMs) this.y = $scope.upperLimit.inMs;
							$scope.lowerLimit.inMs = this.y;
							updateDurationRange();
							getInstanceCount(this.y, $scope.upperLimit.inMs);
							updateLowerDurationLimit(this.y);
						}
					}
				},
				showInLegend: false
		};
		var durationUpperLimit = {
				name: "durationUpperLimit",
				type: "line",
				color: "rgb(181, 21, 43)",
				data: [],
				marker: {
					enabled: false
				},
//				states: {
//				hover: {
//				lineWidth: 0
//				}
//				},
//				enableMouseTracking: true,
				draggable: true,
				draggableY: true,
				draggableSeries: true,
				cursor: "ns-resize",
				point: {
					events: {
						drag: function(e) {
							$scope.upperLimit.inMs = e.y;
						},
						drop: function() {
							if(this.y < $scope.lowerLimit.inMs) this.y = $scope.lowerLimit.inMs;
							$scope.upperLimit.inMs = this.y;
							updateDurationRange();
							getInstanceCount($scope.lowerLimit.inMs, this.y);
							updateUpperDurationLimit(this.y);
						}
					}
				},
				showInLegend: false
		};

		var durationLimitRange = {
			name: "durationLimitRange",
			type: "arearange",
			color: "rgba(181, 21, 43, 0.2)",
			data: [],
			marker: {
				enabled: false
			},
			enableMouseTracking: false
		};

		var data = DataFactory.activityDurations[activityId];
		var times = [];
		for(var i in data) {
			if(times.indexOf(data[i].endTime)==-1) times.push(data[i].endTime);
		}
		times.sort();
		$scope.timeOptions = times;

//		$scope.slider = {
//				start: datetimeToMs($scope.timeOptions[0]),
//				end: datetimeToMs($scope.timeOptions[$scope.timeOptions.length-1]),
//				value: "" + datetimeToMs($scope.timeOptions[0]) + ";" + datetimeToMs($scope.timeOptions[$scope.timeOptions.length-1])
//		};
//
		$scope.start = {
				datetime: stringToDate($scope.timeOptions[0]),
				dateOptions: {
					minDate: stringToDatestring($scope.timeOptions[0]),
					maxDate: stringToDatestring($scope.timeOptions[$scope.timeOptions.length-1]),
				},
				isOpen: false
		};

		$scope.end = {
				datetime: stringToDate($scope.timeOptions[$scope.timeOptions.length-1]),
				dateOptions: {
					minDate: stringToDatestring($scope.timeOptions[0]),
					maxDate: stringToDatestring($scope.timeOptions[$scope.timeOptions.length-1])
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

		$scope.init = function() {
			$scope.durationLimit = SettingsFactory.durationLimitInMs;
			$scope.showPlot();
		}

		$scope.closeModal = function() {
			$modalInstance.close();
		}

		$scope.hasOnlyOneValue = function() {
			if ($scope.slider.start == $scope.slider.end)
				return true;
			return false;
		}

		$scope.showPlot = function() {
			var data = DataFactory.activityDurations[activityId];
			var filteredData = [];
			var datetime;
			durations.data = [];
			var start = datetimeToMs($scope.start.datetime);
			var end = datetimeToMs($scope.end.datetime);
			var min = Number.MAX_VALUE;
			var max = 0;
			for(var i in data) {
				datetime = datetimeToMs(stringToDate(data[i].endTime));
				if(datetime >= start && datetime <= end) {
					filteredData.push({
					"x": i,
					"y": data[i].duration,
					"activityId": data[i].id,
					"start": stringToDate(data[i].startTime),
					"end": stringToDate(data[i].endTime),
					"assignee": data[i].assignee
					});
					durations.data.push([datetimeToMs(data[i].endTime), data[i].duration]);
					if(data[i].duration < min) min = data[i].duration;
					if(data[i].duration > max) max = data[i].duration;
				}
			}
			SettingsFactory.lowerDurationLimitInMs = min;
			SettingsFactory.upperDurationLimitInMs = max;
			
			updateDurationRange();
			
			$scope.historicActivityPlotData = filteredData;

			getInstanceCount(SettingsFactory.lowerDurationLimitInMs, SettingsFactory.upperDurationLimitInMs);
		}
				
		function updateLowerDurationLimit(time) {
			$scope.lowerLimit.milliseconds = parseInt((time%1000))
			$scope.lowerLimit.seconds = parseInt((time/1000)%60)
			$scope.lowerLimit.minutes = parseInt((time/(1000*60))%60)
			$scope.lowerLimit.hours = parseInt((time/(1000*60*60)));
		}
		
		function updateUpperDurationLimit(time) {
			$scope.upperLimit.milliseconds = parseInt((time%1000))
			$scope.upperLimit.seconds = parseInt((time/1000)%60)
			$scope.upperLimit.minutes = parseInt((time/(1000*60))%60)
			$scope.upperLimit.hours = parseInt((time/(1000*60*60)));
		}
		
		function updateDurationRange() {
			durationLowerLimit.data = [[durations.data[0][0], $scope.lowerLimit.inMs], [durations.data[durations.data.length-1][0], $scope.lowerLimit.inMs]];
			durationUpperLimit.data = [[durations.data[0][0], $scope.upperLimit.inMs], [durations.data[durations.data.length-1][0], $scope.upperLimit.inMs]];
			durationLimitRange.data = [[durationLowerLimit.data[0][0], $scope.lowerLimit.inMs, $scope.upperLimit.inMs], [durationLowerLimit.data[1][0], $scope.lowerLimit.inMs, $scope.upperLimit.inMs]];
	
		}

		function getInstanceCount(lowerLimit, upperLimit) {
			$scope.instanceCountBelowLimitRange = 0;
			$scope.instanceCountInLimitRange = 0;
			$scope.instanceCountAboveLimitRange = 0;
			var time;
			angular.forEach(durations.data, function(point, index) {
				time = point[1];
				if (time < lowerLimit) $scope.instanceCountBelowLimitRange++;
				else if (time <= upperLimit) $scope.instanceCountInLimitRange++;
				else $scope.instanceCountAboveLimitRange++;
			});
			$scope.instanceCount = durations.data.length;
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

//		function msToTimeUnit(time) {
//		switch($scope.selectedTimeUnit) {
//		case "hr": return (time/1000/60/60).toFixed(2);
//		case "min": return (time/1000/60).toFixed(2);
//		case "sec": return (time/1000).toFixed(2);
//		}
//		}

		function formatDate(date) {
			return date.toUTCString();
			//return date.toLocaleDateString() + ", " + date.toLocaleTimeString();
		}

		$scope.options = {
				chart: {
					type: 'sparklinePlus',
					height: 450,
					x: function(d, i) {
						return i;
					},
					xTickFormat: function(d) {
						return d3.time.format('%b %d, %I:%M %p')(new Date($scope.historicActivityPlotData[d].end.getTime()));
					},
					y: function(d, i) {
						return d.y;
					},
					yTickFormat: function(d) {
						return $filter('formatTime')(d);
					},
					transitionDuration: 250,
					sparkline: {
						width: 300,
						height: 32,
						animate: true,
						margin: {
							top: 2,
							right: 0,
							bottom: 2,
							left: 0
						}
					},
					width: null,
					animate: true,
					margin: {
						top: 15,
						right: 100,
						bottom: 10,
						left: 120
					},
					showLastValue: true,
					alignValue: true,
					rightAlignValue: false,
					noData: "No durations available requirements",
					color: function(d, i) {
						if(Array.isArray(d) && d[i].y <= SettingsFactory.durationLimitInMs) return 'rgb(70, 136, 71)';
						else if(Array.isArray(d) && d[i].y > SettingsFactory.durationLimitInMs) return 'rgb(181, 21, 43)';
					}
				}
		};

		$scope.chartConfig = {
//				var chart = new Highcharts.Chart({
				options: {
					xAxis: {
//						type: 'datetime',
//						dateTimeLabelFormats: { // don't display the dummy year
//							month: '%e. %b',
//							year: '%b'
//						},
						lineWidth: 0,
						gridLineWidth: 0,
						minorGridLineWidth: 0,
						lineColor: 'transparent',         
						labels: {
							enabled: false
						},
						minorTickLength: 0,
						tickLength: 0,
						title: {
							text: null
						}
					},
					title: {
						text: null
					},
					yAxis: {
						// plotBands für ausgewählten durations-Bereich
						lineWidth: 0,
						gridLineWidth: 0,
						minorGridLineWidth: 0,
						lineColor: 'transparent',         
						labels: {
							enabled: false
						},
						minorTickLength: 0,
						tickLength: 0,
						title: {
							text: null
						}
					},
					tooltip: {
//						crosshairs: true,
						formatter: function() {
							if(this.series.name == "durations") {
								var s = '<b>' + msToDatetimeString(this.x) + '</b>';
								s += '<br/>duration: ' + $filter('formatTime')(this.y);
								return s;
							}
							else if (this.series.name == "durationLowerLimit") {
								var s = '<b>Lower duration Limit</b>';
								s += '<br/>' + $filter('formatTime')(this.y);
								return s;
							}
							else if (this.series.name == "durationUpperLimit") {
								var s = '<b>Upper duration Limit</b>';
								s += '<br/>' + $filter('formatTime')(this.y);
								return s;
							}
						}
					},
					plotOptions: {
			            series: {
			                fillOpacity: 0.1
			            }
			        }
				},
				series: [ durationLimitRange,
				          durations,
				          durationLowerLimit,
				          durationUpperLimit ]
		};

	}]);
});