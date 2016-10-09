ngDefine('cockpit.plugin.statistics-plugin.components', [
  './process-definition/processDefinitionDiagramCtrl',
  'module:cockpit.plugin.statistics-plugin.dashboard:./dashboard/dashboardModule',
	'module:cockpit.plugin.statistics-plugin.activity-history:./process-definition/activity-history/activityHistoryModule',
	'module:cockpit.plugin.statistics-plugin.highlighting:./process-definition/highlighting/highlightingModule',
	'module:cockpit.plugin.statistics-plugin.business-data-statistics:./process-definition/business-data-statistics/businessDataStatisticsModule',
	'module:cockpit.plugin.statistics-plugin.duration:./process-definition/duration/durationModule',
	'module:cockpit.plugin.statistics-plugin.statistics:./process-definition/statistics/statisticsModule'
], function(module) {
	
	var Configuration = function Configuration(ViewsProvider) {
		
		/* components on cockpit dashboard */
		
  	ViewsProvider.registerDefaultView('cockpit.dashboard', {
    	id: 'cockpit-dashboard-statistics',
    	url: 'plugin://statistics-plugin/static/app/components/dashboard/dashboardView.html',
    	controller: 'dashboardCtrl',
    	priority: 12
    });
  	
  	/* components in tab of process definition view */
  	
  	ViewsProvider.registerDefaultView('cockpit.processDefinition.runtime.tab', {
    	id: 'process-definition-runtime-tab-statistics',
    	priority: 20,	
    	label: 'Statistics',
    	url: 'plugin://statistics-plugin/static/app/components/process-definition/processDefinitionTabView.html',
    });
		
		/* components in process definition diagram view */
		
  	ViewsProvider.registerDefaultView('cockpit.processDefinition.diagram.overlay', {
  		id: 'process-definition-diagram-overlay-statistics',
  		priority: 20,	
  		url: 'plugin://statistics-plugin/static/app/components/process-definition/processDefinitionDiagramView.html',
  		controller: 'processDefinitionDiagramCtrl'
  	});
  	
  	ViewsProvider.registerDefaultView('cockpit.processDefinition.runtime.action', {
    	id: 'process-definition-runtime-action-statistics',
    	priority: 20, 
    	url: 'plugin://statistics-plugin/static/app/components/process-definition/processDefinitionMenuView.html',
    });
  	
	};
	
	Configuration.$inject = ['ViewsProvider'];

	module.config(Configuration);

	return module;
	
});