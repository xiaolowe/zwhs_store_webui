app.controller('MainCtrl', function($rootScope, $scope, $modal, $state, $stateParams, $location,$cookieStore, API, authService) {
    $rootScope.$on('userIntercepted', function(data) {
        $scope.logout();
    });
    $rootScope.$state = $state;
    $scope.islogin = false;
    $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
        if (toState.name == 'login') return false;
        if (toState.name == 'reg') return false;
        //debugger;
        $scope.islogin = authService.isLoggedIn();
        if (!$scope.islogin) {
            $location.url('/login');
            // event.preventDefault();
            // $state.go("login",{from:fromState.name,w:'notLogin'});//跳转到登录界面
        }
    });

    $rootScope.companyname = authService.getCompanyname();
    $rootScope.srvflay = authService.getSrvflay();
    $rootScope.storestate = authService.getStorestate();
    $rootScope.token = authService.getToken();
    $rootScope.retail_code = authService.getUserRetail_code();

    //if($rootScope.user_store!=authService.getStorestate()){$rootScope.user_store=authService.getStorestate();location.reload();}
    //验证用户
    if ($rootScope.storestate == '-1' || $rootScope.storestate == '0' || $rootScope.storestate == '2' || $rootScope.storestate == '3' || typeof($rootScope.storestate) == 'undefined') {
        $rootScope.authorize = 0;
    } else {
        $rootScope.authorize = 1;
    }
    if ($rootScope.storestate == 0 && !$rootScope.companyname) {
        location.reload();
    }

    $scope.clickLogout = function() {
        if (confirm("确定退出？")) {
            $scope.logout();
        }
    }

    $scope.logout = function() {
        authService.logout();
        $scope.islogin = authService.isLoggedIn();
        $state.go("login", {
            from: "logout"
        });
    }
});

/**
 * Logo
 */
app.controller("logoController", function($scope, $http, toaster, API, authService) {
    $scope.logoimage = authService.getStorelogo();
    // if(!$scope.logoimage){
    //     $scope.logoimage = 'img/logo.png';
    // }
    $scope.$watch('logoimage', function(newValue, oldValue) {
        if (newValue != oldValue) {
            $http({
                method: 'PUT',
                url: API.base_path + 'store/logo/',
                cache: false,
                data: {
                    storeLogo: newValue,
                }
            }).success(function(response) {
                authService.setUserStorelogo('"' + newValue + '"');
                $scope.logoimage = newValue;
                toaster.pop({
                    type: 'success',
                    title: '修改店铺LOGO成功',
                });
            }).error(function(response) {
                toaster.pop({
                    type: 'error',
                    title: response.msg,
                });
            });
        }
    });
});

/**
 * 首页
 */
app.controller("dashboard", function($q, $scope, $http, $state, API) {

    $scope.decoratebtn = function() {
        if ($scope.authorize != 0) {
            $state.go('shop.decorate', {});
        } else {
            $state.go('user.identification', {});
        }
    }

    var getDate = function() {
        var deferred = $q.defer();
        $http({
                method: 'GET',
                url: API.base_path + 'firstPage/',
                cache: false
            })
            .success(function(data) {
                deferred.resolve(data);
            })
            .error(function(reason) {
                deferred.reject(reason);
                $state.go("shop.dashboard", {}, {
                    reload: true
                });
            })
        return deferred.promise;
    }

    getDate().then(function(data) {
        $scope.indexdata = data;
    });

    var getChart = function() {
        var deferred = $q.defer();
        $http({
                method: 'GET',
                url: API.base_path + 'chart/',
                cache: false
            })
            .success(function(data) {
                deferred.resolve(data);
            })
            .error(function(reason) {
                deferred.reject(reason);
                $state.go("shop.dashboard", {}, {
                    reload: true
                });
            })
        return deferred.promise;
    }

    getChart().then(function(option) {
        initChart('pv', '订单数(单)', option.xAxis.data, option.series[0].data);
        initChart('trade', '交易额(元)', option.xAxis.data, option.series[1].data);
    });

    function initChart(id, name, xData, values) {
        var options = {
            tooltip: {
                trigger: "item",
                formatter: " {b}<br/>{a} : {c}"
            },
            legend: false,
            toolbox: false,
            calculable: false,
            xAxis: [{
                type: 'category',
                boundaryGap: false,
                data: xData,
                name: ' 日期',
            }],
            yAxis: [{
                type: 'value',
                name: name
            }],
            series: [{
                name: name,
                type: 'line',
                data: values
            }]
        };
        var myChart = echarts.init(document.getElementById(id));
        myChart.setOption(options);
    }

});

/**
 * 用户登录
 */
app.controller("loginCtrl", function($q, $rootScope, $state, $scope, $modal, $http, toaster, authService, API) {
    authService.logout();
    $rootScope.authorize = 0;

    $scope.forgotPassword = function() {
        var modalInstance = $modal.open({
            templateUrl: 'views/user/forgotpassword.html',
            controller: 'forgotPasswordModal',
        });
    }

    $scope.login = function(isvalid) {
        if (isvalid) {
            var getData = function() {
                var deferred = $q.defer();
                $http({
                    method: 'POST',
                    url: API.base_path + API.login,
                    cache: false,
                    data: {
                        phone: $scope.user.loginName,
                        password: $scope.user.password,
                    }
                }).success(function(response) {
                    deferred.resolve(response);
                }).error(function(response) {
                    //deferred.reject(reason);
                    toaster.pop({
                        type: 'error',
                        title: response.msg,
                    });
                })
                return deferred.promise;
            }


            getData().then(function(response) {
                authService.setUserInfo(response.userId);
                authService.setUserRetail_code(response.retail_code);
                authService.setUserToken(response.token);
                authService.setUserStore(response.storeId);
                authService.setUserCompanyname(response.companyName);
                authService.setUserSrvflay(response.srvflay);
                authService.setUserStorestate(response.storeState);
                if (response.storeLogo) {
                    authService.setUserStorelogo('"' + response.storeLogo + '"'); //店铺Logo
                } else {
                    authService.setUserStorelogo(""); //店铺Logo
                }


                $rootScope.storeid = response.storeId;
                $rootScope.companyname = response.companyName;
                $rootScope.storestate = response.storeState;
                $rootScope.retail_code = response.retail_code; //分销标识
                $rootScope.srvflay = response.srvflay; //服务标识
                if (response.storeLogo) {
                    $rootScope.storelogo = response.storeLogo; //店铺Logo
                } else {
                    $rootScope.storelogo = ""; //店铺Logo
                }

            }).then(function() {
                //$state.go("shop.dashboard",{from:"login".name});
                window.location.href = '/';
            });
        }
    }
});

/**
 * 忘记密码
 */
app.controller("forgotPasswordModal", function($scope, $modalInstance) {
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
});

app.controller("forgotPasswordModalContent", function($rootScope, $scope, $http, $state, $q, toaster, $location, API) {
    $scope.getcodebtn = "获取验证码";
    $rootScope.successbutton = 1;
    $scope.getMessage = function() {
        if ($scope.msg != 1) {
            if (!$scope.userphone == "" && !$scope.ngform.userphone.$error.required && !$scope.ngform.userphone.$error.number && !$scope.ngform.userphone.$error.minlength && !$scope.ngform
                .userphone.$error.maxlength && !$scope.ngform.userphone.$error.min) {
                if ($scope.userpwd != $scope.userpwd2) {
                    toaster.pop({
                        type: 'error',
                        title: '两次输入的密码不同，请验证后重新输入！',
                    });
                }else{
                    $http({
                        method: 'POST',
                        url: API.base_path + "/user/tk/smsphone",
                        cache: false,
                        data: {
                            "phone": $scope.userphone,
                        }
                    }).success(function(data) {
                        if (data.msg = "ok") {
                            $scope.clock = '30';
                            var myTime = setInterval(function() {
                                $scope.clock--;
                                $scope.getcodebtn = $scope.clock + " 秒后可重新获取验证码";
                                $scope.msg = 1;
                                $scope.$digest();
                            }, 1000);
        
                            setTimeout(function() {
                                $scope.getcodebtn = "获取验证码";
                                $scope.msg = 0;
                                $scope.$digest();
                                clearInterval(myTime);
                            }, 30000);
                        } else {
                            console.log(data.msg);
                        }
                    });
                }
            } else {
                toaster.pop({
                    type: 'error',
                    title: '请先填写正确的手机号码！',
                });
            }
        }
    }

    var getData = function() {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: API.base_path + "user/tk/forgetpwd",
            cache: false,
            data: {
                "phone": $scope.userphone,
                "sms": $scope.messagecode,
                "newpwd": $scope.userpwd,
                "confirmpwd": $scope.userpwd2
            }
        }).success(function(response) {
            deferred.resolve(response);
        }).error(function(response) {
            toaster.pop({
                type: 'error',
                title: response.msg,
            });
        })
        return deferred.promise;
    }

    $scope.resetPsw = function(){
        if ($scope.ngform.$valid) {
           getData().then(function(response){
                toaster.pop({
                    type: 'success',
                    title: "密码重置成功！",
                    onHideCallback: function() {
                        window.location.href = '/';
                    }
                });
           });
        }
    }
});

/**
 * 用户注册
 */
app.controller("userReg", function($rootScope, $scope, $http, $state, $q, toaster, authService, API) {
    $scope.getcodebtn = "获取验证码";
    $rootScope.successbutton = 1;
    $scope.getMessage = function() {
        if ($scope.msg != 1) {
            if (!$scope.userphone == "" && !$scope.ngform.userphone.$error.required && !$scope.ngform.userphone.$error.number && !$scope.ngform.userphone.$error.minlength && !$scope.ngform
                .userphone.$error.maxlength && !$scope.ngform.userphone.$error.min) {
                $http({
                    method: 'POST',
                    url: API.base_path + "user/tk/sms",
                    cache: false,
                    data: {
                        "phone": $scope.userphone
                    }
                }).success(function(data) {
                    if (data.msg = "ok") {
                        $scope.clock = '30';
                        var myTime = setInterval(function() {
                            $scope.clock--;
                            $scope.getcodebtn = $scope.clock + " 秒后可重新获取验证码";
                            $scope.msg = 1;
                            $scope.$digest();
                        }, 1000);

                        setTimeout(function() {
                            $scope.getcodebtn = "获取验证码";
                            $scope.msg = 0;
                            $scope.$digest();
                            clearInterval(myTime);
                        }, 30000);
                    } else {
                        console.log(data.msg);
                    }
                });
            } else {
                toaster.pop({
                    type: 'error',
                    title: '请先填写正确的手机号码！',
                });
            }
        }
    }

    $scope.loginbtn = function() {
        $state.go("login", {});
    }

    $scope.regsubmit = function() {
        if ($scope.ngform.$valid) {
            if ($scope.userpwd != $scope.userpwd2) {
                toaster.pop({
                    type: 'error',
                    title: '两次输入的密码不同，请验证后重新输入！',
                });
            } else {
                $http({
                    method: 'POST',
                    url: API.base_path + "user/tk/register",
                    cache: false,
                    data: {
                        "userTruename": $scope.usertruename,
                        "userPwd": $scope.userpwd,
                        "userEmail": $scope.useremail,
                        "smsinfo": $scope.messagecode,
                        "userPhone": $scope.userphone,
                    }
                }).success(function(data) {
                    if (data.msg == "成功") {
                        //注册成功，自动登录
                        var getData = function() {
                                var deferred = $q.defer();
                                $http({
                                    method: 'POST',
                                    url: API.base_path + API.login,
                                    cache: false,
                                    data: {
                                        phone: $scope.userphone,
                                        password: $scope.userpwd,
                                    }
                                }).success(function(response) {
                                    deferred.resolve(response);
                                }).error(function(response) {
                                    toaster.pop({
                                        type: 'error',
                                        title: response.msg,
                                    });
                                })
                                return deferred.promise;
                            }
                            //禁止掉注册按钮
                        $rootScope.successbutton = 0;
                        //来一块吐司
                        toaster.pop({
                            type: 'success',
                            title: '注册成功',
                            onHideCallback: function() {
                                getData().then(function(response) {
                                    authService.setUserInfo(response.userId);
                                    authService.setUserToken(response.token);
                                    authService.setUserStore(response.storeId);
                                    authService.setUserCompanyname(response.companyName);
                                    authService.setUserSrvflay(response.srvflay);
                                    authService.setUserStorestate(response.storeState);
                                    $rootScope.storeid = response.storeId;
                                    $rootScope.companyname = response.companyName;
                                    $rootScope.storestate = response.storeState;
                                    $rootScope.srvflay = response.srvflay; //服务标识
                                }).then(function() {
                                    window.location.href = '/';
                                });
                            }
                        });
                    } else {
                        toaster.pop({
                            type: 'error',
                            title: data.msg,
                        });
                    }
                }).error(function(response) {
                    toaster.pop({
                        type: 'error',
                        title: response.msg,
                    });
                });
            }
        }
    }
});


