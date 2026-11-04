type EdgeContext = {
  next: (request?: Request) => Promise<Response>;
};

const acceptsMarkdown = (accept: string | null) =>
  accept?.split(",").some((entry) => {
    const [mediaType, ...parameters] = entry.split(";");
    if (mediaType.trim().toLowerCase() !== "text/markdown") return false;

    const quality = parameters.find((parameter) =>
      parameter.trim().toLowerCase().startsWith("q="),
    );
    return quality ? Number(quality.trim().slice(2)) > 0 : true;
  }) ?? false;

export default async (request: Request, context: EdgeContext) => {
  const url = new URL(request.url);
  if (
    url.pathname !== "/" ||
    (request.method !== "GET" && request.method !== "HEAD")
  ) {
    return context.next();
  }

  const wantsMarkdown = acceptsMarkdown(request.headers.get("Accept"));
  const downstreamRequest = wantsMarkdown
    ? new Request(new URL("/index.md", url), request)
    : request;
  const response = await context.next(downstreamRequest);
  if (!response.ok) return response;

  const headers = new Headers(response.headers);
  headers.set("Link", '</>; rel="alternate"; type="text/markdown"');
  if (wantsMarkdown) {
    headers.set("Content-Type", "text/markdown; charset=utf-8");
  }

  const vary = headers.get("Vary");
  if (
    !vary
      ?.split(",")
      .some((value) => value.trim().toLowerCase() === "accept")
  ) {
    headers.set("Vary", [vary, "Accept"].filter(Boolean).join(", "));
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
