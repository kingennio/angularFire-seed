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

        $rootScope.newSetup = $rootScope.newSetup || {
            applianceProfiles: {},
            upperPowerThreshold: 2000
        }

        $rootScope.profiles.$on('loaded', function() {
            for (var p in  $rootScope.newSetup.applianceProfiles)
                return;

            console.log('init profiles loaded...')

            for (p in $rootScope.profiles.tariffProfiles) {
                $rootScope.newSetup.tariffProfile = p;
                break;
            }

            for (p in $rootScope.profiles.solarProfiles) {
                $rootScope.newSetup.solarProfile = p;
                break;
            }

            for (p in $rootScope.profiles.loadProfiles) {
                $rootScope.newSetup.loadProfile = p;
                break;
            }

            var applianceProfiles = $rootScope.profiles.applianceProfiles;
            for (var p in applianceProfiles) {
                $rootScope.newSetup.applianceProfiles[p] = {
                    id: p,
                    numberOfInstances: 0,
                    instances: []
                }
            }
        })

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
    }])
