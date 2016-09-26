/*common logo*/
app.controller("common.uploadFile",function($scope,MyAlbum,API,$modalInstance,$sce,data){
    /*$('#fileupload').change(function(){
        debugger;
        var file=this.files[0];
        var reader=new FileReader();
        reader.onload=function(){
            // 通过 reader.result 来访问生成的 DataURL
            var url=reader.result;
            setImageURL(url);
        };
        reader.readAsDataURL(file);
    });

    var image=new Image();
    function setImageURL(url){
        image.src=url;
    }*/
    $scope.ratio = data.ratio;
    $scope.hideMy = data.hideMy;

    $scope.selectedPhoto = false;
    $scope.selectImage = function(photo){
        $scope.selectedPhoto = photo;
    }
    $scope.choseThis = function(){
        if(!$scope.selectedPhoto){
            alert("请选择一个图片！");
            return false;
        }else{
            $modalInstance.close($scope.selectedPhoto);
        }
    }
   
    $scope.loading = false;
    $scope.crop = function(){
        $scope.loading = true;
        $("#crop").cropper('getCroppedCanvas').toBlob(function (blob) {
            var formData = new FormData();
            filename = blob.type.replace("/",".");
            formData.append('files', blob,filename);
            var size = parseFloat(blob.size / 1024 / 1024);
            if(size > 3){
                $scope.loading = false;
            }else{
                MyAlbum.upload(formData,$scope.hideMy).then(function(data){
                    $scope.loading = false;
                    $modalInstance.close(data);
                });
            }
        });
    }
});

app.controller("level",function($scope,$state,ShopService){
    ShopService.listLevel().then(function(levels){
        $scope.levels = levels;
    });
    $scope.back = function(){
        $state.go("shop.dashboard",{});
    }
})
app.controller("common.myAlbum",function($scope,MyAlbum){
    $scope.pageSize = 10;
    $scope.currentPage = 1;
    $scope.searchValue = "";
    $scope.pageChanged = function(){
        MyAlbum.getMyPhotoes({
            currentPage:$scope.currentPage,
            totalItem:$scope.pageSize,
            searchValue:$scope.searchValue
        }).then(function(photoes){
            $scope.photo_list = photoes;
        });
    }
    $scope.pageChanged();
});


app.controller("user.profileCtrl",function($scope,$http,authService,API){
    $scope.user = authService.getUserInfo();
    var token = authService.getToken();

    $scope.save = function(){
        $http.put(API.profile,{},{params:{token:token,nickName:$scope.user.nickName}}).success(function(response) {
            console.log(response);
        });
    }
});
app.controller("shop.decorate.templates",function($scope,ShopService,$modalInstance){
    ShopService.listTemplate().then(function(templates){
        $scope.templates = templates;
    });
    $scope.select = function(tpl){
        $scope.selectTpl = tpl;
    }
    $scope.save = function(){
        if(!$scope.selectTpl){
            alert("请选择一个模版！")
        }else{
             $modalInstance.close($scope.selectTpl.tplData);
        }
    }
});

app.controller("shop.decorate",function($scope,SHOWCASE,ShopService,authService,toaster,$modal){
    ShopService.get( authService.getStoreId() ).then(function(shop){
        SHOWCASE['tpl-shop'].shopName = shop.companyName;
        $scope.shop = shop;
        if(shop.content){
            $scope.items = angular.fromJson(shop.content);
            $scope.selectedItem = $scope.items[0];
        }else{
            var modalInstance = $modal.open({
                templateUrl: 'views/shop/templates.html',
                controller: 'shop.decorate.templates',
            });
            modalInstance.result.then(function (items) {
                $scope.items = items;
                $scope.selectedItem = $scope.items[0];
            });
        }
    });

    $scope.select = function(item){
        $scope.selectedItem = item;
    }

    $scope.add = function(type){
        $scope.items.push(angular.copy(SHOWCASE[type]));
    }
    $scope.delete = function(item){
        $scope.items.splice($scope.items.indexOf(item),1);
    } 

    $scope.save = function(){
        ShopService.save(angular.toJson($scope.items)).then(function(){
            toaster.pop({type: 'success',title: '保存成功'});
        });
    } 
});

