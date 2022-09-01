<script setup>
import { ref, computed, onMounted } from "vue";
import { Modal, Message } from "@arco-design/web-vue";
import {
  httpGetUserDetailByUserId,
  httpAddUser,
  httpDeleteUserByUserId,
} from "@/api/user";

import { userTableColumns, userTableData, requestGetTableData } from "./table";

import { userFormValues, userFormItems, userFieldMap } from "./userForm";

import {
  BUTTON_TEXT_ENUM,
  TIP_TEXT_ENUM,
  OPERATION_TYPE,
  API_TYPE_ENUM,
} from "./enums";

const API_REST_MAP = {
  ADD: async () => {
    openDrawer(API_TYPE_ENUM.REST);
  },
  VIEW: async (userId) => {
    if (!userId) {
      Message.warning(TIP_TEXT_ENUM.NO_USER_ID);
      return;
    }
    const res = await httpGetUserDetailByUserId({ userId });
    const userInfoStr = Object.keys(userFieldMap).reduce(
      (pre, cur) => pre + `${userFieldMap[cur]}：${res.data[cur] || " - "}；`,
      ""
    );
    Modal.info({
      title: TIP_TEXT_ENUM.MODAL_USER_DETIAL_TITLE(userId),
      content: userInfoStr,
    });
  },
  DELETE: async (userId) => {
    if (!userId) {
      Message.warning(TIP_TEXT_ENUM.NO_USER_ID);
      return;
    }
    await httpDeleteUserByUserId({ userId });
    Message.success(TIP_TEXT_ENUM.DELETE_SUCCESS);
    closeModal();
    requestGetTableData();
  },
};

const ButtonType = ref("");

const getModalTitle = computed(() => {
  return BUTTON_TEXT_ENUM[ButtonType.value];
});

const getRestButtonText = computed(() => {
  return `常规 API ${getModalTitle.value}`;
});

const getGraphqlButtonText = computed(() => {
  return `GraphQL方式 ${getModalTitle.value}`;
});

onMounted(async () => {
  requestGetTableData();
});

const curClickTableRecord = ref({});

const isModalVisible = ref(false);

const DrawerFormRef = ref(null);

const openModal = (type, record = {}) => {
  curClickTableRecord.value = record;
  ButtonType.value = type;
  isModalVisible.value = true;
};

const closeModal = () => {
  curClickTableRecord.value = {};
  isModalVisible.value = false;
};

const requestRestServer = async () => {
  await API_REST_MAP[ButtonType.value](curClickTableRecord.value.userId);
};

const requestGraphqlServer = async () => {};

const isDrawerVisible = ref(false);

const openDrawerType = ref("");

const getDrawerTitle = computed(() => {
  return openDrawerType.value === API_TYPE_ENUM.REST
    ? "通过常规 API 方式新增用户"
    : "通过 Graphql 方式新增用户";
});

const openDrawer = (apiType) => {
  openDrawerType.value = apiType;
  isDrawerVisible.value = true;
};

const closeDrawer = () => {
  isDrawerVisible.value = false;
  userFormValues.value = {};
};

const clickDrawerOk = async () => {
  DrawerFormRef.value.validate(async (error) => {
    if (error) return;
    if (openDrawerType.value === API_TYPE_ENUM.REST) {
      await httpAddUser(userFormValues.value);
      Message.success(TIP_TEXT_ENUM.ADD_SUCCESS);
      closeDrawer();
      requestGetTableData();
      return;
    }
  });
};

const clickDrawerCancel = () => {
  closeDrawer();
};
</script>

<template>
  <a-card>
    <template #title>
      <a-button type="primary" @click="openModal(OPERATION_TYPE.ADD)">{{
        BUTTON_TEXT_ENUM.ADD
      }}</a-button>
    </template>
    <a-table
      :columns="userTableColumns"
      :data="userTableData"
      :pagination="false"
    >
      <template #operation="{ record }">
        <div class="button-group">
          <a-button @click="openModal(OPERATION_TYPE.VIEW, record)"
            >{{ BUTTON_TEXT_ENUM.VIEW }}
          </a-button>
          <a-button @click="openModal(OPERATION_TYPE.DELETE, record)"
            >{{ BUTTON_TEXT_ENUM.DELETE }}
          </a-button>
        </div>
      </template>
    </a-table>
  </a-card>
  <a-modal v-model:visible="isModalVisible" draggable>
    <template #title> {{ getModalTitle }} </template>
    <div class="button-group">
      <a-button @click="requestRestServer">{{ getRestButtonText }} </a-button>
      <a-button @click="requestGraphqlServer"
        >{{ getGraphqlButtonText }}
      </a-button>
    </div>
  </a-modal>
  <a-drawer
    :title="getDrawerTitle"
    :width="500"
    :visible="isDrawerVisible"
    @ok="clickDrawerOk"
    @cancel="clickDrawerCancel"
    unmountOnClose
  >
    <a-form ref="DrawerFormRef" :model="userFormValues">
      <template v-for="item in userFormItems" :key="item.field">
        <a-form-item v-bind="item">
          <component
            v-model="userFormValues[item.field]"
            :is="item.component"
            v-bind="item.attrs"
          ></component>
        </a-form-item>
      </template>
    </a-form>
  </a-drawer>
</template>

<style lang="scss" scoped>
.button-group {
  display: flex;
  gap: 10px;
}
::v-deep(.arco-card-header-title) {
  text-align: left;
}
</style>
