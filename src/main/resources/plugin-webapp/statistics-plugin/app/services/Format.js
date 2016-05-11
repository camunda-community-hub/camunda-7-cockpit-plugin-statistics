ngDefine('cockpit.plugin.statistics-plugin.services', ['../lib/d3'], function(module) {
	module.factory('Format', function(kMeansFactory) {
		var Format = {};

		/**
		 * helper function for 'Format.formatMenuData'
		 */
		var addNewProcess = function(formatedData, act) {
			formatedData.push({"key": act.procDefKey, "name": act.procName, "vIds": [{"id": 1, "value": act.procVersion, "procDefId": act.procDefId}], "actTypes": []});
			return formatedData;
		}
		
		/**
		 * helper function for 'Format.formatMenuData'
		 * checks weather the process already holds the information for this version and if not stores a new 'id' (Integer)
		 * for the directive it is used in, 'value': the version, 'procDefId': the process definition id coming with this version
		 */
		var addNewVersion = function(processObject, act) {
			var vIndex = processObject.vIds.map(function(e) { return e.procDefId }).indexOf(act.procDefId);
			if(vIndex == -1) {
				var newId = processObject.vIds.length + 1;
				processObject.vIds.push({"id": newId, "value": act.procVersion, "procDefId": act.procDefId})
			}
		}
		
		/**
		 * formats the data for the accordion menu, each process holds the information what versions are available
		 * and each activity knows in which versions it is used
		 * @menuData{Array} the data from database, coming back from the "selectActivityNamesTypesProcessDefinition" query
		 * @return formated data
		 */
		Format.formatMenuData = function(menuData) {
			var formatedData = [];
			angular.forEach(menuData, function(activity) {
				//if process has not been added yet
				if(!formatedData.some(function(e) { return e.key == activity.procDefKey; })) formatedData = addNewProcess(formatedData, activity);
				//get index of process
				var procIndex = formatedData.map(function(e) { return e.key; }).indexOf(activity.procDefKey);
				addNewVersion(formatedData[procIndex], activity);
				//if activityType has not been added yet
				if(!formatedData[procIndex].actTypes.some(function(e) { return e.type == activity.type; }))
					formatedData[procIndex].actTypes.push({"type": activity.type, "acts": []});
				//get type index
				var typeIndex = formatedData[procIndex].actTypes.map(function(e) { return e.type; }).indexOf(activity.type);
				//check weather activity has been added before with different version
				if(!formatedData[procIndex].actTypes[typeIndex].acts.some(function(e) { return e.actName == activity.activityName; }))
					formatedData[procIndex].actTypes[typeIndex].acts.push({"actName": activity.activityName, "versions": [activity.procVersion]});
				else {
					//find Index
					var actIndex = formatedData[procIndex].actTypes[typeIndex].acts.map(function(e) { return e.actName; }).indexOf(activity.activityName);
					//add version to existing activity
					formatedData[procIndex].actTypes[typeIndex].acts[actIndex].versions.push(activity.procVersion);
				}
					

			})
			return formatedData;
		}
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
			angular.forEach(data, function(element){
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

			else if(breakDownFormat == "week" || breakDownFormat == "weekly"){
				var add = parseDate(date).getDay();
				if (add == 0) add = 7;
				changedDate = "2014-11-0" +(2+ add) + changedDate;
			}
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
			var add = parseDate(date).getDay();
			if (add == 0) add = 7;
			changedDate = "2014-11-0" +(2+add) + changedDate;

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
			//if the formatedData array is empty we return it, later the apply method in the controller 
			//will check if an empty data array was returned and will inform the user
			if(formatedData.length == 0 ) return {"data":formatedData, "thresholds": null};
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
				for(var j=0; j<formatedData[i].values.length; j++){
					dataArray[j] =[formatAndParser.parser(formatedData[i].values[j][x]).getTime()];
				};
				var cluster = clusterfck.kmeans(dataArray, numberOfInstancesMap[formatedData[i].key].numberOfClusters);

				for(var k=0; k<cluster.length; k++){
					//this filters the empty clusters that can be produced by k means
					if(cluster[k].cluster) {
						var clusterSize = cluster[k].cluster.length;
						var size = clusterSize/ numberOfInstancesMap[formatedData[i].key][kMeansFactory.getAccessor(x)];
						var value = {"size": size, "clusterSize": clusterSize};
						value[x] = cluster[k].centroid[0];
						clusterArray[i].values.push(value);
					}
				};
			};
			console.debug("returning cluster array...");
			console.debug(clusterArray);
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

			return numyears + "y " +  numdays + "d " + numhours + "h " + numminutes + "m " + numseconds + "s ";
		};

		return Format;
	});
});

