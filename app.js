var app = angular.module('app', ['ui.grid', 'ui.grid.pagination']);
app.controller('MainCtrl', ['$rootScope', '$scope', '$http', 'modal', 'apiHandler',
    function($rootScope, $scope, $http, modal, apiHandler) {

        var mainCtrl = this;
        $rootScope.apiHandler = new apiHandler();

        $scope.gridOptions2 = {
            enablePaginationControls: false,
            paginationPageSize: PAGINATION_SIZE,
            enableSorting: SORTING_BY_NAME,
            columnDefs: [{
                name: 'Name',
                field: 'name',
                cellTemplate: '<div class="ui-grid-cell-contents" title="TOOLTIP"><div class="textCell">{{COL_FIELD}}</div> </div>'
            }, {
                name: 'Thumbnail',
                field: 'thumbnail',
                enableSorting: false,
                cellTemplate: '<div class="ui-grid-cell-contents" title="TOOLTIP"><img src="{{COL_FIELD CUSTOM_FILTERS}}"/> </div>'
            }, {
                details: 'Action',
                field: 'action',
                enableSorting: false,
                cellTemplate: '<div class="ui-grid-cell-contents" title="TOOLTIP"><div class="textCell"><button class="btn btn-warning" id="{{COL_FIELD}}" ng-click="grid.appScope.showModal($event)">Details</button></div> </div>'
            }]
        };

        $scope.gridOptions2.onRegisterApi = function(gridApi) {
            $scope.gridApi2 = gridApi;
        }

        $scope.search = function() {
            $rootScope.apiHandler.getAllCharacters(mainCtrl.searchbox).then(function(result) {
                $scope.gridOptions2.data = result;
            });
        }

        $scope.reset = function() {
            mainCtrl.searchbox = "";
            $rootScope.apiHandler.getAllCharacters().then(function(result) {
                $scope.gridOptions2.data = result;
            });            
        }

        $scope.reset();

        var myModal = new modal();

        $scope.showModal = function($event) {
            myModal.open($event.target.id);
        };
    }
]);

app.factory('modal', ['$compile', '$rootScope', '$http', function($compile, $rootScope, $http) {
    return function() {
        var elm;
        var html = '<div class="modal" ng-style="modalStyle"><div class="modal-dialog"><div class="modal-content"><div class="modal-header">{{characterName}}</div><div class="modal-body"><img width="100px" height="100px" src="{{characterImage}}"/><br/> {{characterDesc}} <br/><br/> {{characterComics}}</div><div class="modal-footer"><button id="buttonClose" class="btn btn-primary" ng-click="close()">Close</button></div></div></div></div>';
        elm = angular.element(html);
        angular.element(document.body).prepend(elm);

        $rootScope.modalStyle = { "display": "none" };

        $compile(elm)($rootScope);

        $rootScope.close = function() {
            modal.close();
        };

        var modal = {
            open: function(id) {

                $rootScope.apiHandler.getCharacterById(id).then(function(result) {
                    var character = result;
                    $rootScope.characterName = character.name;
                    $rootScope.characterDesc = character.description;
                    $rootScope.characterImage = character.thumbnail.path + '.' + character.thumbnail.extension;
                    $rootScope.characterComics = "comics available : " + character.comics.available;
                    $rootScope.modalStyle = { "display": "block" };
                });

            },
            close: function() {
                $rootScope.modalStyle = { "display": "none" };
            }
        };

        return modal;
    };
}]);

app.factory('apiHandler', ['$rootScope', '$http', '$q', '$cacheFactory', function($rootScope, $http, $q, $cacheFactory) {
    return function() {

        var cache = $cacheFactory('cacheId', { 'capacity': CACHE_CAPACITY });
        var putCache = function(key, value) {
            
            cache.put(key, angular.isUndefined(value) ? null : value);            
        };

        var getCache = function(key) {
            return cache.get(key);
        };

        var apiHandler = {
            getAllCharacters: function(nameFilter) {

                var filter = (angular.isUndefined(nameFilter) || nameFilter.trim() == '') ? '' : nameFilter.trim();
                var cacheKey = filter == '' ? 'all' : filter;
                var cachedData = getCache(cacheKey);
                var defer = $q.defer();

                if (angular.isUndefined(cachedData)) {

                    var param = filter == '' ? '' : 'nameStartsWith=' + filter + '&';
                    var url = 'http://gateway.marvel.com:80/v1/public/characters?' + param + 'apikey=' + MARVEL_API_PUBLIC_KEY + '&ts=1&limit=100';

                    $http.get(url)
                        .success(function(data) {
                            var result = data.data.results;

                            var modelData = [];
                            for (var i = 0; i < result.length; i++) {
                                modelData.push({
                                    'name': result[i].name,
                                    'thumbnail': result[i].thumbnail.path + '.' + result[i].thumbnail.extension,
                                    'action': result[i].id
                                });
                            }

                            putCache(cacheKey, modelData);
                            defer.resolve(modelData);
                        });
                } else {
                    defer.resolve(cachedData);
                }

                return defer.promise;
            },
            getCharacterById: function(id) {

                var cachedData = getCache(id);
                var defer = $q.defer();

                if (angular.isUndefined(cachedData)) {
                    var url = 'http://gateway.marvel.com:80/v1/public/characters/' + id + '?apikey=' + MARVEL_API_PUBLIC_KEY + '&ts=1';
                    $http.get(url)
                        .success(function(data) {
                            var result = data.data.results[0];
                            putCache(id, result);
                            defer.resolve(result);
                        });

                } else {
                    defer.resolve(cachedData);
                }

                return defer.promise;
            }
        }

        return apiHandler;

    };
}]);
