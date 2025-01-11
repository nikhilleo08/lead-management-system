import crypto from "crypto";

// Utility function to encrypt sensitive data
const encryptData = (data: string, encryptionKey: string): string => {
  const iv = crypto.randomBytes(16); // Initialization vector
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(encryptionKey, "utf8"), iv);

  let encrypted = cipher.update(data, "utf8", "hex"); // Use "utf8" instead of "utf-8"
  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}:${encrypted}`;
};

// Utility function to decrypt sensitive data
const decryptData = (encryptedData: string, encryptionKey: string): string => {
  const [iv, encrypted] = encryptedData.split(":");
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(encryptionKey, "utf8"), Buffer.from(iv, "hex"));

  let decrypted = decipher.update(encrypted, "hex", "utf8"); // Use "utf8" instead of "utf-8"
  decrypted += decipher.final("utf8");

  return decrypted;
};

export { encryptData, decryptData }