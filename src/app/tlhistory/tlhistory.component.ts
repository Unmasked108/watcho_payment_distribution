import { ChangeDetectionStrategy, Component ,OnInit} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule,HttpHeaders} from '@angular/common/http';
import moment from 'moment';
import { RouterLink, RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-tlhistory',
  standalone: true,
  imports: [    
    MatCardModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatIconModule,
    MatInputModule,
    MatTableModule,
    FormsModule,
    CommonModule,
    HttpClientModule,
  RouterLink,
RouterOutlet],
  templateUrl: './tlhistory.component.html',
  styleUrl: './tlhistory.component.scss'
})
export class TLHistoryComponent implements OnInit {
  username: string = '';
  initials: string = '';
  isDarkMode: boolean = false;
  selectedDate: Date = new Date();
  displayedColumns: string[] = [ 'orderId', 'orderLink','memberName', 'paymentStatus', 'completionDate'];
  dataSource = new MatTableDataSource<any>([]);
  teamMembers: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.isDarkMode = localStorage.getItem('theme') === 'dark';
    this.username = localStorage.getItem('username') || '';
    this.initials = this.getInitials(this.username);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  searchByDate(): void {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });
  
    console.log('Selected Date:', this.selectedDate);
  
    // Format the selected date to YYYY-MM-DD
    const formattedDate = moment(this.selectedDate).format('YYYY-MM-DD');
    console.log('Formatted Date:', formattedDate); // Debugging
  
    // Fetch results for the selected date
    this.http
      .get<any[]>(allocationsUrl, { headers, params: { date: formattedDate } })
      .subscribe({
        
        next: (allocations: any[]) => {
          const leadIds = allocations.flatMap((allocation) => allocation.leadIds);
          const memberMap = new Map(
            allocations.map((allocation) => [
              allocation.leadIds.join(','), 
              allocation.memberId._id, // Use populated memberId
            ])
            
          );
          console.log('Allocations:', allocations);

  
          const userMap = new Map(
            allocations.map((allocation) => [
              allocation.memberId._id,
              allocation.memberId.name, // Use populated member name
            ])
          );
  
          // Fetch orders using leadIds
          this.http
            .get<any>(`  https://asia-south1-ads-ai-101.cloudfunctions.net/watcho1_apiapi/orders`, {
              headers,
              params: { leadIds: leadIds.join(',') },
            })
            .subscribe({
              next: (response: any) => {
                const orders = response.data;
  
                // Map member names to orders and set up table data
                this.teamMembers = orders.map((order: any) => {
                  const memberId = memberMap.get(order._id);
                  return {
                    orderId: order._id,
                    membername: userMap.get(memberId),
                    paymentstatus: order.paymentStatus, // Adjusted for schema field name
                    paymentMethod: order.paymentModeBy || 0, // Add default value if null
                    completedTime: order.completedTime || 'N/A', // Add default if null
                    selected: false,
                  };
                });
  
          // Update the dataSource with the new data
          this.dataSource.data = this.teamMembers;
        },
        error: (err) => console.error('Error fetching results:', err),
      });
  }
  
  
}