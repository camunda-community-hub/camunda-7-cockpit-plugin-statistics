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
		DataFactory.processDefinitionId = $scope.$parent.$parent.$parent.$parent.processDefinition.id;

		$scope.isHighlightedAsWarning = function() {
			var type = isElementContainedIn(DataFactory.bpmnElementsToHighlightAsWarning, $scope.bpmnElement.id);
			$scope.type = type;
			if(type != null) return true;
			return false;
		}

		$scope.highlight = function() {				
			if(isElementContainedIn(DataFactory.bpmnElementsToHighlightAsWarning, $scope.bpmnElement.id)!=null
					|| isElementContainedIn(DataFactory.bpmnElementsToHighlight, $scope.bpmnElement.id)!=null) {
				if($scope.onlyHighlight() && $scope.type!=null) colorElements($scope.type);
				else if($scope.isHighlightedAsWarning() && $scope.type!=null) colorElements("bad");
				else if((!$scope.onlyHighlight() || !$scope.isHighlightedAsWarning()) && $scope.type!=null) colorElements("good");
				return true;
			}
			if($scope.type!=null) colorElements("white");
			return false;
		}
		
		$scope.onlyHighlight = function() {
			var type = isElementContainedIn(DataFactory.bpmnElementsToHighlight, $scope.bpmnElement.id);
			$scope.type = type;
			if(Object.keys(DataFactory.activityDurations).length == 0 && type!=null) {
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
			$scope.loading = $modal.open({
				templateUrl: 'loadingModal.html',
				controller: 'loadingModalCtrl',
				size: 'lg',
			});
			DataFactory.activityDurations = {};
			DataFactory.getAllHistoricActivitiesInformationByProcDefId(DataFactory.processDefinitionId, $scope.bpmnElement.id, getShortType($scope.bpmnElement.$type)).
			then(function() {
				var id = $scope.bpmnElement.id;
				var data = DataFactory.allHistoricActivitiesInformationByProcDefId[DataFactory.processDefinitionId];
				angular.forEach(data, function(activity, index, list) {
					if(activity.durationInMillis==null || activity.endTime==null || activity.durationInMillis <= 0) return;
					else {
						// store durations for "Activity History" modal (to avoid requesting data again)
						if(angular.isUndefined(DataFactory.activityDurations[id]))
							DataFactory.activityDurations[id] = [];
						DataFactory.activityDurations[id].push({
							id: activity.id,
							name: activity.activityName,
							duration: activity.durationInMillis,
							startTime: activity.startTime,
							endTime: activity.endTime,
							procInstId: activity.processInstanceId,
							procDefId: activity.processDefinitionId,
							procDefKey: activity.processDefinitionKey,
							defId: activity.activityId,
							assignee: activity.assignee
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
		
		function colorElements(className) {
			var element;
			if(~$scope.type.indexOf('Task') || ~$scope.type.indexOf('transaction') || ~$scope.type.indexOf('Activity') || ~$scope.type.indexOf('subProcess')) element = '[data-element-id="' + $scope.bpmnElement.id + '"] .djs-visual rect';
			else if(~$scope.type.indexOf('Gateway')) element = '[data-element-id="' + $scope.bpmnElement.id + '"] .djs-visual polygon';
			else if(~$scope.type.indexOf('event')) element = '[data-element-id="' + $scope.bpmnElement.id + '"] .djs-visual circle';
			angular.element(element).attr('class', className);
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