import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

const BASES = {
  core: process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4040',
  payroll: process.env.NEXT_PUBLIC_PAYROLL_API_BASE ?? 'http://10.0.32.83:8081',
  legacy: process.env.NEXT_PUBLIC_LEGACY_API_BASE ?? 'http://localhost:5050',
} as const;

export type ApiName = keyof typeof BASES;

function attachRequestInterceptor(api: AxiosInstance, baseLabel: ApiName) {
  api.interceptors.request.use((config) => {
    const url = String(config?.url ?? '');

    if (
      baseLabel === 'core' &&
      /\/api\/users\/analysts\/create$/.test(url) &&
      typeof window !== 'undefined'
    ) {
      try {
        const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;

        console.log(
          `%c[REQUEST ${baseLabel.toUpperCase()}] ${String(config.method ?? 'POST').toUpperCase()} ${url}`,
          'color:#9F2141;font-weight:bold'
        );
        console.log(JSON.stringify(body, null, 2));

        const curl = `curl -X ${String(config.method ?? 'POST').toUpperCase()} '${api.defaults.baseURL}${url}' \
  -H 'Content-Type: application/json' \
  --cookie-jar cookies.txt --cookie cookies.txt \
  -d '${JSON.stringify(body)}'`;
        console.log('%c[curl]', 'color:#777', curl);
      } catch (err) {
        console.warn('No se pudo imprimir payload de createAnalyst:', err);
      }
    }
    return config;
  });
}

const AUTH_ENDPOINTS_REGEX = /\/auth\/(me|login|refresh|logout)$/i;

function attachResponseInterceptor(api: AxiosInstance) {
  api.interceptors.response.use(
    (r) => r,
    (error: AxiosError<any>) => {
      const status = error?.response?.status;
      const url = String(error?.config?.url ?? '');

      // 👉 Caso esperado en bootstrap: no hay sesión y /auth/me devuelve 401/419/440
      const isAuthMe = /\/auth\/me$/i.test(url);
      const isExpectedBootstrap =
        typeof window !== 'undefined' &&
        isAuthMe &&
        (status === 401 || status === 419 || status === 440);

      if (!isExpectedBootstrap) {
        const payload = {
          baseURL: api.defaults.baseURL,
          url,
          method: error?.config?.method,
          status,
          data: error?.response?.data,
          headers: error?.response?.headers,
        };

        // En dev usa warn (evita overlay de Next); en prod usa error
        if (process.env.NODE_ENV === 'development') {
          console.warn('[API WARNING]', payload);
        } else {
          console.error('[API ERROR]', payload);
        }
      }

      // Señal global de expiración (mantener flujo actual)
      if (typeof window !== 'undefined') {
        if (status === 419 || status === 440) {
          window.dispatchEvent(new CustomEvent('auth:expired'));
        } else if (status === 401 && AUTH_ENDPOINTS_REGEX.test(url)) {
          window.dispatchEvent(new CustomEvent('auth:expired'));
        }
      }
      return Promise.reject(error);
    }
  );
}

function createApi(baseLabel: ApiName) {
  const api = axios.create({
    baseURL: BASES[baseLabel],
    withCredentials: true,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    timeout: 20_000,
  });
  attachRequestInterceptor(api, baseLabel);
  attachResponseInterceptor(api);
  return api;
}

const registry: Record<ApiName, AxiosInstance> = {
  core: createApi('core'),
  payroll: createApi('payroll'),
  legacy: createApi('legacy'),
};

export function getApi(name: ApiName) {
  return registry[name];
}

export function request<N extends ApiName>(name: N, config: AxiosRequestConfig) {
  return getApi(name).request(config);
}

const api = registry.core;
export default api;
