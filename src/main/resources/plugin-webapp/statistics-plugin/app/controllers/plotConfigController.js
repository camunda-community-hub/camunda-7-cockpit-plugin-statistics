ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {

	module.controller('plotConfigController', ['$scope', 'TimingFactory', 'UserInteractionFactory', function($scope, TimingFactory, UserInteractionFactory) {

//		$scope.noFrameFormats = [ '%m/%d/%Y', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
		$scope.widthDependingClass = "col-sm-6";
		
		
		$scope.$on('widthChanged', function() {
			console.log(UserInteractionFactory.currentWidth);
			if(1200 < UserInteractionFactory.currentWidth && UserInteractionFactory.currentWidth < 1620) 
				$scope.widthDependingClass = "col-sm-12";
			else $scope.widthDependingClass = "col-sm-6";
		});
		
		
		
		$scope.changeView = function() {
			$scope.legendView = !$scope.legendView;
		}
		$scope.legendView = false;
		$scope.showClusterMenu = {
				show: false
		};

		//initialize the setting for the configuration menu

		//regulates which property should be plotted and at the same time
		//which property-window is open, since those two things go hand in hand
		$scope.propertiesBoolean ={
				startEndTime : false,
				regression: false,
				distribution: true
		};

		/**
		 * determines from $scope.propertiesBoolean which property is to be plotted
		 * @return if one of the properties of the booleans object is true, it returns this attribute
		 * otherwise null
		 */
		var getPropertyToPlot = function(booleans) {
			for (var property in booleans) {
				if (booleans.hasOwnProperty(property)) {	//check if its not a prototype property
					if(booleans[property]) return property;
				}
			}
			return null;
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
//				noFrameFormat: $scope.noFrameFormats[0],
				cluster : {							//belongs to start-end plot
					algo: "kmeans"
				},
				timeWindow : {						//belongs to data, specifies the time window the data is chosen from
					start: "",
					startDate : null,
					end: "",
					endDate: null,
					endTime: null
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
			requestToDataBank = true;
		}

		$scope.alerts=[];
		var addAlert = function(reason) {
			if (reason == "missingData")
				$scope.alerts.push({type: 'danger', msg: 'Please choose some data to plot!'});
			else if (reason == "missingProperty")
				$scope.alerts.push({type: 'danger', msg: 'Please choose some propery to plot!'});
			else if (reason == "missingStartDate")
				$scope.alerts.push({type: 'danger', msg: 'Please specify a start date!'});
			else if (reason == "missingEndDate")
				$scope.alerts.push({type: 'danger', msg: 'Please specify an end date!'});
			else if(reason == "noSuchData")
				$scope.alerts.push({type: 'danger', msg: 'There is no such data!'});
		}
		$scope.closeAlert = function(index) {
			$scope.alerts.splice(index, 1);
		}




		/**checks weather we need to request data from the data base to display the slider menu,
		 * since we need to know how many instances of each selected data group we have, to be able to show the 
		 * adequate range for the clustering. If a request has to be made, nothing will be shown in the plot
		 * @return{boolean} true if slider menu can be shown, false if not
		 */
		$scope.getDataForClusterSlider = function() {
			//check weather we have enough data to display cluster sliders
			if (!checkValidity()) return false;
			//if the data is already in memory do not call database, just display sliders
			if(!requestToDataBank) return true;
			TimingFactory.getModelMenuData($scope.selected,$scope.chosenOptions, false)
			.then(function(){
				$scope.numberOfInstancesMap = TimingFactory.numberOfInstancesMap
			});

			//reset requestToDataBank since new data just arrived
			requestToDataBank = false;
			//show sliders
			return true;
		};



		var isAPlotSelected = function(booleans) {
			for (var property in booleans) {
				if (booleans.hasOwnProperty(property)) {	//check if its not a prototype property
					if(booleans[property]) return true;
				}
			}
			return false;
		}

		/**
		 * checks weather a request to database can be made or not
		 * i.e. if some data to plot was selected and if a plot type is selected
		 * @return{boolean} 
		 */
		var checkValidity = function() {
			if ($scope.selected.length == 0) {
				addAlert("missingData"); 
				return false;
			}
			if (!isAPlotSelected($scope.propertiesBoolean)) {
				addAlert("missingProperty");
				return false;
			}
			if($scope.chosenOptions.timeWindow.start != "" && $scope.chosenOptions.timeWindow.startDate == null) {
				addAlert("missingStartDate");
				return false;
			}
			if($scope.chosenOptions.timeWindow.end != "" && $scope.chosenOptions.timeWindow.endDate == null) {
				addAlert("missingEndDate");
				return false;
			}
			
			return true;
		}
		/**
		 * realizes the changes made in the menu
		 */
		$scope.applyChanges = function() {
			if (!checkValidity()) return;
//			console.debug("new request to database necessary:");
//			console.debug(requestToDataBank);
			$scope.chosenOptions.propertyToPlot = getPropertyToPlot($scope.propertiesBoolean);
			if (!requestToDataBank) {
				var update = TimingFactory.updateCharts($scope.chosenOptions, $scope.numberOfInstancesMap);
				if(update.data.length == 0) {
					addAlert("noSuchData");
					return;
				}
				$scope.data = update.data;
				console.log("data:", $scope.data);
				$scope.options = update.options;
				$scope.parseX = TimingFactory.parseX;
				$scope.parseY = TimingFactory.parseY;
				//sometimes only functions change in options, those are not watched, so we need to trigger
				//the update mechanism if we plot with NVD3
				//using this produces an error since it seems to only use the option in the input and not the newly set data
//				if ($scope.chosenOptions.propertyToPlot=='startEndTime'||$scope.chosenOptions.propertyToPlot=='distribution')
//					$scope.api.updateWithOptions($scope.options);
			} else {
				TimingFactory.getModelMenuData($scope.selected, $scope.chosenOptions, true)
				.then(function(){
					if(TimingFactory.dataForPlot.length == 0) {
						addAlert("noSuchData");
						return;
					}
					$scope.data = TimingFactory.dataForPlot;
					$scope.options = TimingFactory.options;
					$scope.parseX = TimingFactory.parseX;
					$scope.parseY = TimingFactory.parseY;
					$scope.numberOfInstancesMap = TimingFactory.numberOfInstancesMap
				});
			}
			//reset requestToDataBank since new data just arrived
			requestToDataBank = false;
			//get into legend view
			$scope.legendView = true;
		}

		//data to fill the accordion
		$scope.menuData = [];
		TimingFactory.getMenuData()
		.then(function(){
			$scope.menuData = TimingFactory.menuData;
			console.log($scope.menuData);
		});

		//data chosen from the user in the accordion
		$scope.selected = [];
		//next two methods are used by the child controllers in the accordion
		//adds or deletes the chosenItem
		//TODO: think if input parameters are really necessary
		//each time something is added it also gets a color
		//if it is deleted it gets deleted from the color dictionary and the iterator is set one step back
		$scope.change = function(chosenItem, add, processIndexMenu, activityTypeIndexMenu, activityIndexMenu) {
			//selected data has been changed so next time apply method is called we have to request new data from 
			//the data base
			requestToDataBank = true;
			//find out if the process has been inserted before
			var indexProcess = $scope.selected.map(function(e) { return e.process; }).indexOf(chosenItem.process);
			//Case: process has been inserted before
			if (indexProcess >= 0) {
				//whole process selected or deleted
				if (chosenItem.wholeProcess) {
					$scope.selected[indexProcess].wholeProcess = add;
					//case: delete whole process and no other activity type selected
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
						$scope.selected[indexProcess].activityTypes[indexActivityType].activities.push({"activity": chosenItem.activity});
						//controls weather now all activities of this type are checked and then also checks the type
						if ($scope.selected[indexProcess].activityTypes[indexActivityType].activities.length==$scope.menuData[processIndexMenu].actTypes[activityTypeIndexMenu].acts.length) {
							$scope.$broadcast('checkActivityType',{"key":$scope.selected[indexProcess].process, "type":$scope.selected[indexProcess].activityTypes[indexActivityType].activityType});
						}
					}
					//delete activity
					else {
						var indexActivity = $scope.selected[indexProcess].activityTypes[indexActivityType].activities.map(function(e) { return e.activity; }).indexOf(chosenItem.activity);
						//if one activity is removed we also uncheck the  activity type, since checking the type implies ALL activities to be checked
						$scope.$broadcast('uncheckActivityType',{"key":$scope.selected[indexProcess].process, "type":$scope.selected[indexProcess].activityTypes[indexActivityType].activityType});
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
					$scope.selected[indexProcess].activityTypes.push({"activityType":chosenItem.activityType, "activities":[{"activity":chosenItem.activity}]});
					//if this type only has one activity then check it! since all activities of this type have just been checked
					if ($scope.menuData[processIndexMenu].actTypes[activityTypeIndexMenu].acts.length==1)
						$scope.$broadcast('checkActivityType',{"key": $scope.menuData[processIndexMenu].procName, "type":$scope.menuData[processIndexMenu].actTypes[activityTypeIndexMenu].type});
				}
			}
			//process has not been added yet
			else {
				//add whole process
				if (chosenItem.wholeProcess)
					$scope.selected.push({"process":chosenItem.process, "procName": chosenItem.procName, "procDefIds":chosenItem.procDefIds ,"wholeProcess": true, "activityTypes":[]});
				else if (add) {//need this for the case: all activities unchecked, type still checked
					$scope.selected.push({"process":chosenItem.process, "procName": chosenItem.procName, "procDefIds": chosenItem.procDefIds, "wholeProcess": false, "activityTypes":[{"activityType":chosenItem.activityType, "activities":[{"activity":chosenItem.activity}]}]});
					//if this type only has one activity then check it! since all activities of this type have just been checked
					if ($scope.menuData[processIndexMenu].actTypes[activityTypeIndexMenu].acts.length==1)
						$scope.$broadcast('checkActivityType',{"key": $scope.menuData[processIndexMenu].procName, "type":$scope.menuData[processIndexMenu].actTypes[activityTypeIndexMenu].type});
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
				$scope.$broadcast('deleteActivityType', {"key": process, "type": type})
			} else {
				var removeItem ={"process": process, "wholeProcess": false, "activityType": type, "activity": activity};
				//we dont use all input parameters since in the delete case they are not used anyway
				$scope.change(removeItem,false);
				$scope.$broadcast('activityDeleted', {"val": activity})
			}
		}
		
		
		$scope.changeVersions = function(key, procDefIds) {
			var indexProcess = $scope.selected.map(function(e) { return e.process; }).indexOf(key);
			if(indexProcess != -1) {
				//selected version has been changed so next time apply method is called we have to request new data from 
				//the data base
				requestToDataBank = true;
				$scope.selected[indexProcess].procDefIds = procDefIds;
			}
		}
	}]);

	module.controller('processItemController',['$scope', function($scope){
		$scope.isSelected = false;
		$scope.versions =  $scope.processItem.vIds;
		var a=[],b=$scope.versions.length;while(b--)a[b]=b+1;
		$scope.selectedVersions = a;
		$scope.$watchCollection('selectedVersions',function(){
			$scope.changeVersions($scope.processItem.key, $scope.getProcDefIdsFromIds($scope.selectedVersions, $scope.versions));
		});
		$scope.toggleSelection = function(e, processIndex) {
			$scope.isSelected= !$scope.isSelected;
			e.stopPropagation();
			e.preventDefault();
			var procDefIds = $scope.getProcDefIdsFromIds($scope.selectedVersions, $scope.versions);
			console.log(procDefIds);
			$scope.change( {"process":$scope.processItem.key, "procName": $scope.processItem.name, "procDefIds": procDefIds, "wholeProcess": true }, $scope.isSelected, processIndex, undefined, undefined);
		}; 
		
		$scope.getProcDefIdsFromIds = function(ids, versions) {
			procDefIds = [];
			console.log(ids);
			for(var i = 0; i < ids.length; i++) {
				console.log(versions);
				angular.forEach(versions, function(ver){
					console.log(ver);
					if (ver.id == ids[i]) procDefIds.push(ver.procDefId);
				})
			}
			return procDefIds;
		}
	}]);

	module.controller('activityTypeController', ['$scope', function($scope) {
		//listens for the event when an item is removed from the list with the remove icon
		//and unchecks the box, so the list and boxes stay in sync
		//and if the activityType is unchecked it fires an event that
		//the activity controllers listen to
		$scope.$on('uncheckActivityType', function(event, args) {
			if($scope.processItem.key == args.key && $scope.activityType.type == args.type) {
				$scope.isSelected = false;
			}
		});

		$scope.$on('checkActivityType', function(event, args) {
			if($scope.processItem.key == args.key && $scope.activityType.type == args.type){
				$scope.isSelected = true;
			}
		});

		$scope.$on('deleteActivityType', function(event, args) {
			if($scope.processItem.key == args.key && $scope.activityType.type == args.type){
				$scope.isSelected = false;
				$scope.$broadcast('isSelectedChange',{"val":$scope.isSelected});
			}
		});

		$scope.isSelected = false;
//		this.isSelected = $scope.isSelected;
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
				$scope.toggleSelection($scope.processItemIndex, $scope.activityTypeIndex, $scope.activityIndex);
			}
		});
		//listens for the event when an item is removed from the list with the remove icon
		//and unchecks the box, so the list and boxes stay in sync
		$scope.$on('activityDeleted', function(event, args) {
			if($scope.activity.actName == args.val) {
				$scope.isSelected = false;
			}
		});

		$scope.isSelected = false;
		$scope.toggleSelection = function(processIndex, activityTypeIndex, activityIndex) {
			var procDefIds = $scope.getProcDefIdsFromIds($scope.selectedVersions, $scope.versions);
			console.log(procDefIds);
			var insert = {"process": $scope.processItem.key, "procName": $scope.processItem.name, "procDefIds": procDefIds, "wholeProcess": false, "activityType": $scope.activityType.type, "activity": $scope.activity.actName};
			$scope.change(insert, $scope.isSelected, processIndex, activityTypeIndex, activityIndex);
		}; 
		$scope.disabled = true;
		//depending on what versions are chosen, only certain activities are choosable
		$scope.$watchCollection('selectedVersions',function(){
			$scope.disabled = true;
			angular.forEach($scope.activity.versions, function(version) {
				angular.forEach($scope.selectedVersions, function(id) {
					var index = $scope.versions.map(function(e) {return e.id}).indexOf(id);
					if(version == $scope.versions[index].value) $scope.disabled = false;
				})
			})
//			for (var i = 0; i < $scope.activity.versions) {
//				for(var j = 0; j < $scope.selectedVersions.length; j++) {
//					if ()
//				}
//			}
		});
	}]);
});

