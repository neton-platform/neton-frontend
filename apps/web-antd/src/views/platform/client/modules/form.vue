<script lang="ts" setup>
import type { Rule } from 'ant-design-vue/es/form';

import type { PageParam } from '@vben/request';

import type { MemberUserApi } from '#/api/member/user';
import type { ClientApi } from '#/api/platform/client';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { DICT_TYPE } from '@vben/constants';
import { getDictOptions } from '@vben/hooks';

import {
  Modal as AntModal,
  Button,
  DatePicker,
  Form,
  Input,
  message,
  Radio,
  RadioGroup,
  Select,
  Textarea,
} from 'ant-design-vue';

import { getUser, getUserPage } from '#/api/member/user';
import {
  createClient,
  generateAppId,
  getClient,
  updateClient,
} from '#/api/platform/client';
import { ImageUpload } from '#/components/upload';
import { $t } from '#/locales';

const emit = defineEmits(['success']);

const formRef = ref();
const isGeneratingClientId = ref(false);
const memberLoading = ref(false);
const memberOptions = ref<Array<{ label: string; value: number }>>([]);
const formData = ref<Partial<ClientApi.Client>>({
  id: undefined,
  memberUserId: undefined,
  clientId: undefined,
  clientSecret: undefined,
  clientName: undefined,
  clientCode: undefined,
  clientLogo: undefined,
  description: undefined,
  companyName: undefined,
  businessLicense: undefined,
  contactName: undefined,
  contactEmail: undefined,
  contactPhone: undefined,
  status: undefined,
  clientType: undefined,
  rateLimitPerMin: undefined,
  rateLimitPerDay: undefined,
  usedCountToday: undefined,
  totalUsedCount: undefined,
  balance: undefined,
  totalCharged: undefined,
  lowBalanceAlert: undefined,
  allowedIps: undefined,
  webhookUrl: undefined,
  expiredTime: undefined,
  lastCallTime: undefined,
});
const rules: Record<string, Rule[]> = {
  clientId: [
    {
      required: true,
      message: '客户端唯一标识（公开）不能为空',
      trigger: 'blur',
    },
  ],
  clientSecret: [
    {
      required: true,
      message: '客户端密钥（AES-256 加密存储）不能为空',
      trigger: 'blur',
    },
  ],
  clientName: [
    { required: true, message: '客户端名称不能为空', trigger: 'blur' },
  ],
  status: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
  clientType: [
    { required: true, message: '客户端类型不能为空', trigger: 'change' },
  ],
  rateLimitPerMin: [
    {
      required: true,
      message: '每分钟频率限制（次/分钟）不能为空',
      trigger: 'blur',
    },
  ],
  rateLimitPerDay: [
    { required: true, message: '每日调用配额不能为空', trigger: 'blur' },
  ],
  usedCountToday: [
    { required: true, message: '今日已用次数不能为空', trigger: 'blur' },
  ],
  totalUsedCount: [
    { required: true, message: '累计调用次数不能为空', trigger: 'blur' },
  ],
  balance: [
    { required: true, message: '账户余额（分）不能为空', trigger: 'blur' },
  ],
  totalCharged: [
    { required: true, message: '累计消费金额（分）不能为空', trigger: 'blur' },
  ],
  lowBalanceAlert: [
    {
      required: true,
      message: '余额不足预警阈值（分，默认100元）不能为空',
      trigger: 'blur',
    },
  ],
};
const getTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', ['开放平台客户端'])
    : $t('ui.actionTitle.create', ['开放平台客户端']);
});

/** 重置表单 */
function resetForm() {
  formData.value = {
    id: undefined,
    memberUserId: undefined,
    clientId: undefined,
    clientSecret: undefined,
    clientName: undefined,
    clientCode: undefined,
    clientLogo: undefined,
    description: undefined,
    companyName: undefined,
    businessLicense: undefined,
    contactName: undefined,
    contactEmail: undefined,
    contactPhone: undefined,
    status: undefined,
    clientType: undefined,
    rateLimitPerMin: undefined,
    rateLimitPerDay: undefined,
    usedCountToday: undefined,
    totalUsedCount: undefined,
    balance: undefined,
    totalCharged: undefined,
    lowBalanceAlert: undefined,
    allowedIps: undefined,
    webhookUrl: undefined,
    expiredTime: undefined,
    lastCallTime: undefined,
  };
  memberOptions.value = [];
  formRef.value?.resetFields();
}

function buildMemberOption(user: MemberUserApi.User) {
  const displayName = user.nickname || user.name || `会员#${user.id}`;
  const mobileSuffix = user.mobile ? `（${user.mobile}）` : '';
  return {
    label: `${displayName}${mobileSuffix}`,
    value: user.id!,
  };
}

