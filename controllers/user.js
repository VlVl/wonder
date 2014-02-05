var fs        = require('fs');
var path      = require('path');

module.exports = User.inherits( require('./json') );

/**
 * Контроллер отвечающий за действия с пользователем
 *
 * @param params
 * @extends Json
 * @constructor
 */
function User( params ){
  this._init( params );
}


/**
 * Запрос на вход пользователя
 */
User.prototype.login = function ( response, request ) {
  var self = this;
  var listener = response.create_listener();
  var user     = request.params.user;

//  if ( !user || !user.email || !user.pass )
//    return response.view_namesend( new Error('Bad params'), 500 );

  // ищем пользователя по логину и паролю
  listener.stack <<= this.models.user.find_by_attributes({
    email : user.email,
    pass  : user.pass.md5()
  });

  listener.success(function( user ){
    // если такой пользователь найден, авторизуем его при помощи компонента users
    if ( user ) {
      // так как указан третий параметр, клиенту будут записаны специальные куки, чтобы впоследствии
      // производить по ним авторизацию (см. контроллер Site.connect_client)
      self.app.users.login( user, request, 356 );
      request.redirect( self.create_url('site.cabinet'));

//      response.view_name('main').send({
//        errors : null,
//        result : self.create_url('site.cabinet')
//      })
    }

    // иначе отправляем представление json/user.json с ошибками которые будут показаны в форме
    else{
        self.app.router.get_controller('site').error_msg = "Wrong login or password";
        self.app.router.get_controller("site").error(response, request);
    }
  });
};


/**
 * Запрос на выход пользователя
 */
User.prototype.logout = function ( response, request ) {
  // производим выход пользователя при помощи компонента users
  this.app.users.logout( request );

  // так как это обычный запрос пришедший не по ajax просто редиректим пользователя на главную страницу
  request.redirect( this.create_url('site.index'));
};


/**
 * Регистрация
 */
User.prototype.register = function ( response, request ) {
  var self      = this;
  var listener  = response.create_listener();
  var params    = request.params.user;

  if ( !params || !params.email || !params.pass || !params.tel || !params.surname){
    this.app.router.get_controller('site').error_msg = "нет параметров";
    return request.redirect( self.create_url('site.error'));
  }
  // проверяем существует ли указанный логин
  listener.stack <<= this.models.user.exists( 'email=:email', {
    email : params.email
  });

  listener.success(function( user_exists ){

    // если логин уже занят - отправляем ошибку для показа в форме
    if( user_exists ) {
      self.app.router.get_controller('site').error_msg = "email уже зарегистрирован";
      return request.redirect( self.create_url('site.error'));
    }
    // если нет - создаем модель пользователя
    var user = new self.models.user( params );

    // сохраняем пользователя, если он не пройдет валидацию, будет вызван Json.validation_error
    listener.stack <<= user.save();
    listener.success( function(){
      // если сохранение прошло успешно - сразу же осуществляем вход пользователя через компонент users
      self.app.users.login( user, request, 365 );
//      self.app.router.get_controller("site").cabinet(response, request)
      request.redirect( self.create_url('site.cabinet'));

//      return response.view_name('user').send({
//        result : self.create_url('site.index')
//      });
    }).error(function(err){
        self.app.router.get_controller('site').error_msg = err;
        return request.redirect( self.create_url('site.error'));
      });
  });
};

User.prototype.create_company = function ( response, request ) {
  var self      = this, files = [], cid = request.params.cid;
  for( var p in request.params){
    if(/^file/.test(p)) files.push(request.params[p])
  }
  var listener  = response.create_listener();
  var params    = request.params.company;
  if(!params || !params.companyname || !params.companyinn){
    self.app.router.get_controller('site').error_msg = "нет названия или инн";
    return request.redirect( self.create_url('site.error'));
  }
  params.userref = request.user.model.id;

  if( cid ){
    this.models.company.find_by_pk(cid)
      .on("success", function(c){
        if(files.length){
          for (var i = 0; i < files.length; i++) {
            var dir = files[i].path.replace(/tmp.+/,request.user.model.id);
            if(!fs.existsSync(dir)){
              fs.mkdirSync(dir)
            }
            fs.rename(files[i].path, files[i].path.replace(/tmp.+/,request.user.model.id + "/" + files[i].name));
            new self.models.file({
              company_id : cid,
              name   : files[i].name
            }).save()
          }
        }
        self.models.company.update_by_pk(cid,{
          companyname : params.companyname,
          companyinn : params.companyinn
      }).on("success", function(){
          request.redirect( self.create_url('site.cabinet'));
        })
        })
  }else{
  listener.stack <<= this.models.company.exists( 'companyinn=:companyinn', {
    companyinn : params.companyinn
  });

  listener.success(function( com_exists ){

    if( com_exists ) {
      self.app.router.get_controller('site').error_msg = "уже есть такой инн";
      return request.redirect( self.create_url('site.error'));
    }
    var com = new self.models.company( params );

    listener.stack <<= com.save();
    listener.success( function(){
      if(files.length){
        for (var i = 0; i < files.length; i++) {
          var dir = files[i].path.replace(/tmp.+/,request.user.model.id);
          if(!fs.existsSync(dir)){
            fs.mkdirSync(dir)
          }
          fs.rename(files[i].path, files[i].path.replace(/tmp.+/,request.user.model.id + "/" + files[i].name));
          new self.models.file({
            company_id : com.id,
            name   : files[i].name
          }).save()
        }
      }
      request.redirect( self.create_url('site.cabinet'));
    }).error(function(err){
        self.app.router.get_controller('site').error_msg = err;
        return request.redirect( self.create_url('site.error'));
      });
  });
  }
};

User.prototype.del_company = function ( response, request ) {
  var self = this;
  this.models.company
    .remove_all_by_attributes({id : request.params.cid})
    .on("success", function(){
      request.redirect( self.create_url('site.cabinet'));
    })
    .on("error", function(err){
      request.params.error = err;
      request.redirect( self.create_url('site.error'));
    })

}
User.prototype.upload = function ( response, request ) {
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
User.prototype.file = function ( response, request ) {
  var dir = this.app.base_dir;
  this.models.file.find_by_pk(request.params.fid)
    .on("success", function(f){
      var file = path.join(dir,"files",request.user.model.id+"", f.name);
      if(fs.existsSync(file))
        request.client.send_file(file);
      else console.log("not_ex")
    })
    .on("error", function(err){
      request.params.error = err;
      request.redirect( self.create_url('site.error'));
    })
}
User.prototype.get_company = function ( response, request ) {
  this.models.company.find_by_pk(request.params.id)
    .on("success", function(c){
        response.view_name('company').send({company : c});
    })
    .on("error", function(err){
      request.params.error = err;
      request.redirect( self.create_url('site.error'));
    })
}
