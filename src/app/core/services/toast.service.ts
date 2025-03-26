import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration: number;
}
@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private toasts: BehaviorSubject<Toast[]> = new BehaviorSubject<Toast[]>([]);
  private lastId = 0;

  constructor() { }

  getToasts(): Observable<Toast[]> {
    return this.toasts.asObservable();
  }

  /**
   * Affiche une notification de succès
   * @param title Titre de la notification
   * @param message Message de la notification
   * @param duration Durée d'affichage en ms (par défaut 5000ms)
   */
  success(title: string, message: string, duration: number = 5000): void {
    this.show({
      id: ++this.lastId,
      type: 'success',
      title,
      message,
      duration
    });
  }

  /**
   * Affiche une notification d'erreur
   * @param title Titre de la notification
   * @param message Message de la notification
   * @param duration Durée d'affichage en ms (par défaut 5000ms)
   */
  error(title: string, message: string, duration: number = 5000): void {
    this.show({
      id: ++this.lastId,
      type: 'error',
      title,
      message,
      duration
    });
  }

  /**
   * Affiche une notification d'information
   * @param title Titre de la notification
   * @param message Message de la notification
   * @param duration Durée d'affichage en ms (par défaut 5000ms)
   */
  info(title: string, message: string, duration: number = 5000): void {
    this.show({
      id: ++this.lastId,
      type: 'info',
      title,
      message,
      duration
    });
  }

  /**
   * Affiche une notification d'avertissement
   * @param title Titre de la notification
   * @param message Message de la notification
   * @param duration Durée d'affichage en ms (par défaut 5000ms)
   */
  warning(title: string, message: string, duration: number = 5000): void {
    this.show({
      id: ++this.lastId,
      type: 'warning',
      title,
      message,
      duration
    });
  }

  /**
   * Affiche une notification
   * @param toast Configuration de la notification
   */
  private show(toast: Toast): void {
    // Ajouter le toast à la liste
    const currentToasts = this.toasts.value;
    this.toasts.next([...currentToasts, toast]);

    // Supprimer automatiquement après la durée spécifiée
    setTimeout(() => {
      this.remove(toast.id);
    }, toast.duration);
  }

  /**
   * Supprime une notification par son ID
   * @param id ID de la notification à supprimer
   */
  remove(id: number): void {
    const currentToasts = this.toasts.value;
    this.toasts.next(currentToasts.filter(toast => toast.id !== id));
  }

  /**
   * Supprime toutes les notifications
   */
  clearAll(): void {
    this.toasts.next([]);
  }
}
