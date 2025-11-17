/**
 * Realiza uma requisição fetch, otimizada para enviar e receber JSON.
 * É uma função genérica, permitindo tipar a resposta esperada.
 * @param url A URL do endpoint.
 * @param options Opções do fetch, com uma propriedade adicional 'json' para o corpo da requisição.
 * @returns Uma Promise que resolve para o corpo da resposta JSON, tipado como T.
 */
export async function sendJSON<T>(url: string, options: RequestInit & { json?: any }): Promise<T> {
  const { json, ...fetchOptions } = options;

  // Bloco try/catch para garantir que a preparação da requisição não falhe silenciosamente.
  try {
    if (json) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        'Content-Type': 'application/json',
      };
      // A causa mais provável de um erro silencioso antes do fetch é esta linha.
      // Se o objeto 'json' tiver uma referência circular, por exemplo, ele falhará aqui.
      fetchOptions.body = JSON.stringify(json);
    }
  } catch (err) {
    console.error("Erro fatal ao preparar o corpo da requisição JSON:", err);
    // Lança um novo erro para que a ação em context.ts possa capturá-lo e exibir uma mensagem amigável.
    throw new Error("Falha ao preparar os dados para envio.");
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const error: any = new Error(`HTTP error! status: ${response.status}`);
    try {
      // Tenta anexar o corpo do erro da API para dar mais detalhes.
      error.body = await response.json();
    } catch (e) {
      // Se o corpo do erro não for JSON, anexa como texto.
      error.body = await response.text();
    }
    error.response = response;
    throw error;
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    // A resposta é explicitamente convertida para o tipo T que esperamos.
    return response.json() as Promise<T>;
  }

  // Se a resposta não for JSON, consideramos um erro,
  // pois a função foi projetada para lidar com JSON.
  const text = await response.text();
  throw new Error(`Esperava uma resposta JSON, mas recebeu: ${text}`);
}