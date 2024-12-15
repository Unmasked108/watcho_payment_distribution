import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { MatPaginatorModule } from '@angular/material/paginator'; // Import MatPaginatorModule
import { MatTableModule } from '@angular/material/table'; // Import MatTableModule
import { MatSortModule } from '@angular/material/sort'; // Import MatSortModule
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table'; // Import MatTableDataSource
import { ViewChild } from '@angular/core';


@Component({
  selector: 'app-users',
  standalone: true,
  imports: [MatIconModule, MatCardModule, FormsModule,MatPaginatorModule,MatTableModule,MatSortModule,CommonModule,MatSelectModule], // Include FormsModule here
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  username: string = ''; 
  initials: string = ''; 
  isDarkMode: boolean = false; 
  paginatedData: any[] = []; 
  leadIds: string[] = []; 
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalRecords: number = 0;
  allocatedLeadsCount: number = 0; // Updated to fetch dynamically

  dataSource = new MatTableDataSource<any>(this.paginatedData);


  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    
    this.isDarkMode = localStorage.getItem('theme') === 'dark'; 
    this.username = localStorage.getItem('username') || ''; 
    this.initials = this.getInitials(this.username); // Generate initials from username
    this.fetchAllocatedLeads(); // Fetch allocated leads count
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase(); // Ensure initials are uppercase
  }
   taskCompleted = false;

  downloadLeads() {
    // Implement logic for downloading leads (e.g., triggering a download of a file)
  }

 
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      const file = input.files[0];
      console.log('File selected:', file);
    } else {
      console.error('No file selected or input invalid.');
    }
  }
  

  // Pagination related variables

  displayedColumns: string[] = ['orderId', 'paymentStatus', 'allocationTime','allocationDate'];


  paymentModes: string[] = ['PhonepeW', 'Upi'];

  // Event triggered when payment mode is changed
  onPaymentModeChange(element: any): void {
    console.log(`Payment mode updated for Order ID ${element.orderId}:`, element.paymentMode);
    // Additional logic like saving the updated value to the backend can go here
  }
  fetchAllocatedLeads(): void {
    const token = localStorage.getItem('token'); // Retrieve the token
    const loggedInUserId = localStorage.getItem('userId'); // Retrieve the userId from localStorage
  
    if (!token) {
      console.error('Token not found in localStorage.');
      return;
    }
  
    if (!loggedInUserId) {
      console.error('User ID not found in localStorage.');
      return;
    }
  
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // Include the token
    });
  
    this.http
      .get<any>('http://localhost:5000/api/lead-allocations', { headers })
      .subscribe({
        next: (response) => {
          console.log('Lead Allocations Response:', response);
  
          const currentMember = response.find(
            (alloc: any) => alloc.memberId._id === loggedInUserId
          );
  
          if (currentMember) {
            this.leadIds = currentMember.leadIds || [];
            this.allocatedLeadsCount = this.leadIds.length;
            this.fetchOrders(); // Fetch orders based on leads
          } else {
            console.warn('No allocations found for the logged-in user.');
          }
        },
        error: (error) => {
          console.error('Error fetching allocated leads:', error);
        },
      });
  }
  
  
  fetchOrders(): void {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });
  
    const leadIdsQuery = this.leadIds.join(',');
    const url = `http://localhost:5000/api/orders?leadIds=${leadIdsQuery}`;
  
    this.http.get<any>(url, { headers }).subscribe({
      next: (response) => {
        this.paginatedData = response.data.map((order: any) => {
          const updatedAt = order.updatedAt ? new Date(order.updatedAt) : null;
          return {
            orderId: order.orderId || 'N/A',
            link: order.link || '#', // Fallback to '#' if no link is provided
            paymentStatus: order.paymentStatus || 'Unpaid',
            paymentMode: order.paymentModeBy || 'N/A', // Adjusted for 'paymentModeBy'
            allocationDate: updatedAt ? updatedAt.toLocaleDateString() : 'N/A', // Format to show date
            allocationTime: updatedAt ? updatedAt.toLocaleTimeString() : 'N/A', // Format to show time
          };
        });
  
        this.dataSource.data = this.paginatedData;
        console.log('Orders Response:', response);
      },
      error: (error) => {
        console.error('Error fetching orders:', error);
      },
    });
  }
  
  
  currentTask = {
    paymentStatus: 'Paid', // Default status or update dynamically
    leadId: '',           // Populate this based on the specific lead/task
  };
  
  savePaymentStatus(): void {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });
  
    // Create an array of payloads with orderId and paymentStatus for each order that has been modified
    const payload = this.paginatedData.map((order: any) => ({
      orderId: order.orderId,  // Order ID
      paymentStatus: order.paymentStatus,  // Updated payment status
    }));
    console.log('Payload being sent to the server:', payload);

    // Send all updates in one request
    this.http
      .patch('http://localhost:5000/api/orders/payment-status', { orders: payload }, { headers })
      .subscribe({
        next: (response) => {
          console.log('Payment status updated:', response);
        },
        error: (error) => {
          console.error('Error updating payment status:', error);
        },
      });
  }
  
  
  
  

  onPageChange(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.itemsPerPage = event.pageSize;
    this.fetchOrders(); // Fetch paginated data on page change
  }
}

