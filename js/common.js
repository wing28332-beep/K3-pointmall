

function queryParams (obj, url) {
  var result = ''
  for (var item in obj) {
    if ((obj[item] !== null || obj[item] !== undefined) && String(obj[item])) {
      result += ('&' + item + '=' + obj[item])
    }
  }
  var sign = ''
  if (result) {
    result = result.slice(1)
  }
  if (url === '/configCenter/v2?' || url === '/login/token?') {
    sign = md5(encodeURIComponent(obj2str(obj) + secretKey))
  }
  return sign !== '' ? obj2str(obj) + '&sign=' + sign : result
}


function rand (num) {
  if (num == null) num = 9999;
  return Math.floor(Math.random() * num) + Math.random();
}
function logout () {
  localStorage.removeItem('sdkAccessToken')
  localStorage.removeItem('loginAccessToken')
  sdkToken = loginToken = ''
  vue.isMask = vue.isPopup = false
  vue.onLogin()

}
function getBaseHeaders (data) {
  var timestamp = new Date().getTime();
  var sign = md5(encodeURIComponent('appid=2060' + '&body=' + JSON.stringify(data) + '&timestamp=' + timestamp + secretKey));
  var postBaseHeaders = {
    appId: gameId,
    timestamp: timestamp,
    sign: sign,
  };
  return postBaseHeaders;
}
function uuid () {
  let uuid = 'xxxx-xxxx-xxxx-xxxx-xxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
  return uuid
}

function obj2str (args) {
  var keys = []
  for (var key in args) {
    keys.push(key)
  }
  keys = keys.sort() // 参数名ASCII码从小到大排序（字典序）；
  var newArgs = {}
  keys.filter((x) => x.toLowerCase() !== 'sign').forEach(function (key) {
    if (args[key] !== 'undefined' && args[key] !== undefined) {
      // 如果参数的值为空不参与签名；
      newArgs[key.toLowerCase()] = args[key] // 参数名区分大小写；
    }
  })

  var string = ''
  for (var k in newArgs) {
    string += '&' + k + '=' + newArgs[k]
  }
  string = string.substr(1)
  return string
}

function urlRequest (name) {
  try {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
    var r = window.location.search.substr(1).match(reg)
    if (r != null) return decodeURIComponent(r[2])
    return ''
  } catch (e) {
    return ''
  }
}

function apiCodeTips (jsonCode, cb, responseJSON) {
  if (jsonCode === 0 || jsonCode === 1012 || jsonCode === 1300 || jsonCode === 2001) {
    cb && cb(responseJSON)
    if (jsonCode === 1300) {
      vue.$toast.fail(vue.$t(`returnTips${jsonCode}`))
    }
  } else if (jsonCode === 401) {
    logout()
    vue.$toast.fail(vue.$t(`returnTips${jsonCode}`))
  } else if (jsonCode === 1302) {
    vue.isVerifyError = true
  } else if (jsonCode === 1301) {
    vue.$toast.fail(vue.$t(`returnTips4002`))
  } else {
    vue.$toast.fail(vue.$t(`returnTips${jsonCode}`))
  }
}

// 创建一个函数来获取浏览器指纹
async function getFingerprint() {
  fingerprintId = Fingerprint2.get(function(components) {
    const values = components.map(function(component,index) {
       if (index === 0) { //把微信浏览器里UA的wifi或4G等网络替换成空,不然切换网络会ID不一样
          return component.value.replace(/\bNetType\/\w+\b/, '')
       }
       return component.value
     })
     // 生成最终id murmur   
     const murmur = Fingerprint2.x64hash128(values.join(''), 31);
     fingerprintId = murmur || uuid ()
     console.log('fingerprintId', fingerprintId)
     localStorage.setItem('fingerprintId', fingerprintId)
 });
 
}
if (!localStorage.getItem('fingerprintId')) {
  getFingerprint()
} else {
  fingerprintId =  localStorage.getItem('fingerprintId')
}

function getCookie (name) {
  try {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg)) {
      var _value = decodeURIComponent(arr[2]);
      return _value;
    }
    else
      return "";
  }
  catch (e) { return "" }
}
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
      const context = this;
      const later = () => {
          timeout = null;
          func.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
  };
}

function getGeneratedRewardImage (name, type) {
  var value = String(name || '').toLowerCase()
  if (value.indexOf('shrine') > -1 || value.indexOf('avatar') > -1 || value.indexOf('frame') > -1) {
    return 'images/generated/reward-avatar-frame.svg'
  }
  if (value.indexOf('olympus') > -1 || value.indexOf('divine') > -1 || value.indexOf('guard') > -1 || value.indexOf('shield') > -1) {
    return 'images/generated/reward-divine-guard.svg'
  }
  if (value.indexOf('point') > -1 || value.indexOf('diamond') > -1 || value.indexOf('rebate') > -1 || value.indexOf('bonus') > -1) {
    return 'images/generated/reward-points-chest.svg'
  }
  if (type === 'vip' || value.indexOf('vip') > -1 || value.indexOf('gift') > -1 || value.indexOf('pack') > -1 || value.indexOf('privilege') > -1) {
    return 'images/generated/reward-vip-gift.svg'
  }
  return 'images/generated/reward-generic.svg'
}

function setFallbackImage (event, name, type) {
  if (!event || !event.target) return
  var image = event.target
  if (image.dataset.fallbackApplied === '1') return
  image.dataset.fallbackApplied = '1'
  image.src = getGeneratedRewardImage(name, type)
}
