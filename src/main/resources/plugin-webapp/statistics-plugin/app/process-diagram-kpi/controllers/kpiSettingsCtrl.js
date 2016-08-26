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
		
		var firstElemStartDateSumAvg = 0;
		var firstElemEndDateSumAvg = 0;
		
		var secondElemStartDateSumAvg = 0;
		var secondElemEndDateSumAvg = 0;

		$scope.erg = "00:00:00:00";
		
		$scope.checkboxModel = {
				 
				 exclusive_start : false,
				 exclusive_end : false
		 };
		
		var calculating = false;
		

		function getShortType(type_long, leftOrRight) {
			
			var type_short =  (leftOrRight == 'right') ? $filter('split')(type_long, ':', 1) : $filter('split')(type_long, ':', 0) ;
			
			return (leftOrRight == 'right') ? type_short.substring(0,1).toLowerCase()+type_short.substring(1) : type_short.substring(0,0).toLowerCase()+type_short.substring(0);
		}
		

		$scope.toDate = function() {
			
	
			if(calculating == true) {
				
				var s = ""; //StartDate
				var e = "";//EndDate
				
			//	console.log("firstElemStartDateSumAvg: " + firstElemStartDateSumAvg + ", firstElemEndDateSumAvg: " + firstElemEndDateSumAvg + ", secondElemStartDateSumAvg: " + secondElemStartDateSumAvg + ", secondElemEndDateSumAvg: " + secondElemEndDateSumAvg);

				if(firstElemStartDateSumAvg > 0) {
					
					s = firstElemStartDateSumAvg;
				}
				else if(secondElemStartDateSumAvg > 0) {
					
					s = secondElemStartDateSumAvg;
				}
				
				 if(firstElemEndDateSumAvg > 0) {
					
					e = firstElemEndDateSumAvg;
				}
				 else if(secondElemEndDateSumAvg > 0) {
					
					e = secondElemEndDateSumAvg;
				}
				
				if(((firstElemStartDateSumAvg <= 0) && (secondElemStartDateSumAvg <= 0)) && ( (firstElemEndDateSumAvg > 0) && (secondElemEndDateSumAvg > 0))) {
					
					s = firstElemEndDateSumAvg;
					e = secondElemEndDateSumAvg;
				}
				
				else if(((firstElemStartDateSumAvg > 0) && (secondElemStartDateSumAvg > 0)) && ( (firstElemEndDateSumAvg <= 0) && (secondElemEndDateSumAvg <= 0))) {
					
					s = firstElemStartDateSumAvg;
					e = secondElemStartDateSumAvg;
				}
				

				
			//	console.log("s: " + s + ", e: " + e);
				
				var start = new Date(s);
				var end = new Date(e);

				var delta = Math.abs(end - start) / 1000;
				var days = Math.floor(delta / 86400);
				delta -= days * 86400;

				var hours = Math.floor(delta / 3600) % 24;
				delta -= hours * 3600;

				var minutes = Math.floor(delta / 60) % 60;
				delta -= minutes * 60;

				var seconds = delta % 60; 

				$scope.erg = days + ":" + hours + ":" + minutes + ":" + Math.floor(seconds);
				
				
			}	
		}
		
		$scope.abs = function(value) {
			
			return Math.abs(value);
		}

		$scope.reset = function() {
			
			calculating = false;
			
			$scope.el = [];
			firstElemStartDateSumAvg = 0;
			firstElemEndDateSumAvg = 0;
			
			secondElemStartDateSumAvg = 0;
			secondElemEndDateSumAvg = 0;
			$scope.erg =  "00:00:00:00";
	

			StateService.resetSelectedElement();
			
			$(".kpiElements").click(function(){
				
				$scope.el = StateService.getSelectedElement();
			});
		};
		
		$scope.calculate = function() {
			
			firstElemStartDateSumAvg = 0;
			firstElemEndDateSumAvg = 0;
			
			secondElemStartDateSumAvg = 0;
			secondElemEndDateSumAvg = 0;
			$scope.erg =  "00:00:00:00";
			
			if($scope.el.length < 2) return;

			var i = 0;
			var j = 0;
			
			
			DataFactory.getAllHistoricActivitiesDataByProcDefId(DataFactory.processDefinitionId, $scope.el[1].id).
			then(function(){

				var firstElemStartDateSum = 0;
				var firstElemEndDateSum = 0;
				
				var secondElemStartDateSum = 0;
				var secondElemEndDateSum = 0;
				
				var data = DataFactory.allHistoricActivitiesDataByProcDefId[DataFactory.processDefinitionId];
				
				angular.forEach(data, function(activity, index, list) {
					
					DataFactory.getAllHistoricActivitiesDataByProcInstId(activity.processInstanceId, $scope.el[0].id).
					then(function(){
						
						//EndElement
						if(activity.endTime != null) {
							
						//	console.log(activity.activityId + ": " + activity.startTime + ", " + activity.endTime + ", " + activity.processInstanceId);
							
							if($scope.checkboxModel.exclusive_end == false) {
								
								secondElemEndDateSum += (new Date(activity.endTime) - 0);
								j++;
								
							}else if ($scope.checkboxModel.exclusive_end == true) {
								
								secondElemStartDateSum += (new Date(activity.startTime) - 0);
								i++;
								
							}
						}
						
						var dat = DataFactory.allHistoricActivitiesDataByProcInstId[activity.processInstanceId];
						
						angular.forEach(dat, function(act, ind, li){
							
							//StartElement
							if(activity.endTime != null) {
								
							//	console.log(act.activityId + ": " +  act.startTime + ", " + act.endTime + ", " + act.processInstanceId);
								
								if($scope.checkboxModel.exclusive_start == false) {
									
									firstElemStartDateSum += (new Date(act.startTime) - 0);
									i++;
									
								} else if ($scope.checkboxModel.exclusive_start == true)  {
									
									firstElemEndDateSum += (new Date(act.endTime) - 0);
									j++;
								}
							}
						
						});
						
					//console.log("firstElemStartDateSum: " + firstElemStartDateSum + ", firstElemEndDateSum: " + firstElemEndDateSum + ", secondElemStartDateSum: " + secondElemStartDateSum + ", secondElemEndDateSum: " + secondElemEndDateSum);
						
						if((firstElemStartDateSum > 0) && (i != 0)) {
							
							firstElemStartDateSumAvg = firstElemStartDateSum / i;
							
						}  else if((firstElemEndDateSum > 0) && (j != 0)) {
							
							firstElemEndDateSumAvg =  firstElemEndDateSum / j; 
						}
						
						 if((secondElemStartDateSum > 0) && (i != 0)) {
							
							secondElemStartDateSumAvg = secondElemStartDateSum / i;
							
						} else if((secondElemEndDateSum > 0) && (j != 0)) {
							
							secondElemEndDateSumAvg =  secondElemEndDateSum / j; 
						}

						$scope.toDate();
					});
				});
			});
			
			calculating = true;
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