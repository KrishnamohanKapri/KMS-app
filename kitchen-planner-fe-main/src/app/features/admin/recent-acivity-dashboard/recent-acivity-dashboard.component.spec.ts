import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentAcivityDashboardComponent } from './recent-acivity-dashboard.component';

describe('RecentAcivityDashboardComponent', () => {
  let component: RecentAcivityDashboardComponent;
  let fixture: ComponentFixture<RecentAcivityDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentAcivityDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecentAcivityDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
