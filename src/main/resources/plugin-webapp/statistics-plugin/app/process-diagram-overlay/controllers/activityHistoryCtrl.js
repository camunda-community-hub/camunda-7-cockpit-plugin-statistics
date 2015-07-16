'use strict'
ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {

	module.controller('activityHistoryCtrl', ['$scope', '$modalInstance', 'DataFactory', 'activityId', function($scope, $modalInstance, DataFactory, activityId){

		var data = DataFactory.activityDurations[activityId];
		var times = [];
		for(var i in data) {
			if(times.indexOf(data[i].endTime)==-1) times.push(data[i].endTime);
		}
		times.sort();
		$scope.timeOptions = times;
		
		$scope.slider = {
			start: datetimeToMs($scope.timeOptions[0]),
			end: datetimeToMs($scope.timeOptions[$scope.timeOptions.length-1]),
			value: "" + datetimeToMs($scope.timeOptions[0]) + ";" + datetimeToMs($scope.timeOptions[$scope.timeOptions.length-1])
		};
		
		$scope.init = function() {			
			$scope.showPlot();
		}

//		$scope.timeUnitOptions = ["hr", "min", "sec"];
//		$scope.selectedTimeUnit = $scope.timeUnitOptions[1];

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
			var datetime, values, start, end;
			for(var i in data) {
				datetime = datetimeToMs(data[i].endTime);
				values = $scope.slider.value.split(';');
				start = values[0];
				end = values[1];
				if(datetime >= start && datetime <= end) {
					filteredData.push({
						"x": i,
						"y": data[i].duration,
						"activityId": data[i].id,
						"start": stringToDate(data[i].startTime),
						"end": stringToDate(data[i].endTime),
						"assignee": data[i].assignee
					}); 
				}
			}
			$scope.historicActivityPlotData =  filteredData;
		}
		
		function datetimeToMs(datetime) {
			return Date.parse(datetime);
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
//			switch($scope.selectedTimeUnit) {
//			case "hr": return (time/1000/60/60).toFixed(2);
//			case "min": return (time/1000/60).toFixed(2);
//			case "sec": return (time/1000).toFixed(2);
//			}
//		}

	function formatTime(time) {
//			var origTimeInMillis;
//			switch($scope.selectedTimeUnit) {
//				case "hr": origTimeInMillis = time*1000*60*60; break;
//				case "min": origTimeInMillis = time*1000*60; break;
//				case "sec": origTimeInMillis = time*1000; break;
//			}
			var milliseconds = parseInt((time%1000)/100)
			, seconds = parseInt((time/1000)%60)
			, minutes = parseInt((time/(1000*60))%60)
			, hours = parseInt((time/(1000*60*60))%24);

			hours = (hours < 10) ? "0" + hours : hours;
			minutes = (minutes < 10) ? "0" + minutes : minutes;
			seconds = (seconds < 10) ? "0" + seconds : seconds;

			return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
		}
		
		function formatDate(date) {
			return date.toUTCString();
			//return date.toLocaleDateString() + ", " + date.toLocaleTimeString();
		}
				
		$scope.optionsSlider = {
			from: $scope.slider.start,
			to: $scope.slider.end,
			step: 1,
		    css: {
		          background: {"background-color": "silver"},
		          before: {"background-color": "purple"},
		          default: {"background-color": "white"},
		          after: {"background-color": "green"},
		          pointer: {"background-color": "red"}          
		    },     
		 	floor: true,
		 	vertical: false,
		 	dimension: '',
		 	callback: function(value, released) {
		 		$scope.showPlot();
		 	},
		 	modelLabels: function(value) {
				var date = new Date(value);
				return date.toDateString();
			},
		 	realtime: true
		}
		
		$scope.optionsChart = {
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
						return formatTime(d);
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
					noData: "No durations available requirements"
				}
		};
		
//		$scope.optionsChart = {
//				chart: {
//					type: 'sparklinePlus',
//					height: 450,
//					x: function(d, i) {
//						return i;
//					},
//					xTickFormat: function(d) {
//						return d3.time.format('%b %d, %I:%M %p')(new Date($scope.historicActivityPlotData[0].values[d].end.getTime()));
//					},
//					y: function(d, i) {
//						return d.values[i].y;
//					},
//					yTickFormat: function(d) {
//						return d3.format("s")(d)+" "+$scope.selectedTimeUnit;
//					},
////					xScale: function (n) {
////						return o(n);
////					},
////					yScale: function (n) {
////						return o(n);
////					},
//					transitionDuration: 250,
//					sparkline: {
//						width: 300,
//						height: 32,
//						animate: true,
//						margin: {
//							top: 2,
//							right: 0,
//							bottom: 2,
//							left: 0
//						}
//					},
//					width: null,
//					animate: true,
//					margin: {
//						top: 15,
//						right: 100,
//						bottom: 10,
//						left: 150
//					},
//					showLastValue: true,
//					alignValu: true,
//					rightAlignValue: false,
//					noData: "No durations available requirements"
//				},
//				styles: {
//					classes: {
//						"with-3d-shadow": true,
//						"with-transitions": true,
//						"gallery": false
//					},
//					css: {}
//				}
//		};
		
//		$scope.optionsChart = {
//				chart: {
//					type: 'lineChart',
//					height: 450,
//					x: function(d){return d.end.getTime();},
//					y: function(d){return d.y;},
//					showLabels: true,
//					yAxis: { 
//						axisLabel: "duration",
//						showMaxMin: false,
//						tickFormat:function(d) {
//							return d3.format("s")(d)+" "+$scope.selectedTimeUnit;
//						}
//					},
//					xAxis: { 
//						axisLabel: "",
//						tickFormat: function(d) { 
//							return d3.time.format('%b %d, %I:%M %p')(new Date(d));
//						}
//					},
//					transitionDuration: 500,
//					labelThreshold: 0.9,
//					tooltips: true,
//					tooltipContent: function(key, x, y, e, graph){
//						return '<h3>'+formatTime(e.point.y)+' (hh:mm:ss)</h3>'+
//						'<br><p>id: <b>'+
//						e.point.activityId+'</b>'+
//						'<br>start date: <b>'+
//						formatDate(e.point.start) +'</b>'+
//						'<br>end date: <b>'+
//						formatDate(e.point.end) +'</b>'+
//						'<br>assignee: <b>'+
//						e.point.assignee +'</b>'+
//						'</p>';
//					},
//					interactive: true,
//					margin: {
//						top: 0,
//						right: 50,
//						bottom: 40,
//						left: 80
//					},
//					noData:"No durations available requirements",
//					legend: {
//						margin: {
//							top: 5,
//							right: 5,
//							bottom: 5,
//							left: 5
//						}
//					}
//				}
//		};

	}]);

});