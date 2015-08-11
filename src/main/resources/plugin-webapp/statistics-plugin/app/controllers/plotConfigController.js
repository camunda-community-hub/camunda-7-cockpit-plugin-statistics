ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {

	module.controller('plotConfigController', ['$scope', 'TimingFactory', function($scope, TimingFactory) {
		
		var data,options;	//needed if we want to get the data without displaying it e.g. for clustering ranges
		/**
		 * test
		 */
		$scopenumberOfInstancesMap = "hihi";
		
		
		
		$scope.showLegend = false;
		$scope.showSlider = true;
		$scope.showClusterMenu = {
				show: true
		};

		//initialize the setting for the configuration menu
		
		//regulates which property should be plotted and at the same time
		//which property-window is open, since those two tings go hand in hand
		$scope.propertiesBoolean ={
				startEndTime : false,
				regression: false,
				distribution: true
		};
		
		/**
		 * determines from $scope.propertiesBoolean which property is to be plotted
		 */
		var getPropertyToPlot = function(booleans) {
			for (var property in booleans) {
				if (booleans.hasOwnProperty(property)) {	//check if its not a prototype property
					if(booleans[property]) return property;
				}
			}
			return "";
		}
		
		//regulates which info panels should be shown. Default is none
		$scope.info = {
				startEndTimeInfo:false,
				regressionInfo: false,
				distributionInfo: false
		};
		
		//the data of the menu which is important for database requests and graph options
		$scope.chosenOptions = {
				propertyToPlot : "distribution",	//the plot 
				numberOfBins : 10,					//belongs to distribution plot 
				time: "startTime",					//belongs to start-end plot
				timeFrame: "daily",					//belongs to start-end plot, specifies the time focus
				cluster : {							//belongs to start-end plot
					algo: "kmeans",
					numberOfClusters: 5
				},
				timeWindow : {						//belongs to data, specifies the time window the data is chosen from
					start: "",
					startDate : null,
					end: "",
					endDate: null
				},
				showScatter: true,					//belongs to time-series plot
				showSplines: false,					//belongs to time-series plot
				showRegression: false				//belongs to time-series plot
		};
		//init which option is shown in start time of data properts
		$scope.showClustering = false;
		
		//each time applyChanges is called requestToDataBank is set back to false
		//and each time a change occurs which needs other data then what we got it is set to true
		//those changes would be either other activities/processes or another time window for the other changes in the menu
		//we only have to reformat the data. This is done for performance
		var requestToDataBank = false;
		
		/**
		 * is called each time a change happens that makes a new request to the database necessary
		 */
		$scope.changeRequestToDataBase = function() {
			console.log("triggered");
			requestToDataBank = true;
		}
		
		$scope.alerts=[];
		var addAlert = function(reason) {
			if (reason=="missingData")
				$scope.alerts.push({type: 'danger', msg: 'Please choose some data to plot!'});
			else if (reason=="missingProperty")
				$scope.alerts.push({type: 'danger', msg: 'Please choose some propery to plot!'});
		}
		$scope.closeAlert = function(index) {
		    $scope.alerts.splice(index, 1);
		}
		
//		$scope.requestData = function() {
//			if ($scope.selected.length==0) {
//				addAlert("missingData"); 
//				return;
//			}
//			TimingFactory.getModelMenuData($scope.selected,$scope.chosenOptions)
//			.then(function(){
//				data = TimingFactory.chosenData;
//				options = TimingFactory.options;
//			});
//		}
		/**
		 * realizes the changes made in the menu
		 */
		$scope.applyChanges = function() {
			if ($scope.selected.length==0) {
				addAlert("missingData"); 
				return;
			}
			$scope.chosenOptions.propertyToPlot = getPropertyToPlot($scope.propertiesBoolean);
			if ($scope.chosenOptions.propertyToPlot=="") {
				addAlert("missingProperty");
				return;
			}
			console.debug("new request to database necessary:");
			console.debug(requestToDataBank);
			if (!requestToDataBank) {
				var update = TimingFactory.updateCharts($scope.chosenOptions);
				$scope.data = update.data;
				$scope.options = update.options;
				$scope.parseX = TimingFactory.parseX;
				$scope.parseY = TimingFactory.parseY;
			} else {
				TimingFactory.getModelMenuData($scope.selected,$scope.chosenOptions)
				.then(function(){
					$scope.data = TimingFactory.dataForPlot;
					$scope.options = TimingFactory.options;
					$scope.parseX = TimingFactory.parseX;
					$scope.parseY = TimingFactory.parseY;
					$scope.numberOfInstancesMap = TimingFactory.numberOfInstancesMap
					console.log($scope.numberOfInstancesMap);
				});
			}
			//reset requestToDataBank since new data just arrived
			requestToDataBank = false;
		}

		//data to fill the accordion
		$scope.menuData = [];
		TimingFactory.getMenuData()
		.then(function(){
			$scope.menuData = TimingFactory.menuData;
		});

		//data chosen from the user in the accordion
		$scope.selected = [];
		//next two methods are used by the child controllers in the accordion
		//adds or deletes the chosenItem
		//TODO: think if input parameters are really necessary
		//each time something is added it also gets a color
		//if it is deleted it gets deleted from the color dictionary and the iterator is set one step back
		$scope.change = function(chosenItem,add,processIndexMenu,activityTypeIndexMenu,activityIndexMenu) {
			//selected data has been changed so next time apply mehtod is called we have to request new data from 
			//the data base
			requestToDataBank = true;
			//find out if the process has been inserted before
			var indexProcess = $scope.selected.map(function(e) { return e.process; }).indexOf(chosenItem.process);
			//Case: process has been inserted before
			if (indexProcess >= 0) {
				//whole process selected or deleted
				if (chosenItem.wholeProcess) {
					$scope.selected[indexProcess].wholeProcess = add;
					//case: delete whole process and no other activitytype selected
					if(!add && $scope.selected[indexProcess].activityTypes.length ==0) {
						$scope.selected.splice(indexProcess,1);
					}
					return;
				}
				//activity has been chosen (not whole process)
				var indexActivityType = $scope.selected[indexProcess].activityTypes.map(function(e) { return e.activityType; }).indexOf(chosenItem.activityType);
				//Case: activityType has been added before
				if (indexActivityType>=0) {
					if (add) {
						$scope.selected[indexProcess].activityTypes[indexActivityType].activities.push({"activity": chosenItem.activity, "cluster": 5});
						//controls weather now all activities of this type are checked and then also checks the type
						if ($scope.selected[indexProcess].activityTypes[indexActivityType].activities.length==$scope.menuData[processIndexMenu].values[activityTypeIndexMenu].values.length) {
							$scope.$broadcast('checkActivityType',{"val":$scope.selected[indexProcess].activityTypes[indexActivityType].activityType});
						}
					}
					//delete activity
					else {
						var indexActivity = $scope.selected[indexProcess].activityTypes[indexActivityType].activities.map(function(e) { return e.activity; }).indexOf(chosenItem.activity);
						//if one activity is removed we also uncheck the  activity type, since checking the type implies ALL activities to be checked
						$scope.$broadcast('uncheckActivityType',{"val":$scope.selected[indexProcess].activityTypes[indexActivityType].activityType});
						//remove activity
						$scope.selected[indexProcess].activityTypes[indexActivityType].activities.splice(indexActivity,1);
						//if no other activities of this type are selected --> delete activityType
						if ($scope.selected[indexProcess].activityTypes[indexActivityType].activities.length==0){
							$scope.selected[indexProcess].activityTypes.splice(indexActivityType,1);
							//if no other types are selected and not whole process --> delete process
							if ($scope.selected[indexProcess].activityTypes.length ==0 && !$scope.selected[indexProcess].wholeProcess)
								$scope.selected.splice(indexProcess,1);
						}

					}
				}
				//activityType has not been added yet
				else {
					$scope.selected[indexProcess].activityTypes.push({"activityType":chosenItem.activityType, "activities":[{"activity":chosenItem.activity, "cluster": 5}]});
					//if this type only has one activity then check it! since all activities of this type have just been checked
					if ($scope.menuData[processIndexMenu].values[activityTypeIndexMenu].values.length==1)
						$scope.$broadcast('checkActivityType',{"val":$scope.menuData[processIndexMenu].values[activityTypeIndexMenu].key});
				}
			}
			//process has not been added yet
			else {
				//add whole process
				if (chosenItem.wholeProcess)
					$scope.selected.push({"process":chosenItem.process, "procDefId": $scope.menuData[processIndexMenu].Id,"wholeProcess": true,  "cluster": 5, "activityTypes":[]});
				else if (add) {//need this for the case: all activities unchecked, type still checked
					$scope.selected.push({"process":chosenItem.process,"procDefId": $scope.menuData[processIndexMenu].Id, "wholeProcess": false, "cluster": 5, "activityTypes":[{"activityType":chosenItem.activityType, "activities":[{"activity":chosenItem.activity, "cluster": 5}]}]});
					//if this type only has one activity then check it! since all activities of this type have just been checked
					if ($scope.menuData[processIndexMenu].values[activityTypeIndexMenu].values.length==1)
						$scope.$broadcast('checkActivityType',{"val":$scope.menuData[processIndexMenu].values[activityTypeIndexMenu].key});
				}
			}
		};
		//used by the remove icon in the list itself
		$scope.removeFromList = function(process, type, activity) {
			console.log(process);
			console.log(type);
			console.log(activity);
			//right now that cant happen, but if we include sth to delete processes in the list next 
			//to the menu it must be implemented
			if (!type) {}
			else if (!activity) {
				$scope.$broadcast('deleteActivityType', {"val": type})
			} else {
				var removeItem ={"process": process, "wholeProcess": false, "activityType": type, "activity": activity};
				//we dont use all input parameters since in the delete case they are not used anyway
				$scope.change(removeItem,false);
				$scope.$broadcast('activityDeleted', {"val": activity})
			}
		}
	}]);

	module.controller('processItemController',['$scope', function($scope){
		$scope.isSelected = false;
		$scope.toggleSelection = function(e, processIndex) {
			$scope.isSelected= !$scope.isSelected;
			e.stopPropagation();
			e.preventDefault();
			$scope.change( {"process":$scope.processItem.key, "wholeProcess": true }, $scope.isSelected, processIndex, undefined, undefined);
		}; 
	}]);

	module.controller('activityTypeController', ['$scope', function($scope) {
		//listens for the event when an item is removed from the list with the remove icon
		//and unchecks the box, so the list and boxes stay in sync
		//and if the activityType is unchecked it fires an event that
		//the activity controllers listen to
		$scope.$on('uncheckActivityType', function(event, args) {
			if($scope.activityType.key == args.val) {
				$scope.isSelected = false;
			}
		});

		$scope.$on('checkActivityType', function(event, args) {
			if($scope.activityType.key == args.val){
				$scope.isSelected = true;
			}
		});

		$scope.$on('deleteActivityType', function(event, args) {
			if($scope.activityType.key == args.val){
				$scope.isSelected = false;
				$scope.$broadcast('isSelectedChange',{"val":$scope.isSelected});
			}
		});

		$scope.isSelected = false;
		this.isSelected = $scope.isSelected;
		$scope.toggleSelection = function(e) {
			$scope.isSelected= !$scope.isSelected;
			$scope.$broadcast('isSelectedChange',{"val":$scope.isSelected});
			e.stopPropagation();
			e.preventDefault();
		}; 
	}]);

	module.controller('activityController',['$scope', function($scope) {
		$scope.$on('isSelectedChange', function(event, args) {
			//else it is already in the wanted state
			if ($scope.isSelected != args.val) {
				$scope.isSelected = args.val;
				//these are inherited from parent scopes
				$scope.toggleSelection($scope.processItemIndex,$scope.activityTypeIndex,$scope.activityIndex);
			}
		});
		//listens for the event when an item is removed from the list with the remove icon
		//and unchecks the box, so the list and boxes stay in sync
		$scope.$on('activityDeleted', function(event, args) {
			if($scope.activity.x == args.val) {
				$scope.isSelected = false;
			}
		});

		$scope.isSelected = false;
		$scope.toggleSelection = function(processIndex, activityTypeIndex, activityIndex) {
			var insert = {"process": $scope.processItem.key, "wholeProcess": false, "activityType": $scope.activityType.key, "activity": $scope.activity.x};
			$scope.change(insert, $scope.isSelected, processIndex, activityTypeIndex, activityIndex);
		}; 
	}]);
});

