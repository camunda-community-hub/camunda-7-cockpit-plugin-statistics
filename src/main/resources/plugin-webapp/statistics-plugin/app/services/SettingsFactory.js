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
           },
           timing:{
             processDefKeysToFilter:[],
             keysToSkip:[],
             loadOnTabLoad:true,
           },
           general: {
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
          
          var indizesToRemoveFromOldList = [];
          for (var i = 1; i <= settingsToReturn.overview.runningPI.filterProcessDefKeys.length; i++) {
            indizesToRemoveFromOldList.push(i);
          }
          
          var matchedExistingKeys = 0;
          var oldLengthOfKeysToFilter = settingsToReturn.overview.runningPI.filterProcessDefKeys.length;
          
          for(i in processKeysToFilter) {
            
            if(fromLocalSettings) {
              /*
               * see if list of available process definition keys changed...
               *                */

              var newProcessDefinitionKey = true;
              
              for(j in settingsToReturn.overview.runningPI.filterProcessDefKeys) {
                if(processKeysToFilter[i] == settingsToReturn.overview.runningPI.filterProcessDefKeys[j].processKey) {
                  newProcessDefinitionKey = false;
                  indizesToRemoveFromOldList.splice(indizesToRemoveFromOldList.indexOf(j),1);
                  matchedExistingKeys++;
                }     
              }
              
             
              if(newProcessDefinitionKey) {
                //new key ==> add to filter list
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
                
                //check if any definition was removed
              }
                
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
          
          if(matchedExistingKeys<oldLengthOfKeysToFilter) {
            
            /*
             * process definitions were removed
             * --> remove them from all lists
             */
            
            var indizesDeleted = 0;
            for(i in indizesToRemoveFromOldList) {
              
              /*
               * only works because list of indizes is ordered from 0 to n
               */
              var  indexToDelete = indizesToRemoveFromOldList[i]-indizesDeleted;

              
              settingsToReturn.overview.runningPI.filterProcessDefKeys.splice(indexToDelete,1);
              settingsToReturn.overview.endedPI.filterProcessDefKeys.splice(indexToDelete,1);
              settingsToReturn.overview.failedPI.filterProcessDefKeys.splice(indexToDelete,1);
              settingsToReturn.timing.processDefKeysToFilter.splice(indexToDelete,1);
              
              indizesDeleted++;              
              
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
  