'use strict';

/* Controllers */

angular.module('swarmSched.controllers', [])
    .controller('SetupWizardController', ['$scope', '$rootScope', '$routeParams', 'FBURL', '$firebase', '$location',
        function ($scope, $rootScope, $routeParams, FBURL, $firebase, $location) {
            if (Object.keys($rootScope.clonedSetup).length > 0) {
                $scope.setup = $rootScope.clonedSetup;
                $scope.setup.name = $rootScope.generateTimestamp();
                $rootScope.clonedSetup = new Object();
            } else {
                $scope.setup = {
                    name: $rootScope.generateTimestamp(),
                    applianceProfiles: {},
                    upperPowerThreshold: 2000
                };

                for (var p in $rootScope.profiles.tariffProfiles) {
                    $scope.setup.tariffProfile = p;
                    break;
                }

                for (p in $rootScope.profiles.solarProfiles) {
                    $scope.setup.solarProfile = p;
                    break;
                }

                for (p in $rootScope.profiles.loadProfiles) {
                    $scope.setup.loadProfile = p;
                    break;
                }

                var applianceProfiles = $rootScope.profiles.applianceProfiles;
                for (var p in applianceProfiles) {
                    $scope.setup.applianceProfiles[p] = {
                        id: p,
                        numberOfInstances: 0,
                        instances: []
                    }
                }
            }

            $scope.timeFormat = /^([01]\d|2[0-3]):?([0-5]\d)$/

            $scope.validateSetup = function() {
                var appliances = $scope.setup.applianceProfiles;

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
                $rootScope.setups.$add($scope.setup); // $rootScope.setups is initialized because the first loaded partial is setuplist.html
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
            });

            $scope.cloneSetup = function(origSetup, destSetup) {
                angular.copy(origSetup, destSetup);

                for (var p in destSetup.applianceProfiles) {
                    if (destSetup.applianceProfiles[p].numberOfInstances == 0)
                        destSetup.applianceProfiles[p].instances = [];
                }

                for (var p in destSetup) {
                    if (p.indexOf('$') == 0 || p == 'runs') delete destSetup[p];
                }
            };

            $scope.cloneOptions = function(orig, dest) {
                angular.copy(orig, dest);
            };

            $scope.runningOptions = new Object();
            $scope.runningSetup = new Object();

            $scope.initRunningOptions = function() {
                $scope.runningOptions.scale = 0.1;
                $scope.runningOptions.genderRatio = 0.5;
                $scope.runningOptions.levyAlpha = 1.5;
                $scope.runningOptions.temperature = 1;
                $scope.runningOptions.runningTime = 6;
                $scope.runningOptions.swarmSize = 10;
                $scope.runningOptions.totalStats = 100;
                $scope.runningOptions.strategy = 'butterfly';
            };

            $scope.initRunningOptions(); // runningOptions must be filled with valid values from the beginning,
            // otherwise, the input field in the html raise an "invalid" error

            $scope.configureRun = function (setup) {
                console.log("configureRun()");

                $scope.runningOptions = new Object();
                $scope.initRunningOptions();
                $scope.runningOptions.configuringRun = true; // for showing the right controls in the form in the html
            };

            $scope.runSetup = function(setup) {
               delete $scope.runningOptions.configuringRun;

               $scope.runningSetup = new Object();
               $scope.cloneSetup(setup, $scope.runningSetup);

               $scope.runningSetup.user = $rootScope.auth.user.uid;

               var setupKey = setup.$id;
               $scope.runningSetup.setup = setupKey;
               $scope.runningSetup.options = $scope.runningOptions;

               var clonedOptions = new Object();
               $scope.cloneOptions($scope.runningSetup.options, clonedOptions); // must clone now and cannot use directly the $scope.runningSetup.options in the on callback, because it crashes the page in Chrome!?!
               var setupName = setup.name;

               var jobRef = stagingRef.push($scope.runningSetup);
               var resultRef = new Firebase(FBURL + '/results/' + jobRef.name());

               $scope.runningOptions.jobRef = jobRef; // used by view to show the link to the staging job in firebase
               $scope.runningOptions.running = true; // for showing the right controls in the form in the html

               resultRef.on('value', function(snapshot) {
                   if (!snapshot.val()) return; // the first time it sends null! So once cannot be used!

                   resultRef.off();
                   var id = snapshot.name();
                   var value = snapshot.val();
                   jobRef.remove();
                   resultRef.remove();
                   var runs = $rootScope.setups.$child(setupKey + '/runs');
                   var run = {
                       result: value,
                       name: $rootScope.generateTimestamp(),
                       options: clonedOptions
                   };
                   runs.$add(run);

                   $scope.runningOptions = new Object(); // as a side effect $scope.runningOptions.running becomes "false"
                   $scope.initRunningOptions();

                   var date = new Date();
                   $rootScope.messages.push(date.getFullYear() + '-' + $rootScope.pad(date.getMonth() + 1, 2) + '-' + $rootScope.pad(date.getDate(), 2) + ' ' + $rootScope.pad(date.getHours(), 2) + '.' + $rootScope.pad(date.getMinutes(), 2) +
                       ": run result available for setup " + setupName);

                   // set the location.hash to the id of
                   // the element you wish to scroll to.
                   var hash = "run_" + setupKey + "_" + id;
                   $rootScope.messageHashes.push(hash);
               });
           };

           $scope.cancelRunConfiguration = function(setup) {
               $scope.runningOptions = new Object(); // also deletes $scope.runningOptions.configuringRun
               $scope.initRunningOptions();
           };

           $scope.abortRun = function(setup) {
               $scope.runningOptions.jobRef.remove();
               delete $scope.runningOptions.running;
               delete $scope.runningOptions.jobRef;
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

           $scope.generateImgUrl = function(img) {
               if (img == undefined || img == null) return '';
               return 'http://swarmjol.no-ip.biz:8283/users/' + img;
           };

           $scope.isNotANumber = function(cost) {
               return isNaN(cost);
           };

           $scope.getTypeOf = function(v) {
               return Object.prototype.toString.call(v);
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

    .controller('HomeController', ['$scope', function($scope) {}])

    .controller('InitialController', ['$scope', function($scope) {}])

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