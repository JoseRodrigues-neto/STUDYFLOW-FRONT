import { Perfil } from './perfil.enum';

export interface Usuario {
  uid: string;
  id: string;
  nome: string;
  email: string;
  dataNascimento: string;  
  perfil: Perfil;
  avatarUrl?: string;
}
 
export interface UsuarioRequest {
  nome: string;
  email: string;
  dataNascimento: string;
  perfil: Perfil;
  avatarUrl?: string;
}