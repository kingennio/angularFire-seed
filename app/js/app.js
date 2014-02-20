'use strict';

// Declare app level module which depends on filters, and services
angular.module('swarmSched',
        ['swarmSched.routes', 'swarmSched.filters', 'swarmSched.services', 'swarmSched.directives', 'swarmSched.controllers',
            'rcWizard', 'rcForm', 'rcDisabledBootstrap', 'waitForAuth', 'routeSecurity', 'ngAnimate'])

    // version of this seed app is compatible with angularFire 0.6
    // see tags for other versions: https://github.com/firebase/angularFire-seed/tags
    .constant('version', '0.6')

    // where to redirect users if they need to authenticate (see module.routeSecurity)
    .constant('loginRedirectPath', '/login')

    // your Firebase URL goes here
    .constant('FBURL', 'https://swarmsched.firebaseio.com')

    .run(['loginService', '$rootScope', '$location', 'FBURL', '$firebase', function (loginService, $rootScope, $location, FBURL, $firebase) {
        // establish authentication
        $rootScope.auth = loginService.init('/login');
        $rootScope.FBURL = FBURL;
        $rootScope.messages = [];

        $rootScope.profileImage = function(img) {
            return "img/" + img + ".svg";
        }

        var profilesRef = new Firebase(FBURL + '/profiles1');

        $rootScope.profiles = $firebase(profilesRef);

        $rootScope.profilesLoaded = false;

        $rootScope.profiles.$on('loaded', function() {
            console.log('init profiles loaded...');
            $rootScope.profilesLoaded = true;
        });

        $rootScope.sampleResult = $firebase(new Firebase(FBURL + '/vattelapesca'));

        $rootScope.pad = function pad(num, size) {
            var s = num+"";
            while (s.length < size) s = "0" + s;
            return s;
        };

        $rootScope.generateTimestamp = function() {
            var date = new Date();
            var timestamp = date.getFullYear() + '-' + $rootScope.pad(date.getMonth() + 1, 2) + '-' + $rootScope.pad(date.getDate(), 2) + '_' + $rootScope.pad(date.getHours(), 2) + '.' + $rootScope.pad(date.getMinutes(), 2);
            return timestamp;
        };

        $rootScope.clonedSetup = new Object(); // for passing a cloned setup from the setup list controller to the setup wizard controller
    }])
