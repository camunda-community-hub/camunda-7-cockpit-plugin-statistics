'use strict'
ngDefine('cockpit.plugin.statistics-plugin.highlighting', function(module) {

	module.filter('split', function() {
		return function(input, splitChar, splitIndex) {
			if(input.charAt(splitIndex)=="") return input;
			return input.split(splitChar)[splitIndex];
		}
	});

	module.controller('highlightingSettingsModalCtrl', ['$scope', '$location', '$http', 'Uri', '$modalInstance', 'DataFactory', 'SettingsFactory', '$filter', function($scope, $location, $http, Uri, $modalInstance, DataFactory, SettingsFactory, $filter){

		var bpmnElements = [];
		$scope.types = [];

		var element, type;
		Object.keys(DataFactory.bpmnElements).forEach(function(key, index, array) {
			element = DataFactory.bpmnElements[key];
			type = element.$type;
			if(~type.indexOf("Task") || ~type.indexOf("Gateway") || ~type.indexOf("Event") || ~type.indexOf("subProcess") || ~type.indexOf("callActivity") || ~type.indexOf("Transaction")) {
				bpmnElements.push(element);
				// TODO: handle event types
				if(!~$scope.types.indexOf(type) && !~type.indexOf("Event")) $scope.types.push(type);
			}
		});

		$scope.timeUnitOptions = ['s', 'm', 'h'];

		$scope.selectedTimeUnit = $scope.timeUnitOptions[1];
		$scope.selectedType = "all";
		$scope.durationLimit = 3;

		$scope.isHighlightTab = function() {
			return $scope.highlightTab;
		}
		
		$scope.isTimingTab = function() {
			return $scope.timingTab;
		}
		
		$scope.cancel = function() {
			DataFactory.bpmnElementsToHighlight = {};
			DataFactory.bpmnElementsToHighlightAsWarning = {};
			DataFactory.activityDurations = {};
			DataFactory.highlighting = false;
			DataFactory.resetHighlighting = true;
			$modalInstance.dismiss('cancel');
		};

		$scope.applyDurationLimit = function() {
			DataFactory.bpmnElementsToHighlight = {};
			DataFactory.bpmnElementsToHighlightAsWarning = {};
			DataFactory.activityDurations = {};
			var type;
			angular.forEach(bpmnElements, function(element, index, array) {
				if(~element.$type.indexOf("Task")){
					// duration calculation for tasks only
					countInstancesRegardingDurationLimit(element, getMilliseconds($scope.durationLimit, $scope.selectedTimeUnit));
				}
			});
		}
		
		$scope.highlightElements = function() {
			DataFactory.bpmnElementsToHighlight = {};
			DataFactory.bpmnElementsToHighlightAsWarning = {};
			DataFactory.activityDurations = {};
			var type;
			angular.forEach(bpmnElements, function(element, index, array) {
				if($scope.selectedType=="all"
						|| ($scope.selectedType=="all tasks" && ~element.$type.indexOf("Task"))
						|| ($scope.selectedType=="all gateways" && ~element.$type.indexOf("Gateway"))
						|| ($scope.selectedType=="all events" && ~element.$type.indexOf("Event"))
						|| element.$type == $scope.selectedType){
					// TODO: handle event types
					if(~element.$type.indexOf("Event")) type = "event";
					else type = getTaskType(element.$type);
					DataFactory.bpmnElementsToHighlight[element.id] = {
							instancesExceededLimit: null,
							instancesMetLimit: null,
							type: type
						};
				}
			});
			DataFactory.highlighting = true;
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
			DataFactory.getAllHistoricActivitiesInformationByProcDefId(DataFactory.processDefinitionId, task.id, type).
			then(function() {
				var exceeded = 0;
				var met = 0;
				var id = task.id;
				var data = DataFactory.allHistoricActivitiesInformationByProcDefId[DataFactory.processDefinitionId];
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