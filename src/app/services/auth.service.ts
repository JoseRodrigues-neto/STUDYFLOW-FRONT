import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Auth, GoogleAuthProvider, User, UserCredential, authState, createUserWithEmailAndPassword, getAdditionalUserInfo, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut } from '@angular/fire/auth';
import { Observable, from, of, throwError } from 'rxjs'; 
import { switchMap, catchError } from 'rxjs/operators';

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
    private http: HttpClient
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
    const provider = new GoogleAuthProvider(); // Cria o provedor do Google
    
    return from(signInWithPopup(this.auth, provider)).pipe(
      switchMap(userCredential => {
        const additionalInfo = getAdditionalUserInfo(userCredential);

        // Verifica se é um usuário novo
        if (additionalInfo?.isNewUser) {
          // Se for novo, precisamos cadastrá-lo no nosso backend
          const user = userCredential.user;
          console.log('Novo usuário via Google, cadastrando no backend...');

          return from(user.getIdToken()).pipe(
            switchMap(idToken => {
              const headers = new HttpHeaders({
                'Authorization': `Bearer ${idToken}`,
                'Content-Type': 'application/json'
              });
              const requestBody = {
                // Usamos os dados que o Google nos fornece
                nome: user.displayName || 'Nome não fornecido',
                email: user.email,
                dataNascimento: '1900-01-01', // Pode deixar um valor padrão ou criar uma etapa para o usuário preencher depois
                perfil: 'ALUNO'
              };
              return this.http.post(this.apiUrl, requestBody, { headers });
            })
          );
        } else {
          // Se não for novo, o login está completo. Apenas emitimos o resultado.
          console.log('Usuário existente logou com o Google.');
          return of(userCredential);
        }
      })
    );
  }
}
