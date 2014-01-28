'use strict';

/* Controllers */

angular.module('swarmSched.controllers', [])
    .controller('SetupWizardController', ['$scope', 'firebaseRef', '$firebase',
        function ($scope, firebaseRef, $firebase) {

            $scope.timeFormat = /^([01]\d|2[0-3]):?([0-5]\d)$/

            $scope.profiles = [
                {   profileId: "washingMachine",
                    numberOfInstances: 0,
                    instances: []
                },
                {   profileId: "dishMachine",
                    numberOfInstances: 0,
                    instances: []
                },
                {   profileId: "tumbleDryer",
                    numberOfInstances: 0,
                    instances: []
                }
            ];
            $scope.tariffIndex = {id : 0};

            $scope.saveState = function() {
                for (var i = 0; i < $scope.profiles.length; ++i) {
                    var numberOfInstances = $scope.profiles[i].numberOfInstances;

                    console.log(numberOfInstances)
                    console.log($scope.profiles[i].instances.length)

                    while (numberOfInstances > $scope.profiles[i].instances.length) {
                        $scope.profiles[i].instances.push(
                            {
                                name: $scope.profiles[i].profileId + '-machine' + (1 + $scope.profiles[i].instances.length),
                                startTime: '00:00',
                                endTime: '23:59'
                            }
                        )
                    }
                    while (numberOfInstances < $scope.profiles[i].instances.length) {
                        $scope.profiles[i].instances.pop()
                    }
                }
            };

            $scope.completeWizard = function() {
                var path = "users/ennio/setups";
                    var setup = {
                        tariffId: $scope.tariffIndex.id,
                        profiles: $scope.profiles
                    }

                   var id = $firebase(firebaseRef(path)).$add(setup)
                console.log(id)
            }


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