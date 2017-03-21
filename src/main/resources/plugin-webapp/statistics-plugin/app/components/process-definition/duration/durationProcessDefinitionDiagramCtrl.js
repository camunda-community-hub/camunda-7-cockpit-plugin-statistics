'use strict'
ngDefine('cockpit.plugin.statistics-plugin.duration', function(module) {

	module.controller('durationProcessDefinitionDiagramCtrl', ['$scope', 'DataFactory', 'SettingsFactory', '$modal', '$filter','ElementStateService', function($scope, DataFactory, SettingsFactory, $modal, $filter, ElementStateService){

		var _state   = false;

		$scope.states  = {

				state: function(newState) {

					_state = ElementStateService.getMenuState();

					return arguments.length ? (_state = newState) : _state;
				}
		};

		var _elem = ElementStateService.getDisabledElements();

		$scope.disabledElements  = {

				elem: function(disElem) {

					_elem = ElementStateService.getDisabledElements();

					return arguments.length ? (_elem = disElem) : _elem;
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

				if(ElementStateService.getSelectedElement() < 2)
					$scope.highlightElements($scope.bpmnElement);

				ElementStateService.setSelectedElement($scope.bpmnElement);	
				ElementStateService.getCheckboxModel();
				ElementStateService.changeGradient(ElementStateService.getSelectedElement());
			}
		}		
	}]);
});