
angular.module('swarmSched.service.firebase', ['firebase'])

// a simple utility to create references to Firebase paths
//   .factory('swarmFirebase', ['$firebase', 'Firebase', 'FBURL', function($firebase, Firebase, FBURL) {
//      /**
//       * @function
//       * @name firebaseRef
//       * @param {String|Array...} path
//       * @return a Firebase instance
//       */
//      //var firebaseUserRef = new Firebase(FBURL.concat('users/ennio'));
//      var firebaseSetupsRef = new Firebase(FBURL + '/users/ennio/setups');
////        $firebase(firebaseSetupsRef).$on('loaded', function () {
////            var keys = $firebase(firebaseSetupsRef).$getIndex();
////            keys.forEach(function (key, i) {
////                console.log(i, key); // prints items in order they appear in Firebase
////            })
////        })
//      return  {
//          getSetups : function() {
//              return $firebase(firebaseSetupsRef);
//          },
//
//          runSetup: function(newSetup) {
//               newSetup.$add({});
//          },
//
//          addSetup : function(newSetup, callback) {
//              var result;
//              var promise = $firebase(firebaseSetupsRef).$add(newSetup);
//              promise.then(function(res) {
//                  firebaseSetupsRef.once('child_added', function(snapshot) {
//                      result = snapshot.name();
//                      console.log(result);
//                  })
//              })
//              promise.resolve;
//
//              var keys = $firebase(firebaseSetupsRef).$getIndex();
//              keys.forEach(function(key, i) {
//                  console.log(i, key); // prints items in order they appear in Firebase
//              });
//              return result;
//          }
//      }
//   }])

    // a simple utility to create references to Firebase paths
     .factory('firebaseRef', ['Firebase', 'FBURL', function(Firebase, FBURL) {
        /**
         * @function
         * @name firebaseRef
         * @param {String|Array...} path
         * @return a Firebase instance
         */
            return function(path) {
                return new Firebase(pathRef([FBURL].concat(Array.prototype.slice.call(arguments))));
            }
    }])

   // a simple utility to create $firebase objects from angularFire
   .service('syncData', ['$firebase', 'firebaseRef', function($firebase, firebaseRef) {
      /**
       * @function
       * @name syncData
       * @param {String|Array...} path
       * @param {int} [limit]
       * @return a Firebase instance
       */
      return function(path, limit) {
         var ref = firebaseRef(path);
         limit && (ref = ref.limit(limit));
         return $firebase(ref);
      }
   }]);

function pathRef(args) {
   for(var i=0; i < args.length; i++) {
      if( typeof(args[i]) === 'object' ) {
         args[i] = pathRef(args[i]);
      }
   }
   return args.join('/');
}