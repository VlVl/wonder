module.exports = Company.inherits( global.autodafe.db.ActiveRecord );

/**
 * Модель для пользователей
 *
 * @param {Object} params
 * @extends ActiveRecord
 * @constructor
 */
function Company( params ) {
  this._init( params );
}


/**
 * Переопределяем метод который привязывает экземпляры данного класса к определенной таблице в базе данных
 *
 * @return {String}
 */
Company.prototype.get_table_name = function(){
  return 'tcompany';
}


/**
 * Здесь описываются атрибуты, присущие данной модели. Так как этот класс наследуется от ActiveRecord, то для него
 * автоматически создаются атрибуты одноименные с названием колонок в базе данных для таблицы привязанной к этому
 * классу. Так что здесь остается указать только дополнительные правила валидации
 *
 * @return {Object}
 */
Company.prototype.attributes = function(){
  return {
    userref : {
      'safe required' : true,
      prefilters     : 'trim' },

    companyname : {
      'safe required' : true,
      postfilters    : 'trim' },
    companyinn : {
      'safe required' : true,
      postfilters    : 'trim' }
  };
}

Company.prototype.relations = function () {
  return {
    'user'    : this.belongs_to('user').by('userref'),
    'request' : this.has_many('request').by('company_id'),
    'files'    : this.has_many('file').by('company_id')
  }
}
