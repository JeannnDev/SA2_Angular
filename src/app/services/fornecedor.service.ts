import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { AdvplField, AdvplRequest, Fornecedor } from '../models/fornecedor.model';
// O usuário solicitou não usar environment.ts e consultar do .env
// No Angular com SSR (Node), o process existe no servidor, mas não no navegador.
// Usamos uma checagem segura para evitar o erro "process is not defined".
const getEnv = (key: string, defaultValue: string): string => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key]!;
  }
  return defaultValue;
};

const CONFIG = {
  // Se a URL no .env já vier com o recurso /WsFornecedor/, nós limpamos para não duplicar
  apiBaseUrl: getEnv('apiBaseUrl', 'http://localhost:8080/rest').replace(/\/WsFornecedor\/?$/, '').replace(/\/$/, ''),
  authorization: getEnv('Authorization', 'YWRtaW46amVhbg=='), 
  empresa: getEnv('EMPRESA', '01'),
  filial: getEnv('FILIAL', '99')
};

@Injectable({
  providedIn: 'root'
})
export class FornecedorService {
  private http = inject(HttpClient);
  // Base do recurso no Protheus
  private resource = `${CONFIG.apiBaseUrl}/WsFornecedor`; 
  
  // -- ESTADO REATIVO (Signals) --
  private fornecedoresSignal = signal<Fornecedor[]>([]);
  private loadingSignal = signal<boolean>(false);
  private messageSignal = signal<string>('');

  readonly fornecedores = computed(() => this.fornecedoresSignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly message = computed(() => this.messageSignal());

  private getHeaders() {
    // Garante que o header Authorization comece com "Basic "
    const auth = CONFIG.authorization.trim();
    const finalAuth = auth.startsWith('Basic ') ? auth : `Basic ${auth}`;

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': finalAuth,
      'EMPRESA': CONFIG.empresa.trim(),
      'FILIAL': CONFIG.filial.trim()
    });
  }

  /**
   * Traz os fornecedores (GET) - Usando responseType 'text' para evitar erro de JSON inválido
   */
  async getAll(cCgc: string = ''): Promise<void> {
    this.loadingSignal.set(true);
    this.messageSignal.set('');
    const url = `${this.resource}/GET${cCgc ? `?cCgc=${cCgc}` : ''}`;
    
    try {
      const rawResponse = await lastValueFrom(
        this.http.get(url, { headers: this.getHeaders(), responseType: 'text' })
      );
      
      let response: any;
      try {
        response = JSON.parse(rawResponse);
      } catch (e) {
        // Se falhar o parse, assumimos que é uma mensagem direta (ex: Fornecedor não encontrado)
        this.messageSignal.set(rawResponse.trim());
        this.fornecedoresSignal.set([]);
        return;
      }
      
      let list: Fornecedor[] = [];
      if (response?.response) this.messageSignal.set(response.response);

      if (response?.success && response?.data) {
        const item = this.mapFromAdvpl(response.data);
        list = item ? [item] : [];
      } else if (response?.Data) {
        const dataArr = Array.isArray(response.Data) ? response.Data : [response.Data];
        list = dataArr.map((i: any) => this.mapFromAdvpl(i)!);
      }
      
      this.fornecedoresSignal.set(list);
    } catch (error: any) {
      this.fornecedoresSignal.set([]);
      this.extractError(error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Cria um novo fornecedor (POST)
   */
  async create(fornecedor: Fornecedor): Promise<void> {
    this.loadingSignal.set(true);
    const url = `${this.resource}/POST`;
    const body = this.mapToAdvpl(fornecedor);
    
    try {
      await lastValueFrom(
        this.http.post(url, body, { headers: this.getHeaders(), responseType: 'text' })
      );
      await this.getAll();
    } catch (error: any) {
      this.extractError(error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Altera (PUT)
   */
  async update(fornecedor: Fornecedor): Promise<void> {
    this.loadingSignal.set(true);
    const url = `${this.resource}/PUT${fornecedor.A2_CGC ? `?cCgc=${fornecedor.A2_CGC}` : ''}`;
    const body = this.mapToAdvpl(fornecedor);
    
    try {
      await lastValueFrom(
        this.http.put(url, body, { headers: this.getHeaders(), responseType: 'text' })
      );
      await this.getAll();
    } catch (error: any) {
      this.extractError(error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Exclui (DELETE)
   */
  async delete(cCgc: string): Promise<void> {
    this.loadingSignal.set(true);
    const url = `${this.resource}/DELETE${cCgc ? `?cCgc=${cCgc}` : ''}`;
    
    try {
      await lastValueFrom(
        this.http.delete(url, { headers: this.getHeaders(), responseType: 'text' })
      );
      this.fornecedoresSignal.update(list => list.filter(f => f.A2_CGC !== cCgc));
    } catch (error: any) {
      this.extractError(error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Centraliza a extração de mensagens de erro e limpeza de JSONs concatenados
   */
  private extractError(error: any) {
    // Procura o texto da resposta no corpo do erro (usando responseType: 'text')
    let raw = "";

    if (typeof error.error === 'string') {
      raw = error.error;
    } else if (error.error?.response) {
      raw = error.error.response;
    } else if (error.message) {
      raw = error.message;
    }

    let msg = "";

    if (raw) {
      // Regex que pega TUDO que vem antes do primeiro caractere {
      // Isso corta fora qualquer JSON que o Protheus anixe à mensagem
      const match = raw.match(/^([^{]+)/);
      msg = match ? match[1].trim() : raw.trim();
    }

    // Filtra mensagens genéricas de sistema (em inglês) para não "poluir" o usuário
    const isGeneric = 
      msg.toLowerCase().includes('internal server error') || 
      msg.toLowerCase().includes('http failure response') ||
      msg.toLowerCase().includes('unexpected token');

    if (msg && !isGeneric) {
      this.messageSignal.set(msg);
    } else {
      this.messageSignal.set("");
    }
  }

  // -- AUXILIARES DE MAPEAMENTO --

  private mapToAdvpl(fornecedor: Fornecedor): AdvplRequest {
    const data: AdvplField[] = Object.entries(fornecedor).map(([key, value]) => ({
      campo: key,
      tipo: typeof value === 'number' ? 'N' : 'C',
      valor: String(value)
    }));
    return { Data: data };
  }

  /**
   * Transforma [["A2_COD", "111"], ["A2_NOME", "..."]] em Objeto
   */
  private mapFromAdvpl(data: any): Fornecedor | null {
    if (!data || !Array.isArray(data)) return null;

    const obj: any = {};

    data.forEach(item => {
      // Se for o formato [["CAMPO", "VALOR"], ...]
      if (Array.isArray(item) && item.length === 2) {
        const [campo, valor] = item;
        obj[campo] = typeof valor === 'string' ? valor.trim() : valor;
      } 
      // Se for o formato { campo: "...", valor: "..." }
      else if (item.campo && item.valor !== undefined) {
        obj[item.campo] = typeof item.valor === 'string' ? item.valor.trim() : item.valor;
      }
    });

    return Object.keys(obj).length > 0 ? obj : null;
  }
}