function mergeMemberOptions(users: MemberUserApi.User[]) {
  const optionMap = new Map(
    memberOptions.value.map((item) => [item.value, item]),
  );
  for (const user of users) {
    if (!user.id) {
      continue;
    }
    optionMap.set(user.id, buildMemberOption(user));
  }
  memberOptions.value = [...optionMap.values()];
}

async function loadMemberOptions(keyword = '') {
  memberLoading.value = true;
  try {
    const searchValue = keyword.trim();
    const params: PageParam & { mobile?: string; nickname?: string } = {
      pageNo: 1,
      pageSize: 20,
    };
    if (searchValue) {
      params.nickname = searchValue;
      if (/^\d+$/.test(searchValue)) {
        params.mobile = searchValue;
      }
    }
    const data = await getUserPage(params);
    mergeMemberOptions(data.list || []);
  } finally {
    memberLoading.value = false;
  }
}

async function ensureSelectedMemberOption(memberUserId?: number) {
  if (!memberUserId) {
    return;
  }
  const exists = memberOptions.value.some(
    (item) => item.value === memberUserId,
  );
  if (exists) {
    return;
  }
  const user = await getUser(memberUserId);
  mergeMemberOptions([user]);
}

async function handleMemberSearch(value: string) {
  await loadMemberOptions(value);
}

async function handleMemberDropdownVisibleChange(open: boolean) {
  if (!open || memberOptions.value.length > 0) {
    return;
  }
  await loadMemberOptions();
}

async function generateClientId() {
  if (isGeneratingClientId.value) {
    return;
  }
  isGeneratingClientId.value = true;
  try {
    const clientId = await generateAppId();
    formData.value.clientId = clientId;
  } finally {
    isGeneratingClientId.value = false;
  }
}

function handleRegenerateClientId() {
  AntModal.confirm({
    title: '重新生成客户端唯一标识',
    content: '重新生成将覆盖当前客户端唯一标识，是否继续？',
    okText: '确认',
    cancelText: '取消',
    async onOk() {
      await generateClientId();
      message.success('客户端唯一标识已重新生成');
    },
  });
}

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    await formRef.value?.validate();
    modalApi.lock();
    // 提交表单
    const data = formData.value as ClientApi.Client;
    try {
      await (formData.value?.id ? updateClient(data) : createClient(data));
      // 关闭并提示
      await modalApi.close();
      emit('success');
      message.success({
        content: $t('ui.actionMessage.operationSuccess'),
      });
    } finally {
      modalApi.unlock();
    }
  },
  async onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      resetForm();
      return;
    }
    // 加载数据
    let data = modalApi.getData<ClientApi.Client>();
    if (!data || !data.id) {
      resetForm();
      if (data) {
        formData.value = data;
        await ensureSelectedMemberOption(data.memberUserId);
      }
      await generateClientId();
      return;
    }
    modalApi.lock();
    try {
      data = await getClient(data.id);
    } finally {
      modalApi.unlock();
    }
    formData.value = data;
    await ensureSelectedMemberOption(data.memberUserId);
  },
});
</script>

