<script lang="ts" setup>
import type { CheckboxValueType } from 'ant-design-vue/es/checkbox/interface';

import type { ApiApi } from '#/api/platform/api';
import type { ClientApi } from '#/api/platform/client';
import type { ClientApiApi } from '#/api/platform/clientapi';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { DICT_TYPE } from '@vben/constants';
import { getDictOptions } from '@vben/hooks';

import {
  Button,
  Checkbox,
  CheckboxGroup,
  DatePicker,
  Empty,
  Form,
  Input,
  message,
  Radio,
  RadioGroup,
  Spin,
} from 'ant-design-vue';

import { getApiList } from '#/api/platform/api';
import {
  createClientApiAssociation,
  getClientApiByClientIdAndApiId,
  updateClientApi,
} from '#/api/platform/clientapi';

const clientId = ref('');
const clientName = ref('');
const apiList = ref<ApiApi.ApiListItem[]>([]);
const selectedApiIds = ref<number[]>([]);
const associatedApiIds = ref<number[]>([]);
const activeApiId = ref<null | number>(null);
const listLoading = ref(false);
const associationSaving = ref(false);
const detailLoading = ref(false);
const detailSaving = ref(false);
const detailFormData = ref<Partial<ClientApiApi.ClientApi>>({});

const activeApi = computed(() =>
  apiList.value.find((item) => item.id === activeApiId.value),
);
const isActiveAssociated = computed(() =>
  activeApiId.value
    ? associatedApiIds.value.includes(activeApiId.value)
    : false,
);
const showCustomPrice = computed(
  () => Number(detailFormData.value.isCustomPrice) === 1,
);
const title = computed(() =>
  clientName.value
    ? `配置API接口：${clientName.value}`
    : `配置API接口：${clientId.value}`,
);

function resetState() {
  apiList.value = [];
  selectedApiIds.value = [];
  associatedApiIds.value = [];
  activeApiId.value = null;
  detailFormData.value = {};
  clientId.value = '';
  clientName.value = '';
}

async function loadApiList() {
  listLoading.value = true;
  try {
    const data = await getApiList({ clientId: clientId.value });
    apiList.value = data;
    selectedApiIds.value = data
      .filter((item) => Boolean(item.selected))
      .map((item) => item.id);
    associatedApiIds.value = [...selectedApiIds.value];
    const nextActiveId =
      activeApiId.value && data.some((item) => item.id === activeApiId.value)
        ? activeApiId.value
        : (selectedApiIds.value[0] ?? data[0]?.id ?? null);
    activeApiId.value = nextActiveId;
    if (nextActiveId && associatedApiIds.value.includes(nextActiveId)) {
      await loadDetail(nextActiveId);
    } else {
      detailFormData.value = {};
    }
  } finally {
    listLoading.value = false;
  }
}

async function loadDetail(apiId: number) {
  detailLoading.value = true;
  try {
    const data = await getClientApiByClientIdAndApiId({
      clientId: clientId.value,
      apiId,
    });
    data.isCustomPrice = Number(data.isCustomPrice) === 1 ? 1 : 0;
    detailFormData.value = data ?? {};
  } finally {
    detailLoading.value = false;
  }
}

async function handleDetailSave() {
  if (!activeApiId.value || !isActiveAssociated.value) {
    message.warning('请先选择并勾选需要配置的接口');
    return;
  }
  detailSaving.value = true;
  try {
    const payload = {
      ...(detailFormData.value as ClientApiApi.ClientApi),
      clientId: clientId.value,
      apiId: activeApiId.value,
    };
    await updateClientApi(payload);
    message.success('配置已保存');
    await loadDetail(activeApiId.value);
  } finally {
    detailSaving.value = false;
  }
}

function handleApiClick(api: ApiApi.ApiListItem) {
  activeApiId.value = api.id;
  if (associatedApiIds.value.includes(api.id)) {
    loadDetail(api.id);
  } else {
    detailFormData.value = {};
  }
}

async function handleSelectionChange(nextSelected: CheckboxValueType[]) {
  if (!clientId.value || associationSaving.value) {
    return;
  }
  const nextSelectedIds = nextSelected
    .map((value) => Number(value))
    .filter((value) => !Number.isNaN(value));
  const previousAssociated = [...associatedApiIds.value];
  associationSaving.value = true;
  try {
    await createClientApiAssociation({
      clientId: clientId.value,
      apiIdList: nextSelectedIds,
    });
    associatedApiIds.value = [...nextSelectedIds];
    if (
      activeApiId.value &&
      associatedApiIds.value.includes(activeApiId.value)
    ) {
      await loadDetail(activeApiId.value);
    } else {
      detailFormData.value = {};
    }
  } catch {
    selectedApiIds.value = previousAssociated;
    message.error('关联更新失败，请重试');
  } finally {
    associationSaving.value = false;
  }
}