//商家信息认证
app.controller('userIdentification', function($scope, $http, $state, $modal, $location, authService, toaster, API) {
    //获取省级信息
    $http({
        method: 'GET',
        url: API.base_path + 'user/prov/1',
        cache: false,
    }).success(function(data) {
        $scope.provs = data;
        $scope.changeProv = function() {
            $scope.citys = "";
            $scope.regions = "";
            $scope.regioncity = "";
            $scope.companyregion = "";
            if ($scope.regionprov) {
                $http({
                    method: 'GET',
                    url: API.base_path + 'user/city/2?code=' + $scope.regionprov,
                    cache: false,
                }).success(function(data) {
                    $scope.citys = data;

                    $scope.changeCity = function() {
                        $scope.companyregion = "";
                        if ($scope.regioncity) {
                            $http({
                                method: 'GET',
                                url: API.base_path + 'user/region/3?code=' + $scope.regioncity,
                                cache: false,
                            }).success(function(data) {
                                $scope.regions = data;
                            })
                        }
                    }
                })
            }
        }

        //法人身份证
        $scope.openImage1 = function(size) {
            var modalInstance = $modal.open({
                template: "<div style='text-align:center'><img src='" + API.upload + $scope.image1 + "' style='max-width:600px' /></div>",
                size: size,
            });
        }

        //税务登记证
        $scope.openImage2 = function(size) {
            var modalInstance = $modal.open({
                template: "<div style='text-align:center'><img src='" + API.upload + $scope.image2 + "' style='max-width:600px' /></div>",
                size: size,
            });
        }

        //组织机构代码证
        $scope.openImage3 = function(size) {
            var modalInstance = $modal.open({
                template: "<div style='text-align:center'><img src='" + API.upload + $scope.image3 + "' style='max-width:600px' /></div>",
                size: size,
            });
        }

        //经营地点照片
        $scope.openImage4 = function(size) {
            var modalInstance = $modal.open({
                template: "<div style='text-align:center'><img src='" + API.upload + $scope.image4 + "' style='max-width:600px' /></div>",
                size: size,
            });
        }

        $scope.regsubmit = function() {
            if ($scope.ngform.$valid) {
                if ($scope.image1 && $scope.image2 && $scope.image3 && $scope.image4 && $scope.regionprov && $scope.regioncity && $scope.companyregion) {
                    $http({
                        method: 'POST',
                        url: API.base_path + 'user/identify',
                        cache: false,
                        data: {
                            "storeOwner": $scope.storeowner,
                            "bankAccName": $scope.bankaccname,
                            "bankAccNumber": $scope.bankaccnumber,
                            "businessLicence": $scope.businesslicence,
                            "companyAddress": $scope.companyaddress,
                            "companyName": $scope.companyname,
                            "companyRegion": parseInt($scope.companyregion),
                            "organizationCode": $scope.image3,
                            "ownerCardFront": $scope.image1,
                            "regionCity": parseInt($scope.regioncity),
                            "regionProv": parseInt($scope.regionprov),
                            "storeImage": $scope.image4,
                            "storeOwnerCard": $scope.storeownercard,
                            "taxRegCert": $scope.image2,
                            "storeUserId": parseInt(authService.getUserInfo()),
                            "bankOwner": $scope.bankowner
                        }
                    }).success(function(data) {
                        toaster.pop({
                            title: '申请提交成功，请等待管理员审核！',
                        });
                        authService.logout();
                        $scope.islogin = authService.isLoggedIn();
                        window.location.href = '/';

                    }).error(function(data) {
                        toaster.pop({
                            type: 'error',
                            title: data.msg,
                        });
                    })
                } else if (!$scope.image1 || !$scope.image2 || !$scope.image3 || !$scope.image4) {
                    if (!$scope.image1) {
                        var poptext = "法人身份证";
                    } else if (!$scope.image2) {
                        var poptext = "税务登记证";
                    } else if (!$scope.image3) {
                        var poptext = "组织机构代码证";
                    } else if (!$scope.image4) {
                        var poptext = "经营地点照片";
                    }
                    toaster.pop({
                        type: 'error',
                        title: poptext + '未上传，请先上传!',
                    });
                } else {
                    if (!$scope.regionprov || $scope.regionprov == 0) {
                        var poptext1 = "省";
                    } else if (!$scope.regioncity || $scope.regioncity == 0) {
                        var poptext1 = "市";
                    } else if (!$scope.companyregion || $scope.companyregion == 0) {
                        var poptext1 = "区";
                    }
                    toaster.pop({
                        type: 'error',
                        title: "所在" + poptext1 + '未选择，请先选择!',
                    });
                }
            } else {
                toaster.pop({
                    type: 'error',
                    title: '请先填写本页表格!',
                });
            }
        }
    });
})

/**
 * 商品库
 */
//上架的商品
app.controller("onsaleGoods", function($scope, $http, $state, $stateParams, API) {
    if ($stateParams.currentPage) {
        $scope.currentPage = $stateParams.currentPage;
    } else {
        $scope.currentPage = 1;
    }

    if ($stateParams.searchValue) {
        var searchurl = API.base_path + 'commodity/shelve?page=' + $scope.currentPage + '&pageSize=10&goodsState=1&gcNo=' + $stateParams.gcNo + '&searchValue=' + decodeURI($stateParams.searchValue) +
            '&t=' + Date.parse(new Date());
        $scope.gname = decodeURI($stateParams.searchValue);
        $scope.gcNo = $stateParams.gcNo;
    }

    $http({
        method: 'GET',
        cache: false,
        url: API.base_path + 'class'
    }).success(function(classify) {
        $scope.classify = classify;
    });

    $scope.gcnumber = '0';

    $scope.requirement = function() {
        $state.go(
            "shop.requirement", {}
        );
    };

    //初始化
    var goodsName = "";
    var gcNo = 0;
    var url = null;
    var show = function(url) {
        if (!url) {
            url = API.base_path + 'commodity/shelve?page=' + $scope.currentPage + '&pageSize=10&goodsState=1&gcNo=0&t=' + Date.parse(new Date())
        };
        //临时接收
        $scope.tempval = $scope.currentPage;
        $http({
            method: 'GET',
            url: encodeURI(url),
            cache: false,
        }).success(function(data) {
            //临时返回
            $scope.currentPage = $scope.tempval;

            $scope.rows = data.content;
            $scope.totalItems = data.totalElements;

            $scope.pageChanged = function() {
                var goodsName = $scope.gname;
                var gcNo = $scope.gcnumber;
                if (typeof(goodsName) == "undefined") {
                    goodsName = "";
                }
                var url = API.base_path + 'commodity/shelve?pageSize=10&goodsState=1&page=' + $scope.currentPage + '&searchValue=' + goodsName + '&gcNo=' + gcNo;
                show(url);
            };
            $scope.goodsDetails = function(id) {
                if (typeof($scope.gname) == "undefined") {
                    var goodsName = "";
                } else {
                    var goodsName = $scope.gname;
                }
                $state.go(
                    "shop.mygoodsdetails", {
                        type: 'goodsonsale',
                        currentPage: $scope.currentPage,
                        id: id,
                        searchValue: encodeURI(goodsName),
                        gcNo: gcNo,
                    }
                );
            };
            $scope.commentManage = function(id) {
                if (typeof($scope.gname) == "undefined") {
                    var goodsName = "";
                } else {
                    var goodsName = $scope.gname;
                }
                $state.go(
                    "shop.commentManage", {
                        type: 'goodsonsale',
                        currentPage: $scope.currentPage,
                        id: id,
                        searchValue: encodeURI(goodsName),
                        gcNo: gcNo,
                    }
                );
            };
            $scope.search = function() {
                var goodsName = $scope.gname;
                var gcNo = $scope.gcnumber;
                $scope.currentPage = 1;
                if (typeof(goodsName) == "undefined") {
                    goodsName = "";
                }
                show(API.base_path + 'commodity/shelve?pageSize=10&goodsState=1&page=1&searchValue=' + goodsName + '&gcNo=' + gcNo);
            }
        }).error(function(data) {
            console.log(data);
        });
    }
    show(searchurl);
});


//售罄的商品
app.controller("soldoutGoods", function($scope, $http, $state, $stateParams, API) {
    if ($stateParams.currentPage) {
        $scope.currentPage = $stateParams.currentPage;
    } else {
        $scope.currentPage = 1;
    }

    if ($stateParams.searchValue) {
        var searchurl = API.base_path + 'commodity/exhaust?page=' + $scope.currentPage + '&pageSize=10&goodsState=1&gcNo=' + $stateParams.gcNo + '&searchValue=' + decodeURI($stateParams.searchValue) +
            '&t=' + Date.parse(new Date());
        $scope.gname = decodeURI($stateParams.searchValue);
        $scope.gcNo = $stateParams.gcNo;
    }

    $http({
        method: 'GET',
        url: API.base_path + 'class',
        cache: false
    }).success(function(classify) {
        $scope.classify = classify;
    });

    $scope.gcnumber = '0';

    $scope.requirement = function() {
        $state.go(
            "shop.requirement", {}
        );
    };

    //初始化
    var goodsName = "";
    var gcNo = 0;
    var url = null;

    var show = function(url) {
        if (!url) {
            url = API.base_path + 'commodity/exhaust?page=' + $scope.currentPage + '&pageSize=10&gcNo=0&t=' + Date.parse(new Date())
        };
        //临时接收
        $scope.tempval = $scope.currentPage;
        $http({
            method: 'GET',
            url: encodeURI(url),
            cache: false,
        }).success(function(data) {
            //临时返回
            $scope.currentPage = $scope.tempval;

            $scope.rows = data.content;
            $scope.totalItems = data.totalElements;

            $scope.setPage = function(pageNo) {
                $scope.currentPage = pageNo;
            };
            $scope.pageChanged = function() {
                var goodsName = $scope.gname;
                var gcNo = $scope.gcnumber;
                if (typeof(goodsName) == "undefined") {
                    goodsName = "";
                }
                var url = API.base_path + 'commodity/exhaust?pageSize=10&page=' + $scope.currentPage + '&searchValue=' + goodsName + '&gcNo=' + gcNo;
                show(url);
            };
            $scope.goodsDetails = function(id) {
                if (typeof($scope.gname) == "undefined") {
                    var goodsName = "";
                } else {
                    var goodsName = $scope.gname;
                }
                $state.go(
                    "shop.mygoodsdetails", {
                        type: 'goodssoldout',
                        currentPage: $scope.currentPage,
                        id: id,
                        searchValue: encodeURI(goodsName),
                        gcNo: gcNo,
                    }
                );
            };
            $scope.commentManage = function(id) {
                $state.go(
                    "shop.commentManage", {
                        type: 'goodssoldout',
                        currentPage: $scope.currentPage,
                        id: id,
                        searchValue: encodeURI(goodsName),
                        gcNo: gcNo,
                    }
                );
            };
            $scope.search = function() {
                var goodsName = $scope.gname;
                var gcNo = $scope.gcnumber;
                $scope.currentPage = 1;
                if (typeof(goodsName) == "undefined") {
                    goodsName = "";
                }
                show(API.base_path + 'commodity/exhaust?pageSize=10&page=1&searchValue=' + goodsName + '&gcNo=' + gcNo);
            }
        }).error(function(data) {
            console.log(data);
        });
    }
    show();
});

//库存的商品
app.controller("instoreGoods", function($scope, $http, $state, $stateParams, API) {
    if ($stateParams.currentPage) {
        $scope.currentPage = $stateParams.currentPage;
    } else {
        $scope.currentPage = 1;
    }

    if ($stateParams.searchValue) {
        var searchurl = API.base_path + 'commodity/shelve?page=' + $scope.currentPage + '&pageSize=10&goodsState=0&gcNo=' + $stateParams.gcNo + '&searchValue=' + decodeURI($stateParams.searchValue) +
            '&t=' + Date.parse(new Date());
        $scope.gname = decodeURI($stateParams.searchValue);
        $scope.gcNo = $stateParams.gcNo;
    }

    $http({
        method: 'GET',
        cache: false,
        url: API.base_path + 'class'
    }).success(function(classify) {
        $scope.classify = classify;
    });

    $scope.gcnumber = '0';

    $scope.requirement = function() {
        $state.go(
            "shop.requirement", {}
        );
    };

    //初始化
    var goodsName = "";
    var gcNo = 0;
    var url = null;
    var show = function(url) {
        if (!url) {
            url = API.base_path + 'commodity/shelve?page=' + $scope.currentPage + '&pageSize=10&goodsState=0&gcNo=0&t=' + Date.parse(new Date())
        };
        //临时接收
        $scope.tempval = $scope.currentPage;
        $http({
            method: 'GET',
            url: encodeURI(url),
            cache: false,
        }).success(function(data) {
            //临时返回
            $scope.currentPage = $scope.tempval;

            $scope.rows = data.content;
            $scope.totalItems = data.totalElements;

            $scope.pageChanged = function() {
                var goodsName = $scope.gname;
                var gcNo = $scope.gcnumber;
                if (typeof(goodsName) == "undefined") {
                    goodsName = "";
                }
                var url = API.base_path + 'commodity/shelve?pageSize=10&goodsState=0&page=' + $scope.currentPage + '&searchValue=' + goodsName + '&gcNo=' + gcNo;
                show(url);
            };
            $scope.goodsDetails = function(id) {
                if (typeof($scope.gname) == "undefined") {
                    var goodsName = "";
                } else {
                    var goodsName = $scope.gname;
                }
                $state.go(
                    "shop.mygoodsdetails", {
                        type: 'goodsinstore',
                        currentPage: $scope.currentPage,
                        id: id,
                        searchValue: encodeURI(goodsName),
                        gcNo: gcNo,
                    }
                );
            };
            $scope.commentManage = function(id) {
                if (typeof($scope.gname) == "undefined") {
                    var goodsName = "";
                } else {
                    var goodsName = $scope.gname;
                }
                $state.go(
                    "shop.commentManage", {
                        type: 'goodsonsale',
                        currentPage: $scope.currentPage,
                        id: id,
                        searchValue: encodeURI(goodsName),
                        gcNo: gcNo,
                    }
                );
            };
            $scope.search = function() {
                var goodsName = $scope.gname;
                var gcNo = $scope.gcnumber;
                $scope.currentPage = 1;
                if (typeof(goodsName) == "undefined") {
                    goodsName = "";
                }
                show(API.base_path + 'commodity/shelve?pageSize=10&goodsState=0&page=1&searchValue=' + goodsName + '&gcNo=' + gcNo);
            }
        }).error(function(data) {
            console.log(data);
        });
    }
    show(searchurl);
});

