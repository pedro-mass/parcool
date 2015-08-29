'use strict';

// Carpools controller
angular.module('carpools').controller('CarpoolsController',[
	'$scope', '$stateParams', '$location', '$modal', '$log', 'Authentication', 'Carpools',
	function($scope, $stateParams, $location, $modal, $log, Authentication, Carpools) {
		$scope.authentication = Authentication;

		$scope.registerRide = function () {
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'modules/carpools/views/register-ride.client.view.html',
				controller: 'RegisterRideController'
			});
			modalInstance.result.then(function (carpool) {
				$log.info(carpool);

				$scope.carpools.push(carpool);
				$location.path('carpools/' + carpool._id);
			}, function () {
				$log.info('Modal dismissed at: ' + new Date());
			});
		};

		$scope.joinCarpool = function(carpool) {
			//console.log($scope.authentication.user);

			carpool.riders.push($scope.authentication.user._id);

			carpool.$update(function(response) {
				console.log(response);

				$location.path('carpools/' + carpool._id);

			}, function(errorResponse) {
				carpool.riders.pop();

				$scope.error = errorResponse.data.message;
			});

		};

		// Create new Carpool
		$scope.create = function() {
			// Create new Carpool object
			var carpool = new Carpools ({
				name: this.name
			});

			// Redirect after save
			carpool.$save(function(response) {
				$location.path('carpools/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Carpool
		$scope.remove = function(carpool) {
			if ( carpool ) { 
				carpool.$remove();

				for (var i in $scope.carpools) {
					if ($scope.carpools [i] === carpool) {
						$scope.carpools.splice(i, 1);
					}
				}
			} else {
				$scope.carpool.$remove(function() {
					$location.path('carpools');
				});
			}
		};

		// Update existing Carpool
		$scope.update = function() {
			var carpool = $scope.carpool;

			carpool.$update(function() {
				$location.path('carpools/' + carpool._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Carpools
		$scope.find = function() {
			Carpools.query(function(carpools) {
				// check if they have a carpool already
				var myCarpool = findUserCarpool(carpools);
				if (myCarpool) {
					// route to summary
					$location.path('carpools/' + myCarpool._id);
				}

				$scope.carpools = carpools;

			});
		};

		function findUserCarpool(carpools) {
			for (var i=0; i<carpools.length; i++) {
				var carpool = carpools[i];

				// check driver name
				if (carpool.user._id === $scope.authentication.user._id) {
					return carpool;
				}

				// check for rider status
				for (var j=0; j<carpool.riders.length; j++) {
					var rider = carpool.riders[j];

					if (rider._id === $scope.authentication.user._id) {
						return carpool;
					}
				}
			}

			return undefined;
		}

		// Find existing Carpool
		$scope.findOne = function() {
			$scope.carpool = Carpools.get({ 
				carpoolId: $stateParams.carpoolId
			});
		};

		$scope.getRiders = function(carpool) {
			var riders = '';

			if (carpool && carpool.riders && carpool.riders.length > 0) {
				riders += carpool.riders[0].displayName;

				for (var i=1; i<carpool.riders.length; i++) {
					riders += ', ' + carpool.riders[i].displayName;
				}
			}

			return riders;
		};
	}
]);
