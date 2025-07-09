import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzLayoutModule } from 'ng-zorro-antd/layout';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
                RouterOutlet, NzCarouselModule, NzGridModule,
                NzIconModule, NzCardModule, NzLayoutModule,
                CommonModule, RouterLink
              ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  constructor(){}

  ngOnInit(): void {
  }


}
