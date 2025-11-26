import { inject, Injectable, Injector } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import {
  Auth, EmailAuthProvider, GoogleAuthProvider, User, UserCredential, authState, createUserWithEmailAndPassword,
  deleteUser,
  getAdditionalUserInfo, reauthenticateWithCredential, sendPasswordResetEmail, signInWithEmailAndPassword,
  signInWithPopup, signOut,
} from '@angular/fire/auth';
import { Observable, from, of, throwError } from 'rxjs';
import { switchMap, catchError, map, tap } from 'rxjs/operators';
import { UsuarioService } from './usuario.service';
import { Router } from '@angular/router';
// 1. IMPORTANTE: Importar o environment
import { environment } from '../../environments/environment';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  dataNascimento: string;
  perfil: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  // 2. MUDANÇA: Usa a variável do environment + o caminho do recurso
  private apiUrl = `${environment.apiUrl}/usuarios`;
  
  public readonly authState$: Observable<User | null>;

  constructor(
    private auth: Auth,
    private http: HttpClient,
    private injector: Injector,
    private router: Router
  ) {
    this.authState$ = authState(this.auth);
  }

  login(email: string, password: string): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  register(userData: RegisterData): Observable<any> {
    return from(createUserWithEmailAndPassword(this.auth, userData.email, userData.password))
      .pipe(
        switchMap(userCredential => from(userCredential.user.getIdToken())),
        switchMap(idToken => {
          // 3. MUDANÇA: Adicionado o header do Ngrok aqui
          const headers = new HttpHeaders({
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true' // <--- O "Passe Livre"
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

  loginComGoogle(): Observable<any> {
    return from(signInWithPopup(this.auth, new GoogleAuthProvider())).pipe(
      switchMap(userCredential => {
        return from(userCredential.user.getIdToken());
      }),
      switchMap(idToken => {
        // 4. MUDANÇA: Adicionado o header do Ngrok aqui
        const headers = new HttpHeaders({ 
            'Content-Type': 'text/plain',
            'ngrok-skip-browser-warning': 'true' // <--- O "Passe Livre"
        });
        
        // 5. MUDANÇA: URL dinâmica com environment
        const googleLoginUrl = `${environment.apiUrl}/auth/google-login`;

        return this.http.post(googleLoginUrl, idToken, { headers, responseType: 'text' as 'json' });
      })
    );
  }

  // Método privado (se for usado internamente)
  private registerGoogleUser(user: User): Observable<any> {
    return from(user.getIdToken()).pipe(
      switchMap(idToken => {
        // 6. MUDANÇA: Adicionado o header do Ngrok aqui também
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true' // <--- O "Passe Livre"
        });
        const requestBody = {
          nome: user.displayName || 'Nome não fornecido',
          email: user.email,
        };
        return this.http.post(this.apiUrl, requestBody, { headers });
      })
    );
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