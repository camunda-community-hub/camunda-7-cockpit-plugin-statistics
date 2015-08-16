ngDefine('cockpit.plugin.statistics-plugin.services', function(module) {
	module.factory('Format', function() {
		var Format = {};

		/**
		 * puts the whole data elements in the proper key box
		 * THE ORDER IN KEY ARRAY MATTERS
		 * @data{Object} the raw data from the database
		 * @keyArray{Array} containing Strings which are the attributes that should be extracted as keys
		 * Be careful! the order in keyArray matters! The data element might have both attributes, but if it has the
		 * first one, than the first one will be taken as key
		 * @attributesArray{Array} of Strings contains the attributes that should be copied to the newly formated Data
		 * @return data in key format with the chosen attributes
		 */
		Format.bringSortedDataInKeyFormat = function(data, keyArray, attributesArray){
			var formatedData = [];
			var i = -1;
			angular.forEach(data ,function(element){
				if (typeof keyArray == "string") var key = keyArray;
				else {
					var key = !element.hasOwnProperty(keyArray[0]) ? keyArray[1] : keyArray[0];
				}
				if (typeof formatedData[i] == "undefined" || formatedData[i].key != element[key]) {
					formatedData.push({"key": element[key], "values": []});
					i++;
				};
//				formatedData[i].values.push(element);
				var newDataElement = {};
				for( var j = 0; j < attributesArray.length; j++){
					if(element.hasOwnProperty(attributesArray[j]))
						newDataElement[attributesArray[j]] = element[attributesArray[j]];
				}
				formatedData[i].values.push(newDataElement);
			});
			console.log(formatedData);
			return formatedData;
		};

		/**method that either sets the year, month and day of a data to a hardcoded date
		 * or sets the year and month to a harcoded day
		 * 
		 * this is needed when only the time of dates is important, so that the plot ingnores
		 * the rest of the timestamp, because its the same for each date
		 * 
		 * if year and month but day and time are important use the second option
		 * 
		 * @date{String}a String in the Camunda database timestamp format: %Y-%m-%dT%H:%M:%S
		 * @param beakDownFormat
		 */
		Format.breakDateDown = function(date,breakDownFormat){
			var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S").parse;
			var changedDate = date.substr(10);
			if(breakDownFormat == "24h" || breakDownFormat == "daily")
				changedDate = "1991-05-05" + changedDate;

			else if(breakDownFormat == "week" || breakDownFormat == "weekly")
				changedDate = "2014-11-0" +(2+ parseDate(date).getDay()) + changedDate;

			return parseDate(changedDate);
		};

		Format.breakDateDownTo24h = function(date){
			var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S").parse;
			var changedDate = date.substr(10);
			changedDate = "1991-05-05" + changedDate;

			return parseDate(changedDate);
		};

		Format.breakDateDownToWeek = function(date){
			var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S").parse;
			var changedDate = date.substr(10);
			changedDate = "2014-11-0" +(2+ parseDate(date).getDay()) + changedDate;

			return parseDate(changedDate);
		};

		/**
		 * a method that takes data from a sql call to camunda database (it has to be sorted by its key property!)
		 * and transformes puts it into a structure that is recognized by most plots
		 * 
		 * @param data the data that will be formated. Data needs to be sorted by its key property for 
		 * this function to work!!
		 * @param keyArray a string or an array of strings, if the object does not have the first string as an attribute, the second is tried!!!!!!!! SO THE ORDER MATTERS!!!
		 * @param x the property of data that will be plotted on the x axis
		 * @param y the property of data that will be plotted on the y axis, if no y value is specified each key will get 
		 * a dummy y property, so all points belonging to one key will have the same y value
		 * @param parseX the name of a function, before the x property is pushed in the new data structure
		 * it will be parsed by parseX
		 * @param parsey the name of a function, before the y property is pushed in the new data structure
		 * it will be parsed by parseY
		 */
		Format.bringSortedDataInPlotFormat = function(data, keyArray, x, y, parseX, parseY){

			var identity = function(value){return value};
			var parseX = (typeof parseX == "undefined" || parseX == "")? identity:parseX;
			var parseY = (typeof parseY == "undefined" || parseY == "")? identity:parseY;

			var formatedData = [];
			var i = -1;
			angular.forEach(data ,function(element){
				if(typeof keyArray == "string") var key = keyArray;
				else {
					var key = !element.hasOwnProperty(keyArray[0]) ? keyArray[1] : keyArray[0];
				}
				if(typeof formatedData[i] == "undefined" || formatedData[i].key != element[key]){
					formatedData.push({"key": element[key], "values": []});
					i++;
				};
				var yValue = (typeof y == "undefined" || y == "")? i+1 : element[y];
				//remove this when query doesnt give nullvalues anymore
				if(element[x] == null);
				else  {
					formatedData[i].values.push({"x": parseX(element[x]), "y": parseY(yValue)  });
				}
			});
			return formatedData;
		};
		//when method works combine the two, default will be unsorted, when sorted argument is true, the sorted algo will
		//be used to improove perfomance
		Format.bringNotSortedDataInPlotFormat = function(data, key, x, y, parseX, parseY){
			var identity = function(value){return value};
			var parseX = (typeof parseX == "undefined" || parseX == "")? identity:parseX;
			var parseY = (typeof parseY == "undefined" || parseY == "")? identity:parseY;

			var formatedData = [];
			var i = -1;
			angular.forEach(data, function(element){
				if(typeof formatedData[i] == "undefined" || formatedData[i].key != element[key]){
					i = formatedData.map(function(e) {return e.key;}).indexOf(element[key]);
					if(i==-1){
						formatedData.push({"key": element[key], "values": []});
						i= formatedData.length-1;
					};
				};
				var yValue = (typeof y == "undefined" || y == "")? i+1 : element[y];
				//remove this when query doesnt give nullvalues anymore
				if(element[x] == null) {

				} else {  
					formatedData[i].values.push({"x": parseX(element[x]), "y": parseY(yValue)  });
				}
			});
			return formatedData;
		};


		var getGlobalMinMax = function (formatedData, attribute) {
			var min, max;
			var values = formatedData[0].values.map(function(d) {return d[attribute]; });
			min = d3.min(values);
			max = d3.max(values);

			for (var i = 1; i < formatedData.length; i++){
				if(formatedData[i].values.length > 0) {
					values = formatedData[i].values.map(function(d) {return d[attribute]; });
					min = Math.min(min, d3.min(values));
					max = Math.max(max, d3.max(values));
				}
			};
			return { min: min, max: max};
		};


		/**
		 * @formatedData {Array} data from database that has been formated
		 * @x {String} the property of the data we are interested in
		 * @numberOfBins {Number}
		 * @return {object} An object with "data" property containing for each key data d = { x: numberOfCurrentBin, y: observations in the bin}
		 * and the "thresholds" property  containing the thresholds of the bins in the unit of the data.
		 */
		Format.bringDataIntoBarPlotFormat = function(formatedData, x ,numberOfBins){
			//get global min and max to calculate range and bins
			var minMax = getGlobalMinMax(formatedData, x);
			var range = minMax["max"] - minMax["min"];
			var binSize = range/numberOfBins;

			//calculate thresholds
			var thresholds = [];
			for(var i = 0;i<=numberOfBins;i++){
				thresholds[i]= i*binSize + minMax["min"];
			};

			var dataInBins = [];
			var outputData = [];
			for( var i = 0; i < formatedData.length; i++){
				outputData.push({"key": formatedData[i].key , "values": []});
				//for each key use d3 to bin the data
				dataInBins = d3.layout.histogram()
				.bins(thresholds)
				(formatedData[i].values.map(function(d) {if(d[x]!==null) return d[x]; }));	//neglect null values!

				for(var j = 0; j< numberOfBins; j++){
					outputData[i].values.push({"x": j, "y": dataInBins[j].length});
				};
			};
			return {"data":outputData, "thresholds": thresholds};

		};


		/**
		 * takes formated data as input and return a cluster
		 */
		Format.getClusterFromFormatedData = function(formatedData, threshold){
			var metric = function(x1,x2){
				return (x1.getTime() - x2.getTime())/100;
			};
			var clusterArray = [];
			//later the user can say what threshold will be used
			//for each key do:
			for(var i=0; i<formatedData.length; i++){
				clusterArray.push({"key":formatedData[i].key, "values":[]});
				var dataArray =[];
				//bring x values in the format used by cluster algo
				for(var j=0; j<formatedData[i].values.length; j++){
					dataArray[j] = formatedData[i].values[j].x;
				};
				var cluster = clusterfck.hcluster(dataArray,metric,clusterfck.AVERAGE_LINKAGE,threshold);
				//canonical vlaues as new values, old y
				for(var k=0; k<cluster.length; k++){
					var size = (cluster[k].size > 1? 10 : 1);
					clusterArray[i].values.push({"x": cluster[k].canonical , "y" : formatedData[i].values[0].y, "size": size});
				};
			};
			return clusterArray;
		}

		Format.getKMeansClusterFromFormatedData = function(formatedData, formatAndParser, x, numberOfInstancesMap){
			var clusterArray = new Array(formatedData.length);
			for(var i=0; i<formatedData.length; i++){
				if(formatedData[i].values.length == 0) continue;
				clusterArray[i] = {"key":formatedData[i].key, "values":[]};
				var dataArray =[];
				//bring x values in the format used by cluster algo
				console.log(formatedData);
				for(var j=0; j<formatedData[i].values.length; j++){
					console.log(formatedData[i].values[j]);
					dataArray[j] =[formatAndParser.parser(formatedData[i].values[j][x]).getTime()];
				};
				console.log( numberOfInstancesMap[formatedData[i].key].numberOfClusters);
				var cluster = clusterfck.kmeans(dataArray, numberOfInstancesMap[formatedData[i].key].numberOfClusters);
				console.log(cluster);

				//canonical vlaues as new values, old y
				for(var k=0; k<cluster.length; k++){
					if(cluster[k].cluster) {
						var clusterSize = cluster[k].cluster.length;
						var size = clusterSize/ numberOfInstancesMap[formatedData[i].key].startedInst;
						var value = {"size": size, "clusterSize": clusterSize};
						value[x] = cluster[k].centroid[0];
						clusterArray[i].values.push(value);
					}
				}; 
			};
			var output =0;
			for ( var i = 0; i < clusterArray[0].values.length; i++) {
				output = output + clusterArray[0].values[i].clusterSize;
			}
			console.log("output");
			console.log(output);
			var indicesToRemove = [];

			for(i in clusterArray) {
				if(!clusterArray[i].values) {
					indicesToRemove.push(i);
				}
			}

			for(i in indicesToRemove) {
				clusterArray.splice(indicesToRemove[i], 1);
			}

			var output2 =0;
			for ( var i = 0; i < clusterArray[0].values.length; i++) {
				output2 = output2 + clusterArray[0].values[i].clusterSize;
			}
			console.log("output2");
			console.log(output2);
			console.debug("returning cluster array...");
			console.log(clusterArray);
			return clusterArray;
		}

		/**
		 * var parseTime = d3.time.format("%yy%jd%Hh%Mm%Ss").parse;
		 * this is the output format: %yy%jd%Hh%Mm%Ss
		 */
		Format.milliSecondsToString = function(milliSeconds){
			var numyears = Math.floor(milliSeconds / 31536000000);
			var numdays = Math.floor((milliSeconds % 31536000000) / 86400000); 
			var numhours = Math.floor(((milliSeconds % 31536000000) % 86400000) / 3600000);
			var numminutes = Math.floor((((milliSeconds % 31536000000) % 86400000) % 3600000) / 60000);
			var numseconds = Math.floor(((((milliSeconds % 31536000000) % 86400000) % 3600000) % 60000)/1000);

			return numyears + "y" +  numdays + "d" + numhours + "h" + numminutes + "m" + numseconds + "s";
		};

		return Format;
	});
});

