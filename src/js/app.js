/**
 * some globals
 *
 * app.js
 */
var _APP_         = 'family-event'
  , _CONTROLLERS_ = _APP_ + '.controllers'
  , _DIRECTIVES_  = _APP_ + '.directives'
  , _FILTERS_     = _APP_ + '.filters'
  , _MODULES_     = _APP_ + '.modules'
  , _SERVICES_    = _APP_ + '.services'
  ,_MODELS_ = _APP_ + ".models" ;

// top-level module
angular.module(_APP_, [
  // Your application's namespaced modules
   // so they won't conflict with other
   // modules. You shouldn't have to touch
   // these unless you want to.             
  _CONTROLLERS_,
  _DIRECTIVES_,
  _FILTERS_,
  _MODULES_,
  _SERVICES_,
  _MODELS_,

  // add additional modules here, such as ngAnimate
  // ngTouch, ngResource, or your own custom modules.
  // ngTouch and ngRoute are included here by default
  // installed via Bower. Don't forget to add the module
  // to your Gruntfile's bower components if you want
  // to use it!
  'ngTouch',
  'ui.router',
  'ngCookies',
  'ngCordova',
  'ngAnimate',
  'firebase',
  'snap'
]);

angular.module(_APP_)
    .run(
    [        '$rootScope', '$state', '$stateParams',
      function ($rootScope,   $state,   $stateParams) {

        // It's very handy to add references to $state and $stateParams to the $rootScope
        // so that you can access them from any scope within your applications.For example,
        // <li ui-sref-active="active }"> will set the <li> // to active whenever
        // 'contacts.list' or one of its decendents is active.
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
      }])
    .config(function(snapRemoteProvider) {
      snapRemoteProvider.globalOptions = {
        disable: 'right'
        // ... others options
      }
    });

// Create global modules. You shouldn't have to
// touch these.
angular.module(_CONTROLLERS_, []);
angular.module(_DIRECTIVES_, []);
angular.module(_FILTERS_, []);
angular.module(_MODULES_, []);
angular.module(_SERVICES_, []);
angular.module(_MODELS_, []);