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
		
		$scope.getType = function() {
			return $scope.type;
		}

		$scope.highlight = function() {
			if(isElementContainedIn(DataFactory.bpmnElementsToHighlightAsWarning, $scope.bpmnElement.id)!=null) {
				return true;
			} else if(isElementContainedIn(DataFactory.bpmnElementsToHighlight, $scope.bpmnElement.id)!=null) {
				return true;
			}
			return false;
		}
		
		$scope.onlyHighlight = function() {
			var type = isElementContainedIn(DataFactory.bpmnElementsToHighlight, $scope.bpmnElement.id);
			if(SettingsFactory.onlyHighlight && type!=null) {
				$scope.type = type;
				return true;
			}
			return false;
		}

		$scope.showTaskHistory = function() {
			if(~$scope.bpmnElement.$type.indexOf("Task"))
				return true;
			return false;
		}
		
		$scope.showEventHistory = function() {
			if(~$scope.bpmnElement.$type.indexOf("IntermediateCatchEvent"))
				return true;
			return false;
		} 
		
		$scope.showActivityHistoryInformation = function() {
			DataFactory.activityDurations = {};
			DataFactory.getAllHistoricActivitiesInformationByProcDefKey(DataFactory.processDefinitionKey, $scope.bpmnElement.id, getShortType($scope.bpmnElement.$type)).
			then(function() {
				var id = $scope.bpmnElement.id;
				var data = DataFactory.allHistoricActivitiesInformationByProcDefKey[DataFactory.processDefinitionKey];
				angular.forEach(data, function(activity, index, list) {
					if(activity.durationInMillis==null || activity.endTime==null || activity.durationInMillis <= 0) return;
					else {
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
				var len = 0;
				for(var key in DataFactory.activityDurations) len++;
				if(len == 0) {
					$scope.modalInstance = $modal.open({
						templateUrl: 'noHistoryModal.html',
						controller: 'noHistoryCtrl',
						size: 'sm'
					});
				} else {
					DataFactory.activityDurations[id].sort(compare);
					$scope.modalInstance = $modal.open({
						templateUrl: 'activityHistoryModal.html',
						controller: 'activityHistoryCtrl',
						size: 'lg',
						resolve: {
							activityId: function () {
								return id;
							}
						}
					});
				}
			});
		}

		function getShortType(type_long) {
			var type_short = $filter('split')(type_long, ':', 1);
			return type_short.substring(0,1).toLowerCase()+type_short.substring(1);
		}

		function isElementContainedIn(object, elementId) {
			var returnValue = null;
			if(!angular.isUndefined(object[elementId])) {
				$scope.instancesExceededLimit = object[elementId].instancesExceededLimit;
				$scope.instancesMetLimit = object[elementId].instancesMetLimit;
				returnValue = object[elementId].type;
			}
			return returnValue;
		}

		// sort data by endTime
		function compare(a,b) {
			if(a.endTime < b.endTime) return -1;
			if(a.endTime > b.endTime) return 1;
			return 0;
		}
	}]);

});