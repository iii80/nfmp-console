angular.module("console",["ngAnimate","ipCookie","ui.router","ngFileUpload","angular-img-cropper","controllers","services","directives","filters","views"]).config(["$stateProvider","$urlRouterProvider","$locationProvider","$httpProvider",function(e,t,n,a){"use strict";a.defaults.headers.common={"content-type":"application/json;charset=utf-8"},a.interceptors.push("authorityInterceptor"),n.html5Mode(!0),t.otherwise(function(e){e.get("$state").go("main.channel")}),e.state("signIn",{url:"^/sign-in",controller:"signIn",templateProvider:["$templateCache",function(e){return e.get("sign-in.view.html")}]}).state("main",{url:"^/",controller:"main",templateProvider:["$templateCache",function(e){return e.get("main.view.html")}]}).state("main.channel",{url:"^/channel",controller:"channel",templateProvider:["$templateCache",function(e){return e.get("channel.view.html")}]}).state("main.channel.create",{url:"^/channel/create",controller:"channelChange",templateProvider:["$templateCache",function(e){return e.get("channel-change.view.html")}]}).state("main.channel.update",{url:"^/channel/:_id",controller:"channelChange",templateProvider:["$templateCache",function(e){return e.get("channel-change.view.html")}]}).state("main.network",{url:"^/network",controller:"network",templateProvider:["$templateCache",function(e){return e.get("network.view.html")}]}).state("main.hardware",{url:"^/hardware",controller:"hardware",templateProvider:["$templateCache",function(e){return e.get("hardware.view.html")}]})}]).run(["checkSignIn","$templateCache",function(e){e()}]),angular.module("controllers",[]),angular.module("services",[]),angular.module("directives",[]),angular.module("filters",[]),angular.module("views",[]),angular.module("controllers").controller("channelChange",["$scope","$state","$stateParams","$http",function(e,t,n,a){"use strict";e.transmitting=!1,e.action="create",e._id=n._id,e.url="",e.source="",e.remark="",e._id&&(e.action="update",e.transmitting=!0,a.get("/api/channel/"+e._id).then(function(t){var n=t.data;e._id=n.name,e.url=n.url,e.source=n.source,e.remark=n.remark,e.transmitting=!1},function(){e.$emit("notification",{type:"danger",message:"获取频道失败"})})),e.saveChannel=function(){e.transmitting=!0;var n={url:e.url,source:e.source,remark:e.remark};e._id?a.put("/api/channel/"+e._id,n).then(function(){e.$emit("notification",{type:"success",message:"更新频道成功"}),t.go("main.channel",null,{reload:"main.channel"})},function(){e.$emit("notification",{type:"danger",message:"创建频道失败"})}):a.post("/api/channel",n).then(function(){e.$emit("notification",{type:"success",message:"创建频道成功"}),t.go("main.channel",null,{reload:"main.channel"})},function(){e.$emit("notification",{type:"danger",message:"创建频道失败"})})}}]),angular.module("controllers").controller("channel",["$scope","$state","$stateParams","$http",function(e,t,n,a){"use strict";e.transmitting=!1,e.deleteChannelId="",e.channel=[],e.translate=function(e){var t=e.match(/^(\w+)\:\/\//);if(!t||!t[1])return"其他";switch(t[1]){case"rtmp":return"rtmp";case"http":var n=e.match(/\.(\w+)$/);return n&&n[1]?n[1]:"其他";default:return t[1]}},a.get("/api/channel").then(function(t){var n=t.data;e.channel=n}),e.deleteChannel=function(){e.transmitting=!0,a["delete"]("/api/channel/"+e.deleteChannelId).then(function(){return $("#deleteModal").modal("hide"),e.transmitting=!1,e.channel=_.reject(e.channel,{name:e.deleteChannelId}),e.$emit("notification",{type:"success",message:"删除频道成功"})},function(){e.$emit("notification",{type:"danger",message:"删除频道失败"})})}}]),angular.module("controllers").controller("hardware",["$scope","$state","$stateParams","$http","$interval",function(e,t,n,a,i){"use strict";function r(){c=new Chart($("#transmitChart").get(0).getContext("2d"),{type:"line",options:{tooltips:{enabled:!1},legend:{display:!1},elements:{line:{borderWidth:1}},animation:{duration:0}}}),l=new Chart($("#receiveChart").get(0).getContext("2d"),{type:"line",options:{tooltips:{enabled:!1},legend:{display:!1},elements:{line:{borderWidth:1}},animation:{duration:0}}})}function o(t){if(s[0]){var n=moment().format("hh:mm:ss");_.map(s,function(e,a){e.transmit.labels.push(n),e.transmit.labels.shift(),e.transmit.datasets[0].data.push(t[a].transmit),e.transmit.datasets[0].data.shift(),e.receive.labels.push(n),e.receive.labels.shift(),e.receive.datasets[0].data.push(t[a].receive),e.receive.datasets[0].data.shift()}),e.updateChart()}else s=_.map(t,function(t,n){return e.chartHeader[n]=t.name,{transmit:{labels:["00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00"],datasets:[{data:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}]},receive:{labels:["00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00"],datasets:[{data:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}]}}})}e.cpuUsage=0,e.cpuTotal=0,e.cpuModel="",e.memUsage=0,e.memTotal="",e.chartHeader=[],e.network=[];var s=[];e.select=0;var c,l,u=!1;e.updateChart=function(t){"number"==typeof t&&(e.select=t),c.data=s[e.select].transmit,l.data=s[e.select].receive,c.update(),l.update()},e.$on("$viewContentLoaded",function(){return!u&&(r(),void(u=!0))}),i(function(){a.get("/api/hardware").then(function(t){var n=t.data;e.cpuUsage=_.floor(n.cpu.usage),e.cpuAmount=n.cpu.amount,e.cpuModel=n.cpu.model,e.memUsage=_.floor(n.mem.usage/n.mem.total*100),e.memTotal=_.floor(n.mem.total),o(n.network)})},1e3)}]),angular.module("controllers").controller("main",["$scope","$state",function(e,t){"use strict";"main"===t.current.name&&t.go("main.channel")}]),angular.module("controllers").controller("network",["$scope","$state","$stateParams","$http",function(e,t,n,a){"use strict";e.transmitting=!1,e.network=[],a.get("/api/network").then(function(t){var n=t.data;e.network=n})}]),angular.module("controllers").controller("signIn",["$scope","$timeout","$state","$http",function(e,t,n,a){"use strict";function i(){e.wrong=!1}e.transmitting=!1,e.password="",e.autoSignIn=!1,e.wrong=!1,e.hasKeyValue=!1,e.keyMac="",e.keyValue="",e.username="",a.get("/api/account/key").then(function(t){var n=t.data;n?e.keyMac=n:e.hasKeyValue=!0}),e.$watch(["keyValue","account","password"],i,!0),e.keyForm=function(){e.transmitting=!0,a.put("/api/account/key",{keyValue:e.keyValue}).then(function(){e.hasKeyValue=!0,e.transmitting=!1},function(n){var a=n.data;_.get(a,"error.code")&&(e.wrong=!0),e.animateShake=!0,t(function(){e.animateShake=!1,e.transmitting=!1},600)})},e.signIn=function(){e.transmitting=!0,a.put("/api/account/sign-in",{username:e.username,password:e.password}).then(function(){n.go("main")},function(n){var a=n.data;_.get(a,"error.code")&&(e.wrong=!0),e.animateShake=!0,t(function(){e.animateShake=!1,e.transmitting=!1},600)})}}]),angular.module("services").factory("authorityInterceptor",["$q","$injector",function(e,t){"use strict";return{responseError:function(n){return 401===n.status&&n.data&&n.data.error&&t.get("$state").go("signIn"),e.reject(n)}}}]),angular.module("services").factory("checkSignIn",["$rootScope","$state","ipCookie",function(e,t,n){"use strict";return function(){e.$on("$stateChangeStart",function(e,a,i,r,o){n("consoleSid")||"signIn"===a.name||(e.preventDefault(),t.go("signIn"))})}}]),angular.module("directives").directive("ndNavigation",["$templateCache","$rootScope","$state","$timeout","$http","$filter",function(e,t,n,a,i,r){return{restrict:"E",template:e.get("navigation.view.html"),link:function(e,r){function o(){a(function(){$(".sub-list").each(function(){var e=$(this);e.children(".item").hasClass("active")?e.siblings(".item").addClass("active select"):e.slideUp("fast",function(){e.siblings(".sub-list-heading").removeClass("select")}).siblings(".sub-list-heading").removeClass("active")})})}e.notFoundPages=!1,e.notFoundContents=!1,e.auth={},e.categories=[],e.user={},e.signOut=function(){i.put("/api/account/sign-out").then(function(){n.go("signIn")},function(){e.$emit("notification",{type:"danger",message:"退出登录失败"})})},t.$on("$stateChangeSuccess",function(){a(function(){o()})}),t.$on("mainCategoriesUpdate",function(){loadCategories()}),t.$on("mainUserUpdate",function(){account.reset(),loadUser()}),$(".navigation").on("click",".sub-list-heading",function(){var e=$(this);e.hasClass("select")?e.siblings(".sub-list").slideUp("fast",function(){$(this).siblings(".sub-list-heading").removeClass("select")}):e.siblings(".sub-list").slideDown("fast",function(){$(this).siblings(".sub-list-heading").addClass("select")}),$(".sub-list:visible").not(e.siblings(".sub-list")).slideUp("fast",function(){$(this).siblings(".sub-list-heading").removeClass("select")})})}}}]),angular.module("directives").directive("ndNotification",["$timeout","$rootScope",function(e,t){return{replace:!0,link:function(n){function a(){i=!0,e(function(){r-- >0?a():(i=!1,n.notificationShow=!1)},1e3)}var i,r;t.$on("notification",function(e,t){r=3,n.type=t.type,n.message=t.message,n.notificationShow=!0,i||a()})}}}]);