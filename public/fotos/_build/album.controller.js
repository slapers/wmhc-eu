(function () {


  function AlbumController($scope, $log, $window, $location, PicasaService){

    // Setup variables
    $scope.photos = [];
    $scope.current = null;
    $scope.index = 0;


    $scope.openFotos = function(){
      $window.location.href = '/fotos';
    };

    // View functions
    $scope.setCurrent = function (idx){
      $scope.index = idx;
      $scope.current = $scope.photos[idx];
    };

    $scope.next = function(){
      if ($scope.index < $scope.photos.length - 1) {
        $scope.setCurrent($scope.index + 1);
      }
    };

    $scope.previous = function() {
      if ($scope.index > 0) {
        $scope.setCurrent($scope.index - 1);
      }
    };

    // Initialize
    var search = $location.search();
    if (!search.album) {
      $log.debug('No album specified..');
      return;
    }

    PicasaService.getPhotos('106879961269612845164', search.album)
      .then(function(data){
        $scope.photos = data;
        $scope.setCurrent(0);
        $log.debug(data);
      });

  }

  // Inject dependencies
  AlbumController.$inject = ['$scope', '$log', '$window', '$location', 'PicasaService'];

  // Assign
  angular.module('app')
    .controller('AlbumController', AlbumController);

})();
