/**
 * 
 */
ngDefine('cockpit.plugin.statistics-plugin.directives', function(module) {
	module.directive('spShowSelectedData', function(Uri){
		 return {
		      restrict: 'E',
		      scope: {
		    	  selectedData: '=',
		    	  showLegend: '=',
		    	  showSlider: '=',
		    	  removeFct: '&'
		      },
		      templateUrl: require.toUrl(Uri.appUri('plugin://statistics-plugin/static/app/partials/sp-show-selected-data.html'))
		    };		
	});
});
