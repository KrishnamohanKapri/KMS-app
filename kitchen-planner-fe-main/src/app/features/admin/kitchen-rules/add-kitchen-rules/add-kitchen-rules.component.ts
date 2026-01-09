import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from "@angular/material/icon";
import { LoaderService } from '../../../../shared/loader/loader.service';
import { NotificationService } from '../../../../shared/notification.service';
import { KitchenRulesApi } from '../../../../api/api-kms-planner-masterdata';

@Component({
  selector: 'app-add-kitchen-rules',
  imports: [MatIconModule, CommonModule, FormsModule, MatDialogModule],
  templateUrl: './add-kitchen-rules.component.html',
  styleUrl: './add-kitchen-rules.component.css'
})
export class AddKitchenRulesComponent implements OnInit {
  rules: any[] = [];
  private kitchenId = ''; 
  constructor(private dialogRef: MatDialogRef<AddKitchenRulesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'add' | 'edit'; rules?: any, ruleId?: string },
  private loaderService: LoaderService,
      private notificationService: NotificationService,
    private readonly kitchenRulesApi: KitchenRulesApi) {}

  ngOnInit(): void {
    this.getKitchen();
    this.rules = this.data.rules ? this.data.rules.map((r: string) => ({ text: r, done: false, editing: false })) : [];
  }

  addStep() {
    this.rules.push({ text: 'New step', done: false, editing: false });
  }

  deleteStep(stepIndex: number) {
    this.rules.splice(stepIndex, 1);
  }

   startEditStep(step: any) {
    step.editing = true;
  }

  
  saveStep(step: any) {
    step.editing = false;
  }

  private getKitchen(){
    this.kitchenRulesApi.kitchenRulesMyKitchenGet().subscribe({
      next: (response) => {
        this.kitchenId = response.data?.kitchenId || '';
      },
      error: (err) => {
        this.notificationService.show('Failed to fetch kitchen rules. Please try again.', 'error');
        console.error('Error fetching kitchen rules:', err);
      }
    });
  }

  addKitchenRule() {
    if (this.rules.length === 0) {
      this.notificationService.show('Please add at least one rule.', 'error');
      return;
    }

    const newRule = this.rules.map(r => r.text);

    this.loaderService.show();
    this.kitchenRulesApi.kitchenRulesIdPut(this.data.ruleId!, {rules: newRule}).subscribe({
      next: () => {
        this.loaderService.hide();
        this.notificationService.show('Kitchen rule added successfully.');
        this.dialogRef.close(newRule);
      },
      error: (err) => {
        this.loaderService.hide();
        this.notificationService.show('Failed to add kitchen rule. Please try again.', 'error');
        console.error('Error adding kitchen rule:', err);
      }
    });
  }

}
