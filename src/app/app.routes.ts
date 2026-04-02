import { Routes } from '@angular/router';
import { ConsultaDocumento } from './components/consulta-documento/consulta-documento';
import { FornecedorComponent } from './components/fornecedor/fornecedor';
import { UploadComponent } from './components/upload/upload.component';
import { ResultadoComponent } from './components/resultado/resultado.component';
import { ClienteComponent } from './components/cliente/cliente';
import { ProdutoComponent } from './components/produto/produto';
import { UploadClienteComponent } from './components/upload-cliente/upload-cliente.component';
import { UploadProdutoComponent } from './components/upload-produto/upload-produto.component';
import { PedidoVendaComponent } from './components/pedido-venda/pedido-venda';

export const routes: Routes = [
    { path: '', redirectTo: 'consulta', pathMatch: 'full' },
    { path: 'consulta', component: ConsultaDocumento },
    { path: 'fornecedor', component: FornecedorComponent },
    { path: 'cliente', component: ClienteComponent },
    { path: 'upload-cliente', component: UploadClienteComponent },
    { path: 'produto', component: ProdutoComponent },
    { path: 'upload-produto', component: UploadProdutoComponent },
    { path: 'pedido-venda', component: PedidoVendaComponent },
    { path: 'upload', component: UploadComponent },
    { path: 'resultado', component: ResultadoComponent },
];
