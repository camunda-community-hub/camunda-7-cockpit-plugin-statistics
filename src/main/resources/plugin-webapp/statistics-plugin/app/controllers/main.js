ngDefine('cockpit.plugin.statistics-plugin.controllers', [
      //add dependency to your controller here 
  'module:cockpit.plugin.statistics-plugin.services:../services/main',
  './dashboardController',
  './processDefinitionCtrl',
  './pieChartCtrl',
  './pieChartCtrlUsr',
  './durationsCtrl',
  './process24Ctrl',
  './userTasks24Ctrl',
  './slaPieChartCtrl'
], function(module) {

});