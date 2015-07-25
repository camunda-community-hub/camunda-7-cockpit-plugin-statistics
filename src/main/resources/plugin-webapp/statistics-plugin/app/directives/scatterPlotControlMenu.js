ngDefine('cockpit.plugin.statistics-plugin.directives', function(module) {
	module.directive('scatterPlotControlMenu', function(Uri){
		 return {
		      restrict: 'E',
		      templateUrl: require.toUrl(Uri.appUri('plugin://statistics-plugin/static/app/partials/scatterPlotControlMenu.html'))
		    };		
	});
});
