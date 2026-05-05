/* eslint-disable */

export const getHistorialMensualTemplate = (
  mesLabel: string,
  totalPrestamos: number,
): string => {
  return `
<!-- ══ EMAIL: Historial Mensual de Préstamos - CIVCO/TEC ══ -->
<div style="margin:0;padding:32px 16px;background-color:#f0f2f5;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:0 auto;">

    <!-- HEADER -->
    <div style="background-color:#00205b;border-radius:12px 12px 0 0;padding:32px 36px 24px;border-bottom:3px solid #f5a623;">

      <!-- Logos -->
      <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
        <tr>
          <td style="width:14px;"></td>
          <td style="width:1px;background-color:#1a3a7a;"></td>
          <td style="width:14px;"></td>
          <td style="background-color:#0a2d6e;border:1px solid #1e4080;border-radius:8px;padding:8px 16px;text-align:center;">
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:700;color:#ffffff;letter-spacing:3px;">CIVCO</div>
          </td>
        </tr>
      </table>

      <!-- Report tag -->
      <div style="display:inline-block;background-color:#003d00;border:1px solid #4caf50;border-radius:5px;padding:4px 12px;margin-bottom:12px;">
        <span style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:#4caf50;letter-spacing:1.5px;text-transform:uppercase;">&nbsp;Reporte Automático Mensual</span>
      </div>

      <!-- Title -->
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:700;color:#ffffff;line-height:1.35;">
        Historial de Préstamos — <span style="color:#f5a623;">${mesLabel}</span>
      </div>

    </div>

    <!-- BODY -->
    <div style="background-color:#f7f8fc;padding:32px 36px;">

      <!-- Saludo -->
      <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;color:#1a2340;margin:0 0 10px 0;">
        Estimado administrador,
      </p>

      <!-- Resumen -->
      <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#4a5568;line-height:1.7;margin:0 0 28px 0;padding:14px 18px;background-color:#e8ecf7;border-left:4px solid #00205b;">
        Se adjunta el <strong>historial completo de préstamos</strong> correspondiente al mes de <strong>${mesLabel}</strong>.
        El archivo CSV adjunto contiene el registro de todos los préstamos realizados durante este período.
      </p>

      <!-- Estadística -->
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:#00205b;letter-spacing:2px;text-transform:uppercase;margin:0 0 10px 0;border-bottom:1px solid #d0d8ee;padding-bottom:6px;">
         &nbsp;Resumen del Mes
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:24px;">
        <tr>
          <td width="42%" style="padding:11px 14px;background-color:#eef1fb;border-right:1px solid #e8edf7;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:600;color:#4a5568;"> &nbsp;Total de préstamos</span>
          </td>
          <td style="padding:11px 14px;background-color:#ffffff;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#00205b;">${totalPrestamos}</span>
          </td>
        </tr>
      </table>

      <!-- Instrucción -->
      <p style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#718096;line-height:1.6;margin:0;">
        Puede abrir el archivo adjunto con Microsoft Excel o cualquier lector de hojas de cálculo compatibles con formato CSV (UTF-8).
      </p>

    </div>

    <!-- FOOTER -->
    <div style="background-color:#001540;border-radius:0 0 12px 12px;padding:22px 36px;border-top:2px solid #f5a623;text-align:center;">
      <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#7a8fa8;line-height:1.6;margin:0 0 8px 0;">
        Este es un mensaje automático generado por el<br>
        <strong style="color:#aac0d8;">Sistema de Control de Activos CIVCO</strong>.<br>
        Por favor no responda a este correo directamente.
      </p>
    </div>

  </div>
</div>
  `;
};

