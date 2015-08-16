/**
 * 
 */
ngDefine('cockpit.plugin.statistics-plugin.directives', function(module) {
	module.directive('spShowSelectedData', function(Uri, kMeansFactory){

		var controller = function ($scope) {
			//initializes the number of clusters for all chosen processes / activities
			//with a rule of thumb
			$scope.init = function(numberOfInstancesMap, time) {
				$scope.numberOfInstancesMap = kMeansFactory.ruleOfThumb(numberOfInstancesMap, time);
			}
		};
		
		var link = function(scope, element, attr, ctrl) {
			
			//there is a different number of started and ended instances
			//(not every started instance is also finished yet)
			//therefore we watch if the user wants to see started or ended instances
			//and recalculate the number of clusters
			scope.$watch('time', function() {
				scope.init(scope.numberOfInstancesMap, scope.time);
			});
		};

		return {
			restrict: 'E',
			scope: {
				selectedData: '=',					//the data that the user selected from the menu
				showLegend: '=',					//if true shows circles with the plot color next to the names
				showSlider: '=',					//if true shows slider where the number of clusters can be adjusted
				numberOfInstancesMap: '=',			//only needed if @showSlider is true. Contains the number of instances for the selected data
				time: '=',							//only needed if @showSlider is true. startTime or endTime --> focus on started or ended instances for the clustering
				removeFct: '&'						//only needed if @showLegend is true. This function gets excecuted when the remove icon is pressed
			},
			controller: controller,
			link: link,
			templateUrl: require.toUrl(Uri.appUri('plugin://statistics-plugin/static/app/partials/sp-show-selected-data.html'))
		};		
	});
});
