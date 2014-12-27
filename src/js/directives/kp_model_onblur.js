/* directives/kp_login_field_input.js
 *
 * This directive comes from http://plnkr.co/edit/mZyWw8?p=preview
 * We are replacing it with prefix kp, in order to avoid conflicts with ng
 * ng-model-options does the same work but lives in an unstable version.
 */
angular.module(_DIRECTIVES_).directive('kpModelOnblur', [function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            priority: 1,
            link: function (scope, element, attrs,controller) {
                if (attrs.type === 'radio' || attrs.type === 'checkbox') { return; }
                var update = function () {
                    scope.$apply(function () {
                        controller.$setViewValue(element.val().trim());
                        controller.$render();
                    });
                };
                element.off('input').off('keydown').off('change').on('focus', function () {
                    scope.$apply(function () {
                        controller.$setPristine();
                    });
                }).on('blur', update).on('keydown', function (e) {
                        if (e.keyCode === 13) {
                            update();
                        }
                    });
            }
        };
    }]);