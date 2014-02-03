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
Request.prototype.set_sber = function( response, request ){
  this.app.db.query(
    "UPDATE request SET sberorderid=" + request.params.soid + " WHERE id=" + request.params.id, function(e, res){
    response.view_name("main").send({
      result : "success"
    })
  })
}
Request.prototype.create_request = function( response, request ){

  var self  = this;
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
      request.redirect( self.create_url('site.cabinet'));
    })
      .error(function(err){
          request.params.error = err;
          request.redirect( self.create_url('site.error'));
      })
}