//中物华商平台产品库
app.controller("platformGoods", function($scope, $http, $state, $stateParams, API) {
    if ($stateParams.currentPage) {
        $scope.currentPage = $stateParams.currentPage;
    } else {
        $scope.currentPage = 1;
    }

    $http({
        method: 'GET',
        url: API.base_path + 'class',
        cache: false,
    }).success(function(classify) {
        $scope.classify = classify;
    });

    if ($stateParams.searchValue) {
        var searchurl = API.base_path + 'commodity_syl?page=' + $scope.currentPage + '&pageSize=10&goodsState=1&gcNo=' + $stateParams.gcNo + '&searchValue=' + decodeURI($stateParams.searchValue) +
            '&t=' + Date.parse(new Date());
        $scope.gname = decodeURI($stateParams.searchValue);
        $scope.gcNo = $stateParams.gcNo;
    }

    $scope.gcnumber = '0';

    $scope.requirement = function() {
        $state.go(
            "shop.requirement", {}, {
                reload: true
            }
        );
    };

    $scope.myrequirement = function() {
        $state.go(
            "shop.myrequirement", {}, {
                reload: true
            }
        );
    };

    //初始化
    var goodsName = "";
    var gcNo = 0;
    var url = null;

    var show = function(url) {
        if (!url) {
            url = API.base_path + 'commodity_syl?page=' + $scope.currentPage + '&pageSize=10&goodsState=1&gcNo=0&t=' + Date.parse(new Date())
        };
        //临时接收
        $scope.tempval = $scope.currentPage;
        $http({
            method: 'GET',
            url: encodeURI(url),
            cache: false,
        }).success(function(data) {
            //临时返回
            $scope.currentPage = $scope.tempval;
            $scope.rows = data.content;
            $scope.totalItems = data.totalElements;

            $scope.setPage = function(pageNo) {
                $scope.currentPage = pageNo;
            };
            $scope.pageChanged = function() {
                var goodsName = $scope.gname;
                var gcNo = $scope.gcnumber;
                if (typeof(goodsName) == "undefined") {
                    goodsName = "";
                }
                var url = API.base_path + 'commodity_syl?pageSize=10&goodsState=1&page=' + $scope.currentPage + '&searchValue=' + goodsName + '&gcNo=' + gcNo;
                show(url);
            };
            $scope.goodsDetails = function(id) {
                if (typeof($scope.gname) == "undefined") {
                    var goodsName = "";
                } else {
                    var goodsName = $scope.gname;
                }
                var gcNo = $scope.gcnumber;
                $state.go(
                    "shop.platformdetails", {
                        currentPage: $scope.currentPage,
                        id: id,
                        searchValue: encodeURI(goodsName),
                        gcNo: gcNo,
                    }
                );
            };
            $scope.search = function() {
                var goodsName = $scope.gname;
                var gcNo = $scope.gcnumber;
                $scope.currentPage = 1;
                if (typeof(goodsName) == "undefined") {
                    goodsName = "";
                }
                show(API.base_path + 'commodity_syl?pageSize=10&goodsState=1&page=1&searchValue=' + goodsName + '&gcNo=' + gcNo);
            }
        }).error(function(data) {
            console.log(data);
        });
    }
    show(searchurl);
});

//我申请的商品列表
app.controller("myRequirementList", function($scope, $http, $state, authService, API) {
    $scope.returnplatform = function() {
        $state.go('shop.goodsplatform', {}, {
            reload: true
        });
    }

    $http({
        method: 'GET',
        url: API.base_path + 'class',
        cache: false,
    }).success(function(classify) {
        $scope.classify = classify;
    });

    $scope.gcnumber = '0';

    //初始化
    var goodsName = "";
    var gcNo = 0;
    var url = null;

    var show = function(url) {
        if (!url) {
            url = API.base_path + 'commodity_syl?page=1&storeId=' + authService.getStoreId() + '&pageSize=10&gcNo=0&t=' + Date.parse(new Date())
        };
        $http({
            method: 'GET',
            url: encodeURI(url),
            cache: false,
        }).success(function(data) {
            $scope.rows = data.content;
            $scope.totalItems = data.totalElements;
            if (!$scope.currentPage) {
                $scope.currentPage = 1
            }
            $scope.setPage = function(pageNo) {
                $scope.currentPage = pageNo;
            };
            $scope.pageChanged = function() {
                if (typeof(goodsName)) {
                    goodsName = "";
                }
                var url = API.base_path + 'commodity_syl?storeId=' + authService.getStoreId() + '&pageSize=10&goodsState=1&page=' + $scope.currentPage + '&searchValue=' +
                    goodsName + '&gcNo=' + gcNo;
                show(url);
            };
            $scope.goodsDetails = function(id) {
                $state.go(
                    "shop.platformdetails", {
                        currentPage: $scope.currentPage,
                        id: id
                    }
                );
            };
        }).error(function(data) {
            console.log(data);
        });
    }
    show();
});


//母婴店商品详情
app.controller("goodsDetails", function($scope, $http, $stateParams, $state, $filter, toaster, API) {
      $scope.flagGoodstype = $stateParams.type=='goodsonsale';
      console.log( $scope.flagGoodstype);
    $http({
        method: 'GET',
        cache: false,
        url: API.base_path + 'commodity/' + $stateParams.id
    }).success(function(data) {
        $scope.data = data;
        console.log(data);
        $scope.data.offlineTime = $filter("date")($scope.data.offlineTime, 'yyyy-MM-dd HH:mm:ss');
        //获取商品一级分类
        $http({
            method: 'GET',
            cache: false,
            url: API.base_path + 'class'
        }).success(function(classify) {
            $scope.classify = classify;
        });

        //获取商品二级分类
        $http({
            method: 'GET',
            cache: false,
            url: API.base_path + 'class/' + $scope.data.gcNo
        }).success(function(childclassify) {
            $scope.childclassify = childclassify;
        });

        //切换商品一级分类
        $scope.changeClassify = function() {
            if ($scope.pclass != "") {
                $http({
                    method: 'GET',
                    cache: false,
                    url: API.base_path + 'class/' + $scope.pclass
                }).success(function(childclassify) {
                    $scope.childclassify = childclassify;
                });
            }
        }
    });

    //商品上架按钮
    $scope.changeStatus = function() {
        if ($scope.ngform.$valid) {
        	  var changestatus = $scope.data.goodsState == 1 ? 0 : 1;
        	if($scope.data.isAddRetail==1){
	            	if(!$scope.data.retailInitPrice){
	        		 	toaster.pop({
                            type: 'error',
                            title: '分销进货价',
                        });
	            	}else if(!$scope.data.retailPriceLow){
	        			 toaster.pop({
                            type: 'error',
                            title: '分销售价范围开始',
                        });
	            	}else if(!$scope.data.retailPriceHigh){
	            		toaster.pop({
                            type: 'error',
                            title: '分销售价范围结束',
                        });
	            	}else if(!$scope.data.retailSalePrice){
	            		toaster.pop({
                            type: 'error',
                            title: '分销售价！',
                        });
	            	}else if(($scope.data.retailPriceLow)>($scope.data.retailPriceHigh)){
	            		console.log($scope.data.retailPriceLow);
	            		console.log($scope.data.retailPriceHigh);
	            		toaster.pop({
                            type: 'error',
                            title: '分销售价范围开始必须小于分销售价范围结束！',
                        });
	            	}else if (Date.parse(new Date($scope.data.offlineTime)) < Date.parse(new Date()) && changestatus == 1) {
		                toaster.pop({
		                    type: 'error',
		                    title: '上架时间必须晚于当前时间！',
		                });
                    }else{
		            		//上架时间判断
		                    $http({
		                        method: 'PUT',
		                        cache: false,
		                        url: API.base_path + 'commodity/up/' + $stateParams.id + '/' + changestatus,
		                        data: {
		                            sellPrice: $scope.data.goodsSellprice,
				                    stockNumber: $scope.data.stockNumber,
				                    offlineTime: $scope.data.offlineTime,
				                    isRecommend: $scope.data.isRecommend,
				                    goodsSpec: $scope.data.goodsSpec,
				                    goodsBody: $scope.data.goodsBody,
				                    isAddRetail:$scope.data.isAddRetail,
									retailInitPrice:$scope.data.retailInitPrice,
									retailPriceLow: $scope.data.retailPriceLow,
									retailPriceHigh: $scope.data.retailPriceHigh,
									retailSalePrice:$scope.data.retailSalePrice,
									storeAmount: $scope.data.storeAmount,
		                        }
		                    }).success(function(data) {
		                        toaster.pop({
		                            title: '商品状态修改成功！',
		                        });
		                        $state.go(
				                    "shop." + $stateParams.type, {
				                        currentPage: $stateParams.currentPage,
				                    }, {
				                        reload: true
				                    }
				                );
		                    }).error(function(data){
		                    	console.log(data);
		                    })
		            	}
		            }else{
	          
	            //上架时间判断
	            if (Date.parse(new Date($scope.data.offlineTime)) < Date.parse(new Date()) && changestatus == 1) {
	                toaster.pop({
	                    type: 'error',
	                    title: '上架时间必须晚于当前时间！',
	                });
	                return;
	            }
	            $http({
	                method: 'PUT',
	                cache: false,
	                url: API.base_path + 'commodity/up/' + $stateParams.id + '/' + changestatus,
	                data: {
	                    sellPrice: $scope.data.goodsSellprice,
	                    stockNumber: $scope.data.stockNumber,
	                    offlineTime: $scope.data.offlineTime,
	                    isRecommend: $scope.data.isRecommend,
	                    goodsSpec: $scope.data.goodsSpec,
	                    goodsBody: $scope.data.goodsBody,
	                    isAddRetail:$scope.data.isAddRetail,
						retailInitPrice:$scope.data.retailInitPrice,
						retailPriceLow: $scope.data.retailPriceLow,
						retailPriceHigh: $scope.data.retailPriceHigh,
						retailSalePrice:$scope.data.retailSalePrice,
						storeAmount: $scope.data.storeAmount,
	                }
	            }).success(function(data) {
	                toaster.pop({
	                    title: '商品状态修改成功！',
	                });
	                $state.go(
	                    "shop." + $stateParams.type, {
	                        currentPage: $stateParams.currentPage,
	                    }, {
	                        reload: true
	                    }
	                );
	            });
           }
        } else {
            if (!$scope.data.stockNumber) {
                var poptext = "上架数量";
            } else if (!$scope.data.goodsSellprice) {
                var poptext = "产品售价";
            } else if (!$scope.data.goodsBody) {
                var poptext = "产品介绍";
            }
            toaster.pop({
                type: 'error',
                title: poptext + '必须填写！',
            });
        }
    }

    //保存按钮
    $scope.submitbtn = function() {
        if ($scope.ngform.$valid) {
        	
        	if($scope.data.isAddRetail==1){
	            	if(!$scope.data.retailInitPrice){
	        		 	toaster.pop({
                            type: 'error',
                            title: '分销进货价',
                        });
	            	}else if(!$scope.data.retailPriceLow){
	        			 toaster.pop({
                            type: 'error',
                            title: '分销售价范围开始',
                        });
	            	}else if(!$scope.data.retailPriceHigh){
	            		toaster.pop({
                            type: 'error',
                            title: '分销售价范围结束',
                        });
	            	}else if(!$scope.data.retailSalePrice){
	            		toaster.pop({
                            type: 'error',
                            title: '分销售价！',
                        });
	            	}else if(($scope.data.retailPriceLow)>($scope.data.retailPriceHigh)){
	            		console.log($scope.data.retailPriceLow);
	            		console.log($scope.data.retailPriceHigh);
	            		toaster.pop({
                            type: 'error',
                            title: '分销售价范围开始必须小于分销售价范围结束！',
                        });
	            	}else if (Date.parse(new Date($scope.data.offlineTime)) < Date.parse(new Date())) {
                        toaster.pop({
                            type: 'error',
                            title: '下架时间必须晚于当前时间！',
                        });
                    }else{
		            		//上架时间判断
		                    $http({
		                        method: 'PUT',
		                        cache: false,
		                        url: API.base_path + 'commodity/' + $stateParams.id,
		                        data: {
		                            sellPrice: $scope.data.goodsSellprice,
				                    stockNumber: $scope.data.stockNumber,
				                    offlineTime: $scope.data.offlineTime,
				                    isRecommend: $scope.data.isRecommend,
				                    goodsSpec: $scope.data.goodsSpec,
				                    goodsBody: $scope.data.goodsBody,
				                    isAddRetail:$scope.data.isAddRetail,
									retailInitPrice:$scope.data.retailInitPrice,
									retailPriceLow: $scope.data.retailPriceLow,
									retailPriceHigh: $scope.data.retailPriceHigh,
									retailSalePrice:$scope.data.retailSalePrice,
									storeAmount: $scope.data.storeAmount,
		                        }
		                    }).success(function(data) {
		                        toaster.pop({
		                            title: '商品信息修改成功！',
		                        });
		                        $state.go(
				                    "shop." + $stateParams.type, {
				                        currentPage: $stateParams.currentPage,
				                    }, {
				                        reload: true
				                    }
				                );
		                    }).error(function(data){
		                    	console.log(data);
		                    })
		            	}
		            }else{
		            	if (Date.parse(new Date($scope.data.offlineTime)) < Date.parse(new Date())) {
	                        toaster.pop({
	                            type: 'error',
	                            title: '下架时间必须晚于当前时间！',
	                        });
                      }else{
					            $http({
					                method: 'PUT',
					                cache: false,
					                url: API.base_path + 'commodity/' + $stateParams.id,
					                data: {
					                            sellPrice: $scope.data.goodsSellprice,
							                    stockNumber: $scope.data.stockNumber,
							                    offlineTime: $scope.data.offlineTime,
							                    isRecommend: $scope.data.isRecommend,
							                    goodsSpec: $scope.data.goodsSpec,
							                    goodsBody: $scope.data.goodsBody,
							                    isAddRetail:$scope.data.isAddRetail,
												retailInitPrice:$scope.data.retailInitPrice,
												retailPriceLow: $scope.data.retailPriceLow,
												retailPriceHigh: $scope.data.retailPriceHigh,
												retailSalePrice:$scope.data.retailSalePrice,
												storeAmount: $scope.data.storeAmount,
					                        }
					            }).success(function(data) {
					            	console.log(data);
					                toaster.pop({
					                    title: '商品信息修改成功！',
					                });
					                $state.go(
					                    "shop." + $stateParams.type, {
					                        currentPage: $stateParams.currentPage,
					                    }, {
					                        reload: true
					                    }
					                );
					            }).error(function(data) {
					                toaster.pop({
					                    type: 'error',
					                    title: data.msg,
					                });
					            });
		            }
             }
        } else {
            if (!$scope.data.stockNumber) {
                var poptext = "上架数量";
            } else if (!$scope.data.goodsSellprice) {
                var poptext = "产品售价";
            } else if (!$scope.data.goodsBody) {
                var poptext = "产品介绍";
            }
            toaster.pop({
                type: 'error',
                title: poptext + '必须填写！',
            });
        }
    }

    //返回按钮
    $scope.back = function() {
        console.log($stateParams.type);
        $state.go(
            "shop." + $stateParams.type, {
                currentPage: $stateParams.currentPage,
                searchValue: $stateParams.searchValue,
                gcNo: $stateParams.gcNo,
            }
        );
    }
});

