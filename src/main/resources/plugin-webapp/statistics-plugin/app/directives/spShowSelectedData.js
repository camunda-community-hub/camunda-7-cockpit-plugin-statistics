/**
 * 
 */
ngDefine('cockpit.plugin.statistics-plugin.directives', function(module) {
	module.directive('spShowSelectedData', function(Uri){

		var controller = function ($scope) {
			$scope.init = function() {
				console.log($scope.numberOfInstancesMap);
				angular.forEach($scope.numberOfInstancesMap, function(instanceObject) {
					instanceObject.numberOfClusters = Math.floor( Math.sqrt(instanceObject.startedInst));
				});
			}
		};

		var link = function(scope, element, attr, ctrl) {
			scope.$watch('numberOfInstancesMap',function(){
				console.log("watch firired");
				scope.init();
			});
		};

		return {
			restrict: 'E',
			scope: {
				selectedData: '=',
				showLegend: '=',
				showSlider: '=',
				numberOfInstancesMap: '=',
				removeFct: '&'
			},
			controller: controller,
			link: link,
			templateUrl: require.toUrl(Uri.appUri('plugin://statistics-plugin/static/app/partials/sp-show-selected-data.html'))
		};		
	});
});
