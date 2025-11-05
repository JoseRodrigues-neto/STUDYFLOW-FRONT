import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Interface para os dados que o diálogo recebe
export interface ConfirmDialogData {
  title: string;
  message: string;
  secondaryMessage?: string;
  confirmText: string;
  cancelText: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent {

  // Injeta os dados (título, msg) e a referência do diálogo
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  /**
   * Fecha o diálogo sem confirmar (retorna false)
   */
  onCancel(): void {
    this.dialogRef.close(false);
  }

  /**
   * Fecha o diálogo confirmando (retorna true)
   */
  onConfirm(): void {
    this.dialogRef.close(true);
  }
}