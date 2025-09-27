// noinspection JSUnusedGlobalSymbols
export const config = {runtime: "edge"}

const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Max-Age": "86400"
}

// noinspection JSUnusedGlobalSymbols
export default async function handler(request: Request) {
    if (request.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: CORS
        })
    }

    try {
        const {searchParams} = new URL(request.url)
        const targetUrl = searchParams.get("url")
        if (!targetUrl) {
            return new Response(JSON.stringify({error: "The 'url' query parameter is missing."}), {
                status: 400,
                headers: {"Content-Type": "application/json", ...CORS}
            })
        }

        const fwdHeaders = new Headers(request.headers)
        fwdHeaders.delete("host")
        fwdHeaders.delete("origin")
        fwdHeaders.delete("referer")

        const init: RequestInit = {
            method: request.method,
            headers: fwdHeaders,
            body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.blob(),
            redirect: "follow"
        }

        const apiResponse = await fetch(targetUrl, init)
        const respHeaders = new Headers(apiResponse.headers)
        Object.entries(CORS).forEach(([k, v]) => respHeaders.set(k, v as string))
        respHeaders.delete("content-security-policy")
        respHeaders.delete("content-security-policy-report-only")
        respHeaders.delete("x-frame-options")

        return new Response(apiResponse.body, {
            status: apiResponse.status,
            statusText: apiResponse.statusText,
            headers: respHeaders
        })
    } catch (e) {
        return new Response(JSON.stringify({
            error: "Proxy handler failed",
            details: e instanceof Error ? e.message : "Unknown error"
        }), {
            status: 502,
            headers: {"Content-Type": "application/json", ...CORS}
        })
    }
}