export const getDamageEmailTemplate = (
  estudiante: string,
  activo: string,
  numeroSerie: string = "N/A",
  correoInstitucional: string = "N/A",
  grupoCuadrilla: string = "N/A",
  razonPrestamo: string = "N/A",
) => {
  return `
<!-- ══ EMAIL: Notificación de Daño en Activo - CIVCO/TEC ══ -->
<div style="margin:0;padding:32px 16px;background-color:#f0f2f5;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:0 auto;">

    <!-- HEADER -->
    <div style="background-color:#00205b;border-radius:12px 12px 0 0;padding:32px 36px 24px;border-bottom:3px solid #f5a623;">

      <!-- Logos -->
      <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
        <tr>
          <td style="background-color:#0a2d6e;border:1px solid #1e4080;border-radius:8px;padding:8px 16px;text-align:center;">
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:700;color:#ffffff;letter-spacing:3px;">TEC</div>
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:9px;color:#8faad4;letter-spacing:1.5px;text-transform:uppercase;">Costa Rica</div>
          </td>
          <td style="width:14px;"></td>
          <td style="width:1px;background-color:#1a3a7a;"></td>
          <td style="width:14px;"></td>
          <td style="background-color:#0a2d6e;border:1px solid #1e4080;border-radius:8px;padding:8px 16px;text-align:center;">
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:700;color:#ffffff;letter-spacing:3px;">CIVCO</div>
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:9px;color:#8faad4;letter-spacing:1.5px;text-transform:uppercase;">Centro de Investigación</div>
          </td>
        </tr>
      </table>

      <!-- Alert tag -->
      <div style="display:inline-block;background-color:#5c3700;border:1px solid #f5a623;border-radius:5px;padding:4px 12px;margin-bottom:12px;">
        <span style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:#f5a623;letter-spacing:1.5px;text-transform:uppercase;">● &nbsp;Alerta Automática</span>
      </div>

      <!-- Title -->
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:700;color:#ffffff;line-height:1.35;">
        ⚠️ Reporte de <span style="color:#f5a623;">Daño</span> en Devolución de Activo
      </div>

    </div>

    <!-- BODY -->
    <div style="background-color:#f7f8fc;padding:32px 36px;">

      <!-- Saludo -->
      <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;color:#1a2340;margin:0 0 10px 0;">
        Estimado administrador (Prof. Juan Carlos Coto),
      </p>

      <!-- Resumen -->
      <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#4a5568;line-height:1.7;margin:0 0 28px 0;padding:14px 18px;background-color:#e8ecf7;border-left:4px solid #00205b;">
        Se le informa que se ha registrado una <strong>notificación de daño</strong> durante el proceso de devolución de un equipo topográfico. A continuación encontrará los detalles del incidente para su revisión y seguimiento.
      </p>

      <!-- ── Detalles del Activo ── -->
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:#00205b;letter-spacing:2px;text-transform:uppercase;margin:0 0 10px 0;border-bottom:1px solid #d0d8ee;padding-bottom:6px;">
         &nbsp;Detalles del Activo
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:24px;">
        <tr>
          <td width="42%" style="padding:11px 14px;background-color:#eef1fb;border-bottom:1px solid #e8edf7;border-right:1px solid #e8edf7;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:600;color:#4a5568;"> &nbsp;Nombre del Activo</span>
          </td>
          <td style="padding:11px 14px;background-color:#ffffff;border-bottom:1px solid #e8edf7;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#a0aec0;font-style:italic;">${activo}</span>
          </td>
        </tr>
        <tr>
          <td width="42%" style="padding:11px 14px;background-color:#eef1fb;border-right:1px solid #e8edf7;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:600;color:#4a5568;"> &nbsp;Número de Serie</span>
          </td>
          <td style="padding:11px 14px;background-color:#ffffff;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#a0aec0;font-style:italic;">${numeroSerie}</span>
          </td>
        </tr>
      </table>

      <!-- ── Detalles del Préstamo ── -->
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:#00205b;letter-spacing:2px;text-transform:uppercase;margin:0 0 10px 0;border-bottom:1px solid #d0d8ee;padding-bottom:6px;">
         &nbsp;Detalles del Préstamo
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:24px;">
        <tr>
          <td width="42%" style="padding:11px 14px;background-color:#eef1fb;border-bottom:1px solid #e8edf7;border-right:1px solid #e8edf7;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:600;color:#4a5568;"> &nbsp;Usuario Responsable</span>
          </td>
          <td style="padding:11px 14px;background-color:#ffffff;border-bottom:1px solid #e8edf7;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#a0aec0;font-style:italic;">${estudiante}</span>
          </td>
        </tr>
        <tr>
          <td width="42%" style="padding:11px 14px;background-color:#eef1fb;border-bottom:1px solid #e8edf7;border-right:1px solid #e8edf7;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:600;color:#4a5568;"> &nbsp;Correo Institucional</span>
          </td>
          <td style="padding:11px 14px;background-color:#ffffff;border-bottom:1px solid #e8edf7;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#a0aec0;font-style:italic;">${correoInstitucional}</span>
          </td>
        </tr>
        <tr>
          <td width="42%" style="padding:11px 14px;background-color:#eef1fb;border-bottom:1px solid #e8edf7;border-right:1px solid #e8edf7;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:600;color:#4a5568;"> &nbsp;Grupo y Cuadrilla</span>
          </td>
          <td style="padding:11px 14px;background-color:#ffffff;border-bottom:1px solid #e8edf7;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#a0aec0;font-style:italic;">${grupoCuadrilla}</span>
          </td>
        </tr>
        <tr>
          <td width="42%" style="padding:11px 14px;background-color:#eef1fb;border-right:1px solid #e8edf7;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:600;color:#4a5568;"> &nbsp;Razón del Préstamo</span>
          </td>
          <td style="padding:11px 14px;background-color:#ffffff;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#a0aec0;font-style:italic;">${razonPrestamo}</span>
          </td>
        </tr>
      </table>

    </div>

    <!-- FOOTER -->
    <div style="background-color:#001540;border-radius:0 0 12px 12px;padding:22px 36px;border-top:2px solid #f5a623;text-align:center;">
      <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#7a8fa8;line-height:1.6;margin:0 0 8px 0;">
        Este es un mensaje automático generado por el<br>
        <strong style="color:#aac0d8;">Sistema de Control de Activos CIVCO</strong>.<br>
        Por favor no responda a este correo directamente.
      </p>
    </div>

  </div>
</div>
  `;
};