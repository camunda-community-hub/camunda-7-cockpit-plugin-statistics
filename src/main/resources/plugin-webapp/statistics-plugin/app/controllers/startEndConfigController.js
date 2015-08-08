ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {

	module.controller('startEndConfigController',['$scope','Uri','ScatterPlotConfigFactory', 'TimingFactory', function($scope, Uri, ScatterPlotConfigFactory,TimingFactory){

		var getPropertyToPlot = function(booleans){
			for (var property in booleans) {
			    if (booleans.hasOwnProperty(property)) {	//check if its not a prototype property
			        if(booleans[property]) return property;
			    }
			}
			console.error("no optioin to plot was chosen!")
		};
		$scope.propertiesBoolean ={
				startTime : false,
				regression: false,
				distribution: true
		}
		$scope.update = function(){
			$scope.chosenOptions.propertyToPlot = getPropertyToPlot($scope.propertiesBoolean);
			var update = TimingFactory.updateCharts($scope.chosenOptions);
			$scope.data = update.data;
			$scope.options = update.options;
		};
		$scope.apply = function(){
			console.log($scope.chosenOptions);
			$scope.chosenOptions.propertyToPlot = getPropertyToPlot($scope.propertiesBoolean);
			TimingFactory.getModelMenuData($scope.selected,$scope.chosenOptions)
			.then(function(){
				$scope.data = TimingFactory.chosenData;
				$scope.options = TimingFactory.options;
			});
		};
		
		$scope.chosenOptions = {
				propertyToPlot : "distribution",
				numberOfBins : 10,
				timeFrame: "daily",
				cluster : {
						algo: "kmeans",
						numberOfClusters: 5
				},
				timeWindow : {
						start: "",
						startDate : null,
						end: "",
						endDate: null
				},
				showScatter: true,
				showSplines: false,
				showRegression: false
		};
		//TODO: delete
		$scope.isCollapsed = true;
		var requestToDataBank = false;
		
		$scope.toggleSelection = function(e,selected) {
			selected = !selected;
			e.stopPropagation();e.preventDefault();
		}; 
		
		//data to fill the accordion
		$scope.menuData = [];
		ScatterPlotConfigFactory.getMenuData()
		.then(function(){
			$scope.menuData = ScatterPlotConfigFactory.menuData;
		});

		//data chosen from the user in the accordion
		$scope.selected = [];
		var copyOfSelected = [];
		//next two methods are used by the child controllers in the accordion
		//adds or deletes the chosenItem
		//TODO: think if input parameters are really necessary
		//each time something is added it also gets a color
		//if it is deleted it gets deleted from the color dictionary and the iterator is set one step back
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
					if(!add && $scope.selected[indexProcess].activityTypes.length ==0){
						$scope.selected.splice(indexProcess,1);
					}
					return;
				}
				//activity has been chosen (not whole process)
				var indexActivityType = $scope.selected[indexProcess].activityTypes.map(function(e) { return e.activityType; }).indexOf(chosenItem.activityType);
				//Case: activityType has been added before
				if(indexActivityType>=0){
					if(add) {
						$scope.selected[indexProcess].activityTypes[indexActivityType].activities.push({"activity": chosenItem.activity});
						//controls weather now all activities of this type are checked and then also checks the type
						if ($scope.selected[indexProcess].activityTypes[indexActivityType].activities.length==$scope.menuData[processIndexMenu].values[activityTypeIndexMenu].values.length){
							$scope.$broadcast('checkActivityType',{"val":$scope.selected[indexProcess].activityTypes[indexActivityType].activityType});
						}
					}
					//delete activity
					else{
						var indexActivity = $scope.selected[indexProcess].activityTypes[indexActivityType].activities.map(function(e) { return e.activity; }).indexOf(chosenItem.activity);
						//if one activity is removed we also uncheck the  activity type, since checking the type implies ALL activities to be checked
						$scope.$broadcast('uncheckActivityType',{"val":$scope.selected[indexProcess].activityTypes[indexActivityType].activityType});
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
			//right now that cant happen, but if we include sth to delete processes in the list next 
			//to the menu it must be implemented
			if(!type){}
			else if (!activity){
				$scope.$broadcast('deleteActivityType',{"val":type})
			}
			else {
				var removeItem ={"process":process, "wholeProcess": false, "activityType":type, "activity": activity};
				//we dont use all input parameters since in the delete case they are not used anyway
				$scope.change(removeItem,false);
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
//		$scope.$watch('isSelected', function(newVal, oldVal){
//		if(newVal!=oldVal)
//		$scope.$broadcast('isSelectedChange',{"val":newVal})
//		});

		//listens for the event when an item is removed from the list with the remove icon
		//and unchecks the box, so the list and boxes stay in sync
		//and if the activityType is unchecked it fires an event that
		//the activity controllers listen to
		$scope.$on('uncheckActivityType', function(event, args){
			if($scope.activityType.key == args.val){
				$scope.isSelected = false;
			}
		});

		$scope.$on('checkActivityType', function(event, args){
			if($scope.activityType.key == args.val){
				$scope.isSelected = true;
			}
		});

		$scope.$on('deleteActivityType', function(event, args){
			if($scope.activityType.key == args.val){
				$scope.isSelected = false;
				$scope.$broadcast('isSelectedChange',{"val":$scope.isSelected});
			}
		});

//		$scope.tooltip ="This will select all activities of that type..";
		$scope.isSelected = false;//ng-init
		this.isSelected = $scope.isSelected;
		$scope.toggleSelection = function(e) {
			$scope.isSelected= !$scope.isSelected;
			$scope.$broadcast('isSelectedChange',{"val":$scope.isSelected});
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