const [Modal, modalApi] = useVbenModal({
  async onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      resetState();
      return;
    }
    const data = modalApi.getData<ClientApi.Client>();
    if (!data) {
      return;
    }
    clientId.value = data.id ? String(data.id) : '';
    clientName.value = data.clientName ?? '';
    await loadApiList();
  },
});
</script>

<template>
  <Modal :title="title" class="w-4/5">
    <div class="flex gap-4">
      <div class="w-1/2">
        <div class="mb-2 flex items-center justify-between">
          <span class="text-base font-medium">接口列表</span>
        </div>
        <div class="h-[520px] overflow-auto rounded border p-2">
          <Spin :spinning="listLoading">
            <Empty
              v-if="!listLoading && apiList.length === 0"
              description="暂无接口数据"
            />
            <CheckboxGroup
              v-else
              v-model:value="selectedApiIds"
              :disabled="associationSaving"
              class="flex flex-col gap-2"
              @change="handleSelectionChange"
            >
              <div
                v-for="api in apiList"
                :key="api.id"
                class="flex cursor-pointer items-start gap-2 rounded px-2 py-2 transition"
                :class="
                  activeApiId === api.id ? 'bg-gray-100' : 'hover:bg-gray-50'
                "
                @click="handleApiClick(api)"
              >
                <Checkbox :value="api.id" />
                <div class="flex-1">
                  <div class="font-medium">
                    {{ api.apiName || '-' }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ api.apiCode || '-' }}
                  </div>
                </div>
              </div>
            </CheckboxGroup>
          </Spin>
        </div>
      </div>
      <div class="w-1/2">
        <div class="mb-2 flex items-center justify-between">
          <span class="text-base font-medium">接口配置</span>
          <Button
            size="small"
            type="primary"
            :loading="detailSaving"
            :disabled="!isActiveAssociated"
            @click="handleDetailSave"
          >
            保存配置
          </Button>
        </div>
        <div class="h-[520px] overflow-auto rounded border p-4">
          <Spin :spinning="detailLoading">
            <Empty v-if="!activeApiId" description="请选择左侧接口" />
            <Empty
              v-else-if="!isActiveAssociated"
              description="该接口尚未建立关系，请先勾选接口"
            />
            <Form
              v-else
              :model="detailFormData"
              :label-col="{ span: 8 }"
              :wrapper-col="{ span: 14 }"
            >
              <Form.Item label="接口名称">
                <Input :value="activeApi?.apiName ?? '-'" disabled />
              </Form.Item>
              <Form.Item label="接口编码">
                <Input :value="activeApi?.apiCode ?? '-'" disabled />
              </Form.Item>
              <Form.Item label="是否启用" name="status">
                <RadioGroup v-model:value="detailFormData.status">
                  <Radio
                    v-for="dict in getDictOptions(
                      DICT_TYPE.PLATFORM_BOOL,
                      'number',
                    )"
                    :key="String(dict.value)"
                    :value="dict.value"
                  >
                    {{ dict.label }}
                  </Radio>
                </RadioGroup>
              </Form.Item>
              <Form.Item label="每分钟限流" name="rateLimitPerMin">
                <Input
                  v-model:value="detailFormData.rateLimitPerMin"
                  placeholder="请输入每分钟限流"
                />
              </Form.Item>
              <Form.Item label="每日配额" name="rateLimitPerDay">
                <Input
                  v-model:value="detailFormData.rateLimitPerDay"
                  placeholder="请输入每日配额"
                />
              </Form.Item>
              <Form.Item label="是否自定义价格" name="isCustomPrice">
                <RadioGroup v-model:value="detailFormData.isCustomPrice">
                  <Radio
                    v-for="dict in getDictOptions(
                      DICT_TYPE.PLATFORM_BOOL,
                      'number',
                    )"
                    :key="String(dict.value)"
                    :value="dict.value"
                  >
                    {{ dict.label }}
                  </Radio>
                </RadioGroup>
              </Form.Item>
              <Form.Item
                v-if="showCustomPrice"
                label="自定义价格（分）"
                name="customPrice"
              >
                <Input
                  v-model:value="detailFormData.customPrice"
                  placeholder="请输入自定义价格"
                />
              </Form.Item>
              <Form.Item label="授权开始时间" name="startTime">
                <DatePicker
                  v-model:value="detailFormData.startTime"
                  value-format="x"
                  placeholder="选择授权开始时间"
                />
              </Form.Item>
              <Form.Item label="授权结束时间" name="endTime">
                <DatePicker
                  v-model:value="detailFormData.endTime"
                  value-format="x"
                  placeholder="选择授权结束时间"
                />
              </Form.Item>
            </Form>
          </Spin>
        </div>
      </div>
    </div>
    <template #footer>
      <Button @click="modalApi.close()">关闭</Button>
    </template>
  </Modal>
</template>
