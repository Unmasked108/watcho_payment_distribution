import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Users1Component } from './users1.component';

describe('Users1Component', () => {
  let component: Users1Component;
  let fixture: ComponentFixture<Users1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Users1Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Users1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
