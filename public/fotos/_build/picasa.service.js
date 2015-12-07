(function () {


  function PicasaService($http, $q, $log) {

    var self = this;

    var url = 'https://picasaweb.google.com/data/feed/api/user/';

    this._parsePicasaAlbumResponse = function(response) {

      var albums = [];

      if (response.data && response.data.feed && response.data.feed.entry) {

        for (var i=0; i < response.data.feed.entry.length; i++){

          var album = response.data.feed.entry[i];

          if (album.gphoto$albumType && album.gphoto$albumType.$t === 'ProfilePhotos') {
            continue;
          }

          var entry = {
            published: null,
            title: '',
            summary : '',
            id: '',
            photos: 0,
            thumbnail: null
          };

          if (album.published && album.published.$t) {
            entry.published = album.published.$t;
          }

          if (album.title && album.title.$t) {
            entry.title = album.title.$t;
          }

          if (album.summary && album.summary.$t) {
            entry.summary = album.summary.$t;
          }

          if (album.gphoto$id && album.gphoto$id.$t) {
            entry.id = album.gphoto$id.$t;
          }

          if (album.gphoto$numphotos && album.gphoto$numphotos.$t) {
            entry.photos = album.gphoto$numphotos.$t;
          }

          if (album.media$group.media$content &&
                album.media$group.media$content.length &&
                album.media$group.media$content.length > 0) {
            entry.thumbnail = album.media$group.media$content[0].url;
          }

          albums.push(entry);
        }
      }
      return albums;
    };


    this._parsePicasaAlbumContentResponse = function (response) {

      var photos = [];

      if (response.data && response.data.feed && response.data.feed.entry) {


        for (var i=0; i < response.data.feed.entry.length; i++){

          var photo = response.data.feed.entry[i];

          var entry = {
            url : null
          };

          if (photo.content && photo.content.src) {
            entry.url = photo.content.src;
          }

          photos.push(entry);
        }

      }

      return photos;

    };


    this.getAlbums = function(user) {

      return $http
          .get(url + user + '?alt=json')
          .then(
            function(data){
              return self._parsePicasaAlbumResponse(data);
            },
            function(err){
              $log.error(err);
              return $q.reject(err);
            });
    };


    this.getPhotos = function(user, albumId){
      return $http
        .get(url + user + '/albumid/' + albumId + '?alt=json')
        .then(
          function(data){
            return self._parsePicasaAlbumContentResponse(data);
          },
          function(err){
            $log.error(err);
            return $q.reject(err);
          });
    };

  }

  // Inject dependencies
  PicasaService.$inject = ['$http', '$q', '$log'];

  // Assign
  angular.module('app')
    .service('PicasaService', PicasaService);

})();
