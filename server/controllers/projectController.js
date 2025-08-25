const pool = require('../db');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Configurar OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Función para generar PDF estilizado a partir de brief en Markdown usando plantilla HTML
async function generateStyledPDF(projectName, markdownBrief, res) {
  // Importar marked dinámicamente (para evitar problemas con ESM)
  const marked = (await import('marked')).marked;

  const templatePath = path.join(__dirname, '../templates/brief_template.html');
  const htmlTemplate = fs.readFileSync(templatePath, 'utf8');

  const briefContent = marked.parse(markdownBrief); // Markdown a HTML
  const year = new Date().getFullYear();

  const finalHtml = htmlTemplate
    .replace('{{projectName}}', projectName)
    .replace('{{{briefContent}}}', briefContent)
    .replace('{{year}}', year);

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setContent(finalHtml, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '40px', bottom: '60px', left: '40px', right: '40px' },
  });

  await browser.close();

  res.setHeader('Content-Disposition', `attachment; filename="${projectName}_brief.pdf"`);
  res.setHeader('Content-Type', 'application/pdf');
  res.send(pdfBuffer);
}

// Crear nuevo proyecto y generar brief + PDF
exports.createProject = async (req, res) => {
  const data = req.body;
  const userId = data.user_id;

  try {
    // 1. Validar usuario y créditos disponibles
    const userResult = await pool.query('SELECT briefs_available FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

    const briefs = userResult.rows[0].briefs_available;
    if (briefs <= 0) return res.status(403).json({ message: 'No tienes briefs disponibles' });

    // 2. Construir prompt para generación del brief en español
    const prompt = `
      Eres estratega senior en marketing, comunicación y marca, con trayectoria en agencias de primer nivel. Has liderado reposicionamientos, campañas integradas, lanzamientos digitales y construcción de marcas premium, alineando visión de negocio, creatividad y ejecución con excelencia estratégica.

      Tu tarea es redactar un **brief estratégico completo, profesional y accionable**, basado exclusivamente en la información provista más abajo. Este documento debe ser una **herramienta real de trabajo**, útil para dirección general, estrategia, creatividad, medios, diseño y contenido. Debe conectar visión y ejecución, alinear decisiones y ser capaz de activar una campaña integral con impacto real.

      ---

      🎯 LO QUE SE ESPERA DE TI

      - **No resumes. Interpretas.**
        Transforma datos en visión estratégica: detecta oportunidades, prioriza desafíos, traduce audiencias en comportamientos, y vincula objetivos con acciones claras.

      - **Redacta con lógica, conexión y propósito.**
        El documento debe fluir naturalmente: del contexto al desafío, del consumidor al insight, del posicionamiento a la ejecución táctica. Todo debe estar conectado.

      - **No copies ni reformules literalmente.**
        Reestructura los datos con jerarquía de pensamiento. Cada sección debe mostrar intención, entendimiento del negocio y pensamiento estratégico.

      - **Evita relleno, adornos o frases genéricas.**
        Usa lenguaje profesional, preciso y útil. Redacta como lo haría un consultor senior para una marca global.

      - **Si falta información, omite esa sección con elegancia.**
        No inventes ni completes con suposiciones. El documento debe ser limpio, serio y confiable.

      - **Ponte en el lugar del consumidor.**
        Detecta tensiones, aspiraciones y motivaciones. Conecta la marca con momentos reales de decisión del usuario.

      - **Haz el brief operativamente útil.**
        Relaciona entregables con objetivos y canales. Explica el rol de cada pieza en el funnel de conversión. Agrega KPIs si es posible.

      ---

      ✒️ ESTILO ESPERADO

      - Tono ejecutivo con sensibilidad creativa  
      - Lenguaje estratégico, claro, directo y sin adornos  
      - Redacción orientada a toma de decisiones, no solo inspiración  
      - Documento usable como hoja de ruta real

      ---

      🧠 COMPONENTES CRÍTICOS QUE DEBE INCLUIR EL BRIEF

      El brief debe incluir, siempre que haya información disponible, los siguientes bloques estratégicos:

      - **Insight del consumidor**  
        Tensión emocional o verdad cultural que conecta a la audiencia con la marca. Debe justificar la narrativa de comunicación.

      - **Concepto estratégico rector**  
        Idea paraguas clara, memorable y funcional. Debe guiar storytelling, tono, estilo visual y concepto creativo.

      - **Narrativa recomendada**  
        Guía extendida sobre cómo contar la historia de marca: qué tono usar, qué palabras evitar, qué tipo de recursos visuales activar.

      - **Matriz táctica de activación**  
        Tabla que vincule:
          - Objetivo → Canal → Formato → KPI → Mensaje o enfoque
        Esto convierte el brief en una hoja de ruta para equipos creativos, de contenido y medios.

      - **Función estratégica de cada entregable**  
        Explica para qué sirve cada pieza (atraer, educar, convertir, fidelizar) y en qué etapa del funnel impacta.

      - **Qué evitar**  
        Elementos creativos, tonos, clichés o errores comunes que puedan debilitar el posicionamiento deseado.

      - **Riesgos de ejecución**  
        Alertas sobre posibles desviaciones, malos entendidos creativos o limitaciones operativas que deban vigilarse.

      ---

      🧩 ESTRUCTURA COMPLETA DEL BRIEF

      #### Resumen ejecutivo  
      Propósito, contexto, problema a resolver y visión de éxito.

      #### Objetivo principal  
      Meta estratégica central del proyecto.

      #### Objetivos secundarios  
      Metas tácticas o funcionales medibles que apoyan el objetivo principal.

      #### Contexto / situación actual  
      Diagnóstico del negocio, marca, categoría o entorno digital.

      #### Desafíos a resolver  
      Problemas críticos. ¿Qué se debe superar para lograr el objetivo?

      #### Público objetivo  
      Perfil completo: demográfico, cultural, actitudinal, digital. ¿Qué lo mueve?

      #### Necesidades del público  
      ¿Qué busca realmente del producto, la marca o la experiencia?

      #### Insight del consumidor  
      Tensión emocional o insight oculto que da base a la narrativa.

      #### Concepto estratégico rector  
      Idea guía que alinea la campaña a una promesa diferenciadora.

      #### Narrativa creativa recomendada  
      Tono, temas, tipo de lenguaje, estilo visual, enfoques sugeridos.

      #### Propuesta de valor / diferenciación  
      Qué hace única a la marca y por qué eso importa al consumidor.

      #### Mensaje principal  
      Frase que condensa la propuesta de valor y guía la comunicación.

      #### Tono y estilo de comunicación  
      Cómo debe sonar y proyectarse la marca. Qué evitar.

      #### Qué evitar  
      Tonos, ideas, clichés, estéticas o lenguajes a descartar por riesgos de percepción o incoherencia.

      #### Canales de distribución  
      Medios y plataformas sugeridas. Justificación táctica.

      #### Entregables esperados  
      Listado con función estratégica de cada pieza.

      #### Matriz táctica de activación  
      Tabla: Objetivo → Canal → Formato → KPI → Mensaje

      #### Restricciones o limitaciones  
      Presupuesto, regulaciones, límites técnicos, marco legal o editorial.

      #### Competencia directa  
      Principales rivales, qué hacen bien/mal, oportunidades de diferenciación.

      #### Referencias / inspiraciones  
      Marcas, campañas o estilos visuales relevantes como guía conceptual o estética.

      #### Recursos disponibles  
      Manual de marca, research, activos visuales, análisis previos, etc.

      #### Riesgos de ejecución  
      Errores frecuentes, omisiones o interpretaciones que deben evitarse.

      #### Hitos y fechas clave  
      Fechas de entregas, validaciones, revisiones parciales.

      #### Fecha de entrega final  

      #### Notas adicionales  
      Recomendaciones internas, criterios de validación, sugerencias de coordinación.

      ---

      🚨 REQUISITO FINAL:

      Redacta como si el brief fuera presentado ante la dirección ejecutiva de una marca premium.  
      Debe leerse como un documento profesional, estratégico y perfectamente ejecutable.  
      No debe cerrar con inspiración vacía, sino como una **hoja de ruta clara, operativa y útil para equipos creativos y de negocio**.
      Extiende y contextualiza cada sección disponible.
      Si el input contiene puntos breves o superficiales, amplíalos con contexto, conexiones estratégicas y explicación de relevancia para el proyecto. No inventes datos, pero desarrolla la lógica, las implicaciones y el uso práctico de esa información.
      Enriquece con capas de análisis.
      Explica por qué cada punto es importante para la marca y cómo debe guiar la ejecución. Incluye ejemplos o escenarios de aplicación si es relevante para un equipo creativo.
      Transforma frases sueltas en bloques accionables.
      Si el input tiene frases cortas, conviértelas en párrafos con valor estratégico, que conecten con los objetivos, el público y los canales.


      📦 INFORMACIÓN DEL PROYECTO (input del usuario):

      - Nombre del proyecto: ${data.project_name}
      - Cliente: ${data.client_name}
      - Fecha de inicio: ${data.start_date}
      - Fecha de entrega: ${data.delivery_date}
      - Sitio web / redes sociales: ${data.website}
      - Objetivo principal: ${data.main_goal}
      - Objetivos secundarios: ${data.secondary_goals}
      - Situación actual: ${data.current_situation}
      - Desafíos: ${data.challenges}
      - Público objetivo: ${data.target_audience}
      - Necesidades del público: ${data.audience_needs}
      - Insight del consumidor: ${data.consumer_insight}
      - Concepto rector: ${data.brand_concept}
      - Mensaje principal: ${data.main_message}
      - Diferenciación: ${data.differentiation}
      - Tono de comunicación: ${data.tone}
      - Qué evitar: ${data.donts}
      - Canales de distribución: ${Array.isArray(data.channels) ? data.channels.join(", ") : data.channels}
      - Formatos requeridos: ${Array.isArray(data.deliverable_formats) ? data.deliverable_formats.join(", ") : data.deliverable_formats}
      - Entregables esperados: ${data.expected_deliverables}
      - Limitaciones: ${data.limitations}
      - Competencia: ${data.competitors}
      - Referencias: ${data.reference_links}
      - Presupuesto: ${data.budget}
      - Recursos disponibles: ${data.resources}
      - Hitos clave: ${data.milestones}
      - Fecha final: ${data.deadlines}
      - Restricciones adicionales: ${data.restrictions}
      - Notas: ${data.notes}
      - Identidad visual: ${data.branding_links}
      - Formato final requerido: ${data.final_format}
      `;



    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    });

    const generatedBrief = completion.choices[0].message?.content ?? '';

    // 3. Guardar proyecto en BD dentro de transacción
    await pool.query('BEGIN');

    await pool.query(
      `INSERT INTO projects (
        user_id, client_name, project_name, start_date, delivery_date, website,
        main_goal, secondary_goals, current_situation, challenges, target_audience,
        audience_needs, main_message, differentiation, tone, channels,
        deliverable_formats, expected_deliverables, limitations, competitors, reference_links,
        budget, resources, milestones, deadlines, restrictions, notes,
        branding_links, final_format, generated_brief
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26,
        $27, $28, $29, $30
      )`,
      [
        userId,
        data.client_name, data.project_name, data.start_date, data.delivery_date, data.website,
        data.main_goal, data.secondary_goals, data.current_situation, data.challenges, data.target_audience,
        data.audience_needs, data.main_message, data.differentiation, data.tone,
        Array.isArray(data.channels) ? data.channels : [data.channels],
        Array.isArray(data.deliverable_formats) ? data.deliverable_formats : [data.deliverable_formats],
        data.expected_deliverables, data.limitations, data.competitors, data.reference_links,
        data.budget, data.resources, data.milestones, data.deadlines, data.restrictions, data.notes,
        data.branding_links, data.final_format, generatedBrief,
      ]
    );

    await pool.query('UPDATE users SET briefs_available = briefs_available - 1 WHERE id = $1', [userId]);
    await pool.query('COMMIT');

    // 4. Generar PDF estilizado y enviarlo
    await generateStyledPDF(data.project_name, generatedBrief, res);

  } catch (err) {
    console.error('Error al crear proyecto:', err);
    await pool.query('ROLLBACK');
    res.status(500).json({ error: 'Error al guardar el proyecto' });
  }
};


// Obtener todos los proyectos
exports.getAllProjects = async (_, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener todos los proyectos:', err);
    res.status(500).json({ error: 'Error al obtener proyectos' });
  }
};

// Obtener proyectos por usuario
exports.getProjectsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query('SELECT * FROM projects WHERE user_id = $1', [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener proyectos del usuario:', err);
    res.status(500).json({ error: 'Error al obtener proyectos del usuario' });
  }
};
