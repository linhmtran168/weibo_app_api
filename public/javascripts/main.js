$(function() {
  if ($('#edit-addresspicker').length > 0) {
    // Maps for update shop location
    var long = parseFloat($('#long').val());
    long = _.isNumber(long) ? long : 139.7667;
    var lat = parseFloat($('#lat').val());
    lat = _.isNumber(lat) ? lat : 35.6833;

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

  // Initialize bootstrap validation for form
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

});

