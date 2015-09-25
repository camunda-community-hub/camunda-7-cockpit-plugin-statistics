ngDefine('cockpit.plugin.statistics-plugin.directives', function(module) {
	module.directive('spInput', function(Uri){
		 return {
		      restrict: 'E',
		      transclude: true,
		      scope: {
		    	  type: '@',		//the difference between the @ and the = notation is in the binding behaviour
		    	  value:'@',
		    	  spModel: '=',
		    	  spChange: '&'		//functions have to be assigned with the & operator
		      },
		      templateUrl: require.toUrl(Uri.appUri('plugin://statistics-plugin/static/app/partials/sp-input.html'))
		    };		
	});
});
