// define controller for wizard
var SampleWizardController = ['$scope', '$q', '$timeout',
function ($scope, $q, $timeout) {
  
  $scope.user = {};
  
  $scope.saveSetup = function() {
    var deferred = $q.defer();
    
    $timeout(function() {
      deferred.resolve();
    }, 5000);
    
    return deferred.promise;
  };
  
  $scope.postSetup = function() {
    alert('Completed!');
  }
}];