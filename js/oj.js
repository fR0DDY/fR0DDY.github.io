var ojApp = angular.module('ojApp', ['ojServices']);

ojApp.config(function($routeProvider) {
	$routeProvider.when('/', {controller: ojAppCtrl, templateUrl: 'oj/uva.html'} ).//
	when('/spoj', {controller: ojAppCtrl, templateUrl: 'oj/spoj.html'} ).//
	when('/uva', {controller: ojAppCtrl, templateUrl: 'oj/uva.html'} ).//
	otherwise({redirectTo:'/'});
});


angular.module('ojServices', ['ngResource']).
	factory('Problems', function($resource){
  		return $resource('oj/:ojId.json', {}, {
    	query: {method:'GET', params:{ojId:'uva'}, isArray:true}
	});
});

function ojAppCtrl($scope, $location) {
	$scope.ojs = [ {name:'UVA', cls: ''},
					{name: 'SPOJ', cls: ''}];

	var oldtopic= "uva";
	
	$scope.func = function(){
		$scope.ojs.forEach(function(oj) {oj.cls = ''})
		var newTopic = this.oj.name.toLowerCase();
		if(newTopic !== oldtopic) {
			$location.path(newTopic);
			this.oj.cls = 'active';
			oldtopic = newTopic;
		}
	};
}

function UVAListCtrl($scope, Problems) {
  $scope.problems = Problems.query({ojId: "uva"});
  $scope.orderProp = 'id';
}

function SPOJListCtrl($scope, Problems) {
  $scope.problems = Problems.query({ojId: "spoj"});
  $scope.orderProp = 'id';
}
