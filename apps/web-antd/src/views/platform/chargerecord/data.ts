import type { Ref } from 'vue';
import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { computed } from 'vue';

import { DICT_TYPE } from '@vben/constants';
import { getDictOptions } from '@vben/hooks';
import { fenToYuan } from '@vben/utils';

import { getRangePickerDefaultProps } from '#/utils';

interface SelectOption {
  label: string;
  value: number | string;
}

function formatAmountInYuan(value?: number | string | null) {
  if (value === undefined || value === null || value === '') {
    return '-';
  }
  return `${fenToYuan(value)} 元`;
}

/** 新增/修改的表单 */
export function useFormSchema(): VbenFormSchema[] {
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
      component: 'Input',
      fieldName: 'clientId',
      label: '客户端ID',
      componentProps: {
        placeholder: '请输入客户端ID',
      },
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'apiId',
      label: 'API ID',
      componentProps: {
        placeholder: '请输入API ID',
      },
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'traceId',
      label: '请求跟踪ID（关联日志）',
      componentProps: {
        placeholder: '请输入请求跟踪ID（关联日志）',
      },
      rules: 'required',
      formItemClass: 'col-span-2',
    },
    {
      component: 'Select',
      fieldName: 'chargeType',
      label: '计费类型',
      componentProps: {
        options: getDictOptions(DICT_TYPE.PLATFORM_CHARGE_TYPE, 'number'),
        placeholder: '请选择计费类型',
      },
      rules: 'required',
    },
    {
      component: 'InputNumber',
      fieldName: 'price',
      label: '本次计费金额（分）',
      componentProps: {
        min: 0,
        placeholder: '请输入本次计费金额（分）',
        precision: 0,
      },
      rules: 'required',
    },
    {
      component: 'RadioGroup',
      fieldName: 'isCustomPrice',
      label: '是否使用自定义价格',
      componentProps: {
        buttonStyle: 'solid',
        optionType: 'button',
        options: getDictOptions(DICT_TYPE.PLATFORM_BOOL, 'boolean'),
      },
      rules: 'required',
    },
    {
      component: 'InputNumber',
      fieldName: 'balanceBefore',
      label: '扣费前余额（分）',
      componentProps: {
        min: 0,
        placeholder: '请输入扣费前余额（分）',
        precision: 0,
      },
      rules: 'required',
    },
    {
      component: 'InputNumber',
      fieldName: 'balanceAfter',
      label: '扣费后余额（分）',
      componentProps: {
        min: 0,
        placeholder: '请输入扣费后余额（分）',
        precision: 0,
      },
      rules: 'required',
    },
    {
      component: 'RadioGroup',
      fieldName: 'chargeStatus',
      label: '是否扣费成功',
      componentProps: {
        buttonStyle: 'solid',
        optionType: 'button',
        options: getDictOptions(DICT_TYPE.PLATFORM_BOOL, 'number'),
      },
      rules: 'required',
    },
    {
      component: 'Textarea',
      fieldName: 'failureReason',
      label: '失败原因',
      componentProps: {
        placeholder: '请输入失败原因',
        rows: 3,
      },
      formItemClass: 'col-span-2',
    },
    {
      component: 'DatePicker',
      fieldName: 'chargeTime',
      label: '扣费时间',
      componentProps: {
        format: 'YYYY-MM-DD HH:mm:ss',
        placeholder: '选择扣费时间',
        showTime: true,
        valueFormat: 'x',
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
      component: 'Input',
      fieldName: 'traceId',
      label: '请求跟踪ID（关联日志）',
      componentProps: {
        allowClear: true,
        placeholder: '请输入请求跟踪ID（关联日志）',
      },
    },
    {
      component: 'Select',
      fieldName: 'chargeStatus',
      label: '是否扣费成功',
      componentProps: {
        allowClear: true,
        options: getDictOptions(DICT_TYPE.PLATFORM_BOOL, 'number'),
        placeholder: '请选择是否扣费成功',
      },
    },
    {
      component: 'RangePicker',
      fieldName: 'createTime',
      label: '创建时间',
      componentProps: {
        ...getRangePickerDefaultProps(),
        allowClear: true,
      },
    },
  ];
}

/** 列表的字段 */
export function useGridColumns(): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'id',
      title: '计费ID',
      minWidth: 90,
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
      minWidth: 160,
      showOverflow: 'tooltip',
      slots: { default: 'apiName' },
    },
    {
      field: 'traceId',
      title: '请求跟踪ID（关联日志）',
      minWidth: 220,
      showOverflow: 'tooltip',
    },
    {
      field: 'chargeType',
      title: '计费类型',
      minWidth: 120,
      slots: { default: 'chargeType' },
    },
    {
      field: 'operateType',
      title: '操作类型',
      minWidth: 120,
      slots: { default: 'operateType' },
    },
    {
      field: 'price',
      title: '本次计费金额（元）',
      minWidth: 140,
      formatter: ({ cellValue }) => formatAmountInYuan(cellValue),
    },
    {
      field: 'isCustomPrice',
      title: '是否使用自定义价格',
      minWidth: 140,
      slots: { default: 'isCustomPrice' },
    },
    {
      field: 'balanceBefore',
      title: '扣费前余额（元）',
      minWidth: 140,
      formatter: ({ cellValue }) => formatAmountInYuan(cellValue),
    },
    {
      field: 'balanceAfter',
      title: '扣费后余额（元）',
      minWidth: 140,
      formatter: ({ cellValue }) => formatAmountInYuan(cellValue),
    },
    {
      field: 'chargeStatus',
      title: '是否扣费成功',
      minWidth: 120,
      slots: { default: 'chargeStatus' },
    },
    {
      field: 'failureReason',
      title: '失败原因',
      minWidth: 180,
      showOverflow: 'tooltip',
    },
    {
      field: 'remark',
      title: '备注',
      minWidth: 200,
      showOverflow: 'tooltip',
      slots: { default: 'remark' },
    },
    {
      field: 'chargeTime',
      title: '扣费时间',
      minWidth: 180,
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
