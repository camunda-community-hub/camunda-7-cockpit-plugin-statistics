ngDefine('cockpit.plugin.statistics-plugin.controllers', ['require'], function(module) {

  module.controller('feedbackController',
    ['$scope', '$http', '$window', '$sanitize',  function($scope, $http, $window, $sanitize) {   
      
      $scope.feedbackCategory = 'Feature-Request';
      $scope.feedbackSubject = 'Tab-Processinstances';
      
      $scope.sendFeedback = function() {
        var body = "";
        body+="Category:"+$sanitize($scope.feedbackCategory)+", ";
        body+="Subject:"+$sanitize($scope.feedbackSubject)+", ";
        body+="Feedback: Oh! That is a nice plugin you have created, but.. "+$sanitize($scope.feedbackText);
        $window.location = "mailto:eric.klieme"+"@"+"novatec-gmbh.de?subject=Feedback camunda-cockpit-statistics-plugin&body="+body;
      };
      
    }]);
});