<template>
  <Modal :title="getTitle" class="w-3/5">
    <Form
      ref="formRef"
      :model="formData"
      :rules="rules"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
    >
      <Form.Item label="客户端唯一标识" name="clientId">
        <div class="flex gap-2">
          <Input
            :disabled="true"
            v-model:value="formData.clientId"
            class="flex-1"
            placeholder="请输入客户端唯一标识"
          />
          <Button
            v-if="formData.id"
            :loading="isGeneratingClientId"
            @click="handleRegenerateClientId"
          >
            重新生成
          </Button>
        </div>
      </Form.Item>
      <Form.Item label="客户端密钥" name="clientSecret">
        <Input
          v-model:value="formData.clientSecret"
          placeholder="请输入客户端密钥（AES-256 加密存储）"
        />
      </Form.Item>
      <Form.Item label="客户端名称" name="clientName">
        <Input
          v-model:value="formData.clientName"
          placeholder="请输入客户端名称"
        />
      </Form.Item>
      <Form.Item label="关联会员" name="memberUserId">
        <Select
          v-model:value="formData.memberUserId"
          :options="memberOptions"
          :loading="memberLoading"
          :filter-option="false"
          allow-clear
          show-search
          placeholder="请选择会员，可搜索昵称/手机号"
          @search="handleMemberSearch"
          @dropdown-visible-change="handleMemberDropdownVisibleChange"
        />
      </Form.Item>
      <Form.Item label="客户端类型" name="clientType">
        <Select
          v-model:value="formData.clientType"
          placeholder="请选择客户端类型"
        >
          <Select.Option
            v-for="dict in getDictOptions(
              DICT_TYPE.PLATFORM_CLIENT_TYPE,
              'number',
            )"
            :key="String(dict.value)"
            :value="dict.value as number"
          >
            {{ dict.label }}
          </Select.Option>
        </Select>
      </Form.Item>
      <Form.Item label="每分钟频率限制" name="rateLimitPerMin">
        <Input
          suffix="次/分钟"
          v-model:value="formData.rateLimitPerMin"
          placeholder="请输入每分钟频率限制"
        />
      </Form.Item>
      <Form.Item label="每日调用配额" name="rateLimitPerDay">
        <Input
          v-model:value="formData.rateLimitPerDay"
          placeholder="请输入每日调用配额"
        />
      </Form.Item>
      <Form.Item label="今日已用次数" name="usedCountToday">
        <Input
          v-model:value="formData.usedCountToday"
          placeholder="请输入今日已用次数"
        />
      </Form.Item>
      <Form.Item label="累计调用次数" name="totalUsedCount">
        <Input
          v-model:value="formData.totalUsedCount"
          placeholder="请输入累计调用次数"
        />
      </Form.Item>
      <Form.Item label="账户余额（分）" name="balance">
        <Input
          v-model:value="formData.balance"
          suffix="分"
          placeholder="请输入账户余额（分）"
        />
      </Form.Item>
      <Form.Item label="累计消费金额（分）" name="totalCharged">
        <Input
          v-model:value="formData.totalCharged"
          suffix="分"
          placeholder="请输入累计消费金额（分）"
        />
      </Form.Item>
      <Form.Item label="余额不足预警阈值" name="lowBalanceAlert">
        <Input
          suffix="分"
          v-model:value="formData.lowBalanceAlert"
          placeholder="请输入余额不足预警阈值  "
        />
      </Form.Item>
      <Form.Item label="状态" name="status">
        <RadioGroup v-model:value="formData.status">
          <Radio
            v-for="dict in getDictOptions(
              DICT_TYPE.PLATFORM_CLIENT_STATUS,
              'number',
            )"
            :key="String(dict.value)"
            :value="dict.value as number"
          >
            {{ dict.label }}
          </Radio>
        </RadioGroup>
      </Form.Item>

      <Form.Item label="客户端编码（英文标识）" name="clientCode">
        <Input
          v-model:value="formData.clientCode"
          placeholder="请输入客户端编码（英文标识）"
        />
      </Form.Item>
      <Form.Item label="客户端Logo" name="clientLogo">
        <ImageUpload v-model:value="formData.clientLogo" />
      </Form.Item>
      <Form.Item label="客户端描述" name="description">
        <Textarea v-model="formData.description" height="500px" />
      </Form.Item>
      <Form.Item label="公司名称" name="companyName">
        <Input
          v-model:value="formData.companyName"
          placeholder="请输入公司名称"
        />
      </Form.Item>
      <Form.Item label="营业执照号" name="businessLicense">
        <Input
          v-model:value="formData.businessLicense"
          placeholder="请输入营业执照号"
        />
      </Form.Item>
      <Form.Item label="联系人姓名" name="contactName">
        <Input
          v-model:value="formData.contactName"
          placeholder="请输入联系人姓名"
        />
      </Form.Item>
      <Form.Item label="联系人邮箱" name="contactEmail">
        <Input
          v-model:value="formData.contactEmail"
          placeholder="请输入联系人邮箱"
        />
      </Form.Item>
      <Form.Item label="联系人电话" name="contactPhone">
        <Input
          v-model:value="formData.contactPhone"
          placeholder="请输入联系人电话"
        />
      </Form.Item>

      <Form.Item label="允许的IP白名单" name="allowedIps">
        <Input
          v-model:value="formData.allowedIps"
          placeholder="请输入允许的IP白名单"
        />
      </Form.Item>
      <Form.Item label="回调地址（接收平台通知）" name="webhookUrl">
        <Input
          v-model:value="formData.webhookUrl"
          placeholder="请输入回调地址（接收平台通知）"
        />
      </Form.Item>
      <Form.Item label="过期时间（为空表示永久有效）" name="expiredTime">
        <DatePicker
          v-model:value="formData.expiredTime"
          value-format="x"
          placeholder="选择过期时间（为空表示永久有效）"
        />
      </Form.Item>
      <Form.Item label="最后调用时间" name="lastCallTime">
        <DatePicker
          v-model:value="formData.lastCallTime"
          value-format="x"
          placeholder="选择最后调用时间"
        />
      </Form.Item>
    </Form>
  </Modal>
</template>
