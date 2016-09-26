function config($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/index");
    $stateProvider
        .state('reg',{
            url: "/reg",cache:'false',
            templateUrl: "views/user/reg.html",
        })
        .state('login', {
            url: "/login",cache:'false',
            templateUrl: "views/user/login.html",
        })
        .state('level',{
            url:"/level",
            templateUrl : "views/level.html",
            controller: "level"
        })
        .state('user', {
            abstract: true,
            url: "/user",cache:'false',
            templateUrl: "views/layout/common.html",
        })
        .state('user.profile', {
            url: "/profile",cache:'false',
            templateUrl: "views/user/profile.html",
        })
        .state('user.identification',{
            url: "/identification",cache:'false',
            templateUrl: "views/user/identification.html",
        })
        /*shop*/
        .state('shop', {
            abstract:true,cache:'false',
            templateUrl: "views/layout/shop.html",
        })
        .state('shop.dashboard', {
            url: "/index",cache:'false',
            templateUrl: "views/dashboard.html",
            controller:"dashboard"
        })
        .state('shop.decorate', {
            url: "/shop/decorate",cache:'false',
            templateUrl: "views/shop/decorate.html",
            controller:"shop.decorate"
        })
        /*huiyuan*/
        //会员列表
        .state('shop.users', {
            url: "/users",cache:'false',
            templateUrl: "views/users/list.html",
        })
        //售罄的商品
        .state('shop.goodssoldout', {
            url: "/goods/soldout/:currentPage/:searchValue/:gcNo",cache:'false',
            templateUrl: "views/good/soldout.html",
        })
        //库存的商品
        .state('shop.goodsinstore', {
            url: "/goods/instore/:currentPage/:searchValue/:gcNo",cache:'false',
            templateUrl: "views/good/instore.html",
        })
        //上架的商品
        .state('shop.goodsonsale', {
            url: "/goods/onsale/:currentPage/:searchValue/:gcNo",cache:'false',
            templateUrl: "views/good/onsale.html",
        })
        //中物华商平台产品库
        .state('shop.goodsplatform', {
            url: "/goods/platform/:currentPage/:searchValue/:gcNo",cache:'false',
            templateUrl: "views/good/platform.html",
        })
        //我的商品详情
        .state('shop.mygoodsdetails', {
            url: "/goods/my/goodsdetails/:type/:currentPage/:id/:searchValue/:gcNo",cache:'false',
            templateUrl: "views/good/goodsdetails.html",
        })
        //中物华商商品详情
        .state('shop.platformdetails', {
            url: "/goods/platformdetails/:currentPage/:id/:searchValue/:gcNo",cache:'false',
            templateUrl: "views/good/platformdetails.html",
        })        
        //商品申请
        .state('shop.requirement', {
            url: "/goods/requirement",cache:'false',
            templateUrl: "views/good/requirement.html",
        })
        //我申请的商品列表
        .state('shop.myrequirement', {
            url: "/goods/myrequirement",cache:'false',
            templateUrl: "views/good/myrequirement.html",
        })
        //评论管理
        .state('shop.commentManage', {
            url: "/goods/comment/:type/:currentPage/:id/:searchValue/:gcNo",cache:'false',
            templateUrl: "views/good/commentmanage.html",
        })
        //我的服务
        .state('shop.service', {
            url: "/service",cache:'false',
            templateUrl: "views/service/index.html",
        })
         //我的服务
        .state('shop.serviceOrders', {
            url: "/serviceOrders",cache:'false',
            templateUrl: "views/service/orders.html",
        })
        /*caiwu*/
        //提现
        .state('shop.finace', {
            url: "/finace",cache:'false',
            templateUrl: "views/finace/index.html",
        })
        //财务记录历史详情
        .state('shop.finacedetails', {
            url: "/finacedetails/:id",cache:'false',
            templateUrl: "views/finace/details.html",
        })
        /*dingdan*/
        //我的订单
        .state('shop.orders', {
            url: "/orders",cache:'false',
            templateUrl: "views/orders/index.html",
        })
        
        //订单详情
        .state('shop.orderdetails', {
            url: "/orderdetails",cache:'false',
            templateUrl: "views/orders/details.html",
        })
        /*dingdan*/
        //分销订单
        .state('shop.fxorders', {
            url: "/fxorders",cache:'false',
            templateUrl: "views/orders/fxindex.html",
        })
         //订单详情
        .state('shop.fxorderdetails', {
            url: "/fxorderdetails",cache:'false',
            templateUrl: "views/orders/fxdetails.html",
        })
        /*weixin*/
        .state('bind',{
            abstract:true,cache:'false',
            templateUrl: "views/weixin/bind.html",
            controller:"weixinbindCtrl",cache:'false',
        })
        .state('bind.step_one',{
            url:"/bind/step_one",cache:'false',
            templateUrl: "views/weixin/bind_one.html",
            controller:"step_one",cache:'false',
        })
        .state('bind.step_two',{
            url:"/bind/step_two",cache:'false',
            templateUrl: "views/weixin/bind_two.html",
            controller:"step_two",cache:'false',
        })
        .state('weixin', {
            abstract:true,cache:'false',
            templateUrl: "views/layout/weixin.html",
            controller:"weixin.baseCtrl",cache:'false',
        })
        .state('weixin.menu', {
            url: "/weixin/menu",cache:'false',
            templateUrl: "views/weixin/menu.html",
            controller:"weixin.menu",cache:'false',
        })
        .state('weixin.reply', {
            templateUrl: "views/weixin/reply.html",
            abstract:true,
        })
        .state('weixin.reply.onAttention', {
            templateUrl: "views/weixin/reply_onAttention.html",
            controller:"weixin.reply.onAttention",
            url:"/weixin/reply/onAttention",cache:'false',
        })
        .state('weixin.reply.noAnswer', {
            templateUrl: "views/weixin/reply_noAnswer.html",
            controller:"weixin.reply.noAnswer",
            url:"/weixin/reply/noAnswer",cache:'false',
        })
        .state('weixin.reply.keywords', {
            templateUrl: "views/weixin/reply_keywords.html",
            controller:"weixin.reply.keywords",
            url:"/weixin/reply/keywords",cache:'false',
        })
 
        .state('weixin.reply_add', {
            url: "/weixin/reply_add",cache:'false',
            templateUrl: "views/weixin/reply_add.html",
            controller:"weixin.reply_add"
        })
        .state('weixin.reply_edit', {
            url: "/weixin/reply/edit/:id",cache:'false',
            templateUrl: "views/weixin/reply_add.html",
            controller:"weixin.reply_edit"
        })
        .state('weixin.my', {
            url: "/weixin/my",cache:'false',
            templateUrl: "views/weixin/my.html",
            controller:"weixin.my"
        })
        .state('weixin.assets', {
            url: "/weixin/assets",cache:'false',
            templateUrl: "views/weixin/assets.html",
        })
        .state('weixin.assets_add', {
            url: "/weixin/assets/add",cache:'false',
            templateUrl: "views/weixin/assets_add.html",
            controller:"weixin.assets_add"
        })
        .state('weixin.assets_edit', {
            url: "/weixin/assets/edit/:id",cache:'false',
            templateUrl: "views/weixin/assets_add.html",
            controller:"weixin.assets_edit"
        })
         /*营销*/
        .state('marketing', {
            abstract:true,
            cache:'false',
            templateUrl: "views/layout/marketing.html",
        })
        .state('marketing.tradeincard', {
            url: "/marketing/tradeincard",
            cache: 'false',
            templateUrl: "views/marketing/tradeincard.html",
        })
}
angular
    .module('neuboard')
    .config(config)
    .constant('API', {
         "front_path":"http://o2o.syisy.com/",
//      "base_path":"http://o2ostore-st.syisy.com/zwhs_byd_api/",
// "base_path":"http://o2ostore.syisy.com/zwhs_byd_api/",
        //"front_path":"http://o2ostore-st.uwificloud.com/",
        //"front_path":"http://o2ostore-st.uwificloud.com/",
        //"base_path":"http://o2ostore-st.uwificloud.com/zwhs_byd_api/",
//      "base_path":"http://192.168.109.118:8080/zwhs_byd_api/",
    
       "base_path":"http://10.0.60.5:8088/zwhs_byd_api/",
        //'base_path':"http://localhost:2403/",
        "upload":"http://fileproxy.syisy.com/",
        "login":"user/tk/login",
        "profile":"/account/profile",
        "users":"/users/",
        "products":"products/",
        "shop":"store/",
        'myAlbum':"image",
        'material_personal':"material_personal",
        'material_system':"material_system",
        'material':"material",
        'material_personal_del':"material_personal_del",
        'material_personal_update':"material_personal_update",
        'wx': "wx/",
        'sg':"sg",
        'coupon':'coupon'
    })
    .constant('DEFAULT',{
        "placeholder" : "G01/M00/00/01/CgA8BFZs-i-AAhIAAAASE08FkaM745.gif",
        'avator':'G01/M01/00/0A/CgA8BFaOLaaAQdA1AAAZYSopqUo645.png'
    })
    .constant('SHOWCASE', {
        "tpl-shop":{
            "type": "tpl-shop",
            "shopName": "默认店铺名称",
            "logo": "G01/M00/00/01/CgA8BFZs-i-AAhIAAAASE08FkaM745.gif",
            "backgroundColor": "G01/M00/00/01/CgA8BFZs-i-AAhIAAAASE08FkaM745.gif"
        },
        "tpl-title":{
            "type": "tpl-title",
            "title": "新品上架",
            "subtitle":"新品上架的描述",
            "textAlign": "left",
            "backgroundColor": "#ffffff",
        },
        "tpl-slider":{
            "type": "tpl-slider",
            "items":[]
        },
        "tpl-goods":{
            "type": "tpl-goods",
            "displayNum": 6,
            "displayList":"lastest",
            "displayType": {
                "name":"normal_list",
                "parmas":{
                    "showTitle":true,
                    "showDesc":true,
                    "showPrice":true,
                }
            }
        },
        "tpl-text":{
            "type": "tpl-text",
            "content": ""
        },
        "tpl-coupon":{
            "type": "tpl-coupon",
            "coupons": []
        }
    })