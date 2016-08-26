'use strict'
ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {

	module.controller('variableStatusModalCtrl', ['$scope', '$modalInstance', '$filter', 'DataFactory', function($scope, $modalInstance, $filter, DataFactory){

		$scope.version = "current";
		$scope.currentVersion = DataFactory.processDefinitionId.split(":")[1];
		
		$scope.timePeriodOptions = {
      locale: {
        format: "YYYY-MM-DD",
        customRangeLabel: 'Custom range'
      },
      ranges: {
      	'Today': [moment(), moment()],
      	'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'Current Week': [moment().startOf('week'), moment().endOf('week')],
        'Last Week': [moment().subtract(1, 'week').startOf('week'), moment().subtract(1, 'week').endOf('week')],
        'Current Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
      }
    };
		
		$scope.timePeriod = {
				startDate: moment(),
				endDate: moment()
		}
		
		$scope.completeTimePeriod = false;
		$scope.startedOrFinished = 'finished';
		
		$scope.variableOptions = {};
		$scope.variableOptionsAvailable = true;
		
		$scope.processInstancesCount = 0;
		$scope.showProcessInstancesCount = false;
		
		$scope.showTimePeriodSettings = false;
		$scope.showVariableSettings = false;
		$scope.showVariableStatus = false;
		
		$scope.isLoadingVariables = false;
		$scope.isLoadingVariableStatus = false;
		
		$scope.isTimePeriodSelected = true;
		$scope.isVariableSelected = true;
		
		$scope.applyVersionSelection = function() {
			// trigger 'apply' of other settings, if already visible and set
			if($scope.showTimePeriodSettings) {
				if($scope.showVariableSettings) {
					$scope.applyTimePeriodSelection();
					if($scope.showVariableStatus) {
						$scope.applyVariableSelection();
					}
				}
			} else {
				// trigger next settings
				$scope.showTimePeriodSettings = true;
			}
		}
		
		$scope.applyTimePeriodSelection = function() {
			if($scope.timePeriodSettings.$valid) {
				$scope.isLoadingVariables = true;
				// TODO: set time of dates
				var startDate = new Date($scope.timePeriod.startDate);
				var endDate = new Date($scope.timePeriod.endDate);
				// set time of start date (start of day)
				startDate.setHours(0, 0, 0, 0);
				// set time of end date (end of day)
				endDate.setHours(23, 59, 59, 999);
				var startDateString = $filter('date')(startDate, "yyyy-MM-ddTHH:mm:ss");
				var endDateString = $filter('date')(endDate, "yyyy-MM-ddTHH:mm:ss");
				if($scope.completeTimePeriod) {
					startDateString = null;
					endDateString = null;
				}
				var procDefKey = DataFactory.processDefinitionKey;
				var procDefId = DataFactory.processDefinitionId;
				if($scope.version.valueOf() == "all") {
					procDefId = null;
				}
				DataFactory.getAllHistoricVariablesOfProcessDefinitionInTimeRange(procDefId, procDefKey, startDateString, endDateString, $scope.startedOrFinished)
				.then(function() {
					getVariableOptions();
					$scope.isLoadingVariables = false;
					$scope.processInstancesCount = DataFactory.processInstancesCount;
					$scope.showProcessInstancesCount = true;
					if($scope.processInstancesCount > 0) $scope.showVariableSettings = true;
					else $scope.showVariableSettings = false;
					if(Object.keys($scope.variableOptions).length > 0) {
      			// trigger next settings
      			$scope.isTimePeriodSelected = true;
      			$scope.variableOptionsAvailable = true;
      			$scope.isVariableSelected = true;
      			// trigger 'apply' of other settings, if already visible and set
      			if($scope.showVariableStatus) {
      				$scope.applyVariableSelection();
      			}
					} else {
						// show message
      			$scope.isTimePeriodSelected = false;
      			$scope.variableOptionsAvailable = false;
      			$scope.showVariableStatus = false;
					}
				});
			} else {
				$scope.showVariableSettings = false;
				$scope.isTimePeriodSelected = false;
			}
		}
		
		$scope.applyVariableSelection = function() {
			if($scope.variableSettings.$valid) {
				$scope.isLoadingVariableStatus = true;
				loadBarChart();
				$scope.showVariableStatus = true;
				$scope.isVariableSelected = true;
				$scope.isLoadingVariableStatus = false;
			} else {
				$scope.showVariableStatus = false;
				$scope.isVariableSelected = false;
			}
		}
		
		$scope.closeModal = function() {
			$modalInstance.close();
		}
		
		function getVariableOptions() {
			$scope.variableOptions = {};
			angular.forEach(DataFactory.allHistoricVariablesOfProcessDefinitionInTimeRange, function(item) {
				$scope.variableOptions[item.name] = item.type;
			});
		}
		
		function loadBarChart() {
			var data = getChartData(DataFactory.allHistoricVariablesOfProcessDefinitionInTimeRange, $scope.variable);
			
			var stringLength = 20;
			
			var height = calcHeightByBars(data[0].values.length);
			
			nv.addGraph(function() {
			  var chart = nv.models.multiBarHorizontalChart()
			      .x(function(d) { return (d.label.length > stringLength ? d.label.substring(0, stringLength) + "..." : d.label) })
			      .y(function(d) { return d.value })
			      .margin({top: 0, right: 60, bottom: 5, left: 150})
			      .showValues(true)
			      .valueFormat(d3.format('d'))
			      .tooltips(true)
			      .showControls(false)
			      .height(height)
			      .tooltip(function(key, x, y, e, graph) {
              return "<table>" +
                    "<tr>" +
                      "<td>variable:</td>" +
                      "<td><div class='wrap'>" + $scope.variable + "</div></td>" + 
                    "</tr>" +
                    "<tr>" +
                      "<td>value:</td>" +
                      "<td><div class='wrap'>" + e.series.values[e.pointIndex].label + "</div></td>" + 
                    "</tr>" +
                    "<tr>" +
                    "<td>count:</td>" +
                    "<td><div class='wrap'>" + y + "</div></td>" + 
                  "</tr>" +
                "</table>";
             });
			  
			  chart.yAxis.tickFormat(d3.format('d'));

			  d3.select('#barchart svg')
			      .datum(data)
			      .transition().duration(500)
			      .call(chart)
			      .style({ 'height': height + "px" });

			  nv.utils.windowResize(chart.update);

			  return chart;
			});
			
			angular.element(document).find('.nv-bar rect').each(function(index, element) {
				element.setAttribute("height", "20");
				element.setAttribute("height", 20);
			});
		}
		
		function getChartData(data, variableName) {

			var values = [];
			
			// count variables
			var valueCount = {};
			angular.forEach(data, function(item) {
				if(item.name.valueOf() == variableName) {
  				if(valueCount[item.value]) {
  					valueCount[item.value]++;
  				} else {
  					valueCount[item.value] = 1;
  				}
				}
			});
			
			// sort variables by count
			var sortedValueCount = [];
			for (var value in valueCount) {
				sortedValueCount.push([value, valueCount[value]])
			}
			sortedValueCount.sort(
			    function(a, b) {
			        return b[1] - a[1]
			    }
			);
			
			angular.forEach(sortedValueCount, function(valueCount) {
				values.push({
					"label": valueCount[0],
					"value": valueCount[1]
				});
			});
			
			return [
			  {
      	  "key": variableName,
      		"color": "#d62728",
      		"values": values
        }
      ];
		}
		
		function calcHeightByBars(barCount) {
			var barHeight = 40;
			return (barHeight * barCount) + 20;
		}
		
	}]);

});