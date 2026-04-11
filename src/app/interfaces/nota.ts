export interface Nota {
idnota: number;
fecha: string;
Competencia: string;
nota: number;
comentarios: string;
idmaestro: number;
maestroemail: string;
}

export interface NotaConNino extends Nota {
  IdNino: number;
  NinoNombre: string;
  NinoApellido: string;
}