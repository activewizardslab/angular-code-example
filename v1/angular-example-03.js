"use strict"

app.directive('manageChart', function() {
	return {
        replace: true,
        scope: {
            ngModel:'='
        },
        link: function(scope, element, attrs) {
        	var prev = element
        	var element = element[0].parentNode
        	var width = 450;//parseInt($(element).css('width'));
        	var height = 225;
        	var bottomOffset = 25;
        	var data = scope.ngModel;

            data.sort(function(a, b) {
                return (new Date(a.date)).getTime() - (new Date(b.date)).getTime()
            })

        	var svg = d3.select(prev[0]).append('svg')

                .attr('viewBox', '0 0 '+width+' '+(height+10))
                .attr('preserveAspectRatio','xMidYMid')

            width-=40
            height-=40
            var y = d3.scale.linear().range([0 , height]);

            y.domain([0, d3.max(data, function(d) {return d.value})]);

            var x_line = d3.time.scale()
                .range([0, width])
                .domain(d3.extent(data, function(d) {return (new Date(d.date)).getTime()}))
            var line = d3.svg.line()
              .x(function(d) { return x_line((new Date(d.date)).getTime()); })
              .y(function(d) { return -1 * y(d.value); });

            var xAxis = d3.svg.axis()
                .scale(x_line)
                .tickPadding(-8)
                .orient("bottom")
                .tickFormat(d3.time.format('%b %d'))
                .ticks(29)

            var group = svg.append('g')
        		.attr('class', 'chart-data')
        		.attr('transform', 'translate(10 '+(height+10)+')')
                .call(xAxis)
            d3.selectAll('.chart-data').selectAll('.tick').selectAll('text')
                .attr('transform','rotate(90)')
                .attr('x', '6px')
                .style('text-anchor', 'start');
        	var pix_per_value = width/(data.length-1);

        	var linebefore = d3.svg.line()
			    .x(function(d, i) {return x_line((new Date(d.date)).getTime());})
			 	.y(0)
			    .interpolate("linear");
			height -= bottomOffset*1.5;

            var areabefore = d3.svg.area()
                .x(function(d, i) {return x_line((new Date(d.date)).getTime());})
                .y0(0)
                .y1(0)

            var area = d3.svg.area()
                .x(function(d, i) {return x_line((new Date(d.date)).getTime());})
                .y0(0)
                .y1(function(d) { return -1 * y(d.value); })

            group.append('path')
                .attr('d', areabefore(data))
                .transition()
                .duration(600)
                .attr('d', area(data))
                .attr('class', 'chart-area')

			group.append('path')
				.attr('d', linebefore(data))
        		.transition()
                .duration(600)
				.attr('d', line(data))
				.attr('class', 'chart-line')
            
        	var dots = group
        		.selectAll('.data-dots')
        		.data(data)
        		.enter()
        			.append('circle')
                    //.style('display', 'none')


        	dots.attr('cx',function(d) { return x_line((new Date(d.date)).getTime());})
				.attr('cy', 0)
				.transition()
                .duration(600)
				.attr('cy', function(d) { return -1 * y(d.value); })
				.attr('r', '4px')
				.attr('class', 'data-dots')

        	var tooltip = d3.select(prev[0]).append('div')
                    .style('display', 'none')
        			.attr('class','tooltip-chart')

			dots.on('mouseover', function(d) {
        		var x = d3.event.offsetX+20;
        		var y = d3.event.offsetY;
        		d3.select(prev[0]).select('.tooltip-chart')
        			.style('display', null)
        			.style('left', x+'px')
        			.style('top', y+'px')
        			.transition(100)

					.style('opacity', 0.75)
        			.text('Value:'+d.value)
        	})
			dots.on('mouseout', function() {
				d3.select(prev[0]).select('.tooltip-chart')
					.style('display', 'none')
			})
        }
	}
})