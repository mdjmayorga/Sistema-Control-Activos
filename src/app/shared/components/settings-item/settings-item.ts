import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-settings-item',
  standalone: true,
  templateUrl: './settings-item.html',
  styleUrl: './settings-item.css',
})
export class SettingsItem {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly actionLabel = input('Abrir');
  readonly tone = input<'default' | 'danger'>('default');

  readonly actionTriggered = output<void>();

  triggerAction(): void {
    this.actionTriggered.emit();
  }
}
