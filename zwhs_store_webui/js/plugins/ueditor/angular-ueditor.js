
/**
Created by Dio on 17-9.
http://inhu.net
 */

(function() {
  "use strict";
  (function() {
    var NGUeditor;
    NGUeditor = angular.module("ng.ueditor", []);
    NGUeditor.directive("ueditor", [
      function() {
        return {
          restrict: "C",
          require: "ngModel",
          scope: {
            config: "=",
            ready: "="
          },
          controller:function($scope,$modal,$filter){
            var asImage = $filter('asImage');
            $scope.open = function(editor){
              var modalInstance = $modal.open({
                  templateUrl: 'views/common/uploadFile.html',
                  controller: 'common.uploadFile', 
                  size:'lg',           
                  resolve: {
                      data: function(){
                          return {
                            ratio:{
                                width:0,
                                height:0
                            },
                            hideMy:false
                          }
                      }
                  }
              });
              modalInstance.result.then(function (newlink) {
                  var img = "<img src="+asImage(newlink,"640_320")+" />";
                  editor.execCommand('inserthtml', img);
                  //editor.setContent(img,true);
              });
            }
          },
          link: function($S, element, attr, ctrl) {
            var _NGUeditor, _updateByRender;
            _updateByRender = false;
            _NGUeditor = (function() {
              function _NGUeditor() {
                this.bindRender();
                this.initEditor();
                return;
              }


              /**
               * 初始化编辑器
               * @return {[type]} [description]
               */

              _NGUeditor.prototype.initEditor = function() {
                var _UEConfig, _editorId, _self;
                _self = this;
                if (typeof UE === 'undefined') {
                  console.error("Please import the local resources of ueditor!");
                  return;
                }
                _UEConfig = $S.config ? $S.config : {};
                _editorId = attr.id ? attr.id : "_editor" + (Date.now());
                element[0].id = _editorId;
                UE.registerUI('uploadimage', function(editor, uiName) {
                    //注册按钮执行时的command命令，使用命令默认就会带有回退操作
                    editor.registerCommand(uiName, {
                        execCommand: function() {
                            $S.open(editor);
                        }
                    });
                    //创建一个button
                    var btn = new UE.ui.Button({
                        //按钮的名字
                        name: uiName,
                        //提示
                        title: uiName,
                        //添加额外样式，指定icon图标，这里默认使用一个重复的icon
                        cssRules: 'background-position:-380px 0;',
                        //点击时执行的命令
                        onclick: function() {
                            //这里可以不用执行命令,做你自己的操作也可
                            editor.execCommand(uiName);
                        }
                    });
                    //当点到编辑内容上时，按钮要做的状态反射
                    editor.addListener('selectionchange', function() {
                        var state = editor.queryCommandState(uiName);
                        if (state == -1) {
                            btn.setDisabled(true);
                            btn.setChecked(false);
                        } else {
                            btn.setDisabled(false);
                            btn.setChecked(state);
                        }
                    });
                    //因为你是添加button,所以需要返回这个button
                    return btn;
                });

                this.editor = new UE.ui.Editor(_UEConfig);
                this.editor.render(_editorId);
                return this.editor.ready(function() {
                  _self.editorReady = true;
                  _self.editor.addListener("contentChange", function() {
                    ctrl.$setViewValue(_self.editor.getContent());
                    if (!_updateByRender) {
                      if (!$S.$$phase) {
                        $S.$apply();
                      }
                    }
                    _updateByRender = false;
                  });
                  if (_self.modelContent && _self.modelContent.length > 0) {
                    _self.setEditorContent();
                  }
                  if (typeof $S.ready === "function") {
                    $S.ready(_self.editor);
                  }
                  $S.$on("$destroy", function() {
                    if (!attr.id && UE.delEditor) {
                      UE.delEditor(_editorId);
                    }
                  });
                });
              };

              _NGUeditor.prototype.setEditorContent = function(content) {
                if (content == null) {
                  content = this.modelContent;
                }
                if (this.editor && this.editorReady) {
                  this.editor.setContent(content);
                }
              };

              _NGUeditor.prototype.bindRender = function() {
                var _self;
                _self = this;
                ctrl.$render = function() {
                  _self.modelContent = (ctrl.$isEmpty(ctrl.$viewValue) ? "" : ctrl.$viewValue);
                  _updateByRender = true;
                  _self.setEditorContent();
                };
              };

              return _NGUeditor;

            })();
            new _NGUeditor();
          }
        };
      }
    ]);
  })();

}).call(this);

//# sourceMappingURL=angular-ueditor.js.map
