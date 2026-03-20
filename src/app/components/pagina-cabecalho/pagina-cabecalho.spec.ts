import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaCabecalho } from './pagina-cabecalho';

describe('PaginaCabecalho', () => {
  let component: PaginaCabecalho;
  let fixture: ComponentFixture<PaginaCabecalho>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaCabecalho],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginaCabecalho);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
