<script lang="ts" setup>
import type { ChargeRecordApi } from '#/api/platform/chargerecord';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { DICT_TYPE } from '@vben/constants';
import { formatDateTime } from '@vben/utils';

import { Descriptions } from 'ant-design-vue';

import { getChargeRecord } from '#/api/platform/chargerecord';
import { DictTag } from '#/components/dict-tag';

const detailData = ref<ChargeRecordApi.ChargeRecord>();

const getTitle = computed(() => `计费记录详情${detailData.value?.id ? ` #${detailData.value.id}` : ''}`);

function formatValue(value?: number | string | null) {
  if (value === undefined || value === null || value === '') {
    return '-';
  }
  return String(value);
}

function formatTime(value?: string) {
  return value ? formatDateTime(value) : '-';
}

const [Modal, modalApi] = useVbenModal({
  destroyOnClose: true,
  showConfirmButton: false,
  async onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      detailData.value = undefined;
      return;
    }

    const row = modalApi.getData<ChargeRecordApi.ChargeRecord>();
    if (!row?.id) {
      detailData.value = row;
      return;
    }

    modalApi.lock();
    try {
      detailData.value = await getChargeRecord(row.id);
    } finally {
      modalApi.unlock();
    }
  },
});
</script>

<template>
  <Modal :title="getTitle" class="w-3/5">
    <Descriptions bordered :column="2" size="small">
      <Descriptions.Item label="计费ID">
        {{ formatValue(detailData?.id) }}
      </Descriptions.Item>
      <Descriptions.Item label="客户端ID">
        {{ formatValue(detailData?.clientId) }}
      </Descriptions.Item>
      <Descriptions.Item label="API ID">
        {{ formatValue(detailData?.apiId) }}
      </Descriptions.Item>
      <Descriptions.Item label="请求跟踪ID">
        {{ formatValue(detailData?.traceId) }}
      </Descriptions.Item>
      <Descriptions.Item label="计费类型">
        <DictTag
          :type="DICT_TYPE.PLATFORM_CHARGE_TYPE"
          :value="detailData?.chargeType"
        />
      </Descriptions.Item>
      <Descriptions.Item label="本次计费金额（分）">
        {{ formatValue(detailData?.price) }}
      </Descriptions.Item>
      <Descriptions.Item label="是否使用自定义价格">
        <DictTag
          :type="DICT_TYPE.PLATFORM_BOOL"
          :value="detailData?.isCustomPrice"
        />
      </Descriptions.Item>
      <Descriptions.Item label="是否扣费成功">
        <DictTag
          :type="DICT_TYPE.PLATFORM_BOOL"
          :value="detailData?.chargeStatus"
        />
      </Descriptions.Item>
      <Descriptions.Item label="扣费前余额（分）">
        {{ formatValue(detailData?.balanceBefore) }}
      </Descriptions.Item>
      <Descriptions.Item label="扣费后余额（分）">
        {{ formatValue(detailData?.balanceAfter) }}
      </Descriptions.Item>
      <Descriptions.Item :span="2" label="失败原因">
        <div class="whitespace-pre-wrap break-all">
          {{ formatValue(detailData?.failureReason) }}
        </div>
      </Descriptions.Item>
      <Descriptions.Item label="扣费时间">
        {{ formatTime(detailData?.chargeTime as string) }}
      </Descriptions.Item>
      <Descriptions.Item label="创建时间">
        {{ formatTime(detailData?.createTime as string) }}
      </Descriptions.Item>
    </Descriptions>
  </Modal>
</template>
