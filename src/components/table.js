import { ref } from "vue";
import { httpGetUserList } from "@/api/user";

export const userTableColumns = [
  { title: "用户ID", dataIndex: "userId" },
  { title: "用户姓名", dataIndex: "userName" },
  { title: "用户年龄", dataIndex: "userAge" },
  { title: "用户地址", dataIndex: "userAddress" },
  { title: "用户偏好", dataIndex: "userPrefer" },
  {
    title: "操作",
    slotName: "operation",
  },
];

export const userTableData = ref([]);

export const requestGetTableData = async () => {
  const res = await httpGetUserList();
  userTableData.value = res.data;
};
