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
	
		/**
		 * this method is not needed anymore
		 */
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
		 * @date: an object containing date.to a date, date.from a date
		 * if specified only procs/acts in this period are ploted
		 */
		/**
		 * formating is now happening inside the loop, if performance becomes an issue we have to think of sth new
		 */
		TimingFactory.getModelMenuData = function(selectedFromMenu,xValue, timeFrame,timeWindow){
			var timeString = (timeFrame ==="daily")?"24h":"Week";
			return DataFactory.getDataFromModelMenu(selectedFromMenu,timeWindow)
			.then(function(promiseData){
				console.log(promiseData);
//				TimingFactory.chosenData = DataFactory.resultData;
				TimingFactory.chosenData  =[];
				angular.forEach(promiseData, function(singleCallbackReturn){
					TimingFactory.chosenData = TimingFactory.chosenData.concat(singleCallbackReturn.data);
					console.log(TimingFactory.chosenData);
				});
				if(xValue == "duration"){
					var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S").parse;
					TimingFactory.chosenData = Format.bringSortedDataInPlotFormat(TimingFactory.chosenData,"activityName","startTime","durationInMillis",parseDate,function(d){console.log(d/1000/60);return d/1000/60;});
					console.log(TimingFactory.chosenData);
					TimingFactory.options  = {
							outerRegion:[5,95],
							scatter  : true,
							regression : true,
							spline : false
					};
				}
				else{
					TimingFactory.chosenData = Format.bringSortedDataInPlotFormat(TimingFactory.chosenData,"activityName",xValue,"",eval("Format.breakDateDownTo"+timeString));
					TimingFactory.chosenData = Format.getKMeansClusterFromFormatedData(TimingFactory.chosenData,5);
					TimingFactory.options = GraphFactory.getOptionsForStartEndTimeGraph(getTimeFormat(timeFrame),1000);
					console.log(TimingFactory.chosenData);				}
			});
		}
		
		return TimingFactory;
	}]);
});
