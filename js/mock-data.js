(function () {
  var host = window.location.hostname
  var params = new URLSearchParams(window.location.search)
  var forcedOn = params.get('mock') === '1' || params.get('demo') === '1'
  var forcedOff = params.get('mock') === '0' || params.get('demo') === '0'
  var autoDemoHost = /(^localhost$|^127\.0\.0\.1$|\.vercel\.app$)/.test(host)
  var enabled = !forcedOff && (forcedOn || autoDemoHost)
  var now = new Date('2026-05-27T08:00:00Z').getTime()
  var day = 24 * 60 * 60 * 1000

  function clone (value) {
    return JSON.parse(JSON.stringify(value))
  }

  function page (items, lastId, pageSize) {
    var startIndex = 0
    if (lastId) {
      var currentIndex = items.findIndex(function (item) {
        return item.id === lastId
      })
      startIndex = currentIndex >= 0 ? currentIndex + 1 : 0
    }
    return items.slice(startIndex, startIndex + (pageSize || items.length))
  }

  function gift (id, name, level, receiveStatus, goodsInfos) {
    return {
      id: id,
      solutionId: 30000 + id,
      name: name,
      titleName: name,
      icon: '',
      type: 1,
      alterType: 1,
      jumpType: 0,
      linkUrl: null,
      btnName: null,
      description: '',
      receiveStatus: receiveStatus,
      goodsInfos: goodsInfos,
      requiredLevel: level
    }
  }

  function bonus (id, name, description) {
    return {
      id: id,
      solutionId: 30000 + id,
      name: name,
      titleName: name,
      icon: '',
      type: 2,
      alterType: 1,
      jumpType: 1,
      linkUrl: payUrl || null,
      btnName: 'Upgrade Now',
      description: description,
      receiveStatus: 0,
      goodsInfos: []
    }
  }

  var actors = [
    {
      actorId: '90010001',
      actorName: 'Aurelia',
      worldId: 'S101',
      worldName: 'Asia Server S101',
      gameVersion: '2060-EA-ZS',
      userId: 'u-demo-10001',
      userName: 'demo_lord',
      points: 12880,
      exp: 18600,
      memberLevel: 4
    },
    {
      actorId: '90010002',
      actorName: 'Cassian',
      worldId: 'S128',
      worldName: 'Asia Server S128',
      gameVersion: '2060-EA-ZS',
      userId: 'u-demo-10001',
      userName: 'demo_lord',
      points: 2680,
      exp: 7200,
      memberLevel: 2
    }
  ]

  var products = [
    {
      id: 10001,
      name: 'Divine Guard Bundle',
      pic: '',
      points: 980,
      superValue: true,
      cycleTrade: true,
      tradeCount: 3,
      surplusCount: 3,
      surplusStock: 86,
      unlimitedStock: 0,
      publishTime: now - 7 * day,
      unPublishTime: now + 21 * day,
      currentTime: now,
      limitType: 0,
      limitTrade: 4,
      limitTadeValue: '0,3',
      goodsInfos: [
        { goodsName: 'Legendary Hero Shard', goodsNum: 10, goodsPic: '' },
        { goodsName: 'Speed Up 60m', goodsNum: 20, goodsPic: '' },
        { goodsName: 'Gold Chest', goodsNum: 2, goodsPic: '' }
      ]
    },
    {
      id: 10002,
      name: 'VIP Weekly Growth Pack',
      pic: '',
      points: 0,
      superValue: false,
      cycleTrade: true,
      tradeCount: 1,
      surplusCount: 1,
      surplusStock: 999,
      unlimitedStock: 1,
      publishTime: now - 3 * day,
      unPublishTime: now + 4 * day,
      currentTime: now,
      limitType: 0,
      limitTrade: 1,
      limitTadeValue: '7,1',
      goodsInfos: [
        { goodsName: 'VIP EXP', goodsNum: 300, goodsPic: '' },
        { goodsName: 'Red Diamond', goodsNum: 188, goodsPic: '' }
      ]
    },
    {
      id: 10003,
      name: 'Shrine Avatar Frame',
      pic: '',
      points: 3200,
      superValue: true,
      cycleTrade: true,
      tradeCount: 2,
      surplusCount: 2,
      surplusStock: 25,
      unlimitedStock: 0,
      publishTime: now - day,
      unPublishTime: now + 14 * day,
      currentTime: now,
      limitType: 0,
      limitTrade: 4,
      limitTadeValue: '0,2',
      goodsInfos: [
        { goodsName: 'Shrine Avatar Frame', goodsNum: 1, goodsPic: '' },
        { goodsName: 'Nameplate Ticket', goodsNum: 1, goodsPic: '' }
      ]
    },
    {
      id: 10004,
      name: 'Olympus Resource Chest',
      pic: '',
      points: 7600,
      superValue: false,
      cycleTrade: true,
      tradeCount: 1,
      surplusCount: 1,
      surplusStock: 8,
      unlimitedStock: 0,
      publishTime: now + 2 * day,
      unPublishTime: now + 30 * day,
      currentTime: now,
      limitType: 0,
      limitTrade: 4,
      limitTadeValue: '0,1',
      goodsInfos: [
        { goodsName: 'Food 1M', goodsNum: 5, goodsPic: '' },
        { goodsName: 'Wood 1M', goodsNum: 5, goodsPic: '' },
        { goodsName: 'Stone 1M', goodsNum: 5, goodsPic: '' }
      ]
    }
  ]

  var vipLevels = [
    {
      level: 1,
      name: 'Bronze',
      exp: 1000,
      currentExp: 1000,
      nextLevelName: 'Silver',
      nextLevelExp: 3000,
      givePoints: 100,
      currentLevelId: null,
      levelGiftId: 20101,
      privileges: [
        gift(20101, 'Bronze Level Pack', 1, 0, [{ goodsName: 'Speed Up 15m', goodsNum: 10, goodsPic: '' }, { goodsName: 'Red Diamond', goodsNum: 88, goodsPic: '' }]),
        bonus(20102, 'Recharge Bonus +1%', 'Bronze recharge bonus has been activated for this role.')
      ]
    },
    {
      level: 2,
      name: 'Silver',
      exp: 3000,
      currentExp: 3000,
      nextLevelName: 'Gold',
      nextLevelExp: 9000,
      givePoints: 300,
      currentLevelId: null,
      levelGiftId: 20201,
      privileges: [
        gift(20201, 'Silver Level Pack', 2, 0, [{ goodsName: 'Hero EXP 10K', goodsNum: 15, goodsPic: '' }, { goodsName: 'Red Diamond', goodsNum: 288, goodsPic: '' }]),
        bonus(20202, 'Recharge Bonus +2%', 'Silver members receive additional point rebates after recharge.')
      ]
    },
    {
      level: 3,
      name: 'Gold',
      exp: 9000,
      currentExp: 9000,
      nextLevelName: 'Platinum',
      nextLevelExp: 18000,
      givePoints: 800,
      currentLevelId: null,
      levelGiftId: 20301,
      privileges: [
        gift(20301, 'Gold Level Pack', 3, 1, [{ goodsName: 'Legendary Hero Shard', goodsNum: 20, goodsPic: '' }, { goodsName: 'Red Diamond', goodsNum: 688, goodsPic: '' }]),
        bonus(20302, 'Recharge Bonus +3%', 'Gold members receive additional point rebates after recharge.')
      ]
    },
    {
      level: 4,
      name: 'Platinum',
      exp: 18000,
      currentExp: 18600,
      nextLevelName: 'Diamond',
      nextLevelExp: 36000,
      givePoints: 1600,
      currentLevelId: 4,
      levelGiftId: 20401,
      privileges: [
        gift(20401, 'Platinum Level Pack', 4, 0, [{ goodsName: 'Divine Guard Token', goodsNum: 5, goodsPic: '' }, { goodsName: 'Red Diamond', goodsNum: 1288, goodsPic: '' }]),
        bonus(20402, 'Recharge Bonus +5%', 'Platinum members receive additional point rebates after recharge.')
      ]
    },
    {
      level: 5,
      name: 'Diamond',
      exp: 36000,
      currentExp: 18600,
      nextLevelName: 'Diamond+',
      nextLevelExp: 72000,
      givePoints: 3000,
      currentLevelId: null,
      levelGiftId: 20501,
      privileges: [
        gift(20501, 'Diamond Level Pack', 5, 0, [{ goodsName: 'Mythic Equipment Chest', goodsNum: 1, goodsPic: '' }, { goodsName: 'Red Diamond', goodsNum: 2888, goodsPic: '' }]),
        bonus(20502, 'Recharge Bonus +8%', 'Diamond members receive additional point rebates after recharge.')
      ]
    }
  ]

  var tradeRecords = [
    { id: 401, createTime: now - day, points: 980, name: 'Divine Guard Bundle' },
    { id: 402, createTime: now - 3 * day, points: 0, name: 'VIP Weekly Growth Pack' },
    { id: 403, createTime: now - 6 * day, points: 3200, name: 'Shrine Avatar Frame' }
  ]

  var pointsRecords = [
    { id: 501, changeTime: now - 2 * 60 * 60 * 1000, changeWay: 2, number: 1600 },
    { id: 502, changeTime: now - day, changeWay: 4, number: 980 },
    { id: 503, changeTime: now - 2 * day, changeWay: 1, number: 6800 },
    { id: 504, changeTime: now - 4 * day, changeWay: 6, number: 300 }
  ]

  var expRecords = [
    { id: 601, changeTime: now - 2 * 60 * 60 * 1000, level: 4, exp: 600, points: 1600 },
    { id: 602, changeTime: now - 2 * day, level: 4, exp: 2200, points: 800 },
    { id: 603, changeTime: now - 5 * day, level: 3, exp: 5400, points: 300 }
  ]

  var backpack = [
    { id: 701, creationTime: now - day, giftId: 20301, name: 'Gold Level Pack' },
    { id: 702, creationTime: now - 3 * day, giftId: 20201, name: 'Silver Level Pack' },
    { id: 703, creationTime: now - 8 * day, giftId: 20101, name: 'Bronze Level Pack' }
  ]

  function responseFor (method, url, data) {
    if (!enabled) return null
    if (url.indexOf('/actor/list?') === 0 || url.indexOf('/actor?') === 0) {
      return { code: 0, data: { defaultActorId: actors[0].actorId, actors: clone(actors) } }
    }
    if (url.indexOf('/actor/details?') === 0) {
      var actor = actors.find(function (item) {
        return String(item.actorId) === String(data && data.actorId)
      }) || actors[0]
      return { code: 0, data: clone(actor) }
    }
    if (url.indexOf('/actor/verify?') === 0) {
      return { code: 0, data: { actorInfo: { roleName: actors[0].actorName } } }
    }
    if (url.indexOf('/configCenter/v2?') === 0) {
      return { code: 0, data: { actorInfo: { roleName: actors[0].actorName }, configurations: [] } }
    }
    if (url.indexOf('/login/token?') === 0 || url.indexOf('/login/extend/token?') === 0 || url.indexOf('/login/VerifyCode?') === 0) {
      if (url.indexOf('/login/VerifyCode?') === 0) {
        var expectedCode = md5(encodeURIComponent('123456' + codeSecretKey))
        if (!data || data.code !== expectedCode) {
          return { code: 1302, data: null, msg: 'Mock verification code must be 123456' }
        }
      }
      return { code: 0, data: { accessToken: 'mock-access-token' } }
    }
    if (url.indexOf('/login/smscode?') === 0) {
      return { code: 0, data: { sent: true, code: '123456' } }
    }
    if (url.indexOf('/product/tourist?') === 0 || url.indexOf('/product?') === 0) {
      return { code: 0, data: clone(products) }
    }
    if (url.indexOf('/product/trade-record?') === 0) {
      return { code: 0, data: page(clone(tradeRecords), data && data.lastId, data && data.pageSize) }
    }
    if (url.indexOf('/product/trade?') === 0 || url.indexOf('/product/benefits/trade?') === 0 || url.indexOf('/privilege/receive-gift?') === 0) {
      return { code: 0, data: { success: true } }
    }
    if (url.indexOf('/privilege/tourist-benefits?') === 0 || url.indexOf('/privilege/benefits?') === 0) {
      return { code: 0, data: clone(vipLevels) }
    }
    if (url.indexOf('/privilege/backpack?') === 0) {
      return { code: 0, data: page(clone(backpack), data && data.lastId, data && data.pageSize) }
    }
    if (url.indexOf('/privilege/exp-record?') === 0) {
      return { code: 0, data: page(clone(expRecords), data && data.lastId, data && data.pageSize) }
    }
    if (url.indexOf('/actor/points-record?') === 0) {
      return { code: 0, data: page(clone(pointsRecords), data && data.lastId, data && data.pageSize) }
    }
    if (url.indexOf('/product/benefits?') === 0 || url.indexOf('/product/tourist-benefits?') === 0) {
      return { code: 0, data: { products: clone(products.slice(0, 2)), endTime: now + 7 * day, payNum: 300 } }
    }
    if (url.indexOf('/product/benefits/trade-record?') === 0) {
      return { code: 0, data: page(clone(tradeRecords), data && data.lastId, data && data.pageSize) }
    }
    return null
  }

  function loginDemoRole (vm) {
    loginToken = 'mock-access-token'
    localStorage.setItem('loginAccessToken', loginToken)
    vm.actorList = clone(actors)
    vm.actorId = actors[0].actorId
    vm.actorName = actors[0].actorName
    vm.worldName = actors[0].worldName
    vm.gameVersion = actors[0].gameVersion
    vm.init('init')
  }

  function prepareVerifyLogin (vm) {
    var actor = actors[0]
    vm.gameVersion = actor.gameVersion
    vm.actorId = actor.actorId
    vm.actorName = ''
    vm.worldName = actor.worldName
    vm.loginStep = 0
    vm.isThroughVerify = false
    vm.isVerifyError = false
    if (typeof vm.onDeleteLoginVerify === 'function') {
      vm.onDeleteLoginVerify(0)
    }
  }

  window.K3PointMallMock = {
    enabled: enabled,
    actors: actors,
    products: products,
    vipLevels: vipLevels,
    responseFor: responseFor,
    loginDemoRole: loginDemoRole,
    prepareVerifyLogin: prepareVerifyLogin
  }
  if (enabled && !window.thinking) {
    window.thinking = {
      init: function () {},
      track: function () {},
      setPageProperty: function () {}
    }
  }
})()
