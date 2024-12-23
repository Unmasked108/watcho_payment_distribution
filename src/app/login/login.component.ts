import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule,HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    CommonModule,
    RouterModule,
    HttpClientModule,
    MatSnackBarModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  isLoginMode: boolean = true;
  loading = false;
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router, private snackBar: MatSnackBar) {}
  showLoginPassword = false;
  showSignupPassword = false;
  showSignupConfirmPassword = false;
  
  toggleLoginPasswordVisibility(): void {
    this.showLoginPassword = !this.showLoginPassword;
  }
  
  toggleSignupPasswordVisibility(): void {
    this.showSignupPassword = !this.showSignupPassword;
  }
  
  toggleSignupConfirmPasswordVisibility(): void {
    this.showSignupConfirmPassword = !this.showSignupConfirmPassword;
  }
  
  toggleMode() {
    this.showSuccessModal = false;
    this.isLoginMode = !this.isLoginMode;
  }

  onLogin(form: any) {
    if (form.valid) {
      const email = form.value.email;
      const password = form.value.password;
  
      this.loading = true; // Show loading spinner
      this.http.post('http://localhost:5000/login', { email, password }).subscribe(
        (response: any) => {
          setTimeout(() => { // Add 5 seconds delay
            this.loading = false; // Hide loading spinner after delay
            const { token, id: userId, role, username } = response;
  
            if (userId && role) {
              // Save user data in localStorage
              localStorage.setItem('token', token);
              localStorage.setItem('userId', userId);
              localStorage.setItem('role', role);
              localStorage.setItem('username', username); // Store username
  
              // Navigate based on role
              this.redirectUserByRole(role);
            } else {
              console.error('User ID or role missing in the response');
            }
          }, 1000); // Delay for 5 seconds (5000 milliseconds)
        },
        (error) => {
          this.loading = false;
          if (error.status === 401) {
            // Check for specific error messages
            if (error.error.message === 'Password is Incorrect') {
              this.errorMessage = 'Password is Incorrect';
            } else if (error.error.message === 'User not found. Please check your email.') {
              this.errorMessage = 'User not found. Please check your email.';
            } else {
              this.errorMessage = 'An error occurred during login. Please try again.';
            }
          } else {
            this.errorMessage = 'An error occurred during login. Please try again.';
          }// Hide spinner if there's an error
          console.error('Login error:', error);
        }
      );
    }
  }
  showSuccessModal = false;

  onSignup(form: any) {
    if (form.valid) {
      const { name, email, mobile, password, confirmPassword } = form.value;
  
      if (password === confirmPassword) {
        this.loading = true; // Show loading spinner
        this.http.post('http://localhost:5000/register', { name, email,mobile , password }).subscribe(
          () => {
            setTimeout(() => { // Add 5 seconds delay
              this.loading = false; // Hide loading spinner after delay
              this.showSuccessModal = true; // Show success modal
            },1000); // Delay for 5 seconds (5000 milliseconds)
          },
          (error) => {
            this.loading = false; // Hide spinner if there's an error
            console.error('Signup error:', error);
            alert('Signup failed. Please try again.');
          }
        );
      } else {
        this.loading = false;
        alert('Passwords do not match.');
      }
    }
  }
 
  
  
  redirectToLogin() {
    this.showSuccessModal = false; // Hide the modal
    this.router.navigate(['/login']); // Redirect to login
  }
  private redirectUserByRole(role: string) {
    switch (role) {
      case 'Admin':
        this.router.navigate(['/layout']); // Admin layout
        break;
      case 'TeamLeader':
        this.router.navigate(['/TeamsManager']); // Team manager page
        break;
      default:
        this.router.navigate(['/users']); // Default for team members
        break;
    }
  }
}
