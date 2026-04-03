<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ApiApi } from '#/api/platform/api';

import { ref } from 'vue';

import { confirm, Page, useVbenModal } from '@vben/common-ui';
import { DICT_TYPE } from '@vben/constants';
import { downloadFileFromBlobPart, isEmpty } from '@vben/utils';

import { message } from 'ant-design-vue';

import { ACTION_ICON, TableAction, useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteApi,
  deleteApiList,
  exportApi,
  getApiPage,
} from '#/api/platform/api';
import { DictTag } from '#/components/dict-tag';
import { $t } from '#/locales';

import { useGridColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const exportLoading = ref(false);
const checkedIds = ref<number[]>([]);

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

/** 刷新表格 */
function handleRefresh() {
  gridApi.query();
}

/** 创建开放平台API定义 */
function handleCreate() {
  formModalApi.setData(null).open();
}

/** 编辑开放平台API定义 */
function handleEdit(row: ApiApi.Api) {
  formModalApi.setData(row).open();
}

/** 删除开放平台API定义 */
async function handleDelete(row: ApiApi.Api) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.id]),
    duration: 0,
  });
  try {
    await deleteApi(row.id);
    message.success($t('ui.actionMessage.deleteSuccess', [row.id]));
    handleRefresh();
  } finally {
    hideLoading();
  }
}

/** 批量删除开放平台API定义 */
async function handleDeleteBatch() {
  await confirm($t('ui.actionMessage.deleteBatchConfirm'));
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deletingBatch'),
    duration: 0,
  });
  try {
    await deleteApiList(checkedIds.value);
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
    const values = await gridApi.formApi.getValues();
    const params = {
      ...values,
      createTime:
        values.createTime && Array.isArray(values.createTime)
          ? values.createTime.join(',')
          : values.createTime,
    };
    const data = await exportApi(params);
    downloadFileFromBlobPart({ fileName: '开放平台API定义.xls', source: data });
  } finally {
    exportLoading.value = false;
  }
}

function handleRowCheckboxChange({ records }: { records: ApiApi.Api[] }) {
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
          return await getApiPage({
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
  } as VxeTableGridOptions<ApiApi.Api>,
  gridEvents: {
    checkboxAll: handleRowCheckboxChange,
    checkboxChange: handleRowCheckboxChange,
  },
});
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="handleRefresh" />

    <Grid table-title="开放平台API定义">
      <template #toolbar-tools>
        <TableAction
          :actions="[
            {
              label: $t('ui.actionTitle.create', ['开放平台API定义']),
              type: 'primary',
              icon: ACTION_ICON.ADD,
              auth: ['platform:api:create'],
              onClick: handleCreate,
            },
            {
              label: $t('ui.actionTitle.export'),
              type: 'primary',
              icon: ACTION_ICON.DOWNLOAD,
              auth: ['platform:api:export'],
              onClick: handleExport,
            },
            {
              label: $t('ui.actionTitle.deleteBatch'),
              type: 'primary',
              danger: true,
              icon: ACTION_ICON.DELETE,
              disabled: isEmpty(checkedIds),
              auth: ['platform:api:delete'],
              onClick: handleDeleteBatch,
            },
          ]"
        />
      </template>

      <template #httpMethod="{ row }">
        <DictTag
          :type="DICT_TYPE.PLATFORM_REQUEST_METHOD"
          :value="row.httpMethod"
        />
      </template>

      <template #status="{ row }">
        <DictTag
          :type="DICT_TYPE.PLATFORM_CLIENT_STATUS"
          :value="row.status"
        />
      </template>

      <template #chargeType="{ row }">
        <DictTag :type="DICT_TYPE.PLATFORM_CHARGE_TYPE" :value="row.chargeType" />
      </template>

      <template #actions="{ row }">
        <TableAction
          :actions="[
            {
              label: $t('common.edit'),
              type: 'link',
              icon: ACTION_ICON.EDIT,
              auth: ['platform:api:update'],
              onClick: handleEdit.bind(null, row),
            },
            {
              label: $t('common.delete'),
              type: 'link',
              danger: true,
              icon: ACTION_ICON.DELETE,
              auth: ['platform:api:delete'],
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
