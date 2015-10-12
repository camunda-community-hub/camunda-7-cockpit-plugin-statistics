ngDefine('cockpit.plugin.statistics-plugin.controllers', ['require'], function(module) {

  module.controller('feedbackCtrl',
      ['$scope', '$http', '$window', function($scope, $http, $window) {   
        
        $scope.feedbackText = "";
        $scope.feedbackCategory = "Feature-Request";
        $scope.feedbackSubject = "Tab - Processes";
        
        $scope.sendFeedback = function(feedbackText, feedbackCategory, feedbackSubject) {
          var body = "";
          body+="Category:"+feedbackCategory+", ";
          body+="Subject:"+feedbackSubject+", ";
          body+="Feedback: Oh! That is a nice plugin you have created, but.. "+feedbackText;
          $window.open("mailto:eric.klieme"+"@"+"novatec-gmbh.de?subject=Feedback camunda-cockpit-statistics-plugin&body="+body,'Give Feedback');
          //$window.location = ;
        };
        
      }]);
  
});