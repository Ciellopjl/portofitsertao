import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export type VerificationResult = {
  status: "REAL" | "AGENDADO" | "SUSPEITO" | "ERRO";
  confidence: number;
  reason: string;
  details: {
    amount?: number;
    date?: string;
    transactionId?: string;
  };
};

export async function verifyReceipt(imageUrl: string): Promise<VerificationResult> {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.2-11b-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analise este comprovante de PIX e determine se ele é REAL (pago), AGENDADO (ainda não pago) ou SUSPEITO (sinais de edição/falsificação).
              
              Retorne APENAS um JSON no seguinte formato:
              {
                "status": "REAL" | "AGENDADO" | "SUSPEITO",
                "confidence": 0-100,
                "reason": "Explicação curta do motivo",
                "details": {
                  "amount": 0.00,
                  "date": "data do comprovante",
                  "transactionId": "id da transação"
                }
              }`
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result as VerificationResult;
  } catch (error) {
    console.error("Erro na verificação de IA:", error);
    return {
      status: "ERRO",
      confidence: 0,
      reason: "Não foi possível analisar o comprovante no momento.",
      details: {}
    };
  }
}
