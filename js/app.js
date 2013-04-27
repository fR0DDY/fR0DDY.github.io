'use strict';

/* App Module */

angular.module('movieCat', ['movieServices']).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/movies', {templateUrl: 'partials/movie-list.html',   controller: MovieListCtrl}).
      when('/movies/:movieId', {templateUrl: 'partials/movie-detail.html', controller: MovieDetailCtrl}).
      otherwise({redirectTo: '/movies'});
}]);
