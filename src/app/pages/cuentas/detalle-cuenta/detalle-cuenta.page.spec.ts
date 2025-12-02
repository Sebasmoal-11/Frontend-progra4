import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleCuentaPage } from './detalle-cuenta.page';

describe('DetalleCuentaPage', () => {
  let component: DetalleCuentaPage;
  let fixture: ComponentFixture<DetalleCuentaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleCuentaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
