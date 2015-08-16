ngDefine('cockpit.plugin.statistics-plugin.services', function(module) {
	module.factory('kMeansFactory', function() {
		var kMeansFactory = [];
		
		kMeansFactory.ruleOfThumb = function(numberOfInstancesMap, time) {
			var instances;
			if(time == "startTime")
				instances = "startedInst";
			else if (time == "endTime")
				instances = "endedInst";
			else
				console.error("error in cluster");
			
			angular.forEach(numberOfInstancesMap, function(instanceObject) {
				instanceObject.numberOfClusters = Math.floor( Math.sqrt(instanceObject[instances]));
			});
			
			return numberOfInstancesMap;
		}
		
		return kMeansFactory;
	});
});