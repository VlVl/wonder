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
  var self = this;
  this.models.request
    .find_by_pk(request.params.id)
    .on("success", function(req){
      self.models.company.find_all_by_attributes({userref : request.user.model.id})
        .on("success", function(companies){
          response.view_name("request").send({
            req : req,
            companies : companies
          })
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

  var self  = this, rid = request.params.id;
  var dbrequest  = new this.models.request( request.params.request );
  dbrequest.date = new Date();
  if(rid){
    this.models.request.update_by_pk(rid,request.params.request)
      .on("success", function(){
        request.redirect( "/requests/" + request.params.request.company_id);
      })
  }else{
    response
      .view_name('main')
      .create_listener()
      .handle_emitter( dbrequest.save() )
      .success(function(){
  //      request.redirect( self.create_url('site.cabinet'));
        request.redirect( "/requests/" + dbrequest.company_id);
      })
        .error(function(err){
            request.params.error = err;
            request.redirect( self.create_url('site.error'));
        })
  }
}