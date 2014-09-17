ngDefine('cockpit.plugin.statistics-plugin.services', function(module) {
	module.factory('Format', function() {
		var Format = {};

		/**method that either sets the year, month and day of a data to a hardcoded date
		 * or sets the year and month to a harcoded day
		 * 
		 * this is needed when only the time of dates is important, so that the plot ingnores
		 * the rest of the timestamp, because its the same for each date
		 * 
		 * if year and month but day and time are important use the second option
		 * 
		 * @param date is a String in the Camunda database timestamp format: %Y-%m-%dT%H:%M:%S
		 * @param beakDownFormat
		 */
		Format.breakDateDown = function(date,breakDownFormat){
			var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S").parse;
			var changedDate = date.substr(10);
			if(breakDownFormat == "24h" || breakDownFormat == "dayly")
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
		 * @param key 
		 * @param x the property of data that will be plotted on the x axis
		 * @param y the property of data that will be plotted on the y axis, if no y value is specified each key will get 
		 * a dummy y property, so all points belonging to one key will have the same y value
		 * @param parseX the name of a function, before the x property is pushed in the new data structure
		 * it will be parsed by parseX
		 * @param parsey the name of a function, before the y property is pushed in the new data structure
		 * it will be parsed by parseY
		 */
		Format.bringSortedDataInPlotFormat = function(data, key, x, y, parseX, parseY){

			var identity = function(value){return value};
			var parseX = (typeof parseX == "undefined" || parseX == "")? identity:parseX;
			var parseY = (typeof parseY == "undefined" || parseY == "")? identity:parseY;

			var formatedData = [];
			var i = -1;
			angular.forEach(data ,function(element){
				if(typeof formatedData[i] == "undefined" || formatedData[i].key!=eval("element." +key)){
					formatedData.push({"key": eval("element." +key), "values": []});
					i++;
				};
				var yValue = (typeof y == "undefined" || y == "")? i+1:eval("element."+y);
				//remove this when query doesnt give nullvalues anymore
				if(eval("element."+x) == null);
				else  
					formatedData[i].values.push({"x": parseX(eval("element."+x)), "y": parseY(yValue)  });
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
				if(typeof formatedData[i] == "undefined" || formatedData[i].key!=eval("element." +key)){
					i=-1;
					for(var j =0; j<formatedData.length; j++){
						if(formatedData[j].key==eval("element." +key)){
							i = j;
							return;
						}
					};
					if(i==-1){
						formatedData.push({"key": eval("element." +key), "values": []});
						i= formatedData.length-1;
					};
				};
				var yValue = (typeof y == "undefined" || y == "")? i+1:eval("element."+y);
				//remove this when query doesnt give nullvalues anymore
				if(eval("element."+x) == null);
				else  
					formatedData[i].values.push({"x": parseX(eval("element."+x)), "y": parseY(yValue)  });
			});
			return formatedData;
		};
		
		
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

