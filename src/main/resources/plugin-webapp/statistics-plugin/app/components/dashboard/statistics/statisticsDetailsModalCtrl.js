ngDefine('cockpit.plugin.statistics-plugin.dashboard', function(module) {
  module.controller('statisticsDetailsModalCtrl', ['$scope','$modalInstance', 'SettingsFactory','DataFactory','processDefinitionKey', 'data', 'versionsDetails', function($scope, $modalInstance, SettingsFactory, DataFactory, processDefinitionKey, data, versionsDetails) {
    
    $scope.pluginSettings = {};
    
    $scope.processDefinitionKey = processDefinitionKey;
    $scope.processDefinitionDetailsPlotData = data;
    
    $scope.showTooltipTiming = false;
    $scope.showTooltipOverview = false;
    $scope.versionsDetails = versionsDetails;
    

    $scope.processdefinitionDetailsChartOptions = {
    	  "chart": {
    	    "type": "sunburstChart",
    	    "height": 450,
    	    "duration": 250,
    	    "dispatch": {},
    	    "sunburst": {
    	      "mode": "count",
    	      "id": 3823,
    	      "duration": 500
    	    },
    	    "tooltip": {
    	      "duration": 0,
    	      "gravity": "w",
    	      "distance": 25,
    	      "snapDistance": 0,
    	      "classes": null,
    	      "chartContainer": null,
    	      "enabled": true,
    	      "hideDelay": 200,
    	      "headerEnabled": false,
    	      "fixedTop": null,
    	      "offset": {
    	        "left": 0,
    	        "top": 0
    	      },
    	      "valueFormatter":function(d) {
    	      	return d;
    	      },
    	      "hidden": true,
    	      "data": null,
    	      "id": "nvtooltip-3169"
    	    },
    	    "mode": "count",
    	    "groupColorByParent": true,
    	    "showLabels": true,
  	      "labelFormat":function (d){
  	      	"use strict";
  	      	console.debug(d);
  	      	if(mode === 'count'){
  	      		return d.name + ' #' + d.value
  	      	} else {
  	      		return d.name + ' ' + (d.value || d.size)
  	      	}
  	      },
    	    "labelThreshold": 0.02,
    	    "margin": {
    	      "top": 30,
    	      "right": 20,
    	      "bottom": 20,
    	      "left": 20
    	    },
    	    "defaultState": null
    	  },
    	  "styles": {
    	    "classes": {
    	      "with-3d-shadow": true,
    	      "with-transitions": true,
    	      "gallery": false
    	    },
    	    "css": {}
    	  }
    	}
  
    
    $scope.applySettings = function() {
      $modalInstance.close();
    }
    
    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    }
    
    
  }])
});