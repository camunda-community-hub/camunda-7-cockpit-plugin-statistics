ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {

	module.controller('startEndConfigController',['$scope','Uri','ScatterPlotConfigFactory', function($scope, Uri, ScatterPlotConfigFactory){

		//data to fill the accordion
		$scope.menuData = [];
		ScatterPlotConfigFactory.getMenuData()
		.then(function(){
			$scope.menuData = ScatterPlotConfigFactory.menuData;
			console.debug($scope.menuData);
		});

		//data chosen from the user in the accordion
		$scope.selected = [];
		//next two methods are used by the child controllers in the accordion
		//adds or deletes the chosenItem
		$scope.change = function(chosenItem,add){
			console.debug("change");
			//find out if the process has been inserted before????
			var indexProcess = $scope.selected.map(function(e) { return e.process; }).indexOf(chosenItem.process);
			//Case: process has been inserted before
			if(indexProcess >= 0){
				//whole process selected or deleted
				if(chosenItem.wholeProcess){
					$scope.selected[indexProcess].wholeProcess = add;
					//case: delete whole process and no other activitytype selected
					if(!add && $scope.selected[indexProcess].activityTypes.length ==0) $scope.selected.splice(indexProcess,1);
					return;
				}
				//activity has been chosen (not whole process)
				var indexActivityType = $scope.selected[indexProcess].activityTypes.map(function(e) { return e.activityType; }).indexOf(chosenItem.activityType);
				//Case: activityType has been added before
				if(indexActivityType>=0){
					if(add) $scope.selected[indexProcess].activityTypes[indexActivityType].activities.push({"activity": chosenItem.activity});
					else{
						var indexActivity = $scope.selected[indexProcess].activityTypes[indexActivityType].activities.map(function(e) { return e.activity; }).indexOf(chosenItem.activity);
						//remove activity
						$scope.selected[indexProcess].activityTypes[indexActivityType].activities.splice(indexActivity,1);
						//if no other activities of this type are selected --> delete activityType
						if($scope.selected[indexProcess].activityTypes[indexActivityType].activities.length==0){
							$scope.selected[indexProcess].activityTypes.splice(indexActivityType,1);
							//if no other types are selected and not whole process --> delete process
							if($scope.selected[indexProcess].activityTypes.length ==0 && !$scope.selected[indexProcess].wholeProcess)
								$scope.selected.splice(indexProcess,1);
						}
						
					}
				}
				//activityType has not been added yet
				else
					$scope.selected[indexProcess].activityTypes.push({"activityType":chosenItem.activityType, "activities":[{"activity":chosenItem.activity}]});
			}
			//process has not been added yet
			else{
				//add whole process
				if(chosenItem.wholeProcess)
					$scope.selected.push({"process":chosenItem.process, "wholeProcess": true, "activityTypes":[]});
				else if(add) //need this for the case: all activities unchecked, type still checked
					$scope.selected.push({"process":chosenItem.process, "wholeProcess": false, "activityTypes":[{"activityType":chosenItem.activityType, "activities":[{"activity":chosenItem.activity}]}]});
			}
			console.debug($scope.selected);
		};
		//used by the remove icon in the list itself
		$scope.removeFromList = function(chosenItem){
			$scope.deselect(chosenItem);
			$scope.$broadcast('removedListIcon',{"val":chosenItem})
		};

		$scope.imageSource = require.toUrl(Uri.appUri('plugin://statistics-plugin/static/app/pics/endTimePlot.jpg'));
	}]);

	module.controller('processItemController',['$scope', function($scope){
		//when the tooltips are displayed sth goes wrong
//		$scope.tooltip ="This will select the process..";
		$scope.isSelected = false;//ng-init
		$scope.toggleSelection = function(e) {
			$scope.isSelected= !$scope.isSelected;
			e.stopPropagation();e.preventDefault();
			$scope.change( {"process":$scope.processItem.key, "wholeProcess": true },$scope.isSelected );
		}; 
	}]);

	module.controller('activityTypeController',['$scope', function($scope){
		$scope.$watch('isSelected', function(newVal, oldVal){
			if(newVal!=oldVal)
				$scope.$broadcast('isSelectedChange',{"val":newVal})
		});

		//listens for the event when an item is removed from the list with the remove icon
		//and unchecks the box, so the list and boxes stay in sync
		//and if the activityType is unchecked it fires an event that
		//the activity controllers listen to
		$scope.$on('removedListIcon', function(event, args){
			if($scope.activityType.key == args.val){
				$scope.isSelected = false;
			}
		});

//		$scope.tooltip ="This will select all activities of that type..";
		$scope.isSelected = false;//ng-init
		this.isSelected = $scope.isSelected;
		$scope.toggleSelection = function(e) {
			$scope.isSelected= !$scope.isSelected;
			e.stopPropagation();e.preventDefault();
//			if ( $scope.isSelected ) {
//			$scope.select( $scope.activityType.key );
//			} else {
//			$scope.deselect( $scope.activityType.key );
//			}
		}; 
	}]);

	module.controller('activityController',['$scope', function($scope){
		$scope.$on('isSelectedChange', function(event, args){
			//else it is already in the wanted state
			if($scope.isSelected != args.val){
				$scope.isSelected = args.val;
				$scope.toggleSelection();
			}
		});
		//listens for the event when an item is removed from the list with the remove icon
		//and unchecks the box, so the list and boxes stay in sync
		$scope.$on('removedListIcon', function(event, args){
			if($scope.activity.x == args.val){
				$scope.isSelected = false;
			}
		});

		$scope.isSelected = false;//ng-init
//		$scope.tooltip ="...";
		$scope.toggleSelection = function() {
				var insert ={"process":$scope.processItem.key, "wholeProcess": false, "activityType":$scope.activityType.key, "activity": $scope.activity.x};
				console.debug(insert);
				$scope.change( insert,$scope.isSelected );
		}; 

	}]);
	
});

