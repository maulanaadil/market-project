angular.module('TwikipediaAdmin')
  .controller('CrawlCtrl', CrawlCtrl)
  .controller('CrawlAddCtrl', CrawlAddCtrl);

CrawlCtrl.$inject = ['ArticleService', 'ActionService', 'NgTableParams'];
function CrawlCtrl(ArticleService, ActionService, NgTableParams) {
  var vm = this;

  ArticleService.getAllArticle()
    .then(getAllArticle);

  function getAllArticle(response) {
    vm.article = response.data.data;
    console.log(vm.article);

    vm.tableArticleWikipedia = new NgTableParams({
      count: 5,
    }, {
      counts: [5, 10, 15],
      dataset: vm.article,
    });
  }

  vm.delete = deleteArticle;
  function deleteArticle(id, title) {

    ActionService.Delete(deleteCallback, title);

    function deleteCallback() {
      ArticleService.deleteArticle(id)
        .success(articleDeleted)
        .error(errDeleteArticle);
    }

    function articleDeleted(response) {
      ArticleService.getAllArticle()
        .then(getAllArticle);
    }

    function errDeleteArticle(err) {
      ActionService.Failed(err.message);
    }

  }
}

CrawlAddCtrl.$inject = ['ArticleService', 'CategoryService', 'ActionService'];
function CrawlAddCtrl(ArticleService, CategoryService, ActionService) {
  var vm = this;

  vm.statusSearch = false;

  CategoryService.getAllCategory()
    .then(getCategory);

  function getCategory(response) {
    vm.categories = response.data.data;
  }

  vm.reset = reset;
  function reset() {
    vm.statusSearch = false;
    $('#article-result')[0].remove();
  }

  vm.saveArticle = saveArticle;
  function saveArticle(category) {

    if ((category === undefined) || (category === '')) {
      ActionService.Failed('Category is empty!');
    } else {
      vm.article.categoryName = category;
      console.log(vm.article);

      ArticleService.addNewArticle(vm.article)
        .success(successAddArticle)
        .error(errAddArticle);

    }

    function successAddArticle(response) {
      ActionService.Succesed(`Article added to category ${category}`);
      vm.statusSearch = false;
      $('#article-result')[0].remove();
      vm.query = '';
      console.log(response);
    }

    function errAddArticle(err) {
      ActionService.Failed(err.message);
      console.log(err);
    }
  }

  vm.search = search;
  function search(query) {
    ArticleService.crawlArticle(query)
      .success(getArticleWikipedia)
      .error(notFound);

    function getArticleWikipedia(response) {
      console.log(response);
      vm.statusSearch = true;
      vm.article = response.data;

      $('#article')
      .html('<div class="panel" id="article-result"> <div class="panel-body">' + vm.article.article + '</div> </div>');
    }

    function notFound(err) {
      ActionService.Failed(err.message);
    }
  }
}
