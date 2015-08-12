'use strict'
ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {

	module.filter('split', function() {
		return function(input, splitChar, splitIndex) {
			if(input.charAt(splitIndex)=="") return input;
			return input.split(splitChar)[splitIndex];
		}
	});

	module.controller('processDiagramSettingsCtrl', ['$scope', '$location', '$http', 'Uri', '$modalInstance', 'DataFactory', 'SettingsFactory', '$filter', function($scope, $location, $http, Uri, $modalInstance, DataFactory, SettingsFactory, $filter){

		var bpmnTasks = [];
		$scope.taskTypes = [];

		var element, type;
		Object.keys(DataFactory.bpmnElements).forEach(function(key, index, array) {
			element = DataFactory.bpmnElements[key];
			type = element.$type;
			if(~type.indexOf("Task")) {
				bpmnTasks.push(element);
				if(!~$scope.taskTypes.indexOf(type)) $scope.taskTypes.push(type);
			}
		});

		$scope.timeUnitOptions = ['s', 'm', 'h'];

		$scope.selectedTimeUnit = $scope.timeUnitOptions[1];
		$scope.selectedTaskType = "all";
		$scope.durationLimit = 3;

		$scope.cancel = function() {
			DataFactory.bpmnElementsToHighlight = {};
			DataFactory.bpmnElementsToHighlightAsWarning = {};
			DataFactory.activityDurations = {};
			$modalInstance.dismiss('cancel');
		};

		$scope.highlightTasks = function() {
			DataFactory.bpmnElementsToHighlight = {};
			DataFactory.bpmnElementsToHighlightAsWarning = {};
			DataFactory.activityDurations = {};
			angular.forEach(bpmnTasks, function(task, index, array) {
				if($scope.selectedTaskType == "all" || task.$type == $scope.selectedTaskType) {
					if($scope.selectDurationLimit) {
						countInstancesRegardingDurationLimit(task, getMilliseconds($scope.durationLimit, $scope.selectedTimeUnit));
					} else {
						DataFactory.bpmnElementsToHighlight[task.id] = {
								instancesExceededLimit: null,
								instancesMetLimit: null,
								type: getTaskType(task.$type)
							};
					}
				}
			});
			
			if($scope.onlyHighlight) SettingsFactory.onlyHighlight = true;
			else SettingsFactory.onlyHighlight = false;
			
			SettingsFactory.showOnlyBadInformation = $scope.showOnlyBad;
			SettingsFactory.durationLimitInMs = getMilliseconds($scope.durationLimit, $scope.selectedTimeUnit);
		}

		function getMilliseconds(time, unit) {
			switch(unit) {
			case "s": return time*1000;
			case "m": return time*60000;
			case "h": return time*3600000;
			}
		}

		function countInstancesRegardingDurationLimit(task, limit) {
			var type = getTaskType(task.$type);
			DataFactory.getAllHistoricActivitiesInformationByProcDefKey(DataFactory.processDefinitionKey, task.id, type).
			then(function() {
				var exceeded = 0;
				var met = 0;
				var id = task.id;
				var data = DataFactory.allHistoricActivitiesInformationByProcDefKey[DataFactory.processDefinitionKey];
				angular.forEach(data, function(activity, index, list) {
					if(activity.durationInMillis==null || activity.endTime==null || activity.durationInMillis <= 0) return;
					else {
						if(activity.durationInMillis > limit) exceeded++;
						else met++;
						// store durations for "Activity History" modal (to avoid requesting data again)
						if(angular.isUndefined(DataFactory.activityDurations[id]))
							DataFactory.activityDurations[id] = [];
						DataFactory.activityDurations[id].push({
							id: activity.id,
							duration: activity.durationInMillis,
							startTime: activity.startTime,
							endTime: activity.endTime
						});
					}
				});
				if(exceeded == 0 && met == 0) return;	// no history information available
				if(exceeded >= met) {
					DataFactory.bpmnElementsToHighlightAsWarning[id] = {
							instancesExceededLimit: exceeded,
							instancesMetLimit: met,
							type: type
					};
				} else {
					DataFactory.bpmnElementsToHighlight[id] = {
							instancesExceededLimit: exceeded,
							instancesMetLimit: met,
							type: type
					};
				}
				DataFactory.activityDurations[id].sort(compare);
			});
		}

		function getTaskType(type_long) {
			var type_short = $filter('split')(type_long, ':', 1);
			return type_short.substring(0,1).toLowerCase()+type_short.substring(1);
		}

		// sort data by endTime
		function compare(a,b) {
			if(a.endTime < b.endTime) return -1;
			if(a.endTime > b.endTime) return 1;
			return 0;
		}
	}]);

});