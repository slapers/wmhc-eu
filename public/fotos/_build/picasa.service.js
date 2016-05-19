(function () {


  function PicasaService($http, $q, $log) {

    var self = this;

    var url = 'https://picasaweb.google.com/data/feed/api/user/';

    // Docs: https://developers.google.com/picasa-web/docs/2.0/reference#Parameters
    // Valid sizes : 94, 110, 128, 200, 220, 288, 320, 400, 512, 576, 640, 720, 800, 912, 1024, 1152, 1280, 1440, 1600
    var albumThumbsize = 400;
    var albumImgsizemax = 1600;
    var photoThumbsize = 220;
    var photoImgsizemax = 1600;

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

          if (album.media$group.media$thumbnail &&
                album.media$group.media$thumbnail.length &&
                album.media$group.media$thumbnail.length > 0) {

            entry.thumbnail = {
              url: album.media$group.media$thumbnail[0].url,
              width: album.media$group.media$thumbnail[0].width,
              height: album.media$group.media$thumbnail[0].height
            };
          }

          albums.push(entry);
        }
      }
      return albums;
    };


    this._parsePicasaAlbumContentResponse = function (response) {

      var title = 'Fotos';
      var photos = [];

      if (response.data && response.data.feed) {

        if (response.data.feed.title && response.data.feed.title.$t){
          title = response.data.feed.title.$t;
        }

        if (response.data.feed.entry) {


          for (var i = 0; i < response.data.feed.entry.length; i++) {

            var photo = response.data.feed.entry[i];

            var entry = {
              img: null,
              thumb: null
            };

            if (photo.content && photo.content.src) {
              entry.img = photo.content.src;
            }
            if (photo.media$group.media$thumbnail &&
              photo.media$group.media$thumbnail.length &&
              photo.media$group.media$thumbnail.length > 0) {

              entry.thumb = photo.media$group.media$thumbnail[0].url;
            }

            photos.push(entry);
          }

        }
      }
      return {
        title: title,
        photos: photos
      };

    };


    this.getAlbums = function(user) {

      return $http
          .get(url + user + '?alt=json&thumbsize=' + albumThumbsize + '&imgmax=' + albumImgsizemax)
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
        .get(url + user + '/albumid/' + albumId + '?alt=json&thumbsize=' + photoThumbsize +
          '&imgmax=' + photoImgsizemax)
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
