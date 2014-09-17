ngDefine('cockpit.plugin.statistics-plugin.services', function(module) {
  module.factory('GraphFactory', function() {
    var GraphFactory = [];

    GraphFactory.drawStartEndTimeGraph = function(data, timeDistribution, svg) {
      nv.addGraph(function() {
        var chart = nv.models.scatterChart().showDistX(false).showDistY(false)
            .color(d3.scale.category10().range());
        //Configure how the tooltip looks.
        //				chart.tooltipContent(function(key) {
        //				return '<h3>' + key + '</h3>';
        //				});
        var timeFormat = (timeDistribution == "dayly") ? '%H:%M' : '%a %H:%M';
        console.log(timeFormat);
        chart.xAxis
        //				.ticks(d3.time.minute, 30)
        .tickFormat(function(d) {
          return d3.time.format(timeFormat)(new Date(d))
        });
        chart.yAxis.tickFormat(function() {
          return ""
        });

        d3.select(svg).datum(data).transition().duration(500).call(chart);

        nv.utils.windowResize(chart.update);

        return chart;
      });
    };

    GraphFactory.getOptionsForStartEndTimeGraph = function(timeFormat, width) {
      var options = {
        chart : {
          type : 'scatterChart',
          height : 400,
          width : width,
          color : d3.scale.category10().range(),
          x : function(d) {
            return d.x;
          },
          y : function(d) {
            return d.y;
          },
          showLabels : true,
          transitionDuration : 500,
          labelThreshold : 0.01,
          tooltips : true,
          tooltipContent : function(key) {
            console.log(key);
            return '<h3>' + key + '</h3>'
          },
          xAxis : {
            tickFormat : function(d) {
              return d3.time.format(timeFormat)(new Date(d))
            }
          },

          yAxis : {
            tickFormat : function() {
              return ""
            }
          },
          noData : "sorry data not yet available",
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
      return options;

    };
    return GraphFactory;
  });
});