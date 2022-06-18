angular.module('TwikipediaAdmin')
  .factory('ArticleService', ArticleService);

var urlArticle = location.origin + '/api/wikipedia';

ArticleService.$inject = ['$q', '$http'];
function ArticleService($q, $http) {
  return {
    getAllArticle: getAllArticle,
    getArticleById: getArticleById,
    addNewArticle: addNewArticle,
    deleteArticle: deleteArticle,
    crawlArticle: crawlArticle,
  };

  function getAllArticle() {
    var def = $q.defer();

    return $http.get(urlArticle)
      .success(allArticle)
      .error(errorAllArticle);

    function allArticle(response) {
      def.resolve(response);
    }

    function errorAllArticle() {
      def.reject('Error GET data Article');
    }

    return def.promise;
  }

  function getArticleById(id) {
    var def = $q.defer();

    return $http.get(urlArticle + '/' + id)
      .success(Article)
      .error(errorArticle);

    function Article(response) {
      def.resolve(response);
    }

    function errorArticle() {
      def.reject('Error GET data Article');
    }

    return def.promise;
  }

  function addNewArticle(article) {
    return $http({
      method: 'POST',
      url: urlArticle,
      data: article,
    });
  }

  function deleteArticle(id) {
    return $http({
      method: 'DELETE',
      url: urlArticle + '/' + id,
    });
  }

  function crawlArticle(query) {
    var def = $q.defer();

    return $http.get(urlArticle + '?q=' + query)
      .success(Article)
      .error(errorArticle);

    function Article(response) {
      def.resolve(response);
    }

    function errorArticle() {
      def.reject('Error Article not found');
    }

    return def.promise;
  }
}
