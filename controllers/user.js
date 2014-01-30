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
        request.params.error = "Wrong login or password";
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

  // если нет необходимых параметров, то не стоит даже пытаться регистрировать
//  if ( !params || !params.email || !params.pass )
//    return response.send( new Error('Bad params'), 500 );

  // проверяем существует ли указанный логин
  listener.stack <<= this.models.user.exists( 'email=:email', {
    email : params.email
  });

  listener.success(function( user_exists ){

    // если логин уже занят - отправляем ошибку для показа в форме
    if( user_exists ) {
        request.params.error = "This login already in use";

//      request.redirect( self.create_url('site.error'));
      return self.app.router.get_controller("site").error(response, request);
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
        request.params.error = err;
        request.redirect( self.create_url('site.error'));
      });
  });
};

User.prototype.create_company = function ( response, request ) {
  var self      = this;
  var listener  = response.create_listener();
  var params    = request.params.company;
  params.userref = request.user.model.id;

  listener.stack <<= this.models.company.exists( 'companyinn=:companyinn', {
    companyinn : params.companyinn
  });

  listener.success(function( com_exists ){

    if( com_exists ) {
        request.params.error = "same inn";
        request.redirect( self.create_url('site.error'));
    }
    // если нет - создаем модель пользователя
    var com = new self.models.company( params );

    // сохраняем пользователя, если он не пройдет валидацию, будет вызван Json.validation_error
    listener.stack <<= com.save();
    listener.success( function(){
        request.redirect( self.create_url('site.cabinet'));
    }).error(function(err){
            request.params.error = err;
            request.redirect( self.create_url('site.error'));
      });
  });
};