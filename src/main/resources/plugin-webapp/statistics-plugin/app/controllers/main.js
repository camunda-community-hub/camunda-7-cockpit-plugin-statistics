ngDefine('cockpit.plugin.statistics-plugin.controllers', [
      //add dependency to your controller here  
  'module:cockpit.plugin.statistics-plugin.services:../services/main',
  './dashboardCtrl',
  './processDefinitionCtrl',
  './processesChartCtrl',
  './casesChartCtrl',
  './pluginSettingsCtrl',
  './slaChartCtrl',
  './feedbackCtrl',
  './plotConfigController',
  '../process-diagram-overlay/controllers/overlayMenuCtrl',
  '../process-diagram-overlay/controllers/processDiagramCtrl',
  '../process-diagram-overlay/controllers/processDiagramSettingsCtrl',
  '../process-diagram-overlay/controllers/activityHistoryCtrl',
  '../process-diagram-overlay/controllers/noHistoryCtrl',
  '../process-diagram-overlay/controllers/loadingModalCtrl'
], function(module) {

});