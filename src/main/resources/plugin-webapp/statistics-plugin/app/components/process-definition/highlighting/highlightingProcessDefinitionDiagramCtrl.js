'use strict'
ngDefine('cockpit.plugin.statistics-plugin.highlighting', function(module) {

	module.controller('highlightingProcessDefinitionDiagramCtrl', ['$scope', 'DataFactory', function($scope, DataFactory){

		$scope.isHighlightedAsWarning = function() {
			var type = isElementContainedIn(DataFactory.bpmnElementsToHighlightAsWarning, $scope.bpmnElement.id);
			$scope.type = type;
			if(type != null) return true;
			return false;
		}

		$scope.highlight = function() {
			
			if(DataFactory.highlighting) {
				if(isElementContainedIn(DataFactory.bpmnElementsToHighlightAsWarning, $scope.bpmnElement.id)!=null
  					|| isElementContainedIn(DataFactory.bpmnElementsToHighlight, $scope.bpmnElement.id)!=null) {
  				if($scope.onlyHighlight() && $scope.type!=null) colorElements($scope.type);
  				else if($scope.isHighlightedAsWarning() && $scope.type!=null) colorElements("bad");
  				else if((!$scope.onlyHighlight() || !$scope.isHighlightedAsWarning()) && $scope.type!=null) colorElements("good");
  				return true;
  			}
  			if($scope.type!=null) colorElements("white");
			} else if(DataFactory.resetHighlighting) {
				resetElements();
				DataFactory.resetHighlighting = false;
			}
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
		
		function colorElements(className) {
			var element;
			if(~$scope.type.indexOf('Task') || ~$scope.type.indexOf('transaction') || ~$scope.type.indexOf('Activity') || ~$scope.type.indexOf('subProcess')) element = '[data-element-id="' + $scope.bpmnElement.id + '"] .djs-visual rect';
			else if(~$scope.type.indexOf('Gateway')) element = '[data-element-id="' + $scope.bpmnElement.id + '"] .djs-visual polygon';
			else if(~$scope.type.indexOf('event')) element = '[data-element-id="' + $scope.bpmnElement.id + '"] .djs-visual circle';
			angular.element(element).attr('class', className);
		}
		
		function resetElements() {
			angular.element('[data-element-id="' + $scope.bpmnElement.id + '"] .djs-visual rect').attr('class', 'white');
			angular.element('[data-element-id="' + $scope.bpmnElement.id + '"] .djs-visual polygon').attr('class', 'white');
			angular.element('[data-element-id="' + $scope.bpmnElement.id + '"] .djs-visual circle').attr('class', 'white');
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

	}]);

});