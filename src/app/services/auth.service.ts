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
  private apiUrl = 'http://localhost:8080/usuarios';
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
          const headers = new HttpHeaders({
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
          });
          const requestBody = {
            nome: userData.name,
            email: userData.email,
            dataNascimento: userData.dataNascimento,
            perfil: userData.perfil
          };
          return this.http.post(this.apiUrl, requestBody, { headers });
        }),
        // Força a atualização do token para obter os claims customizados
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
        const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
        // Apenas devolve o Observable para o componente subscrever
        return this.http.post('http://localhost:8080/auth/google-login', idToken, { headers });
      })
    );
  }

  private registerGoogleUser(user: User): Observable<any> {
    return from(user.getIdToken()).pipe(
      switchMap(idToken => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
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

    // Cria a credencial de senha
    const credential = EmailAuthProvider.credential(user.email, password);

    // Tenta re-autenticar
    return from(reauthenticateWithCredential(user, credential)).pipe(
      // --- ESTA É A CORREÇÃO ---
      // 'reauthenticateWithCredential' retorna um UserCredential.
      // Usamos 'map' para transformar esse retorno em 'void'.
      map(() => void 0));
  }

  /**
   * Exclui a conta do usuário em AMBOS os sistemas:
   * 1. Primeiro no nosso Backend (PostgreSQL)
   * 2. Depois no Firebase Authentication
   */
  deleteUserAccount(): Observable<any> {
    const user = this.auth.currentUser;
    if (!user) {
      return throwError(() => new Error('Nenhum usuário para deletar.'));
    }
    const usuarioService = this.injector.get(UsuarioService);
    // Fluxo encadeado:
    return usuarioService.deleteSelf().pipe(
      switchMap(() => {
        // Sucesso no Backend, agora deleta do Firebase
        return from(deleteUser(user));
      }),
      catchError(err => {
        // Se a falha foi no backend, o Firebase não será chamado.
        // Se a falha foi no Firebase, o backend já foi deletado.
        console.error("Erro na exclusão da conta:", err);
        return throwError(() => err); // Repassa o erro
      })
    );
  }
}

