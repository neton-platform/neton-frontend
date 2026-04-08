<script lang="ts" setup>
import type { FormInstance, FormRules } from "ant-design-vue";
import type { ClientApi } from "#/api/platform/client";

import { computed, nextTick, reactive, ref, watch } from "vue";

import { useVbenModal } from "@vben/common-ui";

import { message } from "ant-design-vue";

import { adjustBalance } from "#/api/platform/client";

const emit = defineEmits<{
  (e: "success"): void;
}>();

const formRef = ref<FormInstance>();
const currentClient = ref<ClientApi.Client | null>(null);
const formModel = reactive({
  amount: undefined as number | undefined,
  operateType: 1,
  remark: "",
});

const currentBalanceYuan = computed(() => {
  const balance = currentClient.value?.balance;
  return typeof balance === "number" ? balance / 100 : undefined;
});

const balanceMessage = computed(() => {
  const name = currentClient.value?.clientName ?? "未知客户端";
  const clientId = currentClient.value?.clientId ?? "-";
  const balance =
    currentBalanceYuan.value != null
      ? `${currentBalanceYuan.value.toFixed(2)} 元`
      : "未知";
  return `${name}（${clientId}）· 当前余额 ${balance}`;
});

const rules: FormRules = {
  amount: [
    {
      required: true,
      message: "请输入金额",
      type: "number",
    },
    {
      validator: async (_, value) => {
        if (value === undefined || value === null || value === "") {
          return Promise.reject(new Error("请输入金额"));
        }
        if (
          formModel.operateType === 2 &&
          currentBalanceYuan.value != null &&
          Number(value) > currentBalanceYuan.value
        ) {
          return Promise.reject(new Error("扣减金额不能大于当前余额"));
        }
        return Promise.resolve();
      },
      trigger: ["change", "blur"],
    },
  ],
  operateType: [
    {
      required: true,
      message: "请选择操作类型",
      type: "number",
    },
  ],
  remark: [
    {
      validator: async (_, value) => {
        if (!value) {
          return Promise.resolve();
        }
        const trimmed = String(value).trim();
        if (trimmed.length > 256) {
          return Promise.reject(new Error("备注不能超过 256 字"));
        }
        return Promise.resolve();
      },
      trigger: ["change", "blur"],
    },
  ],
};

watch(
  () => formModel.operateType,
  async () => {
    await nextTick();
    if (formRef.value) {
      await formRef.value.validateFields("amount").catch(() => {});
    }
  },
);

async function resetForm() {
  formModel.amount = undefined;
  formModel.operateType = 1;
  formModel.remark = "";
  await formRef.value?.resetFields();
}

const [Modal, modalApi] = useVbenModal({
  title: "余额调账",
  showCancelButton: true,
  showConfirmButton: true,
  confirmText: "确认调账",
  destroyOnClose: true,
  async onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      await resetForm();
      currentClient.value = null;
      return;
    }
    currentClient.value = (modalApi.getData() as ClientApi.Client) ?? null;
    await resetForm();
  },
  async onConfirm() {
    const form = formRef.value;
    if (!form) {
      return;
    }
    try {
      await form.validate();
    } catch {
      return;
    }
    if (formModel.amount === undefined) {
      message.error("请输入金额");
      return;
    }
    const amountInCent = Math.round(Number(formModel.amount) * 100);
    const payload = {
      id: currentClient.value?.id,
      clientId: currentClient.value?.clientId,
      amount: amountInCent,
      operateType: formModel.operateType,
      remark: formModel.remark?.trim() || undefined,
    };
    modalApi.lock();
    try {
      const resp = await adjustBalance(payload);
      if (resp.balanceBefore != null && resp.balanceAfter != null) {
        const before = (resp.balanceBefore / 100).toFixed(2);
        const after = (resp.balanceAfter / 100).toFixed(2);
        message.success(`操作成功：余额 ${before} 元 → ${after} 元`);
      } else {
        message.success("调账成功");
      }
      await modalApi.close();
      emit("success");
    } catch (error) {
      const err = error as { message?: string };
      message.error(err?.message || "调账失败，请稍后重试");
    } finally {
      modalApi.unlock();
    }
  },
});

const modalApiExpose = {
  async open(data?: ClientApi.Client) {
    modalApi.setData(data ?? null).open();
  },
};

defineExpose(modalApiExpose);
</script>

<template>
  <Modal class="w-5/12">
    <a-form
      ref="formRef"
      :model="formModel"
      :rules="rules"
      layout="vertical"
      class="py-2"
    >
      <a-alert class="mb-4" show-icon type="info" :message="balanceMessage" />

      <a-form-item label="金额（元）" name="amount">
        <a-input-number
          v-model:value="formModel.amount"
          :min="0.01"
          :precision="2"
          :step="0.01"
          class="w-full"
          placeholder="请输入金额（元）"
        />
      </a-form-item>

      <a-form-item label="操作类型" name="operateType">
        <a-radio-group v-model:value="formModel.operateType">
          <a-radio :value="1">手动充值</a-radio>
          <a-radio :value="2">手动扣减</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item label="备注" name="remark">
        <a-textarea
          v-model:value="formModel.remark"
          :maxlength="256"
          show-count
          placeholder="备注（可选，最多 256 字）"
          :auto-size="{ minRows: 2, maxRows: 4 }"
        />
      </a-form-item>
    </a-form>
  </Modal>
</template>
