ngDefine(
    'cockpit.plugin.statistics-plugin.controllers',
    function(module) {

      module
          .controller(
              'processDefinitionCtrl',
              [
                  '$scope',
                  'DataFactory',
                  'Uri',
                  function($scope, DataFactory, Uri) {

                    $scope.options = {
                      chart : {
                        type : 'pieChart',
                        height : 500,
                        x : function(d) {
                          return d.key;
                        },
                        y : function(d) {
                          return d.y;
                        },
                        showLabels : true,
                        transitionDuration : 500,
                        labelThreshold : 0.01,
                        tooltips : true,
                        tooltipContent : function(key, y, e, graph) {
                          if (key == "finished") {
                            return '<h3>' + key + '</h3>' + '<p>count:<b>' + y
                                + '</b><br/>' + 'average Duration:<b>'
                                + (e.point.avg / 1000 / 60).toFixed(2)
                                + ' min</b><br/>minimal Duration:<b>'
                                + (e.point.min / 1000 / 60).toFixed(2)
                                + ' min</b><br/>maximal Duration:<b>'
                                + (e.point.max / 1000 / 60).toFixed(2)
                                + ' min</b></p>'
                          } else {
                            return '<h3>' + key + '</h3>' + '<p>' + y + '</p>'
                          }
                        },
                        noData : "No Processes met the requirements",
                        legend : {
                          margin : {
                            top : 5,
                            right : 5,
                            bottom : 5,
                            left : 5
                          }
                        }
                      }
                    };


                    DataFactory
                        .getAllProcessInstanceCountsByState(
                            $scope.processDefinition.key)
                        .then(
                            function() {

                              var processDefinitionCounts = DataFactory.allProcessInstanceCountsByState[$scope.processDefinition.key];
                              var counts = [];

                              counts
                                  .push({
                                    "key" : "running",
                                    "y" : processDefinitionCounts[0].runningInstanceCount
                                  });
                              counts
                                  .push({
                                    "key" : "failed",
                                    "y" : processDefinitionCounts[0].failedInstanceCount
                                  });
                              counts
                                  .push({
                                    "key" : "finished",
                                    "y" : processDefinitionCounts[0].endedInstanceCount,
                                    "avg" : processDefinitionCounts[0].duration,
                                    "min" : processDefinitionCounts[0].minDuration,
                                    "max" : processDefinitionCounts[0].maxDuration
                                  });

                              $scope.statesOfDefinition = counts;

                            });

                  } ]);
    });