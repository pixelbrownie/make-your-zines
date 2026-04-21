import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ZineService } from '../../services/zine';
import { ToastService } from '../../services/toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './editor.html',
  styleUrl: './editor.css'
})
export class EditorComponent implements OnInit {
  zineSlug: string | null = null;
  zineTitle: string = '';
  isDirty = false;
  isPrinting = false;
  pages = [
    { id: 'page4', label: '4', rotated: true, preview: null, file: null },
    { id: 'page3', label: '3', rotated: true, preview: null, file: null },
    { id: 'page2', label: '2', rotated: true, preview: null, file: null },
    { id: 'page1', label: '1', rotated: true, preview: null, file: null },
    { id: 'page5', label: '5', rotated: false, preview: null, file: null },
    { id: 'page6', label: '6', rotated: false, preview: null, file: null },
    { id: 'page_back', label: 'Back', rotated: false, preview: null, file: null },
    { id: 'page_cover', label: 'Cover', rotated: false, preview: null, file: null },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private zineService: ZineService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.zineSlug = params['slug'];
      if (this.zineSlug && this.zineSlug !== 'new') {
        this.loadZine();
      } else if (this.zineSlug === 'new') {
        this.zineTitle = 'Untitled Zine';
      }
    });
  }

  loadZine() {
    if (!this.zineSlug) return;
    this.zineService.getZineBySlug(this.zineSlug).subscribe({
      next: (res) => {
        this.zineTitle = res.title;
        // Map backend fields to pages array
        this.pages.forEach(p => {
          if (res[p.id]) p.preview = res[p.id];
        });
      },
      error: (err) => {
        this.toastService.show('Failed to load zine', 'error');
        this.router.navigate(['/dashboard']);
      }
    });
  }

  triggerUpload(index: number) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.pages[index].file = file as any;
        this.pages[index].preview = URL.createObjectURL(file) as any;
        this.isDirty = true;
      }
    };
    fileInput.click();
  }

  saveZine() {
    if (this.zineSlug === 'new') {
      // Logic for new zine (simplified for Phase 2)
      this.zineService.createZine({ title: this.zineTitle }).subscribe(res => {
        this.zineSlug = res.slug;
        this.performSave();
      });
    } else {
      this.performSave();
    }
  }

  performSave() {
    if (!this.zineSlug) return;
    
    // For batch save in Phase 2: we'll upload each dirty page
    // (Improved in Phase 3 with better batching, but for now we iterate)
    const uploads = this.pages.filter(p => !!p.file);
    if (uploads.length === 0) {
      this.finishSave();
      return;
    }

    let completed = 0;
    uploads.forEach(p => {
      this.zineService.updateZine(this.zineSlug!, { [p.id]: p.file }).subscribe({
        next: () => {
          completed++;
          if (completed === uploads.length) this.finishSave();
        },
        error: (err) => {
          this.toastService.show('Error saving page', 'error');
        }
      });
    });
  }

  finishSave() {
    this.isDirty = false;
    this.toastService.show('Zine saved successfully! ✨', 'success');
    if (this.zineSlug) this.router.navigate(['/editor', this.zineSlug]);
  }

  async exportPDF() {
    this.isPrinting = true;
    this.toastService.show('Preparing your PDF... 🎨', 'info');

    // Small delay to ensure UI updates (hiding placeholders if needed)
    await new Promise(resolve => setTimeout(resolve, 500));

    const gridElement = document.querySelector('.zine-grid') as HTMLElement;
    if (!gridElement) {
      this.toastService.show('Could not find grid element', 'error');
      this.isPrinting = false;
      return;
    }

    try {
      const canvas = await html2canvas(gridElement, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: '#FFF9E5'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate dimensions to fit exactly (A4 is 297x210)
      // The grid is 4x2, so aspect ratio is 2:1 roughly.
      // Padding of 10mm
      const margin = 10;
      const width = pdfWidth - (margin * 2);
      const height = (canvas.height * width) / canvas.width;

      pdf.addImage(imgData, 'PNG', margin, margin, width, height);

      // Add watermark
      pdf.setFontSize(10);
      pdf.setTextColor(243, 176, 195); // Pastel pink
      pdf.text('Made with Zine-Maker ✨', pdfWidth - 45, pdfHeight - 10);

      pdf.save(`${this.zineTitle || 'zine'}.pdf`);
      this.toastService.show('PDF downloaded! Happy printing! 🖨️', 'success');
    } catch (err) {
      console.error(err);
      this.toastService.show('Failed to generate PDF', 'error');
    } finally {
      this.isPrinting = false;
    }
  }
}
