/*
List of regions, subregions, countries
*/
var regions_controller = angular.module('left_panel_app', []).config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
}]);

regions_controller.controller('regions-controller', function ($scope, $http) {
	$scope.full_list = [];
	function getTotalMetrics(current_level) {
		var total = 0;
		for (var i in current_level) {
			if (current_level[i].metrics) { total += current_level[i].metrics }
			if (current_level[i].subunits) { total += getTotalMetrics(current_level[i].subunits) }
		}
		return total
	}

	function recursively(current_level) {
		for (var i in current_level) {
			if (!current_level[i].metrics) {
				current_level[i].metrics = getTotalMetrics(current_level[i].subunits);
			}
			$scope.full_list.push(current_level[i]);
			if(current_level[i].subunits) {
				recursively(current_level[i].subunits)
			}
		}
	}

	function changeMagnefier(item) {
		if (item.type=='country') {
			$('.search-panel-caption').data('level', 'single_country');
		} else {
			$('.search-panel-caption').data('level', $scope.current_level[0].type);
		}
		if (active_magnifier && zoomer != undefined) {
			// DIRTY HACK
			$('.map-panel-containment').on('mouseover', function() {
				get_magnifier();
				zoomer.on('click', click_on_manifier)
			});
		}
	}

	function getObjectByName(name, list) {
		for (var i in list) {
			if (list[i].name == name) { return list[i]; }
			if (list[i].subunits) { getObjectByName(name, list[i].subunits) }
		}
	}

	function updateData(data, name) {
		$scope.full_list = [];
		recursively(data);
		$scope.current_level = data;
		$scope.current_level.name = 'world';
		$scope.previous_level = null;

		var obj = getObjectByName(name, $scope.full_list);
		if (obj.type == 'region') {
			for (var i in $scope.full_list) {
				if (obj.continent == $scope.full_list[i].name) {
					$scope.previous_level = $scope.current_level;
					$scope.current_level = $scope.full_list[i].subunits;
					$scope.current_level.previous = $scope.previous_level;
					$scope.current_level.name = $scope.full_list[i].name;
				}
			}
		}
		return [obj, $scope.current_level.name];
	}

	$scope.getList = function() {
		$http.get("/res/geodata/country-data.json")
            .success(function(data, status, headers, config) {
				for (var i in data.data) {
					if (+data.data[i].year === currentYear) {
						$scope.full_list = [];
						$scope.current_level = data.data[i].data;
						$scope.current_level.name = 'world';
						$scope.previous_level = null;
						recursively(data.data[i].data)
					}
				}

				if (active_magnifier && zoomer != undefined) {
					$('.map-panel-containment').on('mouseover', function() {
						get_magnifier();
						zoomer.on('click', click_on_manifier)
					});
				}
			});
	};

	$scope.updateLeftPanelData = function(id, data) {
		$scope.full_list = [];
		recursively(data);
		$scope.current_level = data;
		$scope.current_level.name = 'world';
		$scope.previous_level = null;

		for (var i in $scope.full_list) {
			if ($scope.full_list[i].subunits && $scope.full_list[i].subunits[0].subunits) {
				for (var j in $scope.full_list[i].subunits) {
					for (var k in $scope.full_list[i].subunits[j].subunits) {
						if ($scope.full_list[i].subunits[j].subunits[k].id === id) {
							$scope.previous_level = $scope.current_level;
							$scope.current_level = $scope.full_list[i].subunits;
							$scope.current_level.previous = $scope.previous_level;
							$scope.current_level.name = $scope.full_list[i].name;

							m.selectContinent($scope.full_list[i], 0.5);

							$scope.previous_level = $scope.current_level;
							$scope.current_level = $scope.full_list[i].subunits[j].subunits;
							$scope.current_level.previous = $scope.previous_level;
							$scope.current_level.name = $scope.full_list[i].subunits[j].name;

							m.selectContinent($scope.full_list[i].subunits[j].subunits[k], 1);

							break;
						}
					}
				}
			}
		}
		$('.search-panel-caption').html('<span class="glyphicon glyphicon-backward"></span> Current Region: ' +
										$scope.current_level.name);
		$('.search-panel-caption').data('name', $scope.current_level.name);

		if (active_magnifier && zoomer != undefined) {
			var need_update_magnifier = true;
			$('.az-large').on('mousemove', function () {
				if (need_update_magnifier) {
					get_magnifier();
				}
				need_update_magnifier = false;
				});
			console.log($('.large').css('width'))
		}
	};

	$scope.getFollowingList = function(item, data) {
		// is necessary for timeline
		if (data) {
			$('.search-panel-caption').data('name', item);
			var current_and_previous_levels = updateData(data, item);
			item = current_and_previous_levels[0];
			if (current_and_previous_levels[1] != 'world') {
				m.selectContinent(getObjectByName(current_and_previous_levels[1], $scope.full_list), 0.5);
			}
		} else {
			$('.search-panel-caption').data('name', item.name);
		}

		if ('subunits' in item) {
			$scope.previous_level = $scope.current_level;
			$scope.current_level = item['subunits'];
			$scope.current_level.previous = $scope.previous_level;
			$scope.current_level.name = item.name;
			$('.search-panel-caption').html('<span class="glyphicon glyphicon-backward"></span> Current Region: ' +
										$scope.current_level.name);
		}

		$scope.getMetrics();

		if(item.type == 'continent' || item.type=='region')
			m.selectContinent(item, 0.5);
		if(item.type=='country')
			m.selectContinent(item, 1);
		if(item.type != 'country')
			m.highlightOff('.'+item.id);

		// is necessary for magnifier
		changeMagnefier(item);
	};

    $scope.zoomBackToWorld = function() {
    	m.zoomOutToWorld()
    };

    $scope.clearBoundaries = function() {
    	m.clearBoundaries();
    };

    $scope.zoomTo = function(item) {
		// is necessary for timeline
		$('.search-panel-caption').data('name', item.name);
		// is necessary for magnifier
		changeMagnefier(item);

		if(item.type=='country')
    		m.selectContinent(item, 1);
    	else 
    		m.selectContinent(item, 0.5);

		if(item.type != 'country')
			m.highlightOff('.'+item.id);
    };

    $scope.getMetrics = function() {
    	$http.get('/res/geodata/metrics.json')
	    	.success(function(data, status, headers, config){
				d3.json("/res/geodata/country-data.json", function(error, flag_data) {
					if (flag_data.enableMetrics) {
						for (var i in data) {
							if (+data[i].year === currentYear) {
								m.setMetrics(data[i].countries);
								break
							}
						}
						$('.search-panel-single-variant-value').css('display', 'block')
					}
				})
			})
    };

    $scope.getPrevious = function() {
		// is necessary for magnifier
		if ($('.search-panel-caption').data('level') == 'single_country') {
			$('.search-panel-caption').data('level', 'country');
		} else if ($('.search-panel-caption').data('level') == 'country') {
			$('.search-panel-caption').data('level', 'region');
		} else {
			$('.search-panel-caption').data('level', $scope.current_level[0].type);
		}
		if (active_magnifier && zoomer != undefined) {
			// DIRTY HACK
			$('.map-panel-containment').on('mouseover', function() {
				get_magnifier();
				zoomer.on('click', click_on_manifier)
			});
		}

    	if($scope.current_level.previous) {
    		$scope.current_level = $scope.current_level.previous;
			var current_level = $('.search-panel-caption').text().split(": ");
    		$('.search-panel-caption').html('<span class="glyphicon glyphicon-backward"></span> Current Region: ' +
										$scope.current_level.name);
		}

		// is necessary for timeline
		if (m.zoomLevel() == 3 || m.zoomLevel() == 4) {
			$('.search-panel-caption').data('name', current_level[current_level.length - 1]);
		} else {
			$('.search-panel-caption').data('name', 'world')
		}

		$scope.getMetrics();
    	m.zoomOut();
	};

	$scope.highlight = function(id) {
		m.highlightOn('.'+id)
	};

	$scope.highlightOff = function(id) {
		m.highlightOff('.'+id);
	};

	$scope.getList();
	$scope.getMetrics();
});

