ngDefine('cockpit.plugin.statistics-plugin', ['module:cockpit.plugin.statistics-plugin.controllers:./controllers/main',
                                              'module:cockpit.plugin.statistics-plugin.directives:./directives/main',
                                              'module:cockpit.plugin.statistics-plugin.services:./services/main',
                                              './lib/d3',
                                              './lib/nv.d3',
                                              'module:nvd3:./lib/angular-nvd3',
                                              ], function(module) {


	


	/* ################################## Configuration ##################################### */
//not necessar anymore
//	dashboardController.$inject = ["$scope", "$http", "Uri"];
//	processDefinitionController.$inject = ["$scope", "$http", "Uri"];

//	var dashboardController =  $.getScript("/#/controller/dashboardController.js",  function(data, status, jqxhr){
//	console.log('dashboard');
//	});  

	var Configuration = function Configuration(ViewsProvider) {


		ViewsProvider.registerDefaultView('cockpit.dashboard', {
			id: 'statistics-plugin',
			label: 'History Statistics',
			url: 'plugin://statistics-plugin/static/app/dashboard.html',
			// make sure we have a higher priority than the default plugin
			priority: 12
		});
		
    ViewsProvider.registerDefaultView('cockpit.processDefinition.runtime.action', {
      id: 'overlay',
      priority: 20, 
      url: 'plugin://statistics-plugin/static/app/overlay.html'
    });

		ViewsProvider.registerDefaultView('cockpit.processDefinition.runtime.tab', {
			id: 'runtime',
			priority: 20,	
			//name im reiter
			label: 'Statistics',
			url: 'plugin://statistics-plugin/static/app/processDefinition.html',
			controller: 'processDefinitionCtrl'
		});
	};

	Configuration.$inject = ['ViewsProvider'];

	module.config(Configuration);

	return module;
});
