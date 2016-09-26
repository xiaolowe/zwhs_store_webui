/**
 * NEUBOARD - Responsive Admin Theme
 * Copyright 2014 Authentic Goods Co. http://authenticgoods.co
 *
 * TABLE OF CONTENTS
 * Use @ along with function name to search for the directive.
 *
 *  @pageTitle - Page Title Directive for page title name
 *  @toggleLeftSidebar - Left Sidebar Directive to toggle sidebar navigation
 *  @toggleProfile - Show/Hide Profile View
 *  @toggleRightSidebar - Right Sidebar Directive to toggle sidebar navigation
 *  @navToggleSub - Directive to toggle sub-menu down
 *
 */
/*
 * @pageTitle - Page Title Directive for page title name
 */
function pageTitle($rootScope, $timeout , $cookieStore) {
    return {
        link: function(scope, element) {
            var listener = function(event, toState, toParams, fromState, fromParams) {
                //var title = '母婴店管理后台';
                var title = $cookieStore.get('user_companyname');
                if (toState.data && toState.data.pageTitle) title = 'NeuBoard | ' + toState.data.pageTitle;
                $timeout(function() {
                    element.text(title);
                });
            };
            $rootScope.$on('$stateChangeStart', listener);
        }
    }
};

/*
 * @toggleLeftSidebar - Left Sidebar Directive to toggle sidebar navigation
 */
function toggleLeftSidebar() {
    return {
        restrict: 'A',
        template: '<button ng-click="toggleLeft()" class="sidebar-toggle" id="toggle-left"><i class="fa fa-bars"></i></button>',
        controller: function($scope, $element) {
            $scope.toggleLeft = function() {
                ($(window).width() > 768) ? $('#main-wrapper').toggleClass('sidebar-mini'): $('#main-wrapper').toggleClass('sidebar-opened');
            }
        }
    };
};


/*
 * @toggleRightSidebar - Right Sidebar Directive to toggle sidebar navigation
 */
function toggleRightSidebar() {
    return {
        restrict: 'A',
        template: '<button ng-click="toggleRight()" class="sidebar-toggle" id="toggle-right"><i class="fa fa-indent"></i></button>',
        controller: function($scope, $element) {
            $scope.toggleRight = function() {
                $('#sidebar-right').toggleClass("show");
                $("#toggle-right .fa").toggleClass("fa-indent fa-dedent");
            }
        }
    };
};

/**
 * @navToggleSub - Directive to toggle sub-menu down
 */
function navToggleSub() {
    return {
        restrict: 'A',
        link: function(scope, element) {
            element.navgoco({
                openClass: 'open',
                caretHtml: false,
                accordion:true
            });
        }


    };
};

function datePicker() {
    return {
        restrict: 'A',
        scope:{
            format: '=format',
            minview: '=minview'
        },
        link : function (scope, element) {
            $(function(){
                element.datetimepicker({
                    format: scope.format,
                    language: 'zh-CN',
                    autoclose: true,
                    pickerPosition: "bottom-left",
                    minView: scope.minview,
                });
            });
        }
    }
};

