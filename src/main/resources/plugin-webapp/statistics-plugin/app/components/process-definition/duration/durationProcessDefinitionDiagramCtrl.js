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

		$scope.type = (!(~$scope.bpmnElement.$type.indexOf("bpmn:Participant") || ~$scope.bpmnElement.$type.indexOf("bpmn:Lane") || ~$scope.bpmnElement.$type.indexOf("bpmn:Collaboration"))) ? true : false;

		$scope.setMaster = function() {

			if(!(~$scope.bpmnElement.$type.indexOf("bpmn:Participant") || ~$scope.bpmnElement.$type.indexOf("bpmn:Lane"))) {

				if(ElementStateService.getSelectedElement().length < 2) {
					ElementStateService.setSelectedElement($scope.bpmnElement);	
				}
			}		
		}
	}]);
});