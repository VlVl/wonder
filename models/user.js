module.exports = User.inherits( global.autodafe.db.ActiveRecord );

/**
 * Модель для пользователей
 *
 * @param {Object} params
 * @extends ActiveRecord
 * @constructor
 */
function User( params ) {
  this._init( params );
}


/**
 * Переопределяем метод который привязывает экземпляры данного класса к определенной таблице в базе данных
 *
 * @return {String}
 */
User.prototype.get_table_name = function(){
  return 'users';
}


/**
 * Здесь описываются атрибуты, присущие данной модели. Так как этот класс наследуется от ActiveRecord, то для него
 * автоматически создаются атрибуты одноименные с названием колонок в базе данных для таблицы привязанной к этому
 * классу. Так что здесь остается указать только дополнительные правила валидации
 *
 * @return {Object}
 */
User.prototype.attributes = function(){
  return {
   email : {
   'safe required' : true,
   prefilters     : 'trim' },

   pass : {
   'safe required' : true,
   postfilters    : 'md5' },

  name : {
    'safe required' : true,
    prefilters     : 'trim' },
  surname : {
    'safe required' : true,
    prefilters     : 'trim' },
  patronymic : {
    'safe required' : true,
    prefilters     : 'trim' },
  tel : {
    'safe required' : true,
    prefilters     : 'trim' },
  inn : {
    'safe' : true,
    prefilters     : 'trim' },
  ur : {
    'safe' : true,
    prefilters     : 'trim' }

  };
}


/**
 * Метод необходим для автоматической авторизации пользователя по cookie через компонент users
 *
 * @return {String}
 */
User.prototype.cookie_hash = function(){
  return this.pass.md5();
}
User.prototype.relations = function () {
  return {
    'requests'    : this.has_many('request').by('user_id'),
    'company'     : this.has_many('company').by('userref')
  }
}
