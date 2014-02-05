'use strict';

/* Controllers */

angular.module('swarmSched.controllers', [])
    .controller('SetupWizardController', ['$scope', '$rootScope', '$routeParams', 'FBURL', '$firebase', '$location',
        function ($scope, $rootScope, $routeParams, FBURL, $firebase, $location) {
            $scope.setup = $rootScope.newSetup; // to make setupview.html work within setupwizard.html

            $scope.timeFormat = /^([01]\d|2[0-3]):?([0-5]\d)$/

            $scope.validateSetup = function() {
                var appliances = $rootScope.newSetup.applianceProfiles;
                for (var p in appliances) {
                    var numberOfInstances = appliances[p].numberOfInstances;

                    console.log(numberOfInstances)
                    console.log(appliances[p].instances.length)

                    while (numberOfInstances > appliances[p].instances.length) {
                        appliances[p].instances.push({
                                name: $rootScope.profiles.applianceProfiles[p].id + (1 + appliances[p].instances.length),
                                startTime: '00:00',
                                endTime: '23:59'
                            })
                    }
                    while (numberOfInstances < appliances[p].instances.length) {
                        appliances[p].instances.pop()
                    }
                }
            };

            $scope.postSetup = function() {
                $rootScope.setups.$add($scope.newSetup);
                $location.path('/setuplist'); // after clicking on the Complete button it redirects to setuplist, at the end of the wizard.
                    // But the wizard raises an error, which seems irrelevant (TODO):
                    /*
                     TypeError: Cannot call method 'next' of undefined
                     at $.fn.bootstrapWizard (http://localhost:63342/angularFire-seed-ennio/app/js/jquery.bootstrap.wizard.js:229:47)
                     at onForward (http://localhost:63342/angularFire-seed-ennio/app/js/rcWizard.js:81:25)
                     at http://localhost:63342/angularFire-seed-ennio/app/js/rcWizard.js:55:15
                     at http://localhost:63342/angularFire-seed-ennio/app/js/rcSubmit.js:73:13
                     at Array.forEach (native)
                     at Object.q [as forEach] (https://ajax.googleapis.com/ajax/libs/angularjs/1.2.10/angular.min.js:7:280)
                     at setSubmitComplete (http://localhost:63342/angularFire-seed-ennio/app/js/rcSubmit.js:72:19)
                     at http://localhost:63342/angularFire-seed-ennio/app/js/rcSubmit.js:120:38
                     at https://ajax.googleapis.com/ajax/libs/angularjs/1.2.10/angular.min.js:113:78
                     at e (https://ajax.googleapis.com/ajax/libs/angularjs/1.2.10/angular.min.js:33:287)	https://ajax.googleapis.com/ajax/libs/angularjs/1.2.10/angular.js:9373
                     https://ajax.googleapis.com/ajax/libs/angularjs/1.2.10/angular.js:9400
                     https://ajax.googleapis.com/ajax/libs/angularjs/1.2.10/angular.js:6836
                     https://ajax.googleapis.com/ajax/libs/angularjs/1.2.10/angular.js:13569
                     e	https://ajax.googleapis.com/ajax/libs/angularjs/1.2.10/angular.js:4109
                     https://ajax.googleapis.com/ajax/libs/angularjs/1.2.10/angular.js:4416
                     */
            }
    }])

    .controller('SetupListController', ['$scope', '$rootScope', '$routeParams', 'FBURL', '$firebase',
        function ($scope, $rootScope, $routeParams, FBURL, $firebase) {
            var setupsRef = new Firebase(FBURL + '/users/ennio/setups');
            var profilesRef = new Firebase(FBURL + '/profiles');
            var stagingRef = new Firebase(FBURL + '/stagingJobs');

            $rootScope.setups = $firebase(setupsRef);
            $rootScope.profiles = $firebase(profilesRef);

            $rootScope.newSetup = $rootScope.newSetup || { // sample json setup in
                // todo: add upperPowerThreshold.
                // E.g.:
                // "upperPowerThreshold": 2000
                applianceProfiles: {}
            }

            $scope.profiles.$on('loaded', function() {
                for (var p in  $rootScope.newSetup.applianceProfiles)
                    return;

                console.log('init profiles loaded...')

                for (p in $rootScope.profiles.tariffProfiles) {
                    $scope.newSetup.tariffProfile = ($rootScope.profiles.tariffProfiles[p])['id'];
                    break;
                }

                for (p in $rootScope.profiles.solarProfiles) {
                    $scope.newSetup.solarProfile = p;
                    break;
                }

                for (p in $rootScope.profiles.loadProfiles) {
                    $scope.newSetup.loadProfile = p;
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

            $scope.setups.$on('loaded', function() {
                console.log('setups loaded...')
            })

            $scope.cloneSetup = function(setup) {
                angular.copy(setup, $rootScope.newSetup);

                for (var p in $rootScope.newSetup.applianceProfiles) {
                    if ($rootScope.newSetup.applianceProfiles[p].numberOfInstances == 0)
                        $rootScope.newSetup.applianceProfiles[p].instances = [];
                }

                for (var p in $rootScope.newSetup) {
                    if (p.indexOf('$') == 0 || p == 'runs') delete $rootScope.newSetup[p];
                }
            }

           $scope.runSetup = function(setup) {
               $scope.cloneSetup(setup);

               var setupKey = setup.$id;
               var jobRef = stagingRef.push($rootScope.newSetup);
               var result = jobRef.child('result');


               result.on('value', function(snapshot) {
                   if (!snapshot.val()) return;

                   result.off();
                   var id = snapshot.name();
                   var value = snapshot.val();
                   jobRef.remove();
                   var runs = $rootScope.setups.$child(setupKey + '/runs');
                   runs.$add(value);
                   alert("run available!");
               });
           }
    }])

    .controller('SolarProfilesController', ['$scope', 'FBURL', '$firebase', function($scope, FBURL, $firebase) {
        var solarProfilesRef = new Firebase(FBURL + '/profiles/solarProfiles');
        $scope.solarProfiles = $firebase(solarProfilesRef);
    }])

    .controller('TariffProfilesController', ['$scope', 'FBURL', '$firebase', function($scope, FBURL, $firebase) {
        var tariffProfilesRef = new Firebase(FBURL + '/profiles/tariffProfiles');
        $scope.tariffProfiles = $firebase(tariffProfilesRef);
    }])

    .controller('ApplianceProfilesController', ['$scope', 'FBURL', '$firebase', function($scope, FBURL, $firebase) {
        var applianceProfilesRef = new Firebase(FBURL + '/profiles/applianceProfiles');
        $scope.applianceProfiles = $firebase(applianceProfilesRef);
    }])

    .controller('HomeController', ['$scope', 'syncData', function($scope, syncData) {
      syncData('syncedValue').$bind($scope, 'syncedValue');
   }])

  .controller('ChatCtrl', ['$scope', 'syncData', function($scope, syncData) {
      $scope.newMessage = null;

      // constrain number of messages by limit into syncData
      // add the array into $scope.messages
      $scope.messages = syncData('messages', 10);

      // add new messages to the list
      $scope.addMessage = function() {
         if( $scope.newMessage ) {
            $scope.messages.$add({text: $scope.newMessage});
            $scope.newMessage = null;
         }
      };
   }])

   .controller('LoginCtrl', ['$scope', 'loginService', '$location', function($scope, loginService, $location) {
      $scope.email = null;
      $scope.pass = null;
      $scope.confirm = null;
      $scope.createMode = false;

      $scope.login = function(cb) {
         $scope.err = null;
         if( !$scope.email ) {
            $scope.err = 'Please enter an email address';
         }
         else if( !$scope.pass ) {
            $scope.err = 'Please enter a password';
         }
         else {
            loginService.login($scope.email, $scope.pass, function(err, user) {
               $scope.err = err? err + '' : null;
               if( !err ) {
                  cb && cb(user);
               }
            });
         }
      };

      $scope.createAccount = function() {
         $scope.err = null;
         if( assertValidLoginAttempt() ) {
            loginService.createAccount($scope.email, $scope.pass, function(err, user) {
               if( err ) {
                  $scope.err = err? err + '' : null;
               }
               else {
                  // must be logged in before I can write to my profile
                  $scope.login(function() {
                     loginService.createProfile(user.uid, user.email);
                     $location.path('/account');
                  });
               }
            });
         }
      };

      function assertValidLoginAttempt() {
         if( !$scope.email ) {
            $scope.err = 'Please enter an email address';
         }
         else if( !$scope.pass ) {
            $scope.err = 'Please enter a password';
         }
         else if( $scope.pass !== $scope.confirm ) {
            $scope.err = 'Passwords do not match';
         }
         return !$scope.err;
      }
   }])

   .controller('AccountCtrl', ['$scope', 'loginService', 'syncData', '$location', function($scope, loginService, syncData, $location) {
      syncData(['users', $scope.auth.user.uid]).$bind($scope, 'user');

      $scope.logout = function() {
         loginService.logout();
      };

      $scope.oldpass = null;
      $scope.newpass = null;
      $scope.confirm = null;

      $scope.reset = function() {
         $scope.err = null;
         $scope.msg = null;
      };

      $scope.updatePassword = function() {
         $scope.reset();
         loginService.changePassword(buildPwdParms());
      };

      function buildPwdParms() {
         return {
            email: $scope.auth.user.email,
            oldpass: $scope.oldpass,
            newpass: $scope.newpass,
            confirm: $scope.confirm,
            callback: function(err) {
               if( err ) {
                  $scope.err = err;
               }
               else {
                  $scope.oldpass = null;
                  $scope.newpass = null;
                  $scope.confirm = null;
                  $scope.msg = 'Password updated!';
               }
            }
         }
      }

   }]);