module.exports = Site.inherits( global.autodafe.Controller );

/**
 * Контроллер, отвечающий за отображение страниц на сайте
 *
 * @constructor
 * @extends Controller
 * @param {Object} params
 */
function Site( params ) {
  this._init( params );
}


Site.prototype._init = function( params ){
  Site.parent._init.call( this, params );

  // все представления для этого контроллера будут искаться в папке views/html
  this.views_folder = 'html';
}


/**
 * Возвращает параметры которые доступны во всех шаблонах
 *
 * @param {Response} response
 * @param {Request} request
 * @return {Object}
 */
Site.prototype.global_view_params = function( response, request ){
    var admin = (request.user.model && request.user.model.admin==1) ? 1 : null;
  return {
    // из всех шаблонов можно будет обратиться к UserIdentity привязанному к текущему пользователю
    user : request.user,
    admin : admin,
    cab_url : admin ? "/admin" : "/cabinet"
  }
};


/**
 * Функция выполняется при подключении клиента, она пытается авторизовывать пользователя по куки
 *
 * @param {Client} client подключенный клиент
 * @returns {EventEmitter|Boolean} если connect_client возвращает емиттер, то действие из запроса не будет выполнено,
 * пока емиттер не вызовет success, при error на клиент отправится ошибка
 */
Site.prototype.connect_client = function ( client ){
  return this.app.users.login_by_cookie( client );
};


Site.prototype.index = function ( response, request ) {
//    response.send({user:response.user ? response.user.model : null});
    response.send();
};
Site.prototype.error = function ( response, request ) {
//    response.send({user:response.user ? response.user.model : null});
  response.view_name("error").send({error : "error " + this.error_msg});
};
Site.prototype.about = function ( response, request ) {
  response.send();
};
Site.prototype.services = function ( response, request ) {
  response.send();
};
Site.prototype.cooperation = function ( response, request ) {
  response.send();
}
Site.prototype.contacts = function ( response, request ) {
  response.send();
}
Site.prototype.list = function ( response, request ) {
  response.send();
}
Site.prototype.rules = function ( response, request ) {
  response.send();
}

Site.prototype.edit_profile = function ( response, request ) {

}

Site.prototype.request = function ( response, request ) {
  var id = request.params.req_id;
  var cid = request.params.cid;
  if(parseInt(id) != 0){
    this.models.request.find_by_attributes({id : id})
        .on("success", function(req){
          response.view_name("create_request").send({
            req : req,
            script : "user_cabinet"});
        })
        .on("error",function(err){
            response.view_name("error").send({
                error : err
            });
        })
  }else{
    this.models.company.find_by_attributes({userref : request.user.model.id})
      .on("success", function(companies){
        response.view_name("create_request").send({
          cid : cid,
          companies : companies,
          script : ["user_cabinet"]});
      })
      .on("error",function(err){
        response.view_name("error").send({
          error : err
        });
      })
  }
}
Site.prototype.company = function ( response, request ) {
  var id = request.params.c_id;
  if(id){
    this.models.company.find_by_attributes({id : id})
        .on("success", function(com){
          response.view_name("company").send({
            company: com,
            script : "user_cabinet"});
        })
        .on("error",function(err){
            response.view_name("error").send({
                error : err
            });
        })
  }else
    response.view_name("company").send({script : ["user_cabinet"]});
}

