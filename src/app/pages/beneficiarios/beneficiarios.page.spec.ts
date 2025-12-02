import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BeneficiariosPage } from './beneficiarios.page';

describe('BeneficiariosPage', () => {
  let component: BeneficiariosPage;
  let fixture: ComponentFixture<BeneficiariosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BeneficiariosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
