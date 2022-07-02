import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-compass',
  templateUrl: './compass.component.html',
  styleUrls: ['./compass.component.css']
})
export class CompassComponent implements OnInit {
  @Input() degrees: number;
  
  constructor() { }

  ngOnInit(): void {
  }

}
