/**
 * 路由表
 */
module.exports = {
  /**
   * API
   */
  '/api': {
    /**
     * 公用部分
     */
    // 当前用户帐号
    '/account': {
      '/key': {
        get: 'account.keyMac',
        put: 'account.keyValue'
      },

      '/sign-in': {
        put: 'account.signIn'
      },

      '/sign-out': {
        put: 'account.signOut'
      }
    },

    // 检查是否登录
    // '/*': {
    //   all: 'account.check'
    // },

    // 频道
    '/channel': {
      get: 'channel.list',
      post: 'channel.create',

      '/:_id': {
        get: 'channel.one',
        put: 'channel.update',
        delete: 'channel.remove'
      }
    },

    // 转码
    '/stream': {
      get: 'stream.list',
      post: 'stream.create',

      '/:_id': {
        get: 'channel.one',
        put: 'channel.update',
        delete: 'channel.remove'
      }
    },

    '/streamSwitch': {
      put: 'stream.switch'
    },

    // 网络
    '/network': {
      get: 'network.list',

      '/:network': {
        put: 'network.change'
      }
    },

    // 硬件信息
    '/hardware': {
      get: 'hardware.information'
    }
  },

  /**
   * Console 首页
   */
  '/*': {
    get: 'home'
  }
};