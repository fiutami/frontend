import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * DemoLayoutComponent
 *
 * Test page for tab-menu background from Figma node 12840-5567
 * - Yellow gradient background (CSS linear-gradient)
 * - Blue asymmetric shape overlay
 */
@Component({
  selector: 'app-demo-layout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './demo-layout.component.html',
  styleUrls: ['./demo-layout.component.scss']
})
export class DemoLayoutComponent {
  // Figma specs from node 12840-5567
  figmaSpecs = {
    frame: { width: 390, height: 844 },
    blueShape: {
      width: 393,
      height: 212,
      corners: [103, 0, 228, 15] // TL, TR, BR, BL (from Figma panel)
    },
    gradient: {
      stops: [
        { pos: 0.04, color: '#FFFFFF', opacity: 100 },
        { pos: 0.27, color: '#FFFFFF', opacity: 67 },
        { pos: 0.30, color: '#FFFFFF', opacity: 100 },
        { pos: 0.38, color: '#FCEFD1', opacity: 100 },
        { pos: 0.50, color: '#F8D78B', opacity: 100 },
        { pos: 0.77, color: '#F2B830', opacity: 100 }
      ]
    }
  };
}
