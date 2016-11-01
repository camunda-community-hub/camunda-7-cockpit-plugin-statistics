ngDefine('cockpit.plugin.statistics-plugin.shared-directives', function(module) {
	module.directive('spMenu', function(Uri){
		 return {
		      restrict: 'E',
		      templateUrl: require.toUrl(Uri.appUri('plugin://statistics-plugin/static/app/shared/directives/views/sp-menu.html'))
		    };		
	});
});
