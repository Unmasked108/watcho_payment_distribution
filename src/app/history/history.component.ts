import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatIconModule,
    MatInputModule,
    MatTableModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryComponent {
  selectedDate: Date = new Date(); // Default to current date
  displayedColumns: string[] = [
    'assignedTeams',
    'allocatedDate',
    'completionDate',
    'orderId',
    'completionStatus',
  ];

  data = [
    {
      assignedTeams: 'Team A',
      allocatedDate: new Date('2024-11-23'),
      completionDate: new Date('2024-11-24'),
      orderId: 'ORD12345',
      completionStatus: 'Completed',
    },
    {
      assignedTeams: 'Team B',
      allocatedDate: new Date('2024-11-24'),
      completionDate: new Date('2024-11-25'),
      orderId: 'ORD67890',
      completionStatus: 'Pending',
    },
    {
      assignedTeams: 'Team C',
      allocatedDate: new Date('2024-11-24'),
      completionDate: new Date('2024-11-27'),
      orderId: 'ORD11112',
      completionStatus: 'In Progress',
    },
  ];

  filteredData = [...this.data]; // Initialize with all data

  searchByDate(): void {
    // Filter the data based on the selected date
    const searchDate = this.selectedDate.toDateString();
    this.filteredData = this.data.filter(
      (item) => item.allocatedDate.toDateString() === searchDate
    );
  }
}
