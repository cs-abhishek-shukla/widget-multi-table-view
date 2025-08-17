/* Copyright start
    MIT License
    Copyright (c) 2025 Fortinet Inc
Copyright end */
'use strict';
(function () {
  angular
    .module('cybersponse')
    .controller('multiTableView100DevCtrl', multiTableView100DevCtrl);

  multiTableView100DevCtrl.$inject = ['$scope', 'widgetUtilityService', 'FormEntityService', '$controller', 'API', '$resource', 'websocketService', 'Modules', '$interval', '$timeout', '$rootScope', 'toaster'];

  function multiTableView100DevCtrl($scope, widgetUtilityService, FormEntityService, $controller, API, $resource, websocketService, Modules, $interval, $timeout, $rootScope, toaster) {
    $controller('BaseConnectorCtrl', { $scope: $scope });

    $scope.expanded = {};
    $scope.masterSelected = {};
    $scope.isInitializing = false;
    $scope.isTableUpdated = false;
    $scope.getColumns = getColumns;
    $scope.saveSelection = saveSelection;
    $scope.toggleAll = toggleAll;
    $scope.checkMasterSelection = checkMasterSelection;
    $scope.allowCloseOthers = false;
    $scope.hasData = false;
    $scope.invalidSchema = false;

    let widgetsubscription;

    $scope.$on('$destroy', function () {
      if (widgetsubscription) websocketService.unsubscribe(widgetsubscription);
      $interval.cancel($scope.timeinterval);
    });

    $scope.$on('websocket:reconnect', widgetServiceSubscribe);

    function widgetServiceSubscribe() {
      websocketService
        .subscribe($scope.config.module + '/' + $scope.config.moduleUUID, function (result) {
          if (result.changeData && result.changeData.includes($scope.config.jsonField)) {
            // Trigger a re-render when the data changes via websocket
            fetchAndRender();
          }
        })
        .then(function (data) {
          widgetsubscription = data;
        });
    }

    function fetchAndRender() {
      Modules.get({
        module: $scope.config.module,
        id: $scope.config.moduleUUID,
        __selectFields: $scope.config.jsonField,
      }).$promise.then(function (result) {
        $timeout(function () {
          const newValue = result[$scope.config.jsonField];
          console.log('Fetched result from Modules.get:', result);
          console.log('Expected field:', $scope.config.jsonField);
          console.log('Resolved value:', newValue);

          if (newValue !== undefined && newValue !== null) {
            $scope.config.jsonFieldValue = newValue;
            $scope.isTableUpdated = false;
            init(); // Only call init() AFTER the data is fetched
          } else {
            console.warn('Widget data not found in API response. Skipping update to avoid UI disappearing.');
            if (!$scope.config.jsonFieldValue) {
              $scope.hasData = false;
              $scope.invalidSchema = false;
            }
          }
        }); // $timeout with no delay ensures a digest cycle runs
      }).catch(function (err) {
        console.error('Error fetching widget data:', err);
        $scope.hasData = false;
        $scope.invalidSchema = false;
      });
    }

    function getColumns(accordionItem) {
      const nestedItems = accordionItem[$scope.schema.nestedArrayKey];
      if (!Array.isArray(nestedItems) || nestedItems.length === 0) {
        return [];
      }
      return Object.keys(nestedItems[0]).filter(k => {
        return k !== 'selected' && !/^(\$\$|__)/.test(k);
      });
    }


    function saveSelection() {
      generateFilteredJSON();
      toaster.info({
        body: 'Record have been updated successfully.',
      });
      $scope.isTableUpdated = false;
    }

    function generateFilteredJSON() {
      const s = $scope.schema;
      const output = { [s.topLevelArrayKey]: [] };

      $scope.config.jsonFieldValue[s.topLevelArrayKey].forEach((accordionItem) => {
        const nestedItems = accordionItem[s.nestedArrayKey];
        const newAccordionItem = {};

        for (let key in accordionItem) {
          if (key !== s.nestedArrayKey) {
            newAccordionItem[key] = angular.copy(accordionItem[key]);
          }
        }

        const updatedNestedItems = nestedItems.map((item) => {
          const itemCopy = angular.copy(item);
          itemCopy.selected = !!item.selected;
          return itemCopy;
        });

        newAccordionItem[s.nestedArrayKey] = updatedNestedItems;
        output[s.topLevelArrayKey].push(newAccordionItem);
      });

      if (!$scope.isInitializing) {
        _updateJSONVariable(output).then(() => {
          $rootScope.$broadcast('field:updated', [$scope.config.jsonField]);
          $rootScope.$broadcast('viewPanel:reloadFields', [$scope.config.jsonField]);
        });
      }
    }

    function _updateJSONVariable(filteredJSON) {
      const payload = {
        [$scope.config.jsonField]: filteredJSON,
      };
      const endpoint = API.BASE + $scope.config.module + '/' + $scope.config.moduleUUID;
      return $resource(
        endpoint,
        null,
        {
          update: { method: 'PUT' },
        },
        { stripTrailingSlashes: false }
      ).update(payload).$promise;
    }

    function toggleAll(accordionItem) {
      const accordionItemKey = accordionItem[$scope.schema.accordionHeading];
      const allChecked = $scope.masterSelected[accordionItemKey];
      accordionItem[$scope.schema.nestedArrayKey].forEach((item) => {
        item.selected = allChecked;
      });
      $scope.isTableUpdated = true;
    }

    function checkMasterSelection(accordionItemKey) {
      const accordionItem = $scope.config.jsonFieldValue[$scope.schema.topLevelArrayKey].find(
        (item) => item[$scope.schema.accordionHeading] === accordionItemKey
      );
      if (!accordionItem) return;
      $scope.masterSelected[accordionItemKey] = accordionItem[$scope.schema.nestedArrayKey].every((item) => item.selected);
      $scope.isTableUpdated = true;
    }

    function _detectSchema(data) {
      const schema = {};
      schema.topLevelArrayKey = Object.keys(data).find(k => Array.isArray(data[k]));

      if (!schema.topLevelArrayKey || !data[schema.topLevelArrayKey] || data[schema.topLevelArrayKey].length === 0) {
        schema.topLevelArrayKey = 'data';
        if (!data[schema.topLevelArrayKey] || data[schema.topLevelArrayKey].length === 0) {
          console.warn("No data found. Widget might not display correctly.");
          return schema;
        }
      }

      const firstAccordionItem = data[schema.topLevelArrayKey][0];

      if (!firstAccordionItem) {
        return schema;
      }

      const itemKeys = Object.keys(firstAccordionItem);

      schema.accordionHeading = itemKeys.find(k =>
        typeof firstAccordionItem[k] === 'string' &&
        !Array.isArray(firstAccordionItem[k]) &&
        (k.toLowerCase().includes('name') || k.toLowerCase().includes('title') || k.toLowerCase().includes('heading'))
      ) || itemKeys.find(k => typeof firstAccordionItem[k] === 'string' && !Array.isArray(firstAccordionItem[k]));

      schema.nestedArrayKey = itemKeys.find(k => Array.isArray(firstAccordionItem[k]));
      if (!schema.nestedArrayKey || !firstAccordionItem[schema.nestedArrayKey] || firstAccordionItem[schema.nestedArrayKey].length === 0) {
        schema.nestedArrayKey = 'items';
      }

      console.log('Detected Schema:', schema);
      return schema;
    }

    function _setCardColors() {
      var currentTheme = $rootScope.theme;
      if (currentTheme.id === "light") {
        $scope.theme = { id: "light" };
      } else if (currentTheme.id === "steel") {
        $scope.theme = { id: "steel" };
      } else {
        $scope.theme = { id: "dark" };
      }
    }


    function _validateSchema(schema) {
      if (!schema) return false;
      return (
        typeof schema.topLevelArrayKey === 'string' &&
        typeof schema.accordionHeading === 'string' &&
        typeof schema.nestedArrayKey === 'string'
      );
    }

    function _handleTranslations() {
      widgetUtilityService.checkTranslationMode($scope.$parent.model.type).then(function () {
        $scope.viewWidgetVars = {
          // Create your translating static string variables here
          CONFIG_ERROR: widgetUtilityService.translate('multiTableView.CONFIG_ERROR'),
          DATA_NOT_AVAILABLE: widgetUtilityService.translate('multiTableView.DATA_NOT_AVAILABLE')
        };
      });
    }

    function init() {
      _setCardColors();
      _handleTranslations();
      $scope.entity = FormEntityService.get();

      const currentJsonValue = $scope.config.jsonFieldValue;

      if (!currentJsonValue || Object.keys(currentJsonValue).length === 0) {
        $scope.hasData = false;
        return;
      }

      $scope.config.schema = {
        topLevelArrayKey: $scope.config.topLevelArrayKey,
        accordionHeading: $scope.config.accordionHeading,
        nestedArrayKey: $scope.config.nestedArrayKey
      };
      $scope.schema = _validateSchema($scope.config.schema)
        ? $scope.config.schema
        : _detectSchema(currentJsonValue);

      if (!_validateSchema($scope.schema)) {
        console.error("Invalid schema. Widget may not display correctly.", $scope.schema);
        $scope.invalidSchema = true;
        $scope.hasData = false;
        return;
      }

      const accordionItems = currentJsonValue[$scope.schema.topLevelArrayKey];
      if (accordionItems && accordionItems.length > 0) {
        $scope.hasData = true;
        $scope.allowCloseOthers = (accordionItems.length > 1);

        accordionItems.forEach((accordionItem) => {
          const headingKey = accordionItem[$scope.schema.accordionHeading];
          const nestedItems = accordionItem[$scope.schema.nestedArrayKey];

          if (nestedItems) {
            nestedItems.forEach((item) => {
              item.selected = !!item.selected;
            });
            $scope.masterSelected[headingKey] = nestedItems.every((item) => item.selected);
          } else {
            $scope.masterSelected[headingKey] = false;
          }

          if (typeof $scope.expanded[headingKey] === 'undefined') {
            $scope.expanded[headingKey] = (accordionItems.length === 1);
          }
        });
      } else {
        $scope.hasData = false;
        $scope.allowCloseOthers = false;
      }

      $scope.isTableUpdated = false;

      if ($scope.isInitializing) {
        generateFilteredJSON();
      }
      $scope.isInitializing = false;
    }

    // Final initialization logic:
    // 1. Set the initial entity and config data.
    $scope.entity = FormEntityService.get();
    $scope.config.module = $scope.entity.module;
    $scope.config.moduleUUID = $scope.entity.id;
    $scope.isInitializing = true;

    // 2. Fetch the data from the API and then initialize the widget.
    fetchAndRender();

    // 3. Subscribe to real-time updates.
    widgetServiceSubscribe();

  }
})();
