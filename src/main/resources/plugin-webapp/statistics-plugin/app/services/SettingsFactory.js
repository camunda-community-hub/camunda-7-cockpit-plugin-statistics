ngDefine('cockpit.plugin.statistics-plugin.services', function(module) {
  module.factory('SettingsFactory', ['DataFactory', '$rootScope', '$q', function(DataFactory, $rootScope, $q) {
    
    var SettingsFactory = {};
    var settingsPrefixForLocalStorage = "pluginSettings_";
    var loggedInUser = $rootScope.authentication.name;
    
    SettingsFactory.pluginSettings = {};
    
    var supportsLocalStorage = function() {
      try {
        return 'localStorage' in window && window['localStorage'] !== null;
      } catch (e) {
        return false;
      }
    };
    
    SettingsFactory.prepForBroadcast = function(pluginSettings) {    
      this.pluginSettings = pluginSettings;
      this.broadcastSettings();
    };
    
    SettingsFactory.broadcastSettings = function() {
      $rootScope.$broadcast('pluginSettingsChanged');
    };
    
    SettingsFactory.loadPluginSettings = function() {
      
      var deferred = $q.defer();
      
      /*
       * empty // standard settings
       */
      
      var settingsToReturn = {
           supported:false,
           overview:{
             runningPI : {
               filterProcessDefKeys:[],
               keysToSkip:[],
               toPlot:true
             },
             endedPI: {
               filterProcessDefKeys:[],
               keysToSkip:[],
               toPlot:true
             },
             failedPI: {
               filterProcessDefKeys:[],
               keysToSkip:[],
               toPlot:true
             },
             loadOnTabLoad:true,
             cacheExpirationInMillis:60000
           },
           timing:{
             processDefKeysToFilter:[],
             keysToSkip:[],
             loadOnTabLoad:true,
             cacheExpirationInMillis:60000
           }
      };
      
      if(supportsLocalStorage()) {
        
        settingsToReturn.supported=true;
        
        //look for localstorage settings
        
        var localStorage = window['localStorage'];
        var localSettings = localStorage[settingsPrefixForLocalStorage+loggedInUser];
        var fromLocalSettings = false;
        
        if(localSettings) {
          
          settingsToReturn = angular.fromJson(localSettings);
          fromLocalSettings = true;
                 
        } else {
          console.debug("load: did not find local storage settings - have to apply initial settings");
        }
        
        //get available process definition keys
        DataFactory.getProcessDefinitions().then(function() {
          
          var procDefs = DataFactory.processDefinitions;
          var processKeysToFilter = [];
          
          for(i in procDefs) {
            if(processKeysToFilter.indexOf(procDefs[i].key)==-1) {
              processKeysToFilter.push(procDefs[i].key);  
            }
          }
          
          for(i in processKeysToFilter) {
            
            if(fromLocalSettings) {
              /*
               * see if list of available process definition keys changed...
               * TODO --> create Button to refresh settings (scan local storage and ggf. expand with new information);
               */

            } else {
              settingsToReturn.overview.runningPI.filterProcessDefKeys.push({
                plot:true,
                processKey:processKeysToFilter[i]
              });
              settingsToReturn.overview.endedPI.filterProcessDefKeys.push({
                plot:true,
                processKey:processKeysToFilter[i]
              });
              settingsToReturn.overview.failedPI.filterProcessDefKeys.push({
                plot:true,
                processKey:processKeysToFilter[i]
              });
              settingsToReturn.timing.processDefKeysToFilter.push({
                plot:true,
                processKey:processKeysToFilter[i]
              });
            }
            
          }
       
          deferred.resolve(settingsToReturn);
          
        });
        
      } else {
        deferred.resolve(settingsToReturn);
      }
      
      return deferred.promise;

    };
    
    SettingsFactory.savePluginSettings = function(pluginSettings) {
      
      var needsToBeSaved = true;
      var settingsToSave = angular.toJson(pluginSettings);
      
      if(localStorage[settingsPrefixForLocalStorage+loggedInUser]) {
        if(localStorage[settingsPrefixForLocalStorage+loggedInUser]!=settingsToSave) {
          console.debug("stettings changed ==> store new settings");
          localStorage[settingsPrefixForLocalStorage+loggedInUser] = settingsToSave;
          SettingsFactory.prepForBroadcast(pluginSettings);
        } else {
          console.debug("stettings did not change");
        }
      } else {
        localStorage[settingsPrefixForLocalStorage+loggedInUser] = settingsToSave;
        SettingsFactory.prepForBroadcast(pluginSettings);
      }
       
    }
    
    SettingsFactory.loadPluginSettings().then(function(settings) {
      SettingsFactory.pluginSettings = settings;
      SettingsFactory.prepForBroadcast(settings);
    });

    
    return SettingsFactory;
    
    
  }])
});
  