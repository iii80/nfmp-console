/**
 * 拦截无权限请求
 */
angular.module('services').factory('authorityInterceptor', ['$q', '$injector',
  function ($q, $injector) {
    'use strict';

    return {
      responseError: function (rejection) {
        if (rejection.status === 401 && rejection.data && rejection.data.error) {
          $injector.get('$state').go('signIn');
        }

        return $q.reject(rejection);
      }
    };
  }
]);