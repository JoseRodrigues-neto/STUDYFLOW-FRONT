import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoadmapService } from '../../../services/roadmap.service';
import { Roadmap } from '../../../models/roadmap.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-roadmap-form',
  templateUrl: './roadmap-form.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  styleUrls: ['./roadmap-form.component.css']
})
export class RoadmapFormComponent implements OnInit {
  roadmapForm: FormGroup;
  roadmapId?: number;

  constructor(
    private fb: FormBuilder,
    private roadmapService: RoadmapService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.roadmapForm = this.fb.group({
      titulo: ['', Validators.required],
      descricao: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.roadmapId = this.route.snapshot.params['id'];
    if (this.roadmapId) {
      this.roadmapService.getRoadmap(this.roadmapId).subscribe(roadmap => {
        this.roadmapForm.patchValue(roadmap);
      });
    }
  }

  onSubmit(): void {
    if (this.roadmapForm.valid) {
      const roadmapData = this.roadmapForm.value;
      
      // Criamos uma rota de retorno para evitar repetição
      const returnUrl = '/app/roadmaps'; // ATUALIZADO

      if (this.roadmapId) {
        this.roadmapService.updateRoadmap(this.roadmapId, roadmapData).subscribe(() => {
          this.router.navigate([returnUrl]);
        });
      } else {
        this.roadmapService.createRoadmap(roadmapData).subscribe(() => {
          this.router.navigate([returnUrl]);
        });
      }
    }
  }
}
