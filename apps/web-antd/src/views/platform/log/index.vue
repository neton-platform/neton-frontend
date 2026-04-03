<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ApiApi } from '#/api/platform/api';
import type { ClientApi as ClientOptionsApi } from '#/api/platform/client';
import type { LogApi } from '#/api/platform/log';

import { onMounted, ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';
import { downloadFileFromBlobPart } from '@vben/utils';

import { ACTION_ICON, TableAction, useVbenVxeGrid } from '#/adapter/vxe-table';
import { getApiSimpleList } from '#/api/platform/api';
import { getClientList } from '#/api/platform/client';
import { exportLog, getLogPage } from '#/api/platform/log';
import { $t } from '#/locales';

import { useGridColumns, useGridFormSchema } from './data';
import Detail from './modules/detail.vue';

const exportLoading = ref(false);
const clientNameMap = ref<Record<string, string>>({});
const apiNameMap = ref<Record<string, string>>({});
const clientOptions = ref<Array<{ label: string; value: string }>>([]);
const apiOptions = ref<Array<{ label: string; value: number }>>([]);

const [DetailModal, detailModalApi] = useVbenModal({
  connectedComponent: Detail,
  destroyOnClose: true,
});

async function handleExport() {
  exportLoading.value = true;
  try {
    const data = await exportLog(await gridApi.formApi.getValues());
    downloadFileFromBlobPart({
      fileName: '平台调用日志.xls',
      source: data,
    });
  } finally {
    exportLoading.value = false;
  }
}

function handleDetail(row: LogApi.Log) {
  detailModalApi.setData(row).open();
}

function buildClientDisplayName(client: ClientOptionsApi.ClientListItem) {
  return client.clientName || client.clientId;
}

function buildApiDisplayName(api: ApiApi.ApiListItem) {
  return api.apiName || api.apiCode || String(api.id);
}

async function loadNameMaps() {
  const [clients, apis] = await Promise.all([
    getClientList(),
    getApiSimpleList(),
  ]);

  clientOptions.value = clients.map((item) => ({
    label: buildClientDisplayName(item),
    value: item.clientId,
  }));

  apiOptions.value = apis.map((item) => ({
    label: buildApiDisplayName(item),
    value: item.id,
  }));

  clientNameMap.value = clients.reduce<Record<string, string>>((acc, item) => {
    acc[String(item.clientId)] = buildClientDisplayName(item);
    return acc;
  }, {});

  apiNameMap.value = apis.reduce<Record<string, string>>((acc, item) => {
    acc[String(item.id)] = buildApiDisplayName(item);
    return acc;
  }, {});
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
          return await getLogPage({
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
  } as VxeTableGridOptions<LogApi.Log>,
});

onMounted(() => {
  void loadNameMaps();
});
</script>

<template>
  <Page auto-content-height>
    <DetailModal />

    <Grid table-title="平台调用日志">
      <template #toolbar-tools>
        <TableAction
          :actions="[
            {
              label: $t('ui.actionTitle.export'),
              type: 'primary',
              icon: ACTION_ICON.DOWNLOAD,
              auth: ['platform:log:export'],
              onClick: handleExport,
            },
          ]"
        />
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
              label: '详情',
              type: 'link',
              icon: ACTION_ICON.VIEW,
              auth: ['platform:log:query'],
              onClick: handleDetail.bind(null, row),
            },
          ]"
        />
      </template>
    </Grid>
  </Page>
</template>
