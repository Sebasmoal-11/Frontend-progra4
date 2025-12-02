import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AperturaCuentaPage } from './apertura-cuenta.page';

describe('AperturaCuentaPage', () => {
  let component: AperturaCuentaPage;
  let fixture: ComponentFixture<AperturaCuentaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AperturaCuentaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
