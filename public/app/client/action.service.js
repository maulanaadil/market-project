angular
  .module('TwikipediaClient')
  .factory('ActionService', ActionService);

ActionService.$inject = ['SweetAlert'];

function ActionService(SweetAlert) {
  return {
    Delete: Delete,
    Succesed: Succesed,
    Update: Update,
    Failed: Failed,
  };

  function Delete(callback, tweet) {

    SweetAlert.swal({
        title: 'Are you sure wanna delete "' + tweet + '"?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        closeOnConfirm: false,
        closeOnCancel: false,
      },

      function (isConfirm) {
        console.log(isConfirm);
        if (isConfirm) {
          callback();
          SweetAlert.swal('Deleted', tweet + ' has been successful deleted.', 'success');
        } else {
          SweetAlert.swal('Cancel', 'Delete canceled', 'error');
        }
      });
  }

  function Succesed(m) {
    var message = (m === undefined) ? 'New data has been successful added' : m;
    SweetAlert.swal('Success', m, 'success');
    // $('#modalUserNearby').modal('toggle');
  }

  function Update(id) {
    SweetAlert.swal('Success', 'Success update data with id = ' + id, 'success');
  }

  function Failed(m) {
    var message = (m === undefined) ? 'Please check again your form!' : m;
    SweetAlert.swal('Error!', m, 'error');
  }
}
