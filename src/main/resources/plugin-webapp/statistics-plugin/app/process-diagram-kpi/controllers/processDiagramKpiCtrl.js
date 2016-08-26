'use strict'
ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {

	module.filter('split', function() {
		return function(input, splitChar, splitIndex) {
			if(input.charAt(splitIndex)=="") return input;
			return input.split(splitChar)[splitIndex];
		}
	});

	module.controller('processDiagramKpiCtrl', ['$scope', 'DataFactory', 'SettingsFactory', '$modal', '$filter','StateService', function($scope, DataFactory, SettingsFactory, $modal, $filter, StateService){

		DataFactory.bpmnElements = $scope.$parent.processDiagram.bpmnElements;
		DataFactory.processDefinitionId = $scope.$parent.$parent.$parent.$parent.processDefinition.id;
		DataFactory.processDefinitionKey = $scope.$parent.$parent.$parent.$parent.processDefinition.key;
	
		var _state   = false;
		
		$scope.states  = {
				
			    state: function(newState) {
			       
			    	_state = StateService.getMenuState();
			    	
			        return arguments.length ? (_state = newState) : _state;
			       }
			     };
		
		$scope.type = (!(~$scope.bpmnElement.$type.indexOf("bpmn:Participant") || ~$scope.bpmnElement.$type.indexOf("bpmn:Lane") || ~$scope.bpmnElement.$type.indexOf("bpmn:Collaboration"))) ? true : false;
		
		
				function getTaskType(type_long) {
					var type_short = $filter('split')(type_long, ':', 1);
					return type_short.substring(0,1).toLowerCase()+type_short.substring(1);
				}
				
				$scope.highlightElements = function(element) {

					
					DataFactory.bpmnElementsToHighlight = {};
					DataFactory.bpmnElementsToHighlightAsWarning = {};
					DataFactory.activityDurations = {};
					var type;
							if(~element.$type.indexOf("Event")) type = "event";
							else type = getTaskType(element.$type);
							
							DataFactory.bpmnElementsToHighlightAsWarning[element.id] = {
									instancesExceededLimit: null,
									instancesMetLimit: null,
									type: type
								};
				}
				

				$scope.setMaster = function(section) {

					if(!(~$scope.bpmnElement.$type.indexOf("bpmn:Participant") || ~$scope.bpmnElement.$type.indexOf("bpmn:Lane"))) {
						
						if(StateService.getSelectedElement() < 2)
							$scope.highlightElements($scope.bpmnElement);
						
						StateService.setSelectedElement($scope.bpmnElement);	
					}
			    }		
	}]);
});