Site.prototype.table = function( response, request ){
  if(!request.user.model || request.user.model.admin==0)
    return request.redirect( this.create_url('site.index'));
  var self = this;

  this.app.db.query(this.sql[request.params.t_id], function(e, res){
    var msgs = [
    'Уведомление о прекращении блокирования',
    'Уведомление о поступлении заявки на кредитование',
    'Уведомление о блокировке денежных средств по кредитной заявке',
    'Подтверждение кредитной заявки на участие в аукционе',
    'Уведомление о поступлении отложенной заявки на участие в аукционе',
    'Деньги заблокированные (или комиссия) на площадке'
    ];
    response.view_name("table").send({
      script : ["admin_cabinet"],
      html: _tbody(res.fields,res.result),
      fields : res.fields.map(function(f){ return self.alias[f.name]}),
      msg : msgs[request.params.t_id-1]
    })
  })
  function _tbody(fields,values){
    var html = "";
    for (var i = 0; i < values.length; i++) {
      var obj = values[i];
      html += "<tr>";
      for (var j = 0; j < fields.length; j++) {
//        var txt = (/date/.test(fields[j].name))
        var txt = (fields[j].name == 'f2' || fields[j].name == 'f10')
          ? _d(obj[fields[j].name]) : obj[fields[j].name];
        if(fields[j].name == 'f0'){
          txt = '<a href="http://sberbank-ast.ru/tradezone/Documents/ViewDocument.aspx?id=' + obj[fields[j].name] + '">link</a>'
        }
        html += "<td>" + txt + "</td>"
      }
      html += "</tr>"
    }
    return html
  }
  function _d(d){
    if(/GMT/.test(d)){
      var date = new Date(d);
      return (date.getMonth()<9 ?"0"+(date.getMonth()+1) : date.getMonth()+1)  + '/' +
        (date.getDate()<10 ? "0"+date.getDate() : date.getDate()) + '/' + date.getFullYear();
    }else return d;
  }
};
Site.prototype.cabinet = function ( response, request ) {
  if(!request.user.model)
    return request.redirect( this.create_url('site.index'));
  var id = request.params.uid;
  var listener  = response.create_listener();
    if(request.user.model.admin==1 && !id){
        return this.admin( response, request)
    }
  if(!id) id = request.user.model.id;

  listener.stack <<= this.models.company.With("request").With('files').find_all_by_attributes({
    userref : id
  });
  listener.success(function(data){
        response.view_name("cabinet").send({
          script : ["user_cabinet"],
          companies : data
        })
  }).error(function(err){
          response.view_name("error").send({
              error : err
          });
      })

};
Site.prototype.requests = function ( response, request ) {
  if(!request.user.model)
    return request.redirect( this.create_url('site.index'));
  var listener  = response.create_listener();

  if(request.params.cid){
    listener.stack <<= this.models.request.With('company').find_all_by_attributes({
      company_id : request.params.cid
    });
    listener.success(function(data){
      data.forEach(function(r){
         if( typeof r.duedate == 'object')
           r.duedate = _d(r.duedate);
           r.date = _d(r.date);
      })
      response.view_name("requests").send({
        script : request.user.model.admin == 1 ? ["admin_cabinet"] : ["user_cabinet"],
        requests : data,
        cid :  request.params.cid
      })
    }).error(function(err){
            response.view_name("error").send({
                error : err
            });
        })
  }
  function _d(d){
    if(/GMT/.test(d)){
      var date = new Date(d);
      return (date.getDate()<10 ? "0"+date.getDate() : date.getDate()) + '-' +
        (date.getMonth()<9 ?"0"+(date.getMonth()+1) : date.getMonth()+1)  + '-'  + date.getFullYear();
    }else return d;
  }

};
Site.prototype.admin = function ( response, request ) {
  var listener  = response.create_listener();
  listener.stack <<= this.models.user.With("company").find_all_by_attributes({admin : 0});
  listener.success(function(data){
    response.view_name("admin").send({
      script : ["admin_cabinet"],
      users : data
    })
  })
}


Site.prototype.alias = {
  f0 : "Ссылка",
  f1 : "Код Аукциона",
  f2 : "Дата",
  f3 : "Номер Запроса",
  f4 : "Контрагент",
  f5 : "Высвобождаемая Сумма",
  f6 : "Общая Сумма",
  f7 : "Задолженность",
  f8 : "Комиссия Площадки",
  f9 : "ИНН Контрагента",
  f10 :"todate",
  f11 : "Адрес Контрагента",
  f12 : "Контакт Контрагента",
  f13 : "Телефон Контрагента",
  f14 : "Почта Контрагента",
  f15 : "Запрашиваемая Сумма",
  f16 : "Сумма Блокировки",
  f17 : "Номер Заявки",
  f18 : "Дата Подачи Заявки",
  f19 : "Название Фин. Организации",
  f20 : "Крайний Срок Рассмотрения",
  f21 : "Сумма Займа",
  f22 : "Заблокированная Сумма",
  f23 : "РазблокированнаяСумма",
  f24 : "Остаток"
}

