import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerCreate, CustomerManagementApi, EntitiesApi, UserProfile } from '../../../api/api-kms-planner-masterdata';
import { NotificationService } from '../../../shared/notification.service';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../../shared/user.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { LoaderService } from '../../../shared/loader/loader.service';
import { NavbarComponent } from "../../../shared/navbar/navbar.component";

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  templateUrl: './customer-profile.component.html',
  styleUrls: ['./customer-profile.component.css'],
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSelectModule,
    CurrencyPipe,
    CommonModule,
    NavbarComponent
  ]
})
export class CustomerProfileComponent implements OnInit {
  billingForm!: FormGroup;
  preferencesForm!: FormGroup;
  userForm!: FormGroup;
  loading = false;
  dietaryOptions = ["vegetarian", "vegan", "gluten-free", "dairy-free", "nut-free", "halal", "kosher", "none"];
  allergens: any[] = [];
  paymentOptions = ["card", "paypal", "stripe", "cash"];
  countries = [
    "Austria",
    "Belgium",
    "Czech Republic",
    "Denmark",
    "Estonia",
    "Finland",
    "France",
    "Germany",
    "Greece",
    "Hungary",
    "Iceland",
    "Italy",
    "Latvia",
    "Liechtenstein",
    "Lithuania",
    "Luxembourg",
    "Malta",
    "Netherlands",
    "Norway",
    "Poland",
    "Portugal",
    "Slovakia",
    "Slovenia",
    "Spain",
    "Sweden",
    "Switzerland"
  ];
  loyaltyPoints = 0;
  totalOrders = 0;
  totalSpent = 0;
  private userInfo: UserProfile | null = null;
  private customerId: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private customerApi: CustomerManagementApi,
    private notificationService: NotificationService,
    private userService: UserService,
    private loadingService: LoaderService,
    private entitiesService: EntitiesApi,
  ) { }

  ngOnInit() {
    this.userInfo = this.userService.getUserInfo();
    this.createForms();
    if (this.userInfo && this.userInfo._id) {
      this.getCustomerDetail(this.userInfo._id);
    }
    this.fetchAllergens();
  }

  private createForms() {
    this.billingForm = this.fb.group({
      firstName: [this.userInfo?.firstName, Validators.required],
      lastName: [this.userInfo?.lastName, Validators.required],
      email: [{ value: this.userInfo?.email, disabled: false }, [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: this.fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        zipCode: ['', Validators.required],
        country: ['', Validators.required]
      }),
      company: [''],
      taxId: ['']
    });

    this.preferencesForm = this.fb.group({
      dietaryRestrictions: this.fb.array(this.dietaryOptions.map(() => this.fb.control(false))),
      allergies: [[], Validators.required],
      preferredPaymentMethod: ['', Validators.required],
      newsletterSubscription: [false],
      marketingEmails: [false]
    });

    this.userForm = this.fb.group({
      firstName: [this.userInfo?.firstName, Validators.required],
      lastName: [this.userInfo?.lastName, Validators.required]
    });
  }

  get dietaryRestrictions(): FormArray {
    return this.preferencesForm.get('dietaryRestrictions') as FormArray;
  }

  get dietaryRestrictionControls(): FormControl[] {
    return (this.preferencesForm.get('dietaryRestrictions') as FormArray).controls as FormControl[];
  }

  get allergies(): FormArray {
    return this.preferencesForm.get('allergies') as FormArray;
  }

  get billingAddress(): FormGroup {
    return this.billingForm.get('address') as FormGroup;
  }

  addAllergy(value: string) {
    if (value && value.trim()) {
      this.allergies.push(this.fb.control(value.trim()));
    }
  }

  removeAllergy(index: number) {
    this.allergies.removeAt(index);
  }

  onSaveProfile() {
    if (this.billingForm.invalid || this.preferencesForm.invalid || this.userForm.invalid) {
      this.notificationService.show('Please fill all required fields correctly.');
      return;
    }

    this.loadingService.show();

    const selectedDietary = this.dietaryOptions.filter((_, i) => this.dietaryRestrictions.at(i).value);

    const basePayload = {
      billingInfo: {
        ...this.billingForm.getRawValue(),
        address: this.billingAddress.getRawValue()
      },
      preferences: {
        ...this.preferencesForm.getRawValue(),
        dietaryRestrictions: selectedDietary,
        allergies: this.allergies.value
      },
      user: {
        firstName: this.userForm.value.firstName,
        lastName: this.userForm.value.lastName
      }
    };

    if (this.customerId) {
      this.customerApi.customerCustomerIdPut(this.customerId, basePayload).subscribe({
        next: () => {
          this.loading = false;
          this.notificationService.show('Profile saved successfully!');
          this.router.navigate(['/meals-list']);
          this.loadingService.hide();
        },
        error: () => {
          this.loading = false;
          this.notificationService.show('Failed to save profile.');
          this.loadingService.hide();
        }
      });
    } else {
      //@ts-ignore
      delete basePayload.user;
      const createPayload: CustomerCreate = {
        userId: this.userInfo?._id || '',
        ...basePayload
      };

      this.customerApi.customerPost(createPayload).subscribe({
        next: () => {
          this.loading = false;
          this.notificationService.show('Profile created successfully!');
          this.router.navigate(['/meals-list']);
          this.loadingService.hide();
        },
        error: () => {
          this.loading = false;
          this.notificationService.show('Failed to create profile.');
          this.loadingService.hide();
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/meals-list']);
  }

  private getCustomerDetail(id: string) {
    this.loadingService.show();
    this.customerApi.customerUserUserIdGet(id).subscribe({
      next: (res: any) => {
        const data = res.data;
        this.customerId = data._id;

        if (data.billingInfo) {
          this.billingForm.patchValue({
            firstName: data.billingInfo.firstName || this.userInfo?.firstName,
            lastName: data.billingInfo.lastName || this.userInfo?.lastName,
            email: data.billingInfo.email || this.userInfo?.email,
            phone: data.billingInfo.phone || '',
            company: data.billingInfo.company || '',
            taxId: data.billingInfo.taxId || '',
            address: {
              street: data.billingInfo.address?.street || '',
              city: data.billingInfo.address?.city || '',
              state: data.billingInfo.address?.state || '',
              zipCode: data.billingInfo.address?.zipCode || '',
              country: data.billingInfo.address?.country || ''
            }
          });
        }

        if (data.preferences) {
          this.dietaryOptions.forEach((option, i) => {
            this.dietaryRestrictions.at(i).setValue(
              data.preferences.dietaryRestrictions?.includes(option) || false
            );
          });

          this.preferencesForm.patchValue({
            preferredPaymentMethod: data.preferences.preferredPaymentMethod || '',
            newsletterSubscription: !!data.preferences.newsletterSubscription,
            marketingEmails: !!data.preferences.marketingEmails,
            allergies: data.preferences.allergies
          });
        }

        if (data.user) {
          this.userForm.patchValue({
            firstName: data.user.firstName || '',
            lastName: data.user.lastName || ''
          });
        }

        this.loyaltyPoints = data.loyaltyPoints ?? 0;
        this.totalOrders = data.totalOrders ?? 0;
        this.totalSpent = data.totalSpent ?? 0;

        this.loadingService.hide();
      },
      error: () => {
        this.loadingService.hide();
        this.notificationService.show('Failed to load customer details. Please try again later.');
      }
    });
  }

  private fetchAllergens() {
    this.entitiesService.entitiesAllergensGet().subscribe({
      next: (response) => {
        this.allergens = response.data || [];
      }, error: () => {
        this.notificationService.show('Failed to load allergens. Please try again later.');
      }
    })
  }
}
