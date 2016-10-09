ngDefine('cockpit.plugin.statistics-plugin.duration', function(module) {

	module.factory("ElementStateService", function() {

		var menuState = false;
		var selectedElement = [];

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

//					angular.element('#' + value.id).addClass('selectedKpiElementBlack2White');

					angular.element('[data-element-id="' + value.id + '"] > .djs-visual rect').attr('class', 'selected');	
					angular.element('[data-element-id="' + value.id + '"] > .djs-visual circle').attr('class', 'selected');	
					angular.element('[data-element-id="' + value.id + '"] > .djs-visual polygon').attr('class', 'selected');
					
					selectedElement.push(value);
				}
			},

			resetSelectedElement: function() {

				for(i = 0; i < selectedElement.length; i++) {

//					angular.element('#' + selectedElement[i].id).removeClass('selectedKpiElementBlack2White');

					angular.element('[data-element-id="' + selectedElement[i].id + '"] > .djs-visual rect').attr('class', 'white');	
					angular.element('[data-element-id="' + selectedElement[i].id + '"] > .djs-visual circle').attr('class', 'white');	
					angular.element('[data-element-id="' + selectedElement[i].id + '"] > .djs-visual polygon').attr('class', 'white');	

				}

				selectedElement = [];
			}
		};
	});
});