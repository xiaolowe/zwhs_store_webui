app.filter('asImage',function(API,DEFAULT){
    return function(file_id,param){
        if(!file_id){
            file_id = DEFAULT.placeholder;
        }

        url = API.upload+file_id;
        /*if(param){
        	ext = /\.[^\.]+/.exec(file_id);
        	file_name = file_id.replace(ext,'');
        	param = param.replace("_","x");
        	url = API.upload+file_name+ "," + param+ext;
        }*/
        return url;
    }
});