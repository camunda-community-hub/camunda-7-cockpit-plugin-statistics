
		//HEIGHT!
		var lane = 500 - 75;
		$scope.onChange = function(key){	

			$http.get(Uri.appUri("plugin://statistics-plugin/:engine/incidents"))
			.success(function(incidents) {

				var formatDate = d3.time.format("%Y-%m-%dT%H:%M:%S");

				var first = formatDate.parse(incidents[0].createTime),
				last = formatDate.parse(incidents[incidents.length-1].createTime),
				svg = d3.select("#svgPlot7"),
				width = $(window).width()/3*2-55,
				height = 500,
				data = [];

				for(i in incidents){
					data.push({"date":formatDate.parse(incidents[i].createTime),"processKey":incidents[i].processKey,"msg":incidents[i].incidentMsg,"processName":incidents[i].processName,"type":incidents[i].incidentType});
				}

				if(!document.getElementById('Timeline')){

					var axisScale = d3.time.scale()
					.domain([first, last])
					.range([10,width]);

					var xAxis = d3.svg.axis()
					.scale(axisScale)
					.orient("bottom")
					.tickFormat(d3.time.format("%Y-%m-%d"));

					svg.append("g")
					.attr("id", "Timeline")
					.attr("transform", "translate(0,"+ height +")")
					.call(xAxis)
					.selectAll("text")	
					.style("text-anchor", "end")
					.attr("dx", "-.8em")
					.attr("dy", ".15em")
					.attr("transform", function(d) {
						return "rotate(-65)" 
					});
				}


				var x = d3.time.scale().range([0, width]);
				var y = d3.scale.linear().range([height, 0]);

				x.domain(d3.extent(data, function(d) { return d.date; }));


				drawData=[];
				draw = false;
				for(j in data){
					if((key===data[j].processKey) && (document.getElementById(key).checked==true)){
						drawData.push(data[j]);
						draw = true;
					}
					if((document.getElementById(key).checked==false)){
						for(k in drawData){
							if(key==drawData[k].processKey){
								drawData.splice(k, 1);
							}
						}
					}
				}

				if(draw){
					lane -= 30;

					var valueline = d3.svg.line()
					.x(function(d) { return x(d.date); })
					.y(function(d) { return lane });

					svg.append("text")
					.attr("x", 10)             
					.attr("y", lane - 10)
					.style("font-size", "14px")
					.text(drawData[0].processName)
					.attr("id", "drawn-" + key);

					svg.append("path")
					.attr("class", "line")
					.attr("d", valueline(drawData))
					.attr("fill","none")	
					.attr("stroke-width","2")
					.attr("stroke","black")
					.attr("id", "drawn-" + key);

					svg.selectAll("dot")	
					.data(drawData)			
					.enter().append("circle")	
					.attr("fill","steelblue")
					.attr("r", 5)		
					.attr("cx", function(d) { return x(d.date); })		 
					.attr("cy", function(d) { return lane })
					.attr("id", "drawn-" + key)
					.on("mouseover", function(d) {		
						div.transition()		
						.duration(200)		
						.style("opacity", .9);		
						div	.html(d.date + "<br/>" + d.processName + "<br/>" + "Type: " + d.type + "<br/>" + "Message: " + d.msg)	
						.style("left", (d3.event.pageX + 5) + "px")		
						.style("top", (d3.event.pageY - 28) + "px");	
					})					
					.on("mouseout", function(d) {		
						div.transition()		
						.duration(500)		
						.style("opacity", 0);	
					});

					var div = d3.select("body").append("div")	
					.attr("class", "tooltip")				
					.style("opacity", 0)
					.attr("id", "drawn-" + key);

				}else{
					lane += 30;
					d3.selectAll("#drawn-" + key).remove();
				}

			});
		}; 
