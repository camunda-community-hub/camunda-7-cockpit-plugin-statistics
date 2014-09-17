// not ready yet and since now we r gonna use nvd3 directives we prob wont need this directive

ngDefine('cockpit.plugin.statistics-plugin.directives',  function(module) {

	module.directive('donut', function(){
		function link(scope, el){
			var data = scope.data;
			var color = d3.scale.category10();
			var el = el[0];
//			var width = el.clientWidth;
			var width = 50;
//			var height = el.clientHeight; 
			var height = 50;
			var min = Math.min(width, height);
			var pie = d3.layout.pie().sort(null);
			var arc = d3.svg.arc()
			.outerRadius(min / 2 * 0.9)
			.innerRadius(min / 2 * 0.5);
			var svg = d3.select(el).append('svg');
			var g = svg.append('g');
			// add the <path>s for each arc slice
			var arcs = g.selectAll('path');
			scope.$watch(function(){
				return el.clientWidth * el.clientHeight
			}, function(){
				width = el.clientWidth;
				height = el.clientHeight;
				min = Math.min(width, height);
				arc.outerRadius(min / 2 * 0.9).innerRadius(min / 2 * 0.5);
				svg.attr({width: width, height: height});
				g.attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
				arcs.attr('d', arc);
			})
			function arcTween(a) {
				// see: http://bl.ocks.org/mbostock/1346410
				var i = d3.interpolate(this._current, a);
				this._current = i(0);
				return function(t) {
					return arc(i(t));
				};
			}
			scope.$watch('data', function(data){
				var duration = 1000
				arcs = arcs.data(pie(data))
				arcs.transition()
				.duration(duration)
				.attrTween('d', arcTween)
				arcs.enter()
				.append('path')
				.style('stroke', 'white')
				.attr('fill', function(d, i){ return color(i) })
				.each(function(d) {
					this._current = { startAngle: 2 * Math.PI - 0.001, endAngle: 2 * Math.PI }
				})
				.transition()
				.duration(duration)
				.attrTween('d', arcTween)
				arcs.exit()
				.transition()
				.duration(duration)
				.each(function(d){
					d.startAngle = 2 * Math.PI - 0.001; d.endAngle = 2 * Math.PI;
				})
				.attrTween('d', arcTween).remove();
			})
			svg.on('mousedown', function(){
				scope.$apply(function(){
					var num = Math.round(Math.random()* 10) + 1
					scope.data = d3.range(num).map(Math.random)
				})
			})
		}
		return {
			link: link,
			restrict: 'E',
			scope: { data: '=' }
		}
	}); //added semicolon

	module.controller('DonutChartController', function($scope, $window){
		$scope.charts = d3.range(5).map(function(){
			return d3.range(10).map(Math.random);
		});
		$scope.shared = {
				ourData: d3.range(3).map(Math.random)
		};
		angular.element($window).on('resize', function(){
			$scope.$apply();
		});
	});

});

