(function () {


  function WmhcEmailDirective(){

    return {
      restrict: 'A',
      scope: {
        label: '@',
        email: '@'
      },
      template:
        '<a class="wmhc-email-link" ng-href="mailto:{{email}}@wmhc.be"><span class="wmhc-email-icon"></span></a>'
    };

  }

  // Inject dependencies
  WmhcEmailDirective.$inject = [];

  // Assign
  angular.module('app')
    .directive('wmhcEmail', WmhcEmailDirective);

})();
