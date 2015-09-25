/**
 * This factory matches the acces points for html with its identifiers.
 * in html the element must have the "transclude-to" attribute and in the directive there must be 
 * in acces point with the transclude-id.
 */
ngDefine('cockpit.plugin.statistics-plugin.services', function(module) {
	module.factory("MultiTranscludeFactory", function() {
		return {
			transclude: function(elem, transcludeFn) {
				transcludeFn(function(clone) {
					angular.forEach(clone, function(cloneEl) {
						// node type 3 is "text" node
						if (cloneEl.nodeType === 3)  {
							return;
						}
						// get target name from clone
						var destinationId = cloneEl.attributes["transclude-to"].value;
						//find target
						var destination = elem.find('[transclude-id="'+ destinationId +'"]');
						 // append target if found
						if (destination.length) {
							destination.append(cloneEl);
						} else {
							// if target isn't found (missing/invalid transclude), clean up and throw error
							cloneEl.remove();
							console.error("Target not found. Please specify the correct transclude-to attribute.");
						}
					});
				});
			}
		};
	});
});