import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import type { AxiosInstance } from "axios";

// https://blog.csdn.net/weixin_44213308/article/details/113681316
export class Request {
  public static axiosInstance: AxiosInstance;

  public static init() {
    this.axiosInstance = axios.create({
      baseURL: "",
      timeout: 10000,
    });
    return axios;
  }

  //   初始化拦截器
  public static initInterceptors() {
    //   设置请求头
    // this.axiosInstance.defaults.headers.post["Content-Type"] ="application/x-www-form-urlencode";

    // 请求拦截器
    this.axiosInstance.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        // const token=localStorage.getItem("token");
        // if(token){
        //     config.headers['Authorization']='Bearer '+token;
        // }
        return config;
      },
      (error: AxiosError) => {
        console.error(error);
      }
    );

    // 相应拦截器
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        if (response.status === 200) {
          return response;
        } else {
          // 处理
          return response;
        }
      },
      (error: AxiosError) => {
        const { response } = error;
        if (response) {
          return Promise.reject(response.data);
        } else {
          console.log("网络异常");
        }
      }
    );
  }
}
