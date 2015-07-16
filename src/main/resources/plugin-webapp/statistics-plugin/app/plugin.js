ngDefine('cockpit.plugin.statistics-plugin', ['./lib/d3',
                                              './lib/nv.d3',
                                              './lib/clusterfck-0.1',
                                              //'./lib/angular-touch',
                                              'module:nvd3:./lib/angular-nvd3',
                                              'module:angularAwesomeSlider:./lib/angular-awesome-slider',
                                              'module:cockpit.plugin.statistics-plugin.controllers:./controllers/main',
                                              'module:cockpit.plugin.statistics-plugin.directives:./directives/main',
                                              'module:cockpit.plugin.statistics-plugin.services:./services/main'
                                              ], function(module) {
 

	var Configuration = function Configuration(ViewsProvider) {


		ViewsProvider.registerDefaultView('cockpit.dashboard', {
			id: 'statistics-plugin',
			label: 'History Statistics',
			url: 'plugin://statistics-plugin/static/app/dashboard.html',
			priority: 12
		});
		

		ViewsProvider.registerDefaultView('cockpit.processDefinition.runtime.tab', {
			id: 'runtime',
			priority: 20,	
			label: 'Statistics',
			url: 'plugin://statistics-plugin/static/app/processDefinition.html',
			controller: 'processDefinitionCtrl'
		});
		
		ViewsProvider.registerDefaultView('cockpit.processDefinition.diagram.overlay', {
			id: 'process-diagram-overlay',
			priority: 20,	
			label: 'Process Data',
			url: 'plugin://statistics-plugin/static/app/process-diagram-overlay/views/processDiagram.html',
			controller: 'processDiagramCtrl'
		});

		ViewsProvider.registerDefaultView('cockpit.processDefinition.runtime.action', {
			id: 'overlay-menu-action',
			priority: 20, 
			url: 'plugin://statistics-plugin/static/app/process-diagram-overlay/views/overlayMenu.html',
			controller: 'overlayMenuCtrl'
		});
	};

	Configuration.$inject = ['ViewsProvider'];

	module.config(Configuration);

	return module;
});
