ngDefine('cockpit.plugin.statistics-plugin.directives', function(module) {
	module.directive('menu', function(Uri){
		 return {
		      restrict: 'E',
		      templateUrl: require.toUrl(Uri.appUri('plugin://statistics-plugin/static/app/partials/menu.html'))
		    };		
	});
});
