ngDefine('cockpit.plugin.statistics-plugin.dashboard', function(module) {
  module.controller('settingsModalCtrl', ['$scope','$modalInstance', 'SettingsFactory',function($scope, $modalInstance, SettingsFactory) {
    
    $scope.pluginSettings = {};
    
    $scope.showTooltipTiming = false;
    $scope.showTooltipOverview = false;
    
    $scope.init = function() {
      
      SettingsFactory.loadPluginSettings().then(function(settings){    
        $scope.pluginSettings = settings;
      });
      
    }
       
    $scope.applySettings = function() {
      
      /*
       * transform selection for faster filtering later
       */
      
      $scope.pluginSettings.overview.failedPI.keysToSkip = [];
      $scope.pluginSettings.overview.runningPI.keysToSkip = [];
      $scope.pluginSettings.overview.endedPI.keysToSkip = [];
      $scope.pluginSettings.timing.keysToSkip = [];

      
      for(i in $scope.pluginSettings.overview.runningPI.filterProcessDefKeys) {
        if(!$scope.pluginSettings.overview.runningPI.filterProcessDefKeys[i].plot) {
          $scope.pluginSettings.overview.runningPI.keysToSkip.push($scope.pluginSettings.overview.runningPI.filterProcessDefKeys[i].processKey);
        }
      }
      
      for(i in $scope.pluginSettings.overview.endedPI.filterProcessDefKeys) {
        if(!$scope.pluginSettings.overview.endedPI.filterProcessDefKeys[i].plot) {
          $scope.pluginSettings.overview.endedPI.keysToSkip.push($scope.pluginSettings.overview.endedPI.filterProcessDefKeys[i].processKey);
        }
      }
      
      for(i in $scope.pluginSettings.overview.failedPI.filterProcessDefKeys) {
        if(!$scope.pluginSettings.overview.failedPI.filterProcessDefKeys[i].plot) {
          $scope.pluginSettings.overview.failedPI.keysToSkip.push($scope.pluginSettings.overview.failedPI.filterProcessDefKeys[i].processKey);
        }
      }
      
      for(i in $scope.pluginSettings.timing.processDefKeysToFilter) {
        if(!$scope.pluginSettings.timing.processDefKeysToFilter[i].plot) {
          $scope.pluginSettings.timing.keysToSkip.push($scope.pluginSettings.timing.processDefKeysToFilter[i].processKey);
        }
      }
      
      SettingsFactory.savePluginSettings($scope.pluginSettings);
      
      $modalInstance.close();
    }
    
    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    }
    
    
  }])
});