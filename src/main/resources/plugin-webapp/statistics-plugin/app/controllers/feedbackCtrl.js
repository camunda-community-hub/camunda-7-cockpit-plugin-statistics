ngDefine('cockpit.plugin.statistics-plugin.controllers', ['require'], function(module) {

  module.controller('feedbackCtrl',
      ['$scope', '$http', '$window', function($scope, $http, $window,feedbackCategory,feedbackSubject, feedbackText) {   
        
        $scope.feedbackCategory = feedbackCategory;
        $scope.feedbackSubject = feedbackSubject;
        $scope.feedbackText = feedbackText;
        
        $scope.feedbackCategory = 'Feature-Request';
        $scope.feedbackSubject = 'Tab - Processes';
        
        $scope.sendFeedback = function() {
          var body = "";
          body+="Category:"+$scope.feedbackCategory+", ";
          body+="Subject:"+$scope.feedbackSubject+", ";
          body+="Feedback: Oh! That is a nice plugin you have created, but.. "+$scope.feedbackText;
          $window.open("mailto:eric.klieme"+"@"+"novatec-gmbh.com?subject=Feedback camunda-cockpit-statistics-plugin&body="+body,'Give Feedback');
          //$window.location = ;
        };
        
      }]);
  
});