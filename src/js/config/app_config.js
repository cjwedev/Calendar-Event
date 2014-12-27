/**
 * config/app_config.js
 *
 * keeps the configuration method for the app
 */
angular.module(_APP_).config( ['snapRemoteProvider', function( snapRemoteProvider) {

    snapRemoteProvider.globalOptions = {
        disable: 'right'
        // ... others options
    }
}]);