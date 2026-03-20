import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaFormulario } from './pagina-formulario';

describe('PaginaFormulario', () => {
  let component: PaginaFormulario;
  let fixture: ComponentFixture<PaginaFormulario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaFormulario],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginaFormulario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
