import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaRodape } from './pagina-rodape';

describe('PaginaRodape', () => {
  let component: PaginaRodape;
  let fixture: ComponentFixture<PaginaRodape>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaRodape],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginaRodape);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
