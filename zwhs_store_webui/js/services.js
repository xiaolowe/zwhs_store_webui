app.factory('authService', function ($http,$cookieStore,DEFAULT) {
    var _user = {
        info:null,
        companyname:null,
        store:0,
        token:0,
        srvflay:0,
        storestate:0,
        storelogo:null,
        retail_code:null,
    }

    //设置cookie
    var setCookie = function (c_name, value, expiredays){
　　　　var exdate=new Date();
　　　　exdate.setDate(exdate.getDate() + expiredays);
　　　　document.cookie=c_name+ "=" + value + ((expiredays==null) ? "" : ";expires="+exdate.toGMTString());
　　}

    //删除cookie
    function clearCookie(name) {  
        setCookie(name, "", -1);  
    }
    _user.info = $cookieStore.get('user_info');
    _user.store = $cookieStore.get('user_store');
    _user.companyname = $cookieStore.get('user_companyname');
    _user.token = $cookieStore.get('user_store_token');
   // _user.srvflay = $cookieStore.get('user_srvflay');
    _user.storestate = $cookieStore.get('user_storestate');
    _user.retail_code = $cookieStore.get('user_retail_code');
    _user.storelogo = $cookieStore.get('user_storelogo');
   
    var setUserInfo = function(info) {
        _user.info = info;
        setCookie('user_info', info, 1); 
    };
    var setUserRetail_code = function(retail) {
        _user.retail_code = retail;
        setCookie('user_retail_code', JSON.stringify(retail), 1); 
    };
    var setUserStore = function(store) {
        _user.store = store;
        setCookie('user_store', store, 1); 
    };
    var setUserToken = function(token) {
        _user.token = token;
        setCookie('user_store_token', '"'+token+'"', 1);  
    };
    var setUserCompanyname = function(companyname) {
        _user.companyname = companyname;
        setCookie('user_companyname', '"'+companyname+'"', 1);
    };
    var setUserSrvflay = function(srvflay) {
        _user.srvflay = srvflay;
        setCookie('user_srvflay', srvflay, 1);
    };
    var setUserStorestate = function(storestate) {
        _user.storestate = storestate;
        setCookie('user_storestate', storestate, 1);
    };
    var setUserStorelogo = function(storelogo) {
        _user.storelogo = storelogo;
        setCookie('user_storelogo', storelogo, 1);
    };

    
    return {
        setUserInfo: setUserInfo,
        setUserRetail_code: setUserRetail_code,
        setUserStore: setUserStore,
        setUserToken: setUserToken,
        setUserCompanyname: setUserCompanyname,
        setUserSrvflay: setUserSrvflay,
        setUserStorestate: setUserStorestate,
        setUserStorelogo: setUserStorelogo,
        isLoggedIn: function() {
            return _user.token ? true : false;
        },
        getUserInfo: function() {
            return _user.info;
        },
        getUserRetail_code: function() {
            return _user.retail_code;
        },
        getStoreId: function(){
            return _user.store;
        },
        getId: function() {
            return _user ? _user._id : null;
        },
        getToken: function() {
            return _user ? _user.token : '';
        },
        getCompanyname: function() {
            return _user ? _user.companyname : '';
        },
        getSrvflay: function() {
            return _user ? _user.srvflay : '';
        },
        getStorestate: function() {
            return _user ? _user.storestate : '';
        },
        getStorelogo: function() {
            return _user.storelogo ? _user.storelogo : DEFAULT.avator;
        },
        logout: function() {
            // $cookieStore.remove('user_info');
            // $cookieStore.remove('user_store');
            // $cookieStore.remove('user_store_token');
            // $cookieStore.remove('user_companyname');
            // $cookieStore.remove('user_srvflay');
            // $cookieStore.remove('user_storestate');
            clearCookie('user_info');
            clearCookie('user_store');
            clearCookie('user_store_token');
            clearCookie('user_companyname');
            clearCookie('user_srvflay');
            clearCookie('user_storestate');
            clearCookie('user_storelogo');
            clearCookie('user_retail_code');
            _user.info=null;
            _user.token = 0;
            _user.store=0;
            _user.companyname=null;
            _user.srvflay=0;
            _user.Storestate=0;
            _user.storelogo=null;
            _user.retail_code=null;
        },
    }
});

