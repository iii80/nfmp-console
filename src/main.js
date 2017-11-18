/**
 * I'm the King of the World!
 */
angular.module('console', [
  'ngAnimate',
  'ipCookie',
  'ui.router',
  'ngFileUpload',
  'angular-img-cropper',
  // 'angular-loading-bar',
  'controllers',
  'services',
  'directives',
  'filters',
  'views'
])
.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider',
  function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
    'use strict';

    // 修改默认请求头
    $httpProvider.defaults.headers.common = {'content-type': 'application/json;charset=utf-8'};

    // 拦截无权限请求
    $httpProvider.interceptors.push('authorityInterceptor');

    // 开启 HTML5 模式
    $locationProvider.html5Mode(true);

    // 将所有未匹配路由转至根目录
    $urlRouterProvider.otherwise(function ($injector) { $injector.get('$state').go('main.hardware') });

    // 路由
    $stateProvider
      // 登录
      .state('signIn', {
        url: '^/sign-in',
        controller: 'signIn',
        templateProvider: ['$templateCache', function($templateCache) {
          return $templateCache.get('sign-in.view.html');
        }]
      })

      // 控制面板
      .state('main', {
        url: '^/',
        controller: 'main',
        templateProvider: ['$templateCache', function($templateCache) {
          return $templateCache.get('main.view.html');
        }]
      })

      // 频道管理
      .state('main.channel', {
        url: '^/channel',
        controller: 'channel',
        templateProvider: ['$templateCache', function($templateCache) {
          return $templateCache.get('channel.view.html');
        }]
      })

      // 新增频道
      .state('main.channel.create', {
        url: '^/channel/create',
        controller: 'channelChange',
        templateProvider: ['$templateCache', function($templateCache) {
          return $templateCache.get('channel-change.view.html');
        }]
      })

      // 更新频道
      .state('main.channel.update', {
        url: '^/channel/:_id',
        controller: 'channelChange',
        templateProvider: ['$templateCache', function($templateCache) {
          return $templateCache.get('channel-change.view.html');
        }]
      })

      // 转码管理
      .state('main.streams', {
        url: '^/streams',
        controller: 'streams',
        templateProvider: ['$templateCache', function($templateCache) {
          return $templateCache.get('streams.view.html');
        }]
      })

      // 新增转码
      .state('main.streams.create', {
        url: '^/streams/create',
        controller: 'streamsChange',
        templateProvider: ['$templateCache', function($templateCache) {
          return $templateCache.get('streams-change.view.html');
        }]
      })

      // 更新转码
      .state('main.streams.update', {
        url: '^/streams/:_id',
        controller: 'streamsChange',
        templateProvider: ['$templateCache', function($templateCache) {
          return $templateCache.get('streams-change.view.html');
        }]
      })

　    // 网络设置
      .state('main.network', {
        url: '^/network',
        controller: 'network',
        templateProvider: ['$templateCache', function($templateCache) {
          return $templateCache.get('network.view.html');
        }]
      })

      // 硬件信息
      .state('main.hardware', {
        url: '^/hardware',
        controller: 'hardware',
        templateProvider: ['$templateCache', function($templateCache) {
          return $templateCache.get('hardware.view.html');
        }]
      })
  }
]).run(['checkSignIn', '$templateCache', function (checkSignIn) {
  // 检查用户是否登录
  checkSignIn();
}]);

/**
 * 创建 Controllers, Services, Directives, Filters 模块
 */
angular.module('controllers', []);
angular.module('services', []);
angular.module('directives', []);
angular.module('filters', []);
angular.module('views', []);