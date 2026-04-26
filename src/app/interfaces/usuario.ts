export interface Usuario {
    IdUsuario: number;
    Email: string;
    Rol: number;
    UltimaActividad: Date;
    BloqueadoHasta?: Date | null;
}
