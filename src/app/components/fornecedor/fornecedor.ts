import { Component, OnInit, PLATFORM_ID, inject, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FornecedorService } from '../../services/fornecedor.service';
import { FormsModule } from '@angular/forms';
import {
    PoPageModule,
    PoDynamicModule,
    PoPageAction,
    PoDynamicFormField,
    PoNotificationService,
    PoButtonModule,
    PoLoadingModule,
    PoListViewModule,
    PoDividerModule,
} from '@po-ui/ng-components';
import { Fornecedor } from '../../models/fornecedor.model';

@Component({
    selector: 'app-fornecedor',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        PoPageModule,
        PoDynamicModule,
        PoButtonModule,
        PoLoadingModule,
        PoListViewModule,
        PoDividerModule,
    ],
    templateUrl: './fornecedor.html',
    styleUrls: ['./fornecedor.css']
})
export class FornecedorComponent implements OnInit {
    private notification = inject(PoNotificationService);
    private fornecedorService = inject(FornecedorService);
    private platformId = inject(PLATFORM_ID);

    // Signals expostos pelo Service (Reativo e Rápido)
    fornecedores = this.fornecedorService.fornecedores;
    isLoading = this.fornecedorService.loading;
    
    // Dados para o formulário
    fornecedor: Fornecedor = {};
    isEditing = false;

    pageActions: PoPageAction[] = [
        { label: 'Novo', action: this.prepareCreate.bind(this), icon: 'po-icon-plus', disabled: () => !this.isEditing && Object.keys(this.fornecedor).length > 0 },
        { label: 'Salvar', action: this.save.bind(this), icon: 'po-icon-ok', disabled: () => Object.keys(this.fornecedor).length === 0 },
        { label: 'Cancelar', action: this.cancel.bind(this) }
    ];

    fields: PoDynamicFormField[] = [
        { property: 'A2_COD', label: 'Código', gridColumns: 2, required: false, disabled: true },
        { property: 'A2_LOJA', label: 'Loja', gridColumns: 2, required: true },
        { property: 'A2_CGC', label: 'CPF / CNPJ', gridColumns: 4, required: true, mask: '99.999.999/9999-99' },
        { property: 'A2_NOME', label: 'Nome / Razão Social', gridColumns: 8, required: true },
        { property: 'A2_NREDUZ', label: 'Nome Fantasia', gridColumns: 6 },
        { property: 'A2_TIPO', label: 'Tipo', gridColumns: 2, options: [
            { label: 'Jurídica', value: 'J' },
            { label: 'Física', value: 'F' }
        ]},
        { property: 'A2_EST', label: 'Estado (UF)', gridColumns: 2 },
        { property: 'A2_MUN', label: 'Município', gridColumns: 12 },
        { property: 'A2_END', label: 'Endereço', gridColumns: 12 }
    ];

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.loadFornecedores();
        }
    }

    async loadFornecedores() {
        try {
            // Busca inicial (pode ser vazio ou com filtro)
            await this.fornecedorService.getAll();
        } catch (error) {
            this.notification.error('Falha ao carregar fornecedores do Web Service.');
        }
    }

    prepareCreate() {
        this.fornecedor = {};
        this.isEditing = false;
    }

    prepareEdit(item: Fornecedor) {
        this.fornecedor = { ...item };
        this.isEditing = true;
        // Rola para o topo ou foca no form se necessário
    }

    async save() {
        try {
            if (this.isEditing) {
                await this.fornecedorService.update(this.fornecedor);
                this.notification.success('Fornecedor atualizado com sucesso!');
            } else {
                await this.fornecedorService.create(this.fornecedor);
                this.notification.success('Fornecedor criado com sucesso!');
            }
            this.fornecedor = {};
            this.isEditing = false;
        } catch (error) {
            this.notification.error('Erro ao processar requisição no Advpl.');
        }
    }

    async delete(item: Fornecedor) {
        if (!item.A2_CGC) return;
        
        try {
            await this.fornecedorService.delete(item.A2_CGC);
            this.notification.warning('Fornecedor excluído.');
        } catch (error) {
            this.notification.error('Não foi possível excluir.');
        }
    }

    cancel() {
        this.fornecedor = {};
        this.isEditing = false;
        this.notification.information('Operação cancelada.');
    }
}
