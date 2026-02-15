import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonSegment,
  IonSegmentButton,
  IonText,
  IonSpinner,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';

type AuthMode = 'login' | 'register';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonSegment,
    IonSegmentButton,
    IonText,
    IonSpinner,
  ],
})
export class AuthPage implements OnInit, OnDestroy {
  mode: AuthMode = 'login';
  form: FormGroup;
  loading = false;
  errorMessage: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  ngOnInit(): void {
    this.setMode('login');
    // Si ya está logueado (sesión restaurada), ir a inicio
    this.authService.currentUser
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        if (user) {
          this.router.navigate(['/start'], { replaceUrl: true });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSegmentChange(event: CustomEvent): void {
    const value = event.detail?.value as AuthMode;
    if (value) this.setMode(value);
  }

  setMode(mode: AuthMode): void {
    this.mode = mode;
    this.errorMessage = null;
    const nameControl = this.form.get('name');
    if (mode === 'login') {
      nameControl?.clearValidators();
      nameControl?.setValue('');
    } else {
      nameControl?.setValidators([Validators.required, Validators.minLength(2)]);
    }
    nameControl?.updateValueAndValidity();
  }

  async submit(): Promise<void> {
    this.errorMessage = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, email, password } = this.form.getRawValue();
    this.loading = true;

    try {
      if (this.mode === 'login') {
        const result = await this.authService.login(email, password);
        if (result.success) {
          this.router.navigate(['/start'], { replaceUrl: true });
        } else {
          this.errorMessage = result.message;
        }
      } else {
        const result = await this.authService.register(name, email, password);
        if (result.success) {
          this.router.navigate(['/start'], { replaceUrl: true });
        } else {
          this.errorMessage = result.message;
        }
      }
    } finally {
      this.loading = false;
    }
  }
}
