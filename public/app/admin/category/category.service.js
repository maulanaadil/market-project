angular.module('TwikipediaAdmin')
  .factory('CategoryService', CategoryService);

var urlCategory = location.origin + '/api/category';

CategoryService.$inject = ['$q', '$http'];
function CategoryService($q, $http) {
  return {
    getAllCategory: getAllCategory,
    getCategoryById: getCategoryById,
    addNewCategory: addNewCategory,
    updateCategory: updateCategory,
    deleteCategory: deleteCategory,
  };

  function getAllCategory() {
    var def = $q.defer();

    return $http.get(urlCategory)
      .success(allCategory)
      .error(errorAllCategory);

    function allCategory(response) {
      def.resolve(response);
    }

    function errorAllCategory() {
      def.reject('Error GET data Category');
    }

    return def.promise;
  }

  function getCategoryById(id) {
    var def = $q.defer();

    return $http.get(urlCategory + '/' + id)
      .success(Category)
      .error(errorCategory);

    function Category(response) {
      def.resolve(response);
    }

    function errorCategory() {
      def.reject('Error GET data Category');
    }

    return def.promise;
  }

  function addNewCategory(user) {
    return $http({
      method: 'POST',
      url: urlCategory,
      data: user,
    });
  }

  function updateCategory(id, user) {
    return $http({
      method: 'PUT',
      url: urlCategory + '/' + id,
      data: user,
    });
  }

  function deleteCategory(id) {
    return $http({
      method: 'DELETE',
      url: urlCategory + '/' + id,
    });
  }
}
