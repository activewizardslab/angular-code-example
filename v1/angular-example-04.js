/**
 * Created by nethen on 10.08.2015.
 */


app.controller("MainController", function ($scope, $http, $filter) {
    // Time selection part

    // Array for picked months in first date picker
    $scope.ids = [];

    // Arrat for picked months in additional date picker
    $scope.additionalIds = [];

    // Copies of ids and additionalIds for tracking changed in date selection
    $scope.idsCopy = [];
    $scope.additionalIdsCopy = [];

    // Constants for data picking
    $scope.currentMonth = new Date().getMonth();
    $scope.currentYear = new Date().getFullYear();

    // Class name for selected month
    $scope.clsClicked = "time-range-item-clicked";

    // Class for disabled month
    $scope.clsDisabled = "time-range-item-disabled";

    $scope.selectedYear = $scope.currentYear;

    // Months labels for date picking
    $scope.timeRangeItems = [
        {value: "Jan"},
        {value: "Feb"},
        {value: "Mar"},
        {value: "Apr"},
        {value: "May"},
        {value: "Jun"},
        {value: "Jul"},
        {value: "Aug"},
        {value: "Sep"},
        {value: "Oct"},
        {value: "Nov"},
        {value: "Dec"}
    ];

    // Year range settings for year select
    $scope.yearRange = {
        to: $scope.currentYear,
        from: 1995
    };

    $scope.dateFormat = 'yyyy-MM-dd';

    // object used for drag selection in dragSelection directive
    $scope.changed = {
        "time-range": false,
        "time-range-additional": false
    };

    $scope.cache = {
        usage: [
            {label: 'ESP', value: 0, color: '#ff774d'},
            {label: 'Carters', value: 0, color: '#d5d5d5'}
        ],
        response: [
            {label: 'ESP', value: 0, color: '#ff774d'},
            {label: 'Carters', value: 0, color: '#d5d5d5'}
        ],
        feedback: [
            {label: 'Not Delivery', value: 0},
            {label: 'ETA', value: 0},
            {label: 'Fees', value: 0},
            {label: 'Time Delivery', value: 0},
            {label: 'Packaging', value: 0}
        ],
        feedbackPie: [
            {label: '', value: 0, color: "#fe9474", img: '/static/img/happy.svg'},
            {label: '', value: 0, color: "#ff774d", img: '/static/img/sad.svg'},
        ],
        breakingPoint: [
            {label: '', value: 0, color: 'green', width: 80, group: 1},
            {label: 'Other', value: 0, color: "#ffded4", group: 2},
            {label: 'ETA', value: 0, color: "#ffbba7", group: 2},
            {label: 'Fees', value: 0, color: "#ffa98f", group: 2},
            {label: 'Time delivery', value: 0, color: "#fe9474", group: 2},
            {label: 'Packaging', value: 0, color: "#ff774d", group: 2}
        ],
        aov: [
            {label: 'happy', value: 0, color: "#fe9474", img: '/static/img/happy.svg'},
            {label: 'sad', value: 0, color: "#ff774d", img: '/static/img/sad.svg'},
        ],
        delivery: {
            happy: {days: 0, users: 0},
            sad: {days: 0, users: 0}
        }

    };

    $scope.cache.order_emails = 0;
    $scope.cache.order_widget_click = 0;

    $scope.itemClass = ".time-range-item";

    $scope.additionalPickerId = "#time-range-additional";

    $scope.pickerId = "#time-range";

    // Param to replace when building queries urls
    $scope.urlParam = "vendor";

    // Function for options generation
    $scope.range = function (from, to) {
        var result = [];
        for (var i = to; i >= from; i--) {
            result.push(i);
        }
        return result;
    };

    //
    $scope.picker = $("#additional-date-wrap");

    // Selection change callback
    $scope.selectionChanged = function () {
        var months = $($scope.pickerId).find($scope.itemClass);
        var year = $scope.selectedYear.trim();

        if (year == $scope.currentYear) {
            $("#additional-date-wrap").hide();
            $scope.disableMonths(months, $scope.currentMonth, $scope.clsDisabled);
            changeButtonText();
        }
        else if (parseInt(year) + 1 === $scope.currentYear) {
            $scope.enableMonths(months, $scope.clsDisabled);
            $scope.disableMonths($($scope.additionalPickerId).find($scope.itemClass), $scope.currentMonth, $scope.clsDisabled);
        }
        else {
            $scope.enableMonths(months, $scope.clsDisabled);
            $scope.enableMonths($($scope.additionalPickerId).find($scope.itemClass), $scope.clsDisabled)
        }
        $scope.resetSelection();
    };

    // Make month disable by adding class
    $scope.disableMonths = function (months, currentMonth, cls) {
        for (var i = 11; i > currentMonth; i--) {
            $(months[i]).addClass(cls);
        }
    };

    // Reset month styles and selection arrays
    $scope.resetSelection = function () {
        $scope.additionalIds.splice(0, $scope.additionalIds.length);
        $scope.ids.splice(0, $scope.ids.length);
        $scope.enableMonths($($scope.pickerId).find($scope.itemClass), $scope.clsClicked);
        $scope.enableMonths($($scope.additionalPickerId).find($scope.itemClass), $scope.clsClicked);
    };

    // Remove class from selectors
    $scope.enableMonths = function (months, cls) {
        for (var i = 0; i < 12; i++) {
            $(months[i]).removeClass(cls);
        }
    };

    // 'Add picker' button callback
    $scope.showAdditionalPicker = function () {
        for (var i = 0; i < $scope.additionalIds.length; i++) {
            $scope.additionalIds[i].removeClass($scope.clsClicked);
        }
        $scope.additionalIds.splice(0, $scope.additionalIds.length);
        $scope.picker.toggle("fast", changeButtonText);

    };

    var changeButtonText = function () {
        var buttonSpan = $("#additional-date span");
        if ($scope.picker.css("display") !== 'block') {
            buttonSpan.text("Show next year");
        }
        else {
            buttonSpan.text("Hide next year");
        }
    };

    // Set start and end of picked time range
    // and get days count between start and end
    $scope.getTimeRange = function () {
        var range = {
            start: 0,
            end: 0
        };
        var monthNumber = null;
        var tmpDate;


        var MILISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

        if ($scope.ids.length > 0) {
            range.start = new Date($scope.selectedYear, $scope.indexOfMonth($scope.ids[0][0].innerText));
        }
        else {
            if ($scope.additionalIds.length > 0) {
                range.start = new Date($scope.yearPlusOffset($scope.selectedYear, 1), $scope.indexOfMonth($scope.additionalIds[0][0].innerText));
            }
        }

        if ($scope.additionalIds.length > 0) {
            selectEnd($scope.additionalIds, $scope.yearPlusOffset($scope.selectedYear, 1));
        }
        else {
            selectEnd($scope.ids, $scope.selectedYear);
        }

        // Set date of range end
        function selectEnd(arrayOfIds, year) {
            monthNumber = $scope.indexOfMonth(arrayOfIds[arrayOfIds.length - 1][0].innerText);
            if (year == $scope.currentYear && monthNumber == $scope.currentMonth) {
                tmpDate = new Date();
            }
            else {
                tmpDate = new Date(
                    year,
                    monthNumber + 1, 0);
            }
            range.end = new Date(tmpDate.getFullYear(), tmpDate.getMonth(), tmpDate.getDate());
        }

        range.end.setHours(20, 59, 59);

        var params = {};
        params.days = Math.ceil((range.end - range.start) / MILISECONDS_IN_DAY);
        params.end_date = range.end;
        return params;
    };

    // Move year value by offset
    $scope.yearPlusOffset = function (year, offset) {
        return parseInt(year) + offset;
    };

    // Find index of month
    $scope.indexOfMonth = function (month) {
        for (var i = 0; i < $scope.timeRangeItems.length; i++) {
            if ($scope.timeRangeItems[i].value.toUpperCase() == month) {
                return i;
            }
        }
    };

    // Make month disabled by adding $scope.clsDisabled
    function disable() {
        $scope.disableMonths($($scope.pickerId).find($scope.itemClass), $scope.currentMonth, $scope.clsDisabled);
    }

    // Disable month after page rendered
    setTimeout(disable, 500);

    // Check equality of 2 arrays
    function equals(arrayFrom, arrayTo) {
        var i = arrayTo.length;
        if (arrayFrom.length !== i) {
            return false;
        }

        while (i--) {
            if (arrayFrom[i] != arrayTo[i]) {
                return false;
            }
        }
        return true;
    }

    // Make copy of array
    function copy(arrayFrom, arrayTo) {
        arrayTo = [];
        arrayFrom.forEach(function (item) {
            arrayTo.push(item.clone());
        });
    }

    // Select current month and update data
    $scope.initSelection = function () {
        var elem = $($($scope.pickerId).find($scope.itemClass)[$scope.currentMonth]);
        elem.addClass($scope.clsClicked);
        $scope.ids.push(elem);
        $scope.updateCharts();
    };


    /*
     *   Charts part
     */

    // Types of qieries for queryFactory
    $scope.queryTypes = {
        order: "/analytics/v1/" + $scope.urlParam + "/engagement/order",
        shipping: "/analytics/v1/" + $scope.urlParam + "/engagement/shipping",
        sms: "/analytics/v1/" + $scope.urlParam + "/engagement/sms",
        messaging: "/analytics/v1/" + $scope.urlParam + "/engagement/messaging",
        service_channel: "/analytics/v1/" + $scope.urlParam + "/service_channel",
        satisfaction: "/analytics/v1/" + $scope.urlParam + "/user_feedback/satisfaction",
        concerns: "/analytics/v1/" + $scope.urlParam + "/user_feedback/concerns",
        delivery: "/analytics/v1/" + $scope.urlParam + "/user_feedback/delivery",
        average_order_value: "/analytics/v1/" + $scope.urlParam + "/user_feedback/average_order_value"
    };

    // Check if selection changed, then update if it is.
    $scope.updateCharts = function () {
        if ($scope.ids.length == 0 && $scope.additionalIds.length == 0) {
            return;
        }

        if (equals($scope.idsCopy, $scope.ids) && equals($scope.additionalIdsCopy, $scope.additionalIds)) {
            return;
        }

        copy($scope.ids, $scope.idsCopy);
        copy($scope.additionalIds, $scope.additionalIdsCopy);
        $scope.changed = {
            "time-range": false,
            "time-range-additional": false
        };

        // get months
        // make query
        // get date
        // send data to redraw
        $scope.redraw();
    };

    // Redrwa charts
    $scope.redraw = function () {
        var tmp = {};
        $scope.clearCharts();
        $scope.setEngagementData("carters");
        $scope.setMessagingData("carters");
        $scope.setCustomerData("carters");
        $scope.drawCircleProgress();
    };
    // Delete charts
    $scope.clearCharts = function () {
        $(".circular-progress").empty();
        $(".chart").remove();
        $(".feedback svg").remove();
        $(".feedback-pie svg").remove();
        $("#aov").find("svg").remove();
    };

    // Get data for @arg {string} vendor order
    $scope.getData = function (hasParams, queryType, vendor, callback) {
        var url = $scope.urlFactory(queryType, vendor);
        var params = null;
        if (hasParams) {
            params = $scope.getTimeRange();
            params.url = url;
            $scope.addUrlParameters(params);
            url = params.url;
        }
        $http({method: "GET", url: url}).then(function (response) {
            callback(response.data.data);
        }, function (response) {
            return "Error";
        });
    };

    // Factory for query urls
    $scope.urlFactory = function (queryType, vendor) {
        return $scope.queryTypes[queryType].replace($scope.urlParam, vendor);
    };

    // Functions for getting data

    // Set data for Engagement charts
    $scope.setEngagementData = function (vendor) {
        $scope.getData(true, "order", vendor, function (data) {
            $scope.cache.order_emails = data.order_emails;
            if (typeof data.order_widget_click != "undefined") {
                $scope.cache.order_widget_click = data.order_widget_click;
            }
            else {
                $scope.cache.order_widget_click = 0;
            }
            $scope.cache.total_order_emails = data.total_order_emails;

            $scope.circles[1].max($scope.cache.total_order_emails);

            $scope.circles[1].setValue($scope.cache.order_emails);
            $scope.circles[2].setValue($scope.cache.order_widget_click);
        });

        $scope.getData(true, "sms", vendor, function (data) {
            $scope.cache.users_opt_in = data.users_opt_in;

            $scope.circles[3].setValue($scope.cache.users_opt_in);
        });

        $scope.getData(true, "shipping", vendor, function (data) {
            if (typeof data.shipment_widget_click != "undefined") {
                $scope.cache.shipment_widget_click = data.shipment_widget_click;
            }
            else {
                $scope.cache.shipment_widget_click = 0;
            }
            $scope.cache.shipment_emails = data.shipment_emails;
            $scope.cache.total_shipment_emails = data.total_shipment_emails;

            $scope.circles[4].setValue($scope.cache.shipment_widget_click);

            $scope.circles[5].max($scope.cache.total_shipment_emails);
            $scope.circles[5].setValue($scope.cache.shipment_emails);
        });

    };

    // Usage helper function
    $scope.setUsageData = function (data) {
        $scope.initUsage(data);
        $scope.usage.draw();
    };

    // Response helper function
    $scope.setResponseData = function (data) {
        $scope.initResponse(data);
        $scope.response.draw();
    };

    // Set data for all charts in Message Communication
    $scope.setMessagingData = function (vendor) {
        $scope.getData(false, "messaging", vendor, function (data) {
            var usageData = [
                {label: 'ESP', value: data.message_us, color: '#ff774d'},
                {label: 'Carters', value: data.message_shipper, color: '#d5d5d5'}
            ];

            $scope.cache.usage = usageData;

            $scope.setUsageData(usageData);
        });

        $scope.getData(true, "service_channel", vendor, function (data) {
            var responseData = [
                {label: 'ESP', value: data.conversations.ups, color: '#ff774d'},
                {label: 'Carters', value: data.conversations.carters, color: '#d5d5d5'}
            ];
            $scope.cache.response = responseData;
            $scope.setResponseData(responseData);
        });
    };


    // Set data for charts in Customer area
    $scope.setCustomerData = function (vendor) {
        $scope.getData(false, 'delivery', vendor, function (data) {
            $scope.day_diff = data.sad.days - data.happy.days;
            $scope.cache.delivery = data;
        });

        $scope.getData(false, "concerns", vendor, function (data) {
            var feedback = [
                {label: 'Not Delivery', value: data.package_damaged.users},
                {label: 'ETA', value: data.package_eta.users},
                {label: 'Fees', value: data.shipping_fees.users},
                {label: 'Time Delivery', value: data.timely_delivery.users},
                {label: 'Packaging', value: data.packaging.users}
            ];
            var breakingPoint = [
                {label: '', value: $scope.cache.delivery.happy.days, color: 'green', width: 80, group: 1},
                {label: 'Other', value: data.other_reason.days, color: "#ffded4", group: 2},
                {label: 'ETA', value: data.package_eta.days, color: "#ffbba7", group: 2},
                {label: 'Fees', value: data.shipping_fees.days, color: "#ffa98f", group: 2},
                {label: 'Time delivery', value: data.timely_delivery.days, color: "#fe9474", group: 2},
                {label: 'Packaging', value: data.packaging.days, color: "#ff774d", group: 2}
            ];

            $scope.cache.feedback = feedback;
            $scope.cache.breakingPoint = breakingPoint;

            $scope.initFeedback(feedback);
            $scope.initBreakingPoint(breakingPoint);
        });
        $scope.getData(false, "satisfaction", vendor, function (data) {
            var feedbackPie = [
                {label: '', value: data.happy, color: "#3cb878", img: '/static/img/happy_w1.svg'},
                {label: '', value: data.sad, color: "#fe9474", img: '/static/img/sad_w.svg'},
            ];

            $scope.cache.feedbackPie = feedbackPie;

            $scope.initFeedbackPie(feedbackPie);
        });
        $scope.getData(false, "average_order_value", vendor, function (data) {
            var aov = [
                {label: 'happy', value: parseInt(data.happy), color: "#3cb878", img: '/static/img/happy.svg'},
                {label: 'sad', value: parseInt(data.sad), color: "#ff774d", img: '/static/img/sad.svg'},
            ];
            data.happy = +data.happy;
            data.sad = +data.sad;

            $scope.cache.aov = aov;
            $scope.initAOV(aov);
        });
    };

    // Will be used for queries with time range
    $scope.addUrlParameters = function (params) {
        params.url += "?window_days=";
        if (params.days) {
            params.url += params.days;
        }
        else {
            params.url += 30;
        }
        params.url += "&end_date=";
        if (params.end_date) {
            params.url += $filter("date")(params.end_date, $scope.dateFormat);
        }
        else {
            params.url += $filter("date")(new Date(), $scope.dateFormat);
            new Date();
        }
    };

    /* VISUALIZATIONS */

    // Initialize charts with initial data
    function getMockData() {
        var data = {};

        data.data1 = [{label: 'ESP', value: 260, color: '#ff774d'}, {label: 'Carters', value: 400, color: '#d5d5d5'}];

        data.data2 = [{label: 'ESP', value: 200, color: '#ff774d'}, {label: 'Carters', value: 500, color: '#d5d5d5'}];

        data.data3 = [

            {label: '', value: 2.5, color: 'green', width: 80, group: 1},
            {label: 'Other', value: 5, color: "#ffded4", group: 2},
            {label: 'ETA', value: 4.7, color: "#ffbba7", group: 2},
            {label: 'Fees', value: 6.2, color: "#ffa98f", group: 2},
            {label: 'Time delivery', value: 4.7, color: "#fe9474", group: 2},
            {label: 'Packaging', value: 4.7, color: "#ff774d", group: 2}

        ];

        data.data = [
            {label: 'Not Delivery', value: 30},
            {label: 'ETA', value: 10},
            {label: 'Fees', value: 40},
            {label: 'Time Delivery', value: 5},
            {label: 'Packaging', value: 15}
        ];
        data.data4 = [

            {label: 'happy', value: 610, color: "#fe9474", img: '/static/img/happy.svg'},
            {label: 'sad', value: 500, color: "#ff774d", img: '/static/img/sad.svg'},
        ];

        data.data5 = [
            {label: 'happy', value: 610, color: "#fe9474", img: '/static/img/happy.svg'},
            {label: 'sad', value: 500, color: "#ff774d", img: '/static/img/sad.svg'},
        ];

        $scope.setUsageData(data.data1);
        $scope.setResponseData(data.data2);
        $scope.initFeedback(data.data);
        $scope.initFeedbackPie(data.data4);
        $scope.initAOV(data.data5);
        $scope.initBreakingPoint(data.data3);

        return data;
    }

    // Create usage chart
    $scope.initUsage = function (data) {

        $scope.usage = new ResponseGraph()
            .max(100)
            .step(20)
            .dataTransformation(function (d, data) {
                var v = (100 * d.value / data.reduce(function (a, b) {
                    return a + b.value
                }, 0));
                return isNaN(v) ? 0 : v.toFixed(2);
            })
            .formatTicks(function (d) {
                return d + '%';
            })
            .formatTags(function (d) {
                return d + '%';
            })
            .selector('.usage')
            .hover('true');

        $scope.usage.data(data)

    };

    // Create response chart
    $scope.initResponse = function (data) {
        $scope.response = new ResponseGraph()
            .data(data)
            .max(Math.max.apply(null, data.map(function (a) {
                return a.value;
            })) + 120)
            .step(120)
            .formatTicks(function (d) {
                return Math.ceil(d / 60) + 'hr';
            })
            .formatTags(function (d) {
                return Math.floor(d / 60) + "'" + d % 60 + '"';
            })
            .selector('.response');
    };

    // Set data for Feedback pie chart
    $scope.initFeedback = function (data) {
        $scope.drawPie = new ResponseDonutChart();
        $scope.drawPie.setValue(data);
    };

    // Set data for Feedback pie (happy/sad)
    $scope.initFeedbackPie = function (data) {
        $scope.feedbackPie = new FeedbackPie()
            .format_data(function (d, data) {
                var v = (100 * d.value / data.reduce(function (a, b) {
                    return a + b.value
                }, 0));
                return isNaN(v) ? 0 : v.toFixed(2);
            });

        $scope.feedbackPie.draw(data);
    };

    // redraws graphs with cached data
    // Set data for 'breaking point' chart
    $scope.initBreakingPoint = function (data) {
        var max = Math.max.apply(null, data.map(function (a) {
                return a.value;
            })) + 2;
        max -= max % 2;
        $scope.breakingPoint = new ResponseGraph()
            .data(data)
            .max(max)
            .step(2)
            .formatTicks(function (d) {
                return d + ' days';
            })
            .formatTags(function (d) {
                return d;
            })
            .selector('.delivery')
            .labels(true)
            .showLegend(false)
            .margin([200, 100])
            .sort(true)
            .group_icons({1: '/static/img/happy.svg', 2: '/static/img/sad.svg'});

        $scope.breakingPoint.draw();
    };

    // Set data for average order value (AOV)
    $scope.initAOV = function (data) {
        $scope.aovChart = new VerticalChart()
            .selector('#aov')
            .data(data);

        $scope.aovChart.draw();
    };

    $scope.redrawOnResize = function () {
        $scope.setUsageData($scope.cache.usage);
        $scope.setResponseData($scope.cache.response);
        $scope.initFeedback($scope.cache.feedback);
        $scope.initFeedbackPie($scope.cache.feedbackPie);
        $scope.initBreakingPoint($scope.cache.breakingPoint);
        $scope.initAOV($scope.cache.aov);

        $scope.drawCircleProgress();

        $scope.circles[1].max($scope.cache.total_order_emails);
        $scope.circles[1].setValue($scope.cache.order_emails)

        $scope.circles[2].setValue($scope.cache.order_widget_click);
        $scope.circles[3].setValue($scope.cache.users_opt_in);
        $scope.circles[4].setValue($scope.cache.shipment_widget_click);

        $scope.circles[5].max($scope.cache.total_shipment_emails);
        $scope.circles[5].setValue($scope.cache.shipment_emails);
    };

    $scope.drawCircleProgress = function () {
        $scope.circles = {};
        for (var i = 1; i <= 5; i++)
            $scope.circles[i] = new CircularProgress(i)
                .format(function (value) {
                    return value / this.max();
                })
    };

    $scope.width = $(window).width();

    d3.select(window).on('resize', function () {
        if ($scope.width != $(window).width()) {
            $scope.clearCharts();
            $scope.redrawOnResize();
        }
    });

    $scope.redrawOnResize();

    setTimeout($scope.initSelection, 500);

    $scope.exportCSV = function () {
        var csv = $scope.convertToCSV();
        var data = null;
        if (csv == null) return;

        var filename = "dashboard.csv";
        csv = 'data:text/csv;charset=utf-8,' + csv;
        data = encodeURI(csv);

        link = document.createElement('a');
        link.setAttribute('href', data);
        link.setAttribute('download', filename);
        link.click();
    };

    $scope.convertToCSV = function () {
        var columnDelimiter = ",";
        var lineDelimiter = "\n";
        //var range = $scope.getTimeRange();
        var result = "";
        var items = Object.keys($scope.cache);
        var row = "";
        var labels = "";
        for (var i = 0; i < items.length - 1; i++) {
            var item = $scope.cache[items[i]];
            if (item) {
                var itemKeys = Object.keys(item);
                if (itemKeys) {
                    if (items[i] !== "delivery") {
                        itemKeys.forEach(function (itemKey) {
                            labels += items[i] + "." + item[itemKey].label + columnDelimiter;
                            row += item[itemKey].value + columnDelimiter;
                        });
                    }
                    else {
                        var delivery = items[i];
                        labels +=  delivery + "happy.days" + columnDelimiter;
                        labels +=  delivery + "sad.days" + columnDelimiter;
                        labels +=  delivery + "happy.users" + columnDelimiter;
                        labels +=  delivery + "sad.users" + columnDelimiter;

                        row += item.happy.days + columnDelimiter;
                        row += item.sad.days + columnDelimiter;
                        row += item.happy.users + columnDelimiter;
                        row += item.sad.users + columnDelimiter;

                    }
                }
            }
            else {
                labels += items[i] + columnDelimiter;
                row += item + columnDelimiter;
            }
        }
        labels += items[items.length - 1];
        row += $scope.cache[items[items.length - 1]];

        result = labels + lineDelimiter + row;
        return result;
    };
});