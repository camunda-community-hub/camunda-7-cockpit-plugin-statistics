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
			$modalInstance.dismiss('cancel');
		};

		$scope.highlightUsertasks = function() {
			DataFactory.bpmnElementsToHighlight = {};
			DataFactory.bpmnElementsToHighlightAsWarning = {};
			angular.forEach(bpmnTasks, function(task, index, array) {
				if($scope.selectedTaskType == "all" || task.$type == $scope.selectedTaskType) {
					if($scope.selectDurationLimit) {
						countInstancesRegardingDurationLimit(task, getMilliseconds($scope.durationLimit, $scope.selectedTimeUnit));
					} else {
						DataFactory.bpmnElementsToHighlight[task.id] = {
								instancesExceededLimit: null,
								instancesMetLimit: null
							};
					}
				}
			});
			SettingsFactory.showOnlyBadInformation = $scope.showOnlyBad;
		}

		function getMilliseconds(time, unit) {
			switch(unit) {
			case "s": return time*1000;
			case "m": return time*60000;
			case "h": return time*3600000;
			}
		}

		function countInstancesRegardingDurationLimit(task, limit) {

			DataFactory.getAllHistoricActivitiesInformationByProcDefKey(DataFactory.processDefinitionKey, task.name, getTaskType(task.$type)).
			then(function() {
				var exceeded = 0;
				var met = 0;
				var id = task.id;
				var data = DataFactory.allHistoricActivitiesInformationByProcDefKey[DataFactory.processDefinitionKey].reverse();
				angular.forEach(data, function(activity, index, list) {
					if(activity.duration==null || activity.endTime==null || activity.duration <= 0) return;
					else {
						if(activity.duration > limit) exceeded++;
						else met++;
						// store durations for "Activity History" modal (to avoid requesting data again)
						if(typeof DataFactory.activityDurations[id] == "undefined")
							DataFactory.activityDurations[id] = [];
						DataFactory.activityDurations[id].push({
							id: activity.id,
							duration: activity.duration,
							startTime: activity.startTime,
							endTime: activity.endTime
						});
					}
				});
				if(exceeded == 0 && met == 0) return;	// no history information available
				if(exceeded >= met) {
					DataFactory.bpmnElementsToHighlightAsWarning[id] = {
							instancesExceededLimit: exceeded,
							instancesMetLimit: met
					};
				} else {
					DataFactory.bpmnElementsToHighlight[id] = {
							instancesExceededLimit: exceeded,
							instancesMetLimit: met
					};
				}

			});
		}

		function getTaskType(type_long) {
			var type_short = $filter('split')(type_long, ':', 1);
			return type_short.substring(0,1).toLowerCase()+type_short.substring(1);
		}

	}]);

});