app.controller("weixin.baseCtrl",function($scope,wxService){
    $scope.isBind = false;
    wxService.getInfo().then(function(info){
        $scope.wxInfo = info;
        if(info.appId){
            $scope.isBind = true;
        }
    });

});

app.controller("weixin.my",function($scope,wxService,toaster){
    info = $scope.wxInfo;
    $scope.save = function(){
        wxService.setInfo({
            appId: info.appId,
            appSecret: info.appSecret,
            wecharEntId: info.wecharEntId,
            wechatId:info.wechatId,
            wechatEntName: info.wechatEntName,
        }).then(function(){
            toaster.pop({type: 'success',title: '保存成功'});
        });
    }
})
app.controller("step_one",function($scope,wxService,$state){
    wxService.getInfo().then(function(info){
        $scope.wxInfo = info;
    });
    $scope.save = function(){
        wxService.setInfo($scope.wxInfo).then(function(){
            $state.go("bind.step_two");
        });
    }
})
app.controller("step_two",function($scope,wxService,$state){
    wxService.getInfo().then(function(info){
        $scope.wxInfo = info;
    });
})



app.controller("weixinbindCtrl",function($scope,$state){

});

app.controller("assets.my",function($scope,assetsService){
    $scope.pageSize = 10;
    $scope.currentPage = 1;
    $scope.searchValue = "";
    $scope.pageChanged = function(){
        assetsService.list({
            currentPage:$scope.currentPage,
            totalItem:$scope.pageSize,
            searchValue:$scope.searchValue
        },'my').then(function(assetsData){
            $scope.assetsData = assetsData;
            $scope.assetsList = assetsData.content;
        });
    }
    $scope.del = function(asset){
        assetsService.del(asset.id).then(function(){
            $scope.assetsList.splice($scope.assetsList.indexOf(asset),1);
        });
    }
    $scope.pageChanged();
})

