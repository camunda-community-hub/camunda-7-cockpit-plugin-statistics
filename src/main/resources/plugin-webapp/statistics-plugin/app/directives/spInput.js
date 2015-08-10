ngDefine('cockpit.plugin.statistics-plugin.directives', function(module) {
	module.directive('spInput', function(Uri){
		 return {
		      restrict: 'E',
		      transclude: true,
		      scope: {
		    	  type: '@',
		    	  value:'@',
		    	  spModel: '=',
		    	  spChange: '&'
		      },
		      templateUrl: require.toUrl(Uri.appUri('plugin://statistics-plugin/static/app/partials/sp-input.html'))
		    };		
	});
});
