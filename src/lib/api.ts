
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type Options = {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
};

export async function request<T>(
  path: string,
  { method = "GET", body, query }: Options = {}
): Promise<T> {
  const params = new URLSearchParams();

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  const qs = params.toString();
  const isForm = body instanceof FormData;

  const res = await fetch(`/api${path}${qs ? `?${qs}` : ""}`, {
    method,
    credentials: "include",
    headers:
      body !== undefined && !isForm
        ? {
            "Content-Type": "application/json",
          }
        : undefined,
    body:
      body === undefined
        ? undefined
        : isForm
        ? body
        : JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (
      res.status === 401 &&
      !path.startsWith("/login") &&
      typeof window !== "undefined"
    ) {
      window.location.href = "/admin/login";
    }

    throw new ApiError(
      data.message ?? "Something went wrong",
      res.status
    );
  }

  return data as T;
}

