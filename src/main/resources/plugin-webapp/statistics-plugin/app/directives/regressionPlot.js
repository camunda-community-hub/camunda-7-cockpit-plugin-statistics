ngDefine('cockpit.plugin.statistics-plugin.directives',  function(module) {

	var margin = {top: 20, right: 20, bottom: 30, left: 100};

	function getWidth(width) {
		if(typeof width == "undefined"){
			return 960 - margin.left - margin.right;
		}
		else 
			return width -margin.left - margin.right;

	};

	function getHeight(heigth) {
		if(typeof heigth == "undefined"){
			return 500 - margin.top - margin.bottom;
		}
		else 
			return heigth -margin.top - margin.bottom;

	};	

	function getX (width){
		return d3.time.scale().range([0, width]);
	};


	function getY (height){
		return d3.scale.linear().range([height, 0]);
	};


	function getXDirect (width){
		return d3.time.scale().range([0, getWidth(width)]);
	};

	function getYDirect (height){
		return d3.scale.linear().range([getHeight(height), 0]);
	};
	
	function setUpScales(options,data){
		var x = getXDirect(options.width);
		var y = getYDirect(options.height);

		var xMinsMaxs = [];
		var yMinsMaxs = [];
		angular.forEach(data,function(processSet){
			var Xextent = d3.extent(processSet.values, function(d) { return d.x; });
			var Yextent = d3.extent(processSet.values, function(d) { return d.y; });
			for(var i=0; i<2;i++){
				xMinsMaxs.push(Xextent[i]);
				yMinsMaxs.push(Yextent[i]);
			};
		});
		x.domain(d3.extent(xMinsMaxs));
		y.domain(d3.extent(yMinsMaxs));
		
//		x.domain(d3.extent(d3.merge(data)));
//		y.domain(d3.extent(yMinsMaxs));
		return [x,y];
	};
	
	function setUpColorScale(data){
		var colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
		              "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"
		              ];
		var usedColors = [];
		var processes = [];
		for(var i=0; i<data.length; i++){
			usedColors.push(colors[i]);
			processes.push(data[i].key);
		};
		var colorScale = d3.scale.ordinal()
		.range(usedColors)
		.domain(processes);
		console.log(colorScale);
		return colorScale;
	};
	
	
	function initGraph(options,data,svg,colorScale){
		var Scales = setUpScales(options,data);
		var x = Scales[0];
		var y = Scales[1];
		
		function make_x_axis() {        
		    return d3.svg.axis()
		        .scale(x)
		         .orient("bottom")
		};

		function make_y_axis() {        
		    return d3.svg.axis()
		        .scale(y)
		        .orient("left")
		};
		
		var width = getWidth(options.width);
		var height = getHeight(options.height);


		var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");

		var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left");

		var line = d3.svg.line()
		.x(function(d) { return x(d.x); })
		.y(function(d) { return y(d.y); });

		svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

		svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("duration in min");
		
		svg.append("g")         
        .attr("class", "grid")
        .attr("transform", "translate(0," + height + ")")
        .call(make_x_axis()
            .tickSize(-height, 0, 0)
            .tickFormat("")
        );

    svg.append("g")         
        .attr("class", "grid")
        .call(make_y_axis()
            .tickSize(-width, 0, 0)
            .tickFormat("")
        );
		
		// add legend   
		var legend = svg.append("g")
		  .attr("class", "legend")
	        //.attr("x", w - 65)
	        //.attr("y", 50)
		  .attr("height", 100)
		  .attr("width", 100)
	    .attr('transform', 'translate(-20,50)')    
	      
		
		 legend.selectAll('circle')
	      .data(data)
	      .enter()
	      .append("circle")
	      .attr("class", "dot")
		  .attr("cx", width - 150)//65
	      .attr("cy", function(d, i){ return i *  20 + 5;})
//		  .attr("width", 10)
//		  .attr("height", 10)
	      .attr("r", 5)
	      .style("stroke-width", "2px")
	      .style("stroke",function(d) { 
		        var color = colorScale(d.key);
		        return color;
		      })
		  .style("fill", function(d) { 
	        var color = colorScale(d.key);
	        return color;
	      })
	      
	    legend.selectAll('text')
	      .data(data)
	      .enter()
	      .append("text")
		  .attr("x", width - 137)//52
	      .attr("y", function(d, i){ return i *  20 + 9;})
		  .text(function(d,i) {
	        var text = d.key;
	        return text;
	      });

	};
	
	function dotManager(options,data,svg,colorScale){
		if(typeof options == "undefined")
			return;
		if(!options.scatter)
			svg.selectAll(".dot").remove();
		else{
			var Scales = setUpScales(options,data);
			var x = Scales[0];
			var y = Scales[1];

			angular.forEach(data,function(processSet){

				svg.selectAll("#dot"+processSet.key)
				.data(processSet.values)
				.enter().append("circle")
				.attr("class", "dot")
				.attr("id", "dot" + processSet.key)
				.attr("r", 3.5)
				.attr("cx", function(d) { return x(d.x); })
				.attr("cy", function(d) { return y(d.y); })
				.style("fill", colorScale(processSet.key));
			});
		}

	};


	function splineManager(options,data,svg,colorScale){
		if(typeof options == "undefined")
			return;
		if(!options.spline)
			svg.selectAll("#spline").remove();
		else{
			var Scales = setUpScales(options,data);
			var x = Scales[0];
			var y = Scales[1];

			angular.forEach(data,function(processSet){
				var line = d3.svg.line()
				.x(function(d) { return x(d.x); })
				.y(function(d) { return y(d.y); });

				svg.append("path")
				.datum(processSet.values)
				.attr("id", "spline")
				.attr("class", "line")
				.attr("d", line)
				.attr("stroke",colorScale(processSet.key));
			});
		}
	};

	function regressionManager(options,data,svg,colorScale){
		if(typeof options == "undefined")
			return;
		if(!options.regression)
			svg.selectAll('#regressionGroup').remove();
		else {

			var Scales = setUpScales(options,data);
			var x = Scales[0];
			var y = Scales[1];
			angular.forEach(data,function(processSet){
				var line = d3.svg.line()
				.x(function(d) { return x(d.x); })
				.y(function(d) { return y(d.y); });


				/*##################  statistic happens here #################*/

				// Derive a linear regression
				var linHelp = ss.linear_regression().data(processSet.values.map(function(d) {
					return [+d.x, d.y];
				}));

				var lin = linHelp.line();			//the actual linear regression
				var slope = linHelp.m();			//the slope of the linear regression

				// Create a line based on the beginning and endpoints of the range
				var lindata = x.domain().map(function(x) {
					return {
						x: new Date(x),
						y: lin(+x)
					};
				});


				/*###############   end of statistical calc ########### */
				var regColor = d3.scale.linear().domain([-1,0,1]).range(["red","blue","red"]);	//maps [-1,0] to [red,blue] and [0,1] to [blue,red]

				var g = svg.append("g")
				.attr("id","regressionGroup");
				text = g.append("text")				//info about the slope of the regression line, will be displyed when mouse hovers over regline
				.attr("id","regText")
				.text("slope: "+ (slope*100).toFixed(2) + "%")		//this may produce some weird behavior when it comes to certain numbers
				.attr("opacity","0.0")
				.attr("fill",colorScale(processSet.key))
				.style("text-anchor", "end");

				path = g.append("path")
				.attr("id","regression")
				.datum(lindata)
				.attr("class", "reg")
				.attr("d", line)
//				.attr("stroke",regColor(slope))//the color of the line depends on abs(slope) the increase in slope leads to increase in "redness"
				.attr("stroke",colorScale(processSet.key))
				.on('mouseover', function(d){				//show slope information when mouse hovers over regression line
					d3.select(this).style({opacity:'0.6'});
					d3.select("#regText")
					.attr("x",d3.mouse(this)[0])
					.attr("y",d3.mouse(this)[1])
//					.attr("stroke",regColor(slope))
					.attr("stroke",colorScale(processSet.key))
					.attr("opacity","1.0");

				})
				.on('mouseout', function(d){
					d3.select(this).style({opacity:'1.0'});
					d3.select("#regText")
					.attr("opacity","0.0");
				});
			});
		}
	};

	//in html regression-plot!!!
	module.directive('regressionPlot', function(){

		function link(scope,element,attrs){
			scope.$watch('data', function(newVal, oldVal) {
				if (typeof scope.data=="undefined") 
					return;
				
				scope.colorScale = setUpColorScale(scope.data);

				element[0].innerHTML = '';
				var width = getWidth(scope.options.width);
				var height = getHeight(scope.options.heigth);

				scope.svg = d3.select(element[0]).append('svg')
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
				
				
				initGraph(scope.options,scope.data,scope.svg,scope.colorScale)
				dotManager(scope.options,scope.data,scope.svg,scope.colorScale);
				splineManager(scope.options,scope.data,scope.svg,scope.colorScale);
				regressionManager(scope.options,scope.data,scope.svg,scope.colorScale);
			},true);

			scope.$watch('options.spline',function(){
				splineManager(scope.options,scope.data,scope.svg,scope.colorScale);
			});


			scope.$watch('options.scatter',function(){
				dotManager(scope.options,scope.data,scope.svg,scope.colorScale);
			});



			scope.$watch('options.regression',function(){
				regressionManager(scope.options,scope.data,scope.svg,scope.colorScale);
			});

		}
		return {
			link: link,
			restrict: 'E',
			scope: { data: '=' ,
				options: '='
			}
		}
	}
	)
});
