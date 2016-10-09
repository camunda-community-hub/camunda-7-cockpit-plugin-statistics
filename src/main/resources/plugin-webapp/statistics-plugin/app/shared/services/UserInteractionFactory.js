ngDefine('cockpit.plugin.statistics-plugin.shared-services', function(module) {
  module.factory('UserInteractionFactory', ['$rootScope', '$q', '$window', function($rootScope, $q, $window) {
    
    var UserInteractionFactory = {};
    
    
    UserInteractionFactory.currentWidth = $window.innerWidth;
    UserInteractionFactory.plotHeight = 0;
    
    UserInteractionFactory.broadcastHeight = function() {
      $rootScope.$broadcast('heightChanged');
    };
    
    UserInteractionFactory.broadcastWidth = function() {
      $rootScope.$broadcast('widthChanged');
    };
    
    
    var setPlotHeight = function(width) {
      if(width<880 && width>768) {
        if(UserInteractionFactory.plotHeight!=380) {
          UserInteractionFactory.plotHeight = 380;
          UserInteractionFactory.broadcastHeight();
        }      
      }else if(width>880 && width<992) {
        if(UserInteractionFactory.plotHeight!=440) {
          UserInteractionFactory.plotHeight = 440;
          UserInteractionFactory.broadcastHeight();
        }
      }else if(width<768) {
        if(UserInteractionFactory.plotHeight!=250) {
          UserInteractionFactory.plotHeight = 250;
          UserInteractionFactory.broadcastHeight();
        }
      } else if(width>992) {
        if(UserInteractionFactory.plotHeight!=500) {
          UserInteractionFactory.plotHeight = 500;
          UserInteractionFactory.broadcastHeight();
        }
      }
    }
    
    angular.element($window).bind("resize", function() {
      $rootScope.$apply(function() {
        UserInteractionFactory.currentWidth = $window.innerWidth;
        UserInteractionFactory.broadcastWidth();
        setPlotHeight($window.innerWidth);
      });
    });
    
    setPlotHeight(UserInteractionFactory.currentWidth);
    UserInteractionFactory.broadcastHeight();
    UserInteractionFactory.broadcastWidth();
    
    return UserInteractionFactory;
    
  }])
});
