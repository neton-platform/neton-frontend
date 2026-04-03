<script lang="ts" setup>
import type { StatApi } from '#/api/platform/stat';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { createStat, getStat, updateStat } from '#/api/platform/stat';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emit = defineEmits(['success']);
const formData = ref<StatApi.Stat>();

const getTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', ['开放平台统计'])
    : $t('ui.actionTitle.create', ['开放平台统计']);
});

const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
    formItemClass: 'col-span-1',
    labelWidth: 200,
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
    const data = (await formApi.getValues()) as StatApi.Stat;
    try {
      await (formData.value?.id ? updateStat(data) : createStat(data));
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
    let data = modalApi.getData<StatApi.Stat>();
    if (!data) {
      return;
    }
    if (data.id) {
      modalApi.lock();
      try {
        data = await getStat(data.id);
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
