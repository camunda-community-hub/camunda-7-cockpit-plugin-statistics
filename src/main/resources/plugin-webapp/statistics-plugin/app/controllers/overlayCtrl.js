ngDefine('cockpit.plugin.statistics-plugin.controllers', function(module) {

	module.directive('onFinishRender', function ($timeout) {
		return {
		    restrict: 'A',
		        link: function (scope, element, attr) {
		            if (scope.$last === true) {
		                $timeout(function () {
		                    scope.$emit(attr.onFinishRender);
		                });
		            }
		        }
		    }
		});
	
	module.controller('overlayCtrl', ['$scope','DataFactory','$position', function($scope, DataFactory, $position){
		'use strict';

		var elements = $scope.$parent.$parent.processDiagram.bpmnElements;
		var heatmap = [];
		var bpmnElements = [];
		var userTasks = [];
		var types = [];
		var min = 0;
		var max = 0;
		var avg = 0;
		var threshold = 0;
		$scope.Math = window.Math;
		
		$scope.toggleMenu = function(){
			$scope.menuVisible = !$scope.menuVisible;
		}
		
		$scope.toggleColors = function(){
			if($scope.toggleC){
				drawColors();
			}else{
				deleteColors();
			}
		}
		
		$scope.toggleHeatmap = function(){
			if($scope.toggleH){
				drawHeatmap();
			}else{
				deleteHeatmap();
			}
		}
		
		$scope.toggleTooltips = function(){
			if($scope.toggleT){
				$.each(heatmap, function(){
					if(!isNaN(this.min) && !isNaN(this.max) && !isNaN(this.avg)){
					    $("[data-activity-id='" + this.id + "']").attr({ 
							"popover-title": this.name, 
							"popover": 'Minimal Duration: ' + (this.min / 1000 / 60).toFixed(2)
								+ ' min,Maximal Duration: ' + (this.max / 1000 / 60).toFixed(2)
								+ ' min,Average Duration: ' + (this.avg / 1000 / 60).toFixed(2)
								+' min',
//							"popover-html":true, 
							"popover-trigger":"mouseenter"
						});
					}
				});
			}else{
				$.each(heatmap, function(){
					$("[data-activity-id='" + this.id + "']").removeAttr('popover-title popover popover-html popover-trigger');
				});
			}
		}
		
		$scope.$on('renderingDone', function(ngRepeatFinishedEvent) {
				$.each($('.typeCheckbox > *'), function() {
					this.addEventListener("change",checkboxListener);
				});
	    });
		
		function checkboxListener(){
			var type = this.name;
			var draw = this.checked;
			$.each(bpmnElements, function() {
				if(this.type == type) this.draw = draw;
			});
		}

		function drawColors() {
			var colors = d3.scale.category20();
			var svgContainer = d3.select("svg");
			for(var i=0;i<bpmnElements.length;i++){
				if(bpmnElements[i].draw == true){
					if(bpmnElements[i].type.indexOf("Gateway") != -1){
						var x = svgContainer.append("rect")
						.attr("x", bpmnElements[i].bounds.x)
						.attr("y", bpmnElements[i].bounds.y)
						.attr("width", bpmnElements[i].bounds.width*.75)
						.attr("height", bpmnElements[i].bounds.height*.75)
						.attr("class","colorElement")
						.style("fill",colors(bpmnElements[i].color))
						.style("z-index","auto")
						.style("opacity","0.3")
						.attr("transform", "rotate(45," + (parseInt(bpmnElements[i].bounds.x) + parseInt(bpmnElements[i].bounds.width/2)) +","+ (parseInt(bpmnElements[i].bounds.y) + parseInt(bpmnElements[i].bounds.height/2)) + "), translate(5,5)")
				    }else if(bpmnElements[i].type.indexOf("Event") != -1 && bpmnElements[i].type != "endEvent"){
						var x = svgContainer.append("circle")
						.attr("cx", (parseInt(bpmnElements[i].bounds.x) + parseInt(bpmnElements[i].bounds.width/2)))
						.attr("cy", (parseInt(bpmnElements[i].bounds.y) + parseInt(bpmnElements[i].bounds.width/2)))
						.attr("r", bpmnElements[i].bounds.width*.45)
						.style("fill", colors(bpmnElements[i].color))
						.attr("class","colorElement")
						.style("opacity","0.3")
					}else if(bpmnElements[i].type == "endEvent"){
						var x = svgContainer.append("circle")
						.attr("cx", (parseInt(bpmnElements[i].bounds.x) + parseInt(bpmnElements[i].bounds.width/2)))
						.attr("cy", (parseInt(bpmnElements[i].bounds.y) + parseInt(bpmnElements[i].bounds.width/2)))
						.attr("r", bpmnElements[i].bounds.width*0.395)
						.style("fill", colors(bpmnElements[i].color))
						.attr("class","colorElement")
						.style("opacity","0.3")
					}else{
						var x = svgContainer.append("rect")
						.attr("x", bpmnElements[i].bounds.x)
						.attr("y", bpmnElements[i].bounds.y)
						.attr("width", bpmnElements[i].bounds.width)
						.attr("height", bpmnElements[i].bounds.height)
						.attr("class","colorElement")
						.style("fill",colors(bpmnElements[i].color))
						.style("z-index","auto")
						.style("opacity","0.3")
						.attr("rx",3)
						.attr("ry",3);	
					}
				}
			}
		}
		
		function deleteColors(){
			d3.selectAll(".colorElement").remove();
		}
		
		$scope.redrawColors = function(){
			if($scope.toggleC){
				deleteColors();
				drawColors();
			}
		}
		
		function calcColorsByType(){
			var colors = [];
			var colorIndex = 1;
			for(var i=0; i<bpmnElements.length;i++){
				var contains = false;
				for(var c in colors){
					if (colors[c].type == bpmnElements[i].type){
						contains = true;
						bpmnElements[i].color = colors[c].color;
					}
				}
				if(!contains){
					bpmnElements[i].color = colorIndex;
					colors.push({type:bpmnElements[i].type,color:colorIndex});
					colorIndex++;
				}
			}
		}
	
		function drawHeatmap() {
			var svgContainer = d3.select("svg");
			for(var i=0;i<heatmap.length;i++){
				var x = svgContainer.append("rect")
						.attr("x", heatmap[i].bounds.x)
						.attr("y", heatmap[i].bounds.y)
						.attr("width", heatmap[i].bounds.width)
						.attr("height", heatmap[i].bounds.height)
						.attr("class","heatRect")
						.style("fill",eval(getHeatColorAsRbg(heatmap[i].avg)))
						.style("z-index","auto")
						.style("opacity","0.4")
						.attr("rx",3)
						.attr("ry",3);
		    
			}
		}
		
		
		function deleteHeatmap() {
			d3.selectAll(".heatRect").remove();
		}
				
		function redrawHeatmap(){
			if($scope.toggleH){
				deleteHeatmap();
		        drawHeatmap();
			}
		}
		
		$scope.changeThreshold = function(){
			$scope.threshold = $('#range').val();
			threshold = $('#range').val();
			$scope.percent = Math.round((($('#range').val() - min) / (max - min))*100);
			redrawHeatmap();
		}
		
		function MouseWheelHandler() {
			//TODO
			var newHeatmap = $scope.$parent.$parent.processDiagram.bpmnElements;
			console.log(newHeatmap);
			console.log(heatmap);
	    }
		
		$(document).ready(function() {
			
			$.each(elements, function() {
				if(this.type == 'userTask'){
					heatmap.push({name:this.name,bounds:this.bounds,id:this.id});
				}
				if(this.bounds != undefined && this.type != 'lane' && this.type != 'subProcess' && this.type != 'dataStoreReference' && this.type != ""){
					bpmnElements.push({name:this.name,bounds:this.bounds,type:this.type,draw:true})
					if(types.indexOf(this.type) < 0 ) types.push(this.type);
				}
				calcColorsByType();
				$scope.types = types;
			});
			
			DataFactory
			.getHistoricActivityCountsDurationByProcDefKey($scope.processDefinition.key)
			.then(function() {
				var activityCount = DataFactory.historicActivityCountsDurationByProcDefKey[$scope.processDefinition.key];
				for(var i in activityCount){
					if(activityCount[i].count) {
						for(var k in heatmap){
							if(heatmap[k].name == activityCount[i].activityName){
								heatmap[k].avg = activityCount[i].avgDuration;
								heatmap[k].min = activityCount[i].minDuration;
								heatmap[k].max = activityCount[i].maxDuration;
							}
						}
				 }
				}
			    calcMinMaxAvg();
			    $scope.threshold = avg;
			    $scope.min = min;
			    $scope.max = max;
			    $scope.percent = Math.round(((avg - min) / (max - min))*100);
			});
			
			$('.ctn-content-top > *')[0].addEventListener("wheel",MouseWheelHandler,false);
			
		});
		
		function calcMinMaxAvg() {
			var i=0;
			for(var i in heatmap){
				if(heatmap[i].min){
					if(min>heatmap[i].min)min = heatmap[i].min;
					if(max<heatmap[i].max)max = heatmap[i].max;
					avg = avg + heatmap[i].avg;
					i++;
				}	
			}
			avg = (avg / i);
			
			threshold = ((avg - min) / (max - min));
		}
		
		function getHeatColorAsRbg(val) {
			
		if(isNaN(val)) return( "d3.rgb(0,0,0)"); 
		val = ((val - min) / (max - min));	
			
		var red = 0;
		var blue = 0;
		var green = 0;
		if(val >= threshold)
		{
		    red = val * 255;
		    green = 255 - val * 255;
			blue = 0;
		}
		else
		{
			red = 255 - val * 255;
			green = val * 255;
			blue = 0;
		}
		return( "d3.rgb(" + red + "," + green + "," + blue + ")");
		}
		

	}]);
	
});