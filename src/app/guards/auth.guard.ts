import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  
  // 1. "Injete" os serviços que precisamos
  const authService = inject(AuthService);
  const router = inject(Router);

  // 2. Verifique o estado de autenticação
  return authService.authState$.pipe(
    take(1), // Pega apenas o primeiro valor (o estado atual)
    map(user => {
      
      // 3. O usuário ESTÁ logado
      if (user) {
        return true; // Permite o acesso à rota
      }
      
      // 4. O usuário NÃO está logado
      console.log('AuthGuard: Acesso negado. Redirecionando para /login');
      // Redireciona para a página de login
      return router.createUrlTree(['/login']); 
    })
  );
};