var rest_controller = angular.module('rest_app', []).config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
}]);

rest_controller.controller('rest-controller', function ($scope, $http) {
    $scope.filters = {};
    $scope.count=1;

    $scope.is_refresh = function(i) {
        return $scope.filters[i].rendered
    }

    $scope.range = function() {
        return Object.keys($scope.filters);
    };

    $scope.getInterconnections = function(i) {
        $scope.filters[i] = { rendered: false };
        $http.get('/bigquery/interconnections/').success(function(data) {
            $scope.interconnectList = data;
            $scope.filters[i].intercons = data;
        })
    }

    $scope.getUnitIds = function(i) {
        var name = $scope.filters[i].selectedIntercon;
        $http.get('/bigquery/units/?interconnection='+name.slice(1, name.length)).success(function(data) {
            $scope.unitIds = data;
            $scope.filters[i].unitIds = data;

        })
    }

    $scope.remove = function(i) {
        d3.select('#line-'+i).remove();
        delete $scope.filters[+i];
    }

    $scope.getMeasurement = function(i) {
        d3.selectAll('#graph-'+i+' *').remove();
        if(!$scope.graph)
            $scope.graph = new Chart(STEP, NUM_OF_STEPS)
        
        var intercon = $scope.filters[i].selectedIntercon;
        var unitId = $scope.filters[i].selectedUnitId;

        if(!$scope.filters[i].rendered) {
            $scope.graph.init($scope.count);
            $scope.graph.addRow($scope.count,intercon.slice(1, intercon.length), unitId.slice(7,unitId.length));
            $scope.count += 1;
            $scope.filters[$scope.count] = {}
        } else {
            $scope.graph.init(+i);
            $scope.graph.addRow(+i,intercon.slice(1, intercon.length), unitId.slice(7,unitId.length));
        }
        $scope.filters[i].rendered = true;
    }

    $scope.getInterconnections(1)
})