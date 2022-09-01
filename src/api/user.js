import http from "./http";

function httpGetUserList(params) {
  return http.get("/getUserList", { params });
}

function httpGetUserDetailByUserId(params) {
  return http.get("/gerUserDetailByUserId", { params });
}

function httpAddUser(data) {
  return http.post("/addUser", data);
}

function httpDeleteUserByUserId(params) {
  return http.delete("/deleteUserByUserId", { params });
}

export {
  httpGetUserList,
  httpGetUserDetailByUserId,
  httpAddUser,
  httpDeleteUserByUserId,
};
