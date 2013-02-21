$(function() {
  /*
   * Initial google map picker if there is a addresspicker filed
   */
  if ($('#edit-addresspicker').length > 0) {
    // Disable enter to complete form
    $('#edit-addresspicker').keypress(function(e) {
      if (e.which === 13) {
        e.preventDefault();
      }
    });
    // Maps for update shop location
    var long = parseFloat($('#long').val());
    long = !_.isNaN(long) ? long : 139.7667;
    var lat = parseFloat($('#lat').val());
    lat = !_.isNaN(lat) ? lat : 35.6833;

    var addresspickerMap = $('#edit-addresspicker').addresspicker({
      regionBias: 'jp',
      map: '#map_canvas',
      typeaheaddelay: 800,
      mapOptions: {
        zoom: 16,
        center: new google.maps.LatLng(lat, long)
      }
    });

    // Render the marker
    addresspickerMap.addresspicker("reloadPosition");

    // addresspickerMap.on('addressChanged', function(evt, address) {
    //   // Set the long/lat to the input
    //   $('#lat').val(address.geometry.location.Ya);
    //   $('#long').val(address.geometry.location.Za);
    //   $('#geo-address').val(address.formatted_address);
    // });

    addresspickerMap.on('positionChanged', function(evt, markerPosition) {
      // Set the long/lat to the input
      $('#lat').val(markerPosition.Ya);
      $('#long').val(markerPosition.Za);
      markerPosition.getAddress(function(address) {
        if (address) {
          $('#geo-address').val(address.formatted_address);
        }
      });
    });
  }

  /*
   * Initialize bootstrap validation for form
   */
  $(".create-shop-form input").not("[type=submit]").not("[type=file]").jqBootstrapValidation();
  $(".edit-shop-form input").not("[type=submit]").not("[type=file]").jqBootstrapValidation();
  $(".edit-shop-super input").not("[type=submit]").not("[type=file]").jqBootstrapValidation();


  // Create a confirmation box before deleting a shop
  $('#delete-shop').click(function(e) {
    e.preventDefault();

    // Get the link from the attribute
    var backLink = $(this).attr('href');

    bootbox.dialog($('#confirm-delete').val(), [{
      "label" : $('#cancel').val(),
      "class" : "btn",
      "callback": function() {
        console.log('Cancel');
      }
    }, {
      "label" : $('#continue').val(),
      "class" : "btn-danger",
      "callback": function() {
        window.location.replace(backLink);
      }
    }]);
  });
  
  /* 
   * X-editable initialization
   */
  if ($('.img-description').length > 0) {
    var crsfKey = $('#csrf').val();
    $('.img-description').editable({
      params: { 
        '_csrf': crsfKey
      },
      mode: 'inline',
      emptytext: $('#emptytext').val()
    });
  }
  
  /*
   * color box
   */
  if ($('.image-link').length > 0) {
    $('.image-link').colorbox({
      rel: 'shop-images',
      scaledPhotos: true,
      maxWidth: $(window).width() * 90/100,
      maxHeight: $(window).height() * 90/100,
      current: $('#imagetext').val() + " {current}/{total}"
    });
  }

  /* 
   * Weibo login function
   */
  function weiboLogin() {
    WB2.anyWhere(function(W){
      W.widget.connectButton({
        id: "wb_connect_btn",	
        type:"3,3",
        callback : {
          login:function(wbUser){	
            // Update the shop weibo credentials
            var data = { _csrf: $('#csrf').val(), weiboId: wbUser.idstr, weiboName: wbUser.name  };
            $.post('/shop/update-weibo-account', data, function(response) {
              console.log(response.status + ':' + response.message);
            });
          },	
          logout:function(){
            // Remove weibo account
            var data = { _csrf: $('#csrf').val() };
            $.post('/shop/remove-weibo-account', data, function(response) {
              console.log(response.status + ':' + response.message);
            });
          }
        }
      });
    });
  }

  /*
   * weibo connect
   */
  if ($('#wb_connect_btn').length > 0) {
    weiboLogin();
  }

  /*
   * weibo disconnect
   */
  $('#remove-weibo').click(function(e) {
    e.preventDefault();
    var data = { _csrf: $('#csrf').val() };
    $.post('/shop/remove-weibo-account', data, function(response) {
      console.log(response.status + ':' + response.message);

      $('#weibo-div').html("<div id='wb_connect_btn'></div>");
      
      // Start the weibo javascript again
      weiboLogin();
    });
  });
});

