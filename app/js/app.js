'use strict';

// Declare app level module which depends on filters, and services
angular.module('swarmSched',
        ['swarmSched.routes', 'swarmSched.filters', 'swarmSched.services', 'swarmSched.directives', 'swarmSched.controllers',
            'rcWizard', 'rcForm', 'rcDisabledBootstrap', 'waitForAuth', 'routeSecurity', 'ngAnimate'])

    // version of this seed app is compatible with angularFire 0.6
    // see tags for other versions: https://github.com/firebase/angularFire-seed/tags
    .constant('version', '0.6')

    // where to redirect users if they need to authenticate (see module.routeSecurity)
    .constant('loginRedirectPath', '/login') // setting loginRedirectPath to /initial causes infdif (infinite digest) error in angularJS!?!

    // your Firebase URL goes here
    .constant('FBURL', 'https://swarmsched.firebaseio.com')

    .run(['loginService', '$rootScope', '$location', 'FBURL', function (loginService, $rootScope, $location, FBURL) {
        // establish authentication
        $rootScope.auth = loginService.init('/login');
        $rootScope.FBURL = FBURL;
        $rootScope.messages = [];
    }])
