import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ServicioForm } from './servicio-form';

describe('ServicioForm', () => {
  let component: ServicioForm;
  let fixture: ComponentFixture<ServicioForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicioForm],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ServicioForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
