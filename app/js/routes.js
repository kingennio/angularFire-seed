"use strict";

angular.module('swarmSched.routes', ['ngRoute'])

   // configure views; the authRequired parameter is used for specifying pages
   // which should only be available while logged in
   .config(['$routeProvider', function($routeProvider) {
      /*$routeProvider.when('/home', {
         templateUrl: 'partials/home.html',
         controller: 'HomeCtrl'
      });*/

      $routeProvider.when('/chat', {
         templateUrl: 'partials/chat.html',
         controller: 'ChatCtrl'
      });

      $routeProvider.when('/account', {
         authRequired: true, // must authenticate before viewing this page
         templateUrl: 'partials/account.html',
         controller: 'AccountCtrl'
      });

      $routeProvider.when('/login', {
         templateUrl: 'partials/login.html',
         controller: 'LoginCtrl'
      });

        $routeProvider.when('/tariffs', {
            templateUrl: 'partials/tariffs.html',
            controller: 'TariffCtrl'
        });
        $routeProvider
            .when("/home", {controller: "HomeController", templateUrl: "partials/solar.html"})
            //.when("/login", {controller: "LogInController", templateUrl: "partials/login.html"})
            .when("/setup-simulation", {controller: "SimulationSetupController", templateUrl: "partials/setup-simulation.html"})
            .when("/profiles/:profileId", {
                controller: "PowerProfileController",
                templateUrl: "partials/profile.html"
            })
            .when("/signup", {controller: "SignUpController", templateUrl: "partials/signup.html"})

            .when('/appliance-profiles', {
                templateUrl: 'partials/profiles.html',
                controller: 'TariffCtrl'
            })
            .when('/setupwizard', {
                templateUrl: 'partials/setupwizard.html',
                controller: 'SetupWizardController'
            })
            .when('/setuplist', {
                templateUrl: 'partials/setuplist.html',
                controller: 'SetupWizardController'

            })


      $routeProvider.otherwise({redirectTo: '/setuplist'});
   }]);