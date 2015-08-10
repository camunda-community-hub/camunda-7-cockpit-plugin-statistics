/**
 * 
 */
ngDefine('cockpit.plugin.statistics-plugin.directives', function(module) {
	module.directive("spPlotInfo", function(MultiTranscludeFactory,Uri) {
		return {
			restrict: 'E',
			scope: {
				spShow: '='
			},
			transclude: true,
			templateUrl: require.toUrl(Uri.appUri('plugin://statistics-plugin/static/app/partials/sp-plot-info.html')),
			link: function(scope, elem, attr, ctrl, transcludeFn) {
				MultiTranscludeFactory.transclude(elem, transcludeFn);
			}
		};
	});
});