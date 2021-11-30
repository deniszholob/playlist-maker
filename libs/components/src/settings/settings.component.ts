import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  AppStore,
  AppStoreService,
  EncodingOptions,
  EncodingOptionsLabels,
  Settings,
} from '@plm/util';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'plm-settings',
  templateUrl: './settings.component.html',
  // styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, OnDestroy {
  public EncodingOptionsLabels = EncodingOptionsLabels;
  public encoding: EncodingOptions[] = Object.values(EncodingOptions);
  @Output()
  public closeSettings = new EventEmitter();

  public appSettings$: Observable<AppStore> = this.appStoreService.getStore();
  public settings: Settings;
  public isElectron = false;

  // Clear subscriptions when component is destroyed to prevent leaks
  private clearSubscriptions = new Subject();

  constructor(private appStoreService: AppStoreService) {}

  ngOnInit() {
    this.appStoreService
      .getStore()
      .pipe(takeUntil(this.clearSubscriptions))
      .subscribe((app) => {
        this.settings = app.settings;
        this.isElectron = app.isElectron;
      });
  }

  ngOnDestroy(): void {
    this.clearSubscriptions.next();
    this.clearSubscriptions.complete();
  }

  public updatePaths(relativePaths: boolean) {
    this.appStoreService.setSettings({ relativePaths });
  }

  public updateEncoding(encoding: EncodingOptions) {
    this.appStoreService.setSettings({ encoding });
  }

  public onCloseSettings() {
    this.closeSettings.emit();
  }
}
