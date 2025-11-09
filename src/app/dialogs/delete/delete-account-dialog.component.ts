import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Para o [(ngModel)]
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field'; // Para o input
import { MatInputModule } from '@angular/material/input'; // Para o input
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-delete-account-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './delete-account-dialog.component.html',
  styleUrls: ['./delete-account-dialog.component.css']
})
export class DeleteAccountDialogComponent {

  password = ''; // Armazena a senha digitada
  hidePassword = true; // Para o botão de "ver senha"

  // Injetamos o email do usuário para mostrar na tela
  constructor(
    public dialogRef: MatDialogRef<DeleteAccountDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { email: string }
  ) {}

  onCancel(): void {
    // Fecha o diálogo sem retornar nada
    this.dialogRef.close();
  }

  onConfirm(): void {
    // Fecha o diálogo e RETORNA a senha
    this.dialogRef.close(this.password);
  }
}