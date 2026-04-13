import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { CommonStatusEnum, DICT_TYPE } from '@vben/constants';
import { getDictOptions } from '@vben/hooks';
import { fenToYuan } from '@vben/utils';

import { z } from '#/adapter/form';
import { getRangePickerDefaultProps } from '#/utils';

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
      fieldName: 'apiCode',
      label: 'API 编码',
      componentProps: {
        placeholder: '请输入API 编码',
      },
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'apiName',
      label: 'API 名称',
      componentProps: {
        placeholder: '请输入API 名称',
      },
      rules: 'required',
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
      component: 'Select',
      fieldName: 'httpMethod',
      label: 'HTTP 方法',
      componentProps: {
        options: getDictOptions(DICT_TYPE.PLATFORM_REQUEST_METHOD),
        placeholder: '请选择 HTTP 方法',
      },
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'category',
      label: 'API 分类',
      componentProps: {
        placeholder: '请输入API 分类',
      },
    },
    {
      component: 'Textarea',
      fieldName: 'description',
      label: 'API 描述',
      componentProps: {
        placeholder: '请输入API 描述',
        rows: 4,
      },
      formItemClass: 'col-span-2',
    },
    {
      component: 'RadioGroup',
      fieldName: 'status',
      label: '状态',
      componentProps: {
        buttonStyle: 'solid',
        optionType: 'button',
        options: getDictOptions(DICT_TYPE.PLATFORM_CLIENT_STATUS, 'number'),
      },
      rules: z.number().default(CommonStatusEnum.ENABLE),
    },
    {
      component: 'InputNumber',
      fieldName: 'rateLimitPerMin',
      label: '每分钟限流',
      componentProps: {
        min: 0,
        placeholder: '请输入每分钟限流',
        precision: 0,
      },
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'rateLimit',
      label: '限流描述',
      componentProps: {
        placeholder: '请输入限流描述，例如 100 次/分钟/客户端',
      },
    },
    {
      component: 'Textarea',
      fieldName: 'requestSchema',
      label: '请求字段 Schema',
      componentProps: {
        placeholder: '请输入请求字段 JSON，例如 [{"field":"idCard","type":"String"}]',
        rows: 3,
      },
      formItemClass: 'col-span-2',
    },
    {
      component: 'Textarea',
      fieldName: 'responseSchema',
      label: '响应字段 Schema',
      componentProps: {
        placeholder: '请输入响应字段 JSON，例如 [{"field":"riskLevel","type":"String"}]',
        rows: 3,
      },
      formItemClass: 'col-span-2',
    },
    {
      component: 'Textarea',
      fieldName: 'requestExample',
      label: '请求示例',
      componentProps: {
        placeholder: '{"phone":"13800138000"}',
        rows: 3,
      },
      formItemClass: 'col-span-2',
    },
    {
      component: 'Textarea',
      fieldName: 'responseExample',
      label: '响应示例',
      componentProps: {
        placeholder: '{"creditBehaviorResult":2}',
        rows: 3,
      },
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
      fieldName: 'defaultPrice',
      label: '默认单价（元）',
      componentProps: {
        min: 0,
        placeholder: '请输入默认单价（元）',
        precision: 2,
        step: 0.01,
      },
      rules: 'required',
    },
  ];
}

/** 列表的搜索表单 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'apiCode',
      label: 'API 编码',
      componentProps: {
        allowClear: true,
        placeholder: '请输入API 编码',
      },
    },
    {
      component: 'Input',
      fieldName: 'apiName',
      label: 'API 名称',
      componentProps: {
        allowClear: true,
        placeholder: '请输入API 名称',
      },
    },
    {
      component: 'Input',
      fieldName: 'category',
      label: 'API 分类',
      componentProps: {
        allowClear: true,
        placeholder: '请输入API 分类',
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: '状态',
      componentProps: {
        allowClear: true,
        options: getDictOptions(DICT_TYPE.PLATFORM_CLIENT_STATUS, 'number'),
        placeholder: '请选择状态',
      },
    },
    // {
    //   component: 'Select',
    //   fieldName: 'isPublic',
    //   label: '是否公开',
    //   componentProps: {
    //     allowClear: true,
    //     options: getDictOptions(DICT_TYPE.PLATFORM_BOOL, 'number'),
    //     placeholder: '请选择是否公开',
    //   },
    // },
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
      type: 'checkbox',
      width: 40,
    },
    {
      field: 'id',
      title: 'API ID',
      minWidth: 90,
    },
    {
      field: 'apiName',
      title: 'API 名称',
      minWidth: 160,
    },
    {
      field: 'apiCode',
      title: 'API 编码',
      minWidth: 140,
    },
    {
      field: 'apiPath',
      title: 'API 路径',
      minWidth: 220,
      showOverflow: 'tooltip',
    },
    {
      field: 'httpMethod',
      title: 'HTTP 方法',
      minWidth: 120,
      slots: { default: 'httpMethod' },
    },
    {
      field: 'category',
      title: 'API 分类',
      minWidth: 140,
    },
    {
      field: 'description',
      title: 'API 描述',
      minWidth: 220,
      showOverflow: 'tooltip',
    },
    {
      field: 'status',
      title: '状态',
      minWidth: 100,
      slots: { default: 'status' },
    },
    {
      field: 'rateLimitPerMin',
      title: '每分钟限流',
      minWidth: 120,
    },
    {
      field: 'chargeType',
      title: '计费类型',
      minWidth: 120,
      slots: { default: 'chargeType' },
    },
    {
      field: 'defaultPrice',
      title: '默认单价（元）',
      minWidth: 140,
      formatter: ({ cellValue }) => formatAmountInYuan(cellValue),
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
