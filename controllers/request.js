var fs        = require('fs');
var path      = require('path');

module.exports = Request.inherits( require('./json') );

function Request( params ){
  this._init( params );
}

Request.prototype.remove = function( response, request ){
    var self = this;
  this.models.request
    .remove_all_by_attributes({id : request.params.id})
    .on("success", function(){
          request.redirect( self.create_url('site.cabinet'));
    })
    .on("error", function(err){
          request.params.error = err;
          request.redirect( self.create_url('site.error'));
    })
}
Request.prototype.info = function( response, request ){
  var user = request.user.model, params = { id : request.params.id }, self = this;
  if( user.admin != 1 ) params.user_id = user.id;
  this.models.request.With("files")
    .find_all_by_attributes(params)
    .on("success", function(req){
      response.view_name("r_info.html").send({
        id: req[0].id, files: req[0].files
      })
    })
}
Request.prototype.create_request = function( response, request ){

  var self  = this, files = [];
  for( var p in request.params){
    if(/^file/.test(p)) files.push(request.params[p])
  }
  var dbrequest  = new this.models.request( request.params.request );
//  dbrequest.company_id = request.user.model.id;
  dbrequest.date = new Date();

//  var listener     = response.create_listener();
//  listener.stack <<= this.models.request.find_by_attributes({ id : request.params.id, user_id : request.user.model.id});
  response
    .view_name('main')
    .create_listener()
    .handle_emitter( dbrequest.save() )
    .success(function(){
      if(files.length){
        for (var i = 0; i < files.length; i++) {
          var dir = files[i].path.replace(/tmp.+/,request.user.model.id);
          if(!fs.existsSync(dir)){
            fs.mkdirSync(dir)
          }
          fs.rename(files[i].path, files[i].path.replace(/tmp.+/,request.user.model.id + "/" + files[i].name));
          new self.models.file({
            req_id : dbrequest.id,
            name   : files[i].name
          }).save()
        }
      }
      request.redirect( self.create_url('site.cabinet'));
    })
      .error(function(err){
          request.params.error = err;
          request.redirect( self.create_url('site.error'));
      })
}
Request.prototype.upload = function ( response, request ) {
  var params = {req_id : request.params.req_id};
  for( var p in request.params){
    if(/^file/.test(p)){
      var file = request.params[p]
    }
  }
  var dir = file.path.replace(/tmp.+/,request.user.model.id);
  if(!fs.existsSync(dir)){
    fs.mkdirSync(dir)
  }
  fs.rename(file.path, dir + "/" + file.name);
  this.models.file({
    req_id : request.params.req_id,
    name   : file.name
  }).save()
    .on("success",function(f){
        response.view_name("main").send({
          result : file.name +'|' + f.insertId
        })
    });
}
Request.prototype.file = function ( response, request ) {
  var dir = this.app.base_dir;
  this.models.file.find_by_pk(request.params.fid)
    .on("success", function(f){
      var file = path.join(dir,"files",request.user.model.id+"", f.name);
      console.log(file);
      if(fs.existsSync(file))
        request.client.send_file(file);
      else console.log("not_ex")
    })
    .on("error", function(err){
      request.params.error = err;
      request.redirect( self.create_url('site.error'));
    })
}
