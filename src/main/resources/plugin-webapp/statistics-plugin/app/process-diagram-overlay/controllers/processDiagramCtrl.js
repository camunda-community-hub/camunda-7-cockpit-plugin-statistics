'use strict'
ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {

	module.filter('split', function() {
		return function(input, splitChar, splitIndex) {
			if(input.charAt(splitIndex)=="") return input;
			return input.split(splitChar)[splitIndex];
		}
	});

	module.controller('processDiagramCtrl', ['$scope', 'DataFactory', 'SettingsFactory', '$modal', '$filter', function($scope, DataFactory, SettingsFactory, $modal, $filter){

		DataFactory.bpmnElements = $scope.$parent.processDiagram.bpmnElements;
		DataFactory.processDefinitionKey = $scope.$parent.$parent.$parent.$parent.processDefinition.key;

		$scope.showOnlyBad = function() {
			return SettingsFactory.showOnlyBadInformation;
		}

		$scope.isHighlightedAsWarning = function() {
			if(isElementContainedIn(DataFactory.bpmnElementsToHighlightAsWarning, $scope.bpmnElement.id))
				return true;
			else
				return false;
		}

		$scope.highlight = function() {
			if(isElementContainedIn(DataFactory.bpmnElementsToHighlightAsWarning, $scope.bpmnElement.id)) {
				return true;
			} else if(isElementContainedIn(DataFactory.bpmnElementsToHighlight, $scope.bpmnElement.id)) {
				return true;
			}
			return false;
		}

		$scope.showHistory = function() {
			if(~$scope.bpmnElement.$type.indexOf("Task"))
				return true;
			return false;
		}

		$scope.showActivityHistoryInformation = function() {
			DataFactory.activityDurations = {};
			DataFactory.getAllHistoricActivitiesInformationByProcDefKey(DataFactory.processDefinitionKey, $scope.bpmnElement.name, getTaskType($scope.bpmnElement.$type)).
			then(function() {
				var id = $scope.bpmnElement.id;
				var data = DataFactory.allHistoricActivitiesInformationByProcDefKey[DataFactory.processDefinitionKey].reverse();
				angular.forEach(data, function(activity, index, list) {
					if(activity.duration==null || activity.endTime==null || activity.duration <= 0) return;
					else {
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
				var len = 0;
				for(var key in DataFactory.activityDurations) len++;
				if(len == 0) {
					$scope.modalInstance = $modal.open({
						templateUrl: 'noHistoryModal.html',
						controller: 'noHistoryCtrl',
						size: 'sm'
					});
				} else {
					$scope.modalInstance = $modal.open({
						templateUrl: 'activityHistoryModal.html',
						controller: 'activityHistoryCtrl',
						size: 'lg',
						resolve: {
							activityId: function () {
								return $scope.bpmnElement.id;
							}
						}
					});
				}
			});
		}

		function getTaskType(type_long) {
			var type_short = $filter('split')(type_long, ':', 1);
			return type_short.substring(0,1).toLowerCase()+type_short.substring(1);
		}

		function isElementContainedIn(object, elementId) {
			var returnValue = false;
			if(typeof object[elementId] != "undefined") {
				$scope.instancesExceededLimit = object[elementId].instancesExceededLimit;
				$scope.instancesMetLimit = object[elementId].instancesMetLimit;
				returnValue = true;
			}
			return returnValue;
		}

	}]);

});