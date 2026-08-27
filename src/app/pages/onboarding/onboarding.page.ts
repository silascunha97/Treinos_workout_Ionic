import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { statsChartOutline, stopwatchOutline, barbellOutline } from 'ionicons/icons';
import { StorageService } from '../../core/native/storage.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule,/* RouterLink, */ IonContent],
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
})
export class OnboardingPage {
  private readonly storageService = inject(StorageService);
  private readonly router = inject(Router);


  @ViewChild('track') private readonly trackRef!: ElementRef<HTMLDivElement>;

  readonly currentSlide = signal<number>(0);
  readonly totalSlides = 3;


  constructor() {
    addIcons({ statsChartOutline, stopwatchOutline, barbellOutline });
  }


  async navigateTo(route: string): Promise<void> {
    // Marca o onboarding como visto para não reaparecer no próximo boot
    await this.storageService.set('has_completed_onboarding', true);
    this.router.navigateByUrl(route);
  }


  nextSlide(): void {
    const nextIndex = this.currentSlide() + 1;
    if (nextIndex < this.totalSlides) {
      this.scrollToSlide(nextIndex);
    } else {
      this.finishOnboarding();
    }
  }

  /**
   * Rola suavemente o container para o slide desejado
   */
  scrollToSlide(index: number): void {
    if (!this.trackRef) return;
    const container = this.trackRef.nativeElement;
    const slideWidth = container.clientWidth;

    container.scrollTo({
      left: slideWidth * index,
      behavior: 'smooth',
    });

    this.currentSlide.set(index);
  }

  /**
   * Atualiza o estado do Signal quando o usuário arrasta manualmente a tela
   */
  onScroll(event: Event): void {
    const container = event.target as HTMLDivElement;
    const slideWidth = container.clientWidth;
    if (slideWidth > 0) {
      const index = Math.round(container.scrollLeft / slideWidth);
      if (this.currentSlide() !== index) {
        this.currentSlide.set(index);
      }
    }
  }

  /**
   * Salva a flag no storage e redireciona para a tela de login/registro
   */
  async finishOnboarding(): Promise<void> {
    await this.storageService.set('has_completed_onboarding', true);
    this.router.navigateByUrl('/auth/login', { replaceUrl: true });
  }

  // TODO: regra de negócio (navegação entre slides, "Pular", "Continuar" / "Concluir",
  // persistir que o onboarding foi concluído, redirecionar para auth/tabs, etc.)
}
