ngDefine('cockpit.plugin.statistics-plugin.directives', function(module) {
	module.directive('startEndControlElement', function(Uri){
		 return {
		      restrict: 'E',
		      templateUrl: require.toUrl(Uri.appUri('plugin://statistics-plugin/static/app/partials/startEndControl.html'))
		    };		
	});
});
