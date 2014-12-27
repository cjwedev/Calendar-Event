/**
 * utils/angular_missing_methods.js
 *
 * brings back needy methods which aren't supported in version 1.2 and below..
 */

if( parseFloat( angular.version.full ) <= 1.2 )
{
    /**
     * checks if the String is empty or undefined
     * @param value string
     * @returns {boolean} true if it's empty
     */
    angular.isEmpty = function( value )
    {
        return typeof value === 'undefined' || value == null || value === '';
    }

    angular.isUndefined = function(value)
    {
        return typeof value === 'undefined' || value == null;
    };

    angular.isDefined = function( value )
    {
        return !angular.isUndefined( value );
    }

    angular.isEmptyObject = function( object )
    {
        var name;

        for ( name in object ) {
            return false;
        }

        return true;

    }
}

if( angular.isUndefined( angular.isPhonegap) )
{
    angular.isPhonegap = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
}