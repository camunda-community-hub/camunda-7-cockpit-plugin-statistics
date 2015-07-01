ngDefine('cockpit.plugin.statistics-plugin.controllers', [
      //add dependency to your controller here 
  'module:cockpit.plugin.statistics-plugin.services:../services/main',
  './dashboardCtrl',
  './processDefinitionCtrl',
  './processesChartCtrl',
  './casesChartCtrl',
  './pluginSettingsCtrl',
  './durationsCtrl',
  './timingCtrl',
  './slaChartCtrl',
  './feedbackCtrl'
], function(module) {

});