function showcaseElementParser(){
    return {
        restrict: 'E',
        scope: {
          item: '=item'
        },
        template: '<ng-include src="getTemplateUrl()"/>',
        controller: function($scope,$sce) {
            $scope.trustAsHtml = function(string) {
                return $sce.trustAsHtml(string);
            };

            $scope.getTemplateUrl = function() {
                return 'views/showcase/widget/'+$scope.item.type+'.html';
            }
        }
    };
}
function showcaseElementEditor(){
    return {
        restrict: 'E',
        scope: {
          selectedItem: '=item'
        },
        template: '<ng-include src="getTemplateUrl()"/>',
        controller: function($scope,$modal,DEFAULT) {
            $scope.addSlider = function(){
                $scope.selectedItem.items.push({
                    image:DEFAULT.placeholder,
                    link:"",
                })
                return false;
            }
            $scope.deleteSlider = function(item){
                $scope.selectedItem.items.splice($scope.selectedItem.items.indexOf(item),1);
            }
            $scope.getTemplateUrl = function() {
                return 'views/showcase/widget/'+$scope.selectedItem.type+'_editor.html';
            }
            $scope.deleteCoupon = function(coupon){
                $scope.selectedItem.coupons.splice($scope.selectedItem.coupons.indexOf(coupon),1);
            }
        }
    };
}
function uploadFile(){
     return {
        restrict: 'AE',
        scope: {
          link: '=link'
        },
        link:function(scope,element,attrs){
            element.on('click',function(){
                scope.open();
                return false;
            });
        },
        controller: function($scope,$modal,$attrs) {
            var hideMy = $attrs.hidemy=='true' ? true :false;
            $scope.open = function() {
                var modalInstance = $modal.open({
                    templateUrl: 'views/common/uploadFile.html',
                    controller: 'common.uploadFile', 
                    size:"lg",           
                    resolve: {
                        data: function(){
                            ratio_array = $attrs.ratio.split("_");
                            return {
                                ratio:{
                                    width:ratio_array[0],
                                    height:ratio_array[1]  
                                },
                                hideMy:hideMy
                            }
                        }
                    }
                });
                modalInstance.result.then(function (newlink) {
                    $scope.link = newlink;
                });
            }
        }
    };
}
function fileToBlob(){
    return {
        restrict: 'EA',
        link: function (scope, element, attributes) {
            element.find("#file").bind("change", function (changeEvent) {
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    scope.$apply(function () {
                        scope.fileread = loadEvent.target.result;
                    });
                }
                reader.readAsDataURL(changeEvent.target.files[0]);
            });
        }
    }
}
function imageCrop(){
    return {
        restrict: 'EA',
        scope: {
          filedata: '=',
          ratio: '=',
          priview:'='
        },
        link: function (scope, element, attributes) {
            var empty = true;
            scope.$watch('filedata',function(){
                element.attr("src",scope.filedata);
                if(empty){
                    $("#crop").cropper({
                        aspectRatio:  scope.ratio.width / scope.ratio.height,
                        crop: function (e) {
                            var imageData = $(this).cropper('getImageData');
                            var previewAspectRatio = e.width / e.height;

                            var $preview = $('.preview');
                            var previewWidth = $preview.width();
                            var previewHeight = previewWidth / previewAspectRatio;
                            var imageScaledRatio = e.width / previewWidth;

                            $("#crop_size").text(e.width.toFixed(0)+"x"+e.height.toFixed(0));

                            $preview.height(previewHeight).find('img').css({
                                width: imageData.naturalWidth / imageScaledRatio,
                                height: imageData.naturalHeight / imageScaledRatio,
                                marginLeft: -e.x / imageScaledRatio,
                                marginTop: -e.y / imageScaledRatio
                            });
                        }
                    });
                    empty = false;
                }else{
                   $("#crop").cropper('replace', scope.filedata);
                }
            })
        }
    }
}
/**
 * linechart - Directive for morris/linechart
 */
function linechart() {
    function createChart(el_id, options) {
        var myChart = echarts.init(document.getElementById(el_id));  
        myChart.setOption(options);  
        return myChart;
    }

    return {
        restrict: 'EA',
        scope: {
            options: '='
        },
        replace: true,
        template: '<div></div>',
        link: function(scope, element, attrs) {
            return createChart(attrs.id, scope.options)
        }
    }
};

/**
 * select2
 */
