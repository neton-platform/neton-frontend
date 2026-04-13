<script lang="ts" setup>
import type { ChargeRecordApi } from '#/api/platform/chargerecord';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { DICT_TYPE } from '@vben/constants';
import { fenToYuan, formatDateTime } from '@vben/utils';

import { Descriptions, Tag } from 'ant-design-vue';

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

function formatAmountInYuan(value?: number | string | null) {
  if (value === undefined || value === null || value === '') {
    return '-';
  }
  return `${fenToYuan(value)} 元`;
}

function formatTime(value?: string) {
  return value ? formatDateTime(value) : '-';
}

function parseAmount(value?: number | string | null) {
  if (value === undefined || value === null || value === '') {
    return 0;
  }
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
}

function getChangeDirection() {
  const before = parseAmount(detailData.value?.balanceBefore as any);
  const after = parseAmount(detailData.value?.balanceAfter as any);
  if (after > before) {
    return { color: 'green', text: '充值' };
  }
  if (after < before) {
    return { color: 'red', text: '扣减' };
  }
  return { color: 'default', text: detailData.value?.operateType ? '无变化' : '-' };
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
      <Descriptions.Item label="本次计费金额（元）">
        {{ formatAmountInYuan(detailData?.price) }}
      </Descriptions.Item>
      <Descriptions.Item label="操作类型">
        <Tag :color="getChangeDirection().color">
          {{ getChangeDirection().text }}
        </Tag>
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
      <Descriptions.Item label="扣费前余额（元）">
        {{ formatAmountInYuan(detailData?.balanceBefore) }}
      </Descriptions.Item>
      <Descriptions.Item label="扣费后余额（元）">
        {{ formatAmountInYuan(detailData?.balanceAfter) }}
      </Descriptions.Item>
      <Descriptions.Item :span="2" label="失败原因">
        <div class="whitespace-pre-wrap break-all">
          {{ formatValue(detailData?.failureReason) }}
        </div>
      </Descriptions.Item>
      <Descriptions.Item :span="2" label="备注">
        <div class="whitespace-pre-wrap break-all">
          {{ formatValue(detailData?.remark) }}
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
