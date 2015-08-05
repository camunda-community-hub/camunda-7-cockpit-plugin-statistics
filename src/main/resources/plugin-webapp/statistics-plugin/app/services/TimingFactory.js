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
				TimingFactory.chosenData  =[];
				angular.forEach(promiseData, function(singleCallbackReturn,promiseIndex){
					TimingFactory.chosenData = TimingFactory.chosenData.concat(singleCallbackReturn.data);
				});
				if(xValue == "duration"){
					var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S").parse;
					TimingFactory.chosenData = Format.bringSortedDataInPlotFormat(TimingFactory.chosenData,["activityName","processDefinitionKey"],"startTime","durationInMillis",parseDate,function(d){return d/1000/60;});
					console.log(TimingFactory.chosenData);
					TimingFactory.options  = {
							outerRegion:[5,95],
							scatter  : true,
							regression : true,
							spline : false,
							//TODO If it works put it all in chart
							chart : {}
							
					};
				}
				else if(xValue == "startTime"||xValue == "endTime"){
					TimingFactory.chosenData = Format.bringSortedDataInPlotFormat(TimingFactory.chosenData,["activityName","processDefinitionKey"] ,xValue,"",eval("Format.breakDateDownTo"+timeString));
					console.log(TimingFactory.chosenData);
					TimingFactory.chosenData = Format.getKMeansClusterFromFormatedData(TimingFactory.chosenData,5);
					TimingFactory.options = GraphFactory.getOptionsForStartEndTimeGraph(getTimeFormat(timeFrame),1000);
					console.log(TimingFactory.chosenData);
				}
				else {
					var dataAndBins = Format.bringDataIntoBarPlotFormat(TimingFactory.chosenData,"processDefinitionKey","durationInMillis",function(d){return d/1000/60;},10);
					TimingFactory.chosenData = dataAndBins.data;
					TimingFactory.options = GraphFactory.getOptionsForTimeDistributionGraph(10,dataAndBins.thresholds);
					console.log(TimingFactory.chosenData);
					console.log(TimingFactory.options);
				}
			});
		}
		
		return TimingFactory;
	}]);
});
