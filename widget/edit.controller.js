/* Copyright start
    MIT License
    Copyright (c) 2025 Fortinet Inc
Copyright end */
'use strict';
(function () {
  angular
    .module('cybersponse')
    .controller('editMultiTableView100Ctrl', editMultiTableView100Ctrl);

  editMultiTableView100Ctrl.$inject = ['$scope', '$uibModalInstance', 'config', 'widgetUtilityService', '$timeout', 'FormEntityService'];

  function editMultiTableView100Ctrl($scope, $uibModalInstance, config, widgetUtilityService, $timeout, FormEntityService) {
    $scope.cancel = cancel;
    $scope.save = save;
    $scope.config = config;

    function _handleTranslations() {
      let widgetNameVersion = widgetUtilityService.getWidgetNameVersion($scope.$resolve.widget, $scope.$resolve.widgetBasePath);

      if (widgetNameVersion) {
        widgetUtilityService.checkTranslationMode(widgetNameVersion).then(function () {
          $scope.viewWidgetVars = {
            // Create your translating static string variables here
            EDIT_VIEW_TITLE: widgetUtilityService.translate('multiTableView.EDIT_VIEW_TITLE'),
            WIDGET_VIEW_TITLE: widgetUtilityService.translate('multiTableView.WIDGET_VIEW_TITLE'),
            TABLE_JSON_FIELD: widgetUtilityService.translate('multiTableView.TABLE_JSON_FIELD'),
            JSON_FIELD: widgetUtilityService.translate('multiTableView.JSON_FIELD'),
            JSON_FIELD_TOOLTIP: widgetUtilityService.translate('multiTableView.JSON_FIELD_TOOLTIP'),
            JSON_FIELD_DEFAULT_VALUE: widgetUtilityService.translate('multiTableView.JSON_FIELD_DEFAULT_VALUE'),
            TOP_LEVEL_KEY: widgetUtilityService.translate('multiTableView.TOP_LEVEL_KEY'),
            ACCORDION_HEADING: widgetUtilityService.translate('multiTableView.ACCORDION_HEADING'),
            NESTED_KEY: widgetUtilityService.translate('multiTableView.NESTED_KEY'),
            ACTION_BTN_LABEL: widgetUtilityService.translate('multiTableView.ACTION_BTN_LABEL'),
            ACTION_BTN_TOOLTIP: widgetUtilityService.translate('multiTableView.ACTION_BTN_TOOLTIP'),
            SAVE_BTN: widgetUtilityService.translate('multiTableView.SAVE_BTN'),
            CLOSE_BTN: widgetUtilityService.translate('multiTableView.CLOSE_BTN')
          };
          $scope.header = $scope.config.title ? 'Edit widget' : 'Add widget';
          loadAttributes();
        });
      } else {
        $timeout(function () {
          $scope.cancel();
        });
      }
    }

    function loadAttributes() {
      $scope.fieldsArray = [];
      var entity = FormEntityService.get();
      $scope.config.module = entity.module;
      $scope.config.moduleUUID = entity.id;
      entity.loadFields().then(function () {
        $scope.fieldsArray = entity.getFormFieldsArray();
      });
    }

    function init() {
      // To handle backward compatibility for widget
      _handleTranslations();
    }

    init();

    function cancel() {
      $uibModalInstance.dismiss('cancel');
    }

    function save() {
      if ($scope.editMultiTableViewWidgetForm.$invalid) {
        $scope.editMultiTableViewWidgetForm.$setTouched();
        $scope.editMultiTableViewWidgetForm.$focusOnFirstError();
        return;
      }
      $uibModalInstance.close($scope.config);
    }

  }
})();
