import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

// Função auxiliar para decodificar o JWT.
// ATENÇÃO: Esta é uma decodificação simples e não valida a assinatura do token.
// A validação da assinatura é responsabilidade do backend.
const decodeToken = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

export const authGuard: CanActivateFn = (route, state) => {
  
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.authState$.pipe(
    take(1),
    switchMap(user => {
      if (!user) {
        console.log('AuthGuard: Usuário não logado no Firebase. Redirecionando para /login');
        return of(router.createUrlTree(['/login']));
      }

      // Usuário está logado no Firebase, vamos checar o token localmente.
      return authService.getIdToken().pipe(
        map(token => {
          if (!token) {
            console.log('AuthGuard: Usuário logado mas sem token. Redirecionando para /login');
            return router.createUrlTree(['/login']);
          }

          const decodedToken = decodeToken(token);
          const roles = decodedToken?.groups;

          if (Array.isArray(roles) && (roles.includes('ALUNO') || roles.includes('PROFESSOR'))) {
            // Token contém o perfil, permite acesso.
            return true;
          }
          
          // Se já estiver na página de seleção, não faz nada.
          if (state.url === '/selecionar-perfil') {
            return true;
          }

          // Usuário logado, token existe, mas sem perfil no token.
          console.log('AuthGuard: Usuário sem perfil no token. Redirecionando para /selecionar-perfil');
          return router.createUrlTree(['/selecionar-perfil']);
        })
      );
    })
  );
};