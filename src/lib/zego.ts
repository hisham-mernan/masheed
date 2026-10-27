import { createCipheriv, randomBytes, randomInt } from "node:crypto";

// ZEGOCLOUD "token04": AES-CBC encrypted JSON signed with the project's ServerSecret.
// Generated on the server so the secret never reaches the browser.
export function zegoToken(userId: string, ttlSeconds: number) {
  const appId = Number(process.env.ZEGO_APP_ID);
  const secret = process.env.ZEGO_SERVER_SECRET || "";
  if (!appId || secret.length !== 32) throw new Error("ZEGO_APP_ID / ZEGO_SERVER_SECRET are not set");

  const now = Math.floor(Date.now() / 1000);
  const info = { app_id: appId, user_id: userId, nonce: randomInt(-2147483648, 2147483647), ctime: now, expire: now + ttlSeconds, payload: "" };
  const iv = randomBytes(8).toString("hex"); // 16 ASCII chars
  const cipher = createCipheriv("aes-256-cbc", Buffer.from(secret, "utf8"), Buffer.from(iv, "utf8"));
  const enc = Buffer.concat([cipher.update(JSON.stringify(info), "utf8"), cipher.final()]);

  const expire = Buffer.alloc(8);
  expire.writeBigInt64BE(BigInt(info.expire));
  const ivLen = Buffer.alloc(2);
  ivLen.writeUInt16BE(iv.length);
  const encLen = Buffer.alloc(2);
  encLen.writeUInt16BE(enc.length);
  return { appId, token: "04" + Buffer.concat([expire, ivLen, Buffer.from(iv, "utf8"), encLen, enc]).toString("base64") };
}
