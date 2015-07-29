ngDefine('cockpit.plugin.statistics-plugin.services', function(module) {
	module.factory('TimingFactory',['DataFactory','Format','GraphFactory','$rootScope', function(DataFactory,Format, GraphFactory,$rootScope) {
		var TimingFactory = {};

		var getTimeFormat = function(timeFrame){
			if(timeFrame==="daily")
				return "%H:%M";
			else if(timeFrame==="weekly")
				return "%a %H:%M";
			else console.debug("Error: no known time frame was chosen")
		};

		TimingFactory.data = [];
		TimingFactory.options = [];
	

		TimingFactory.getData = function(currentLevel, userTaskProcessSpecifier, currentFrame, currentXValue,width, kMeans){
			//if we decide to store data and not make an asynchronous call each time the table is build
			//(for example if we periodically update all data) 
			//then we have to remove this
			DataFactory.allUserTasksByProcDefKeyAndDateSpecification=[];
			var timeString = (currentFrame.frame =="daily")?"24h":"Week";
			if(currentLevel.level  == "process instances"){
				return DataFactory.getProcessesStartEnd()
				.then(function () {
					TimingFactory.data=Format.bringNotSortedDataInPlotFormat(DataFactory.processesStartEnd,"processDefinitionKey",currentXValue.xProperty,"",eval("Format.breakDateDownTo"+timeString),"");
//					TimingFactory.data = Format.getClusterFromFormatedData(data,$scope.clusterThreshold);
					console.debug("call kmeans from process instances");
					TimingFactory.data = Format.getKMeansClusterFromFormatedData(TimingFactory.data,kMeans);
					TimingFactory.options = GraphFactory.getOptionsForStartEndTimeGraph(currentFrame.format,width);
					if(TimingFactory.processInstancesList[0].processDefKey == "all"){
						TimingFactory.processInstancesList = initProcessList(TimingFactory.data);
					};
				});
			}
			else if(userTaskProcessSpecifier == "all"){
				var key = DataFactory.generateKeyAllUserTasksByProcDefKeyAndDateSpecification(undefined, currentXValue.xValue);
				return DataFactory.getAllUserTasksByProcDefKeyAndDateSpecification(undefined,currentXValue.xValue)
				.then(function(){
					TimingFactory.data=Format.bringNotSortedDataInPlotFormat
					(DataFactory.allUserTasksByProcDefKeyAndDateSpecification[key],"userTaskName",currentXValue.xProperty,"",eval("Format.breakDateDownTo"+timeString),"");
					TimingFactory.data = Format.getKMeansClusterFromFormatedData(TimingFactory.data, kMeans);
					TimingFactory.options = GraphFactory.getOptionsForStartEndTimeGraph(currentFrame.format,width);
				});

			}	
			else{
				var key = DataFactory.generateKeyAllUserTasksByProcDefKeyAndDateSpecification(userTaskProcessSpecifier, currentXValue.xValue);
				console.debug("key to lookup: "+key);
				return DataFactory.getAllUserTasksByProcDefKeyAndDateSpecification(userTaskProcessSpecifier,currentXValue.xValue)
				.then(function(){
					TimingFactory.data=Format.bringNotSortedDataInPlotFormat
					(DataFactory.allUserTasksByProcDefKeyAndDateSpecification[key],"userTaskName",currentXValue.xProperty,"",eval("Format.breakDateDownTo"+timeString),""); 
					TimingFactory.data = Format.getKMeansClusterFromFormatedData(TimingFactory.data, kMeans);
					TimingFactory.options = GraphFactory.getOptionsForStartEndTimeGraph(currentFrame.format,width);
				});
			};	
		};
		
		/**
		 * @selectedFromMenu: processes, and activities chosen by the user to plot
		 * @xValue: either starttime or endtime of the processes will be plotted on the x Axis
		 * @timeFrame: either focus on weekly dates i.e. the rest of the date will be ignored
		 * or focus on time only i.e. weekday, year will be ignored
		 * 
		 */
		TimingFactory.getModelMenuData = function(selectedFromMenu,xValue, timeFrame){
			var timeString = (timeFrame ==="daily")?"24h":"Week";
			console.log(timeFrame);
			console.log(timeString);
			return DataFactory.getDataFromModelMenu(selectedFromMenu)
			.then(function(promiseData){
//				TimingFactory.chosenData = DataFactory.resultData;
				TimingFactory.chosenData  =[];
				angular.forEach(promiseData, function(singleCallbackReturn){
					TimingFactory.chosenData = TimingFactory.chosenData.concat(singleCallbackReturn.data);
				});
				TimingFactory.chosenData = Format.bringSortedDataInPlotFormat(TimingFactory.chosenData,"activityName",xValue,"",eval("Format.breakDateDownTo"+timeString));
				TimingFactory.chosenData = Format.getKMeansClusterFromFormatedData(TimingFactory.chosenData,5);
				TimingFactory.options = GraphFactory.getOptionsForStartEndTimeGraph(getTimeFormat(timeFrame),1000);
				console.log(TimingFactory.chosenData);
				$rootScope.$broadcast('plotData:updated');
			});
		}
		
		return TimingFactory;
	}]);
});
