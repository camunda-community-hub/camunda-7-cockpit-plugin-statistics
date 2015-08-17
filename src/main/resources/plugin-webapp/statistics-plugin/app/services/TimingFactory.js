ngDefine('cockpit.plugin.statistics-plugin.services', function(module) {
	module.factory('TimingFactory',['DataFactory','Format','GraphFactory', 'kMeansFactory', '$rootScope', function(DataFactory, Format, GraphFactory, kMeansFactory, $rootScope) {
		var TimingFactory = {};

		TimingFactory.menuData = [];
		TimingFactory.getMenuData = function(){
			return DataFactory.getActivityNamesTypesProcDefinition()
			.then(function () {
				var menuData = Format.bringSortedDataInPlotFormat
				(DataFactory.activityNamesTypesProcDefinition,"procDefKey","type","activityName",undefined,undefined);
				for(var i = 0; i< menuData.length;i++){
					menuData[i].values = Format.bringNotSortedDataInPlotFormat(menuData[i].values,"x","y",undefined,undefined,undefined);
					var j = DataFactory.activityNamesTypesProcDefinition.map(function(e) { return e.procDefKey; }).indexOf(menuData[i].key);
					//add procDefId (we need that later to get the results from database using Rest API)
					menuData[i].Id = DataFactory.activityNamesTypesProcDefinition[j].procDefId;
				}
				TimingFactory.menuData = menuData;
			});
		};


		var getTimeFormatAndParser = function(timeFrame){
			if(timeFrame==="daily")
				return {format : "%H:%M", parser: Format.breakDateDownTo24h };
				else if(timeFrame==="weekly")
					return {format : "%a %H:%M", parser: Format.breakDateDownToWeek };
					else if(timeFrame === "noFrame")
						return {format: "%Y-%m-%dT%H", parser: d3.time.format("%Y-%m-%dT%H:%M:%S").parse };
						else console.debug("Error: no known time frame was chosen")
		};
		var timeFormatAndParser = {
				daily: {format : "%H:%M", parser: Format.breakDateDownTo24h},
				weekly: {format : "%a %H:%M", parser: Format.breakDateDownToWeek },
				noFrame: {format: "%Y-%m-%dT%H", parser: d3.time.format("%Y-%m-%dT%H:%M:%S").parse },
				dailyFormat: "%H:%M",
				weeklyFormat: "%a %H:%M",
				noFrameFormat: "%Y-%m-%dT%H"
		}

		TimingFactory.data = [];
		TimingFactory.options = [];

		var filterFormatedData = function(formatedData, attribute) {
			var filteredData = [];
			angular.forEach(formatedData, function(keyObject) {
				filteredKeyObject = { key: keyObject.key };
				filteredKeyObject.values = keyObject.values.map(function(d) {return d[attribute] == null? null : d}).filter(function(d) { return d != null });
				filteredData.push(filteredKeyObject);
			})
			return filteredData;
		}

		TimingFactory.prepareData = function(formatedData, options, colorScale, numberOfInstancesMap) {
			if(options.propertyToPlot == "regression"){
				var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S").parse;
				TimingFactory.options  = {
						outerRegion:[5, 95],
						scatter  : options.showScatter,
						regression : options.showRegression,
						spline : options.showSplines,
						x : "startTime",
						y: "durationInMillis",
						//TODO If it works put it all in chart
						chart : {
							color: colorScale
						}
				};
				TimingFactory.parseX = parseDate;
				TimingFactory.parseY = function(d) { return d/1000/60;};
				TimingFactory.dataForPlot = formatedData;
			} else if(options.propertyToPlot == "startEndTime") {
				var formatAndParser = getTimeFormatAndParser(options.timeFrame);
				var filteredData = filterFormatedData(formatedData, options.time);
				console.log(filteredData);
				if(options.cluster.algo == "kmeans") {
					TimingFactory.dataForPlot = Format.getKMeansClusterFromFormatedData(filteredData, formatAndParser, options.time, numberOfInstancesMap);
					TimingFactory.options = GraphFactory.getOptionsForStartEndTimeGraph({"format" : timeFormatAndParser[options.timeFrame + "Format"], "parser": function(d) { return new Date(d);}}, options.cluster.algo == "kmeans", 1000, options.time, colorScale);
				} else {
					TimingFactory.dataForPlot = filteredData;
					TimingFactory.options = GraphFactory.getOptionsForStartEndTimeGraph(timeFormatAndParser[options.timeFrame], options.cluster.algo == "kmeans", 1000, options.time, colorScale);
				}
			} else {
				var dataAndBins = Format.bringDataIntoBarPlotFormat(formatedData, "durationInMillis", options.numberOfBins);
				TimingFactory.dataForPlot = dataAndBins.data;
				TimingFactory.options = GraphFactory.getOptionsForTimeDistributionGraph(options.numberOfBins, dataAndBins.thresholds, function(d){return d/1000/60;}, colorScale);
			}
			return {"data" : TimingFactory.dataForPlot , "options": TimingFactory.options};
		}

		/**
		 * updates data without a call to the database
		 */
		TimingFactory.updateCharts = function(options, numberOfInstancesMap){
			return TimingFactory.prepareData(TimingFactory.formatedData, options, TimingFactory.colorScale, numberOfInstancesMap);
		};
		/**
		 * @selectedFromMenu: processes, and activities chosen by the user to plot
		 * @processData{boolean} in case we only request the data to get more information about the cluster range it 
		 * will not be processed.
		 */
		/**
		 * formating is now happening inside the loop, if performance becomes an issue we have to think of sth new
		 */
		TimingFactory.getModelMenuData = function(selectedFromMenu, options, evaluateData){
			console.log(options);
			//make an iterator over the 10 d3 default colors
			//colorDictionary is a map which assigns each key a color. This map is used to make 
			//a color function for the plots. It is calculated here and then reused in each update call
			//".color" properties of the legend are also set here. since changing something in selectedFromMenu also affects
			//the view (since it is $scope.selected)
			var colorIterator = makeIterator(d3.scale.category20().range());
			var colorDictionary =[];
			angular.forEach(selectedFromMenu, function(processObject){
				if(processObject.wholeProcess){
					var color = colorIterator.next();
					//this attribute is for the legend in our view
					processObject.color = {"background-color" : color };
					colorDictionary.push({"key" : processObject.process, "color": color});
				} else
					delete processObject.color;	//in case its still there from previous calls
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
			TimingFactory.colorScale = function(d, i) {
				keyIndex = colorDictionary.map(function(e) { return e.key; }).indexOf(d.key);
				return colorDictionary[keyIndex].color;
			};
			return DataFactory.getDataFromModelMenu(selectedFromMenu,options.timeWindow)
			.then(function(promiseData){
				TimingFactory.data  =[];
				angular.forEach(promiseData, function(singleCallbackReturn,promiseIndex){
					TimingFactory.data = TimingFactory.data.concat(singleCallbackReturn.data);
				});
				TimingFactory.formatedData = Format.bringSortedDataInKeyFormat(TimingFactory.data, ["activityName","processDefinitionKey"], 
						["processDefinitionId", "processDefinitionKey", "activityId", "activityName", "startTime", "endTime", "durationInMillis"]);
				var numberOfInstancesMap = getNumberOfInstances(TimingFactory.formatedData);
				//init numberOfInstancesMap with some reasonable default values
				TimingFactory.numberOfInstancesMap = kMeansFactory.ruleOfThumb(numberOfInstancesMap, options.time);
				//if we only want the data to know the ranges for the clustering, then this will be false
				if(evaluateData)
					TimingFactory.prepareData(TimingFactory.formatedData, options, TimingFactory.colorScale, TimingFactory.numberOfInstancesMap);
			});
		};


		var getNumberOfInstances = function(formatedData) {
			var numberOfInstancesMap = {};
			for (var i = 0; i < formatedData.length; i++) {
				var numberOfEndedInst = formatedData[i].values.map(function(d) { return d["endTime"] == null? null : d}).filter(function(d) { return d != null }).length;
				console.log(formatedData[i].values);
				numberOfInstancesMap[formatedData[i].key] = {"startedInst": formatedData[i].values.length , 
						"endedInst": numberOfEndedInst };
			}
			console.log(numberOfInstancesMap);
			return numberOfInstancesMap;
		}
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
