ngDefine('cockpit.plugin.statistics-plugin.duration', function(module) {

	module.factory("ElementStateService", function() {

		var menuState = false;
		var selectedElement = Array();
		var disabledElements = true;

		var classRed2White = "selectedKpiElementRed2White";
		var classWhite2Red = "selectedKpiElementWhite2Red";

		var checkboxModel = {				 
				exclusive_start : false,
				exclusive_end : false
		};

		return {
			getDisabledElements: function() {
				return disabledElements;
			},
			setDisabledElements: function(value) {

				disabledElements = value;
			},
			getMenuState: function () {
				return menuState;
			},
			setMenuState: function(value) {
				menuState = value;
			},
			getSelectedElement: function () {
				return selectedElement;
			},
			changeGradient: function(element) {

				if(checkboxModel.exclusive_start == true) {

					angular.element('#' + selectedElement[0].id).removeClass(classWhite2Red);
					angular.element('#' + element[0].id).addClass(classRed2White);
				} 

				else if(checkboxModel.exclusive_start == false) {

					angular.element('#' + selectedElement[0].id).removeClass(classRed2White);
					angular.element('#' + element[0].id).addClass(classWhite2Red);
				}


				if(checkboxModel.exclusive_end == true) {

					if(element[1] != null) {
						angular.element('#' + selectedElement[1].id).removeClass(classRed2White);
						angular.element('#' + element[1].id).addClass(classWhite2Red);
					}
				} 

				else if(checkboxModel.exclusive_end == false) {

					if(element[1] != null) {
						angular.element('#' + selectedElement[1].id).removeClass(classWhite2Red);
						angular.element('#' + element[1].id).addClass(classRed2White);
					}
				}
			},
			getCheckboxModel: function() {

				return checkboxModel;
			},
			setCheckboxModel: function(checkboxmdl) {

				checkboxModel = checkboxmdl;
			},
			setSelectedElement: function(value) {

				if(selectedElement.length < 2) {

					angular.element('[data-element-id="' + value.id + '"] > .djs-visual rect').attr('id', 'bad');	
					angular.element('[data-element-id="' + value.id + '"] > .djs-visual circle').attr('id', 'bad');	
					angular.element('[data-element-id="' + value.id + '"] > .djs-visual polygon').attr('id', 'bad');	

					selectedElement.push(value);
				}
			},

			resetSelectedElement: function() {

				for(i = 0; i < selectedElement.length; i++) {

					angular.element('#' + selectedElement[i].id).removeClass(classRed2White);
					angular.element('#' + selectedElement[i].id).removeClass(classWhite2Red);

					angular.element('[data-element-id="' + selectedElement[i].id + '"] > .djs-visual rect').attr('id', 'white');	
					angular.element('[data-element-id="' + selectedElement[i].id + '"] > .djs-visual circle').attr('id', 'white');	
					angular.element('[data-element-id="' + selectedElement[i].id + '"] > .djs-visual polygon').attr('id', 'white');	
				}


				selectedElement = [];
			}
		};
	});
});