ngDefine('cockpit.plugin.statistics-plugin.controllers', [
      //add dependency to your controller here 
  'module:cockpit.plugin.statistics-plugin.services:../services/main',
  './dashboardController',
  './processDefinitionCtrl',
  './pieChartCtrl',
  './durationsCtrl',
  './overlayCtrl',
  './timingCtrl',
  './slaChartCtrl',
  './feedbackController'
], function(module) {

});