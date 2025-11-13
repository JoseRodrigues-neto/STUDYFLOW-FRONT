import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core'; // 1. Adicione OnInit

import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';

import { MatButtonModule } from '@angular/material/button';

import { RouterLink } from '@angular/router'; // 2. Adicione RouterLink

import { MatTooltipModule } from '@angular/material/tooltip'; // 3. Adicione Tooltip



// 4. Importe o serviço e o modelo

import { UsuarioService } from '../../services/usuario.service';

import { Usuario } from '../../models/usuario.model';



@Component({

  selector: 'app-navbar',

  standalone: true,

  imports: [

    CommonModule, 

    MatIconModule,

    MatButtonModule,

    RouterLink,      // 5. Adicione

    MatTooltipModule // 5. Adicione

  ],

  templateUrl: './navbar.component.html',

  styleUrls: ['./navbar.component.css']

})

export class NavbarComponent implements OnInit { // 6. Implemente OnInit



  @Input() isCollapsed = false;

  @Output() toggleRequest = new EventEmitter<void>();



  // 7. Adicione a propriedade para o usuário

  usuario: Usuario | null = null;



  constructor(

    // 8. Injete o UsuarioService

    private usuarioService: UsuarioService

  ) {}



  ngOnInit(): void {

    // 9. Carregue os dados do usuário

    this.usuarioService.getMeuPerfil().subscribe(dados => {

      this.usuario = dados;

    });

  }



onToggleClick(): void {

 this.toggleRequest.emit();

 }



  // (NÃO adicionamos a função sair() aqui)

} 