app.controller("weixin.assets_add",function($scope,$sce,assetsService,toaster,$state){
    $scope.trustAsHtml = function(string) {
        return $sce.trustAsHtml(string);
    };
    $scope.save = function(){
        $scope.asset.thumbnailPic = $scope.asset.coverPic;
        assetsService.create($scope.asset).then(function(){
            toaster.pop({type: 'success',title: '保存成功'});
            $state.go("weixin.assets");
        });
    }
})
app.controller("weixin.assets_edit",function($scope,$sce,assetsService,$stateParams,toaster,$state){
    assetsService.get($stateParams.id).then(function(data){
        $scope.asset = data;
    });

    $scope.trustAsHtml = function(string) {
        return $sce.trustAsHtml(string);
    };
    $scope.save = function(){
        assetsService.save($scope.asset).then(function(){
            toaster.pop({type: 'success',title: '保存成功'});
            $state.go("weixin.assets");
        });
    }

})
app.controller("weixin.reply",function($scope,$stateParams,$state){
 
});
app.controller("weixin.reply.keywords",function($scope,wxKeyService){
    $scope.pageSize = 10;
    $scope.currentPage = 1;
    $scope.searchValue = "";
    $scope.pageChanged = function(){
        wxKeyService.getkeys({
            currentPage:$scope.currentPage,
            totalItem:$scope.pageSize,
            searchValue:$scope.searchValue
        }).then(function(data){
            $scope.replies = data.content;
            $scope.repliesData = data;
        });
    }

    $scope.pageChanged();
    $scope.delete=function(reply){
        wxKeyService.delkey(reply.keyId).then(function(){
            $scope.replies.splice($scope.replies.indexOf(reply),1);
        })
    }
})
app.controller("weixin.reply.onAttention",function($scope,wxKeyService,toaster){
    wxKeyService.getKeyWithType(1).then(function(data){
        if(!data.replyConType){
            data = {
                replyConType:'1',
                materialWarehouses:[]
            }
        }
        $scope.onAttention = data;
    });

     $scope.delAsset = function(asset){
        $scope.onAttention.materialWarehouses.splice($scope.onAttention.materialWarehouses.indexOf(asset),1);
    }
    $scope.save = function(){
        wxKeyService.saveOne($scope.onAttention).then(function(){
            toaster.pop({type: 'success',title: '保存成功'});
        });
    }
})
app.controller("weixin.reply.noAnswer",function($scope,wxKeyService,toaster){
    wxKeyService.getKeyWithType(3).then(function(data){
         if(!data.replyConType){
            data = {
                replyConType:'1',
                materialWarehouses:[]
            }
        }
        $scope.noAnswer = data;
    })

    $scope.delAsset = function(asset){
        $scope.noAnswer.materialWarehouses.splice($scope.noAnswer.materialWarehouses.indexOf(asset),1);
    }
    $scope.save = function(){
        wxKeyService.saveOne($scope.noAnswer).then(function(){
            toaster.pop({type: 'success',title: '保存成功'});
        });
    }
})
app.controller("weixin.reply_edit",function($scope,wxKeyService,$stateParams,$state,toaster){
    $scope.edit = true;
    wxKeyService.getAKey($stateParams.id).then(function(data){
        $scope.reply = data;
    });
    $scope.delAsset = function(asset){
        for (var i = 0; i < $scope.reply.materialWarehouses.length; i++) {
            if($scope.reply.materialWarehouses[i] == asset){
                $scope.reply.materialWarehouses.splice($scope.reply.materialWarehouses.indexOf(asset),1);
                continue;
            }
        };
    }
    $scope.save = function(){
        wxKeyService.save($scope.reply).then(function(){
            toaster.pop({type: 'success',title: '保存成功'});
            $state.go("weixin.reply.keywords");
        });
    }
})
app.controller("weixin.reply_add",function($scope,wxKeyService,$state,toaster){
    if(!$scope.reply){
        $scope.reply = {
            replyConType:1,
            materialWarehouses : []
        }
    }
    $scope.delAsset = function(asset){
        for (var i = 0; i < $scope.reply.materialWarehouses.length; i++) {
            if($scope.reply.materialWarehouses[i] == asset){
                $scope.reply.materialWarehouses.splice($scope.reply.materialWarehouses.indexOf(asset),1);
                continue;
            }
        };
    }
    $scope.save = function(){
        wxKeyService.add($scope.reply).then(function(){
            toaster.pop({type: 'success',title: '保存成功'});
            $state.go("weixin.reply.keywords");
        });
    }
})
app.controller("weixin.assets_choose",function($scope,$modalInstance,assetsService){
    $scope.pageSize = 10;
    $scope.currentPage = 1;
    $scope.type = 'my';
    $scope.chooseAssets = function( type ){
        $scope.type = type;
        $scope.pageChanged();
    }
    $scope.pageChanged = function(){
        assetsService.list({
            currentPage:$scope.currentPage,
            totalItem:$scope.pageSize,
            searchValue:""
        },$scope.type).then(function(assetsData){
            $scope.assetsData = assetsData;
            $scope.assetsList = assetsData.content;
        });
    }
    $scope.pageChanged();

    $scope.select = function(asset){
        $scope.selectAsset = asset;
    }
    $scope.choseThis = function(){
        if(!$scope.selectAsset){
            alert("请选择一个素材！");
            return false;
        }else{
            $modalInstance.close($scope.selectAsset);
        }
    }
})
app.controller("weixin.menu",function($scope,wxService,toaster){

    var subItemsPrototype = {
        "title":"菜单标题",
        'type':"image",
        'assets':[],
        'link':{
            'type':2,
            'url':""
        },
    }

    var itemsPrototype = {
        "title":"菜单标题",
        'type':"image",
        'assets':[],
        'link':{
            'type':2,
            'url':""
        },
        "submenu":[]
    }
    $scope.menus = [];

    wxService.getMenu().then(function(menu){
        if(menu){
            $scope.menus = angular.fromJson(menu.content);
        }
    });

    $scope.add = function(){
        if($scope.menus.length <= 3){
            $scope.menus.push(angular.copy(itemsPrototype));
        }
    }
    $scope.itemAdd = function(menu){
        menu.type = "text";
        if(menu.submenu.length <= 5){
            menu.submenu.push(angular.copy(subItemsPrototype));
        }
    }
    $scope.select = function(menu){
        $scope.selectedMenu = menu;
    }
    $scope.menuIsShow = function(menu){
        var show = false;
        if(menu == $scope.selectedMenu){
            show = true;
        }
        for (var i = 0; i < menu.submenu.length; i++) {
            if(menu.submenu[i] == $scope.selectedMenu){
                show = true;
            }
        };
        return show;
    }
    $scope.delete = function(){
        /*if($scope.selectedMenu.submenu.length > 0){
            alert("菜单里面有内容，确定要删？")
        }*/
        if($scope.selectedMenu.submenu){
            for (var i = 0; i < $scope.menus.length; i++) {
                if($scope.menus[i] == $scope.selectedMenu){
                    $scope.menus.splice(i,1);
                }
            }
        }else{
            for (var i = 0; i < $scope.menus.length; i++) {
                for (var j = 0; j < $scope.menus[i].submenu.length; j++) {
                    if($scope.menus[i].submenu[j] == $scope.selectedMenu){
                        $scope.menus[i].submenu.splice(j,1);
                    }
                };
            }
        }
        $scope.selectedMenu = false;
    }

    $scope.delAsset = function(asset){
        for (var i = 0; i < $scope.selectedMenu.assets.length; i++) {
            if($scope.selectedMenu.assets[i] == asset){
                $scope.selectedMenu.assets.splice($scope.selectedMenu.assets.indexOf(asset),1);
                continue;
            }
        };
    }

    $scope.save = function(){
        wxService.setMenu({
            'content':angular.toJson($scope.menus)
        }).then(function(){
            toaster.pop({type: 'success',title: '保存成功'});
        },function(reason){
            reason.msg = reason.msg.replace("io.github.elkan1788.mpsdk4j.exception.WechatApiException:","");
            msg = angular.fromJson(reason.msg);
            switch(msg.errcode){
                case 40016:
                    toaster.pop({type: 'error',title: '菜单不能为空'});
                case 40018:
                    toaster.pop({type: 'error',title: '某个菜单名太长'});
                case 40025:
                    toaster.pop({type: 'error',title: '某个子菜单名太长'});
                case 40019:
                    toaster.pop({type: 'error',title: '某个菜单没有配置图文回复'});
                case 40020:
                    toaster.pop({type: 'error',title: '某个菜单没有配置url'});
                case 40027:
                    toaster.pop({type: 'error',title: '某个子菜单没有配置url'});
                case 40026:
                    toaster.pop({type: 'error',title: '某个子菜单没有配置图文回复'});
                case 48001:
                    toaster.pop({type: 'error',title: '该公众号可能没有自定义菜单的权限'});
                default:
                    toaster.pop({type: 'error',title: '未知错误'})

            }
        })
    }
})

app.controller("common.coupon", function ($scope,couponService,$modalInstance){
    $scope.pageSize = 5;
    $scope.currentPage = 1;
    $scope.pageChanged = function(){
        couponService.list({
            currentPage:$scope.currentPage,
            pageSize:$scope.pageSize,
        }).then(function(data){
            $scope.coupons = data.content;
            $scope.totalItems= data.totalElements;
        });
    }
    $scope.pageChanged();
    $scope.select = function(coupon){
        if(!coupon){
            alert("请选择一个优惠券！");
            return false;
        }else{
            $modalInstance.close(coupon);
        }
    }
})