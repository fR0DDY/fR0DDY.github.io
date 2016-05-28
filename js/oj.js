var ojApp = angular.module('ojApp', ['ojServices']);

ojApp.config(function($routeProvider) {
	$routeProvider.when('/', {controller: ojAppCtrl, templateUrl: 'oj/uva.html'} ).//
	when('/spoj', {controller: ojAppCtrl, templateUrl: 'oj/spoj.html'} ).//
	when('/uva', {controller: ojAppCtrl, templateUrl: 'oj/uva.html'} ).//
	when('/pe', {controller: ojAppCtrl, templateUrl: 'oj/pe.html'} ).//
	when('/codechef', {controller: ojAppCtrl, templateUrl: 'oj/codechef.html'} ).//
	when('/codeforces', {controller: ojAppCtrl, templateUrl: 'oj/codeforces.html'} ).//
	otherwise({redirectTo:'/'});
});


angular.module('ojServices', ['ngResource']).
	factory('Problems', function($resource){
  		return $resource('oj/:ojId.json', {}, {
    	query: {method:'GET', params:{ojId:'uva'}, isArray:true}
	});
});

function ojAppCtrl($scope, $location) {
	$scope.ojs = [ {name:'UVA', url: 'uva', cls: ''},
					{name: 'SPOJ', url: 'spoj', cls: ''},
					{name: 'Project Euler', url: 'pe', cls: ''},
					{name: 'Codechef', url: 'codechef', cls: ''},
					{name: 'Codeforces', url: 'codeforces', cls: ''}];

	var oldtopic= "";
	
	$scope.func = function(){
		$scope.ojs.forEach(function(oj) {oj.cls = ''});
		var newTopic = this.oj.url.toLowerCase();
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

  $scope.getURL = function(id) {
  	return "http://uva.onlinejudge.org/external/" + ~~(id / 100) + "/" + id + ".html";
  }
}

function SPOJListCtrl($scope, Problems) {
  $scope.problems = Problems.query({ojId: "spoj"});
  $scope.orderProp = 'id';

  $scope.getURL = function(id) {
  	return "https://www.spoj.com/problems/" + id;
  }
}

function PEListCtrl($scope, Problems) {
  $scope.problems = Problems.query({ojId: "pe"});
  $scope.orderProp = 'id';

  $scope.getURL = function(id) {
  	return "https://projecteuler.net/problem=" + id;
  }
}

function CodechefListCtrl($scope, Problems) {
  $scope.problems = Problems.query({ojId: "codechef"});
  $scope.orderProp = 'id';

  $scope.getURL = function(id) {
  	return "https://www.codechef.com/problems/" + id;
  }
}

function CodeforcesListCtrl($scope, Problems) {
  $scope.problems = Problems.query({ojId: "codeforces"});
  $scope.orderProp = 'id';
}
