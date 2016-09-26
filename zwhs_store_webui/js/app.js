var app = angular.module('neuboard', [
	'ui.router',
	'ui.bootstrap',
    'ng.ueditor',
    'ngCookies',
    'ngSanitize',
	'datatables',
	'ngResource',
    'blueimp.fileupload',
    'ui.sortable',
    'ngMessages',
    'toaster'
])

app.config(function($httpProvider){
	$httpProvider.interceptors.push('UserInterceptor');
});

