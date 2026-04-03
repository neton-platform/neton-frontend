import type { Ref } from 'vue';

import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { CommonStatusEnum, DICT_TYPE } from '@vben/constants';
import { getDictOptions } from '@vben/hooks';

import { z } from '#/adapter/form';

interface MemberOption {
  label: string;
  value: number;
}

interface ClientFormSchemaOptions {
  memberLoading: Ref<boolean>;
  memberOptions: Ref<MemberOption[]>;
  onMemberDropdownVisibleChange: (open: boolean) => Promise<void> | void;
  onMemberSearch: (value: string) => Promise<void> | void;
}

/** 新增/修改的表单 */
export function useFormSchema(
  options: ClientFormSchemaOptions,
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
      fieldName: 'memberUserId',
      label: '关联会员',
      componentProps: () => ({
        allowClear: true,
        filterOption: false,
        loading: options.memberLoading.value,
        onDropdownVisibleChange: options.onMemberDropdownVisibleChange,
        onSearch: options.onMemberSearch,
        options: options.memberOptions.value,
        placeholder: '请选择会员，可搜索昵称/手机号',
        showSearch: true,
      }),
    },
    {
      component: 'Input',
      fieldName: 'clientId',
      label: '客户端唯一标识',
      componentProps: {
        disabled: true,
        placeholder: '系统自动生成客户端唯一标识',
      },
      rules: 'required',
    },
    {
      component: 'InputPassword',
      fieldName: 'clientSecret',
      label: '客户端密钥',
      componentProps: {
        readonly: true,
        placeholder: '系统自动生成客户端密钥',
      },
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'clientName',
      label: '客户端名称',
      componentProps: {
        placeholder: '请输入客户端名称',
      },
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'clientCode',
      label: '客户端编码',
      componentProps: {
        placeholder: '请输入客户端编码（英文标识）',
      },
    },
    {
      component: 'ImageUpload',
      fieldName: 'clientLogo',
      label: '客户端 Logo',
      componentProps: {
        placeholder: '请上传客户端 Logo',
      },
    },
    {
      component: 'Textarea',
      fieldName: 'description',
      label: '客户端描述',
      componentProps: {
        placeholder: '请输入客户端描述',
        rows: 4,
      },
      formItemClass: 'col-span-2',
    },
    {
      component: 'Input',
      fieldName: 'companyName',
      label: '公司名称',
      componentProps: {
        placeholder: '请输入公司名称',
      },
    },
    {
      component: 'Input',
      fieldName: 'businessLicense',
      label: '营业执照号',
      componentProps: {
        placeholder: '请输入营业执照号',
      },
    },
    {
      component: 'Input',
      fieldName: 'contactName',
      label: '联系人姓名',
      componentProps: {
        placeholder: '请输入联系人姓名',
      },
    },
    {
      component: 'Input',
      fieldName: 'contactEmail',
      label: '联系人邮箱',
      componentProps: {
        placeholder: '请输入联系人邮箱',
      },
      rules: z.string().email('邮箱格式不正确').or(z.literal('')).optional(),
    },
    {
      component: 'Input',
      fieldName: 'contactPhone',
      label: '联系人电话',
      componentProps: {
        placeholder: '请输入联系人电话',
      },
    },
    {
      component: 'Select',
      fieldName: 'clientType',
      label: '客户端类型',
      componentProps: {
        allowClear: true,
        options: getDictOptions(DICT_TYPE.PLATFORM_CLIENT_TYPE, 'number'),
        placeholder: '请选择客户端类型',
      },
      rules: 'required',
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
        placeholder: '请输入每分钟频率限制',
        precision: 0,
      },
      rules: 'required',
    },
    {
      component: 'InputNumber',
      fieldName: 'rateLimitPerDay',
      label: '每日调用配额',
      componentProps: {
        min: 0,
        placeholder: '请输入每日调用配额',
        precision: 0,
      },
      rules: 'required',
    },
    {
      component: 'InputNumber',
      fieldName: 'usedCountToday',
      label: '今日已用次数',
      componentProps: {
        min: 0,
        placeholder: '请输入今日已用次数',
        precision: 0,
      },
      rules: 'required',
    },
    {
      component: 'InputNumber',
      fieldName: 'totalUsedCount',
      label: '累计调用次数',
      componentProps: {
        min: 0,
        placeholder: '请输入累计调用次数',
        precision: 0,
      },
      rules: 'required',
    },
    {
      component: 'InputNumber',
      fieldName: 'balance',
      label: '账户余额(分)',
      componentProps: {
        min: 0,
        placeholder: '请输入账户余额(分)',
        precision: 0,
      },
      rules: 'required',
    },
    {
      component: 'InputNumber',
      fieldName: 'totalCharged',
      label: '累计消费金额(分)',
      componentProps: {
        min: 0,
        placeholder: '请输入累计消费金额(分)',
        precision: 0,
      },
      rules: 'required',
    },
    {
      component: 'InputNumber',
      fieldName: 'lowBalanceAlert',
      label: '余额预警阈值(分)',
      componentProps: {
        min: 0,
        placeholder: '请输入余额不足预警阈值',
        precision: 0,
      },
      rules: 'required',
    },
    {
      component: 'Textarea',
      fieldName: 'allowedIps',
      label: '允许的 IP 白名单',
      componentProps: {
        placeholder: '请输入允许的 IP 白名单，多个请用逗号分隔',
        rows: 3,
      },
      formItemClass: 'col-span-2',
    },
    {
      component: 'Textarea',
      fieldName: 'webhookUrl',
      label: '回调地址',
      componentProps: {
        placeholder: '请输入回调地址（接收平台通知）',
        rows: 3,
      },
      formItemClass: 'col-span-2',
    },
    {
      component: 'DatePicker',
      fieldName: 'expiredTime',
      label: '过期时间',
      componentProps: {
        format: 'YYYY-MM-DD HH:mm:ss',
        placeholder: '选择过期时间（为空表示永久有效）',
        showTime: true,
        valueFormat: 'x',
      },
    },
    {
      component: 'DatePicker',
      fieldName: 'lastCallTime',
      label: '最后调用时间',
      componentProps: {
        format: 'YYYY-MM-DD HH:mm:ss',
        placeholder: '选择最后调用时间',
        showTime: true,
        valueFormat: 'x',
      },
    },
  ];
}

