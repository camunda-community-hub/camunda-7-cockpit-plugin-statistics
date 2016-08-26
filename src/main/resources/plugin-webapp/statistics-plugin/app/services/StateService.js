ngDefine('cockpit.plugin.statistics-plugin.services', function(module) {
	
	module.factory("StateService", function() {
		
		   var menuState = false;
		   var selectedElement = Array();
		   
	        return {
	            getMenuState: function () {
	                return menuState;
	            },
	            setMenuState: function(value) {
	            	menuState = value;
	            },
	            getSelectedElement: function () {
	                return selectedElement;
	            },
	            setSelectedElement: function(value) {

	            	if(selectedElement.length < 2) {
	            		
						angular.element('#' + value.id).addClass('selectedKpiElementBlack2White');
						
						angular.element('[data-element-id="' + value.id + '"] > .djs-visual rect').attr('id', 'bad');	
						angular.element('[data-element-id="' + value.id + '"] > .djs-visual circle').attr('id', 'bad');	
						angular.element('[data-element-id="' + value.id + '"] > .djs-visual polygon').attr('id', 'bad');	
						
	            		selectedElement.push(value);
	            	}
	            },
	       
	            resetSelectedElement: function() {
	            	
	            	for(i = 0; i < selectedElement.length; i++) {
	            	
	            		angular.element('#' + selectedElement[i].id).removeClass('selectedKpiElementBlack2White');
	            		
	            		angular.element('[data-element-id="' + selectedElement[i].id + '"] > .djs-visual rect').attr('id', 'white');	
	            		angular.element('[data-element-id="' + selectedElement[i].id + '"] > .djs-visual circle').attr('id', 'white');	
	            		angular.element('[data-element-id="' + selectedElement[i].id + '"] > .djs-visual polygon').attr('id', 'white');	

	            	}
	            	
	            	
	            	selectedElement = [];
	            }
	        };
	});
});