//平台商品库商品详情
app.controller("planformDetails", function($scope, $http, $stateParams, $state, toaster, API, $filter) {
    var show = function() {
        $http({
            method: 'GET',
            cache: false,
            url: API.base_path + 'commodity_syl/' + $stateParams.id
        }).success(function(data) {
            $scope.data = data;
            if ($scope.data.offlineTime) {
                //$scope.data.offlineTime = $filter("date")($scope.data.offlineTime).replace("年","-").replace("月","-").replace("日","");
            } else {
                $scope.data.offlineTime = $filter("date")(new Date().getTime() + 24 * 60 * 60 * 90 * 1000, 'yyyy-MM-dd HH:mm:ss');
            }
            if (!$scope.data.isRecommend) {
                $scope.data.isRecommend = 0;
            }
             if (!$scope.data.isAddRetail) {
                $scope.data.isAddRetail = 0;
            }
            //获取商品一级分类
            $http({
                method: 'GET',
                cache: false,
                url: API.base_path + 'class'
            }).success(function(classify) {
                $scope.classify = classify;
            });

            //获取商品二级分类
            $http({
                method: 'GET',
                cache: false,
                url: API.base_path + 'class/' + $scope.data.gcNo
            }).success(function(childclassify) {
                $scope.childclassify = childclassify;
            });

            //切换商品一级分类
            $scope.changeClassify = function() {
                if ($scope.pclass != "") {
                    $http({
                        method: 'GET',
                        cache: false,
                        url: API.base_path + 'class/' + $scope.pclass
                    }).success(function(childclassify) {
                        $scope.childclassify = childclassify;
                    });
                }
            }

            //商品上架按钮
            $scope.changeStatus = function() {
                if ($scope.ngform.$valid) {
                	if($scope.data.isAddRetail==1){
		            	if(!$scope.data.retailInitPrice){
		        		 	toaster.pop({
	                            type: 'error',
	                            title: '分销进货价',
	                        });
		            	}else if(!$scope.data.retailPriceLow){
		        			 toaster.pop({
	                            type: 'error',
	                            title: '分销售价范围开始',
	                        });
		            	}else if(!$scope.data.retailPriceHigh){
		            		toaster.pop({
	                            type: 'error',
	                            title: '分销售价范围结束',
	                        });
		            	}else if(!$scope.data.retailSalePrice){
		            		toaster.pop({
	                            type: 'error',
	                            title: '分销售价！',
	                        });
		            	}else if(($scope.data.retailPriceLow)>($scope.data.retailPriceHigh)){
		            		console.log($scope.data.retailPriceLow);
		            		console.log($scope.data.retailPriceHigh);
		            		toaster.pop({
	                            type: 'error',
	                            title: '分销售价范围开始必须小于分销售价范围结束！',
	                        });
		            	}else if (Date.parse(new Date($scope.data.offlineTime)) < Date.parse(new Date())) {
	                        toaster.pop({
	                            type: 'error',
	                            title: '上架时间必须晚于当前时间！',
	                        });
	                    }else{
		            		//上架时间判断
		                    $http({
		                        method: 'POST',
		                        cache: false,
		                        url: API.base_path + 'commodity/up/' + $stateParams.id + '/1',
		                        data: {
		                            sellPrice: $scope.data.goodsSellprice,
		                            stockNumber: $scope.data.stockNumber,
		                            offlineTime: $scope.data.offlineTime,
		                            isRecommend: $scope.data.isRecommend,
		                            goodsBody: $scope.data.goodsBody,
		                            isAddRetail:$scope.data.isAddRetail,
									retailInitPrice:$scope.data.retailInitPrice,
									retailPriceLow: $scope.data.retailPriceLow,
									retailPriceHigh: $scope.data.retailPriceHigh,
									retailSalePrice:$scope.data.retailSalePrice,
									storeAmount: $scope.data.storeAmount,
		                        }
		                    }).success(function(data) {
		                        toaster.pop({
		                            title: '商品上架成功！',
		                        });
		                        $state.go("shop.goodsplatform", {
		                            currentPage: $stateParams.currentPage,
		                        });
		                    }).error(function(data){
		                    	console.log(data);
		                    })
		            	}
		            }else{
	            	   //上架时间判断
	                    if (Date.parse(new Date($scope.data.offlineTime)) < Date.parse(new Date())) {
	                        toaster.pop({
	                            type: 'error',
	                            title: '上架时间必须晚于当前时间！',
	                        });
	                        return;
	                    }
	                    $http({
	                        method: 'POST',
	                        cache: false,
	                        url: API.base_path + 'commodity/up/' + $stateParams.id + '/1',
	                        data: {
	                            sellPrice: $scope.data.goodsSellprice,
	                            stockNumber: $scope.data.stockNumber,
	                            offlineTime: $scope.data.offlineTime,
	                            isRecommend: $scope.data.isRecommend,
	                            goodsBody: $scope.data.goodsBody,
	                            isAddRetail:$scope.data.isAddRetail,
								retailInitPrice:$scope.data.retailInitPrice,
								retailPriceLow: $scope.data.retailPriceLow,
								retailPriceHigh: $scope.data.retailPriceHigh,
								retailSalePrice:$scope.data.retailSalePrice,
								storeAmount: $scope.data.storeAmount,
	                        }
	                    }).success(function(data) {
	                        toaster.pop({
	                            title: '商品上架成功！',
	                        });
	                        $state.go("shop.goodsplatform", {
	                            currentPage: $stateParams.currentPage,
	                        });
	                    });
		            }
                 
                } else {
                    if (!$scope.data.stockNumber) {
                        var poptext = "上架数量";
                    } else if (!$scope.data.goodsSellprice) {
                        var poptext = "产品售价";
                    } else if (!$scope.data.goodsBody) {
                        var poptext = "产品介绍";
                    }
                    toaster.pop({
                        type: 'error',
                        title: poptext + '必须填写！',
                    });
                }
            }

            //保存到我的仓库按钮
            $scope.submit = function() {
                if ($scope.ngform.$valid) {
                	if($scope.data.isAddRetail==1){
		            	if(!$scope.data.retailInitPrice){
		        		 	toaster.pop({
	                            type: 'error',
	                            title: '分销进货价',
	                        });
		            	}else if(!$scope.data.retailPriceLow){
		        			 toaster.pop({
	                            type: 'error',
	                            title: '分销售价范围开始',
	                        });
		            	}else if(!$scope.data.retailPriceHigh){
		            		toaster.pop({
	                            type: 'error',
	                            title: '分销售价范围结束',
	                        });
		            	}else if(!$scope.data.retailSalePrice){
		            		toaster.pop({
	                            type: 'error',
	                            title: '分销售价！',
	                        });
		            	}else if(($scope.data.retailPriceLow)>($scope.data.retailPriceHigh)){
		            		console.log($scope.data.retailPriceLow);
		            		console.log($scope.data.retailPriceHigh);
		            		toaster.pop({
	                            type: 'error',
	                            title: '分销售价范围开始必须小于分销售价范围结束！',
	                        });
		            	}else if (Date.parse(new Date($scope.data.offlineTime)) < Date.parse(new Date())) {
	                        toaster.pop({
	                            type: 'error',
	                            title: '上架时间必须晚于当前时间！',
	                        });
	                    }else{
		            		//上架时间判断
		                    $http({
		                        method: 'POST',
		                        cache: false,
		                        url: API.base_path + 'commodity/up/' + $stateParams.id + '/0',
		                        data: {
		                            sellPrice: $scope.data.goodsSellprice,
		                            stockNumber: $scope.data.stockNumber,
		                            offlineTime: $scope.data.offlineTime,
		                            isRecommend: $scope.data.isRecommend,
		                            goodsBody: $scope.data.goodsBody,
		                            isAddRetail:$scope.data.isAddRetail,
									retailInitPrice:$scope.data.retailInitPrice,
									retailPriceLow: $scope.data.retailPriceLow,
									retailPriceHigh: $scope.data.retailPriceHigh,
									retailSalePrice:$scope.data.retailSalePrice,
									storeAmount: $scope.data.storeAmount,
		                        }
		                    }).success(function(data) {
		                        toaster.pop({
		                            title: '商品入库成功！',
		                        });
		                        $state.go("shop.goodsplatform", {
		                            currentPage: $stateParams.currentPage,
		                        });
		                    }).error(function(data){
		                    	console.log(data);
		                    })
		            	}
		            }else{
		            	
	                    $http({
	                        method: 'POST',
	                        cache: false,
	                        url: API.base_path + 'commodity/up/' + $stateParams.id + '/0',
	                        data: {
	                            sellPrice: $scope.data.goodsSellprice,
	                            stockNumber: $scope.data.stockNumber,
	                            offlineTime: $scope.data.offlineTime,
	                            isRecommend: $scope.data.isRecommend,
	                            goodsBody: $scope.data.goodsBody,
	                            isAddRetail:$scope.data.isAddRetail,
								retailInitPrice:$scope.data.retailInitPrice,
								retailPriceLow: $scope.data.retailPriceLow,
								retailPriceHigh: $scope.data.retailPriceHigh,
								retailSalePrice:$scope.data.retailSalePrice,
								storeAmount: $scope.data.storeAmount,
	                        }
	                    }).success(function(data) {
	                        toaster.pop({
	                            title: '商品入库成功！',
	                        });
	                        $state.go("shop.goodsplatform", {
	                            currentPage: $stateParams.currentPage,
	                        });
	                    });
		            }
                	
                	
                } else {
                	debugger;
                    if (!$scope.data.stockNumber) {
                        var poptext = "上架数量";
                    } else if (!$scope.data.goodsSellprice) {
                        var poptext = "产品售价";
                    } else if (!$scope.data.goodsBody) {
                        var poptext = "产品介绍";
                    }
                    toaster.pop({
                        type: 'error',
                        title: poptext + '必须填写！',
                    });
                }
            }

            //返回按钮
            $scope.back = function() {
                $state.go(
                    "shop.goodsplatform", {
                        currentPage: $stateParams.currentPage,
                        searchValue: $stateParams.searchValue,
                        gcNo: $stateParams.gcNo,
                    }
                );
            }

        });
    }
    show();

    console.log($scope.$state);
    console.log($stateParams.currentPage);
    console.log($stateParams.id);
});

//商品申请
app.controller("submitGoods", function($scope, $http, $modal, $state, toaster, API) {
    //商品分类
    $http({
        method: 'GET',
        cache: false,
        url: API.base_path + 'class'
    }).success(function(classify) {
        $scope.classify = classify;
    });

    //临时品牌列表
    $http({
        method: 'GET',
        cache: false,
        url: API.base_path + 'brand'
    }).success(function(brandname) {
        $scope.brandname = brandname;
    });

    $scope.changeClassify = function() {
        if ($scope.pclass != "") {
            $http({
                method: 'GET',
                cache: false,
                url: API.base_path + 'class/' + $scope.pclass
            }).success(function(childclassify) {
                $scope.childclassify = childclassify;
            });
        }
    }

    $scope.bigimage = $scope.goodsbigimage;

    $scope.openBigImage = function(size) {
        var modalInstance = $modal.open({
            template: "<div><img src='" + API.upload + $scope.goodsbigimage + "' max-width='600px' /></div>",
            //controller: 'ModalInstanceCtrl',
            size: size,
        });
    }

    $scope.reset = function() {
        $scope.goodsbody = "";
    }

    $scope.submit = function() {
        if ($scope.ngform.$valid) {
            if ($scope.goodsbody && $scope.goodsbigimage) {
                $http({
                    method: 'POST',
                    cache: false,
                    url: API.base_path + 'commodity',
                    data: {
                        goodsName: $scope.goodsname,
                        brandNo: $scope.brand,
                        //brandName: ,
                        gcNo: $scope.pclass,
                        //gcName,
                        goodsSn: $scope.goodssn,
                        //gcLitName,
                        gcLitId: $scope.cclass,
                        goodsSpec: $scope.goodsspec,
                        goodsImage: $scope.goodsbigimage,
                        goodsImageSmall: $scope.goodsbigimage,
                        goodsBody: $scope.goodsbody
                    }
                }).success(function(data) {
                    toaster.pop({
                        title: data.msg,
                    });
                    $state.go("shop.goodsplatform", {}, {
                        reload: true
                    });
                }).error(function(data) {
                    toaster.pop({
                        title: data.msg,
                    });
                });
            } else {
                if (!$scope.goodsbody) {
                    toaster.pop({
                        type: 'error',
                        title: '请填写产品介绍！',
                    });
                } else if (!$scope.goodsbigimage) {
                    toaster.pop({
                        type: 'error',
                        title: '请上传商品图片！',
                    });
                }
            }
        }
    }
});

