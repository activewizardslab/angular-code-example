"use strict";

app.controller('HomeController',
    ['$scope', '$http', '$interval', 'MockData','Tooltip','ISO2Code',
    function($scope, $http, $interval, MockData,Tooltip, ISO2Code) {

    $scope.benchmark1 = true;
    $scope.benchmark2 = false;

    $scope.dasboard = {
        'sites_installed': 1069,
        'servers_installed': 6,
        'existing_users': 9,
        'monetization': ':(',
        'historys': '',
        'graph_first': {},
        'report': {
            'top_keywords': new Array(),
            'top_rankings': MockData.rankings,
            'top_sites': new Array(),
            'traffic_per_countries':new Array(),
            'trending_sites':new Array(),
            'worst_sites':new Array(),
            'top_google_searches': MockData.top_google_searches,
            'traffic_per_server': new Array(),
            'top_returning_visitors': MockData.top_returning_visitors,
            'lineChartData': new Array(),
        }
        
    };

    // temporary method
    $scope.dataNotFound = function() {
        var w = 815, h = 350;
        var svg = d3.select("#entity-chart")
            .append("svg:svg")
            .attr("width", w)
            .attr("height", h);

        svg.selectAll("text")
           .data(['Data not found'])
           .enter()
           .append("text")
           .text('No data')
           .style("font-size", "40px")
           .attr("transform", "translate("+(w/2-30)+","+h/2+")");
    };

    $scope.get_report = function(begin,end) {
        var params = !begin || !end ? {} : {'begin': begin, 'end': end};

        $http({url: '/api/get_report/', params: params, method: 'GET'})
            .success(function(data, status, headers, config) {
                $scope.data = data.data;
                
                $scope.removeAllData();

                if (!data.data.visitors_info.current) {
                    $scope.dataNotFound();
                    return;
                }
                $http({url:'/api/get_report/online_users', method:'GET'})
                    .success(function(data){
                        $scope.total_online = data.total_online 
                        $scope.diff = data.diff
                    })
                var historys = {
                    'VISITS':{
                        'signification':data.data.visitors_info.current.total_visitors,
                        'format': function(arg) {
                            return arg.toFixed(0)
                        },
                        'all':data.data.visitors_info.reverse ?
                                data.data.visitors_info.reverse.total_visitors:
                                null,
                    },
                    'PAGES':{
                        'signification':data.data.visitors_info.current.pageviews,
                        'format': function(arg) {
                            return arg.toFixed(0)
                        },
                        'all':data.data.visitors_info.reverse ?
                                data.data.visitors_info.reverse.pageviews :
                                null,
                    },
                    'PAGE/VISIT':{
                        'signification':(data.data.visitors_info.current.pageviews/data.data.visitors_info.current.total_visitors).toFixed(2),
                        'format': function(arg) {
                            return arg.toFixed(2)
                        },                        
                        'all':data.data.visitors_info.reverse ? 
                             (data.data.visitors_info.reverse.pageviews/data.data.visitors_info.reverse.total_visitors).toFixed(2) :    
                             null,
                    },
                    'BOUNCE RATE':{
                        'signification':data.data.visitors_info.current.bounce_rate || data.data.visitors_info.current.average_bounce_rate,
                        'format': function(arg) {
                            return arg.toFixed(2)
                        },                        
                        'all':data.data.visitors_info.reverse ? 
                             (data.data.visitors_info.reverse.bounce_rate || data.data.visitors_info.reverse.average_bounce_rate) : 
                              null,
                    }
                };
                $scope.dasboard.historys=historys;
                
                var top_sites = new Array();
                for (var key in data.data.top_sites) { 
                    top_sites[key] = {
                            'direction':data.data.top_sites[key].growth >= 0 ? 'growth2' : 'decline2',
                            'change':data.data.top_sites[key].growth*100,
                            'flag':'fr',
                            'site':data.data.top_sites[key]._id,
                            'quantity':data.data.top_sites[key].traffic_current,
                            'past_week':data.data.top_sites[key].past_week
                    };
                }
                $scope.dasboard.report.top_sites=top_sites;

                var top_keywords = new Array();
                for (var key in data.data.top_keywords) {
                    if(key>9) break;
                    top_keywords[key] = {
                            'direction':data.data.top_keywords[key].diff >= 0 ? 'growth2' : 'decline2',
                            'change':data.data.top_keywords[key].diff,
                            'keyword':data.data.top_keywords[key]._id,
                            'quantity':data.data.top_keywords[key].current,
                            'top3_countries': new Array(),
                            'past_week':data.data.top_keywords[key].past_week

                    };
                    for (var country in data.data.top_keywords[key].countries) {
                        if (data.data.top_keywords[key].countries[country].country == 'null') continue;
                        if (country>2) break;

                        top_keywords[key].top3_countries.push({
                            'flag': ISO2Code.getCode(data.data.top_keywords[key].countries[country].country),
                            'value':(data.data.top_keywords[key].countries[country].total/
                                    data.data.top_keywords[key].current)*100
                        });
                    }
                }

                $scope.dasboard.report.top_keywords=top_keywords;
                
                
                var traffic_per_countries = new Array();
                for (var key in data.data.traffic_per_countries) {
                    traffic_per_countries[key] = {
                            'direction':data.data.traffic_per_countries[key].growth >= 0 ? 'growth2' : 'decline2',
                            'change':data.data.traffic_per_countries[key].growth*100,
                            'flag': ISO2Code.getCode(data.data.traffic_per_countries[key]._id),
                            'site':data.data.traffic_per_countries[key]._id,
                            'quantity':data.data.traffic_per_countries[key].traffic_current,
                            'past_week':data.data.traffic_per_countries[key].past_week
                    };
                }
                $scope.dasboard.report.traffic_per_countries=traffic_per_countries;
                
                var traffic_per_server = new Array();
                for (var key in data.data.traffic_per_server) { 
                    traffic_per_server[key] = {
                            'direction': data.data.traffic_per_server[key].growth >= 0 ? 'growth2' : 'decline2',
                            'change':data.data.traffic_per_server[key].growth*100,
                            'flag':'fr',
                            'site':data.data.traffic_per_server[key]._id,
                            'quantity':data.data.traffic_per_server[key].traffic_current,
                            'past_week':data.data.traffic_per_server[key].past_week
                    };
                }
                $scope.dasboard.report.traffic_per_server=traffic_per_server;
                
                var worst_sites = new Array();
                for (var key in data.data.worst_sites) { 
                    worst_sites[key] = {
                            'direction':data.data.worst_sites[key].growth >= 0 ? 'growth2' : 'decline2',
                            'change':data.data.worst_sites[key].growth*100,
                            'flag':'fr',
                            'site':data.data.worst_sites[key]._id,
                            'quantity':data.data.worst_sites[key].traffic_current,
                            'past_week':data.data.worst_sites[key].past_week
                    };
                }
                $scope.dasboard.report.worst_sites=worst_sites;

                var lineChartData = {
                    benchmark_one: {
                        label: new Array(),
                        dataset: new Array()
                    },
                    benchmark_two: {
                        label: new Array(),
                        dataset: new Array()
                    }
                };

                function compareDate(itemA, itemB) {
                    return moment(itemA.axis).diff(moment(itemB.axis),'hours');
                    }

                function compareValue(itemA, itemB) {
                    return itemA.axis - itemB.axis;
                    }

                if (data.data.visitors_traffic.benchmark_one) {
                    var temp = data.data.visitors_traffic.benchmark_one
                    temp.sort(compareValue);
                    for (var i = 0; i < temp.length; i++) {
                        lineChartData.benchmark_one.dataset.push(temp[i].value);
                        lineChartData.benchmark_one.label.push(temp[i].axis);
                    }

                }

                if (data.data.visitors_traffic.benchmark_two) {
                    var temp = data.data.visitors_traffic.benchmark_two;
                    temp.sort(compareDate);
                    for (var i = 0; i < temp.length; i++) {
                        lineChartData.benchmark_two.dataset.push(temp[i].value);
                        lineChartData.benchmark_two.label.push(temp[i].axis);
                    }
                }
                $scope.dasboard.graph_first = lineChartData;
                console.log($scope.dasboard.graph_first);
                $scope.pageInit($scope.dasboard.graph_first);

                function compareValue(itemA, itemB) {
                    return itemB.growth - itemA.growth;
                    }
                var trending_sites = new Array();
                var temp = data.data.trending_sites
                    temp.sort(compareValue);
                for (var key in temp){
                    if(key>9) break;
                    trending_sites[key] = { 
                        'direction':temp[key].growth >= 0 ? 'growth2' : 'decline2',
                        'math_direction':'+',
                        'change':temp[key].growth * 100,
                        'flag':'fr',
                        'site':temp[key]._id,
                        'quantity':temp[key].visitors_current,
                    }
                }
                $scope.dasboard.report.trending_sites = trending_sites                  
            });
    };

        $scope.generateData = function generateData() {
        // generate random data
        var date = new Date();
        date.setDate(date.getDate() - 1);
        var value_max = d3.max($scope.benchmark_concat, function(d) {return d.value});

        var data = [];
        for (var i = 0, l = 24; i < l; i++) {
            date.setHours(i,0,0);
            data.push({
                'value': Math.floor(Math.random() * (value_max + 1)),
                'axis': d3.time.format("%Y-%m-%d %H:%M:%S")(date)
            })
        }
        return data;
    }

    var w = 730, h = 350,  vis = null,  g,  current,  duration = 700,  ease = "cubic-out";
    $scope.draw = function draw(id,lineChartData) {
        if (!$scope.data.visitors_traffic.benchmark_one) return;

        if (id == 'benchmark1') {
            var data = $scope.data.visitors_traffic.benchmark_one;
        } else {
            var data = $scope.data.visitors_traffic.benchmark_two ? $scope.data.visitors_traffic.benchmark_two : $scope.generateData();
        }

        // interval
        var parseDate = d3.time.format("%Y-%m-%d").parse, data_type = 'interval'
        if (!parseDate(data[0].axis)) {
            // one day
            parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse, data_type = 'one_day';
            var curDate = parseDate(data[0].axis)
            var maxDate = curDate;
            maxDate.setHours(23)
        }

        // sort by date
        data = data.sort(function(a, b) {
            return parseDate(a.axis) - parseDate(b.axis);
        });

        var margin = {top:30, left: 30, right: 30};
        var y = d3.scale.linear().range([0 + margin.top, h - margin.top]);
        y.domain([0, d3.max($scope.benchmark_concat, function(d) {return d.value})]);

        var x_line = d3.time.scale()
            .range([0 + margin.left, w - margin.right])

        if (data_type!='one_day')
            x_line
                .domain(d3.extent(data, function(d) {return parseDate(d.axis)}));
        else 
            x_line.domain([parseDate(data[0].axis), maxDate])
        var line = d3.svg.line()
          .x(function(d) { return x_line(parseDate(d.axis)); })
          .y(function(d) { return -1 * y(d.value); });

        var xAxis = d3.svg.axis()
          .scale(x_line)
          .orient("bottom");

        var vis = d3.select("#entity-chart").select("svg").select("g");

        if (vis.empty()) {
            // add x axis only first time
            vis = d3.select("#entity-chart")
             .append("svg:svg")
             .attr("viewBox", "0 0 " + w + " " + h)
             .attr("preserveAspectRatio", "xMidYMid");

            g = vis.append("svg:g")
              .attr("transform", "translate(0, 350)");

            vis.append("g")
              .attr("transform", "translate(0," + (h - 20) + ")")
              .call(xAxis);
        }
                
        g.append("svg:path")
            .attr("class", id)
            .transition().duration(duration).ease(ease)
            .attr("d", line(data));
                            
        g.selectAll("dot")
            .data(data)
            .enter().append("circle")
            .attr("class", id)
            .attr("r", 4)
            .style("fill", function(d) {
                if (id == 'benchmark2') return '#FFF';
                return '#F01850';
            })
            .style("stroke", function(d) {
                if (id == 'benchmark2') return '#FFF';
                return '#F01850';
            })
            .on("mouseout", Tooltip.mouseout)
            .on("mouseover", Tooltip.mouseover)
            .attr("cx", function(d) {
                return x_line(parseDate(d.axis));
            })
            .attr("cy", 0)
            .transition().duration(duration).ease(ease)
            .attr("cy", function(d) { return -1 * y(d.value); });
                
        current = id;
    };

    $scope.removeData = function removeData(id) {
        d3.selectAll("circle."+id)
            .transition().duration(duration).ease(ease)
            .attr("cy", 0)
            .attr("r", 0)
            .remove();
        d3.selectAll("path."+id).remove();
    };

    $scope.removeAllData = function removeData() {
        d3.select("#entity-chart").select("svg").remove();
    };

    $scope.benchmarksCheckbox =  function(id) {
        if (jQuery('#'+id).is(":checked")) {
            jQuery('#'+id).parent().addClass("active");
            $scope.draw(id);
        } else {
            $scope.removeData(id);
            jQuery('#'+id).parent().removeClass("active");
        }
    };

    $scope.pageInit = function pageInit(lineChartData) {
        jQuery('#Scoring-Metric-1').addClass("first").attr("checked", "checked").parent().addClass("active");
        var id = jQuery('.sub-metric-checkbox.first').attr("id");
        // max y axis
        if (!$scope.data.visitors_traffic.benchmark_two) {
            $scope.benchmark_concat = $scope.data.visitors_traffic.benchmark_one;
        } else {
            $scope.benchmark_concat = $scope.data.visitors_traffic.benchmark_two
                .concat($scope.data.visitors_traffic.benchmark_one);
        }
        // set benchmark1 by default
        $scope.benchmarksCheckbox('benchmark1');
        $scope.benchmarksCheckbox('benchmark2');
    };
    
    
    $scope.masonry = function(){
        jQuery('.grid').masonry({
           // options
           itemSelector: '.grid-item',

       });
    };
        
    $scope.get_report();

    $scope.checkBenchmark =  function(id) {
        if ($scope[id]) {
            $scope.draw(id);
        } else {
            $scope.removeData(id);
        }
    };

    $scope.pageInit = function(lineChartData) {
        jQuery('#Scoring-Metric-1').addClass("first").attr("checked", "checked").parent().addClass("active");
        var id = jQuery('.sub-metric-checkbox.first').attr("id");
        // max y axis
        if (!$scope.data.visitors_traffic.benchmark_two) {
            $scope.benchmark_concat = $scope.data.visitors_traffic.benchmark_one;
        } else {
            $scope.benchmark_concat = $scope.data.visitors_traffic.benchmark_two
                .concat($scope.data.visitors_traffic.benchmark_one);
        }
        // set benchmark1 by default
        $scope.checkBenchmark('benchmark1');
        $scope.checkBenchmark('benchmark2');
    };

    $('#reportrange').on('apply.daterangepicker', function(ev, picker) {
        var start = picker.startDate.format('YYYY-MM-DD');
        var end = picker.endDate.format('YYYY-MM-DD');
        $scope.get_report(start,end);
    });    
}]);