/** 列表的搜索表单 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'clientId',
      label: '客户端标识',
      componentProps: {
        allowClear: true,
        placeholder: '请输入客户端唯一标识',
      },
    },
    {
      component: 'Input',
      fieldName: 'clientName',
      label: '客户端名称',
      componentProps: {
        allowClear: true,
        placeholder: '请输入客户端名称',
      },
    },
    {
      component: 'Input',
      fieldName: 'clientCode',
      label: '客户端编码',
      componentProps: {
        allowClear: true,
        placeholder: '请输入客户端编码',
      },
    },
    {
      component: 'Input',
      fieldName: 'companyName',
      label: '公司名称',
      componentProps: {
        allowClear: true,
        placeholder: '请输入公司名称',
      },
    },
    {
      component: 'Input',
      fieldName: 'businessLicense',
      label: '营业执照号',
      componentProps: {
        allowClear: true,
        placeholder: '请输入营业执照号',
      },
    },
    {
      component: 'Input',
      fieldName: 'contactName',
      label: '联系人姓名',
      componentProps: {
        allowClear: true,
        placeholder: '请输入联系人姓名',
      },
    },
    {
      component: 'Input',
      fieldName: 'contactEmail',
      label: '联系人邮箱',
      componentProps: {
        allowClear: true,
        placeholder: '请输入联系人邮箱',
      },
    },
    {
      component: 'Input',
      fieldName: 'contactPhone',
      label: '联系人电话',
      componentProps: {
        allowClear: true,
        placeholder: '请输入联系人电话',
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
      field: 'clientLogo',
      title: 'Logo',
      minWidth: 90,
      slots: { default: 'clientLogo' },
    },
    {
      field: 'id',
      title: '客户端 ID',
      minWidth: 100,
    },
    {
      field: 'clientId',
      title: '客户端标识',
      minWidth: 180,
    },
    {
      field: 'clientName',
      title: '客户端名称',
      minWidth: 160,
    },
    {
      field: 'clientCode',
      title: '客户端编码',
      minWidth: 160,
    },
    {
      field: 'description',
      title: '客户端描述',
      minWidth: 220,
      showOverflow: 'tooltip',
    },
    {
      field: 'companyName',
      title: '公司名称',
      minWidth: 180,
    },
    {
      field: 'businessLicense',
      title: '营业执照号',
      minWidth: 180,
    },
    {
      field: 'contactName',
      title: '联系人',
      minWidth: 120,
    },
    {
      field: 'contactEmail',
      title: '联系人邮箱',
      minWidth: 180,
    },
    {
      field: 'contactPhone',
      title: '联系人电话',
      minWidth: 140,
    },
    {
      field: 'status',
      title: '状态',
      minWidth: 110,
      slots: { default: 'status' },
    },
    {
      field: 'clientType',
      title: '客户端类型',
      minWidth: 120,
      slots: { default: 'clientType' },
    },
    {
      field: 'rateLimitPerMin',
      title: '每分钟限流',
      minWidth: 130,
    },
    {
      field: 'rateLimitPerDay',
      title: '每日配额',
      minWidth: 120,
    },
    {
      field: 'usedCountToday',
      title: '今日已用',
      minWidth: 120,
    },
    {
      field: 'totalUsedCount',
      title: '累计调用',
      minWidth: 120,
    },
    {
      field: 'balance',
      title: '余额(分)',
      minWidth: 120,
    },
    {
      field: 'totalCharged',
      title: '累计消费(分)',
      minWidth: 130,
    },
    {
      field: 'lowBalanceAlert',
      title: '余额预警(分)',
      minWidth: 130,
    },
    {
      field: 'allowedIps',
      title: '允许的白名单',
      minWidth: 220,
      showOverflow: 'tooltip',
    },
    {
      field: 'webhookUrl',
      title: '回调地址',
      minWidth: 220,
      showOverflow: 'tooltip',
    },
    {
      field: 'expiredTime',
      title: '过期时间',
      minWidth: 180,
      formatter: 'formatDateTime',
    },
    {
      field: 'lastCallTime',
      title: '最后调用时间',
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
      width: 160,
      fixed: 'right',
      slots: { default: 'actions' },
    },
  ];
}
