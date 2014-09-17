ngDefine('cockpit.plugin.statistics-plugin.directives', function(module) {
	module.directive('startEndControlElement', function(){
		 return {
		      restrict: 'E',
		      template: 
		    	 '<form class="form-horizontal">'+
		    	 	'<h5>Show:<h5>'+
		    	 	'<h5>starting time or ending time</h5>'+
		    	 	'<div class="control-group">'+
		    	 		'<select ng-model="view" ng-options="view.parameter for view in views" ng-change="getDataAndDrawGraph()">'+
		    	 		'</select>'+
		    	 	'</div>'+
		    	 	'<h5>{{view.parameter}} on a weekly or dayly basis</h5>'+
		    	 	'<div class="control-group">'+
		    	 		'<select ng-model="time" ng-options="time.distribution for time in times" ng-change="getDataAndDrawGraph()">'+
		    	 		'</select>'+
		    	 	'</div>'+
		    	 	'<h5>of process instances or activities<h5>'+
		    	 	'<div class="control-group">'+
	    	 			'<select ng-model="choice" ng-options="element.choice for element in processOrUserTask" ng-change="getDataAndDrawGraph()">'+
	    	 			'</select>'+
	    	 		'</div>'+
	    	 		'<h5>of a specific process or all<h5>'+
	    	 		'<div class="control-group">'+
    	 				'<select ng-disabled="disabled" ng-model="processInstance" ng-options="processInstance.processDefKey for processInstance in processInstances" ng-change="getDataAndDrawGraph()">'+
    	 				'</select>'+
    	 			'</div>'+
		    	 	'<h5>adjust width<h5>'+
		    	 	'<input type="number" name="points" min="0" step="10" value="1000" ng-model = "width" ng-change="getDataAndDrawGraph()">'+
		    	 '</form>'
		    };		
	});
});
