(function () {


  function PhotoController($scope, $log, $window, PicasaService){

    // Setup variables
    $scope.albums = [];


    // View functions

    $scope.openAlbum = function (album) {
      $window.location.href = '/fotos/album/#?album=' + album.id;

    };


    // Initialize
    PicasaService.getAlbums('106879961269612845164')
      .then(function(data){
        $scope.albums = data;
      });

  }

  // Inject dependencies
  PhotoController.$inject = ['$scope', '$log', '$window', 'PicasaService'];

  // Assign
  angular.module('app')
    .controller('PhotoController', PhotoController);

})();
