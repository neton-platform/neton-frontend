import type { Ref } from 'vue';
import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { computed } from 'vue';

import { DICT_TYPE } from '@vben/constants';
import { getDictOptions } from '@vben/hooks';

interface SelectOption {
  label: string;
  value: number | string;
  disabled?: boolean;
}

/** 新增/修改的表单 */
export function useFormSchema(
  clientOptions: Ref<SelectOption[]>,
  apiOptions: Ref<SelectOption[]>,
  apiDisabled: Ref<boolean>,
  onClientChange: (value?: number | string) => void,
): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'id',
      dependencies: {
        triggerFields: [''],
        show: () => false,
      },
    },
    {
      component: 'Select',
      fieldName: 'clientId',
      label: '客户端',
      componentProps: {
        allowClear: true,
        options: computed(() => clientOptions.value),
        optionFilterProp: 'label',
        placeholder: '请选择客户端',
        showSearch: true,
        onChange: onClientChange,
      },
      rules: 'required',
    },
    {
      component: 'Select',
      fieldName: 'apiId',
      label: 'API',
      componentProps: {
        allowClear: true,
        disabled: computed(() => apiDisabled.value),
        options: computed(() => apiOptions.value),
        optionFilterProp: 'label',
        placeholder: '请选择API',
        showSearch: true,
      },
      rules: 'required',
    },
    {
      component: 'RadioGroup',
      fieldName: 'isCustomPrice',
      label: '是否自定义价格',
      componentProps: {
        buttonStyle: 'solid',
        optionType: 'button',
        options: getDictOptions(DICT_TYPE.PLATFORM_BOOL, 'number'),
      },
      rules: 'required',
    },
    {
      component: 'InputNumber',
      fieldName: 'customPrice',
      label: '自定义价格',
      componentProps: {
        min: 0,
        placeholder: '请输入自定义价格（分）',
        precision: 0,
      },
      dependencies: {
        triggerFields: ['isCustomPrice'],
        show: (values) => values.isCustomPrice === 1,
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'rateLimitPerMin',
      label: '每分钟限流',
      componentProps: {
        min: 0,
        placeholder: '请输入每分钟限流（覆盖 API 默认配置）',
        precision: 0,
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'rateLimitPerDay',
      label: '每日配额',
      componentProps: {
        min: 0,
        placeholder: '请输入每日配额（覆盖客户端默认配置）',
        precision: 0,
      },
    },
    {
      component: 'DatePicker',
      fieldName: 'startTime',
      label: '授权开始时间',
      componentProps: {
        format: 'YYYY-MM-DD HH:mm:ss',
        placeholder: '选择授权开始时间',
        showTime: true,
        valueFormat: 'x',
      },
    },
    {
      component: 'DatePicker',
      fieldName: 'endTime',
      label: '授权结束时间',
      componentProps: {
        format: 'YYYY-MM-DD HH:mm:ss',
        placeholder: '选择授权结束时间（为空表示永久）',
        showTime: true,
        valueFormat: 'x',
      },
    },
    {
      component: 'RadioGroup',
      fieldName: 'status',
      label: '是否启用',
      componentProps: {
        buttonStyle: 'solid',
        optionType: 'button',
        options: getDictOptions(DICT_TYPE.PLATFORM_BOOL, 'number'),
      },
      rules: 'required',
    },
  ];
}

/** 列表的搜索表单 */
export function useGridFormSchema(
  clientOptions: Ref<SelectOption[]>,
  apiOptions: Ref<SelectOption[]>,
): VbenFormSchema[] {
  return [
    {
      component: 'Select',
      fieldName: 'clientId',
      label: '客户端',
      componentProps: {
        allowClear: true,
        options: computed(() => clientOptions.value),
        optionFilterProp: 'label',
        placeholder: '请选择客户端',
        showSearch: true,
      },
    },
    {
      component: 'Select',
      fieldName: 'apiId',
      label: 'API',
      componentProps: {
        allowClear: true,
        options: computed(() => apiOptions.value),
        optionFilterProp: 'label',
        placeholder: '请选择API',
        showSearch: true,
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: '是否启用',
      componentProps: {
        allowClear: true,
        options: getDictOptions(DICT_TYPE.PLATFORM_BOOL, 'number'),
        placeholder: '请选择是否启用',
      },
    },
  ];
}

/** 列表的字段 */
export function useGridColumns(): VxeTableGridOptions['columns'] {
  return [
    {
      type: 'checkbox',
      width: 40,
    },
    {
      field: 'clientId',
      title: '客户端名称',
      minWidth: 140,
      showOverflow: 'tooltip',
      slots: { default: 'clientName' },
    },
    {
      field: 'apiId',
      title: 'API 名称',
      minWidth: 180,
      showOverflow: 'tooltip',
      slots: { default: 'apiName' },
    },
    {
      field: 'status',
      title: '是否启用',
      minWidth: 100,
      slots: { default: 'status' },
    },
    {
      field: 'rateLimitPerMin',
      title: '每分钟限流（覆盖 API 默认配置）',
      minWidth: 220,
    },
    {
      field: 'rateLimitPerDay',
      title: '每日配额（覆盖客户端默认配置）',
      minWidth: 220,
    },
    {
      field: 'isCustomPrice',
      title: '是否自定义价格',
      minWidth: 120,
      slots: { default: 'isCustomPrice' },
    },
    {
      field: 'customPrice',
      title: '自定义价格（分）',
      minWidth: 260,
    },
    {
      field: 'startTime',
      title: '授权开始时间',
      minWidth: 180,
      formatter: 'formatDateTime',
    },
    {
      field: 'endTime',
      title: '授权结束时间（为空表示永久）',
      minWidth: 220,
      formatter: 'formatDateTime',
    },
    {
      field: 'createTime',
      title: '创建时间',
      minWidth: 180,
      formatter: 'formatDateTime',
    },
    {
      title: '操作',
      width: 150,
      fixed: 'right',
      slots: { default: 'actions' },
    },
  ];
}
