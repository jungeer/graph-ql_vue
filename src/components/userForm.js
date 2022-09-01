import { ref } from "vue";
import { Input } from "@arco-design/web-vue";

export const userFormValues = ref({
  userId: "",
  userName: "",
  userAge: "",
  userAddress: "",
  userPrefer: "",
});

export const userFormItems = [
  {
    field: "userId",
    label: "用户ID",
    rules: [{ required: true, message: "用户ID不能为空" }],
    component: Input,
  },
  {
    field: "userName",
    label: "用户姓名",
    rules: [{ required: true, message: "用户姓名不能为空" }],
    component: Input,
  },
  { field: "userAge", label: "用户年龄", component: Input, attrs: {} },
  { field: "userAddress", label: "用户地址", component: Input },
  { field: "userPrefer", label: "用户偏好", component: Input },
].map((item) => ({
  ...item,
  attrs: {
    ...item.attrs,
    placeholder: `请输入${item.label}`,
  },
}));

/**
 * @returns { userId: "用户ID", userName: "用户姓名"}
 */
export const userFieldMap = Object.fromEntries(
  Object.keys(userFormValues.value).map((key) => [
    key,
    userFormItems.find((item) => item.field === key).label,
  ])
);