app.factory('MyAlbum', function ($q,$http,API) {
    var photoList = false;
    return {
        addToMyPhotoes:function(image_link){
            photoList.push(image_link);
        },
        getMyPhotoes:function(page){
            var deferred = $q.defer();
            $http.get(API.base_path + API.myAlbum + "?page="+page.currentPage+"&pageSize="+page.totalItem)
            .success(function(data){
                photoList = data;
                deferred.resolve(data);
            })
            .error(function(reason){
                deferred.reject(reason);
            })
            return deferred.promise;
        },
        upload:function(formData,hideMy){
            var deferred = $q.defer();
            $.ajax(API.upload+'upload', {
                method: "POST",
                data: formData,
                processData: false,
                contentType: false,
                success: function (data) {
                    if(hideMy){
                        deferred.resolve(data);
                    }else{
                        $http.post(API.base_path + API.myAlbum,{
                            image:data
                        }).success(function(){
                            deferred.resolve(data);
                        }).error(function(reason){
                            deferred.reject('保存到相册错误');
                        })
                    }
                    
                },
                error: function () {
                    deferred.reject("上传错误");
                }
            });
            return deferred.promise;
        }
    };
});

app.factory('ShopService', function ($q, $http,authService,API) {
    var shopId = authService.getStoreId();
    var url = API.base_path + API.shop;
    return {
        listLevel:function(){
            var deferred = $q.defer();
            $http.get(API.base_path + API.sg)
            .success(function(data){
                deferred.resolve(data);
            })
            .error(function(reason){
                deferred.reject(reason);
            })
            return deferred.promise;
        },
        listTemplate:function(){
            var deferred = $q.defer();
            $http.get("data/template.json")
            .success(function(data){
                deferred.resolve(data);
            })
            .error(function(reason){
                deferred.reject(reason);
            })
            return deferred.promise;
        },
        get:function(){
            var deferred = $q.defer();
            $http.get(url)
            .success(function(data){
                deferred.resolve(data);
            })
            .error(function(reason){
                deferred.reject(reason);
            })
            return deferred.promise;
        },
        save:function(content){
            var deferred = $q.defer();
            $http.put(url,{
                content:content
            })
            .success(function(data){
                deferred.resolve(data);
            })
            .error(function(reason){
                deferred.reject(reason);
            })
            return deferred.promise;    
        },
    };
});

app.factory('select2Query', function ($timeout, $cookieStore, API) {
    return {
        brandAJAX: function () {
            var config = {
                minimumInputLength: 1,
                ajax: {
                    url: API.base_path+"brand/1",
                    dataType: 'json',
                    headers: {token: $cookieStore.get("user_store_token")},
                    data: function (brandName) {
                        return {
                            brandName: brandName,
                        };
                    },
                    results: function (data) {
                        console.log(data[0])
                        return {results: data};
                    }
                },
                formatResult: function (data) {
                    return data.brandName;
                },
                
                formatSelection: function (data) {
                    return data[0].brandName;
                }
            };
            return config;
        }
    }
});

app.service("wxKeyService",function($q,$http,authService,API){
    var shopId = authService.getStoreId();
    var url = API.base_path + API.wx;
    return {
        getKeyWithType:function(type){
            var deferred = $q.defer();
            $http.get(url + "key" + "/"+type)
            .success(function(data){
                deferred.resolve(data);
            })
            .error(function(reason){
                deferred.reject(reason);
            })
            return deferred.promise;
        },
        delkey:function(id){
            var deferred = $q.defer();
            $http.delete(url + "key/keyId/"+id)
            .success(function(data){
                deferred.resolve(data);
            })
            .error(function(reason){
                deferred.reject(reason);
            })
            return deferred.promise;
        },
        getkeys:function(page){
            var deferred = $q.defer();
            keyurl = url + "key?page="+page.currentPage+"&pageSize="+page.totalItem;
            if(page.searchValue!=""){
                keyurl = keyurl+"&searchValue="+page.searchValue;
            }
            $http.get(keyurl)
            .success(function(data){
                deferred.resolve(data);
            })
            .error(function(reason){
                deferred.reject(reason);
            })
            return deferred.promise;
        },
        getAKey:function(keyId){
            var deferred = $q.defer();
            $http.get(url + "get" + '/' + keyId)
            .success(function(data){
                keyList = data;
                deferred.resolve(data);
            })
            .error(function(reason){
                deferred.reject(reason);
            })
            return deferred.promise;
        },
        add:function(data){
            data.storeId = shopId;
            if(data.replyConType=="2"){
                data.mids = [];
                for (var i = 0; i < data.materialWarehouses.length; i++) {
                    data.mids.push( {"mid":data.materialWarehouses[i].id} );
                };
            }
            delete data.materialWarehouses;
            var deferred = $q.defer();
            $http.post(url + "key",data)
            .success(function(data){
                deferred.resolve(data);
            })
            .error(function(reason){
                deferred.reject(reason);
            })
            return deferred.promise;
        },
        saveOne:function(data){
            if(data.replyConType=="2"){
                data.mids = [];
                for (var i = 0; i < data.materialWarehouses.length; i++) {
                    data.mids.push( {"mid":data.materialWarehouses[i].id} );
                };
            }
            var deferred = $q.defer();
            $http.put(url + "key",data)
            .success(function(data){
                deferred.resolve(data);
            })
            .error(function(reason){
                deferred.reject(reason);
            })
            return deferred.promise;
        },
        save:function(data){
            if(data.replyConType=="2"){
                data.mids = [];
                for (var i = 0; i < data.materialWarehouses.length; i++) {
                    data.mids.push( {"mid":data.materialWarehouses[i].id} );
                };
            }
            delete data.materialWarehouses;
            var deferred = $q.defer();
            $http.put(url + "key",data)
            .success(function(data){
                deferred.resolve(data);
            })
            .error(function(reason){
                deferred.reject(reason);
            })
            return deferred.promise;
        },
    }
})

