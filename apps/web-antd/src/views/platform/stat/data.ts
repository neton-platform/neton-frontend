import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { getRangePickerDefaultProps } from '#/utils';

const placeholderSelectOptions = [{ label: '请选择字典生成', value: '' }];

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
      component: 'Select',
      fieldName: 'clientId',
      label: '客户端ID',
      componentProps: {
        options: placeholderSelectOptions,
        placeholder: '请选择客户端ID',
      },
      rules: 'required',
    },
    {
      component: 'Select',
      fieldName: 'apiId',
      label: 'API ID（为空表示客户端维度统计）',
      componentProps: {
        options: placeholderSelectOptions,
        placeholder: '请选择API ID（为空表示客户端维度统计）',
      },
    },
    {
      component: 'DatePicker',
      fieldName: 'statDate',
      label: '统计日期',
      componentProps: {
        placeholder: '选择统计日期',
        valueFormat: 'x',
      },
      rules: 'required',
    },
    {
      component: 'InputNumber',
      fieldName: 'totalCount',
      label: '总调用次数',
      componentProps: {
        min: 0,
        placeholder: '请输入总调用次数',
        precision: 0,
      },
      rules: 'required',
    },
    {
      component: 'InputNumber',
      fieldName: 'successCount',
      label: '成功次数',
      componentProps: {
        min: 0,
        placeholder: '请输入成功次数',
        precision: 0,
      },
      rules: 'required',
    },
    {
      component: 'InputNumber',
      fieldName: 'failedCount',
      label: '失败次数',
      componentProps: {
        min: 0,
        placeholder: '请输入失败次数',
        precision: 0,
      },
      rules: 'required',
    },
    {
      component: 'InputNumber',
      fieldName: 'avgDurationMs',
      label: '平均耗时（毫秒）',
      componentProps: {
        min: 0,
        placeholder: '请输入平均耗时（毫秒）',
        precision: 0,
      },
      rules: 'required',
    },
    {
      component: 'InputNumber',
      fieldName: 'maxDurationMs',
      label: '最大耗时（毫秒）',
      componentProps: {
        min: 0,
        placeholder: '请输入最大耗时（毫秒）',
        precision: 0,
      },
      rules: 'required',
    },
    {
      component: 'InputNumber',
      fieldName: 'totalCharge',
      label: '总计费金额（分）',
      componentProps: {
        min: 0,
        placeholder: '请输入总计费金额（分）',
        precision: 0,
      },
      rules: 'required',
    },
    {
      component: 'InputNumber',
      fieldName: 'freeCount',
      label: '免费调用次数',
      componentProps: {
        min: 0,
        placeholder: '请输入免费调用次数',
        precision: 0,
      },
      rules: 'required',
    },
    {
      component: 'InputNumber',
      fieldName: 'chargedCount',
      label: '计费调用次数',
      componentProps: {
        min: 0,
        placeholder: '请输入计费调用次数',
        precision: 0,
      },
      rules: 'required',
    },
  ];
}

/** 列表的搜索表单 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Select',
      fieldName: 'clientId',
      label: '客户端ID',
      componentProps: {
        allowClear: true,
        options: placeholderSelectOptions,
        placeholder: '请选择客户端ID',
      },
    },
    {
      component: 'Select',
      fieldName: 'apiId',
      label: 'API ID（为空表示客户端维度统计）',
      componentProps: {
        allowClear: true,
        options: placeholderSelectOptions,
        placeholder: '请选择API ID（为空表示客户端维度统计）',
      },
    },
    {
      component: 'RangePicker',
      fieldName: 'statDate',
      label: '统计日期',
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
    { type: 'checkbox', width: 40 },
    { field: 'id', title: '统计ID', minWidth: 90 },
    { field: 'clientId', title: '客户端ID', minWidth: 120 },
    {
      field: 'apiId',
      title: 'API ID（为空表示客户端维度统计）',
      minWidth: 220,
    },
    { field: 'statDate', title: '统计日期', minWidth: 180 },
    { field: 'totalCount', title: '总调用次数', minWidth: 120 },
    { field: 'successCount', title: '成功次数', minWidth: 120 },
    { field: 'failedCount', title: '失败次数', minWidth: 120 },
    { field: 'avgDurationMs', title: '平均耗时（毫秒）', minWidth: 140 },
    { field: 'maxDurationMs', title: '最大耗时（毫秒）', minWidth: 140 },
    { field: 'totalCharge', title: '总计费金额（分）', minWidth: 140 },
    { field: 'freeCount', title: '免费调用次数', minWidth: 120 },
    { field: 'chargedCount', title: '计费调用次数', minWidth: 120 },
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
