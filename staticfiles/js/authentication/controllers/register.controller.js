/**
 * Register controller
 * @namespace crowdsource.authentication.controllers
 */

    //Steps Factory to instantiate different types
(function () {
    'use strict';

    //Steps Factory
    function StepsFactory() {};
    StepsFactory.prototype.createStepsType = function createStepsType( option ) {
      var steps = null;
      
      if( option === 'requester' ) {
        //should steps differ instatiate different amount of steps
             // $scope.steps = [
             //    'Step 1: Personal Information',
             //    'Step 2: Skill Information'
             //  ];
      } else if( option === 'worker' ) {
            steps = [
            'Step 1: Personal Information',
            'Step 2: Skill Information'
          ];
      }
      
      if( steps === null ) {
        return false;
      }
      
      return steps;
    } 

    angular
        .module('crowdsource.authentication.controllers')
        .controller('RegisterController', ['$location', '$scope', 'Authentication', 'cfpLoadingBar', '$alert',
            function RegisterController($location, $scope, Authentication, cfpLoadingBar, $alert) {

                activate();
                /**
                 * @name activate
                 * @desc Actions to be performed when this controller is instantiated
                 * @memberOf crowdsource.authentication.controllers.RegisterController
                 */
                function activate() {
                    // If the user is authenticated, they should not be here.
                    if (Authentication.isAuthenticated()) {
                        $location.url('/home');
                    }
                }

                var vm = this;

                vm.register = register;
                vm.errors = [];

                /**
                 * @name register
                 * @desc Register a new user
                 * @memberOf crowdsource.authentication.controllers.RegisterController
                 */
                function register() {
                    cfpLoadingBar.start();
                    Authentication.register(vm.email, vm.firstname, vm.lastname,
                        vm.password1, vm.password2).then(function () {

                            $location.url('/login');
                        }, function (data, status) {

                            //Global errors
                            if (data.data.hasOwnProperty('detail')) {
                                vm.error = data.data.detail;
                                $scope.form.$setPristine();
                            }

                            angular.forEach(data.data, function (errors, field) {

                                if (field == 'non_field_errors') {
                                    // Global errors
                                    vm.error = errors.join(', ');
                                    $scope.form.$setPristine();
                                } else {
                                    //Field level errors
                                    $scope.form[field].$setValidity('backend', false);
                                    $scope.form[field].$dirty = true;
                                    vm.errors[field] = errors.join(', ');
                                }
                            });

                        }).finally(function () {
                            cfpLoadingBar.complete();
                        });
                }

                var myStepsFactory = new StepsFactory();

                $scope.steps = myStepsFactory.createStepsType("worker");
                $scope.selection = $scope.steps[0];

                $scope.getCurrentStepIndex = function(){
                    // Get the index of the current step given selection
                    return _.indexOf($scope.steps, $scope.selection);
                };

                // Go to a defined step index
                $scope.goToStep = function(index) {
                    if ( !_.isUndefined($scope.steps[index]) )
                    {
                      $scope.selection = $scope.steps[index];
                    }
                };

                $scope.hasNextStep = function(){
                    var stepIndex = $scope.getCurrentStepIndex();
                    var nextStep = stepIndex + 1;
                    // Return true if there is a next step, false if not
                    return !_.isUndefined($scope.steps[nextStep]);
                };

                $scope.hasPreviousStep = function(){
                    var stepIndex = $scope.getCurrentStepIndex();
                    var previousStep = stepIndex - 1;
                    // Return true if there is a next step, false if not
                    return !_.isUndefined($scope.steps[previousStep]);
                };

                $scope.incrementStep = function() {
                    if ( $scope.hasNextStep() )
                    {
                      var stepIndex = $scope.getCurrentStepIndex();
                      var nextStep = stepIndex + 1;
                      $scope.selection = $scope.steps[nextStep];
                    }
                };

                $scope.decrementStep = function() {
                    if ( $scope.hasPreviousStep() )
                    {
                      var stepIndex = $scope.getCurrentStepIndex();
                      var previousStep = stepIndex - 1;
                      $scope.selection = $scope.steps[previousStep];
                    }
                };

            }]);

     

})();