function select2(select2Query) {
    return {
        restrict: 'A',
        scope: {
            config: '=',
            ngModel: '=',
            select2Model: '='
        },
        link: function (scope, element, attrs) {
            // 初始化
            var tagName = element[0].tagName,
                config = {
                    allowClear: true,
                    multiple: !!attrs.multiple,
                    placeholder: attrs.placeholder || ' '   // 修复不出现删除按钮的情况
                };

            // 生成select
            if(tagName === 'SELECT') {
                // 初始化
                var $element = $(element);
                delete config.multiple;

                $element
                    .prepend('<option value=""></option>')
                    .val('')
                    .select2(config);

                // model - view
                scope.$watch('ngModel', function (newVal) {
                    setTimeout(function () {
                        $element.find('[value^="?"]').remove();    // 清除错误的数据
                        $element.select2('val', newVal);
                    },0);
                }, true);
                return false;
            }

            // 处理input
            if(tagName === 'INPUT') {
                // 初始化
                var $element = $(element);

                // 获取内置配置
                if(attrs.query) {
                    scope.config = select2Query[attrs.query]();
                }

                // 动态生成select2
                scope.$watch('config', function () {
                    angular.extend(config, scope.config);
                    $element.select2('destroy').select2(config);
                }, true);

                // view - model
                $element.on('change', function () {
                    scope.$apply(function () {
                        scope.select2Model = $element.select2('data');
                    });
                });

                // model - view
                scope.$watch('select2Model', function (newVal) {
                    $element.select2('data', newVal);
                }, true);

                // model - view
                scope.$watch('ngModel', function (newVal) {
                    // 跳过ajax方式以及多选情况
                    if(config.ajax || config.multiple) { return false }

                    $element.select2('val', newVal);
                }, true);
            }
        }
    }
};


function addAsset(){
    return {
        restrict: 'AE',
        scope: {
          contentList: '='
        },
        link:function(scope,element,attrs){
            element.on('click',function(){
                scope.open();
                return false;
            });
        },
        controller: function($scope,$modal) {
            $scope.open = function() {
                var modalInstance = $modal.open({
                    templateUrl: 'views/weixin/assets_choose.html',
                    controller: 'weixin.assets_choose',
                });
                modalInstance.result.then(function (newAsset) {
                    $scope.contentList.push(newAsset);
                });
            }
        }

    }
}


function links(API,authService){
    return {
        restrict: 'AE',
        scope: {
          link: '='
        },
        template:function(){
            return '<select ng-model="link.type">'+
                '<option value="1">主页</option>'+
                '<option value="2">其他链接</option>'+
            '</select>'+
            '<p ng-show="link.type==2"><input type="text" ng-model="link.url"></p>'+
            '<p>例如:http://o2o.syisy.com/</p>'
        },
        link:function(scope){
            if(!scope.link) {
                scope.link = {
                    type : 2,
                    url:''
                }
            };
        },
        controller: function($scope) {
            $scope.$watch("link.type",function(){
                if($scope.link.type == 1){
                    $scope.link.url = API.front_path + "login/" + authService.getStoreId();
                }
            })
            /*var store_id = authService.getStoreId();
            var url = API.front_path + "login/" + store_id;
            var a = $(document.createElement("a")),p=$(document.createElement("p"));
            p.addClass("links");
            a.text("主页").attr("href","").click(function(){
                element.val(url)
            });
            element.before(p.append(a));
            element.after("<p>例子:http://o2o.syisy.com/</p>");*/
        }
    }
}

function addCoupon(){
    return {
        restrict: 'AE',
        scope: {
          coupons: '='
        },
        link:function(scope,element,attrs){
            element.on('click',function(){
                scope.open();
                return false;
            });
        },
        controller: function($scope,$modal,$attrs) {
            $scope.open = function() {
                var modalInstance = $modal.open({
                    templateUrl: 'views/marketing/coupontables.html',
                    controller: 'common.coupon',
                    size:"lg"
                });
                modalInstance.result.then(function (newCoupon) {
                    $scope.coupons.push(newCoupon);
                });
            }
        }
    };
}

/*
 * Pass functions to module
 */
angular
    .module('neuboard')
    .directive('pageTitle', pageTitle)
    .directive('toggleLeftSidebar', toggleLeftSidebar)
    .directive('toggleRightSidebar', toggleRightSidebar)
    .directive('navToggleSub', navToggleSub)
    .directive('datePicker', datePicker)
    .directive('showcaseElementParser', showcaseElementParser)
    .directive('showcaseElementEditor', showcaseElementEditor)
    .directive('uploadFile', uploadFile)
    .directive('linechart', linechart)
    .directive('select2', select2)
    .directive('addAsset', addAsset)
    .directive('fileToBlob', fileToBlob)
    .directive('imageCrop', imageCrop)
    .directive('links', links)
    .directive('addCoupon', addCoupon)