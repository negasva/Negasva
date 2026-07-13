// fetch con timeout para llamadas a proveedores externos. Un timeout se traduce
// a un Error controlado (nunca un AbortError/DOMException crudo), para que los
// catch de los llamadores lo traten como cualquier otro fallo de red.
export async function fetchWithTimeout(url: string, opts: RequestInit = {}, ms = 10_000): Promise<Response> {
  try {
    return await fetch(url, { ...opts, signal: AbortSignal.timeout(ms) });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'TimeoutError') {
      throw new Error(`Request to ${new URL(url).host} timed out after ${ms}ms`);
    }
    throw e instanceof Error ? e : new Error(String(e));
  }
}
