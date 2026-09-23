import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiposEspecialidadList } from './tipoEspecialidad-list';

describe('TiposEspecialidadList', () => {
  let component: TiposEspecialidadList;
  let fixture: ComponentFixture<TiposEspecialidadList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TiposEspecialidadList],

      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TiposEspecialidadList);
    component = fixture.componentInstance;

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});