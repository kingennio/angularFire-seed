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
            .when("/home", {controller: "HomeController", templateUrl: "partials/solarprofiles.html"})
            .when("/initial", {controller: "InitialController", templateUrl: "partials/initial.html"})
            //.when("/login", {controller: "LogInController", templateUrl: "partials/login.html"})
            .when("/newSetup-simulation", {controller: "SimulationSetupController", templateUrl: "partials/newSetup-simulation.html"})
            .when("/profiles1/:profileId", {
                controller: "PowerProfileController",
                templateUrl: "partials/profile.html"
            })
            .when("/signup", {controller: "SignUpController", templateUrl: "partials/signup.html"})

            .when('/solarprofiles', {
                templateUrl: 'partials/solarprofiles.html',
                controller: 'SolarProfilesController'
            })
            .when('/tariffprofiles', {
                templateUrl: 'partials/tariffprofiles.html',
                controller: 'TariffProfilesController'
            })
            .when('/loadprofiles', {
                templateUrl: 'partials/loadprofiles.html',
                controller: 'LoadProfilesController'
            })
            .when('/applianceprofiles', {
                templateUrl: 'partials/applianceprofiles.html',
                controller: 'ApplianceProfilesController'
            })
            .when('/setupwizard', {
                authRequired: true,
                templateUrl: 'partials/setupwizard.html',
                controller: 'SetupWizardController'
            })
            .when('/setuplist', {
                authRequired: true,
                templateUrl: 'partials/setuplist.html',
                controller: 'SetupListController'

            })
            .when('/runsetup/:newSetup', {
                authRequired: true,
                templateUrl: 'partials/runsetup.html',
                controller: 'SetupListController'

            })

      $routeProvider.otherwise({redirectTo: '/initial'});
   }]);