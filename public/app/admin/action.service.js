angular
  .module('TwikipediaAdmin')
  .factory('ActionService', ActionService);

ActionService.$inject = ['SweetAlert'];

function ActionService(SweetAlert) {
  return {
    Delete: Delete,
    Succesed: Succesed,
    Update: Update,
    Failed: Failed,
  };

  function Delete(callback, nama) {

    SweetAlert.swal({
        title: 'Are you sure wanna delete ' + nama + '?',
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
          SweetAlert.swal('Deleted', ' Data ' + nama + ' has been successful deleted.', 'success');
        } else {
          SweetAlert.swal('Cancel', 'Delete canceled', 'error');
        }
      });
  }

  function Succesed(m) {
    var message = (m === undefined) ? 'New data has been successful added' : m;
    SweetAlert.swal('Succesed', m, 'success');
  }

  function Update(id) {
    SweetAlert.swal('Succesed', 'Success update data with id = ' + id, 'success');
  }

  function Failed(m) {
    var message = (m === undefined) ? 'Please check again your form!' : m;
    SweetAlert.swal('Error!', m, 'error');
  }
}
