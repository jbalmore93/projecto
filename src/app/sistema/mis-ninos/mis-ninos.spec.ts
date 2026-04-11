import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisNinos } from './mis-ninos';

describe('MisNinos', () => {
  let component: MisNinos;
  let fixture: ComponentFixture<MisNinos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisNinos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisNinos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
