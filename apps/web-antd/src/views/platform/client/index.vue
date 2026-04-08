<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ClientApi } from '#/api/platform/client';

import { ref } from 'vue';

import { confirm, Page, useVbenModal } from '@vben/common-ui';
import { DICT_TYPE } from '@vben/constants';
import { downloadFileFromBlobPart, isEmpty } from '@vben/utils';

import { message } from 'ant-design-vue';

import { ACTION_ICON, TableAction, useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteClient,
  deleteClientList,
  exportClient,
  getClientPage,
} from '#/api/platform/client';
import { DictTag } from '#/components/dict-tag';
import { $t } from '#/locales';

import { useGridColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';
import RechargeModal from './modules/recharge-modal.vue';

type RechargeModalExpose = {
  open: (data?: ClientApi.Client) => Promise<void> | void;
};

const exportLoading = ref(false);
const checkedIds = ref<number[]>([]);

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

const rechargeModalRef = ref<RechargeModalExpose>();

/** 刷新表格 */
function handleRefresh() {
  gridApi.query();
}

/** 创建开放平台客户端 */
function handleCreate() {
  formModalApi.setData(null).open();
}

/** 编辑开放平台客户端 */
function handleEdit(row: ClientApi.Client) {
  formModalApi.setData(row).open();
}

function openRechargeModal(row: ClientApi.Client) {
  rechargeModalRef.value?.open(row);
}

/** 删除开放平台客户端 */
async function handleDelete(row: ClientApi.Client) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.clientName || row.id]),
    duration: 0,
  });
  try {
    await deleteClient(row.id);
    message.success(
      $t('ui.actionMessage.deleteSuccess', [row.clientName || row.id]),
    );
    handleRefresh();
  } finally {
    hideLoading();
  }
}

/** 批量删除开放平台客户端 */
async function handleDeleteBatch() {
  await confirm($t('ui.actionMessage.deleteBatchConfirm'));
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deletingBatch'),
    duration: 0,
  });
  try {
    await deleteClientList(checkedIds.value);
    checkedIds.value = [];
    message.success($t('ui.actionMessage.deleteSuccess'));
    handleRefresh();
  } finally {
    hideLoading();
  }
}

/** 导出表格 */
async function handleExport() {
  exportLoading.value = true;
  try {
    const data = await exportClient(await gridApi.formApi.getValues());
    downloadFileFromBlobPart({ fileName: '开放平台客户端.xls', source: data });
  } finally {
    exportLoading.value = false;
  }
}

function handleRowCheckboxChange({ records }: { records: ClientApi.Client[] }) {
  checkedIds.value = records.map((item) => item.id);
}

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
  },
  gridOptions: {
    columns: useGridColumns(),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getClientPage({
            pageNo: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'id',
      isHover: true,
    },
    toolbarConfig: {
      refresh: true,
      search: true,
    },
  } as VxeTableGridOptions<ClientApi.Client>,
  gridEvents: {
    checkboxAll: handleRowCheckboxChange,
    checkboxChange: handleRowCheckboxChange,
  },
});
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="handleRefresh" />
    <RechargeModal ref="rechargeModalRef" @success="handleRefresh" />

    <Grid table-title="开放平台客户端列表">
      <template #toolbar-tools>
        <TableAction
          :actions="[
            {
              label: $t('ui.actionTitle.create', ['客户端']),
              type: 'primary',
              icon: ACTION_ICON.ADD,
              auth: ['platform:client:create'],
              onClick: handleCreate,
            },
            {
              label: $t('ui.actionTitle.export'),
              type: 'primary',
              icon: ACTION_ICON.DOWNLOAD,
              auth: ['platform:client:export'],
              onClick: handleExport,
            },
            {
              label: $t('ui.actionTitle.deleteBatch'),
              type: 'primary',
              danger: true,
              icon: ACTION_ICON.DELETE,
              disabled: isEmpty(checkedIds),
              auth: ['platform:client:delete'],
              onClick: handleDeleteBatch,
            },
          ]"
        />
      </template>

      <template #clientLogo="{ row }">
        <div class="flex justify-center">
          <img
            v-if="row.clientLogo"
            :src="row.clientLogo"
            alt="logo"
            class="h-10 w-10 rounded object-cover"
          />
          <span v-else>-</span>
        </div>
      </template>

      <template #status="{ row }">
        <DictTag :type="DICT_TYPE.PLATFORM_CLIENT_STATUS" :value="row.status" />
      </template>

      <template #clientType="{ row }">
        <DictTag
          :type="DICT_TYPE.PLATFORM_CLIENT_TYPE"
          :value="row.clientType"
        />
      </template>

      <template #actions="{ row }">
        <TableAction
          :actions="[
            {
              label: $t('common.edit'),
              type: 'link',
              icon: ACTION_ICON.EDIT,
              auth: ['platform:client:update'],
              onClick: handleEdit.bind(null, row),
            },
            {
              label: '余额调账',
              type: 'link',
              icon: ACTION_ICON.ADD,
              onClick: openRechargeModal.bind(null, row),
            },
            {
              label: $t('common.delete'),
              type: 'link',
              danger: true,
              icon: ACTION_ICON.DELETE,
              auth: ['platform:client:delete'],
              popConfirm: {
                title: $t('ui.actionMessage.deleteConfirm', [
                  row.clientName || row.id,
                ]),
                confirm: handleDelete.bind(null, row),
              },
            },
          ]"
        />
      </template>
    </Grid>
  </Page>
</template>