app.service("wxService",function($q,$http,authService,API){
    var shopId = authService.getStoreId();
    var url = API.base_path + API.wx;
    return {
        getInfo:function(){
            var deferred = $q.defer();
            $http.get(url + "get")
            .success(function(data){
                deferred.resolve(data);
            })
            .error(function(reason){
                deferred.reject(reason);
            })
            return deferred.promise;
        },
        setInfo:function(info){
            var deferred = $q.defer();
            $http.put(url + "set",info)
            .success(function(data){
                deferred.resolve(data);
            })
            .error(function(reason){
                deferred.reject(reason);
            })
            return deferred.promise;
        },
        getMenu:function(){
            var deferred = $q.defer();
            $http.get(url + "menu")
            .success(function(data){
                deferred.resolve(data);
            })
            .error(function(reason){
                deferred.reject(reason);
            })
            return deferred.promise;
        },
        setMenu:function(menu){
            var deferred = $q.defer();
            $http.put(url + "menu",menu)
            .success(function(data){
                deferred.resolve(data);
            })
            .error(function(reason){
                deferred.reject(reason);
            })
            return deferred.promise;
        }
    };
})


app.service("assetsService",function($q,$http,authService,API){
    var shopId = authService.getStoreId();
    return {
        get:function(id){
            var deferred = $q.defer();
            $http.get(API.base_path + API.material_personal + '/' + id )
            .success(function(data){
                deferred.resolve(data);
            })
            .error(function(reason){
            })
            return deferred.promise;
        },
        list:function(page,type){
            murl = API.base_path;
            murl += (type == 'my' ? API.material_personal :API.material_system);
            var deferred = $q.defer();
            murl = murl + "?page="+page.currentPage+"&pageSize="+page.totalItem;
            if(page.searchValue!=""){
                murl = murl+"&searchValue="+page.searchValue;
            }

            $http.get(murl)
            .success(function(data){
                deferred.resolve(data);
            })
            .error(function(reason){
            })
            return deferred.promise;
        },
        save:function(info){
            var deferred = $q.defer();
            $http.put(API.base_path + API.material_personal_update + '/' +info.id ,info)
            .success(function(data){
                deferred.resolve(data);
            })
            .error(function(reason){
                deferred.reject(reason);
            })
            return deferred.promise;
        },
        create:function(info){
            var deferred = $q.defer();
            $http.post(API.base_path + API.material,info)
            .success(function(data){
                deferred.resolve(data);
            })
            .error(function(reason){
                deferred.reject(reason);
            })
            return deferred.promise;
        },
        del:function(id){
            var deferred = $q.defer();
            $http.delete(API.base_path + API.material_personal_del +"/"+id)
            .success(function(data){
                deferred.resolve(data);
            })
            .error(function(reason){
                deferred.reject(reason);
            })
            return deferred.promise;
        }
    };
})

app.factory('UserInterceptor', ["$q","$rootScope","$cookieStore",function ($q,$rootScope,$cookieStore) {
    return {
        request:function(config){
            config.headers["token"] = $cookieStore.get("user_store_token");
            return config;
        },
        responseError: function (response) {
            var data = response.data;
            // 判断错误码，如果是未登录
            if(data["code"] == "101"){
                // 清空用户本地token存储的信息，如果
                //$rootScope.user = {token:""};
                // 全局事件，方便其他view获取该事件，并给以相应的提示或处理
                $rootScope.$emit("userIntercepted","notLogin",response);
            }
            // 如果是登录超时
            // if(data["errorCode"] == "500998"){
            //     $rootScope.$emit("userIntercepted","sessionOut",response);
            // }
            return $q.reject(response);
        }
    };
}]);

app.factory('couponService',function($http,API,$q){
    return {
        list:function(page,type){
            var deferred = $q.defer();
            murl = API.base_path + API.coupon;
            murl = murl + "?page="+page.currentPage+"&pageSize="+page.pageSize;
            $http.get(murl)
            .success(function(data){
                deferred.resolve(data);
            })
            .error(function(reason){
            })
            return deferred.promise;
        },
    }
})