//评论管理
app.controller('commentManage', function($scope, $http, $state, $stateParams, toaster, API) {
    $http({
        method: 'GET',
        cache: false,
        url: API.base_path + 'commodity/' + $stateParams.id + "?t=" + Date.parse(new Date()),
        cache: false
    }).success(function(data) {
        $scope.goodsdata = data;
    });
    $http({
        method: 'GET',
        cache: false,
        url: API.base_path + 'comment/' + $stateParams.id,
        cache: false
    }).success(function(data) {
        $scope.comments = data;
        $scope.commentcount = data.length;

        //计算平均分
        var totalScores = 0;
        data.forEach(function(comment) {
            totalScores = totalScores + comment.gevalScores;
        });
        $scope.avgscores = (totalScores / (data.length)).toFixed(2);
        if (isNaN($scope.avgscores)) {
            $scope.avgscores = 0.00;
        }

        $scope.hideComment = function(id, currentStatus) {
            var newStatus = currentStatus == 1 ? 0 : 1;
            $http({
                method: 'PUT',
                url: API.base_path + 'comment/' + id + '/' + newStatus,
                data: {
                    id: id,
                    status: newStatus
                },
                cache: false
            }).success(function(data) {
                toaster.pop({
                    title: '操作成功，评论状态已更改！',
                });
                $state.go("shop.commentManage", {
                    currentPage: $stateParams.currentPage,
                    id: $stateParams.id
                }, {
                    reload: true
                });
            });
        }
    });

    $scope.back = function() {
        $state.go("shop." + $stateParams.type, {
            currentPage: $stateParams.currentPage,
            searchValue: $stateParams.searchValue,
            gcNo: $stateParams.gcNo,
        }, {
            reload: true
        });
    }
});

//我的服务
/*
app.controller('myServices', function ($scope,$modal,$http,$state,toaster,API,authService) {
    $http({
        method: 'GET',
        url: API.base_path+'service',
        cache: false
    }).success(function(data){
        $scope.data = data;
    });

    $scope.open = function (size) {
        var modalInstance = $modal.open({
            templateUrl: 'views/good/serviceQRcodeModel.html',
            //controller: 'ModalInstanceCtrl',
            size: size,
        });
    }
    $scope.openServiceImage = function (size) {
        var modalInstance = $modal.open({
            template: "<div style='margin:0 auto;width:280px'><img src='"+API.upload+$scope.data.serviceInfo.servicePic+"'></div>",
            //controller: 'ModalInstanceCtrl',
            size: size,
        });
    }

    $scope.changeStatus = function(){
        var serviceStatus = $scope.data.serviceState==1?0:1;
        var id = $scope.data.id;
        $http({
            method: 'PUT',
            cache: false,
            url: API.base_path+'service/'+id+'/'+serviceStatus,
            data: {
                serviceStatus: serviceStatus,
                id: id,
            }
        }).success(function(data){
            toaster.pop({
                title: '操作成功，服务状态已更改！',
            });
            $state.go("shop.service",{},{reload: true});
        });
    }
})
*/

//我的订单(全部)
app.controller('ordersListAll', function($scope, $http, $modal, $filter, API, toaster, authService) {
    var url = "";
    if (!$scope.stime) {
        $scope.stime = $filter("date")(new Date().getTime() - 24 * 60 * 60 * 90 * 1000, 'yyyy-MM-dd');
    }

    if (!$scope.etime) {
        $scope.etime = $filter("date")(new Date(), 'yyyy-MM-dd');
    }
    if (typeof($scope.searchvalue) == 'undefined') {
        $scope.searchvalue = "";
    }
    var show = function(url) {
        if (!url) {
            var url = API.base_path + 'orders?page=1&pageSize=10'
        };
        if (!$scope.searchtype) {
            $scope.searchtype = 1
        };
        $http({
            method: 'GET',
            url: encodeURI(url),
            cache: false,
        }).success(function(data) {
            $scope.rows = data.content;
            $scope.totalItems = data.totalElements;
            if (!$scope.currentPage) {
                $scope.currentPage = 1
            }
            $scope.setPage = function(pageNo) {
                $scope.currentPage = pageNo;
            };
            $scope.pageChanged = function() {
                if (typeof($scope.searchvalue) == 'undefined') {
                    $scope.searchvalue = "";
                }
                var url = API.base_path + 'orders?page=' + $scope.currentPage + '&startTime=' + $scope.stime + '&endTime=' + $scope.etime;
                if ($scope.searchvalue) {
                    if ($scope.searchtype == '1') {
                        url += '&orderId=' + $scope.searchvalue;
                    } else if ($scope.searchtype == '2') {
                        url += '&memName=' + $scope.searchvalue;
                    }
                }
                show(url);
            };
            $scope.search = function() {
                if ($scope.etime < $scope.stime) {
                    toaster.pop({
                        type: 'error',
                        title: "开始时间不能晚于结束时间,请重新选择日期",
                    });
                    return false;
                }
                var url = API.base_path + 'orders?page=' + $scope.currentPage + '&startTime=' + $scope.stime + '&endTime=' + $scope.etime;
                if (typeof($scope.searchvalue) == 'undefined') {
                    $scope.searchvalue = "";
                }
                if ($scope.searchtype == '1' && $scope.searchvalue != "") {
                    url += '&orderId=' + $scope.searchvalue;
                } else if ($scope.searchtype == '2') {
                    url += '&memName=' + $scope.searchvalue;
                }
                show(url);
            }

            $scope.details = function(id) {
                var modalInstance = $modal.open({
                    templateUrl: 'views/orders/details.html',
                    controller: 'orderDetailsModal',
                    size: 'lg',
                    resolve: {
                        id: function() {
                            return id;
                        }
                    }
                });
            }
        });
    }

    show();
});

//我的订单(已取消)
app.controller('ordersListCancel', function($scope, $http, $modal, API, $filter, authService) {
    var url = "";
    if (!$scope.stime) {
        $scope.stime = $filter("date")(new Date().getTime() - 24 * 60 * 60 * 90 * 1000, 'yyyy-MM-dd');
    }

    if (!$scope.etime) {
        $scope.etime = $filter("date")(new Date(), 'yyyy-MM-dd');
    }
    if (typeof($scope.searchvalue) == 'undefined') {
        $scope.searchvalue = "";
    }
    var show = function(url) {
        if (!url) {
            var url = API.base_path + 'orders?status=0&page=1&pageSize=10'
        };
        if (!$scope.searchtype) {
            $scope.searchtype = 1
        };
        $http({
            method: 'GET',
            url: encodeURI(url),
            cache: false,
        }).success(function(data) {
            $scope.rows = data.content;
            $scope.totalItems = data.totalElements;
            if (!$scope.currentPage) {
                $scope.currentPage = 1
            }
            $scope.setPage = function(pageNo) {
                $scope.currentPage = pageNo;
            };
            $scope.pageChanged = function() {
                if (typeof($scope.searchvalue) == 'undefined') {
                    $scope.searchvalue = "";
                }
                var url = API.base_path + 'orders?status=0&page=' + $scope.currentPage + '&startTime=' + $scope.stime + '&endTime=' + $scope.etime;
                if ($scope.searchvalue) {
                    if ($scope.searchtype == '1') {
                        url += '&orderId=' + $scope.searchvalue;
                    } else if ($scope.searchtype == '2') {
                        url += '&memName=' + $scope.searchvalue;
                    }
                }
                show(url);
            };
            $scope.search = function() {
                if ($scope.etime < $scope.stime) {
                    toaster.pop({
                        type: 'error',
                        title: "开始时间不能晚于结束时间,请重新选择日期",
                    });
                    return false;
                }
                var url = API.base_path + 'orders?status=0&page=' + $scope.currentPage + '&startTime=' + $scope.stime + '&endTime=' + $scope.etime;
                if (typeof($scope.searchvalue) == 'undefined') {
                    $scope.searchvalue = "";
                }
                if ($scope.searchtype == '1') {
                    url += '&orderId=' + $scope.searchvalue;
                } else if ($scope.searchtype == '2') {
                    url += '&memName=' + $scope.searchvalue;
                }
                show(url);
            }

            $scope.details = function(id) {
                var modalInstance = $modal.open({
                    templateUrl: 'views/orders/details.html',
                    controller: 'orderDetailsModal',
                    size: 'lg',
                    resolve: {
                        id: function() {
                            return id;
                        }
                    }
                });
            }
        });
    }

    show();
});


//我的订单(未支付)
app.controller('ordersListNoPay', function($scope, $http, $modal, API, $filter, authService) {
    var url = "";
    if (!$scope.stime) {
        $scope.stime = $filter("date")(new Date().getTime() - 24 * 60 * 60 * 90 * 1000, 'yyyy-MM-dd');
    }

    if (!$scope.etime) {
        $scope.etime = $filter("date")(new Date(), 'yyyy-MM-dd');
    }
    if (typeof($scope.searchvalue) == 'undefined') {
        $scope.searchvalue = "";
    }
    var show = function(url) {
        if (!url) {
            var url = API.base_path + 'orders?status=10&page=1&pageSize=10'
        };
        if (!$scope.searchtype) {
            $scope.searchtype = 1
        };
        $http({
            method: 'GET',
            url: encodeURI(url),
            cache: false,
        }).success(function(data) {
            $scope.rows = data.content;
            $scope.totalItems = data.totalElements;
            if (!$scope.currentPage) {
                $scope.currentPage = 1
            }
            $scope.setPage = function(pageNo) {
                $scope.currentPage = pageNo;
            };
            $scope.pageChanged = function() {
                if (typeof($scope.searchvalue) == 'undefined') {
                    $scope.searchvalue = "";
                }
                var url = API.base_path + 'orders?status=10&page=' + $scope.currentPage + '&startTime=' + $scope.stime + '&endTime=' + $scope.etime;
                if ($scope.searchvalue) {
                    if ($scope.searchtype == '1') {
                        url += '&orderId=' + $scope.searchvalue;
                    } else if ($scope.searchtype == '2') {
                        url += '&memName=' + $scope.searchvalue;
                    }
                }
                show(url);
            };
            $scope.search = function() {
                if ($scope.etime < $scope.stime) {
                    toaster.pop({
                        type: 'error',
                        title: "开始时间不能晚于结束时间,请重新选择日期",
                    });
                    return false;
                }
                var url = API.base_path + 'orders?status=10&page=' + $scope.currentPage + '&startTime=' + $scope.stime + '&endTime=' + $scope.etime;
                if (typeof($scope.searchvalue) == 'undefined') {
                    $scope.searchvalue = "";
                }
                if ($scope.searchtype == '1') {
                    url += '&orderId=' + $scope.searchvalue;
                } else if ($scope.searchtype == '2') {
                    url += '&memName=' + $scope.searchvalue;
                }
                show(url);
            }

            $scope.details = function(id) {
                var modalInstance = $modal.open({
                    templateUrl: 'views/orders/details.html',
                    controller: 'orderDetailsModal',
                    size: 'lg',
                    resolve: {
                        id: function() {
                            return id;
                        }
                    }
                });
            }
        });
    }

    show();
});

//我的订单(已支付)
app.controller('ordersListPay', function($scope, $http, $modal, API, $filter, authService) {
    var url = "";
    if (!$scope.stime) {
        $scope.stime = $filter("date")(new Date().getTime() - 24 * 60 * 60 * 90 * 1000, 'yyyy-MM-dd');
    }

    if (!$scope.etime) {
        $scope.etime = $filter("date")(new Date(), 'yyyy-MM-dd');
    }
    if (typeof($scope.searchvalue) == 'undefined') {
        $scope.searchvalue = "";
    }
    var show = function(url) {
        if (!url) {
            var url = API.base_path + 'orders?status=20&page=1&pageSize=10'
        };
        if (!$scope.searchtype) {
            $scope.searchtype = 1
        };
        $http({
            method: 'GET',
            url: encodeURI(url),
            cache: false,
        }).success(function(data) {
            $scope.rows = data.content;
            $scope.totalItems = data.totalElements;
            if (!$scope.currentPage) {
                $scope.currentPage = 1
            }
            $scope.setPage = function(pageNo) {
                $scope.currentPage = pageNo;
            };
            $scope.pageChanged = function() {
                if (typeof($scope.searchvalue) == 'undefined') {
                    $scope.searchvalue = "";
                }
                var url = API.base_path + 'orders?status=20&page=' + $scope.currentPage + '&startTime=' + $scope.stime + '&endTime=' + $scope.etime;
                if ($scope.searchvalue) {
                    if ($scope.searchtype == '1') {
                        url += '&orderId=' + $scope.searchvalue;
                    } else if ($scope.searchtype == '2') {
                        url += '&memName=' + $scope.searchvalue;
                    }
                }
                show(url);
            };
            $scope.search = function() {
                if ($scope.etime < $scope.stime) {
                    toaster.pop({
                        type: 'error',
                        title: "开始时间不能晚于结束时间,请重新选择日期",
                    });
                    return false;
                }
                var url = API.base_path + 'orders?status=20&page=' + $scope.currentPage + '&startTime=' + $scope.stime + '&endTime=' + $scope.etime;
                if (typeof($scope.searchvalue) == 'undefined') {
                    $scope.searchvalue = "";
                }
                if ($scope.searchtype == '1') {
                    url += '&orderId=' + $scope.searchvalue;
                } else if ($scope.searchtype == '2') {
                    url += '&memName=' + $scope.searchvalue;
                }
                show(url);
            }

            $scope.details = function(id) {
                var modalInstance = $modal.open({
                    templateUrl: 'views/orders/details.html',
                    controller: 'orderDetailsModal',
                    size: 'lg',
                    resolve: {
                        id: function() {
                            return id;
                        }
                    }
                });
            }
        });
    }

    show();
});

