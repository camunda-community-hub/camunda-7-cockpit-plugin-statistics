'use strict'
ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {

	module.filter('split', function() {
		return function(input, splitChar, splitIndex) {
			if(input.charAt(splitIndex)=="") return input;
			return input.split(splitChar)[splitIndex];
		}
	});
		
	module.controller('kpiSettingsCtrl', ['$scope', '$location', '$http', 'Uri', '$modalInstance', 'DataFactory', 'SettingsFactory','$modal', '$filter','StateService', function($scope, $location, $http, Uri, $modalInstance, DataFactory, SettingsFactory,$modal, $filter, StateService){
			
		$scope.el = StateService.getSelectedElement();
			
		$scope.showDurationResult = false;
		$scope.isDataMissing = false;
		$scope.isIncorrectSequence = false;
		$scope.isCalculatingResult = false;
		
		$scope.erg = "00:00:00:00";
		
		$scope.checkboxModel = {				 
				 exclusive_start : false,
				 exclusive_end : false
		 };
		
		
		$scope.areElementsSelected = function() {
			if(StateService.getSelectedElement().length === 2) {
				return true;
			} else {
				return false;
			}
		}
		
		$scope.cancel = function() {
			
			StateService.setMenuState(false);
			
			DataFactory.bpmnElementsToHighlight = {};
			DataFactory.bpmnElementsToHighlightAsWarning = {};
			DataFactory.activityDurations = {};
			
			$modalInstance.dismiss('cancel');
		}

		$scope.reset = function() {
			
			StateService.resetSelectedElement();
			$scope.el = StateService.getSelectedElement();

			$scope.erg =  "00:00:00:00";
			$scope.showDurationResult = false;
			$scope.isDataMissing = false;
			$scope.isIncorrectSequence = false;
			$scope.isCalculatingResult = false;
	
			$scope.checkboxModel = {			 
					 exclusive_start : false,
					 exclusive_end : false
			 };	
			
			$(".kpiElements").click(function(){			
				$scope.el = StateService.getSelectedElement();
			});
		};
		
		$scope.calculate = function() {
			
			calculation: {
			
  			$scope.isCalculatingResult = true;
  			
  			$scope.isDataMissing = false;
  			$scope.showDurationResult = false;
  			$scope.isIncorrectSequence = false;
  			
  			$scope.erg =  "00:00:00:00";
  			
  			var startElemId = $scope.el[0].id;
  			var endElemId = $scope.el[1].id;
  			
  			/*** step 1: get historic data for selected start and end element for current process definition ***/
  			
  			DataFactory.getAllHistoricActivitiesByProcDefId(DataFactory.processDefinitionId).
  			then(function(){
  				
  				/*** step 2: store instances of activities separated by process instance id in list ***/
  				
  				var data = {};
  				
  				var data_REST = DataFactory.allHistoricActivitiesByProcDefId[DataFactory.processDefinitionId];
  				var item;
  				
  				for(var i=0; i < data_REST.length; i++) {
  					
  					item = data_REST[i];
  					
  					// check if current item is start element --> store start end end time
  					if(item.activityId === startElemId) {
  						if(data[item.processInstanceId]) {
  							data[item.processInstanceId].startElem = [ item.startTime, item.endTime ]
  						} else {
  							data[item.processInstanceId] = {
  								"startElem": [ item.startTime, item.endTime ]
  							}
  						}
  					// same for end element
  					} else if(item.activityId === endElemId) {
  						if(data[item.processInstanceId]) {
  							data[item.processInstanceId].endElem = [ item.startTime, item.endTime ]
  						} else {
  							data[item.processInstanceId] = {
  								"endElem": [ item.startTime, item.endTime ]
  							}
  						}
  					}
  					
  				}	// end for-loop
  								
  				/*** step 3: get time difference for each process instance (for which both activities have been finished) ***/
  				
  				var differences = [];
  				var startTimeId, endTimeId;
  				var value;
  				
  				for(var processInstanceId in data) {
  					
  					value = data[processInstanceId];
  					
  					// check if start element has been finished for current process instance
  					if(value.startElem && value.startElem.length === 2) {
  						
  						// check if end element has been finished for current process instance
  						if(value.endElem && value.endElem.length === 2) {
  							
  							// check if elements were selected in correct order
  							if(isIncorrectSequence(value.startElem[1], value.endElem[0])) {
  								$scope.isIncorrectSequence = true;
  								$scope.isCalculatingResult = false;
  								break;
  							}
  							
    						startTimeId = getStartTimeId();
    						endTimeId = getEndTimeId();
    							
    						differences.push(new Date(value.endElem[endTimeId]) - new Date(value.startElem[startTimeId]));
  						}
  					}
  					
  				} // end for-loop
  								
  				/*** step 4: check if data for both elements was found ***/
  				
  				if(!$scope.isIncorrectSequence) {
  				
    				if(differences.length === 0) {
    					
    					$scope.isDataMissing = true;
    					
    				} else {
    									
      				/*** step 5: get the average of all differences ***/
      				
      				var sum = 0;
      				
        			angular.forEach(differences, function(item, index) {
        				sum += item;
        			}); // end forEach
    				
        			$scope.erg = toTimeString(sum / differences.length);
        			
        			$scope.showDurationResult = true;
    				}
    				
    				$scope.isCalculatingResult = false;
  				}
  			});
			}
		}
		
		function getStartTimeId() {
			if($scope.checkboxModel.exclusive_start) {
				return 1;	// exclusive start element --> end time of start element
			} else {
				return 0;	// inclusive start element --> start time of start event
			}
		}
		
		function getEndTimeId() {
			if($scope.checkboxModel.exclusive_end) {
				return 0;	// exclusive end element --> start time of end element
			} else {
				return 1;	// inclusive end element --> end time of end event
			}
		}
		
		function isIncorrectSequence(start, end) {
			console.log(start + " ... " + end);
			console.log(new Date(start) + " ... " + new Date(end))
			return new Date(start) > new Date(end);
		}
		
		function toTimeString(millis) {
    	var s  = Math.floor( millis /     1000 %   60 );
    	var m  = Math.floor( millis /    60000 %   60 );
    	var h  = Math.floor( millis /  3600000 %   24 );
    	var d  = Math.floor( millis / 86400000        );
    	// format with 2 digits
    	s = (s > 9) ? s : "0" + s;
    	m = (m > 9) ? m : "0" + m;
    	h = (h > 9) ? h : "0" + h;
    	return d + ":" + h + ":" + m + ":" + s;
		}
	
	}]);
});