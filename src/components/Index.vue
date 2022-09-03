<script setup>
import { ref, computed } from "vue";
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

import { useQuery, useMutation } from "@vue/apollo-composable";
import {
  getUserListGraphql,
  getUserDetailByUserIdGraphql,
  addUserGraphql,
  deleteUserByUserIdGraphql,
} from "./graphql";

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

const searchByRest = () => {
  requestGetTableData();
};

const getUserListEnabled = ref(false);

const { refetch: getUserListRefetch, onResult: getUserListRes } = useQuery(
  getUserListGraphql,
  null,
  {
    enabled: getUserListEnabled,
  }
);
getUserListRes((res) => {
  userTableData.value = res.data?.userList || [];
});
const searchByGraphql = async () => {
  getUserListEnabled.value = true;
  getUserListRefetch();
};

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

const modalInfoShowUserDetail = (userId, userInfo) => {
  const userInfoStr = Object.keys(userFieldMap).reduce(
    (pre, cur) => pre + `${userFieldMap[cur]}：${userInfo[cur] || " - "}；`,
    ""
  );
  Modal.info({
    title: TIP_TEXT_ENUM.MODAL_USER_DETIAL_TITLE(userId),
    content: userInfoStr,
  });
};

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
    modalInfoShowUserDetail(userId, res.data);
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

const requestRestServer = async () => {
  await API_REST_MAP[ButtonType.value](curClickTableRecord.value.userId);
};

const queryUserId = ref("");

const getUserDetailEnabled = ref(false);

const { refetch: getUserDetailRefetch, onResult: getUserDetailRes } = useQuery(
  getUserDetailByUserIdGraphql,
  () => ({
    userId: queryUserId.value,
  }),
  {
    enabled: getUserDetailEnabled,
  }
);
getUserDetailRes((res) => {
  if (!res.data?.userInfo) return;
  modalInfoShowUserDetail(res.data.userInfo.userId, res.data.userInfo);
});

const { mutate: addUserByGraphql } = useMutation(addUserGraphql);

const { mutate: deleteUserByGraphql } = useMutation(deleteUserByUserIdGraphql);

const API_GRAPHQL_MAP = {
  ADD: async () => {
    openDrawer(API_TYPE_ENUM.GRAPH_QL);
  },
  VIEW: async (userId) => {
    if (!userId) {
      Message.warning(TIP_TEXT_ENUM.NO_USER_ID);
      return;
    }
    queryUserId.value = userId;
    getUserDetailEnabled.value = true;
    getUserDetailRefetch();
  },
  DELETE: async (userId) => {
    if (!userId) {
      Message.warning(TIP_TEXT_ENUM.NO_USER_ID);
      return;
    }
    await deleteUserByGraphql({ userId });
    Message.success(TIP_TEXT_ENUM.DELETE_SUCCESS);
    closeModal();
    requestGetTableData();
  },
};

const requestGraphqlServer = async () => {
  await API_GRAPHQL_MAP[ButtonType.value](curClickTableRecord.value.userId);
};

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
    } else {
      await addUserByGraphql({
        userInfo: {
          ...userFormValues.value,
          userAge: Number(userFormValues.value.userAge),
        },
      });
    }
    Message.success(TIP_TEXT_ENUM.ADD_SUCCESS);
    closeDrawer();
    requestGetTableData();
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
      <a-tooltip :popup-visible="true" mini content="全量返回" position="top">
        <a-button @click="searchByRest">{{
          BUTTON_TEXT_ENUM.SEARCH_REST
        }}</a-button>
      </a-tooltip>
      <a-tooltip
        :popup-visible="true"
        mini
        content="按需查询用户ID和用户姓名"
        position="top"
      >
        <a-button @click="searchByGraphql">{{
          BUTTON_TEXT_ENUM.SEARCH_GRAPHQL
        }}</a-button>
      </a-tooltip>
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
  display: flex;
  gap: 10px;
}
</style>
