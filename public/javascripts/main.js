$(function() {
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

