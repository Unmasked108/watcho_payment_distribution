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

import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
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
  showOtpCard = false; // State to show OTP card
  otp = ''; // Variable to store entered OTP
  userData: any = null;

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
      this.http.post('https://asia-south1-ads-ai-101.cloudfunctions.net/watcho2_api/login', { email, password }).subscribe(
        (response: any) => {
          setTimeout(() => { // Add 5 seconds delay
            this.loading = false; // Hide loading spinner after delay
            const { token, id: userId, role, username } = response;
  
            if (token) {
              // Decode token to extract user info
              const decodedToken = this.decodeToken(token);
  
              if (decodedToken) {
                const { id: userId, role } = decodedToken;
  
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
          } else {
            console.error('Token not received in the response');
          }
        }, 1000); // Delay for 1 second
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


  private decodeToken(token: string): any {
    try {
      const base64Payload = token.split('.')[1]; // Get the payload part of the token
      const payload = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/')); // Decode Base64 URL-safe
      return JSON.parse(payload); // Parse the payload as JSON
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
  showSuccessModal = false;
  authToken: string | null = null; // Declare the authToken property

  onSignup(form: any) {
    if (form.valid) {
      const { name, email, mobile, gender, pincode, city, password, confirmPassword } = form.value;

      if (password === confirmPassword) {
        this.loading = true; // Show loading spinner

        // Simulate sending OTP
        this.http.get<{ authToken: string }>(`https://asia-south1-ads-ai-101.cloudfunctions.net/watcho2_api/sendotp?mobile=${mobile}&email=${email}`).subscribe(
          (response) => {
            console.log(response)
            this.loading = false; // Hide spinner
            this.showOtpCard = true; // Show OTP card
            this.authToken = response.authToken; // Save authToken from backend

            this.userData = { name, email, mobile, gender, pincode, city, password }; // Save user data temporarily
          },
          (error) => {
            this.loading = false; // Hide spinner
            console.error('Error sending OTP:', error);
  
            // Display appropriate error messages
            if (error.error?.error === 'Email already exists.') {
              alert('The email you entered is already registered. Please use another email.');
            } else if (error.error?.error === 'Mobile number already exists.') {
              alert('The mobile number you entered is already registered. Please use another number.');
            } else {
              alert('Failed to send OTP. Please try again.');
            }
          }
        );
      } else {
        alert('Passwords do not match.');
      }
    }
  }

  verifyOtp() {
    if (this.otp) {
      this.loading = true; // Show loading spinner

      // Verify OTP API call
      this.http.post('https://asia-south1-ads-ai-101.cloudfunctions.net/watcho2_api/verify', { otp: this.otp, mobile: this.userData.mobile, authToken: this.authToken }).subscribe(
        (response: any) => {
          if (response.resultStatus === 'SUCCESS') {
            // Call signup API if OTP is verified
            this.http.post('https://asia-south1-ads-ai-101.cloudfunctions.net/watcho2_api/register', this.userData).subscribe(
              () => {
                this.loading = false;
                this.showOtpCard = false; // Hide OTP card
                this.showSuccessModal = true; // Show success modal
              },
              (error) => {
                this.loading = false;
                console.error('Signup error:', error);
                alert('Signup failed. Please try again.');
              }
            );
          } else {
            this.loading = false;
            alert('Invalid OTP. Please try again.');
          }
        },
        (error) => {
          this.loading = false;
          console.error('OTP verification error:', error);
          alert('Failed to verify OTP. Please try again.');
        }
      );
    } else {
      alert('Please enter the OTP.');
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
