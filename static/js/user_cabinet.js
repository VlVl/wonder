$(document).ready(function(){
  $("span[id]").click(function(){
    var id = this.id.replace(/\D/g,""),
        action = this.id.replace(/\d/g,"");
    if(action == "del"){
      $.post("/del", {id : id},function(res){
        $("#alert_div").text("Удалено!").slideDown(function(){
          var self = $(this);
          $("#tr"+id).remove();
          setTimeout(function(){
            self.slideUp();
          },500)
        })
      })
    }
  });
  $('.MultiFile-wrap').on("onFileAppend","input[type=file]",function(e){
      var input = $(this),
        ul = input.parent().siblings("ul"),
        iframe = $('#upload_iframe'),
        form = $('<form></form>', {
          target : "upload_iframe",
          enctype : "multipart/form-data",
          action : "/upload",
          method:"post"}).css({height:0,width:0});

        iframe.load(function(){
          var data = $(this).contents().text();
          if (data === undefined || data == '') return;

  //        iframe.remove();
          form.remove();
          data = JSON.parse(data);
          var p = data.result.split("|");
//          $(".MultiFile-list").remove();
          ul.append("<li><a href='/file/"+p[1] + "' target='_blank'>" + p[0] + "</a></li>");
      });
      var newFile = input.clone(),
        usewm = 0;
      input.replaceWith(newFile);
      form.append(input);
      form.append($('<input type="hidden" name="req_id"/>').val(input.attr('rel')));
      form.appendTo($('body')).submit();
      $.fn.MultiFile.reset();
     })
  $('span[id^=cedit]').click(function(){
    var id = this.id.replace(/\D/g,"");
    $.post('/get_company',{id : id}, function(data){
      var com = JSON.parse(data);
      $('#name').val(com.companyname);
      $('#inn').val(com.companyinn);
      $('#cid').val(com.id);
      $('.window._com,.overlay').show();
    })
  })
  $('span[id^=redit]').click(function(){
    var id = this.id.replace(/\D/g,"");
    $.post('/request_info',{id : id}, function(data){
      var com = JSON.parse(data);
      $('#amount').val(com.reqamount);
      $('#duedate').val(com.duedate);
      $('#cid').val(com.company_id);
      $('#id').val(com.id);
      $('#sel').empty();
      for (var i = 0; i < com.companies.length; i++) {
        var c = com.companies[i],op = $('<option></option>',{value : c.id}).text(c.name);
        if(c.id == com.company_id) op.attr("selected","selected");
        $('#sel').append(op)
      }
      $('.window._req,.overlay').show();
    })
  })
  $('#com').validate({
    errorPlacement : function(error, element) {
      return false;
    }
  });
  $('#req').validate({
    errorPlacement : function(error, element) {
      return false;
    }
  });

})
function reset_form(){
  $('#com').reset();
  $('.window._com,.overlay').hide();
  $('#com .MultiFile-label').remove();
  $("#com input[type=file]:not(:last)").remove();

}