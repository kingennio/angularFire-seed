'use strict';

/* Directives */


angular.module('swarmSched.directives', []).
    directive('appVersion', ['version', function (version) {
        return function (scope, elm, attrs) {
            elm.text(version);
        };
    }]).
    directive('onFinishRender', function ($timeout) { // http://stackoverflow.com/questions/15207788/calling-a-function-when-ng-repeat-has-finished
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                if (scope.$last === true) {
                    $timeout(function () {
                        scope.$emit(attr.onFinishRender);
                    });
                }
            }
        }
    });