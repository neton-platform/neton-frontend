<script lang="ts" setup>
import type { LogApi } from '#/api/platform/log';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { fenToYuan, formatDateTime } from '@vben/utils';

import { Descriptions } from 'ant-design-vue';

import { getLog } from '#/api/platform/log';

const detailData = ref<LogApi.Log>();

const getTitle = computed(() => `日志详情${detailData.value?.id ? ` #${detailData.value.id}` : ''}`);

function formatValue(value?: boolean | number | string | null) {
  if (value === undefined || value === null || value === '') {
    return '-';
  }
  if (typeof value === 'boolean') {
    return value ? '是' : '否';
  }
  return String(value);
}

function formatTime(value?: string) {
  return value ? formatDateTime(value) : '-';
}

function formatAmountInYuan(value?: number | string | null) {
  if (value === undefined || value === null || value === '') {
    return '-';
  }
  return `${fenToYuan(value)} 元`;
}

const [Modal, modalApi] = useVbenModal({
  destroyOnClose: true,
  showConfirmButton: false,
  async onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      detailData.value = undefined;
      return;
    }

    const row = modalApi.getData<LogApi.Log>();
    if (!row?.id) {
      detailData.value = row;
      return;
    }

    modalApi.lock();
    try {
      detailData.value = await getLog(row.id);
    } finally {
      modalApi.unlock();
    }
  },
});
</script>

<template>
  <Modal :title="getTitle" class="w-4/5">
    <Descriptions bordered :column="2" size="small">
      <Descriptions.Item label="日志ID">
        {{ formatValue(detailData?.id) }}
      </Descriptions.Item>
      <Descriptions.Item label="请求跟踪ID">
        {{ formatValue(detailData?.traceId) }}
      </Descriptions.Item>
      <Descriptions.Item label="客户端ID">
        {{ formatValue(detailData?.clientId) }}
      </Descriptions.Item>
      <Descriptions.Item label="API ID">
        {{ formatValue(detailData?.apiId) }}
      </Descriptions.Item>
      <Descriptions.Item label="API 编码">
        {{ formatValue(detailData?.apiCode) }}
      </Descriptions.Item>
      <Descriptions.Item label="API 路径">
        {{ formatValue(detailData?.apiPath) }}
      </Descriptions.Item>
      <Descriptions.Item label="HTTP 方法">
        {{ formatValue(detailData?.httpMethod) }}
      </Descriptions.Item>
      <Descriptions.Item label="HTTP 状态码">
        {{ formatValue(detailData?.responseStatus) }}
      </Descriptions.Item>
      <Descriptions.Item label="请求IP">
        {{ formatValue(detailData?.requestIp) }}
      </Descriptions.Item>
      <Descriptions.Item label="User-Agent">
        {{ formatValue(detailData?.requestUserAgent) }}
      </Descriptions.Item>
      <Descriptions.Item label="耗时（毫秒）">
        {{ formatValue(detailData?.durationMs) }}
      </Descriptions.Item>
      <Descriptions.Item label="是否成功">
        {{ formatValue(detailData?.success) }}
      </Descriptions.Item>
      <Descriptions.Item label="错误码">
        {{ formatValue(detailData?.errorCode) }}
      </Descriptions.Item>
      <Descriptions.Item label="错误信息">
        {{ formatValue(detailData?.errorMsg) }}
      </Descriptions.Item>
      <Descriptions.Item label="本次计费金额（元）">
        {{ formatAmountInYuan(detailData?.chargePrice) }}
      </Descriptions.Item>
      <Descriptions.Item label="扣费状态">
        {{ formatValue(detailData?.chargeStatus) }}
      </Descriptions.Item>
      <Descriptions.Item label="请求时间">
        {{ formatTime(detailData?.requestTime as string) }}
      </Descriptions.Item>
      <Descriptions.Item label="创建时间">
        {{ formatTime(detailData?.createTime as string) }}
      </Descriptions.Item>
      <Descriptions.Item :span="2" label="请求头（JSON）">
        <div class="whitespace-pre-wrap break-all">
          {{ formatValue(detailData?.requestHeaders) }}
        </div>
      </Descriptions.Item>
      <Descriptions.Item :span="2" label="请求参数（JSON）">
        <div class="whitespace-pre-wrap break-all">
          {{ formatValue(detailData?.requestParams) }}
        </div>
      </Descriptions.Item>
      <Descriptions.Item :span="2" label="请求体（JSON）">
        <div class="whitespace-pre-wrap break-all">
          {{ formatValue(detailData?.requestBody) }}
        </div>
      </Descriptions.Item>
      <Descriptions.Item :span="2" label="响应内容">
        <div class="whitespace-pre-wrap break-all">
          {{ formatValue(detailData?.responseBody) }}
        </div>
      </Descriptions.Item>
    </Descriptions>
  </Modal>
</template>
