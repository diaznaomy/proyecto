import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ServiciosList } from './servicios-list';

describe('ServiciosList', () => {
  let component: ServiciosList;
  let fixture: ComponentFixture<ServiciosList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiciosList],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiciosList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
