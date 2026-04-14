import React from 'react';

export default function Privacidad() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-emerald-700">Política de Privacidad - Mr.Excel365</h1>
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-4 text-sm leading-relaxed">
        <p><strong>Responsable:</strong> Econ. Xavier Rodriguez Torres</p>
        <p>En cumplimiento con la <strong>Ley Orgánica de Protección de Datos Personales de Ecuador</strong>, le informamos que sus datos (nombre y correo) serán tratados con la única finalidad de enviarle actualizaciones educativas sobre Excel y herramientas de datos.</p>
        <h2 className="text-lg font-bold mt-6">Sus Derechos</h2>
        <p>Usted tiene derecho al acceso, eliminación y rectificación de sus datos. Puede solicitarlo escribiendo a: <em>econ.xavier.rodriguez@gmail.com</em>.</p>
        <p><strong>Conservación:</strong> Los datos se conservarán mientras exista un interés mutuo para mantener el fin del tratamiento.</p>
      </div>
    </div>
  );
}