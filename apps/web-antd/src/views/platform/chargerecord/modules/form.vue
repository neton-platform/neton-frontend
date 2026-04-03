<script lang="ts" setup>
import type { ChargeRecordApi } from '#/api/platform/chargerecord';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  createChargeRecord,
  getChargeRecord,
  updateChargeRecord,
} from '#/api/platform/chargerecord';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emit = defineEmits(['success']);
const formData = ref<ChargeRecordApi.ChargeRecord>();

const getTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', ['平台计费记录'])
    : $t('ui.actionTitle.create', ['平台计费记录']);
});

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
  schema: useFormSchema(),
  showDefaultActions: false,
});

async function resetForm() {
  formData.value = undefined;
  await formApi.resetForm();
}

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    modalApi.lock();
    const data = (await formApi.getValues()) as ChargeRecordApi.ChargeRecord;
    try {
      await (formData.value?.id
        ? updateChargeRecord(data)
        : createChargeRecord(data));
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
    let data = modalApi.getData<ChargeRecordApi.ChargeRecord>();
    if (!data) {
      return;
    }
    if (data.id) {
      modalApi.lock();
      try {
        data = await getChargeRecord(data.id);
      } finally {
        modalApi.unlock();
      }
    }
    formData.value = data;
    await formApi.setValues(data);
  },
});
</script>

<template>
  <Modal :title="getTitle" class="w-3/5">
    <Form class="mx-4" />
  </Modal>
</template>
