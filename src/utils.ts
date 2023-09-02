
export async function getJson<T>(filePath: string): Promise<T> {
  const text = await Deno.readTextFile(filePath);
  // console.log({ text });
  const o = JSON.parse(text.replace(/^\uFEFF/, ""));
  // console.log({ o });
  return o as T;
}
