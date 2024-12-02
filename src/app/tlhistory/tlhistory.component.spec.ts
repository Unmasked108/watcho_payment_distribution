import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLHistoryComponent } from './tlhistory.component';

describe('TLHistoryComponent', () => {
  let component: TLHistoryComponent;
  let fixture: ComponentFixture<TLHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLHistoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TLHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
