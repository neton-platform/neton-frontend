<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ApiApi } from '#/api/platform/api';
import type { ClientApi as ClientOptionsApi } from '#/api/platform/client';
import type { ChargeRecordApi } from '#/api/platform/chargerecord';

import { onMounted, ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';
import { DICT_TYPE } from '@vben/constants';
import { downloadFileFromBlobPart } from '@vben/utils';

import { ACTION_ICON, TableAction, useVbenVxeGrid } from '#/adapter/vxe-table';
import { getApiSimpleList } from '#/api/platform/api';
import { getClientList } from '#/api/platform/client';
import { exportChargeRecord, getChargeRecordPage } from '#/api/platform/chargerecord';
import { DictTag } from '#/components/dict-tag';
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

function handleDetail(row: ChargeRecordApi.ChargeRecord) {
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

function parseAmount(value?: number | string | null) {
  if (value === undefined || value === null || value === '') {
    return 0;
  }
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
}

function getChangeDirection(row: ChargeRecordApi.ChargeRecord) {
  const before = parseAmount(row.balanceBefore);
  const after = parseAmount(row.balanceAfter);
  if (after > before) {
    return { color: 'green', text: '增加' };
  }
  if (after < before) {
    return { color: 'red', text: '扣减' };
  }
  return { color: 'default', text: '无变化' };
}

/** 导出表格 */
async function handleExport() {
  exportLoading.value = true;
  try {
    const values = await gridApi.formApi.getValues();
    const params = {
      ...values,
      createTime:
        values.createTime && Array.isArray(values.createTime)
          ? values.createTime.join(',')
          : values.createTime,
    };
    const data = await exportChargeRecord(params);
    downloadFileFromBlobPart({
      fileName: '平台计费记录.xls',
      source: data,
    });
  } finally {
    exportLoading.value = false;
  }
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
          return await getChargeRecordPage({
            pageNo: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
            createTime:
              formValues.createTime && Array.isArray(formValues.createTime)
                ? formValues.createTime.join(',')
                : formValues.createTime,
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
  } as VxeTableGridOptions<ChargeRecordApi.ChargeRecord>,
});

onMounted(() => {
  void loadNameMaps();
});
</script>

<template>
  <Page auto-content-height>
    <DetailModal />

    <Grid table-title="平台计费记录">
      <template #toolbar-tools>
        <TableAction
          :actions="[
            {
              label: $t('ui.actionTitle.export'),
              type: 'primary',
              icon: ACTION_ICON.DOWNLOAD,
              auth: ['platform:charge-record:export'],
              onClick: handleExport,
            },
          ]"
        />
      </template>

      <template #chargeType="{ row }">
        <DictTag
          :type="DICT_TYPE.PLATFORM_CHARGE_TYPE"
          :value="row.chargeType"
        />
      </template>

      <template #operateType="{ row }">
        <a-tag :color="getChangeDirection(row).color">
          {{ getChangeDirection(row).text }}
        </a-tag>
      </template>

      <template #isCustomPrice="{ row }">
        <DictTag :type="DICT_TYPE.PLATFORM_BOOL" :value="row.isCustomPrice" />
      </template>

      <template #chargeStatus="{ row }">
        <DictTag :type="DICT_TYPE.PLATFORM_BOOL" :value="row.chargeStatus" />
      </template>

      <template #remark="{ row }">
        <span class="whitespace-pre-wrap break-all">
          {{ row.remark || '-' }}
        </span>
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
              auth: ['platform:charge-record:query'],
              onClick: handleDetail.bind(null, row),
            },
          ]"
        />
      </template>
    </Grid>
  </Page>
</template>
