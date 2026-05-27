function request (method, url, data, cb) {
  if (window.K3PointMallMock && window.K3PointMallMock.enabled) {
    var mockResponse = window.K3PointMallMock.responseFor(method, url, data)
    if (mockResponse) {
      setTimeout(function () {
        apiCodeTips(mockResponse.code, cb, mockResponse)
      }, 120)
      return { mock: true, url: url }
    }
  }
  if (method === 'get') {
    return $.ajax({
      url: apiDomain + url + (data || !data == false ? queryParams(data, url) : ''),
      type: 'get',
      timeout: 30000,
      headers: {
        Authorization: 'Bearer ' + loginToken,
        'Content-Language': contentLanguage ?? '',
        "points_env": getCookie("points_env")
      },
      complete: function (json) {
        if (json.statusText === 'timeout') {
          vue.$toast.fail(vue.$t(`apiTimeout`))
          vue.disabled = false
          return false
        }
        const jsonCode = json.responseJSON.code
        if ((jsonCode !== 0 || jsonCode !== 1012) && url === '/configCenter/v2?' && urlRequest('gameVersion') && urlRequest('actorId')) {
          window.history.replaceState({}, document.title, location.pathname);
        }
        if (json.responseJSON.code !== 0 && url === '/login/token?') {
          vue.isLogin = false
          sdkToken = loginToken = ''
        }
        if (json.responseJSON.code !== 0 && url === '/configCenter/v2?') {
          thinking.track('role_verification', {
            state: 'fail',
            message: json.responseJSON.msg
          })
        }
        if (json.responseJSON.code !== 1300 && url === '/login/smscode?') {
          thinking.track('obtain_login_verify', {
            state: 'fail',
            message: json.responseJSON.msg
          })
        }
        apiCodeTips(jsonCode, cb, json.responseJSON)
      }
    })
  }
  if (method = 'post') {
    if (url === '/product/trade?' || url === '/product/benefits/trade?' || url === '/privilege/receive-gift?' || url === '/login/VerifyCode?') url = url + queryParams(getBaseHeaders(data))
    return $.ajax({
      url: apiDomain + url,
      type: 'POST',
      data: JSON.stringify(data),
      dataType: "json",
      timeout: 30000, // 设置超时时间为 5 秒
      headers: {
        Authorization: 'Bearer ' + loginToken,
        'Content-Language': contentLanguage ?? '',
        "Content-Type": "application/json"
      },
      complete: function (json) {
        vue.disabled = false
        if (json.statusText === 'timeout') {
          vue.$toast.fail(vue.$t(`apiTimeout`))
          return false
        }
        const jsonCode = json.responseJSON.code
        if (jsonCode !== 0 && url.indexOf('/login/VerifyCode') !== -1) {
          thinking.track('verification_code_verification', {
            state: 'fail',
            verification_code: vue.loginVerifyVal,
            message: json.responseJSON.msg
          })
        }
        apiCodeTips(json.responseJSON.code, cb, json.responseJSON)
      }
    })
  }
}

// 根据sdktoken获取角色信息
function getSdkActorList (gameVersion, cb) {
  var data = {
    gameId: gameId,
    gameVersion: gameVersion,
    sdkToken: sdkToken
  }
  request('get', '/actor/list?', data, function (res) {
    cb && cb(res)
  })
}

// sdktoken换登录token
function getLoginToken (gameVersion, defaultRole, cb) {
  var data = {
    gameId: gameId,
    gameVersion: gameVersion,
    defaultRole: defaultRole,
    sdkToken: sdkToken,
    appId: gameId,
    timestamp: new Date().getTime()
  }
  request('get', '/login/token?', data, function (res) {
    cb && cb(res)
  })
}



// 获取角色列表
function getActorList (cb) {
  request('get', '/actor?', null, function (res) {
    cb && cb(res)
  })
}



// 获取角色详情
function getActorDetails (actorId, cb) {
  var data = {
    actorId: actorId
  }
  request('get', '/actor/details?', data, function (res) {
    cb && cb(res)
  })
}

// 校验角色 
function verifyActor (actorId, gameVersion, cb) {
  var data = {
    gameId: gameId,
    actorId: actorId,
    gameVersion: gameVersion,
  }
  request('get', '/actor/verify?', data, function (res) {
    cb && cb(res)
  })
}

// 获取验证码
function getSmsCode (data, cb) {
  request('get', '/login/smscode?', data, function (res) {
    cb && cb(res)
  })
}

// 验证码登录 /api/points-mall/login/VerifyCode
function verifyCodeLogin (data, cb) {
  request('post', '/login/VerifyCode?', data, function (res) {
    cb && cb(res)
  })
}


// token续期
function getExtendToken (userId, cb) {
  var data = {
    userId: userId
  }
  request('get', '/login/extend/token?', data, function (res) {
    cb && cb(res)
  })

}

// 登录后商品列表
function getProduct (data, cb) {

  request('get', '/product?', data, function (res) {
    cb && cb(res)
  })

}

// 游客商品列表
function getProductTourist (gameVersion, cb) {
  var data = {
    gameId: gameId,
    gameVersion: gameVersion
  }
  request('get', '/product/tourist?', data, function (res) {
    cb && cb(res)
  })
}

// 我的商品兑换记录
function getTradeRecord (data, cb) {
  request('get', '/product/trade-record?', data, function (res) {
    cb && cb(res)
  })
}

// 商品兑换
function postTrade (data, cb) {
  request('post', '/product/trade?', data, function (res) {
    cb && cb(res)
  })
}

// 读取渠道配置
function getConfigCenter (data, cb) {
  request('get', '/configCenter/v2?', data, function (res) {
    cb && cb(res)
  })
}

// 福利商品列表
function getBenefits (data, cb) {
  request('get', '/product/benefits?', data, function (res) {
    cb && cb(res)
  })
}
// 游客福利商品列表
function getTouristBenefits (data, cb) {
  request('get', '/product/tourist-benefits?', data, function (res) {
    cb && cb(res)
  })
}

// 福利商品列表
function postBenefits (data, cb) {
  request('post', '/product/benefits/trade?', data, function (res) {
    cb && cb(res)
  })
}
// 福利商品兑换记录
function getRadeRecord (data, cb) {
  request('get', '/product/benefits/trade-record?', data, function (res) {
    cb && cb(res)
  })
}
//获取国家代码
function getIpPayType (cb) {
  var gurl = `https://p-m-ea.q1.com/payment/GetPaymentCountryCode?gameId=${gameId}&jsoncallback=?`;
  $.getJSON(gurl, { q: rand(9999) }, function (json) {
    cb(json)
  })
}
// 游客获取vip中心的权益
function getVipTouristBenefits (data, cb) {
  request('get', '/privilege/tourist-benefits?', data, function (res) {
    cb && cb(res)
  })
}
// 会员背包特权
function getBackpack (data, cb) {
  request('get', '/privilege/backpack?', data, function (res) {
    cb && cb(res)
  })
}
// 会员经验明细
function getExpRecord (data, cb) {
  request('get', '/privilege/exp-record?', data, function (res) {
    cb && cb(res)
  })
}
// 积分记录
function getPointsRecord (data, cb) {
  request('get', '/actor/points-record?', data, function (res) {
    cb && cb(res)
  })
}
// 获取会员权益
function getVipBenefits (data, cb) {
  request('get', '/privilege/benefits?', data, function (res) {
    cb && cb(res)
  })
}
// 会员礼包兑换
function getVipGift (data, cb) {
  request('POST', '/privilege/receive-gift?', data, function (res) {
    cb && cb(res)
  })
}
window.getProductTourist = getProductTourist
