import { inject, Injectable, Injector } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import {
  Auth, EmailAuthProvider, GoogleAuthProvider, User, UserCredential, authState, createUserWithEmailAndPassword,
  deleteUser, reauthenticateWithCredential, sendPasswordResetEmail, signInWithEmailAndPassword,
  signInWithRedirect, getRedirectResult, signOut, 
} from '@angular/fire/auth';
import { Observable, from, of, throwError } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';
import { UsuarioService } from './usuario.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  dataNascimento: string;
  perfil: string;
}

// Interface para saber o que o Java respondeu
interface LoginGoogleResponse {
  status: 'COMPLETO' | 'SELECIONAR_PERFIL';
  token?: string;
  usuario?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private apiUrl = `${environment.apiUrl}/usuarios`;
  public readonly authState$: Observable<User | null>;

  constructor(
    private auth: Auth,
    private http: HttpClient,
    private injector: Injector,
    private router: Router
  ) {
    this.authState$ = authState(this.auth);

    // Verifica se voltámos do Google
    this.checkGoogleRedirect();
  }

  // --- LÓGICA DO REDIRECT ---
  private checkGoogleRedirect() {
    getRedirectResult(this.auth).then((result) => {
      if (result) {
        console.log('Voltou do Google. Processando no backend...');
        this.processarLoginGoogleNoBackend(result.user);
      }
    }).catch((error) => {
      console.error('Erro ao processar retorno do Google:', error);
    });
  }

  private processarLoginGoogleNoBackend(user: User) {
    user.getIdToken().then(idToken => {
        const headers = new HttpHeaders({ 
            'Content-Type': 'text/plain', // Enviamos o token como texto puro
            'ngrok-skip-browser-warning': 'true'
        });
        const googleLoginUrl = `${environment.apiUrl}/auth/google-login`;
        
        // --- AQUI ESTÁ A CORREÇÃO ---
        // Agora esperamos um JSON (LoginGoogleResponse) e não texto
        this.http.post<LoginGoogleResponse>(googleLoginUrl, idToken, { headers })
            .subscribe({
                next: (resposta) => {
                    console.log('Resposta do Backend:', resposta);
                    
                    // Lógica de Redirecionamento movida para cá
                    if (resposta && resposta.status) {
                        switch (resposta.status) {
                            case 'COMPLETO':
                                localStorage.setItem('sessionLoginTime', Date.now().toString());
                                this.router.navigate(['/app']);
                                break;
                            case 'SELECIONAR_PERFIL':
                                this.router.navigate(['/selecionar-perfil']);
                                break;
                            default:
                                console.warn('Status desconhecido:', resposta.status);
                                this.router.navigate(['/app']);
                        }
                    }
                },
                error: (err) => console.error('Erro ao notificar backend:', err)
            });
    });
  }

  // --- MÉTODOS PÚBLICOS ---

  async loginComGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    return signInWithRedirect(this.auth, provider);
  }

  // ... (Os outros métodos de login, register, logout continuam iguais ao que tinhas) ...
  
  login(email: string, password: string): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  register(userData: RegisterData): Observable<any> {
    return from(createUserWithEmailAndPassword(this.auth, userData.email, userData.password))
      .pipe(
        switchMap(userCredential => from(userCredential.user.getIdToken())),
        switchMap(idToken => {
          const headers = new HttpHeaders({
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          });
          const requestBody = {
            nome: userData.name,
            email: userData.email,
            dataNascimento: userData.dataNascimento,
            perfil: userData.perfil
          };
          return this.http.post(this.apiUrl, requestBody, { headers });
        }),
        switchMap(() => this.forceTokenRefresh()),
        catchError(error => {
          console.error("Erro na cadeia de registro:", error);
          return throwError(() => error);
        })
      );
  }

  logout() {
    return from(signOut(this.auth));
  }

  redefinirSenha(email: string): Observable<void> {
    return from(sendPasswordResetEmail(this.auth, email));
  }

  getIdToken(): Observable<string | null> {
    return this.authState$.pipe(
      switchMap(user => {
        if (user) {
          return from(user.getIdToken());
        } else {
          return of(null);
        }
      })
    );
  }

  forceTokenRefresh(): Observable<string | null> {
    const user = this.auth.currentUser;
    if (user) {
      return from(user.getIdToken(true));
    }
    return of(null);
  }

  reauthenticate(password: string): Observable<void> {
    const user = this.auth.currentUser;
    if (!user || !user.email) {
      return throwError(() => new Error('Nenhum usuário logado.'));
    }
    const credential = EmailAuthProvider.credential(user.email, password);
    return from(reauthenticateWithCredential(user, credential)).pipe(
      map(() => void 0));
  }

  deleteUserAccount(): Observable<any> {
    const user = this.auth.currentUser;
    if (!user) {
      return throwError(() => new Error('Nenhum usuário para deletar.'));
    }
    const usuarioService = this.injector.get(UsuarioService);
    return usuarioService.deleteSelf().pipe(
      switchMap(() => {
        return from(deleteUser(user));
      }),
      catchError(err => {
        console.error("Erro na exclusão da conta:", err);
        return throwError(() => err);
      })
    );
  }
}