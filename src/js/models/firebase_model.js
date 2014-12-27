/**
 * models/firebase_model.js
 * created once, run everywhere in the app
 */
angular.module(_MODELS_).factory( 'firebaseModel', [ function(){
    return new Firebase("https://yourfirebaseurl/");
}]);
