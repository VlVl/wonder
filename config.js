module.exports = {
  name                : 'wonder',
  base_dir            : __dirname,
  cache_views         : false,
  router : {
    rules     : {
      ''                                : 'site.index',
      'edit_profile'                    : 'site.edit_profile',

      'del'                             : 'request.remove | post',
      'request/<cid:\\d+>/<req_id:\\d+>': 'site.request',
      'request_info'                    : 'request.info | post',

      'newuser'                         : 'site.register',
      'register'                        : 'user.register        | post',

      'login'                           : 'user.login           | post',
      'logout'                          : 'user.logout',

      'cabinet'                         : 'site.cabinet',
      'cabinet/<uid:\\d+>'              : 'site.cabinet',
      'admin'                           : 'site.admin',
      'error'                           : 'site.error',

      'create_request'                  : 'request.create_request | post',

      'request'                         : 'site.request',
      'requests'                        : 'site.requests',
      'requests/<cid:\\d+>'             : 'site.requests',
      'newcompany'                      : 'user.create_company | post',
      'company'                         : 'site.company',
      'company/<c_id:\\d+>'             : 'site.company',
      'table/<t_id:\\d+>'               : 'site.table',
      'file/<fid:\\d+>'                 : 'user.file',
      'upload'                          : 'user.upload | post',
      'set_sber'                        : 'request.set_sber | post',
      'get_company'                     : 'user.get_company | post',
      'del_company/<cid:\\d+>'          : 'user.del_company',
      'about'                           : 'site.about',
      'services'                        : 'site.services'
    }
  },

  preload_components : [ 'log_router', 'db' ],
  components : {
    ext_dust : true,
    users    : {
      model : 'user',
      roles : {
        user : "user.id != null"
      },
      roles_groups : {
        all : 'user, guest'
      },
      rights : {
        create : 'user',
        view   : 'all'
      }
    },

    http                : {
      // на 3000 порту
      port            : 3000,
      upload_dir : 'files/tmp',

      root_folders    : {
        js        : 'static/js',
        css       : 'static/css'
      }
    },

    log_router          : {
      routes : {
        console : {
          levels : [ 'trace', 'info', 'warning', 'error' ]
        }
      }
    },

    db : {
      type      : 'mysql',
      user      : 'root',
      password  : '',
      database  : 'wonder',
      host      : 'localhost'
    }
  }
};