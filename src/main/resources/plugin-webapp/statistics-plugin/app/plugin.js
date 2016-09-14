ngDefine('cockpit.plugin.statistics-plugin', ['./lib/d3',
                                              './lib/d3.new.min',
                                              'module:ui.bootstrap.datetimepicker:./lib/datetime-picker',
                                              './lib/daterangepicker',
                                              'module:daterangepicker:./lib/angular-daterangepicker',
                                              'module:cockpit.plugin.statistics-plugin.controllers:./controllers/main',
                                              'module:cockpit.plugin.statistics-plugin.directives:./directives/main',
                                              'module:cockpit.plugin.statistics-plugin.services:./services/main',
                                              'module:cockpit.plugin.statistics-plugin.libs:./lib/main'
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
		
		
		
		ViewsProvider.registerDefaultView('cockpit.processDefinition.runtime.action', {
			id: 'process-diagram-kpi',
			priority: 20,	
			url: 'plugin://statistics-plugin/static/app/process-diagram-kpi/views/kpiIcon.html',
			controller: 'kpiCtrl'
		});
		
		
		ViewsProvider.registerDefaultView('cockpit.processDefinition.diagram.overlay', {
			id: 'process-diagram-kpi-elements',
			priority: 20,	
			label: 'Kpi Data',
			url: 'plugin://statistics-plugin/static/app/process-diagram-kpi/views/processDiagramKpi.html',
			controller: 'processDiagramKpiCtrl'
		});
		
	};

	Configuration.$inject = ['ViewsProvider'];

	module.config(Configuration);

	return module;
});
