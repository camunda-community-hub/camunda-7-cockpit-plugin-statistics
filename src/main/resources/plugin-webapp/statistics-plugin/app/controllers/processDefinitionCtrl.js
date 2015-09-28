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
                  '$q',
                  function($scope, DataFactory, Uri, $q) {

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
                    
                    $q.all([DataFactory.getAllProcessInstanceRunningIncidentsCountOByProcDefRestApi(),
                            DataFactory.getAggregatedEndedProcessInstanceInformationOrderedByProcessDefinitionKey($scope.processDefinition.key)]).then(function(){
                      var counts = [];

                      $scope.statesOfDefinition = counts;
                      
                      counts
                      .push({
                        "key" : "finished",
                        "y" : DataFactory.aggregatedEndedProcessInstanceInformationOrderedByProcessDefinitionKey[$scope.processDefinition.key][0].y,
                        "avg" : DataFactory.aggregatedEndedProcessInstanceInformationOrderedByProcessDefinitionKey[$scope.processDefinition.key][0].avg,
                        "min" : DataFactory.aggregatedEndedProcessInstanceInformationOrderedByProcessDefinitionKey[$scope.processDefinition.key][0].min,
                        "max" : DataFactory.aggregatedEndedProcessInstanceInformationOrderedByProcessDefinitionKey[$scope.processDefinition.key][0].max
                      });
                      
                      var data = DataFactory.processInstanceRunningIncidentsCountOByProcDefRestApi;
                      
                      var resultRunning = {};
                      var resultIncidents = {};
                      
                      for(i in data) {
                        
                        if(data[i].definition.key==$scope.processDefinition.key) {
                          if(!resultRunning[data[i].definition.key]) {
                            resultRunning[data[i].definition.key]=0;
                          }
                          
                          resultRunning[data[i].definition.key]+=data[i].instances;
                          
                          
                          if(!resultIncidents[data[i].definition.key]) {
                            resultIncidents[data[i].definition.key] = 0;
                          }
                            
                          if(data[i].incidents && data[i].incidents.length>0) {
                            for(j in data[i].incidents) {
                              resultIncidents[data[i].definition.key]+=data[i].incidents[j].incidentCount;  
                            }  
                          }
                        }

                        
                      }

                      
                      counts
                      .push({
                        "key" : "running",
                        "y" : resultRunning[$scope.processDefinition.key]
                      });
                      counts
                      .push({
                        "key" : "failed",
                        "y" : resultIncidents[$scope.processDefinition.key]
                      });
                      
                      
                    });

                  

                  } ]);
    });