import { CreateResponse, ListResponse } from '@/types';
import { createDataProvider ,CreateDataProviderOptions } from '@refinedev/rest';
import { BACKEND_BASE_URL } from '@/constants';
import { GetOneResponse } from '@refinedev/core';

if(!BACKEND_BASE_URL){
  throw new Error("BACKEND_BASE_URL is not defined. Please set it in the environment variables.");
}

type HttpError = Error & { statusCode: number };

const buildhttpError = async (response: Response): Promise<HttpError> => {
  let message = 'Request failed';

  try {
    const payload = (await response.json()) as { message?: string };

    if (payload.message) {
      message = payload.message;
    }
  } catch  {
    // Ignore JSON parsing errors
  }


  return Object.assign(new Error(message), {
    statusCode: response.status,
  });

}
const options: CreateDataProviderOptions = {
  getList: {
    getEndpoint: (params) => params.resource,

    buildQueryParams: async ({resource, pagination, filters}) => {
      const page = pagination?.currentPage ?? 1;
      const pageSize = pagination?.pageSize ?? 10;

      const params: Record<string, string | number> = { page, limit: pageSize };
      
      filters?.forEach((filter) => {
        const field = 'field' in filter ? filter.field : '';

        const value = String(filter.value);

        if (resource === 'subjects'){
          if (field === 'departmentId' || field === 'department') {
            params.department = value;
          }
          if (field === 'name' || field === 'code') params.search = value;
        }

        if (resource === 'users'){
          if (field === 'role') {
            params.role = value;
          }
          if (field === 'emailVerified') {
            params.emailVerified = value;
          }
          if( field === 'name' || field === 'email') params.search = value;
        }

        if (resource === 'classes'){
          if (field === 'subject') {
            params.subject = value;
          }
          if (field === 'teacher') {
            params.teacher = value;
          }
          if (field === 'name') {
            params.search = value;
          }
        }

        if (resource === 'departments') {
          if (field === 'name' || field === 'code') params.search = value;
        }
      })
      return params;
    },

    mapResponse: async (response) => {
      if (!response.ok) {
        throw await buildhttpError(response);
      }
      const payload: ListResponse = await response.clone().json();
      return payload.data || [];
    },
    getTotalCount: async (response) => {
      const payload: ListResponse = await response.clone().json();
      return payload.pagination?.total ?? payload.data?.length ?? 0;
    },
  },
  create: {
    getEndpoint: ({ resource }) => resource,

    buildBodyParams: async ({ variables }) => variables,

    mapResponse: async (response) => {
      const json: CreateResponse = await response.json();
      return (json.data ?? {}) as Record<string, unknown>;
    }
  },
  getOne: {
    getEndpoint: ({ resource, id }) => `${resource}/${id}`,

    mapResponse: async (response) => {
      if (!response.ok) {
        throw await buildhttpError(response);
      }
      const json: GetOneResponse = await response.json();
      return json.data ?? null;
    }
  },
  update: {
    getEndpoint: ({ resource, id }) => `${resource}/${id}`,
    buildBodyParams: ({ variables }) => variables,
    mapResponse: async (response) => {
      if (!response.ok) throw await buildhttpError(response);
      const json: CreateResponse = await response.json();
      return (json.data ?? {}) as Record<string, unknown>;
    },
  },
  deleteOne: {
    getEndpoint: ({ resource, id }) => `${resource}/${id}`,
    mapResponse: async (response) => {
      if (!response.ok) throw await buildhttpError(response);
      return {} as Record<string, unknown>;
    },
  },
};


const { dataProvider } = createDataProvider(BACKEND_BASE_URL, options, {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
});

export { dataProvider };