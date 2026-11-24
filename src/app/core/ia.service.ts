import { Injectable } from '@angular/core';
import { GenerativeModel, GoogleAIBackend, getAI, getGenerativeModel } from 'firebase/ai';
import { MODELO_IA } from '../firebase.config';
import { fbApp } from './firebase';
import { PerfilNegocio, Red } from './models';

/**
 * RF6, RF7 y RF8: generación de ideas de publicación y de respuestas a reseñas.
 * Con Firebase configurado usa Firebase AI Logic (Gemini), de modo que la clave
 * de la API no viaja en el código de la app (RNF8). Sin Firebase usa un generador
 * de demostración que arma los textos con plantillas y los datos del negocio.
 */
@Injectable({ providedIn: 'root' })
export class IaService {
  readonly modo: 'ia' | 'demo' = fbApp ? 'ia' : 'demo';
  private modelo?: GenerativeModel;

  private obtenerModelo(): GenerativeModel {
    if (!this.modelo) {
      const ai = getAI(fbApp!, { backend: new GoogleAIBackend() });
      this.modelo = getGenerativeModel(ai, { model: MODELO_IA });
    }
    return this.modelo;
  }

  private contexto(p: PerfilNegocio): string {
    return `Negocio: ${p.nombre}. Tipo: ${p.tipo}. Ciudad: ${p.ciudad}. Descripción: ${p.descripcion || 'sin descripción'}. ` +
      `Tono de comunicación: ${p.tono.toLowerCase()}.`;
  }

  /** RF6: tres ideas de publicación para la red elegida. */
  async generarIdeas(p: PerfilNegocio, red: Red, tema: string): Promise<string[]> {
    if (this.modo === 'demo') return this.demoIdeas(p, red, tema);
    const pedido =
      `Eres redactor de redes sociales para negocios locales pequeños en Colombia. ${this.contexto(p)}\n` +
      `Escribe 3 publicaciones distintas para ${red}` + (tema.trim() ? ` sobre este tema: "${tema.trim()}".` : '.') +
      ` Cada una en español, lista para copiar, de máximo 60 palabras, con una invitación clara a visitar o escribir al negocio. ` +
      `No inventes precios, direcciones ni teléfonos. Responde solo con un arreglo JSON de 3 cadenas de texto.`;
    const texto = (await this.obtenerModelo().generateContent(pedido)).response.text();
    const ideas = this.leerArreglo(texto);
    if (ideas.length === 0) throw new Error('La IA no devolvió ideas. Intenta de nuevo.');
    return ideas.slice(0, 3);
  }

  /** RF7: borrador de respuesta a una reseña. */
  async generarRespuesta(p: PerfilNegocio, resena: string, estrellas: number): Promise<string> {
    if (this.modo === 'demo') return this.demoRespuesta(p, resena, estrellas);
    const pedido =
      `Eres el dueño de un negocio local pequeño en Colombia y respondes una reseña de un cliente. ${this.contexto(p)}\n` +
      `Reseña (${estrellas} de 5 estrellas): "${resena.trim()}"\n` +
      `Escribe una sola respuesta en español, de máximo 70 palabras, con el tono indicado. Agradece, responde a lo que dice ` +
      `el cliente y, si la reseña es negativa, ofrece disculpas y una forma de resolverlo sin discutir. ` +
      `No inventes datos. Responde solo con el texto de la respuesta.`;
    const texto = (await this.obtenerModelo().generateContent(pedido)).response.text().trim();
    if (!texto) throw new Error('La IA no devolvió una respuesta. Intenta de nuevo.');
    return texto.replace(/^"+|"+$/g, '');
  }

