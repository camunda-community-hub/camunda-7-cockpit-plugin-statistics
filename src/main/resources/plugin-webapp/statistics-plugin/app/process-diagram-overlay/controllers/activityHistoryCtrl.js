'use strict'
ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {

	module.controller('activityHistoryCtrl', ['$scope', '$modalInstance', 'DataFactory', 'activityId', function($scope, $modalInstance, DataFactory, activityId){

		$scope.init = function() {
			var data = DataFactory.activityDurations[activityId];
			var times = [];
			for(var i in data) {
				if(times.indexOf(data[i].endTime)==-1) times.push(data[i].endTime);
			}
			times.sort();
			$scope.timeOptions = times;
			$scope.selectedStartTime = $scope.timeOptions[0];
			$scope.selectedEndTime = $scope.timeOptions[$scope.timeOptions.length-1];

			$scope.showPlot();
		}

		$scope.timeUnitOptions = ["hr", "min", "sec"];
		$scope.selectedTimeUnit = $scope.timeUnitOptions[1];

		$scope.closeModal = function() {
			$modalInstance.close();
		}
		
		$scope.showPlot = function() {
			var data = DataFactory.activityDurations[activityId];
			var filteredData = [];
			for(var i in data) {
				if(data[i].endTime >= $scope.selectedStartTime && data[i].endTime <= $scope.selectedEndTime) {
					filteredData.push({
						"x": i,
						"y": msToTimeUnit(data[i].duration),
						"activityId": data[i].id,
						"start": stringToDate(data[i].startTime),
						"end": stringToDate(data[i].endTime),
						"assignee": data[i].assignee
					}); 
				}
			}
			$scope.historicActivityPlotData =  [{
				values : filteredData,
				key: "durations"
			}];
		}
		
		function stringToDate(string) {
			var splitted = string.split('T');
			var date = splitted[0];
			var datesplitted = date.split('-');
			var time = splitted[1];
			var timesplitted = time.split(':');
			return new Date(datesplitted[0], datesplitted[1]-1, datesplitted[2], timesplitted[0], timesplitted[1], timesplitted[2]);
		}

		function msToTimeUnit(time) {
			switch($scope.selectedTimeUnit) {
			case "hr": return (time/1000/60/60).toFixed(2);
			case "min": return (time/1000/60).toFixed(2);
			case "sec": return (time/1000).toFixed(2);
			}
		}

		function formatTime(time) {
			var origTimeInMillis;
			switch($scope.selectedTimeUnit) {
				case "hr": origTimeInMillis = time*1000*60*60; break;
				case "min": origTimeInMillis = time*1000*60; break;
				case "sec": origTimeInMillis = time*1000; break;
			}
			var milliseconds = parseInt((origTimeInMillis%1000)/100)
			, seconds = parseInt((origTimeInMillis/1000)%60)
			, minutes = parseInt((origTimeInMillis/(1000*60))%60)
			, hours = parseInt((origTimeInMillis/(1000*60*60))%24);

			hours = (hours < 10) ? "0" + hours : hours;
			minutes = (minutes < 10) ? "0" + minutes : minutes;
			seconds = (seconds < 10) ? "0" + seconds : seconds;

			//return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
			return hours + ":" + minutes + ":" + seconds;
		}
		
		function formatDate(date) {
			return date.toUTCString();
			//return date.toLocaleDateString() + ", " + date.toLocaleTimeString();
		}

//		$scope.toolTipContentFunction = function() {
//			return function(key, x, y, e, graph){
//				return '<h3>'+formatTime(e.point.y)+' (hh:mm:ss)</h3>'+
//				'<br><p>id: <b>'+
//				e.point.activityId+'</b>'+
//				'<br>start date: <b>'+
//				formatDate(e.point.start) +'</b>'+
//				'<br>end date: <b>'+
//				formatDate(e.point.end) +'</b>'+
//				'</p>';
//			}
//		}
//
//		$scope.xFunction = function() {
//			return function(d){return d.x;}
//		}
//
//		$scope.yFunction = function() {
//			return function(d){return d.y;}
//		}

		$scope.optionsLineChart = {
				chart: {
					type: 'lineChart',
					height: 450,
					x: function(d){return d.end.getTime();},
					y: function(d){return d.y;},
					showLabels: true,
					yAxis: { 
						axisLabel: "duration",
						showMaxMin: false,
						tickFormat:function(d) {
							return d3.format("s")(d)+" "+$scope.selectedTimeUnit;
						}
					},
					xAxis: { 
						axisLabel: "",
						tickFormat: function(d) { 
							return d3.time.format('%b %d, %I:%M %p')(new Date(d));
						}
					},
					transitionDuration: 500,
					labelThreshold: 0.9,
					tooltips: true,
					tooltipContent: function(key, x, y, e, graph){
						return '<h3>'+formatTime(e.point.y)+' (hh:mm:ss)</h3>'+
						'<br><p>id: <b>'+
						e.point.activityId+'</b>'+
						'<br>start date: <b>'+
						formatDate(e.point.start) +'</b>'+
						'<br>end date: <b>'+
						formatDate(e.point.end) +'</b>'+
						'<br>assignee: <b>'+
						e.point.assignee +'</b>'+
						'</p>';
					},
					interactive: true,
					margin: {
						top: 0,
						right: 50,
						bottom: 40,
						left: 80
					},
					noData:"No durations available requirements",
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

	}]);

});