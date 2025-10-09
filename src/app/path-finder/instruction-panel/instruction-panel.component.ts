import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-instruction-panel',
  templateUrl: './instruction-panel.component.html',
  styleUrls: ['./instruction-panel.component.css','../path-finder.component.css'],
})
export class InstructionPanelComponent {
  public instructionOpen:boolean = true;
  public isMobile:boolean = false;

  constructor(){
    this.checkViewport();
  }

  public toggleInstruction():void{
    this.instructionOpen = !this.instructionOpen;
  }

  public closeInstruction():void{
    if(this.isMobile) this.instructionOpen = false;
  }

  private checkViewport():void{
    this.isMobile = window.innerWidth <=600;
    this.instructionOpen = !this.isMobile;
  }

  @HostListener('window:resize')
  onResize(){
    this.checkViewport();
  }
}
