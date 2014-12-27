/**
 * models/ng_firebase_model.js
 * created once, run everywhere in the app
 */
angular.module(_MODELS_).factory( 'ngFirebaseModel', [ '$firebase', 'firebaseModel', function( $firebase, firebaseModel){
    return $firebase( firebaseModel );
}]);
