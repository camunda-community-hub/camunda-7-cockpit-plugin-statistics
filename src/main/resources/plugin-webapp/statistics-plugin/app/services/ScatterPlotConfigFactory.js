ngDefine('cockpit.plugin.statistics-plugin.services', function(module) {
	module.factory('ScatterPlotConfigFactory',['DataFactory','Format', function(DataFactory,Format) {
		var ScatterPlotConfigFactory = {};
		
		ScatterPlotConfigFactory.menuData = [];
		ScatterPlotConfigFactory.getMenuData = function(){
			return DataFactory.getActivityNamesTypesProcDefinition()
			.then(function () {
				console.log(DataFactory.activityNamesTypesProcDefinition);
				var menuData = Format.bringSortedDataInPlotFormat
					(DataFactory.activityNamesTypesProcDefinition,"procDefKey","type","activityName",undefined,undefined);
				console.log(menuData);
				for(var i = 0; i< menuData.length;i++){
					console.log(menuData.length);
					menuData[i].values = Format.bringNotSortedDataInPlotFormat(menuData[i].values,"x","y",undefined,undefined,undefined);
					var j = DataFactory.activityNamesTypesProcDefinition.map(function(e) { return e.procDefKey; }).indexOf(menuData[i].key);
					//add procDefId (we need that later to get the results from database using Rest API)
					menuData[i].Id = DataFactory.activityNamesTypesProcDefinition[j].procDefId;
				}
				ScatterPlotConfigFactory.menuData = menuData;
				console.log(menuData);
			});
		};
		return ScatterPlotConfigFactory;
	}]);
});