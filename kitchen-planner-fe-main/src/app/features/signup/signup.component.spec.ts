import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { SignupComponent } from './signup.component';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthenticationApi } from '../../api/api-kms-planner-masterdata';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let authApi: jasmine.SpyObj<AuthenticationApi>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const signupApiSpy = jasmine.createSpyObj('AuthenticationApi', ['authRegisterPost']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [SignupComponent],
      providers: [
        { provide: AuthenticationApi, useValue: signupApiSpy },
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    authApi = TestBed.inject(AuthenticationApi) as jasmine.SpyObj<AuthenticationApi>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call signupUser and navigate on successful signup', () => {
    const mockResponse = { success: true };
    //@ts-ignore
    authApi.authRegisterPost.and.returnValue(of(mockResponse));

    component.signup();

    expect(authApi.authRegisterPost).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});