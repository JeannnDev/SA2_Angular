export interface AdvplField {
  campo: string;
  tipo: string;
  valor: string | number;
}

export interface AdvplRequest {
  Data: AdvplField[];
}

export interface Fornecedor {
  A2_COD?: string;
  A2_LOJA?: string;
  A2_NOME?: string;
  A2_CGC?: string;
  A2_END?: string;
  A2_NREDUZ?: string;
  A2_TIPO?: string;
  A2_EST?: string;
  A2_MUN?: string;
  A2_EMAIL?: string;
  A2_TEL?: string;
  [key: string]: any;
}