//我的订单(已收货)
app.controller('ordersListReceived', function($scope, $http, $modal, API, $filter, authService) {
    var url = "";
    if (!$scope.stime) {
        $scope.stime = $filter("date")(new Date().getTime() - 24 * 60 * 60 * 90 * 1000, 'yyyy-MM-dd');
    }

    if (!$scope.etime) {
        $scope.etime = $filter("date")(new Date(), 'yyyy-MM-dd');
    }
    if (typeof($scope.searchvalue) == 'undefined') {
        $scope.searchvalue = "";
    }
    var show = function(url) {
        if (!url) {
            var url = API.base_path + 'orders?status=30&page=1&pageSize=10'
        };
        if (!$scope.searchtype) {
            $scope.searchtype = 1
        };
        $http({
            method: 'GET',
            url: encodeURI(url),
            cache: false,
        }).success(function(data) {
            $scope.rows = data.content;
            $scope.totalItems = data.totalElements;
            if (!$scope.currentPage) {
                $scope.currentPage = 1
            }
            $scope.setPage = function(pageNo) {
                $scope.currentPage = pageNo;
            };
            $scope.pageChanged = function() {
                if (typeof($scope.searchvalue) == 'undefined') {
                    $scope.searchvalue = "";
                }
                var url = API.base_path + 'orders?status=30&page=' + $scope.currentPage + '&startTime=' + $scope.stime + '&endTime=' + $scope.etime;
                if ($scope.searchvalue) {
                    if ($scope.searchtype == '1') {
                        url += '&orderId=' + $scope.searchvalue;
                    } else if ($scope.searchtype == '2') {
                        url += '&memName=' + $scope.searchvalue;
                    }
                }
                show(url);
            };
            $scope.search = function() {
                if ($scope.etime < $scope.stime) {
                    toaster.pop({
                        type: 'error',
                        title: "开始时间不能晚于结束时间,请重新选择日期",
                    });
                    return false;
                }
                var url = API.base_path + 'orders?status=30&page=' + $scope.currentPage + '&startTime=' + $scope.stime + '&endTime=' + $scope.etime;
                if (typeof($scope.searchvalue) == 'undefined') {
                    $scope.searchvalue = "";
                }
                if ($scope.searchtype == '1') {
                    url += '&orderId=' + $scope.searchvalue;
                } else if ($scope.searchtype == '2') {
                    url += '&memName=' + $scope.searchvalue;
                }
                show(url);
            }

            $scope.details = function(id) {
                var modalInstance = $modal.open({
                    templateUrl: 'views/orders/details.html',
                    controller: 'orderDetailsModal',
                    size: 'lg',
                    resolve: {
                        id: function() {
                            return id;
                        }
                    }
                });
            }
        });
    }

    show();
});


//我的订单(已评价)
app.controller('ordersListComplete', function($scope, $http, $modal, API, $filter, authService) {
    var url = "";
    if (!$scope.stime) {
        $scope.stime = $filter("date")(new Date().getTime() - 24 * 60 * 60 * 90 * 1000, 'yyyy-MM-dd');
    }

    if (!$scope.etime) {
        $scope.etime = $filter("date")(new Date(), 'yyyy-MM-dd');
    }
    if (typeof($scope.searchvalue) == 'undefined') {
        $scope.searchvalue = "";
    }
    var show = function(url) {
        if (!url) {
            var url = API.base_path + 'orders?status=40&page=1&pageSize=10'
        };
        if (!$scope.searchtype) {
            $scope.searchtype = 1
        };
        $http({
            method: 'GET',
            url: encodeURI(url),
            cache: false,
        }).success(function(data) {
            $scope.rows = data.content;
            $scope.totalItems = data.totalElements;
            if (!$scope.currentPage) {
                $scope.currentPage = 1
            }
            $scope.setPage = function(pageNo) {
                $scope.currentPage = pageNo;
            };
            $scope.pageChanged = function() {
                if (typeof($scope.searchvalue) == 'undefined') {
                    $scope.searchvalue = "";
                }
                var url = API.base_path + 'orders?status=40&page=' + $scope.currentPage + '&startTime=' + $scope.stime + '&endTime=' + $scope.etime;
                if ($scope.searchvalue) {
                    if ($scope.searchtype == '1') {
                        url += '&orderId=' + $scope.searchvalue;
                    } else if ($scope.searchtype == '2') {
                        url += '&memName=' + $scope.searchvalue;
                    }
                }
                show(url);
            };
            $scope.search = function() {
                if ($scope.etime < $scope.stime) {
                    toaster.pop({
                        type: 'error',
                        title: "开始时间不能晚于结束时间,请重新选择日期",
                    });
                    return false;
                }
                var url = API.base_path + 'orders?status=40&page=' + $scope.currentPage + '&startTime=' + $scope.stime + '&endTime=' + $scope.etime;
                if (typeof($scope.searchvalue) == 'undefined') {
                    $scope.searchvalue = "";
                }
                if ($scope.searchvalue) {
                    if ($scope.searchtype == '1') {
                        url += '&orderId=' + $scope.searchvalue;
                    } else if ($scope.searchtype == '2') {
                        url += '&memName=' + $scope.searchvalue;
                    }
                }
                show(url);
            }

            $scope.details = function(id) {
                var modalInstance = $modal.open({
                    templateUrl: 'views/orders/details.html',
                    controller: 'orderDetailsModal',
                    size: 'lg',
                    resolve: {
                        id: function() {
                            return id;
                        }
                    }
                });
            }
        });
    }

    show();
});





//分销订单(全部)
app.controller('fx_ordersListAll', function($scope, $http, $modal, $filter, API, toaster, authService) {
    var url = "";
    if (!$scope.stime) {
        $scope.stime = $filter("date")(new Date().getTime() - 24 * 60 * 60 * 90 * 1000, 'yyyy-MM-dd');
    }

    if (!$scope.etime) {
        $scope.etime = $filter("date")(new Date(), 'yyyy-MM-dd');
    }
    if (typeof($scope.searchvalue) == 'undefined') {
        $scope.searchvalue = "";
    }
    var show = function(url) {
        if (!url) {
            var url = API.base_path + 'orders?isRetail=1&page=1&pageSize=10'
        };
        if (!$scope.searchtype) {
            $scope.searchtype = 1
        };
        $http({
            method: 'GET',
            url: encodeURI(url),
            cache: false,
        }).success(function(data) {
        	console.log(data);
            $scope.rows = data.content;
            $scope.totalItems = data.totalElements;
            if (!$scope.currentPage) {
                $scope.currentPage = 1
            }
            $scope.setPage = function(pageNo) {
                $scope.currentPage = pageNo;
            };
            $scope.pageChanged = function() {
                if (typeof($scope.searchvalue) == 'undefined') {
                    $scope.searchvalue = "";
                }
                var url = API.base_path + 'orders?isRetail=1&page=' + $scope.currentPage + '&startTime=' + $scope.stime + '&endTime=' + $scope.etime;
                if ($scope.searchvalue) {
                    if ($scope.searchtype == '1') {
                        url += '&orderId=' + $scope.searchvalue;
                    } else if ($scope.searchtype == '2') {
                        url += '&memName=' + $scope.searchvalue;
                    }
                }
                show(url);
            };
            $scope.search = function() {
                if ($scope.etime < $scope.stime) {
                    toaster.pop({
                        type: 'error',
                        title: "开始时间不能晚于结束时间,请重新选择日期",
                    });
                    return false;
                }
                var url = API.base_path + 'orders?isRetail=1&page=' + $scope.currentPage + '&startTime=' + $scope.stime + '&endTime=' + $scope.etime;
                if (typeof($scope.searchvalue) == 'undefined') {
                    $scope.searchvalue = "";
                }
                if ($scope.searchtype == '1' && $scope.searchvalue != "") {
                    url += '&orderId=' + $scope.searchvalue;
                } else if ($scope.searchtype == '2') {
                    url += '&memName=' + $scope.searchvalue;
                }
                show(url);
            }

            $scope.details = function(id) {
                var modalInstance = $modal.open({
                    templateUrl: 'views/orders/fxdetails.html',
                    controller: 'fxorderDetailsModal',
                    size: 'lg',
                    resolve: {
                        id: function() {
                            return id;
                        }
                    }
                });
            }
        });
    }

    show();
});

//分销订单(已取消)
app.controller('fx_ordersListCancel', function($scope, $http, $modal, API, $filter, authService) {
    var url = "";
    if (!$scope.stime) {
        $scope.stime = $filter("date")(new Date().getTime() - 24 * 60 * 60 * 90 * 1000, 'yyyy-MM-dd');
    }

    if (!$scope.etime) {
        $scope.etime = $filter("date")(new Date(), 'yyyy-MM-dd');
    }
    if (typeof($scope.searchvalue) == 'undefined') {
        $scope.searchvalue = "";
    }
    var show = function(url) {
        if (!url) {
            var url = API.base_path + 'orders?isRetail=1&status=0&page=1&pageSize=10'
        };
        if (!$scope.searchtype) {
            $scope.searchtype = 1
        };
        $http({
            method: 'GET',
            url: encodeURI(url),
            cache: false,
        }).success(function(data) {
            $scope.rows = data.content;
            $scope.totalItems = data.totalElements;
            if (!$scope.currentPage) {
                $scope.currentPage = 1
            }
            $scope.setPage = function(pageNo) {
                $scope.currentPage = pageNo;
            };
            $scope.pageChanged = function() {
                if (typeof($scope.searchvalue) == 'undefined') {
                    $scope.searchvalue = "";
                }
                var url = API.base_path + 'orders?isRetail=1&status=0&page=' + $scope.currentPage + '&startTime=' + $scope.stime + '&endTime=' + $scope.etime;
                if ($scope.searchvalue) {
                    if ($scope.searchtype == '1') {
                        url += '&orderId=' + $scope.searchvalue;
                    } else if ($scope.searchtype == '2') {
                        url += '&memName=' + $scope.searchvalue;
                    }
                }
                show(url);
            };
            $scope.search = function() {
                if ($scope.etime < $scope.stime) {
                    toaster.pop({
                        type: 'error',
                        title: "开始时间不能晚于结束时间,请重新选择日期",
                    });
                    return false;
                }
                var url = API.base_path + 'orders?isRetail=1&status=0&page=' + $scope.currentPage + '&startTime=' + $scope.stime + '&endTime=' + $scope.etime;
                if (typeof($scope.searchvalue) == 'undefined') {
                    $scope.searchvalue = "";
                }
                if ($scope.searchtype == '1') {
                    url += '&orderId=' + $scope.searchvalue;
                } else if ($scope.searchtype == '2') {
                    url += '&memName=' + $scope.searchvalue;
                }
                show(url);
            }

            $scope.details = function(id) {
                var modalInstance = $modal.open({
                    templateUrl: 'views/orders/fxdetails.html',
                    controller: 'fxorderDetailsModal',
                    size: 'lg',
                    resolve: {
                        id: function() {
                            return id;
                        }
                    }
                });
            }
        });
    }

    show();
});


//分销订单(未支付)
app.controller('fx_ordersListNoPay', function($scope, $http, $modal, API, $filter, authService) {
    var url = "";
    if (!$scope.stime) {
        $scope.stime = $filter("date")(new Date().getTime() - 24 * 60 * 60 * 90 * 1000, 'yyyy-MM-dd');
    }

    if (!$scope.etime) {
        $scope.etime = $filter("date")(new Date(), 'yyyy-MM-dd');
    }
    if (typeof($scope.searchvalue) == 'undefined') {
        $scope.searchvalue = "";
    }
    var show = function(url) {
        if (!url) {
            var url = API.base_path + 'orders?isRetail=1&status=10&page=1&pageSize=10'
        };
        if (!$scope.searchtype) {
            $scope.searchtype = 1
        };
        $http({
            method: 'GET',
            url: encodeURI(url),
            cache: false,
        }).success(function(data) {
            $scope.rows = data.content;
            $scope.totalItems = data.totalElements;
            if (!$scope.currentPage) {
                $scope.currentPage = 1
            }
            $scope.setPage = function(pageNo) {
                $scope.currentPage = pageNo;
            };
            $scope.pageChanged = function() {
                if (typeof($scope.searchvalue) == 'undefined') {
                    $scope.searchvalue = "";
                }
                var url = API.base_path + 'orders?isRetail=1&status=10&page=' + $scope.currentPage + '&startTime=' + $scope.stime + '&endTime=' + $scope.etime;
                if ($scope.searchvalue) {
                    if ($scope.searchtype == '1') {
                        url += '&orderId=' + $scope.searchvalue;
                    } else if ($scope.searchtype == '2') {
                        url += '&memName=' + $scope.searchvalue;
                    }
                }
                show(url);
            };
            $scope.search = function() {
                if ($scope.etime < $scope.stime) {
                    toaster.pop({
                        type: 'error',
                        title: "开始时间不能晚于结束时间,请重新选择日期",
                    });
                    return false;
                }
                var url = API.base_path + 'orders?isRetail=1&status=10&page=' + $scope.currentPage + '&startTime=' + $scope.stime + '&endTime=' + $scope.etime;
                if (typeof($scope.searchvalue) == 'undefined') {
                    $scope.searchvalue = "";
                }
                if ($scope.searchtype == '1') {
                    url += '&orderId=' + $scope.searchvalue;
                } else if ($scope.searchtype == '2') {
                    url += '&memName=' + $scope.searchvalue;
                }
                show(url);
            }

            $scope.details = function(id) {
                var modalInstance = $modal.open({
                    templateUrl: 'views/orders/fxdetails.html',
                    controller: 'fxorderDetailsModal',
                    size: 'lg',
                    resolve: {
                        id: function() {
                            return id;
                        }
                    }
                });
            }
        });
    }

    show();
});

