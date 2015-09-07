ngDefine('cockpit.plugin.statistics-plugin.directives', function(module) {
	
	var controller = function ($scope) {
		$scope.openDropdown = function () {
			$scope.open = !$scope.open;
		};

		$scope.selectAll = function (e) {
			//if this is not done the accordion will open when the dropdown is clicked
			e.stopPropagation();
			e.preventDefault();
			$scope.model = [];
			angular.forEach($scope.options, function (item, index) {
				$scope.model.push(item.id);
			});
		};

		$scope.deselectAll = function (e) {
			e.stopPropagation();
			e.preventDefault();
			$scope.model = [];
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
			},
			templateUrl: require.toUrl(Uri.appUri('plugin://statistics-plugin/static/app/partials/sp-drop-down-multi-select.html')),
			controller: controller
		};		
	});

});
