<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ApiApi } from '#/api/platform/api';
import type { ClientApi as ClientOptionsApi } from '#/api/platform/client';
import type { ClientApiApi } from '#/api/platform/clientapi';

import { onMounted, ref } from 'vue';

import { confirm, Page, useVbenModal } from '@vben/common-ui';
import { DICT_TYPE } from '@vben/constants';
import { downloadFileFromBlobPart, isEmpty } from '@vben/utils';

import { message } from 'ant-design-vue';

import { ACTION_ICON, TableAction, useVbenVxeGrid } from '#/adapter/vxe-table';
import { getApiSimpleList } from '#/api/platform/api';
import { getClientList } from '#/api/platform/client';
import {
  deleteClientApi,
  deleteClientApiList,
  exportClientApi,
  getClientApiPage,
} from '#/api/platform/clientapi';
import { DictTag } from '#/components/dict-tag';
import { $t } from '#/locales';

import { useGridColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const exportLoading = ref(false);
const checkedIds = ref<number[]>([]);
const clientOptions = ref<Array<{ label: string; value: string }>>([]);
const apiOptions = ref<Array<{ label: string; value: number }>>([]);
const clientNameMap = ref<Record<string, string>>({});
const apiNameMap = ref<Record<string, string>>({});

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
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

async function loadSearchOptions() {
  try {
    const [clients, apis] = await Promise.all([
      getClientList(),
      getApiSimpleList(),
    ]);

    clientOptions.value = clients.map((item) => ({
      label: buildClientOptionLabel(item),
      value: item.clientId,
    }));

    clientNameMap.value = clients.reduce<Record<string, string>>((acc, item) => {
      acc[String(item.clientId)] = item.clientName || item.clientId;
      return acc;
    }, {});

    apiOptions.value = apis.map((item) => ({
      label: buildApiOptionLabel(item),
      value: item.id,
    }));

    apiNameMap.value = apis.reduce<Record<string, string>>((acc, item) => {
      acc[String(item.id)] = item.apiName || item.apiCode || String(item.id);
      return acc;
    }, {});
  } catch (error) {
    console.error('加载客户端/API 下拉选项失败', error);
    message.error('加载客户端/API 下拉选项失败');
  }
}

function getClientDisplayName(clientId?: number | string) {
  if (clientId === undefined || clientId === null || clientId === '') {
    return '-';
  }
  return clientNameMap.value[String(clientId)] || String(clientId);
}

function getApiDisplayName(apiId?: number | string) {
  if (apiId === undefined || apiId === null || apiId === '') {
    return '-';
  }
  return apiNameMap.value[String(apiId)] || String(apiId);
}

/** 刷新表格 */
function handleRefresh() {
  gridApi.query();
}

/** 创建客户端-API授权关系表（含自定义定价） */
function handleCreate() {
  formModalApi.setData(null).open();
}

/** 编辑客户端-API授权关系表（含自定义定价） */
function handleEdit(row: ClientApiApi.ClientApi) {
  formModalApi.setData(row).open();
}

/** 删除客户端-API授权关系表（含自定义定价） */
async function handleDelete(row: ClientApiApi.ClientApi) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.id]),
    duration: 0,
  });
  try {
    await deleteClientApi(row.id!);
    message.success($t('ui.actionMessage.deleteSuccess', [row.id]));
    handleRefresh();
  } finally {
    hideLoading();
  }
}

/** 批量删除客户端-API授权关系表（含自定义定价） */
async function handleDeleteBatch() {
  await confirm($t('ui.actionMessage.deleteBatchConfirm'));
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deletingBatch'),
    duration: 0,
  });
  try {
    await deleteClientApiList(checkedIds.value);
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
    const data = await exportClientApi(await gridApi.formApi.getValues());
    downloadFileFromBlobPart({
      fileName: '用户API授权.xls',
      source: data,
    });
  } finally {
    exportLoading.value = false;
  }
}

function handleRowCheckboxChange({
  records,
}: {
  records: ClientApiApi.ClientApi[];
}) {
  checkedIds.value = records.map((item) => item.id!).filter(Boolean);
}

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(clientOptions, apiOptions),
  },
  gridOptions: {
    columns: useGridColumns(),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getClientApiPage({
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
  } as VxeTableGridOptions<ClientApiApi.ClientApi>,
  gridEvents: {
    checkboxAll: handleRowCheckboxChange,
    checkboxChange: handleRowCheckboxChange,
  },
});

onMounted(() => {
  void loadSearchOptions();
});
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="handleRefresh" />

    <Grid table-title="用户-API授权">
      <template #toolbar-tools>
        <TableAction
          :actions="[
            {
              label: $t('ui.actionTitle.create', ['用户-API授权']),
              type: 'primary',
              icon: ACTION_ICON.ADD,
              auth: ['platform:client-api:create'],
              onClick: handleCreate,
            },
            {
              label: $t('ui.actionTitle.export'),
              type: 'primary',
              icon: ACTION_ICON.DOWNLOAD,
              auth: ['platform:client-api:export'],
              onClick: handleExport,
            },
            {
              label: $t('ui.actionTitle.deleteBatch'),
              type: 'primary',
              danger: true,
              icon: ACTION_ICON.DELETE,
              disabled: isEmpty(checkedIds),
              auth: ['platform:client-api:delete'],
              onClick: handleDeleteBatch,
            },
          ]"
        />
      </template>

      <template #status="{ row }">
        <DictTag :type="DICT_TYPE.PLATFORM_BOOL" :value="row.status" />
      </template>

      <template #isCustomPrice="{ row }">
        <DictTag :type="DICT_TYPE.PLATFORM_BOOL" :value="row.isCustomPrice" />
      </template>

      <template #clientName="{ row }">
        {{ getClientDisplayName(row.clientId) }}
      </template>

      <template #apiName="{ row }">
        {{ getApiDisplayName(row.apiId) }}
      </template>

      <template #actions="{ row }">
        <TableAction
          :actions="[
            {
              label: $t('common.edit'),
              type: 'link',
              icon: ACTION_ICON.EDIT,
              auth: ['platform:client-api:update'],
              onClick: handleEdit.bind(null, row),
            },
            {
              label: $t('common.delete'),
              type: 'link',
              danger: true,
              icon: ACTION_ICON.DELETE,
              auth: ['platform:client-api:delete'],
              popConfirm: {
                title: $t('ui.actionMessage.deleteConfirm', [row.id]),
                confirm: handleDelete.bind(null, row),
              },
            },
          ]"
        />
      </template>
    </Grid>
  </Page>
</template>
