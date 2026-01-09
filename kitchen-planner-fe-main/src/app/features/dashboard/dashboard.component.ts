import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ChefManagementApi, CustomerManagementApi, DashboardApi, DashboardStats, IncomeStats, NotificationsApi, OrderStats, PaymentsApi } from '../../api/api-kms-planner-masterdata';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { UserService } from '../../shared/user.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';

 type MonthName =
  | "January" | "February" | "March" | "April"
  | "May" | "June" | "July" | "August"
  | "September" | "October" | "November" | "December";

@Component({
  standalone: true,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule,NavbarComponent,RouterModule,
    MatCardModule,
    MatGridListModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    BaseChartDirective   ],
    providers: [
    provideCharts(withDefaultRegisterables()),
  ],
    
})
export class DashboardComponent implements OnInit {
  dashboardStats: any = {};
  paymentsStats: any = {};
  customerStats: any = {};
  incomeChartData: ChartData<'line'> = {
    datasets: []
  }

  orderChartData: ChartData<'line'> = {
    datasets: []
  };

  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        display: true   // 👈 controls the legend instead of [legend] binding
      }
    }
  };
  constructor(private readonly dashoardApi: DashboardApi, private readonly customerApi: CustomerManagementApi,
    private readonly paymetApi: PaymentsApi, private readonly chefApi: ChefManagementApi, private readonly userService: UserService,
  ){

  }

   ngOnInit(): void {
    this.getDashboardIncomeStats();
    this.getDashboardOrderStats();
    this.getDashboardStats();
    this.getCustomerStats();
    this.getPaymentStats();
    if(this.userService.getUserInfo()?.role === 'chef'){
      this.chefApi.chefAttendanceMarkGet().subscribe({
        next: (response:any) => {
          console.log('Attendance marked:', response);
        }
        , error: (error) => {
          console.error('Error marking attendance:', error);
        }
      })
    }
  }

  getDashboardStats(){
    this.dashoardApi.dashboardGet().subscribe({
      next: (response:any) => {
        this.dashboardStats = response.data;
        
      }
      , error: (error) => {
        console.error('Error fetching dashboard stats:', error);
      }
    });
  }

  getDashboardIncomeStats(){
    this.dashoardApi.dashboardIncomeGet().subscribe({
      next: (response:any) => {
        this.incomeChartData = {
          labels: this.transformMonthlyData(response.data).labels,
          datasets: [{ data: this.transformMonthlyData(response.data).data, label: 'Income' }]
        };
      }
      , error: (error) => {
        console.error('Error fetching dashboard income stats:', error);
      }
    });
  }

  getDashboardOrderStats(){
    this.dashoardApi.dashboardOrdersGet().subscribe({
      next: (response: any) => { 
        this.orderChartData = {
          labels: this.transformMonthlyData(response.data).labels,
          datasets: [{ data: this.transformMonthlyData(response.data).data, label: 'Orders' }]
        };
      }
      , error: (error) => {
        console.error('Error fetching dashboard order stats:', error);
      }
    }); 
  }

  getCustomerStats(){
    this.customerApi.customerStatsGet().subscribe({
      next: (response: any) => {
        this.customerStats = response.data;
        // Process customer stats if needed
      },
      error: (error) => {
        console.error('Error fetching customer stats:', error);
      }
    });
  }

private transformMonthlyData(
  monthlyArray: { month: MonthName; total: number }[]
): { labels: string[]; data: number[] } {
  const monthMap: Record<MonthName, string> = {
    January: "Jan",
    February: "Feb",
    March: "Mar",
    April: "Apr",
    May: "May",
    June: "Jun",
    July: "Jul",
    August: "Aug",
    September: "Sep",
    October: "Oct",
    November: "Nov",
    December: "Dec",
  };

  return {
    labels: monthlyArray.map(item => monthMap[item.month]),
    data: monthlyArray.map(item => item.total),
  };
}

  getPaymentStats(){
    this.paymetApi.paymentStatsGet().subscribe({
      next: (response:any) => {
        this.paymentsStats = response.data;
        console.log('Dashboard Stats:', response);
      }
      , error: (error) => {
        console.error('Error fetching dashboard stats:', error);
      }
    });
  }
  
}
