import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransferenciasPage } from './transferencias.page';

describe('TransferenciasPage', () => {
  let component: TransferenciasPage;
  let fixture: ComponentFixture<TransferenciasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferenciasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
