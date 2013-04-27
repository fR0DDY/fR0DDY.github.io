var ojApp = angular.module('ojApp', ['ojServices']);

ojApp.config(function($routeProvider) {
	$routeProvider.when('/', {controller: ojAppCtrl, templateUrl: 'oj/uva.html'} ).//
	when('/spoj', {controller: ojAppCtrl, templateUrl: 'oj/spoj.html'} ).//
	when('/uva', {redirectTo:'/'} ).//
	otherwise({redirectTo:'/'});
});


angular.module('ojServices', ['ngResource']).
	factory('Problems', function($resource){
  		return $resource('oj/:ojId.json', {}, {
    	query: {method:'GET', params:{ojId:'uva'}, isArray:true}
	});
});

function ojAppCtrl($scope, $location) {
	$scope.ojs = ['UVA', 'SPOJ'];

	//to make border appear across the entire height of screen
	var height = $(window).height();
	$('.topic-bar').height(height);

	var len = 0;
	var main = $('#main');
	var oldtopic= "introduction";
	var article = $('article');
	$scope.func = function(){
		var newTopic = this.oj.toLowerCase();
		if(newTopic === oldtopic) {
			console.log("nothing");
		}
		else{			
			article.css('visibility', 'hidden');
			$location.path(newTopic);
			article.hide();
			article.css('visibility', 'visible').delay(150);
			article.slideDown(650);
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
