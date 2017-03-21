/**
 * formats the description for the plots in the menu.
 * It has multiple access pointsfor each description point. If a new plot + description is added to the menu
 * this directive should be used to garantie the same formatting for all descriptions.
 * The MultiTranscludeFactory matches the acces points and its identifiers.
 */
ngDefine('cockpit.plugin.statistics-plugin.shared-directives', function(module) {
	module.directive("spPlotInfo", function(MultiTranscludeFactory,Uri) {
		return {
			restrict: 'E',
			scope: {
				spShow: '='
			},
			transclude: true,
			templateUrl: Uri.appUri('plugin://statistics-plugin/static/app/shared/directives/views/sp-plot-info.html'),
			link: function(scope, elem, attr, ctrl, transcludeFn) {
				MultiTranscludeFactory.transclude(elem, transcludeFn);
			}
		};
	});
});