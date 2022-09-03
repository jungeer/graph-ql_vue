import gql from "graphql-tag";

/**
 * 查询用户列表
 */
export const getUserListGraphql = gql`
  query getUserList {
    userList: getUserList {
      userId
      userName
    }
  }
`;

/**
 * 根据 userId 查询用户信息
 */
export const getUserDetailByUserIdGraphql = gql`
  query getUserDetailByUserId($userId: String) {
    userInfo: getUserDetailByUserId(userId: $userId) {
      userId
      userName
    }
  }
`;

/**
 * 新增用户
 */
export const addUserGraphql = gql`
  mutation addUser($userInfo: UserInput) {
    userInfo: addUser(userInfo: $userInfo) {
      userId
    }
  }
`;

/**
 * 根据 userId 删除用户
 */
export const deleteUserByUserIdGraphql = gql`
  mutation deleteUser($userId: String) {
    userInfo: deleteUser(userId: $userId) {
      userId
    }
  }
`;
