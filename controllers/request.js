module.exports = Request.inherits( require('./json') );

function Request( params ){
  this._init( params );
}

Request.prototype.remove = function( response, request ){
  this.models.request
    .remove_all_by_attributes({id : request.params.id, user_id : request.user.model.id})
    .on("success", function(){
      response.view_name("main").send({result: "success", errors: null})
    })

}
Request.prototype.info = function( response, request ){
  var user = request.user.model, params = { id : request.params.id }, self = this;
  if( user.admin != 1 ) params.user_id = user.id;
  this.models.request.With("files")
    .find_all_by_attributes(params)
    .on("success", function(req){
      self.views_ext = ".html";
      self.views_folder = "html";
      console.log(self._path_to_view);
      response.view_name("r_info.html").send({
        id: req[0].id, files: req[0].files
      })
    })
}
Request.prototype.create_request = function( response, request ){

  var self  = this,
    files = request.params.request.files;
  delete request.params.request.files;

  var dbrequest  = new this.models.request( request.params.request );
  dbrequest.user_id = request.user.model.id;
  dbrequest.date = new Date();

//  for(var i in request.params)console.log(i + "   " + request.params[i]);

//  var listener     = response.create_listener();
//  listener.stack <<= this.models.request.find_by_attributes({ id : request.params.id, user_id : request.user.model.id});
  response
    // задаем имя представления в этом месте на случай, если наш топик не пройдет валидацию
    // и попадет в метод Json.validation_error
    .view_name('main')
    .create_listener()
    .handle_emitter( dbrequest.save() )
    .success(function(){
      if(files.length){
        var ar = Array.isArray(files),
          count = ar ? files.length : 1;
        for (var i = 0; i < count; i++) {
          new self.models.file({
            req_id : dbrequest.id,
            name   : ar ? files[i] : files
          }).save()
        }
      }
      // при успешном сохранении отправляем клиенту json/main.json
      response.send({
        result : self.create_url("site.cabinet")
      })
    })
}
