module.exports = File.inherits( global.autodafe.db.ActiveRecord );

/**
 * Модель для пользователей
 *
 * @param {Object} params
 * @extends ActiveRecord
 * @constructor
 */
function File( params ) {
  this._init( params );
}


/**
 * Переопределяем метод который привязывает экземпляры данного класса к определенной таблице в базе данных
 *
 * @return {String}
 */
File.prototype.get_table_name = function(){
  return 'files';
}


/**
 * Здесь описываются атрибуты, присущие данной модели. Так как этот класс наследуется от ActiveRecord, то для него
 * автоматически создаются атрибуты одноименные с названием колонок в базе данных для таблицы привязанной к этому
 * классу. Так что здесь остается указать только дополнительные правила валидации
 *
 * @return {Object}
 */
File.prototype.attributes = function(){
  return {
    name : {
      'safe required' : true,
      prefilters     : 'trim' },
    company_id : 'safe required'
  };
}