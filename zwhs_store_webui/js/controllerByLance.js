
/*服务列表 公共*/
app.controller("service",function($scope,$http,$state,API,$modal,authService,toaster){
    $scope.storeid = authService.getStoreId();
    $scope.list=true;
    $scope.detail=false;
    $scope.detail=false;

    $scope.details=function(id){
        $scope.list=false;
        $scope.detail=true;
        $http({ method:'GET',url:API.base_path+'serviceinfo/detail?service_id='+id})
        .success(function(data){
             $scope.serviceinfo=data; console.log(data);
             
         })
    }
    
    $scope.mydetails=function(id){
        $scope.list=false;
       
        $scope.mydetail=true;
        $http({ method:'GET',url:API.base_path+'/servicestore/detail?service_store_id='+id})
        .success(function(data){
             $scope.serviceinfo=data; console.log(data);
             
         })
    }

    $scope.listshow=function(){
        $scope.list=true;
        $scope.detail=false;
        $scope.mydetail=false;
    }

    $scope.apply=function(serviceId){
         $http({
            method: 'POST',
            cache: false,
            url: API.base_path+'servicestore/apply',
            data: {
                "serviceId": serviceId
            }
        }).success(function(data){
            toaster.pop({
                title: '服务申请成功！',
            });
             $state.go("shop.service",null,{reload:true});
        }).error(function(response){
                    toaster.pop({
                        type: 'error',
                        title: '服务已经申请!请在我的服务菜单下查看申请状态',
                    });
                });
    }

    $scope.sell=function(serviceId,state){
        var type=state==1?'上':'下';
         $http({
            method: 'PUT',
            cache: false,
            url: API.base_path+'servicestore/updown/'+serviceId,
            data: {
                "service_state": state
            }
        }).success(function(data){
            toaster.pop({
                title: type+'架成功',
            });
             $scope.mydetails(serviceId);
        }).error(function(response){
                    toaster.pop({
                        type: 'error',
                        title: '错误',
                    });
                });
    }

    $scope.open= function (img) {
        var modalInstance = $modal.open({
            template: "<div style='text-align:center'><img src='"+API.upload+img+"' style='max-width:600px' /></div>",
        });
    }
  
   

})

/*所有服务列表*/
app.controller("allservice",function($scope,$http,$state,API){
    $scope.show = function(url){
        if(!url){url=API.base_path+'serviceinfo/list?service_verify=1'};
        $http({
                method:'GET',
                url:url,
                params:{
                   
                }
            }).success(function(data){
                $scope.rows = data.content;
                console.log($scope.rows);
                $scope.totalItems = data.totalElements;
                if(!$scope.currentPage){
                    $scope.currentPage = 1
                }
                $scope.setPage = function (pageNo) {
                    $scope.currentPage = pageNo;
                };
                $scope.pageChanged = function() {
                        $scope.show(API.base_path+'serviceinfo/list?service_verify=1&pageNo='+$scope.currentPage);
                };
                $scope.goodsDetails = function(id){
                };
        }).error(function(data){
            console.log(data);
        });
    }
    $scope.show();
    $scope.search=function(){
      $scope.show();
    }
});


/*我的服务列表*/
app.controller("myservice",function($scope,$http,$state,API){
    $scope.show = function(url){
        if(!url){url=API.base_path+'servicestore/list'};
        $http({
                method:'GET',
                url:url,
                params:{
                   
                }
            }).success(function(data){
                $scope.rows = data.content;
                console.log($scope.rows);
                $scope.totalItems = data.totalElements;
                if(!$scope.currentPage){
                    $scope.currentPage = 1
                }
                $scope.setPage = function (pageNo) {
                    $scope.currentPage = pageNo;
                };
                $scope.pageChanged = function() {
                        $scope.show(API.base_path+'servicestore/list?pageNo='+$scope.currentPage);
                };
                $scope.goodsDetails = function(id){
                };
        }).error(function(data){
            console.log(data);
        });
    }
    $scope.show();
    $scope.search=function(){
      $scope.show();
    }
});