Site.prototype.sql = {
  '1' : "select" +
    " ast_inbox_documents_utf8.id as f0," +
    " purchcode as f1," +
    " document_date as f2," +
    " p1.param_value as f3," +
    " p2.param_value as f4," +
    " p3.param_value as f5," +
    " p4.param_value as f6," +
    " p5.param_value as f7," +
    " p6.param_value as f8," +
    " p7.param_value as f9," +
    " STR_TO_DATE(REPLACE(p9.param_value,' 00:00',''),'%d.%m.%Y') as f10" +
    " from" +
    " ast_inbox_documents_utf8," +
    " ast_param_utf8 p1," +
    " ast_param_utf8 p2," +
    " ast_param_utf8 p3," +
    " ast_param_utf8 p4," +
    " ast_param_utf8 p5," +
    " ast_param_utf8 p6," +
    " ast_param_utf8 p7," +
    " ast_param_utf8 p8," +
    " ast_param_utf8 p9" +
    " where" +
    " p1.document_id=ast_inbox_documents_utf8.id and" +
    " p2.document_id=ast_inbox_documents_utf8.id and" +
    " p3.document_id=ast_inbox_documents_utf8.id and" +
    " p4.document_id=ast_inbox_documents_utf8.id and" +
    " p5.document_id=ast_inbox_documents_utf8.id and" +
    " p6.document_id=ast_inbox_documents_utf8.id and" +
    " p1.param_name='reqid' and" +
    " p2.param_name='buname' and" +
    " p3.param_name='amount' and" +
    " p4.param_name='reqamount' and" +
    " p5.param_name='debtamount' and" +
    " p6.param_name='feeamount' and" +
    " p7.param_name='buinn' and" +
    " p9.param_name='todate' and" +
    " p8.param_value=p1.param_value and" +
    " p8.document_id=p7.document_id and" +
    " p9.document_id=p7.document_id and" +
    " p7.document_id in (select id from ast_inbox_documents_utf8 where type='SupplierCreditRequestOrgAccept')" +
    " order by document_date desc;",

  "2" : "select"+
    " ast_inbox_documents_utf8.id as f0,"+
    " document_date as f2,"+
    " p2.param_value as f4,"+
    " p3.param_value as f9,"+
    " p4.param_value as  f11,"+
    " p5.param_value as  f12,"+
    " p6.param_value as  f13,"+
    " p7.param_value as  f14,"+
    " p8.param_value as  f15"+
    " from"+
    " ast_inbox_documents_utf8,"+
    " ast_param_utf8 p2,"+
    " ast_param_utf8 p3,"+
    " ast_param_utf8 p4,"+
    " ast_param_utf8 p5,"+
    " ast_param_utf8 p6,"+
    " ast_param_utf8 p7,"+
    " ast_param_utf8 p8"+
    " where"+
    " p2.document_id=ast_inbox_documents_utf8.id and"+
    " p3.document_id=ast_inbox_documents_utf8.id and"+
    " p4.document_id=ast_inbox_documents_utf8.id and"+
    " p5.document_id=ast_inbox_documents_utf8.id and"+
    " p6.document_id=ast_inbox_documents_utf8.id and"+
    " p7.document_id=ast_inbox_documents_utf8.id and"+
    " p8.document_id=ast_inbox_documents_utf8.id and"+
    " p2.param_name='bufullname' and"+
    " p3.param_name='buinn' and"+
    " p4.param_name='buaddress' and"+
    " p5.param_name='contactperson' and"+
    " p6.param_name='contactphone' and"+
    " p7.param_name='contactemail' and"+
    " p8.param_name='loanamount' and"+
    " type='finLoanRequest_forBank'"+
    " order by document_date desc;",

  "3": "select"+
    " ast_inbox_documents_utf8.id as f0,"+
    " ast_inbox_documents_utf8.document_date as f2,"+
    " d2.purchcode  as f1,"+
    " p1.param_value as f3,"+
    " p3.param_value as f4,"+
    " p4.param_value as f16,"+
    " p5.param_value as f9"+
    " from"+
    " ast_inbox_documents_utf8,"+
    " ast_inbox_documents_utf8 d2,"+
    " ast_param_utf8 p4,"+
    " ast_param_utf8 p1"+
    " left join ast_param_utf8 p2 on p2.param_name='reqid' and p2.param_value=p1.param_value"+
    " left join ast_param_utf8 p3 on p3.param_name='bufullname' and p3.document_id=p2.document_id"+
    " left join ast_param_utf8 p5 on p5.param_name='buinn' and p5.document_id=p3.document_id"+
    " where"+
    " p1.document_id=ast_inbox_documents_utf8.id and"+
    " p4.document_id=ast_inbox_documents_utf8.id and"+
    " p3.document_id=d2.id and"+
    " d2.type='SupplierCreditRequestOrgAccept' and"+
    " p1.param_name='reqid' and"+
    " p4.param_name='amount' and"+
    " ast_inbox_documents_utf8.type='notification_BlockCreditRequest'"+
    " order by f2 desc;",

  "4" : "select"+
    " ast_inbox_documents_utf8.id as f0,"+
    " document_date as f2,"+
    " purchcode as f1,"+
    " p1.param_value as f17,"+
    " p2.param_value as f18,"+
    " p3.param_value as f4"+
    " from"+
    " ast_inbox_documents_utf8,"+
    " ast_param_utf8 p1,"+
    " ast_param_utf8 p2,"+
    " ast_param_utf8 p3"+
    " where"+
    " p1.document_id=ast_inbox_documents_utf8.id and"+
    " p2.document_id=ast_inbox_documents_utf8.id and"+
    " p3.document_id=ast_inbox_documents_utf8.id and"+
    " p1.param_name='reqid' and"+
    " p2.param_name='reqdate' and"+
    " p3.param_name='bufullname' and"+
    " type='SupplierCreditRequestOrgAccept'"+
    " order by document_date desc;",

  "5" : "select"+
    " ast_inbox_documents_utf8.id as f0,"+
    " document_date as f2,"+
    " p1.param_value as f17,"+
    " p2.param_value as f19,"+
    " p3.param_value as f20,"+
    " p4.param_value as f21,"+
    " p5.param_value as f9,"+
    " p7.param_value as f4"+
    " from"+
    " ast_inbox_documents_utf8,"+
    " ast_param_utf8 p1,"+
    " ast_param_utf8 p2,"+
    " ast_param_utf8 p3,"+
    " ast_param_utf8 p4,"+
    " ast_param_utf8 p5"+
    " left join ast_param_utf8 p6 on p6.param_name='buinn' and p6.param_value=p5.param_value"+
    " left join ast_param_utf8 p7 on p7.param_name='bufullname' and p7.document_id=p6.document_id"+
    " where"+
    " p1.document_id=ast_inbox_documents_utf8.id and"+
    " p2.document_id=ast_inbox_documents_utf8.id and"+
    " p3.document_id=ast_inbox_documents_utf8.id and"+
    " p4.document_id=ast_inbox_documents_utf8.id and"+
    " p5.document_id=ast_inbox_documents_utf8.id and"+
    " p1.param_name='reqid' and"+
    " p2.param_name='finorgbuname' and"+
    " p3.param_name='enddate' and"+
    " p4.param_name='amount' and"+
    " p5.param_name='inn' and"+
    " type='notification_PurchaseCreditRequest'"+
    " group by f0"+
    " order by f2 desc;",

  "6" : "select"+
    " ast_inbox_documents_utf8.id as f0,"+
    " IF(p2.document_id IS NULL,'NOVALUE',p2.document_id)  as unbloc_document_id,"+
    " ast_inbox_documents_utf8.document_date as f2,"+
    " p1.param_value as f3,"+
    " p7.param_value as f4,"+
    " CAST(p4.param_value AS DECIMAL(10,2)) as f22,"+
    " (CAST(IF(p5.param_value IS NULL,0,p5.param_value) AS DECIMAL(10,2))) as f23,"+
    " (CAST(p4.param_value AS DECIMAL(10,2)) - sum(CAST(IF(p5.param_value IS NULL,0,p5.param_value) AS DECIMAL(10,2)))) as f24"+
    " from"+
    "  ast_inbox_documents_utf8,"+
    "  ast_param_utf8 p4,"+
    "  ast_param_utf8 p1"+
    "  right join ast_param_utf8 p6 on p6.param_name='reqid' and p6.param_value=p1.param_value"+
    "  right join ast_param_utf8 p7 on p7.param_name='bufullname' and p7.document_id=p6.document_id"+

    "  left join ast_param_utf8 p2 on p2.param_name='reqid' and p2.param_value=p1.param_value and p2.document_id in"+
    "    (select id from ast_inbox_documents_utf8 where type='notification_ReturnCreditRequest')"+
    "  left join ast_inbox_documents_utf8 d2 on d2.id=p2.document_id"+
    "  left join ast_param_utf8 p5 on p5.param_name='amount' and p5.document_id=p2.document_id and p5.document_id=d2.id"+
    " where"+
    " p1.document_id=ast_inbox_documents_utf8.id and"+
    " p4.document_id=ast_inbox_documents_utf8.id and"+
    " p1.param_name='reqid' and"+
    " p4.param_name='amount' and"+
    " ast_inbox_documents_utf8.type='notification_BlockCreditRequest'"+
    " group by ast_inbox_documents_utf8.id"+
    " order by ast_inbox_documents_utf8.document_date desc;"

};

