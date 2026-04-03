<script lang="ts" setup>
import type { ApiApi } from '#/api/platform/api';
import type { ClientApi as ClientOptionsApi } from '#/api/platform/client';
import type { ClientApiApi } from '#/api/platform/clientapi';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { getApiList } from '#/api/platform/api';
import { getClientList } from '#/api/platform/client';
import {
  createClientApi,
  getClientApi,
  updateClientApi,
} from '#/api/platform/clientapi';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emit = defineEmits(['success']);
const formData = ref<Partial<ClientApiApi.ClientApi>>();
const clientOptions = ref<Array<{ label: string; value: number | string }>>([]);
const apiOptions = ref<
  Array<{ disabled?: boolean; label: string; value: number | string }>
>([]);
const apiDisabled = ref(true);
const syncingForm = ref(false);

const getTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', ['用户-API授权'])
    : $t('ui.actionTitle.create', ['用户-API授权']);
});

function buildClientOptionLabel(client: ClientOptionsApi.ClientListItem) {
  if (client.clientName) {
    return `${client.clientName} (${client.clientId})`;
  }
  return client.clientId;
}

function buildApiOptionLabel(api: ApiApi.ApiListItem) {
  if (api.apiName && api.apiCode) {
    return `${api.apiName} (${api.apiCode})`;
  }
  return api.apiName || api.apiCode || String(api.id);
}

async function loadClientOptions() {
  const clients = await getClientList();
  clientOptions.value = clients.map((item) => ({
    label: buildClientOptionLabel(item),
    value: item.clientId,
  }));
}

async function loadApiOptionsByClientId(
  clientId?: number | string,
  currentApiId?: number | string,
) {
  if (!clientId) {
    apiOptions.value = [];
    apiDisabled.value = true;
    return;
  }
  const apis = await getApiList({ clientId });
  apiOptions.value = apis.map((item) => ({
    disabled: Boolean(item.selected) && String(item.id) !== String(currentApiId),
    label: buildApiOptionLabel(item),
    value: item.id,
  }));
  apiDisabled.value = false;
}

async function handleClientChange(clientId?: number | string) {
  const currentApiId = syncingForm.value ? formData.value?.apiId : undefined;
  await loadApiOptionsByClientId(clientId, currentApiId);
  if (!syncingForm.value) {
    await formApi.setValues({ apiId: undefined });
  }
}

const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
    formItemClass: 'col-span-1',
    labelWidth: 180,
  },
  wrapperClass: 'grid-cols-2',
  layout: 'horizontal',
  schema: useFormSchema(
    clientOptions,
    apiOptions,
    apiDisabled,
    (value) => void handleClientChange(value),
  ),
  showDefaultActions: false,
});

async function resetForm() {
  formData.value = undefined;
  apiOptions.value = [];
  apiDisabled.value = true;
  await formApi.resetForm();
}

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    modalApi.lock();
    const data = (await formApi.getValues()) as ClientApiApi.ClientApi;
    try {
      await (formData.value?.id ? updateClientApi(data) : createClientApi(data));
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
    await loadClientOptions();
    let data = modalApi.getData<ClientApiApi.ClientApi>();
    if (!data) {
      return;
    }
    if (data.id) {
      modalApi.lock();
      try {
        data = await getClientApi(data.id);
      } finally {
        modalApi.unlock();
      }
    }
    formData.value = data;
    syncingForm.value = true;
    try {
      await loadApiOptionsByClientId(data.clientId, data.apiId);
      await formApi.setValues(data);
    } finally {
      syncingForm.value = false;
    }
  },
});
</script>

<template>
  <Modal :title="getTitle" class="w-3/5">
    <Form class="mx-4" />
  </Modal>
</template>