/*服务订单 公共*/
app.controller("serviceOrders",function($scope,$http,$state,API,$modal,authService,toaster){
    $scope.storeid = authService.getStoreId();
    $scope.list=true;
    $scope.detail=false;
    

    $scope.details=function(id){
        $scope.list=false;
        $scope.detail=true;
        $http({ method:'GET',url:API.base_path+'storeserviceorder/detail?order_id='+id})
        .success(function(data){
             $scope.data=data; console.log(data);
             
         })
    }
 

    $scope.listshow=function(){
        $scope.list=true;
        $scope.detail=false;
       
    }
})


/*服务订单 全部*/
app.controller("serviceOrdersAll",function($scope,$http,$state,API){
        $scope.show = function(url){
        if(!url){url=API.base_path+'storeserviceorder/list'};
        $http({
                method:'GET',
                url:url,
                params:{
                   service_name:$scope.service_name,
                   order_id:$scope.order_id,
                }
            }).success(function(data){
                $scope.rows = data.content;
                console.log($scope.rows);
                $scope.totalItems = data.totalElements;
                if(!$scope.currentPage){
                    $scope.currentPage = 1
                }
                $scope.setPage = function (pageNo) {
                    $scope.currentPage = pageNo;
                };
                $scope.pageChanged = function() {
                        $scope.show(API.base_path+'storeserviceorder/list?pageNo='+$scope.currentPage);
                };
                $scope.goodsDetails = function(id){
                };
        }).error(function(data){
            console.log(data);
        });
    }
    $scope.show();
    $scope.search=function(){
      $scope.show();
    }
});

/*服务订单 已取消*/
app.controller("serviceOrders0",function($scope,$http,$state,API){
        $scope.show = function(url){
        if(!url){url=API.base_path+'storeserviceorder/list?order_status=0'};
        $http({
                method:'GET',
                url:url,
                params:{
                   service_name:$scope.service_name,
                   order_id:$scope.order_id,
                }
            }).success(function(data){
                $scope.rows = data.content;
                console.log($scope.rows);
                $scope.totalItems = data.totalElements;
                if(!$scope.currentPage){
                    $scope.currentPage = 1
                }
                $scope.setPage = function (pageNo) {
                    $scope.currentPage = pageNo;
                };
                $scope.pageChanged = function() {
                        $scope.show(API.base_path+'storeserviceorder/list?order_status=0&pageNo='+$scope.currentPage);
                };
                $scope.goodsDetails = function(id){
                };
        }).error(function(data){
            console.log(data);
        });
    }
    $scope.show();
    $scope.search=function(){
      $scope.show();
    }
});

/*服务订单 未付款*/
app.controller("serviceOrders10",function($scope,$http,$state,API){
        $scope.show = function(url){
        if(!url){url=API.base_path+'storeserviceorder/list?order_status=10'};
        $http({
                method:'GET',
                url:url,
                params:{
                   service_name:$scope.service_name,
                   order_id:$scope.order_id,
                }
            }).success(function(data){
                $scope.rows = data.content;
                console.log($scope.rows);
                $scope.totalItems = data.totalElements;
                if(!$scope.currentPage){
                    $scope.currentPage = 1
                }
                $scope.setPage = function (pageNo) {
                    $scope.currentPage = pageNo;
                };
                $scope.pageChanged = function() {
                        $scope.show(API.base_path+'storeserviceorder/list?order_status=10&pageNo='+$scope.currentPage);
                };
                $scope.goodsDetails = function(id){
                };
        }).error(function(data){
            console.log(data);
        });
    }
    $scope.show();
    $scope.search=function(){
      $scope.show();
    }
});

