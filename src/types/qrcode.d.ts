/**
 * Type declarations for qrcode module
 * Used for QR code generation in key export functionality
 */
declare module "qrcode" {
  interface QRCodeOptions {
    width?: number;
    margin?: number;
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
    type?: "image/png" | "image/jpeg" | "image/webp";
    color?: {
      dark?: string;
      light?: string;
    };
  }

  function toDataURL(text: string, options?: QRCodeOptions): Promise<string>;

  export { toDataURL };
  export default { toDataURL };
}
