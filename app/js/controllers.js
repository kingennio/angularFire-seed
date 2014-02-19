'use strict';

/* Controllers */

angular.module('swarmSched.controllers', [])
    .controller('SetupWizardController', ['$scope', '$rootScope', '$routeParams', 'FBURL', '$firebase', '$location',
        function ($scope, $rootScope, $routeParams, FBURL, $firebase, $location) {
            $scope.setup = $rootScope.newSetup; // to make setupview.html work within setupwizard.html

            $scope.generateSetupName = function() {
                $scope.setup.name = $rootScope.generateTimestamp();
            };

            $scope.generateSetupName();

            $scope.timeFormat = /^([01]\d|2[0-3]):?([0-5]\d)$/

            $scope.validateSetup = function() {
                var appliances = $rootScope.newSetup.applianceProfiles;

                var totalNumberOfInstances = 0;

                for (var p in appliances) {
                    var numberOfInstances = appliances[p].numberOfInstances;

                    totalNumberOfInstances = totalNumberOfInstances + numberOfInstances;

                    console.log(numberOfInstances)
                    console.log(appliances[p].instances.length)

                    while (numberOfInstances > appliances[p].instances.length) {
                        var instance = {
                            name: $rootScope.profiles.applianceProfiles[p] + (1 + appliances[p].instances.length),
                            startTime: '00:00',
                            endTime: '23:59'
                        };
                        appliances[p].instances.push(instance);
                    }
                    while (numberOfInstances < appliances[p].instances.length) {
                        appliances[p].instances.pop()
                    }
                }
                if (totalNumberOfInstances == 0) {
                    return false; // TODO: does not make the wizard stop!
                }
            };

            $scope.postSetup = function() {
                $rootScope.setups.$add($scope.newSetup); // $rootScope.setups is initialized because the first loaded partial is setuplist.html
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
            };
    }])

    .controller('SetupListController', ['$scope', '$rootScope', '$routeParams', 'FBURL', '$firebase',
        function ($scope, $rootScope, $routeParams, FBURL, $firebase) {
            var uid = $rootScope.auth.user.uid; // e.g.: simplelogin:3. In https://swarmsched.firebaseio.com/'s JSON
                                                // simplelogin:3 would be an object under /users.

            var setupsRef = new Firebase(FBURL + '/users/' + uid + '/setups');
            var stagingRef = new Firebase(FBURL + '/stagingJobs');

            $rootScope.setups = $firebase(setupsRef);

            $rootScope.setups.$on('loaded', function() {
                console.log('setups loaded...')
            })

            $scope.cloneSetup = function(setup) {
                $scope.cloneSetup2(setup, $rootScope.newSetup);
            }

            $scope.cloneSetup2 = function(origSetup, destSetup) {
                angular.copy(origSetup, destSetup);

                for (var p in destSetup.applianceProfiles) {
                    if (destSetup.applianceProfiles[p].numberOfInstances == 0)
                        destSetup.applianceProfiles[p].instances = [];
                }

                for (var p in destSetup) {
                    if (p.indexOf('$') == 0 || p == 'runs') delete destSetup[p];
                }
            }

           $scope.runSetup = function(setup) {
               var clone = new Object();

               $scope.cloneSetup2(setup, clone);

               clone['user'] = $rootScope.auth.user.uid;

               var setupKey = setup.$id;

               clone['setup'] = setupKey;

               var jobRef = stagingRef.push(clone);
               var result = jobRef.child('result');

               setup['jobRef'] = jobRef;
               setup['running'] = true;

               result.on('value', function(snapshot) {
                   if (!snapshot.val()) return; // the first time it sends null! So once cannot be used!

                   result.off();
                   var id = snapshot.name();
                   var value = snapshot.val();
                   jobRef.remove();
                   var runs = $rootScope.setups.$child(setupKey + '/runs');
                   runs.$add({
                       result: value,
                       name: $rootScope.generateTimestamp()
                   });

                   delete setup['running'];
                   delete setup['jobRef'];

                   var date = new Date();
                   $rootScope.messages.push(date.getFullYear() + '-' + $rootScope.pad(date.getMonth() + 1, 2) + '-' + $rootScope.pad(date.getDate(), 2) + ' ' + $rootScope.pad(date.getHours(), 2) + '.' + $rootScope.pad(date.getMinutes(), 2) + ": run available!");
               });
           }

           $scope.abortRun = function(setup) {
               setup['jobRef'].remove();
               delete setup['running'];
               delete setup['jobRef'];
           };

           $scope.getStagingJobUrl = function(stagingJob) {
               var url = FBURL + '/stagingJobs/' + stagingJob;
               return url;
           };

           $scope.countFields = function(obj) {
               if (obj == undefined || obj == null) {
                   return 0;
               }
               return Object.keys(obj).length;
           };
    }])

    .controller('SolarProfilesController', ['$scope', 'FBURL', '$firebase', function($scope, FBURL, $firebase) {
        var solarProfilesRef = new Firebase(FBURL + '/profiles1/solarProfiles');
        $scope.solarProfiles = $firebase(solarProfilesRef);
    }])

    .controller('TariffProfilesController', ['$scope', 'FBURL', '$firebase', function($scope, FBURL, $firebase) {
        var tariffProfilesRef = new Firebase(FBURL + '/profiles1/tariffProfiles');
        $scope.tariffProfiles = $firebase(tariffProfilesRef);
    }])

    .controller('LoadProfilesController', ['$scope', 'FBURL', '$firebase', function($scope, FBURL, $firebase) {
        var loadProfilesRef = new Firebase(FBURL + '/profiles1/loadProfiles');
        $scope.loadProfiles = $firebase(loadProfilesRef);
    }])

    .controller('ApplianceProfilesController', ['$scope', 'FBURL', '$firebase', function($scope, FBURL, $firebase) {
        var applianceProfilesRef = new Firebase(FBURL + '/profiles1/applianceProfiles');
        $scope.applianceProfiles = $firebase(applianceProfilesRef);
    }])

    .controller('HomeController', ['$scope', 'syncData', function($scope, syncData) {
      syncData('syncedValue').$bind($scope, 'syncedValue');
   }])

    .controller('InitialController', ['$scope', function($scope) {
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
      $scope.createMode = false;

      $scope.login = function(cb) {
         console.log("LoginCtrl.login");
         $scope.signing = true;
         $scope.err = null;
         if( !$scope.email ) {
            $scope.err = 'Please enter an email address';
            $scope.signing = false;
         }
         else if( !$scope.pass ) {
            $scope.err = 'Please enter a password';
            $scope.signing = false;
         }
         else {
            loginService.login($scope.email, $scope.pass, function(err, user) {
               console.log("loginService.login.cb");
               $scope.signing = false;
               $scope.err = err? err + '' : null;
               if( !err ) {
                  cb && cb(user);
                  $location.path('/setuplist');
               }
            });
         }
      };

      $scope.logout = function() {
         console.log("logout");
         $scope.err = null;
         loginService.logout();
         $location.path('/setuplist');
      };

      $scope.createAccount = function() {
         $scope.signing = true;
         $scope.err = null;
         if( assertValidLoginAttempt() ) {
            loginService.createAccount($scope.email, $scope.pass, function(err, user) {
               $scope.signing = false;
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
         } else {
            $scope.signing = false;
         }
      };

      function assertValidLoginAttempt() {
         if( !$scope.email ) {
            $scope.err = 'Please enter an email address';
         }
         else if( !$scope.pass ) {
            $scope.err = 'Please enter a password';
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