/*服务订单 已付款*/
app.controller("serviceOrders20",function($scope,$http,$state,API){
        $scope.show = function(url){
        if(!url){url=API.base_path+'storeserviceorder/list?order_status=20'};
        $http({
                method:'GET',
                url:url,
                params:{
                   service_name:$scope.service_name,
                   order_id:$scope.order_id,
                }
            }).success(function(data){
                $scope.rows = data.content;
                console.log($scope.rows);
                $scope.totalItems = data.totalElements;
                if(!$scope.currentPage){
                    $scope.currentPage = 1
                }
                $scope.setPage = function (pageNo) {
                    $scope.currentPage = pageNo;
                };
                $scope.pageChanged = function() {
                        $scope.show(API.base_path+'storeserviceorder/list?order_status=20&pageNo='+$scope.currentPage);
                };
                $scope.goodsDetails = function(id){
                };
        }).error(function(data){
            console.log(data);
        });
    }
    $scope.show();
    $scope.search=function(){
      $scope.show();
    }
});


/*服务订单 已接单*/
app.controller("serviceOrders30",function($scope,$http,$state,API){
        $scope.show = function(url){
        if(!url){url=API.base_path+'storeserviceorder/list?order_status=30'};
        $http({
                method:'GET',
                url:url,
                params:{
                   service_name:$scope.service_name,
                   order_id:$scope.order_id,
                }
            }).success(function(data){
                $scope.rows = data.content;
                console.log($scope.rows);
                $scope.totalItems = data.totalElements;
                if(!$scope.currentPage){
                    $scope.currentPage = 1
                }
                $scope.setPage = function (pageNo) {
                    $scope.currentPage = pageNo;
                };
                $scope.pageChanged = function() {
                        $scope.show(API.base_path+'storeserviceorder/list?order_status=30&pageNo='+$scope.currentPage);
                };
                $scope.goodsDetails = function(id){
                };
        }).error(function(data){
            console.log(data);
        });
    }
    $scope.show();
    $scope.search=function(){
      $scope.show();
    }
});


/*服务订单 已使用*/
app.controller("serviceOrders40",function($scope,$http,$state,API){
        $scope.show = function(url){
        if(!url){url=API.base_path+'storeserviceorder/list?order_status=40'};
        $http({
                method:'GET',
                url:url,
                params:{
                   service_name:$scope.service_name,
                   order_id:$scope.order_id,
                }
            }).success(function(data){
                $scope.rows = data.content;
                console.log($scope.rows);
                $scope.totalItems = data.totalElements;
                if(!$scope.currentPage){
                    $scope.currentPage = 1
                }
                $scope.setPage = function (pageNo) {
                    $scope.currentPage = pageNo;
                };
                $scope.pageChanged = function() {
                        $scope.show(API.base_path+'storeserviceorder/list?order_status=40&pageNo='+$scope.currentPage);
                };
                $scope.goodsDetails = function(id){
                };
        }).error(function(data){
            console.log(data);
        });
    }
    $scope.show();
    $scope.search=function(){
      $scope.show();
    }
});


/*服务订单 已评价*/
app.controller("serviceOrders50",function($scope,$http,$state,API){
        $scope.show = function(url){
        if(!url){url=API.base_path+'storeserviceorder/list?order_status=50'};
        $http({
                method:'GET',
                url:url,
                params:{
                   service_name:$scope.service_name,
                   order_id:$scope.order_id,
                }
            }).success(function(data){
                $scope.rows = data.content;
                console.log($scope.rows);
                $scope.totalItems = data.totalElements;
                if(!$scope.currentPage){
                    $scope.currentPage = 1
                }
                $scope.setPage = function (pageNo) {
                    $scope.currentPage = pageNo;
                };
                $scope.pageChanged = function() {
                        $scope.show(API.base_path+'storeserviceorder/list?order_status=50&pageNo='+$scope.currentPage);
                };
                $scope.goodsDetails = function(id){
                };
        }).error(function(data){
            console.log(data);
        });
    }
    $scope.show();
    $scope.search=function(){
      $scope.show();
    }
});