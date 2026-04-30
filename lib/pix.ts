/**
 * PIX QR Code payload generator — EMV/BR Code format
 * Spec: https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf
 */

function crc16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function tlv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

export function generateDynamicPixFromBase(basePix: string, amount: number): string {
  // Encontrar onde fica o CRC final (sempre começa com 6304 no final do payload)
  const crcIndex = basePix.lastIndexOf("6304");
  let body = crcIndex !== -1 ? basePix.substring(0, crcIndex) : basePix;
  
  // O formato do campo valor (ID 54) é 54 + tamanho + valor
  const amountStr = amount.toFixed(2);
  const amountField = tlv("54", amountStr);
  
  // Vamos injetar o campo de valor logo antes do código do país (5802BR) que é o padrão
  const tag58Index = body.indexOf("5802BR");
  
  if (tag58Index !== -1) {
    // Verificando se já tem o campo 54 para evitar duplicação (em strings estáticas normais não tem)
    if (!body.substring(0, tag58Index).includes("54" + amountStr.length.toString().padStart(2, "0"))) {
      body = body.substring(0, tag58Index) + amountField + body.substring(tag58Index);
    }
  } else {
    body = body + amountField;
  }
  
  // Adiciona o placeholder do CRC e calcula o novo hash real
  body = body + "6304";
  return body + crc16(body);
}

// O restante foi mantido para retrocompatibilidade
export interface PixPayloadOptions {
  pixKey: string;       // Chave PIX (phone, email, CPF, CNPJ, random)
  amount: number;       // Value in BRL
  merchantName: string; // Max 25 chars
  merchantCity: string; // Max 15 chars
  txId?: string;        // Reference ID, max 25 alphanumeric
  description?: string; // Optional description, max 72 chars
}

export function generatePixPayload({
  pixKey,
  amount,
  merchantName,
  merchantCity,
  txId = "PORTOFIT",
  description = "",
}: PixPayloadOptions): string {
  // Sanitize
  const name = merchantName.substring(0, 25).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  const city = merchantCity.substring(0, 15).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  const tx = (txId || "***").replace(/[^a-zA-Z0-9]/g, "").substring(0, 25) || "***";

  // Merchant Account Information (ID 26)
  const innerMai = [
    tlv("00", "BR.GOV.BCB.PIX"),
    tlv("01", pixKey),
    ...(description ? [tlv("02", description.substring(0, 72))] : []),
  ].join("");
  const mai = tlv("26", innerMai);

  // Additional Data Field (ID 62) → Reference Label (ID 05)
  const adf = tlv("62", tlv("05", tx));

  // Build payload without CRC
  const body = [
    tlv("00", "01"),          // Payload Format Indicator
    tlv("01", "12"),          // Point of Initiation: 12 = multiple-use QR
    mai,
    tlv("52", "0000"),        // Merchant Category Code
    tlv("53", "986"),         // Currency: BRL
    tlv("54", amount.toFixed(2)), // Transaction Amount
    tlv("58", "BR"),          // Country Code
    tlv("59", name),          // Merchant Name
    tlv("60", city),          // Merchant City
    adf,
    "6304",                   // CRC placeholder
  ].join("");

  return body + crc16(body);
}
