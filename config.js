/**
 * Настройки приложения
 */
module.exports = {

  /**
   * Название приложения
   *
   * @type {String}
   */
  name                : 'wonder',

  /**
   * Корневая директория приложения, в ней по умолчанию ищутся директории с моделями, контроллерами, вьюшками,
   * компонентами, а также относительно нее задаются другие пути в конфигурационном файле
   *
   * @type {String}
   */
  base_dir            : __dirname,

  /**
   * Параметры приложения
   *
   * @type {Object}
   */
  params              : {
    // по сколько топиков выводить на странице
    topics_per_page : 5
  },

  /**
   * Если значение true - вьюшки подгружаются один раз при создании приложения и больше никогда не проверяются на
   * изменения, если false - измененные вьюшки перезагружаются каждый раз при обращении к ним
   *
   * @type {Boolean}
   */
  cache_views         : false,

  /**
   * Настройки компонента отвечающего за перенаправление запросов и генерацию УРЛ
   *
   * @type {Object}
   */
  router : {

    /**
     * Правила перенаправления запросов, ключи - запрашиваемые УРЛ, с возможностью указания параметров, значения -
     * путь к действию в виде контроллер.действие Также тут можно указать какие типы запросов могут быть обработаны
     * для данного действия. 'post' - для HTTP POST, 'get' - для HTTP GET, 'delete' - для HTTP DELETE,
     * 'ws' - для запроса через WebSocket, если не указано - то любой
     *
     * @type {Object}
     */
    rules     : {
      // Site controller
      // главная
      ''                      : 'site.index',

      // страница создания топика
      'edit_profile'             : 'site.edit_profile',

      'del'                      : 'request.remove | post',
      'request/<cid:\\d+>/<req_id:\\d+>'    : 'site.request',
      'request_info'             : 'request.info | post',

      'newuser'               : 'site.register',
      'register'              : 'user.register        | post',

      // вход пользователя
      'login'                 : 'user.login           | post',

      // выход пользователя
      'logout'                : 'user.logout',

      'cabinet'               : 'site.cabinet',
      'cabinet/<uid:\\d+>'               : 'site.cabinet',
      'admin'                 : 'site.admin',
      'error'                 : 'site.error',

      'create_request'        : 'request.create_request | post',

      'request'               : 'site.request',
      'requests/<cid:\\d+>'               : 'site.requests',
      'newcompany'               : 'user.create_company | post',
      'company'               : 'site.company',
      'company/<c_id:\\d+>'               : 'site.company',
      'table/<t_id:\\d+>'     : 'site.table'
    }
  },

  /**
   * Компоненты, загружаемые до инициализации ядра приложения
   * log_router - чтобы видеть логирование этапов инициализации ядра
   * db - для инициализации моделей, которые используют доступ к базе данных (ActiveRecord)
   *
   * @type {Array}
   */
  preload_components : [ 'log_router', 'db' ],

  /**
   * Настройка подключаемых компонентов. Здесь указываются как компаненты autodafe, так и пользовательские. Ключами
   * всегда является название подключаемого компонентка (для пользовательских компонентов это название файла), а
   * значениями - настройки для компонента. Если для компонента не надо передавать настройки, нужно просто указать true
   *
   * @type {Object}
   */
  components : {

    // Пользовательский компонент ext_dust, находится в components/ext_dust.js
    ext_dust : true,

    // Пользовательский компонент компилирующий less файлы в css
//    less     : true,

    // компонент управляющий правами пользователей
    users    : {
      // модель которая будет ассоциироваться с пользователем в приложении, описана в файле models/user.js
      model : 'user',

      // возможные роли пользователй в приложении, роль гостя создается автоматически
      roles : {

        // роль залогиненного пользователя определяется по наличию идентификатора у модели, привязанной к нему
        user : "user.id != null"
      },

      // группы пользователей используются для более удобной записи прав
      roles_groups : {

        // группа all включает в себя как гостей, так и залогиненых пользователй
        all : 'user, guest'
      },

      // глобальные права для пользователей
      rights : {
        // создавать различные модели может только залогиненый пользователь
        create : 'user',
        // просматривать могут все
        view   : 'all'
      }
    },

    // компонент поднимающий http сервер
    http                : {
      // на 3000 порту
      port            : 3000,
      upload_dir : 'files',

      // здесь указываются директории в которых ищутся файлы, например запрос /js/jquery.min.js вернет файл
      // static/js/jquery.min.js
      root_folders    : {
        js        : 'static/js',
        css       : 'static/css'
      }
    },

    // настройки логгера
    log_router          : {
      routes : {
        console : {
          levels : [ 'trace', 'info', 'warning', 'error' ]
        }
      }
    },

    // настройки подключения к базе данных
    db : {
      type      : 'mysql',
      user      : 'ast',
      password  : 'password',
      database  : 'ast_utf8',
      host      : 'localhost'
    }
  }
};