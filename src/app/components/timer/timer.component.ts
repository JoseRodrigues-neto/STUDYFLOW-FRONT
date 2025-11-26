import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.css']
})
export class TimerComponent implements OnInit, OnDestroy {

    
  // Configurações de tempo (em segundos)
  readonly FOCUS_TIME = 25 * 60;
  readonly SHORT_BREAK = 5 * 60;
  readonly LONG_BREAK = 15 * 60;

  // Estado
  timeLeft: number = this.FOCUS_TIME;
  totalTime: number = this.FOCUS_TIME;
  timerInterval: any = null;
  isRunning = false;
  currentMode: 'focus' | 'short' | 'long' = 'focus';

  // Para o círculo SVG (Circunferência = 2 * PI * r)
  // r = 45, então C = 2 * 3.14159 * 45 ≈ 283
  readonly CIRCUMFERENCE = 565;
  strokeDashoffset = 0;

  ngOnInit(): void {
    this.updateCircle();
  }

  ngOnDestroy(): void {
    this.pauseTimer();
  }

  // --- Lógica do Timer ---

  toggleTimer(): void {
    if (this.isRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer(): void {
    if (this.timerInterval) return;

    this.isRunning = true;
    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.updateCircle();
      } else {
        this.completeTimer();
      }
    }, 1000);
  }

  pauseTimer(): void {
    this.isRunning = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  resetTimer(): void {
    this.pauseTimer();
    // Reseta para o tempo total do modo atual
    this.timeLeft = this.totalTime;
    this.updateCircle();
  }

  setMode(mode: 'focus' | 'short' | 'long'): void {
    this.pauseTimer();
    this.currentMode = mode;

    switch (mode) {
      case 'focus':
        this.totalTime = this.FOCUS_TIME;
        break;
      case 'short':
        this.totalTime = this.SHORT_BREAK;
        break;
      case 'long':
        this.totalTime = this.LONG_BREAK;
        break;
    }

    this.timeLeft = this.totalTime;
    this.updateCircle();
  }

  private completeTimer(): void {
    this.pauseTimer();
    // Aqui você poderia tocar um som ou mostrar uma notificação
    console.log("Timer finalizado!");
  }

  // --- Lógica Visual ---

  updateCircle(): void {
    // Calcula quanto do círculo deve estar "apagado"
    const progress = this.timeLeft / this.totalTime;
    const offset = this.CIRCUMFERENCE - (progress * this.CIRCUMFERENCE);
    this.strokeDashoffset = offset;
  }

  get formatTime(): string {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  get modeLabel(): string {
    switch (this.currentMode) {
      case 'focus': return 'Foco';
      case 'short': return 'Pausa Curta';
      case 'long': return 'Pausa Longa';
      default: return '';
    }
  }
  
  // Retorna a cor baseada no modo
  get modeColorClass(): string {
    return `mode-${this.currentMode}`;
  }
}