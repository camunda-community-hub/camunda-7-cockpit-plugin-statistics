'use strict'; // camunda guys are using strict mode as well, might make sense
// for us, too

ngDefine('cockpit.plugin.statistics-plugin.controllers', ['../lib/d3','../lib/nv.d3.own'],function(module) {

  module.controller('timeChartCtrl', [ '$scope', 'DataFactory',
      function($scope, DataFactory) {

        function getDurations() {
          DataFactory.durations().success(function(data) {

            var values = [];
            $scope.data = [];
            // later when get takes parameters different
            // keys for different processes
            var ended = {
              "key" : "Ended Process Instances",
              "values" : []
            };
            $scope.data.push(ended);
            angular.forEach(data, function(startingTimeAndDuration) {
              $scope.data[0].values.push(startingTimeAndDuration);
            }, values);
            console.log($scope.data);

          });
        }
        ;

        getDurations();

        var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S").parse;

        $scope.options = {
          chart : {
            type : 'scatterChart',
            height : 500,
            width : 1500,
            x : function(d) {
              return parseDate(d.startingTime);
            },
            y : function(d) {
              return d.duration;
            },
            showLabels : true,
            transitionDuration : 500,
            labelThreshold : 0.01,
            legend : {
              margin : {
                top : 5,
                right : 35,
                bottom : 5,
                left : 0
              }
            }
          }
        };

      } ]);
});
