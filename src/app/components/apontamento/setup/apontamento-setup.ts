import { Component, OnInit, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PoModule, PoNotificationService, PoSelectOption } from '@po-ui/ng-components';
import { ApontamentoApiService } from '../../../services/apontamento-api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-apontamento-setup',
  standalone: true,
  imports: [FormsModule, PoModule],
  templateUrl: './apontamento-setup.html',
  styleUrls: ['./apontamento-setup.css'],
})
export class ApontamentoSetupComponent implements OnInit {
  private router = inject(Router);
  private apiService = inject(ApontamentoApiService);
  private notification = inject(PoNotificationService);

  operatorName = '';

  printersOptions: PoSelectOption[] = [];
  labelsOptions: PoSelectOption[] = [];

  defaultPrinter = '';
  defaultLabel = '';
  soundEnabled = true;
  autoPrint = false;

  ngOnInit(): void {
    const operatorData = sessionStorage.getItem('setupOperator');
    if (!operatorData) {
      this.router.navigate(['/apontamento/setup-login']);
      return;
    }

    const operator = JSON.parse(operatorData);
    this.operatorName = operator.name || operator.code;

    this.loadPreferences();
    this.loadPrinters();
    this.loadLabels();
  }

  async loadPrinters(): Promise<void> {
    try {
      const printers = await firstValueFrom(this.apiService.fetchImpressoras());
      this.printersOptions = (printers || []).map((p) => ({
        label: p.name,
        value: p.zplId || p.id,
      }));
    } catch (error) {
      console.error('Erro ao carregar impressoras:', error);
    }
  }

  async loadLabels(): Promise<void> {
    try {
      const labels = await firstValueFrom(this.apiService.fetchEtiquetas());
      this.labelsOptions = (labels || []).map((l) => ({
        label: l.name,
        value: l.id,
      }));
    } catch (error) {
      console.error('Erro ao carregar etiquetas:', error);
    }
  }

  loadPreferences(): void {
    const prefs = localStorage.getItem('setupPreferences');
    if (prefs) {
      const preferences = JSON.parse(prefs);
      this.defaultPrinter = preferences.defaultPrinter || '';
      this.defaultLabel = preferences.defaultLabel || '';
      this.soundEnabled = preferences.soundEnabled !== false;
      this.autoPrint = preferences.autoPrint === true;
    }
  }

  savePreferences(): void {
    const preferences = {
      defaultPrinter: this.defaultPrinter,
      defaultLabel: this.defaultLabel,
      soundEnabled: this.soundEnabled,
      autoPrint: this.autoPrint,
    };
    localStorage.setItem('setupPreferences', JSON.stringify(preferences));
    this.notification.success('Preferências salvas com sucesso');
  }

  logout(): void {
    sessionStorage.removeItem('setupOperator');
    this.router.navigate(['/apontamento']);
  }
}
