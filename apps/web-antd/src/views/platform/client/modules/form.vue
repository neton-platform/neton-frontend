<script lang="ts" setup>
import type { PageParam } from '@vben/request';

import type { MemberUserApi } from '#/api/member/user';
import type { ClientApi } from '#/api/platform/client';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { fenToYuan, yuanToFen } from '@vben/utils';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { getUser, getUserPage } from '#/api/member/user';
import {
  createClient,
  generateAppId,
  generateAppSecret,
  getClient,
  updateClient,
} from '#/api/platform/client';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emit = defineEmits(['success']);

const formData = ref<ClientApi.Client>();
const isGeneratingClientId = ref(false);
const isGeneratingClientSecret = ref(false);
const memberLoading = ref(false);
const memberOptions = ref<Array<{ label: string; value: number }>>([]);

const getTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', ['开放平台客户端'])
    : $t('ui.actionTitle.create', ['开放平台客户端']);
});

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

const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
    formItemClass: 'col-span-1',
    labelWidth: 140,
  },
  wrapperClass: 'grid-cols-2',
  layout: 'horizontal',
  schema: useFormSchema({
    memberLoading,
    memberOptions,
    onMemberDropdownVisibleChange: handleMemberDropdownVisibleChange,
    onMemberSearch: handleMemberSearch,
  }),
  showDefaultActions: false,
});

async function resetForm() {
  formData.value = undefined;
  memberOptions.value = [];
  await formApi.resetForm();
}

function formatFormData(data: ClientApi.Client) {
  return {
    ...data,
    lowBalanceAlert:
      data.lowBalanceAlert === undefined || data.lowBalanceAlert === null
        ? data.lowBalanceAlert
        : Number(fenToYuan(data.lowBalanceAlert)),
  };
}

function buildSubmitData(data: ClientApi.Client) {
  return {
    ...data,
    lowBalanceAlert:
      data.lowBalanceAlert === undefined || data.lowBalanceAlert === null
        ? data.lowBalanceAlert
        : yuanToFen(data.lowBalanceAlert),
  };
}

async function generateClientId() {
  if (isGeneratingClientId.value) {
    return;
  }
  isGeneratingClientId.value = true;
  try {
    const clientId = await generateAppId();
    await formApi.setFieldValue('clientId', clientId);
  } finally {
    isGeneratingClientId.value = false;
  }
}

async function generateClientSecret() {
  if (isGeneratingClientSecret.value) {
    return;
  }
  isGeneratingClientSecret.value = true;
  try {
    const clientSecret = await generateAppSecret();
    await formApi.setFieldValue('clientSecret', clientSecret);
  } finally {
    isGeneratingClientSecret.value = false;
  }
}

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    modalApi.lock();
    const data = buildSubmitData((await formApi.getValues()) as ClientApi.Client);
    try {
      await (formData.value?.id ? updateClient(data) : createClient(data));
      await modalApi.close();
      emit('success');
      message.success($t('ui.actionMessage.operationSuccess'));
    } finally {
      modalApi.unlock();
    }
  },
  async onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      await resetForm();
      return;
    }

    await resetForm();
    let data = modalApi.getData<ClientApi.Client>();
    if (!data || !data.id) {
      if (data) {
        await ensureSelectedMemberOption(data.memberUserId);
        await formApi.setValues(formatFormData(data));
      }
      await Promise.all([generateClientId(), generateClientSecret()]);
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
    await formApi.setValues(formatFormData(data));
  },
});
</script>

<template>
  <Modal :title="getTitle" class="w-3/5">
    <Form class="mx-4" />
  </Modal>
</template>
