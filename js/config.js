var gameId = 2060;
var sdkToken = localStorage.getItem("sdkAccessToken");
var loginToken = localStorage.getItem("loginAccessToken");
var protocol = window.location.protocol;
var hostname = window.location.hostname;
var secretKey = ""; //接口key 
var isDev = hostname.indexOf("test.q1.com") > -1 || hostname.indexOf("dev.q1.com") > -1; //判断是否测试环境
var apiDomain = ""; // 接口域名
var thinkingAppId = ""; //数数appid
var appleRedirectURI = ""; //苹果回调地址
var areaData = [];//选择大区
var payUrl = '';//充值地址
var environment = 4;//登录环境
var appKey = 'abcdabcd';
var fingerprintId = '' //浏览器指纹id
var codeSecretKey = '';
if (isDev) {
  // apiDomain = "https://ops-api-ea-test.q1.com/api/points-mall";
  // apiDomain = "https://ld-points-mall-api.dev.q1op.com/api/points-mall";
  apiDomain = "https://ops-api-ea-test.q1.com/api/points-mall";
  secretKey = "12345678";
  areaData = [
    { name: "Asia Server", url: 'actapi.dev.q1op.com', gameVersion: '2060-LOCAL-DEV' },
    // { name: "EA Server", url: 'actapi.dev.q1op.com', gameVersion: '2131-LOCAL-DEV-US' },
  ]
  thinkingAppId = '5362a7e2a0de4734862795a441a5c9a5'
  payUrl = 'https://epicwar-ea-test.q1.com/pay/';
  appleRedirectURI = 'https://epicwar-ea-test.q1.com/activity/integral/'
  environment = 1
  appKey = '445632d819954fea9885d40efd7bb066';
  codeSecretKey = '123456789'
} else {
  apiDomain = "https://ops-api-ea.q1.com/api/points-mall";
  secretKey = "65440f5ea7ec11ef9a69-001dd8b71d1d";
  areaData = [
    { name: "Asia Server", url: "actapi-sa.q1.com", gameVersion: "2060-EA-ZS", },
    // { name: "EA Server", url: "actapi-ea.q1.com", gameVersion: "2131-US-ZS", },
  ]
  thinkingAppId = 'a24d241cad1d40119f9195ae52e32fe3'
  payUrl = '/pay/index.html';
  appleRedirectURI = 'https://epicwar-ea.q1.com/activity/integral/'
  environment = 0
  appKey = '445632d819954fea9885d40efd7bb066';
  codeSecretKey = '820e5d835b7b11ef947c001dd8b71d1d'
}
