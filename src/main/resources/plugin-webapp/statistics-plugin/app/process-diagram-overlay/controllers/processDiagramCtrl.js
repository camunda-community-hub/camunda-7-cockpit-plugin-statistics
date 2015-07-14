'use strict'
ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {

	module.controller('processDiagramCtrl', ['$scope', 'DataFactory', 'SettingsFactory', '$modal', function($scope, DataFactory, SettingsFactory, $modal){

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
		
		$scope.showActivityHistoryInformation = function() {
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