'use strict'
ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {

	module.filter('split', function() {
		return function(input, splitChar, splitIndex) {
			if(input.charAt(splitIndex)=="") return input;
			return input.split(splitChar)[splitIndex];
		}
	});
	
	
	module.controller('kpiSettingsCtrl', ['$scope', '$location', '$http', 'Uri', '$modalInstance', 'DataFactory', 'SettingsFactory','$modal', '$filter','StateService', function($scope, $location, $http, Uri, $modalInstance, DataFactory, SettingsFactory,$modal, $filter, StateService){
		
		var bpmnElements = [];
		
		$scope.types = [];
		$scope.el = StateService.getSelectedElement();
		$scope.startDateSumAvg = 0;
		$scope.endDateSumAvg = 0;
		
		var calculating = false;

		var durAvg = 0;
		
		function getShortType(type_long, leftOrRight) {
			
			var type_short =  (leftOrRight == 'right') ? $filter('split')(type_long, ':', 1) : $filter('split')(type_long, ':', 0) ;
			
			return (leftOrRight == 'right') ? type_short.substring(0,1).toLowerCase()+type_short.substring(1) : type_short.substring(0,0).toLowerCase()+type_short.substring(0);
		}
		
		$scope.calculate = function() {
			
			var i = 0;
			
			for(i = 0; i < $scope.el.length; i++) {
				
				$scope.showHistoryData($scope.el[i]);
			}
		}

		$scope.toDate = function(ms) {
			
			if(calculating == true) {
				
				var d = new Date(ms);
				var datetext = d.toTimeString();
				datetext = datetext.split(' ')[0];
			
				return datetext;
			}
			else {
				
				return "00:00:00";
			}
		}
		
		$scope.abs = function(value) {
			
			return Math.abs(value);
		}

		$scope.reset = function() {
			
			calculating = false;
			
			$scope.el = [];
			$scope.startDateSumAvg = 0;
			$scope.endDateSumAvg = 0;

			
			StateService.resetSelectedElement();
			
			$(".kpiElements").click(function(){
				
				$scope.el = StateService.getSelectedElement();
			});
		};
		
		
		$scope.showHistoryData = function(bpmnEl) {
			
			if($scope.el.length < 2) return;
				
			DataFactory.activityDurations = {};
			DataFactory.getAllHistoricActivitiesInformationByProcDefId(DataFactory.processDefinitionId, bpmnEl.id, getShortType(bpmnEl.$type, 'right')).
			then(function() {
		
				var i = 0;
				var j = 0;
				var id = bpmnEl.id;
				var startDateSum = 0;
				var endDateSum = 0;

				var data = DataFactory.allHistoricActivitiesInformationByProcDefId[DataFactory.processDefinitionId];
				angular.forEach(data, function(activity, index, list) {
					
					if(activity.durationInMillis==null || activity.endTime==null || activity.durationInMillis <= 0) return;
					else {

					
						
						if($scope.el[0].id == getShortType(activity.id, 'left')) {
							
							startDateSum += (new Date(activity.startTime) - 0);
							i++;
						}
						
						 if($scope.el[1].id == getShortType(activity.id, 'left')) {
							
							endDateSum += (new Date(activity.endTime) - 0);
							j++;
						}
					}
				});
				
				
				
				if((startDateSum > 0) && (i != 0)) {
					
					$scope.startDateSumAvg = startDateSum / i;
				}
				
				if((endDateSum > 0) && (j != 0)) {
					
					$scope.endDateSumAvg =  endDateSum / j;	
				}
				
				
			});
			
			calculating = true;
		};
		
		
		$scope.msToX = function(input, zeiteinheit) {
			
			var output = "";
			
			switch(zeiteinheit) {
			
			case 'ms': {output = input + "ms";} break;
			case 's':  {output = (input * 0.001) + "s";} break;
			case 'm':  {output = (input * 1.6667e-5) + "m";} break;
			case 'h':  {output = (input * 2.77783333e-7) + "h";} break;
			}
			
			return output;
		};
		
		$scope.cancel = function() {
			
			StateService.setMenuState(false);
			
			DataFactory.bpmnElementsToHighlight = {};
			DataFactory.bpmnElementsToHighlightAsWarning = {};
			DataFactory.activityDurations = {};
			
			$modalInstance.dismiss('cancel');
		};
	}]);
});