//分销订单(已支付)
app.controller('fx_ordersListPay', function($scope, $http, $modal, API, $filter, authService) {
    var url = "";
    if (!$scope.stime) {
        $scope.stime = $filter("date")(new Date().getTime() - 24 * 60 * 60 * 90 * 1000, 'yyyy-MM-dd');
    }

    if (!$scope.etime) {
        $scope.etime = $filter("date")(new Date(), 'yyyy-MM-dd');
    }
    if (typeof($scope.searchvalue) == 'undefined') {
        $scope.searchvalue = "";
    }
    var show = function(url) {
        if (!url) {
            var url = API.base_path + 'orders?isRetail=1&status=20&page=1&pageSize=10'
        };
        if (!$scope.searchtype) {
            $scope.searchtype = 1
        };
        $http({
            method: 'GET',
            url: encodeURI(url),
            cache: false,
        }).success(function(data) {
            $scope.rows = data.content;
            $scope.totalItems = data.totalElements;
            if (!$scope.currentPage) {
                $scope.currentPage = 1
            }
            $scope.setPage = function(pageNo) {
                $scope.currentPage = pageNo;
            };
            $scope.pageChanged = function() {
                if (typeof($scope.searchvalue) == 'undefined') {
                    $scope.searchvalue = "";
                }
                var url = API.base_path + 'orders?isRetail=1&status=20&page=' + $scope.currentPage + '&startTime=' + $scope.stime + '&endTime=' + $scope.etime;
                if ($scope.searchvalue) {
                    if ($scope.searchtype == '1') {
                        url += '&orderId=' + $scope.searchvalue;
                    } else if ($scope.searchtype == '2') {
                        url += '&memName=' + $scope.searchvalue;
                    }
                }
                show(url);
            };
            $scope.search = function() {
                if ($scope.etime < $scope.stime) {
                    toaster.pop({
                        type: 'error',
                        title: "开始时间不能晚于结束时间,请重新选择日期",
                    });
                    return false;
                }
                var url = API.base_path + 'orders?isRetail=1&status=20&page=' + $scope.currentPage + '&startTime=' + $scope.stime + '&endTime=' + $scope.etime;
                if (typeof($scope.searchvalue) == 'undefined') {
                    $scope.searchvalue = "";
                }
                if ($scope.searchtype == '1') {
                    url += '&orderId=' + $scope.searchvalue;
                } else if ($scope.searchtype == '2') {
                    url += '&memName=' + $scope.searchvalue;
                }
                show(url);
            }

            $scope.details = function(id) {
                var modalInstance = $modal.open({
                    templateUrl: 'views/orders/fxdetails.html',
                    controller: 'fxorderDetailsModal',
                    size: 'lg',
                    resolve: {
                        id: function() {
                            return id;
                        }
                    }
                });
            }
        });
    }

    show();
});

//分销订单(已收货)
app.controller('fx_ordersListReceived', function($scope, $http, $modal, API, $filter, authService) {
    var url = "";
    if (!$scope.stime) {
        $scope.stime = $filter("date")(new Date().getTime() - 24 * 60 * 60 * 90 * 1000, 'yyyy-MM-dd');
    }

    if (!$scope.etime) {
        $scope.etime = $filter("date")(new Date(), 'yyyy-MM-dd');
    }
    if (typeof($scope.searchvalue) == 'undefined') {
        $scope.searchvalue = "";
    }
    var show = function(url) {
        if (!url) {
            var url = API.base_path + 'orders?isRetail=1&status=30&page=1&pageSize=10'
        };
        if (!$scope.searchtype) {
            $scope.searchtype = 1
        };
        $http({
            method: 'GET',
            url: encodeURI(url),
            cache: false,
        }).success(function(data) {
            $scope.rows = data.content;
            $scope.totalItems = data.totalElements;
            if (!$scope.currentPage) {
                $scope.currentPage = 1
            }
            $scope.setPage = function(pageNo) {
                $scope.currentPage = pageNo;
            };
            $scope.pageChanged = function() {
                if (typeof($scope.searchvalue) == 'undefined') {
                    $scope.searchvalue = "";
                }
                var url = API.base_path + 'orders?isRetail=1&status=30&page=' + $scope.currentPage + '&startTime=' + $scope.stime + '&endTime=' + $scope.etime;
                if ($scope.searchvalue) {
                    if ($scope.searchtype == '1') {
                        url += '&orderId=' + $scope.searchvalue;
                    } else if ($scope.searchtype == '2') {
                        url += '&memName=' + $scope.searchvalue;
                    }
                }
                show(url);
            };
            $scope.search = function() {
                if ($scope.etime < $scope.stime) {
                    toaster.pop({
                        type: 'error',
                        title: "开始时间不能晚于结束时间,请重新选择日期",
                    });
                    return false;
                }
                var url = API.base_path + 'orders?isRetail=1&status=30&page=' + $scope.currentPage + '&startTime=' + $scope.stime + '&endTime=' + $scope.etime;
                if (typeof($scope.searchvalue) == 'undefined') {
                    $scope.searchvalue = "";
                }
                if ($scope.searchtype == '1') {
                    url += '&orderId=' + $scope.searchvalue;
                } else if ($scope.searchtype == '2') {
                    url += '&memName=' + $scope.searchvalue;
                }
                show(url);
            }

            $scope.details = function(id) {
                var modalInstance = $modal.open({
                    templateUrl: 'views/orders/fxdetails.html',
                    controller: 'fxorderDetailsModal',
                    size: 'lg',
                    resolve: {
                        id: function() {
                            return id;
                        }
                    }
                });
            }
        });
    }

    show();
});


//分销订单(已评价)
app.controller('fx_ordersListComplete', function($scope, $http, $modal, API, $filter, authService) {
    var url = "";
    if (!$scope.stime) {
        $scope.stime = $filter("date")(new Date().getTime() - 24 * 60 * 60 * 90 * 1000, 'yyyy-MM-dd');
    }

    if (!$scope.etime) {
        $scope.etime = $filter("date")(new Date(), 'yyyy-MM-dd');
    }
    if (typeof($scope.searchvalue) == 'undefined') {
        $scope.searchvalue = "";
    }
    var show = function(url) {
        if (!url) {
            var url = API.base_path + 'orders?isRetail=1&status=40&page=1&pageSize=10'
        };
        if (!$scope.searchtype) {
            $scope.searchtype = 1
        };
        $http({
            method: 'GET',
            url: encodeURI(url),
            cache: false,
        }).success(function(data) {
            $scope.rows = data.content;
            $scope.totalItems = data.totalElements;
            if (!$scope.currentPage) {
                $scope.currentPage = 1
            }
            $scope.setPage = function(pageNo) {
                $scope.currentPage = pageNo;
            };
            $scope.pageChanged = function() {
                if (typeof($scope.searchvalue) == 'undefined') {
                    $scope.searchvalue = "";
                }
                var url = API.base_path + 'orders?isRetail=1&status=40&page=' + $scope.currentPage + '&startTime=' + $scope.stime + '&endTime=' + $scope.etime;
                if ($scope.searchvalue) {
                    if ($scope.searchtype == '1') {
                        url += '&orderId=' + $scope.searchvalue;
                    } else if ($scope.searchtype == '2') {
                        url += '&memName=' + $scope.searchvalue;
                    }
                }
                show(url);
            };
            $scope.search = function() {
                if ($scope.etime < $scope.stime) {
                    toaster.pop({
                        type: 'error',
                        title: "开始时间不能晚于结束时间,请重新选择日期",
                    });
                    return false;
                }
                var url = API.base_path + 'orders?isRetail=1&status=40&page=' + $scope.currentPage + '&startTime=' + $scope.stime + '&endTime=' + $scope.etime;
                if (typeof($scope.searchvalue) == 'undefined') {
                    $scope.searchvalue = "";
                }
                if ($scope.searchvalue) {
                    if ($scope.searchtype == '1') {
                        url += '&orderId=' + $scope.searchvalue;
                    } else if ($scope.searchtype == '2') {
                        url += '&memName=' + $scope.searchvalue;
                    }
                }
                show(url);
            }

            $scope.details = function(id) {
                var modalInstance = $modal.open({
                    templateUrl: 'views/orders/fxdetails.html',
                    controller: 'fxorderDetailsModal',
                    size: 'lg',
                    resolve: {
                        id: function() {
                            return id;
                        }
                    }
                });
            }
        });
    }

    show();
});


//订单详情模态框
app.controller('orderDetailsModal', function($scope, $modalInstance, id,$http,API,toaster) {
    $scope.id = id;

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
    $scope.sendgoods=function(orderid){
    		 $http({
                method: 'PUT',
                url: API.base_path + 'order/'+orderid,
                cache: false,
                data:{
                	
                },
            }).success(function(response) {
                toaster.pop({
                    type: 'success',
                    title: '发货成功',
                });
                $scope.cancel();
            }).error(function(response) {
                toaster.pop({
                    type: 'error',
                    title: response.msg,
                });
            });
    }
})

//订单详情
app.controller('orderDetailsModalContent', function($scope, $http, API) {
    $http({
        method: 'GET',
        cache: false,
        url: API.base_path + 'order/' + $scope.id
    }).success(function(data) {
        $scope.data = data;
    })
});



//分销订单详情模态框
app.controller('fxorderDetailsModal', function($scope, $modalInstance, id,$http,API,toaster) {
    $scope.id = id;

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
    $scope.sendgoods=function(valid,orderid,flowCompanyName,flowNum){
    	console.log(flowCompanyName);
    	console.log(flowNum);
    	if(valid=='1'){
    		if((flowCompanyName!=undefined)&&(flowNum!=undefined)&&(flowCompanyName!='')&&(flowNum!='')){
	    		 $http({
	                method: 'PUT',
	                url: API.base_path + 'order/'+orderid,
	                cache: false,
	                data:{
		    			flowCompanyName:flowCompanyName,
		    			flowNum:flowNum,
	    			},
	            }).success(function(response) {
	                toaster.pop({
	                    type: 'success',
	                    title: '发货成功',
	                });
	                 $scope.cancel();
	            }).error(function(response) {
	                toaster.pop({
	                    type: 'error',
	                    title: response.msg,
	                });
	            });
    		}else{
    			toaster.pop({
	                    type: 'error',
	                    title:'请填写物流信息',
	                });
    		}
    		
    	}else if(valid=='2'){
    		$http({
	                method: 'PUT',
	                url: API.base_path + 'order/'+orderid,
	                cache: false,
	                data: {
	                	flowCompanyName:'',
	    				flowNum:''
	    				},
	            }).success(function(response) {
	                toaster.pop({
	                    type: 'success',
	                    title: '发货成功',
	                });
	                $scope.cancel();
	            }).error(function(response) {
	                toaster.pop({
	                    type: 'error',
	                    title: response.msg,
	                });
	            });
    	}
    }
})

//分销订单详情
app.controller('fxorderDetailsModalContent', function($scope, $http, API) {
    $http({
        method: 'GET',
        cache: false,
        url: API.base_path + 'order/' + $scope.id
    }).success(function(data) {
        $scope.data = data;
    })
});


//财务管理
app.controller('finace', function($scope, $state, $http, authService, toaster, API) {
    $http({
        method: 'GET',
        url: API.base_path + 'pay',
        cache: false,
    }).success(function(data) {
        if (data.accBal == null) {
            data.accBal = 0;
        }
        $scope.data = data;
    });

    var show = function() {
        if (!$scope.currentPage) {
            $scope.currentPage = 1;
        }
        $http({
            method: 'GET',
            cache: false,
            url: API.base_path + 'pay/list?page=' + $scope.currentPage + '&pageSize=10&t=' + Date.parse(new Date()),
        }).success(function(historydatas) {
            $scope.historydatas = historydatas.content;
            $scope.totalItems = historydatas.totalElements;
            $scope.setPage = function(pageNo) {
                $scope.currentPage = pageNo;
            };
            $scope.pageChanged = function() {
                show();
            };
        });
    }
    show();

    $scope.details = function(id) {
        $state.go(
            "shop.finacedetails", {
                id: id
            }
        );
    }

    $scope.applyMoneyButton = function() {
        if ($scope.ngform.$valid) {
            $http({
                method: 'POST',
                cache: false,
                url: API.base_path + 'pay',
                data: {
                    storeId: authService.getStoreId(),
                    applyMoney: $scope.applymoney,
                },
            }).success(function(data) {
                if (data.code == 0) {
                    toaster.pop({
                        type: 'error',
                        title: data.msg,
                    });
                } else {
                    toaster.pop({
                        type: 'success',
                        title: '申请提款成功，请等待审核打款！',
                    });
                    $state.go("shop.finace", {}, {
                        reload: true
                    });
                }

            }).error(function(data) {
                toaster.pop({
                    type: 'error',
                    title: data.msg,
                });
            });
        } else {
            toaster.pop({
                type: 'error',
                title: '申请提款失败，请检查申请金额是否为空或超出可申请金额！',
            });
        }
    }
})

