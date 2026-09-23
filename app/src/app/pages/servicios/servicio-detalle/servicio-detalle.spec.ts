import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ServicioDetalle } from './servicio-detalle';

describe('ServicioDetalle', () => {
  let component: ServicioDetalle;
  let fixture: ComponentFixture<ServicioDetalle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicioDetalle],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ServicioDetalle);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
