angular.module('TwikipediaAdmin')
  .controller('CategoryCtrl', CategoryCtrl)
  .controller('CategoryAddCtrl', CategoryAddCtrl);

CategoryCtrl.$inject = ['CategoryService', 'NgTableParams', 'ActionService'];
function CategoryCtrl(CategoryService, NgTableParams, ActionService) {
  var vm = this;

  CategoryService.getAllCategory()
    .then(getAllCategory);

  function getAllCategory(response) {
    vm.categories = response.data.data;
    console.log(vm.categories);
    vm.tableCategory = new NgTableParams({
      count: 20,
    }, {
      counts: false,
      dataset: vm.categories,
    });
  }

  vm.delete = deleteCategory;
  function deleteCategory(id, name, index) {
    ActionService.Delete(deleteCallback, name);
    function deleteCallback() {
      CategoryService.deleteCategory(id)
        .success(deleteCategory)
        .error(errDeleteCategory);

      function deleteCategory(response) {
        console.log(response);
        CategoryService.getAllCategory().then(getAllCategory);
      }

      function errDeleteCategory(err) {
        console.log(err);
        ActionService.Failed(err.message);
      }
    }
  }
}

CategoryAddCtrl.$inject = ['CategoryService', 'ActionService', '$state'];
function CategoryAddCtrl(CategoryService, ActionService, $state) {
  var vm = this;
  vm.title = 'Add New';

  vm.save = save;
  function save(category) {
    CategoryService.addNewCategory(category)
      .success(addNewCategory)
      .error(errAddNewCategory);

    function addNewCategory(response) {
      ActionService.Succesed(`Success add ${category} category`);
      $state.go('category');
    }

    function errAddNewCategory(err) {
      ActionService.Failed(err.message);
    }
  }
}
