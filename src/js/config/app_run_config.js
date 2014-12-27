/**
 * config/app_run_config.js
 *
 * stores app.run() method
 */
angular.module(_APP_)
    .run(
        [ '$rootScope', '$state', '$stateParams',
            function ($rootScope,   $state,   $stateParams ) {



                $rootScope.$state = $state;
                $rootScope.$stateParams = $stateParams;
            }
        ]
    );