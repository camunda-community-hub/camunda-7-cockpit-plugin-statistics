ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {

	module.controller('startEndConfigController',['$scope','Uri','ScatterPlotConfigFactory', 'TimingFactory', function($scope, Uri, ScatterPlotConfigFactory,TimingFactory){

		$scope.apply = function(){
			TimingFactory.getModelMenuData($scope.selected, $scope.xAxis.time, $scope.timeFrameModel.frame,$scope.date)
		};
		
		$scope.hallo = function() {
			console.log($scope.toDate);
			console.log($scope.fromDate);
		};

		$scope.clustering =  {
				algo: "kmeans",
				numberOfClusters: 5
		};
		
		$scope.timeFrameModel  = {
				frame : "weekly"
		};
		
		$scope.xAxis = {
				time: "startTime"
		};
		$scope.date = {
				from : null,
				to : null
		};
//		$scope.fromDate = null;
//		$scope.toDate = null;
		//data to fill the accordion
		$scope.menuData = [];
		ScatterPlotConfigFactory.getMenuData()
		.then(function(){
			$scope.menuData = ScatterPlotConfigFactory.menuData;
		});

		//data chosen from the user in the accordion
		$scope.selected = [];
		//next two methods are used by the child controllers in the accordion
		//adds or deletes the chosenItem
		$scope.change = function(chosenItem,add,processIndexMenu,activityTypeIndexMenu,activityIndexMenu){
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
					if(add) {
						$scope.selected[indexProcess].activityTypes[indexActivityType].activities.push({"activity": chosenItem.activity});
						//controls weather now all activities of this type are checked and then also check the type
						if ($scope.selected[indexProcess].activityTypes[indexActivityType].activities.length==$scope.menuData[processIndexMenu].values[activityTypeIndexMenu].values.length)
							$scope.$broadcast('checkActivityType',{"val":$scope.selected[indexProcess].activityTypes[indexActivityType].activityTyp});
					}
					//delete activity
					else{
						var indexActivity = $scope.selected[indexProcess].activityTypes[indexActivityType].activities.map(function(e) { return e.activity; }).indexOf(chosenItem.activity);
						//if one activity is removed we also uncheck the  activity type, since checking the type implies ALL activities to be checked
						$scope.$broadcast('activityTypeDeleted',{"val":$scope.selected[indexProcess].activityTypes[indexActivityType].activityType});
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
				else {
					$scope.selected[indexProcess].activityTypes.push({"activityType":chosenItem.activityType, "activities":[{"activity":chosenItem.activity}]});
					//if this type only has one activity then check it! since all activities of this type have just been checked
					if ($scope.menuData[processIndexMenu].values[activityTypeIndexMenu].values.length==1)
						$scope.$broadcast('checkActivityType',{"val":$scope.menuData[processIndexMenu].values[activityTypeIndexMenu].key});
				}
			}
			//process has not been added yet
			else{
				//add whole process
				if(chosenItem.wholeProcess)
					$scope.selected.push({"process":chosenItem.process, "procDefId": $scope.menuData[processIndexMenu].Id,"wholeProcess": true, "activityTypes":[]});
				else if(add) {//need this for the case: all activities unchecked, type still checked
					$scope.selected.push({"process":chosenItem.process,"procDefId": $scope.menuData[processIndexMenu].Id, "wholeProcess": false, "activityTypes":[{"activityType":chosenItem.activityType, "activities":[{"activity":chosenItem.activity}]}]});
					//if this type only has one activity then check it! since all activities of this type have just been checked
					if ($scope.menuData[processIndexMenu].values[activityTypeIndexMenu].values.length==1)
						$scope.$broadcast('checkActivityType',{"val":$scope.menuData[processIndexMenu].values[activityTypeIndexMenu].key});
				}
			}
			console.log($scope.selected);
		};
		//used by the remove icon in the list itself
		$scope.removeFromList = function(process, type, activity){
			if(!type){}
			else if (!activity){
				$scope.$broadcast('activityTypeDeleted',{"val":type})
			}
			else {
				var removeItem ={"process":process, "wholeProcess": false, "activityType":type, "activity": activity};
				$scope.change(removeItem);
				$scope.$broadcast('activityDeleted',{"val":activity})
			};
		};

		$scope.imageSource = require.toUrl(Uri.appUri('plugin://statistics-plugin/static/app/pics/endTimePlot.jpg'));
	}]);

	module.controller('processItemController',['$scope', function($scope){
		//when the tooltips are displayed sth goes wrong
//		$scope.tooltip ="This will select the process..";
		$scope.isSelected = false;//ng-init
		$scope.toggleSelection = function(e,processIndex) {
			$scope.isSelected= !$scope.isSelected;
			e.stopPropagation();e.preventDefault();
			$scope.change( {"process":$scope.processItem.key, "wholeProcess": true },$scope.isSelected,processIndex,undefined,undefined );
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
		$scope.$on('activityTypeDeleted', function(event, args){
			if($scope.activityType.key == args.val){
				$scope.isSelected = false;
			}
		});

		$scope.$on('checkActivityType', function(event, args){
			if($scope.activityType.key == args.val){
				$scope.isSelected = true;
			}
		});

//		$scope.tooltip ="This will select all activities of that type..";
		$scope.isSelected = false;//ng-init
		this.isSelected = $scope.isSelected;
		$scope.toggleSelection = function(e) {
			$scope.isSelected= !$scope.isSelected;
			e.stopPropagation();e.preventDefault();
		}; 
	}]);

	module.controller('activityController',['$scope', function($scope){
		$scope.$on('isSelectedChange', function(event, args){
			//else it is already in the wanted state
			if($scope.isSelected != args.val){
				$scope.isSelected = args.val;
				//these are inherited from parent scopes
				$scope.toggleSelection($scope.processItemIndex,$scope.activityTypeIndex,$scope.activityIndex);
			}
		});
		//listens for the event when an item is removed from the list with the remove icon
		//and unchecks the box, so the list and boxes stay in sync
		$scope.$on('activityDeleted', function(event, args){
			if($scope.activity.x == args.val){
				$scope.isSelected = false;
			}
		});

		$scope.isSelected = false;//ng-init
//		$scope.tooltip ="...";
		$scope.toggleSelection = function(processIndex,activityTypeIndex,activityIndex) {
			var insert ={"process":$scope.processItem.key, "wholeProcess": false, "activityType":$scope.activityType.key, "activity": $scope.activity.x};
			$scope.change( insert,$scope.isSelected,processIndex,activityTypeIndex,activityIndex );
		}; 

	}]);

});

