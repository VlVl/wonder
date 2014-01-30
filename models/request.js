module.exports = Request.inherits( global.autodafe.db.ActiveRecord );

/**
 * Модель для топиков
 *
 * @param {Object} params
 * @extends ActiveRecord
 * @constructor
 */
function Request( params ) {
  this._init( params );
}


/**
 * Переопределяем метод который привязывает экземпляры данного класса к определенной таблице в базе данных
 *
 * @return {String}
 */
Request.prototype.get_table_name = function(){
  return 'request';
}


/**
 * Здесь описываются атрибуты, присущие данной модели. Так как этот класс наследуется от ActiveRecord, то для него
 * автоматически создаются атрибуты одноименные с названием колонок в базе данных для таблицы привязанной к этому
 * классу. Так что здесь остается указать только дополнительные правила валидации
 *
 * @return {Object}
 */
Request.prototype.attributes = function(){
  return {
    company_id : 'safe',
    reqamount : 'safe',
    duedate   : 'safe',
    sberorderid : 'safe'
  };
}


/**
 * В этом методе указываются отношения между этой и другими моделями. Это необходимо для правильной генерации
 * сложных запросов к базе данных.
 *
 * @return {Object}
 */
Request.prototype.relations = function () {
  return {
    // топик пренадлежит пользователю
    'company'   : this.belongs_to( 'company' ).by( 'company_id' ),
    'files'    : this.has_many('file').by('req_id')
  }
};
