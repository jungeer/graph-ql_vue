import axios from "axios";

const baseURL = "/api";

const instance = axios.create({
  baseURL,
  timeout: 6000,
});

export default instance;
