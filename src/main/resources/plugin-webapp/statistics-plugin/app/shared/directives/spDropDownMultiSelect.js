/**
 * with special thanks to Dariush Tasdighi on whose code this directive is build.
 * published by Dariush Tasdighi under MIT license at 
 * http://www.codeproject.com/Tips/894838/Multi-Select-Drop-Down-List-with-Bootstrap-Angular
 */
ngDefine('cockpit.plugin.statistics-plugin.shared-directives', function(module) {
	
	var controller = function ($scope) {
		$scope.openDropdown = function (e) {
			e.stopPropagation();
			e.preventDefault();
			$scope.open = !$scope.open;
		};

		$scope.selectAll = function (e) {
			//if this is not done the accordion will open when the dropdown is clicked
			e.stopPropagation();
			e.preventDefault();
			//before we had 
//			$scope.model = []
			//but this changed the array and a watch outside the directive watching the model value didnt work anymore!
			$scope.model.length = 0;
			angular.forEach($scope.options, function (item, index) {
				$scope.model.push(item.id);
			});
		};

		$scope.deselectAll = function (e) {
			e.stopPropagation();
			e.preventDefault();
			$scope.model.length = 0;
		};

		$scope.toggleSelectItem = function (e, option) {
			e.stopPropagation();
			e.preventDefault();
			var intIndex = -1;
			angular.forEach($scope.model, function (item, index) {
				if (item == option.id) {
					intIndex = index;
				}
			});

			if (intIndex >= 0) {
				$scope.model.splice(intIndex, 1);
			}
			else {
				$scope.model.push(option.id);
			}
		};

		$scope.getClassName = function (option) {
			var varClassName = '';
			angular.forEach($scope.model, function (item, index) {
				if (item == option.id) {
					varClassName = 'glyphicon glyphicon-ok';
				}
			});
			return (varClassName);
		};
	}
	
	module.directive('spDropDownMultiSelect', function(Uri){
		return {
			restrict: 'E',
			scope: {
				model: '=',
				options: '=',
				title: '@'
			},
			templateUrl: Uri.appUri('plugin://statistics-plugin/static/app/shared/directives/views/sp-drop-down-multi-select.html'),
			controller: controller
		};		
	});

});
