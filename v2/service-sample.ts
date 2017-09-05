import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from "@angular/http";
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/map';

// exrtend <window>
declare global {
  interface Window {
    SYSTEM_CONFIG: any;
  }
}
// creating config
window.SYSTEM_CONFIG = {
  callbacks: [],
  enqueue: function(id: number, callback: Function): void {
    this.callbacks[id] = callback;
  },
  init: function(config: any): void {

    this.URLS = {};

    // properties
    for (let key in config) {
      key.match(/^(get|set)/gim) ? this.URLS[key] = config[key] : this[key] = config[key];
    }

    // callbacks
    for (var i = this.callbacks.length - 1; i >= 0; i--) {
      if (this.callbacks[i]) {
        this.callbacks[i]();
      }
    }
  }
};


@Injectable()

export class SystemService {

  constructor(private http: Http){
    console.log('initialized :: SystemService')

    this.getConfig().subscribe((response: any) => {
      console.log('[info] SystemService :: config loaded')

      window.SYSTEM_CONFIG.init(response[0]);

    });
  }

  getConfig() {
    return this.http.get('system.json').map(res => res.json());
  }
}