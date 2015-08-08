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
		
		TimingFactory.prepareData = function(rawData,options,colorScale){
			var timeString = (options.timeFrame ==="daily")?"24h":"Week";
			if(options.propertyToPlot == "regression"){
				var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S").parse;
				TimingFactory.chosenData = Format.bringSortedDataInPlotFormat(rawData,["activityName","processDefinitionKey"],"startTime","durationInMillis",parseDate,function(d){return d/1000/60;});
				console.log(TimingFactory.chosenData);
				TimingFactory.options  = {
						outerRegion:[5,95],
						scatter  : options.showScatter,
						regression : options.showRegression,
						spline : options.showSplines,
						//TODO If it works put it all in chart
						chart : {}
						
				};
			}
			else if(options.propertyToPlot == "startTime"||options.propertyToPlot == "endTime"){
				TimingFactory.chosenData = Format.bringSortedDataInPlotFormat(rawData,["activityName","processDefinitionKey"] ,options.propertyToPlot,"",eval("Format.breakDateDownTo"+timeString));
				console.log(options.cluster.numberOfClusters);
				TimingFactory.chosenData = Format.getKMeansClusterFromFormatedData(TimingFactory.chosenData,options.cluster.numberOfClusters);
				TimingFactory.options = GraphFactory.getOptionsForStartEndTimeGraph(getTimeFormat(options.timeFrame),1000);
				console.log(TimingFactory.chosenData);
			}
			else {
				var dataAndBins = Format.bringDataIntoBarPlotFormat(rawData,["activityName","processDefinitionKey"],"durationInMillis",function(d){return d/1000/60;},options.numberOfBins);
				TimingFactory.chosenData = dataAndBins.data;
				TimingFactory.options = GraphFactory.getOptionsForTimeDistributionGraph(options.numberOfBins,dataAndBins.thresholds);
				console.log(TimingFactory.chosenData);
				console.log(TimingFactory.options);
			}
			TimingFactory.options.chart.color = colorScale;
			return {"data" : TimingFactory.chosenData , "options": TimingFactory.options};
		}
		
		TimingFactory.updateCharts = function(options){
			console.log(options);
			return TimingFactory.prepareData(TimingFactory.data,options,TimingFactory.options.chart.color);
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
		TimingFactory.getModelMenuData = function(selectedFromMenu,options){
			console.log(options);
			//make an iterator over the 10 d3 default colors
			//colorDictionary is a map which assigns each key a color. This map is used to make 
			//a color function for the plots. It is calculated here and then reused in each update call
			//".color" properties of the legend are also set here. since changing something in selectedFromMenu also affects
			//the view (since it is $scope.selected)
			//TODO if more then 10 are selected we need the 20 color scale
			var colorIterator = makeIterator(d3.scale.category10().range());
			var colorDictionary =[];
			angular.forEach(selectedFromMenu, function(processObject){
				if(processObject.wholeProcess){
					var color = colorIterator.next();
					//this attribute is for the legend in our view
					processObject.color = {"background-color" : color };
					colorDictionary.push({"key" : processObject.process, "color": color});
				}
				angular.forEach(processObject.activityTypes, function(activityTypeObject){
					angular.forEach(activityTypeObject.activities, function(activityObject){
						var color = colorIterator.next();
						//this attribute is for the legend in our view
						activityObject.color = {"background-color" : color};
						colorDictionary.push({"key":activityObject.activity, "color": color});
					})
				})
			})
			//the colorfunction used in the plots
			var colorScale = function(d, i) {
		        keyIndex = colorDictionary.map(function(e) { return e.key; }).indexOf(d.key);
		        return colorDictionary[keyIndex].color;
		    };
			return DataFactory.getDataFromModelMenu(selectedFromMenu,options.timeWindow)
			.then(function(promiseData){
				console.log(promiseData);
				TimingFactory.data  =[];
				angular.forEach(promiseData, function(singleCallbackReturn,promiseIndex){
					TimingFactory.data = TimingFactory.data.concat(singleCallbackReturn.data);
				});
				TimingFactory.prepareData(TimingFactory.data,options,colorScale);
			});
		};
		
		/**
		 * @return: an iterator over an array. When the end is reached it starts all over again
		 * it is used to iterate over one of d3´s standard color arrays and make our own legend
		 * in getModelData
		 */
		function makeIterator(array){
			var nextIndex = 0;

			return {
				next: function(){
					if(nextIndex >= array.length)
						nextIndex =0 ;
					return array[nextIndex++];
				}
			}
		};
		
		return TimingFactory;
	}]);
});