  private leerArreglo(texto: string): string[] {
    const inicio = texto.indexOf('[');
    const fin = texto.lastIndexOf(']');
    if (inicio >= 0 && fin > inicio) {
      try {
        const arr = JSON.parse(texto.slice(inicio, fin + 1));
        if (Array.isArray(arr)) return arr.map((x) => String(x).trim()).filter(Boolean);
      } catch { /* se intenta por líneas */ }
    }
    return texto.split(/\n{2,}/).map((t) => t.replace(/^[\s\d.\-*)]+/, '').trim()).filter((t) => t.length > 20);
  }

  // ---------- Generador de demostración (sin conexión) ----------

  private azar<T>(lista: T[]): T[] {
    return [...lista].sort(() => Math.random() - 0.5);
  }

  private demoIdeas(p: PerfilNegocio, red: Red, tema: string): string[] {
    const t = tema.trim();
    const sobre = t ? t.charAt(0).toLowerCase() + t.slice(1) : 'lo que nos hace diferentes';
    const cierre = red === 'Google Business'
      ? 'Búscanos en Google Maps y ven a visitarnos.'
      : 'Escríbenos por mensaje y te contamos más.';
    const saludo = { Cercano: '¡Hola, vecinos!', Formal: 'Estimados clientes:', Divertido: '¡Atención, atención!' }[p.tono];
    const remate = { Cercano: 'Los esperamos con gusto.', Formal: 'Será un gusto atenderlos.', Divertido: 'No digan que no les avisamos.' }[p.tono];
    const plantillas = [
      `${saludo} En ${p.nombre} queremos contarles sobre ${sobre}. ${p.descripcion ? p.descripcion + ' ' : ''}${cierre} ${remate}`,
      `¿Buscas ${p.tipo.toLowerCase()} en ${p.ciudad}? En ${p.nombre} tenemos novedades: ${sobre}. ${cierre}`,
      `Esta semana en ${p.nombre}: ${sobre}. Gracias a todos los clientes de ${p.ciudad} que nos acompañan cada día. ${remate}`,
      `${saludo} Detrás de ${p.nombre} hay un equipo que trabaja por atenderte mejor. Hoy te hablamos de ${sobre}. ${cierre}`,
      `Si todavía no conoces ${p.nombre}, este es un buen momento: ${sobre}. Estamos en ${p.ciudad}. ${cierre} ${remate}`,
      `Tu opinión nos ayuda a crecer. Cuéntanos qué te parece ${sobre} y déjanos tu reseña. ${p.nombre}, ${p.ciudad}. ${remate}`,
    ];
    return this.azar(plantillas).slice(0, 3);
  }

  private demoRespuesta(p: PerfilNegocio, resena: string, estrellas: number): string {
    const saludo = { Cercano: '¡Hola! ', Formal: 'Cordial saludo. ', Divertido: '¡Hola, hola! ' }[p.tono];
    const menciona = resena.trim().length > 12 ? ' Leímos con atención tu comentario.' : '';
    const opciones = estrellas >= 4
      ? [
          `${saludo}Muchas gracias por tu reseña y por elegir ${p.nombre}.${menciona} Nos alegra saber que tuviste una buena experiencia y esperamos verte pronto de nuevo.`,
          `${saludo}Gracias por tomarte el tiempo de calificarnos.${menciona} En ${p.nombre} trabajamos cada día para que vuelvas con gusto. ¡Te esperamos!`,
        ]
      : estrellas === 3
        ? [
            `${saludo}Gracias por tu opinión sobre ${p.nombre}.${menciona} Tomamos nota de lo que podemos mejorar y esperamos que en tu próxima visita la experiencia sea mejor.`,
            `${saludo}Agradecemos tu reseña.${menciona} Nos sirve para mejorar el servicio en ${p.nombre}. Si quieres contarnos más detalles, con gusto te escuchamos.`,
          ]
        : [
            `${saludo}Lamentamos que tu experiencia en ${p.nombre} no haya sido la esperada.${menciona} Te ofrecemos disculpas y queremos resolverlo: escríbenos para revisar tu caso personalmente.`,
            `${saludo}Gracias por decirnos lo que pasó.${menciona} En ${p.nombre} no queremos que ningún cliente se vaya inconforme. Te pedimos disculpas y te invitamos a contactarnos para darte una solución.`,
          ];
    return this.azar(opciones)[0];
  }
}
