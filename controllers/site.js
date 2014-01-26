// наследуем Site от Controller
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
  return {
    // из всех шаблонов можно будет обратиться к UserIdentity привязанному к текущему пользователю
    user : request.user
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
    response.send({user:response.user.model});
};

Site.prototype.edit_profile = function ( response, request ) {

}

Site.prototype.request = function ( response, request ) {
  var id = request.params.req_id;
  if(id){
    this.models.request.find_by_attributes({id : id, user_id:request.user.model.id}).on("success", function(req){
      response.view_name("create_request").send({
        req : req,
        user:response.user.model,
        script : "user_cabinet"});
    })
  }else
    response.view_name("create_request").send({user:response.user.model});
}

Site.prototype.table = function( response, request ){
  var listener  = response.create_listener();
  this.app.db.query(this.sql[request.params.t_id], function(e, res){
    response.view_name("table").send({
      script : ["user_cabinet"],
      user : request.user.model,
      fields : res.fields,
      html: _tbody(res.fields,res.result)
    })
  })
  function _tbody(fields,values){
    var html = "";
    for (var i = 0; i < values.length; i++) {
      var obj = values[i];
      html += "<tr>";
      for (var j = 0; j < fields.length; j++) {
        var txt = (/date/.test(fields[j].name) && fields[j].name != "enddate" && fields[j].name != "reqdate")
          ? _d(new Date(obj[fields[j].name])) : obj[fields[j].name];
        html += "<td>" + txt + "</td>"
      }
      html += "</tr>"
    }
    return html
  }
  function _d(d){
    return d.getDate() + '.' + d.getMonth() + '.' + d.getFullYear();
  }
};
Site.prototype.register = function( response, request ){
  response.view_name("reg").send({

  })
};
Site.prototype.cabinet = function ( response, request ) {

  var listener  = response.create_listener();
  listener.stack <<= this.models.request.With("files").find_all_by_attributes({
    user_id : request.user.model.id
  });
  listener.success(function(data){
    response.view_name("cabinet").send({
      script : ["user_cabinet"],
      user : request.user.model,
      requests : data
    })
  })
};
Site.prototype.admin = function ( response, request ) {
  var listener  = response.create_listener();
  listener.stack <<= this.models.user.With("requests").find_all();
  listener.success(function(data){
    response.view_name("admin").send({
      script : ["admin_cabinet"],
      user : request.user.model,
      users : data
    })
  })
}
Site.prototype.sql = {
  '1' : "select" +
  " ast_inbox_documents_utf8.id as document_id," +
  " purchcode," +
  " document_date," +
  " p1.param_value as reqid," +
  " p2.param_value as buname," +
  " p3.param_value as amount," +
  " p4.param_value as reqamount," +
  " p5.param_value as debtamount," +
  " p6.param_value as feeamount," +
  " p7.param_value as inn," +
  " STR_TO_DATE(REPLACE(p9.param_value,' 00:00',''),'%d.%m.%Y') as todate" +
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
  " ast_inbox_documents_utf8.id as document_id,"+
  " document_date,"+
  " p2.param_value as bufullname,"+
  " p3.param_value as buinn,"+
  " p4.param_value as buaddress,"+
  " p5.param_value as contactperson,"+
  " p6.param_value as contactphone,"+
  " p7.param_value as contactemail,"+
  " p8.param_value as loanamount"+
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
  " ast_inbox_documents_utf8.id as document_id,"+
  " ast_inbox_documents_utf8.document_date,"+
  " d2.purchcode,"+
  " p1.param_value as reqid,"+
  " p3.param_value as bufullname,"+
  " p4.param_value as amount,"+
  " p5.param_value as inn"+
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
  " order by document_date desc;",

  "4" : "select"+
  " ast_inbox_documents_utf8.id as document_id,"+
  " document_date,"+
  " purchcode,"+
  " p1.param_value as reqid,"+
  " p2.param_value as reqdate,"+
  " p3.param_value as bufullname"+
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
  " ast_inbox_documents_utf8.id as document_id,"+
  " document_date,"+
  " p1.param_value as reqid,"+
  " p2.param_value as finorgbuname,"+
  " p3.param_value as enddate,"+
  " p4.param_value as amount,"+
  " p5.param_value as inn,"+
  " p7.param_value as bufullname"+
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
  " group by document_id"+
  " order by document_date desc;"
};

