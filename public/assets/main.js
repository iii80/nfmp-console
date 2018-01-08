angular.module("console",["ngAnimate","ipCookie","ui.router","ngFileUpload","angular-img-cropper","controllers","services","directives","filters","views"]).config(["$stateProvider","$urlRouterProvider","$locationProvider","$httpProvider",function(t,e,n,a){"use strict";a.defaults.headers.common={"content-type":"application/json;charset=utf-8"},a.interceptors.push("authorityInterceptor"),n.html5Mode(!0),e.otherwise(function(t){t.get("$state").go("main.hardware")}),t.state("signIn",{url:"^/sign-in",controller:"signIn",templateProvider:["$templateCache",function(t){return t.get("sign-in.view.html")}]}).state("main",{url:"^/",controller:"main",templateProvider:["$templateCache",function(t){return t.get("main.view.html")}]}).state("main.channel",{url:"^/channel",controller:"channel",templateProvider:["$templateCache",function(t){return t.get("channel.view.html")}]}).state("main.channel.create",{url:"^/channel/create",controller:"channelChange",templateProvider:["$templateCache",function(t){return t.get("channel-change.view.html")}]}).state("main.channel.update",{url:"^/channel/:_id",controller:"channelChange",templateProvider:["$templateCache",function(t){return t.get("channel-change.view.html")}]}).state("main.streams",{url:"^/streams",controller:"streams",templateProvider:["$templateCache",function(t){return t.get("streams.view.html")}]}).state("main.streams.create",{url:"^/streams/create",controller:"streamsChange",templateProvider:["$templateCache",function(t){return t.get("streams-change.view.html")}]}).state("main.streams.update",{url:"^/streams/:id",controller:"streamsChange",templateProvider:["$templateCache",function(t){return t.get("streams-change.view.html")}]}).state("main.network",{url:"^/network",controller:"network",templateProvider:["$templateCache",function(t){return t.get("network.view.html")}]}).state("main.hardware",{url:"^/hardware",controller:"hardware",templateProvider:["$templateCache",function(t){return t.get("hardware.view.html")}]})}]).run(["checkSignIn","$templateCache",function(t){t()}]),angular.module("controllers",[]),angular.module("services",[]),angular.module("directives",[]),angular.module("filters",[]),angular.module("views",[]),angular.module("controllers").controller("channelChange",["$scope","$state","$stateParams","$http",function(t,e,n,a){"use strict";t.transmitting=!1,t.action="create",t._id=n._id,t.url="",t.source="",t.remark="",t._id&&(t.action="update",t.transmitting=!0,a.get("/api/channel/"+t._id).then(function(e){var n=e.data;t._id=n.name,t.url=n.url,t.source=n.source,t.remark=n.remark,t.transmitting=!1},function(){t.$emit("notification",{type:"danger",message:"获取频道失败"})})),t.saveChannel=function(){t.transmitting=!0;var n={url:t.url,source:t.source,remark:t.remark};t._id?a.put("/api/channel/"+t._id,n).then(function(){t.$emit("notification",{type:"success",message:"更新频道成功"}),e.go("main.channel",null,{reload:"main.channel"})},function(){t.$emit("notification",{type:"danger",message:"创建频道失败"})}):a.post("/api/channel",n).then(function(){t.$emit("notification",{type:"success",message:"创建频道成功"}),e.go("main.channel",null,{reload:"main.channel"})},function(){t.$emit("notification",{type:"danger",message:"创建频道失败"})})}}]),angular.module("controllers").controller("channel",["$scope","$state","$stateParams","$http",function(t,e,n,a){"use strict";t.transmitting=!1,t.deleteChannelId="",t.channel=[],t.translate=function(t){var e=t.match(/^(\w+)\:\/\//);if(!e||!e[1])return"其他";switch(e[1]){case"rtmp":return"rtmp";case"http":var n=t.match(/\.(\w+)$/);return n&&n[1]?n[1]:"其他";default:return e[1]}},a.get("/api/channel").then(function(e){var n=e.data;t.channel=n}),t.deleteChannel=function(){t.transmitting=!0,a["delete"]("/api/channel/"+t.deleteChannelId).then(function(){return $("#deleteModal").modal("hide"),t.transmitting=!1,t.channel=_.reject(t.channel,{name:t.deleteChannelId}),t.$emit("notification",{type:"success",message:"删除频道成功"})},function(){t.$emit("notification",{type:"danger",message:"删除频道失败"})})}}]),angular.module("controllers").controller("hardware",["$scope","$rootScope",function(t,e){"use strict";function n(){r=new Chart($("#transmitChart").get(0).getContext("2d"),{type:"line",options:{tooltips:{enabled:!1},legend:{display:!1},elements:{line:{borderWidth:1}},animation:{duration:0}}}),o=new Chart($("#receiveChart").get(0).getContext("2d"),{type:"line",options:{tooltips:{enabled:!1},legend:{display:!1},elements:{line:{borderWidth:1}},animation:{duration:0}}})}function a(e){if(i[0]){var n=moment().format("hh:mm:ss");_.map(i,function(t,a){t.transmit.labels.push(n),t.transmit.labels.shift(),t.transmit.datasets[0].data.push(e[a].transmit),t.transmit.datasets[0].data.shift(),t.receive.labels.push(n),t.receive.labels.shift(),t.receive.datasets[0].data.push(e[a].receive),t.receive.datasets[0].data.shift()}),t.updateChart()}else i=_.map(e,function(e,n){return t.chartHeader[n]=e.name,{transmit:{labels:["00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00"],datasets:[{data:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}]},receive:{labels:["00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00","00:00:00"],datasets:[{data:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}]}}})}t.cpuUsage=0,t.cpuTotal=0,t.cpuModel="",t.memUsage=0,t.memTotal="",t.chartHeader=[],t.network=[];var i=[];t.select=0;var r,o,s=!1;t.updateChart=function(e){"number"==typeof e&&(t.select=e),r.data=i[t.select].transmit,o.data=i[t.select].receive,r.update(),o.update()},t.$on("$viewContentLoaded",function(){return!s&&(n(),void(s=!0))}),e.socket.on("hardware",_.throttle(function(e){t.$apply(function(){t.cpuUsage=_.floor(e.cpu.usage),t.cpuAmount=e.cpu.amount,t.cpuModel=e.cpu.model,t.memUsage=_.floor(e.mem.usage/e.mem.total*100),t.memTotal=_.floor(e.mem.total),a(e.network)})},1e3))}]),angular.module("controllers").controller("main",["$scope","$state","$rootScope",function(t,e,n){"use strict";"main"===e.current.name&&e.go("main.hardware"),n.socket=io.connect("/")}]),angular.module("controllers").controller("network",["$scope","$state","$stateParams","$http",function(t,e,n,a){"use strict";function i(){a.get("/api/network").then(function(e){var n=e.data;t.network=n})}t.transmitting=!1,t.network=[],t.networkConfig={address:"",netmask:""},i(),t.changeNetwork=function(t){a.put("/api/network/"+t.name,{toggle:!t.active}).then(function(t){i()}),t.active=!t.active},t.networkModel=function(e,n){t.networkForm.$setPristine(),t.networkForm.$setUntouched(),t.networkConfig={name:e.name,address:e.address,netmask:e.netmask},$("#networkModal").modal("show"),i()},t.saveNetworkConfig=function(){var e={address:t.networkConfig.address,netmask:t.networkConfig.netmask};a.put("/api/network/"+t.networkConfig.name,e).then(function(){i()}),$("#networkModal").modal("hide")}}]),angular.module("controllers").controller("signIn",["$scope","$timeout","$state","$http",function(t,e,n,a){"use strict";function i(){t.wrong=!1}t.transmitting=!1,t.password="",t.autoSignIn=!1,t.wrong=!1,t.hasKeyValue=!1,t.keyMac="",t.keyValue="",t.username="",a.get("/api/account/key").then(function(e){var n=e.data;n?t.keyMac=n:t.hasKeyValue=!0}),t.$watch(["keyValue","account","password"],i,!0),t.keyForm=function(){t.transmitting=!0,a.put("/api/account/key",{keyValue:t.keyValue}).then(function(){t.hasKeyValue=!0,t.transmitting=!1},function(n){var a=n.data;_.get(a,"error.code")&&(t.wrong=!0),t.animateShake=!0,e(function(){t.animateShake=!1,t.transmitting=!1},600)})},t.signIn=function(){t.transmitting=!0,a.put("/api/account/sign-in",{username:t.username,password:t.password}).then(function(){n.go("main")},function(n){var a=n.data;_.get(a,"error.code")&&(t.wrong=!0),t.animateShake=!0,e(function(){t.animateShake=!1,t.transmitting=!1},600)})}}]),angular.module("controllers").controller("streamsChange",["$scope","$state","$stateParams","$http",function(t,e,n,a){"use strict";t.transmitting=!1,t.action="create",t.id=n.id,t.name="",t.url="",t.outUrl="",t.hls=!1,t.muhicast=!1,t.network={},t.network2={},t.networkName="",t.inNetworkName="",a.get("/api/network").then(function(e){var n=e.data;t.network=n,t.network2=n}),t.id&&(t.action="update",t.transmitting=!0,a.get("/api/streams/"+t.id).then(function(e){var n=e.data;t.name=n.name,t.url=n.url,n.inNetwork&&(t.inNetworkName=n.inNetwork),n.hls&&(t.hls=n.hls),n.muhicast&&(t.muhicast=n.muhicast,t.networkName=n.network,t.outUrl=n.outUrl),t.transmitting=!1},function(){t.$emit("notification",{type:"danger",message:"获取频道失败"})})),t.saveStream=function(){t.transmitting=!0;var n={name:t.name,url:t.url},i=/^(\w+)\:\/\//,r=_.get(n.url.match(i),[1]);r&&(n.inNetwork=t.inNetworkName),t.hls&&(n.hls=!0),t.muhicast&&(n.muhicast=!0,n.network=t.networkName,n.outUrl=t.outUrl),t.id?a.put("/api/streams/"+t.id,n).then(function(){t.$emit("notification",{type:"success",message:"更新转码成功"}),e.go("main.streams",null,{reload:"main.streams"})},function(){t.$emit("notification",{type:"danger",message:"更新转码失败"})}):a.post("/api/streams",n).then(function(){t.$emit("notification",{type:"success",message:"创建转码成功"}),e.go("main.streams",null,{reload:"main.streams"})},function(){t.$emit("notification",{type:"danger",message:"创建转码失败"})})}}]),angular.module("controllers").controller("streams",["$scope","$state","$stateParams","$http",function(t,e,n,a){"use strict";t.transmitting=!1,t.deleteStreamlId="",t.stream=[],t.translatePre=function(t){var e=/^(\w+)\:\/\//,n=_.get(t.match(e),[1],"-");return n},a.get("/api/streams").then(function(e){var n=e.data;t.stream=n,_.map(t.stream,function(t){t.pid?t.active=!0:t.active=!1})}),t.switchActive=function(e){return!t.transmitting&&(e.active=!e.active,t.transmitting=!0,void a.put("/api/streamSwitch",{id:e.id,active:e.active}).then(function(){return t.transmitting=!1,t.$emit("notification",{type:"success",message:"激活转码成功"})},function(){t.transmitting=!1,t.$emit("notification",{type:"danger",message:"激活转码失败"})}))},t.deleteStream=function(){t.transmitting=!0,a["delete"]("/api/streams/"+t.deleteStreamId).then(function(){return $("#deleteModal").modal("hide"),t.transmitting=!1,t.stream=_.reject(t.stream,{id:t.deleteStreamId}),t.$emit("notification",{type:"success",message:"删除转码成功"})},function(){t.$emit("notification",{type:"danger",message:"删除转码失败"})})}}]),angular.module("services").factory("authorityInterceptor",["$q","$injector",function(t,e){"use strict";return{responseError:function(n){return 401===n.status&&n.data&&n.data.error&&e.get("$state").go("signIn"),t.reject(n)}}}]),angular.module("services").factory("checkSignIn",["$rootScope","$state","ipCookie",function(t,e,n){"use strict";return function(){t.$on("$stateChangeStart",function(t,a,i,r,o){n("consoleSid")||"signIn"===a.name||(t.preventDefault(),e.go("signIn"))})}}]),angular.module("directives").directive("ndNavigation",["$templateCache","$rootScope","$state","$timeout","$http","$filter",function(t,e,n,a,i,r){return{restrict:"E",template:t.get("navigation.view.html"),link:function(t,r){function o(){a(function(){$(".sub-list").each(function(){var t=$(this);t.children(".item").hasClass("active")?t.siblings(".item").addClass("active select"):t.slideUp("fast",function(){t.siblings(".sub-list-heading").removeClass("select")}).siblings(".sub-list-heading").removeClass("active")})})}t.notFoundPages=!1,t.notFoundContents=!1,t.auth={},t.categories=[],t.user={},t.signOut=function(){i.put("/api/account/sign-out").then(function(){n.go("signIn")},function(){t.$emit("notification",{type:"danger",message:"退出登录失败"})})},e.$on("$stateChangeSuccess",function(){a(function(){o()})}),e.$on("mainCategoriesUpdate",function(){loadCategories()}),e.$on("mainUserUpdate",function(){account.reset(),loadUser()}),$(".navigation").on("click",".sub-list-heading",function(){var t=$(this);t.hasClass("select")?t.siblings(".sub-list").slideUp("fast",function(){$(this).siblings(".sub-list-heading").removeClass("select")}):t.siblings(".sub-list").slideDown("fast",function(){$(this).siblings(".sub-list-heading").addClass("select")}),$(".sub-list:visible").not(t.siblings(".sub-list")).slideUp("fast",function(){$(this).siblings(".sub-list-heading").removeClass("select")})})}}}]),angular.module("directives").directive("ndNotification",["$timeout","$rootScope",function(t,e){return{replace:!0,link:function(n){function a(){i=!0,t(function(){r-- >0?a():(i=!1,n.notificationShow=!1)},1e3)}var i,r;e.$on("notification",function(t,e){r=3,n.type=e.type,n.message=e.message,n.notificationShow=!0,i||a()})}}}]),angular.module("filters").filter("words",function(){return function(t,e){return t&&t.length>e&&(t=t.substr(0,parseInt(e,10)-3)+"..."),t}});