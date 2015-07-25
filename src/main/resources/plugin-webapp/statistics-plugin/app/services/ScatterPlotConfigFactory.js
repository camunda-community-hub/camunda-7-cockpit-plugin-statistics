ngDefine('cockpit.plugin.statistics-plugin.services', function(module) {
	module.factory('ScatterPlotConfigFactory',['DataFactory','Format', function(DataFactory,Format) {
		var ScatterPlotConfigFactory = {};
		
		ScatterPlotConfigFactory.menuData = [];
		ScatterPlotConfigFactory.getMenuData = function(){
			return DataFactory.getActivityNamesTypesProcDefinition()
			.then(function () {
				var menuData = Format.bringSortedDataInPlotFormat
					(DataFactory.activityNamesTypesProcDefinition,"procDefKey","type","activityName",undefined,undefined);
				for(var i = 0; i< menuData.length;i++){
					console.debug(menuData[i].values);
					menuData[i].values = Format.bringNotSortedDataInPlotFormat(menuData[i].values,"x","y",undefined,undefined,undefined);
				}
				ScatterPlotConfigFactory.menuData = menuData;
			});
		};
		
		
		
		return ScatterPlotConfigFactory;
		
		
	}]);
});