//历史收款详情
app.controller('finaceDetails', function($scope, $state, $stateParams, $modal, $http, API) {
    $http({
        method: 'GET',
        cache: false,
        url: API.base_path + 'pay/' + $stateParams.id,
    }).success(function(data) {
        $scope.data = data;
    });

    $scope.open = function(payingCertificate) {
        var modalInstance = $modal.open({
            templateUrl: 'views/finace/boucherModal.html',
            controller: 'payingCertificateModalCtrl',
            resolve: {
                payingCertificate: function() {
                    return payingCertificate;
                }
            }
        });
    }
    $scope.back = function() {
        $state.go(
            "shop.finace", {}
        );
    }
})

//查看凭证模态框
app.controller('payingCertificateModalCtrl', function($scope, payingCertificate) {
        $scope.payingcertificate = payingCertificate;
        console.log(payingCertificate);
    })
    //查看凭证
    // app.controller('payingCertificate', function ($scope) {
    //     $scope.payingcertificate = payingCertificate;
    // })

//会员列表
app.controller('userList', function($scope, $http, $modal, authService, API) {
    $http({
        method: 'GET',
        cache: false,
        url: API.base_path + 'vips',
        params: {
            page: '1',
            pageSize: '10',
            //searchValue:
        }
    });

    var show = function(url) {
        if (!url) {
            url = API.base_path + 'vips?page=1&pageSize=10'
        };
        $http({
            method: 'GET',
            cache: false,
            url: encodeURI(url)
        }).success(function(data) {
            $scope.rows = data.content;
            $scope.totalItems = data.totalElements;
            if (!$scope.currentPage) {
                $scope.currentPage = 1
            }
            $scope.setPage = function(pageNo) {
                $scope.currentPage = pageNo;
            };
            $scope.pageChanged = function() {
                if (typeof($scope.searchvalue) == "undefined") {
                    $scope.searchvalue = "";
                }
                var url = API.base_path + 'vips?pageSize=10&page=' + $scope.currentPage + '&searchValue=' + $scope.searchvalue;
                show(url);
            };
            $scope.open = function(id) {
                var modalInstance = $modal.open({
                    templateUrl: 'views/users/userDetailsModal.html',
                    controller: 'userDetailsModalController',
                    resolve: {
                        id: function() {
                            return id;
                        }
                    }
                });
            }
            $scope.search = function() {
                var searchValue = $scope.searchval;
                $scope.currentPage = 1;
                if (typeof($scope.searchvalue) == "undefined") {
                    $scope.searchvalue = "";
                }
                show(API.base_path + 'vips?pageSize=10&goodsState=1&page=1&searchValue=' + $scope.searchvalue);
            }
        }).error(function(data) {
            console.log(data);
        });
    }
    show();
})

//会员详情模态框
app.controller('userDetailsModalController', function($scope, $modalInstance, id) {
    $scope.id = id;

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
})

//会员详情
app.controller('userDetailsController', function($scope, $http, API) {
    $http({
        method: 'GET',
        cache: false,
        url: API.base_path + 'vips/' + $scope.id
    }).success(function(data) {
        $scope.data = data;
    });
})

//优惠券
app.controller('tradeincardController', function($rootScope, $scope) {
    //默认显示优惠券列表
    $rootScope.tradeincarddetails = 0;

    //新建优惠券
    $scope.createTradincard = function() {
        $rootScope.tradeincarddetails = 1;
    }

    //返回优惠券列表
    $scope.backlist = function() {
        $rootScope.tradeincarddetails = 0;
    }
})

//所有优惠券
app.controller('allTradeincardController', function($rootScope, $scope, $http, $modal, toaster, API) {
    $scope.now = new Date().getTime();
    var url = "";
    var show = function(url) {
        if (!url) {
            var url = API.base_path + 'coupon?status=1&page=1&pageSize=10'
        };
        $http({
            method: 'GET',
            url: encodeURI(url),
            cache: false,
        }).success(function(data) {
            $scope.rows = data.content;
            $scope.totalItems = data.totalElements;
            if (!$scope.currentPage) {
                $scope.currentPage = 1
            }
            $scope.setPage = function(pageNo) {
                $scope.currentPage = pageNo;
            };
            $scope.pageChanged = function() {
                if (typeof($scope.searchvalue) == 'undefined') {
                    $scope.searchvalue = "";
                }
                var url = API.base_path + 'coupon?status=1&pageSize=10&page=' + $scope.currentPage;
                if ($scope.searchvalue) {
                    url += '&couponName=' + $scope.searchvalue;
                }
                show(url);
            };
        });
    }

    $scope.search = function() {
        if (typeof($scope.searchvalue) == 'undefined') {
            $scope.searchvalue = "";
        }
        var url = API.base_path + 'coupon?status=1&page=' + $scope.currentPage + '&couponName=' + $scope.searchvalue;
        show(url);
    }

    $scope.cancelCouponClick = function(id) {
        var modalInstance = $modal.open({
            templateUrl: 'views/marketing/cancelDetails.html',
            controller: 'cancelCouponModal',
            // size: 'lg',
            resolve: {
                id: function() {
                    return id;
                }
            }
        });

        modalInstance.result.then(function(id) {
            $http({
                method: 'DELETE',
                url: API.base_path + "coupon/" + id,
                cache: false,
                data: {
                    "couponId": id,
                }
            }).success(function(data) {
                toaster.pop({
                    type: 'success',
                    title: '操作成功，该优惠券已失效！',
                });
            }).error(function(data) {
                toaster.pop({
                    type: 'error',
                    title: data,
                });
            })
        });
    }

    show();
})

//未开始优惠券
app.controller('ordersListUnstartController', function($rootScope, $scope, $http, $modal, toaster, API) {
    var url = "";
    var show = function(url) {
        if (!url) {
            var url = API.base_path + 'coupon?status=2&page=1&pageSize=10'
        };
        $http({
            method: 'GET',
            url: encodeURI(url),
            cache: false,
        }).success(function(data) {
            $scope.rows = data.content;
            $scope.totalItems = data.totalElements;
            if (!$scope.currentPage) {
                $scope.currentPage = 1
            }
            $scope.setPage = function(pageNo) {
                $scope.currentPage = pageNo;
            };
            $scope.pageChanged = function() {
                if (typeof($scope.searchvalue) == 'undefined') {
                    $scope.searchvalue = "";
                }
                var url = API.base_path + 'coupon?status=2&pageSize=10&page=' + $scope.currentPage;
                if ($scope.searchvalue) {
                    url += '&couponName=' + $scope.searchvalue;
                }
                show(url);
            };
        });
    }

    $scope.search = function() {
        if (typeof($scope.searchvalue) == 'undefined') {
            $scope.searchvalue = "";
        }
        var url = API.base_path + 'coupon?status=2&page=' + $scope.currentPage + '&couponName=' + $scope.searchvalue;
        show(url);
    }

    $scope.cancelCouponClick = function(id) {
        var modalInstance = $modal.open({
            templateUrl: 'views/marketing/cancelDetails.html',
            controller: 'cancelCouponModal',
            // size: 'lg',
            resolve: {
                id: function() {
                    return id;
                }
            }
        });

        modalInstance.result.then(function(id) {
            $http({
                method: 'DELETE',
                url: API.base_path + "coupon/" + id,
                cache: false,
                data: {
                    "couponId": id,
                }
            }).success(function(data) {
                toaster.pop({
                    type: 'success',
                    title: '操作成功，该优惠券已失效！',
                });
            }).error(function(data) {
                toaster.pop({
                    type: 'error',
                    title: data,
                });
            })
        });
    }

    show();
})

//进行中优惠券
app.controller('ordersListOngoingController', function($rootScope, $scope, $http, $modal, toaster, API) {
    var url = "";
    var show = function(url) {
        if (!url) {
            var url = API.base_path + 'coupon?status=3&page=1&pageSize=10'
        };
        $http({
            method: 'GET',
            url: encodeURI(url),
            cache: false,
        }).success(function(data) {
            $scope.rows = data.content;
            $scope.totalItems = data.totalElements;
            if (!$scope.currentPage) {
                $scope.currentPage = 1
            }
            $scope.setPage = function(pageNo) {
                $scope.currentPage = pageNo;
            };
            $scope.pageChanged = function() {
                if (typeof($scope.searchvalue) == 'undefined') {
                    $scope.searchvalue = "";
                }
                var url = API.base_path + 'coupon?status=3&pageSize=10&page=' + $scope.currentPage;
                if ($scope.searchvalue) {
                    url += '&couponName=' + $scope.searchvalue;
                }
                show(url);
            };
        });
    }

    $scope.search = function() {
        if (typeof($scope.searchvalue) == 'undefined') {
            $scope.searchvalue = "";
        }
        var url = API.base_path + 'coupon?status=3&page=' + $scope.currentPage + '&couponName=' + $scope.searchvalue;
        show(url);
    }

    $scope.cancelCouponClick = function(id) {
        var modalInstance = $modal.open({
            templateUrl: 'views/marketing/cancelDetails.html',
            controller: 'cancelCouponModal',
            // size: 'lg',
            resolve: {
                id: function() {
                    return id;
                }
            }
        });

        modalInstance.result.then(function(id) {
            $http({
                method: 'DELETE',
                url: API.base_path + "coupon/" + id,
                cache: false,
                data: {
                    "couponId": id,
                }
            }).success(function(data) {
                toaster.pop({
                    type: 'success',
                    title: '操作成功，该优惠券已失效！',
                });
            }).error(function(data) {
                toaster.pop({
                    type: 'error',
                    title: data,
                });
            })
        });
    }

    show();
})

//已结束优惠券
app.controller('ordersListFinishController', function($rootScope, $scope, $http, $modal, toaster, API) {
    var url = "";
    var show = function(url) {
        if (!url) {
            var url = API.base_path + 'coupon?status=4&page=1&pageSize=10'
        };
        $http({
            method: 'GET',
            url: encodeURI(url),
            cache: false,
        }).success(function(data) {
            $scope.rows = data.content;
            $scope.totalItems = data.totalElements;
            if (!$scope.currentPage) {
                $scope.currentPage = 1
            }
            $scope.setPage = function(pageNo) {
                $scope.currentPage = pageNo;
            };
            $scope.pageChanged = function() {
                if (typeof($scope.searchvalue) == 'undefined') {
                    $scope.searchvalue = "";
                }
                var url = API.base_path + 'coupon?status=4&pageSize=10&page=' + $scope.currentPage;
                if ($scope.searchvalue) {
                    url += '&couponName=' + $scope.searchvalue;
                }
                show(url);
            };
        });
    }

    $scope.search = function() {
        if (typeof($scope.searchvalue) == 'undefined') {
            $scope.searchvalue = "";
        }
        var url = API.base_path + 'coupon?status=4&page=' + $scope.currentPage + '&couponName=' + $scope.searchvalue;
        show(url);
    }

    $scope.cancelCouponClick = function(id) {
        var modalInstance = $modal.open({
            templateUrl: 'views/marketing/cancelDetails.html',
            controller: 'cancelCouponModal',
            // size: 'lg',
            resolve: {
                id: function() {
                    return id;
                }
            }
        });

        modalInstance.result.then(function(id) {
            $http({
                method: 'DELETE',
                url: API.base_path + "coupon/" + id,
                cache: false,
                data: {
                    "couponId": id,
                }
            }).success(function(data) {
                toaster.pop({
                    type: 'success',
                    title: '操作成功，该优惠券已失效！',
                });
            }).error(function(data) {
                toaster.pop({
                    type: 'error',
                    title: data,
                });
            })
        });
    }

    show();
})

//删除门店优惠券模态框
app.controller('cancelCouponModal', function($scope, $modalInstance, id) {
    $scope.submit = function() {
        $modalInstance.close(id);
    }

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
})

//添加门店优惠券
app.controller('tradeincardCreateController', function($rootScope, $scope, $http, API, $state, toaster, authService) {
    $scope.companyname = authService.getCompanyname();
    $scope.couponlimit = 1;

    $scope.submitClick = function() {
        if ($scope.effectivetime > $scope.expirationtime) {
            toaster.pop({
                type: 'error',
                title: "优惠券生效日期不能晚于过期日期",
            });
            return false;
        }
        if ($scope.couponcondition < $scope.couponmoney) {
            toaster.pop({
                type: 'error',
                title: "优惠券面值不能小于订单金额",
            });
            return false;
        }
        if ($scope.ngform.$valid) {
            $http({
                method: 'POST',
                url: API.base_path + "coupon",
                cache: false,
                data: {
                    "couponName": $scope.couponname,
                    "couponNumber": $scope.couponnumber,
                    "couponMoney": $scope.couponmoney,
                    "couponCondition": $scope.couponcondition,
                    "couponLimit": $scope.couponlimit,
                    "effectiveTime": $scope.effectivetime,
                    "expirationTime": $scope.expirationtime,
                    "couponDesc": $scope.coupondesc
                }
            }).success(function(data) {
                toaster.pop({
                    type: 'success',
                    title: '优惠券添加成功！',
                });
                $rootScope.tradeincarddetails = 0;
                $state.go("marketing.tradeincard", {}, {
                    reload: true
                });
            }).error(function(data) {
                toaster.pop({
                    type: 'error',
                    title: data,
                });
            });
        } else {
            toaster.pop({
                type: 'error',
                title: '请先完成优惠券信息填写！',
            });
        }
    }
})
