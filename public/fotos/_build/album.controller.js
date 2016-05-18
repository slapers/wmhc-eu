(function () {


  function AlbumController($scope, $log, $window, $location, PicasaService){

    // Setup variables
    $scope.album = { photos: []};

    $scope.openFotos = function(){
      $window.location.href = '/fotos';
    };

    // Initialize
    var search = $location.search();
    if (!search.album) {
      $log.debug('No album specified..');
      return;
    }

    PicasaService.getPhotos('106879961269612845164', search.album)
      .then(function(data){
        $scope.album = data;
        $log.debug(data);
      });

  }

  // Inject dependencies
  AlbumController.$inject = ['$scope', '$log', '$window', '$location', 'PicasaService'];

  // Assign
  angular.module('app')
    .controller('AlbumController', AlbumController);

})();
