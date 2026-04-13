import type { Ref } from 'vue';
import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { computed } from 'vue';
import { fenToYuan } from '@vben/utils';

const placeholderSelectOptions = [{ label: '请选择字典生成', value: '' }];
const placeholderRadioOptions = [{ label: '请选择字典生成', value: '1' }];

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
      fieldName: 'traceId',
      label: '请求跟踪ID（对应 X-Trace-Id）',
      componentProps: {
        placeholder: '请输入请求跟踪ID（对应 X-Trace-Id）',
      },
      rules: 'required',
      formItemClass: 'col-span-2',
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
      label: 'API ID（关联 platform_api.id）',
      componentProps: {
        placeholder: '请输入API ID（关联 platform_api.id）',
      },
    },
    {
      component: 'Input',
      fieldName: 'apiCode',
      label: 'API 编码',
      componentProps: {
        placeholder: '请输入API 编码',
      },
    },
    {
      component: 'Input',
      fieldName: 'apiPath',
      label: 'API 路径',
      componentProps: {
        placeholder: '请输入API 路径',
      },
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'httpMethod',
      label: 'HTTP 方法',
      componentProps: {
        placeholder: '请输入HTTP 方法',
      },
      rules: 'required',
    },
    {
      component: 'Textarea',
      fieldName: 'requestHeaders',
      label: '请求头（JSON）',
      componentProps: {
        placeholder: '请输入请求头（JSON）',
        rows: 3,
      },
      formItemClass: 'col-span-2',
    },
    {
      component: 'Textarea',
      fieldName: 'requestParams',
      label: '请求参数（JSON）',
      componentProps: {
        placeholder: '请输入请求参数（JSON）',
        rows: 3,
      },
      formItemClass: 'col-span-2',
    },
    {
      component: 'Textarea',
      fieldName: 'requestBody',
      label: '请求体（JSON）',
      componentProps: {
        placeholder: '请输入请求体（JSON）',
        rows: 3,
      },
      formItemClass: 'col-span-2',
    },
    {
      component: 'Input',
      fieldName: 'requestIp',
      label: '请求IP',
      componentProps: {
        placeholder: '请输入请求IP',
      },
    },
    {
      component: 'Input',
      fieldName: 'requestUserAgent',
      label: 'User-Agent',
      componentProps: {
        placeholder: '请输入User-Agent',
      },
    },
    {
      component: 'RadioGroup',
      fieldName: 'responseStatus',
      label: 'HTTP 状态码',
      componentProps: {
        options: placeholderRadioOptions,
      },
    },
    {
      component: 'Textarea',
      fieldName: 'responseBody',
      label: '响应内容（截断，保留前 10KB）',
      componentProps: {
        placeholder: '请输入响应内容（截断，保留前 10KB）',
        rows: 3,
      },
      formItemClass: 'col-span-2',
    },
    {
      component: 'InputNumber',
      fieldName: 'durationMs',
      label: '耗时（毫秒）',
      componentProps: {
        min: 0,
        placeholder: '请输入耗时（毫秒）',
        precision: 0,
      },
    },
    {
      component: 'RadioGroup',
      fieldName: 'success',
      label: '是否成功',
      componentProps: {
        options: placeholderRadioOptions,
      },
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'errorCode',
      label: '错误码',
      componentProps: {
        placeholder: '请输入错误码',
      },
    },
    {
      component: 'Input',
      fieldName: 'errorMsg',
      label: '错误信息',
      componentProps: {
        placeholder: '请输入错误信息',
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'chargePrice',
      label: '本次计费金额（分）',
      componentProps: {
        placeholder: '请输入本次计费金额（分）',
        precision: 0,
      },
      rules: 'required',
    },
    {
      component: 'RadioGroup',
      fieldName: 'chargeStatus',
      label: '扣费状态：1=成功 2=失败（余额不足）',
      componentProps: {
        options: placeholderRadioOptions,
      },
    },
    {
      component: 'DatePicker',
      fieldName: 'requestTime',
      label: '请求时间（UTC）',
      componentProps: {
        format: 'YYYY-MM-DD HH:mm:ss',
        placeholder: '选择请求时间（UTC）',
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
      component: 'Select',
      fieldName: 'success',
      label: '是否成功',
      componentProps: {
        allowClear: true,
        options: placeholderSelectOptions,
        placeholder: '请选择是否成功',
      },
    },
  ];
}

/** 列表的字段 */
export function useGridColumns(): VxeTableGridOptions['columns'] {
  return [
    { field: 'id', title: '日志ID', minWidth: 90 },
    {
      field: 'traceId',
      title: '请求跟踪ID（对应 X-Trace-Id）',
      minWidth: 220,
      showOverflow: 'tooltip',
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
    { field: 'apiCode', title: 'API 编码', minWidth: 140 },
    {
      field: 'apiPath',
      title: 'API 路径',
      minWidth: 180,
      showOverflow: 'tooltip',
    },
    { field: 'httpMethod', title: 'HTTP 方法', minWidth: 120 },
    {
      field: 'requestHeaders',
      title: '请求头（JSON）',
      minWidth: 200,
      showOverflow: 'tooltip',
    },
    {
      field: 'requestParams',
      title: '请求参数（JSON）',
      minWidth: 200,
      showOverflow: 'tooltip',
    },
    {
      field: 'requestBody',
      title: '请求体（JSON）',
      minWidth: 200,
      showOverflow: 'tooltip',
    },
    { field: 'requestIp', title: '请求IP', minWidth: 120 },
    {
      field: 'requestUserAgent',
      title: 'User-Agent',
      minWidth: 220,
      showOverflow: 'tooltip',
    },
    { field: 'responseStatus', title: 'HTTP 状态码', minWidth: 120 },
    {
      field: 'responseBody',
      title: '响应内容（截断，保留前 10KB）',
      minWidth: 220,
      showOverflow: 'tooltip',
    },
    { field: 'durationMs', title: '耗时（毫秒）', minWidth: 120 },
    { field: 'success', title: '是否成功', minWidth: 100 },
    { field: 'errorCode', title: '错误码', minWidth: 120 },
    {
      field: 'errorMsg',
      title: '错误信息',
      minWidth: 180,
      showOverflow: 'tooltip',
    },
    {
      field: 'chargePrice',
      title: '本次计费金额（元）',
      minWidth: 160,
      formatter: ({ cellValue }) => formatAmountInYuan(cellValue),
    },
    {
      field: 'chargeStatus',
      title: '扣费状态：1=成功 2=失败（余额不足）',
      minWidth: 240,
    },
    {
      field: 'requestTime',
      title: '请求时间（UTC）',
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
